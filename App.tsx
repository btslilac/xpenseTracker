import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import * as WebBrowser from 'expo-web-browser'
import * as ImagePicker from 'expo-image-picker'
import * as Notifications from 'expo-notifications'
import { checkAndPushLoanNotifications, initLoanNotifications } from './src/lib/loanNotifications'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Linking, Platform, StyleSheet, View, Animated, BackHandler, useColorScheme, Vibration, Modal, Text, TouchableOpacity } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { hapticSelection, hapticLight, hapticMedium, hapticSuccess, hapticError } from './src/lib/haptics'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { AppProvider, useApp } from './src/context/AppContext'
import { getNativeGoogleSignin } from './src/native/googleAuth'
import { fetchNativeDynamicPalette, type DynamicColorPayload } from './src/native/dynamicColor'
import { resolveAppearance } from './src/lib/appearance'
import { generateThemeCss, getThemeBridgeVariables } from './src/bridge/themeTokens'
import { formatCurrency, getAccountSummary } from './src/lib/finance'
import { allocateWaterfallPayment, calculateAgreementBalances, isCasualAgreement } from './src/lib/lendingFinance'
import { smsDetectionService, type OsPermissionsSnapshot } from './src/lib/sms/smsDetectionService'
import type { PendingSmsDetection } from './src/lib/sms/smsParser.types'

WebBrowser.maybeCompleteAuthSession()
import {
  getSetupMessage,
  getGoogleNativeWebClientId,
  isGoogleAuthConfigured,
} from './src/lib/supabase'
import { APP_VERSION } from './src/lib/appVersion'
import { checkForAppUpdate } from './src/lib/updateChecker'
import type { AppReleaseMetadata } from './src/types'
import {
  addPendingExpenseListener,
  getPendingSmsEvents,
  isSmsExpenseCaptureAvailable,
  removePendingSmsEvents,
  scanRecentInboxSmsEvents,
  syncSmsExpenseCaptureConfiguration,
} from './src/native/smsExpenseCapture'
import { buildStitchHtml, type StitchRoute } from './src/stitchBridge'

const mainRoutes: StitchRoute[] = [
  'dashboard',
  'transactions',
  'analytics',
  'addExpense',
  'profile',
  'lendingDashboard',
  'lendingAgreements',
  'lendingAnalytics',
]
const bottomNavRoutes: StitchRoute[] = ['dashboard', 'analytics', 'addExpense', 'transactions', 'profile']
const authPlatform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'web' ? 'web' : 'android'

const INJECTED_SWIPE_SCRIPT = `
  (function() {
    let touchstartX = 0;
    let touchstartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchstartX = e.changedTouches[0].screenX;
      touchstartY = e.changedTouches[0].screenY;
    }, {passive: true});
    document.addEventListener('touchend', function(e) {
      let touchendX = e.changedTouches[0].screenX;
      let touchendY = e.changedTouches[0].screenY;
      let diffX = touchendX - touchstartX;
      let diffY = touchendY - touchstartY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
        if (diffX > 0) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'swipe.right' }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'swipe.left' }));
        }
      }
    }, {passive: true});
  })();
  true;
`;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootApp />
      </AppProvider>
    </SafeAreaProvider>
  )
}

function RootApp() {
  const {
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addTransaction,
    deleteTransaction,
    currentAccount,
    isAuthenticated,
    isReady,
    signInWithGoogleIdToken,
    signInWithGoogleOAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateSettings,
    deleteAccount,
    loanAgreements,
    loanPayments,
    lendingProfile,
    addLoanAgreement,
    updateLoanAgreement,
    archiveLoanAgreement,
    addLoanPayment,
    reverseLoanPayment,
    updateLendingProfile,
    setLendingEnabled,
    setAppearance,
    resetAppearance,
    retrySync,
    localAppearance,
    syncStatus,
  } = useApp()

  const [authRoute, setAuthRoute] = useState<'signin' | 'signup'>('signin')
  const [routeStack, setRouteStack] = useState<StitchRoute[]>(['dashboard'])
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({})
  const navDirectionRef = useRef<'tab' | 'forward' | 'back'>('tab')
  const preferredWorkspaceRef = useRef<'expenses' | 'lending'>('expenses')
  const isSyncingCapturedExpenses = useRef(false)
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()

  // Animation & Delayed Skeleton states
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [displayHtml, setDisplayHtml] = useState('')
  const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(false)
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [statusBarOverride, setStatusBarOverride] = useState<'light' | 'dark' | null>(null)

  // OS Permissions Diagnostics (silent check) + SMS Classification Queue + Budget Overrun
  const [osPermissions, setOsPermissions] = useState<OsPermissionsSnapshot>({
    notificationsGranted: false,
    smsGranted: false,
    notificationListenerGranted: false,
    overlayGranted: false,
    platform: authPlatform,
  })
  const [activeSmsDetection, setActiveSmsDetection] = useState<{
    detection: PendingSmsDetection
    queueCount: number
  } | null>(null)
  const presentedSmsKeyRef = useRef<string | null>(null)
  const pendingSmsCreateLinkRef = useRef<string | null>(null)
  const [budgetOverrunPrompt, setBudgetOverrunPrompt] = useState<{
    amount: number
    monthlyBudget: number
    currentExpenses: number
  } | null>(null)

  // Webview ref for programmatic injections (modals, theme live-apply, etc.)
  const webViewRef = useRef<any>(null)
  const isWebViewLoadedRef = useRef(false)
  const [webLoadTick, setWebLoadTick] = useState(0)
  const latestReleaseRef = useRef<AppReleaseMetadata | null>(null)
  const webModalOpenRef = useRef(false)
  const queuedWebScriptRef = useRef<string | null>(null)
  const pendingConfirmMapRef = useRef<Record<string, () => void>>({})

  // Biometric App Lock & Native Fallback Feedback State (used only when WebView is unavailable)
  const [isAppLocked, setIsAppLocked] = useState(false)
  const isAuthenticatingRef = useRef(false)
  const [nativeFallbackModal, setNativeFallbackModal] = useState<{
    variant: 'success' | 'error' | 'warning' | 'info' | 'offline'
    title: string
    message: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm?: () => void
  } | null>(null)

  const showAppToast = useCallback((
    message: string,
    variant: 'success' | 'error' | 'warning' | 'info' | 'offline' = 'info',
    queueForNextLoad = false
  ) => {
    const script = `if (window.__stitchToast) { window.__stitchToast(${JSON.stringify({ message, variant })}); }`
    if (queueForNextLoad || !displayHtml || !webViewRef.current) {
      queuedWebScriptRef.current = script
    } else {
      webViewRef.current.injectJavaScript(`${script} true;`)
    }
  }, [displayHtml])

  const showAppFeedback = useCallback((opts: {
    variant?: 'success' | 'error' | 'warning' | 'info' | 'offline'
    title: string
    message: string
    primaryLabel?: string
    queueForNextLoad?: boolean
  }) => {
    const payload = {
      variant: opts.variant || 'info',
      title: opts.title,
      message: opts.message,
      primaryLabel: opts.primaryLabel || 'OK',
    }
    if (displayHtml && webViewRef.current) {
      const script = `if (window.__stitchFeedback) { window.__stitchFeedback(${JSON.stringify(payload)}); }`
      if (opts.queueForNextLoad) {
        queuedWebScriptRef.current = script
      } else {
        webViewRef.current.injectJavaScript(`${script} true;`)
      }
    } else {
      setNativeFallbackModal({
        variant: payload.variant,
        title: payload.title,
        message: payload.message,
        confirmLabel: payload.primaryLabel,
      })
    }
  }, [displayHtml])

  const showAppConfirm = useCallback((opts: {
    variant?: 'danger' | 'warning' | 'info'
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
  }) => {
    if (displayHtml && webViewRef.current) {
      const actionId = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      pendingConfirmMapRef.current[actionId] = opts.onConfirm
      const payload = {
        variant: opts.variant || 'info',
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel || 'Confirm',
        cancelLabel: opts.cancelLabel || 'Cancel',
        actionId,
      }
      webViewRef.current.injectJavaScript(`if (window.__stitchConfirm) { window.__stitchConfirm(${JSON.stringify(payload)}); } true;`)
    } else {
      setNativeFallbackModal({
        variant: opts.variant === 'danger' ? 'error' : (opts.variant || 'info'),
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel || 'Confirm',
        cancelLabel: opts.cancelLabel || 'Cancel',
        onConfirm: opts.onConfirm,
      })
    }
  }, [displayHtml])

  const authenticateWithBiometrics = useCallback(async () => {
    if (isAuthenticatingRef.current) return
    isAuthenticatingRef.current = true
    try {
      void hapticLight()
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (!hasHardware || !isEnrolled) {
        setIsAppLocked(false)
        return
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock XpenseTracker',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      })
      if (result.success) {
        void hapticSuccess()
        setIsAppLocked(false)
      } else {
        void hapticError()
      }
    } catch (err) {
      console.warn('Biometric authentication error:', err)
      void hapticError()
    } finally {
      isAuthenticatingRef.current = false
    }
  }, [])

  // Check initial app lock state from AsyncStorage / user settings
  useEffect(() => {
    let mounted = true
    const checkInitialLock = async () => {
      try {
        const stored = await AsyncStorage.getItem('@xpensetracker_biometric_lock')
        const hasHardware = await LocalAuthentication.hasHardwareAsync()
        const isEnrolled = await LocalAuthentication.isEnrolledAsync()
        if (mounted && stored === 'true' && hasHardware && isEnrolled) {
          setIsAppLocked(true)
          void authenticateWithBiometrics()
        }
      } catch (e) {
        console.warn('Initial lock check failed:', e)
      }
    }
    void checkInitialLock()
    return () => {
      mounted = false
    }
  }, [authenticateWithBiometrics])

  // Sync biometric lock setting to AsyncStorage
  useEffect(() => {
    if (currentAccount?.settings?.biometricLock !== undefined) {
      void AsyncStorage.setItem(
        '@xpensetracker_biometric_lock',
        currentAccount.settings.biometricLock ? 'true' : 'false'
      )
    }
  }, [currentAccount?.settings?.biometricLock])

  // AppState listener for background / foreground resume + dynamic Monet refresh
  const [dynamicPayload, setDynamicPayload] = useState<DynamicColorPayload | null>(null)

  const refreshDynamicPalette = useCallback(async () => {
    try {
      const payload = await fetchNativeDynamicPalette()
      setDynamicPayload(payload)
    } catch {
      // keep existing payload
    }
  }, [])

  useEffect(() => {
    void refreshDynamicPalette()
  }, [refreshDynamicPalette])

  const refreshOsPermissionsSilently = useCallback(async () => {
    const snap = await smsDetectionService.checkPermissionsStatus()
    setOsPermissions(snap)
    return snap
  }, [])

  const presentNextSmsDetection = useCallback(async (uid: string) => {
    const { detection, totalPending } = await smsDetectionService.getNextPendingDetection(uid)
    setActiveSmsDetection(detection ? { detection, queueCount: totalPending } : null)
  }, [])

  const syncNativeSmsQueue = useCallback(async () => {
    if (!currentAccount || !currentAccount.settings?.smsTransactionDetection || isSyncingCapturedExpenses.current) {
      return
    }
    isSyncingCapturedExpenses.current = true
    try {
      const [pendingEvents, inboxEvents] = await Promise.all([
        getPendingSmsEvents(),
        scanRecentInboxSmsEvents(),
      ])
      const allEvents = [...pendingEvents, ...inboxEvents]
      if (allEvents.length > 0) {
        await smsDetectionService.ingestNativeCapturedSms(currentAccount.id, allEvents)
        if (pendingEvents.length > 0) {
          await removePendingSmsEvents(pendingEvents.map((e) => e.id))
        }
      }
      await presentNextSmsDetection(currentAccount.id)
    } catch {
      // Do not log raw SMS details
    } finally {
      isSyncingCapturedExpenses.current = false
    }
  }, [currentAccount, presentNextSmsDetection])

  useEffect(() => {
    smsDetectionService.setLedgerContext(currentAccount?.transactions || [], loanPayments || [])
  }, [currentAccount?.transactions, loanPayments])

  useEffect(() => {
    void refreshOsPermissionsSilently()
  }, [refreshOsPermissionsSilently])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void refreshDynamicPalette()
        void refreshOsPermissionsSilently()
        void syncNativeSmsQueue()
      }
      const bioEnabled = currentAccount?.settings?.biometricLock
      if (bioEnabled && isAuthenticated) {
        if (nextAppState.match(/inactive|background/)) {
          setIsAppLocked(true)
        } else if (nextAppState === 'active') {
          setIsAppLocked(true)
          void authenticateWithBiometrics()
        }
      }
    })
    return () => {
      subscription.remove()
    }
  }, [currentAccount?.settings?.biometricLock, isAuthenticated, authenticateWithBiometrics, refreshDynamicPalette, refreshOsPermissionsSilently, syncNativeSmsQueue])

  // Initialize opt-in SMS detection listener & restore any queued local detections
  useEffect(() => {
    if (isAuthenticated && currentAccount?.settings?.smsTransactionDetection) {
      smsDetectionService.start(currentAccount.id, (pending, totalPending) => {
        if (pending) {
          setActiveSmsDetection({ detection: pending, queueCount: totalPending })
        }
      })
      void syncNativeSmsQueue()
      void presentNextSmsDetection(currentAccount.id)
    } else {
      smsDetectionService.stop()
      setActiveSmsDetection(null)
    }
    return () => {
      smsDetectionService.stop()
    }
  }, [isAuthenticated, currentAccount?.id, currentAccount?.settings?.smsTransactionDetection, syncNativeSmsQueue, presentNextSmsDetection])

  const navigate = useCallback((route: StitchRoute, params?: Record<string, string>) => {
    navDirectionRef.current = mainRoutes.includes(route) ? 'tab' : 'forward'
    if (route === 'notifications') {
      void refreshOsPermissionsSilently()
    }
    setRouteStack((current) => {
      const active = current[current.length - 1]
      if (mainRoutes.includes(route)) {
        setCurrentParams(params || {})
        return [route]
      }
      if (active === route && JSON.stringify(params) === JSON.stringify(currentParams)) {
        return current
      }
      setCurrentParams(params || {})
      return [...current, route]
    })
  }, [currentParams, refreshOsPermissionsSilently])

  const goBack = useCallback(() => {
    navDirectionRef.current = 'back'
    pendingSmsCreateLinkRef.current = null
    setRouteStack((current) => (current.length > 1 ? current.slice(0, -1) : ['dashboard']))
  }, [])

  // Automatically check and push notifications for overdue loans and loans due this week
  useEffect(() => {
    if (!isReady || !currentAccount || loanAgreements.length === 0) {
      return
    }

    if (currentAccount.settings.notifications?.loanReminders === false) {
      return
    }

    void checkAndPushLoanNotifications(
      loanAgreements,
      loanPayments,
      currentAccount.settings.currency || 'KES'
    )
  }, [isReady, currentAccount, loanAgreements, loanPayments])

  // Handle mobile notification tap interactions
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      if (data && typeof data === 'object' && 'route' in data) {
        const route = String(data.route) as StitchRoute
        const params: Record<string, string> = {}
        if (data.id) params.id = String(data.id)
        if (data.filter) params.filter = String(data.filter)
        navigate(route, params)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [navigate])

  useEffect(() => {
    const backAction = () => {
      if (webModalOpenRef.current && webViewRef.current) {
        webViewRef.current.injectJavaScript('window.__stitchCloseTopModal && window.__stitchCloseTopModal(); true;')
        return true
      }

      if (!isAuthenticated) return false

      setRouteStack((current) => {
        if (current.length > 1) {
          // Pop route
          return current.slice(0, -1)
        }
        if (current[0] !== 'dashboard') {
          // Go home if on a root tab that isn't home
          return ['dashboard']
        }
        // Let it quit on dashboard
        BackHandler.exitApp()
        return current
      })
      return true
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setRouteStack(['dashboard'])
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authPlatform !== 'android') {
      return
    }

    try {
      const nativeAuth = getNativeGoogleSignin()
      if (nativeAuth?.GoogleSignin) {
        nativeAuth.GoogleSignin.configure({
          webClientId: getGoogleNativeWebClientId(),
        })
      }
    } catch (e) {
      console.warn('GoogleSignin.configure skipped (likely running in Expo Go):', e)
    }
  }, [])

  useEffect(() => {
    if (authPlatform !== 'android' || !isSmsExpenseCaptureAvailable()) {
      return
    }

    void syncSmsExpenseCaptureConfiguration(currentAccount ?? null)
    if (currentAccount?.settings?.smsTransactionDetection) {
      void syncNativeSmsQueue()
    }
  }, [currentAccount, syncNativeSmsQueue])

  useEffect(() => {
    if (!isSmsExpenseCaptureAvailable()) {
      return
    }
    return addPendingExpenseListener(() => {
      void syncNativeSmsQueue()
    })
  }, [syncNativeSmsQueue])

  const currentRoute = isAuthenticated ? routeStack[routeStack.length - 1] : authRoute
  const webViewKey = useMemo(
    () => `main-view-${isAuthenticated ? currentAccount?.id ?? 'user' : 'guest'}`,
    [currentAccount?.id, isAuthenticated],
  )

  useEffect(() => {
    // Reset any route-specific or scroll-induced status bar overrides when navigating
    setStatusBarOverride(null)
  }, [currentRoute])

  const userAppearance = currentAccount?.settings.appearance ?? localAppearance
  const systemColorScheme = useColorScheme()
  const resolvedAppearance = useMemo(
    () => resolveAppearance(userAppearance, systemColorScheme, dynamicPayload),
    [userAppearance, systemColorScheme, dynamicPayload],
  )
  const themeVars = useMemo(() => getThemeBridgeVariables(resolvedAppearance), [resolvedAppearance])
  const themeCss = useMemo(() => generateThemeCss(resolvedAppearance), [resolvedAppearance])

  const effectiveColorScheme = resolvedAppearance.resolvedColorScheme
  const visualStyle = resolvedAppearance.style

  // Status Bar visibility logic:
  // - Dark mode uses 'light' (white) icons.
  // - On Dashboard at top: Hero banner is dark photo background, requiring 'light' (white) icons.
  // - Scrolled down on Dashboard in light mode: overridden dynamically to 'dark' (black) icons.
  // - All other screens in light mode: default to 'dark' (black) icons over light header surfaces.
  const activeStatusBarStyle: 'light' | 'dark' = (
    statusBarOverride ??
    (effectiveColorScheme === 'dark'
      ? 'light'
      : currentRoute === 'dashboard'
        ? 'light'
        : 'dark')
  )

  // Stable key excluding live appearance changes so toggling styles/palettes updates WebView in-place without reload
  const coreAccountKey = useMemo(() => {
    if (!currentAccount) return 'guest'
    const { appearance: _ignored, ...restSettings } = currentAccount.settings
    return JSON.stringify({
      id: currentAccount.id,
      settings: restSettings,
      categories: currentAccount.categories,
      transactions: currentAccount.transactions,
    })
  }, [currentAccount])

  const currentAccountRef = useRef(currentAccount)
  currentAccountRef.current = currentAccount
  const resolvedAppearanceRef = useRef(resolvedAppearance)
  resolvedAppearanceRef.current = resolvedAppearance
  const dynamicPayloadRef = useRef(dynamicPayload)
  dynamicPayloadRef.current = dynamicPayload
  const syncStatusRef = useRef(syncStatus)
  syncStatusRef.current = syncStatus

  const currentThemeSignature = `${resolvedAppearance.style}|${resolvedAppearance.resolvedColorScheme}|${resolvedAppearance.pureBlackActive}|${resolvedAppearance.colorTheme}|${resolvedAppearance.reducedMotion}|${JSON.stringify(dynamicPayload?.colors ?? null)}`
  const htmlThemeSignatureRef = useRef<string>(currentThemeSignature)

  const html = useMemo(() => {
    const ra = resolvedAppearanceRef.current
    const dp = dynamicPayloadRef.current
    htmlThemeSignatureRef.current = `${ra.style}|${ra.resolvedColorScheme}|${ra.pureBlackActive}|${ra.colorTheme}|${ra.reducedMotion}|${JSON.stringify(dp?.colors ?? null)}`
    return buildStitchHtml(
      currentRoute,
      currentAccountRef.current ?? undefined,
      {
        ...currentParams,
        workspace: currentParams.workspace || preferredWorkspaceRef.current,
        _navDirection: navDirectionRef.current,
        _notifGranted: String(osPermissions.notificationsGranted),
        _smsGranted: String(osPermissions.smsGranted),
        _listenerGranted: String(osPermissions.notificationListenerGranted),
        _platform: osPermissions.platform,
        _safeAreaTop: String(insets.top),
        _safeAreaBottom: String(insets.bottom),
        _colorScheme: ra.resolvedColorScheme,
        _colorSchemePref: ra.colorScheme,
        _systemColorScheme: systemColorScheme === 'dark' ? 'dark' : 'light',
        _visualStyle: ra.style,
        _pureBlack: String(ra.pureBlackPreference),
        _colorTheme: ra.colorTheme,
        _reducedMotion: String(ra.reducedMotion),
        _dynamicPaletteJson: dp ? JSON.stringify(dp) : '',
        _syncMetaJson: JSON.stringify(syncStatusRef.current),
        _latestReleaseJson: latestReleaseRef.current ? JSON.stringify(latestReleaseRef.current) : '',
      },
      {
        agreements: loanAgreements,
        payments: loanPayments,
        profile: lendingProfile,
      },
    )
  }, [
    coreAccountKey,
    currentRoute,
    currentParams,
    osPermissions,
    insets.top,
    insets.bottom,
    loanAgreements,
    loanPayments,
    lendingProfile,
  ])

  useEffect(() => {
    if (!displayHtml) {
      setDisplayHtml(html)
      return
    }
    if (displayHtml !== html) {
      if (resolvedAppearance.reducedMotion) {
        setDisplayHtml(html)
        fadeAnim.setValue(1)
        return
      }
      Animated.timing(fadeAnim, {
        toValue: 0.92,
        duration: 45,
        useNativeDriver: true,
      }).start(() => {
        setDisplayHtml(html)
      })
    }
  }, [html, resolvedAppearance.reducedMotion])

  // Present active SMS detection via centralized WebView modal ONLY after WebView finished loading
  useEffect(() => {
    if (
      !activeSmsDetection ||
      !isAuthenticated ||
      isAppLocked ||
      !displayHtml ||
      !isWebViewLoadedRef.current ||
      !currentAccount ||
      currentRoute === 'createAgreement' ||
      !webViewRef.current
    ) {
      return
    }
    const key = `${activeSmsDetection.detection.id}:${currentRoute}:${webLoadTick}`
    if (presentedSmsKeyRef.current === key) return
    presentedSmsKeyRef.current = key

    const currency = currentAccount.settings.currency || 'KES'
    const expCats = currentAccount.categories
      .filter((c) => c.type === 'expense')
      .map((c) => ({ id: c.id, name: c.name, icon: c.icon || 'category' }))
    const incCats = currentAccount.categories
      .filter((c) => c.type === 'income')
      .map((c) => ({ id: c.id, name: c.name, icon: c.icon || 'payments' }))

    const activeAgreements = loanAgreements.filter((a) => !a.archivedAt && a.status !== 'settled')
    const mapAgr = (a: (typeof activeAgreements)[number]) => {
      const bal = calculateAgreementBalances(a, loanPayments)
      const casual = isCasualAgreement(a)
      return {
        id: a.id,
        counterpartyName: a.counterpartyName,
        subtitle: casual ? `Casual (${a.relationship || 'Peer'})` : `Loan Agreement (${a.agreementReference})`,
        remainingFormatted: formatCurrency(bal.totalRemaining, currency),
      }
    }

    const modalPayload = {
      queueCount: activeSmsDetection.queueCount,
      detection: activeSmsDetection.detection,
      categories: { expense: expCats, income: incCats },
      agreements: {
        borrowed: activeAgreements.filter((a) => a.direction === 'borrowed').map(mapAgr),
        lent: activeAgreements.filter((a) => a.direction === 'lent').map(mapAgr),
      },
    }

    const injectModal = `if (window.__stitchSmsClassification) { window.__stitchSmsClassification(${JSON.stringify(modalPayload)}); }`
    webViewRef.current.injectJavaScript(`${injectModal} true;`)
  }, [activeSmsDetection, isAuthenticated, isAppLocked, displayHtml, webLoadTick, currentAccount, currentRoute, loanAgreements, loanPayments])

  // Apply appearance changes in-place without reloading WebView HTML
  useEffect(() => {
    if (!displayHtml) return
    if (htmlThemeSignatureRef.current === currentThemeSignature) return
    htmlThemeSignatureRef.current = currentThemeSignature
    const updatePayload = JSON.stringify({
      htmlClass: themeVars.htmlClass,
      themeCss,
      visualStyle: themeVars.visualStyle,
      colorScheme: themeVars.colorScheme,
      resolvedAppearance,
      tokens: themeVars.tokens,
    })
    webViewRef.current?.injectJavaScript(`if (window.__applyXpenseTheme) { window.__applyXpenseTheme(${updatePayload}); } true;`)
  }, [currentThemeSignature, displayHtml, resolvedAppearance, themeCss, themeVars])

  const webViewSource = useMemo(
    () => ({ html: displayHtml || html, baseUrl: 'https://stitch.withgoogle.com/' }),
    [displayHtml, html]
  )

  function resolveCategoryId(label: string, type: 'expense' | 'income') {
    if (!currentAccount) {
      return ''
    }
    const lower = label.toLowerCase()
    const match = currentAccount.categories.find((category) => {
      if (category.type !== type) {
        return false
      }
      const name = category.name.toLowerCase()
      return name.includes(lower) || lower.includes(name)
    })
    return match?.id ?? currentAccount.categories.find((category) => category.type === type)?.id ?? ''
  }

  async function handleNativeGoogleSignIn() {
    // 1. Try Native Google Sign-In if available (standalone APK / custom dev build with Play Services)
    try {
      const nativeAuth = getNativeGoogleSignin()
      if (authPlatform === 'android' && nativeAuth?.GoogleSignin) {
        await nativeAuth.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
        const response = await nativeAuth.GoogleSignin.signIn()

        if (nativeAuth.isCancelledResponse(response)) {
          return
        }

        if (nativeAuth.isSuccessResponse(response) && response.data.idToken) {
          const result = await signInWithGoogleIdToken(response.data.idToken)
          if (!result.ok) {
            showAppFeedback({ variant: 'error', title: 'Google sign-in', message: result.message })
          }
          return
        }
      }
    } catch (nativeErr: any) {
      console.warn('Native Google sign-in was unavailable or failed; falling back to web OAuth:', nativeErr)
      const nativeAuth = getNativeGoogleSignin()
      if (nativeAuth && nativeAuth.isErrorWithCode(nativeErr) && nativeErr.code === nativeAuth.statusCodes.SIGN_IN_CANCELLED) {
        return
      }
    }

    // 2. Seamless Fallback: WebBrowser OAuth (Universal for Expo Go, iOS, Android, and web)
    try {
      const result = await signInWithGoogleOAuth()
      if (!result.ok && result.message !== 'Sign-in cancelled.') {
        showAppFeedback({ variant: 'error', title: 'Google sign-in', message: result.message })
      }
    } catch (fallbackErr: any) {
      console.error('OAuth fallback error:', fallbackErr)
      showAppFeedback({
        variant: 'error',
        title: 'Google sign-in',
        message: fallbackErr?.message || 'Please verify your internet connection.',
      })
    }
  }

  async function handlePickProfileAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        showAppFeedback({
          variant: 'warning',
          title: 'Permission required',
          message: 'Please allow photo library access to choose a profile picture.',
        })
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.25,
        base64: true,
      })

      if (result.canceled || !result.assets?.[0]) {
        return
      }

      const asset = result.assets[0]
      if (!asset.base64) {
        showAppFeedback({ variant: 'error', title: 'Image not saved', message: 'Please try selecting the image again.' })
        return
      }

      const mimeType = asset.mimeType || 'image/jpeg'
      await updateSettings({
        avatarDataUrl: `data:${mimeType};base64,${asset.base64}`,
      })
    } catch (error) {
      console.warn('Profile avatar picker failed', error)
      showAppFeedback({
        variant: 'error',
        title: 'Profile photo failed',
        message: 'Could not open the gallery. Please try again.',
      })
    }
  }

  async function handleMessage(raw: string) {
    try {
      const message = JSON.parse(raw) as Record<string, unknown>
      const type = String(message.type ?? '')

      if (type === 'ui.modal.state') {
        webModalOpenRef.current = Number(message.openCount || 0) > 0
        return
      }

      if (type === 'ui.confirm.result') {
        const actionId = String(message.actionId || '')
        const confirmed = Boolean(message.confirmed)
        const callback = pendingConfirmMapRef.current[actionId]
        if (actionId) delete pendingConfirmMapRef.current[actionId]
        if (confirmed && callback) callback()
        return
      }

      if (type === 'dashboard.workspace.set') {
        preferredWorkspaceRef.current = message.workspace === 'lending' ? 'lending' : 'expenses'
        return
      }

      if (type === 'help.email.support') {
        const subject = encodeURIComponent('XpenseTracker Support Request')
        const body = encodeURIComponent(`Account: ${String(message.email || currentAccount?.settings.email || '')}\nApp Version: v${APP_VERSION}\n\nDescribe your issue:\n`)
        const mailUrl = `mailto:support@xpensetracker.app?subject=${subject}&body=${body}`
        try {
          const canOpen = await Linking.canOpenURL(mailUrl)
          if (canOpen) {
            await Linking.openURL(mailUrl)
          } else {
            showAppFeedback({
              variant: 'info',
              title: 'Support Email',
              message: 'Please send an email to support@xpensetracker.app from your preferred mail app.',
            })
          }
        } catch {
          showAppFeedback({
            variant: 'info',
            title: 'Support Email',
            message: 'Reach our team directly at support@xpensetracker.app.',
          })
        }
        return
      }

      if (type === 'help.copy.email') {
        showAppFeedback({
          variant: 'info',
          title: 'Support Address',
          message: 'Contact support anytime at support@xpensetracker.app.',
        })
        return
      }

      if (type === 'notifications.permissions.refresh') {
        const snap = await refreshOsPermissionsSilently()
        webViewRef.current?.injectJavaScript(
          `if (window.__stitchUpdateNotificationPerms) { window.__stitchUpdateNotificationPerms(${JSON.stringify(snap)}); } true;`
        )
        showAppToast('Device permission status refreshed.', 'info')
        return
      }

      if (type === 'notifications.permissions.request') {
        const perm = await smsDetectionService.requestPermissions()
        const snap = await refreshOsPermissionsSilently()
        webViewRef.current?.injectJavaScript(
          `if (window.__stitchUpdateNotificationPerms) { window.__stitchUpdateNotificationPerms(${JSON.stringify(snap)}); } true;`
        )
        if (!perm.ok && perm.reason) {
          if (perm.neverAskAgain) {
            showAppConfirm({
              variant: 'warning',
              title: 'Open App Settings',
              message: perm.reason,
              confirmLabel: 'Open Settings',
              cancelLabel: 'Later',
              onConfirm: () => {
                void Linking.openSettings()
              },
            })
          } else {
            showAppFeedback({ variant: 'warning', title: 'Permissions Needed', message: perm.reason })
          }
        } else if (perm.ok) {
          showAppToast('SMS & notification permissions active.', 'success')
        }
        return
      }

      if (type === 'sms.classify.reopen') {
        presentedSmsKeyRef.current = null
        if (currentAccount) {
          await presentNextSmsDetection(currentAccount.id)
        }
        return
      }

      if (type === 'sms.classify.defer') {
        presentedSmsKeyRef.current = null
        setActiveSmsDetection(null)
        return
      }

      if (type === 'sms.classify.submit' && currentAccount) {
        const detectionId = String(message.detectionId || '')
        const payload = (message.payload && typeof message.payload === 'object' ? message.payload : {}) as Record<string, unknown>
        const action = String(payload.action || 'dismiss')
        const target =
          activeSmsDetection?.detection.id === detectionId
            ? activeSmsDetection.detection
            : (await smsDetectionService.loadPendingQueue(currentAccount.id)).find((d) => d.id === detectionId)

        if (!target) {
          setActiveSmsDetection(null)
          return
        }

        const parsed = target.parsed
        presentedSmsKeyRef.current = null

        if (action === 'expense' || action === 'income') {
          const txKind = action === 'income' ? 'income' : 'expense'
          const requestedCatId = String(payload.categoryId || '')
          const requestedCatName = String(payload.categoryName || '')
          const matchedCat =
            currentAccount.categories.find((c) => c.id === requestedCatId && c.type === txKind) ||
            currentAccount.categories.find((c) => c.type === txKind && c.name.toLowerCase() === requestedCatName.toLowerCase()) ||
            currentAccount.categories.find((c) => c.type === txKind)

          const categoryId = matchedCat?.id ?? resolveCategoryId(requestedCatName || 'General', txKind)
          const notePrefix = txKind === 'income' ? 'From' : 'To'
          const noteText = `${parsed.provider} ${notePrefix} ${parsed.counterpartyName}${parsed.referenceCode ? ` (Ref: ${parsed.referenceCode})` : ''}`

          let triggerBudgetOverrun = false
          let overrunAmount = parsed.amount
          if (
            txKind === 'expense' &&
            currentAccount.settings.budgetConfigured &&
            Number(currentAccount.settings.monthlyBudget) > 0
          ) {
            const currentSummary = getAccountSummary(currentAccount)
            const expensesAfter = currentSummary.expenses + parsed.amount
            const budget = Number(currentAccount.settings.monthlyBudget)
            if (expensesAfter > budget) {
              triggerBudgetOverrun = true
              overrunAmount = Math.max(parsed.amount, expensesAfter - budget)
            }
          }

          await addTransaction({
            amount: parsed.amount,
            categoryId,
            note: noteText,
            date: parsed.smsTimestamp || new Date().toISOString(),
            type: txKind,
            paymentMethod: parsed.provider || 'MPESA',
            recurring: false,
          })
          await smsDetectionService.markDetectionStatus(currentAccount.id, target.id, 'posted')
          showAppToast(
            `${txKind === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(parsed.amount, parsed.currency)} recorded.`,
            'success'
          )
          await presentNextSmsDetection(currentAccount.id)

          if (triggerBudgetOverrun) {
            setBudgetOverrunPrompt({
              amount: overrunAmount,
              monthlyBudget: Number(currentAccount.settings.monthlyBudget),
              currentExpenses: getAccountSummary(currentAccount).expenses + parsed.amount,
            })
          }
          return
        }

        if (action === 'repayment_owed' || action === 'repayment_lent') {
          const agreementId = String(payload.agreementId || '')
          const agr = loanAgreements.find((a) => a.id === agreementId)
          if (!agr) {
            showAppFeedback({ variant: 'error', title: 'Not Found', message: 'Selected loan agreement could not be found.' })
            return
          }
          const balances = calculateAgreementBalances(agr, loanPayments)
          const alloc = allocateWaterfallPayment(
            parsed.amount,
            balances.remainingPenalty,
            balances.remainingInterest,
            balances.remainingPrincipal
          )
          await addLoanPayment({
            agreementId: agr.id,
            idempotencyKey: parsed.fingerprint,
            amount: parsed.amount,
            penaltyComponent: alloc.penaltyComponent,
            interestComponent: alloc.interestComponent,
            principalComponent: alloc.principalComponent,
            paymentDate: parsed.smsTimestamp || new Date().toISOString(),
            paymentMethod: parsed.provider || 'MPESA',
            referenceNumber: parsed.referenceCode,
            notes: `Auto-linked from ${parsed.provider} SMS (${parsed.counterpartyName})`,
          })
          await smsDetectionService.markDetectionStatus(currentAccount.id, target.id, 'posted')
          showAppToast(`Repayment credited to ${agr.counterpartyName}.`, 'success')
          await presentNextSmsDetection(currentAccount.id)
          return
        }

        if (action === 'lent' || action === 'borrowed') {
          const mode = String(payload.mode) === 'formal' ? 'formal' : 'casual'
          pendingSmsCreateLinkRef.current = target.id
          await smsDetectionService.markDetectionStatus(currentAccount.id, target.id, 'awaiting_details')
          setActiveSmsDetection(null)
          navigate('createAgreement', {
            mode,
            origin: mode,
            modeLocked: 'true',
            direction: action === 'lent' ? 'lent' : 'borrowed',
            counterpartyName: parsed.counterpartyName || '',
            counterpartyPhone: parsed.counterpartyPhone || '',
            principalAmount: String(parsed.amount),
            notes: `${parsed.provider} ${parsed.channel}${parsed.referenceCode ? ` • Ref: ${parsed.referenceCode}` : ''}`,
          })
          return
        }

        // 'other_transfer' | 'other_refund' | 'dismiss'
        await smsDetectionService.markDetectionStatus(currentAccount.id, target.id, 'dismissed')
        showAppToast('Transaction marked as reviewed.', 'info')
        await presentNextSmsDetection(currentAccount.id)
        return
      }

      if (type === 'navigate') {
        const route = String(message.route) as StitchRoute
        const params: Record<string, string> = {}
        Object.entries(message).forEach(([key, value]) => {
          if (key === 'type' || key === 'route' || key === 'params') return
          if (value !== undefined && value !== null && typeof value !== 'object') {
            params[key] = String(value)
          }
        })
        if (message.params && typeof message.params === 'object' && !Array.isArray(message.params)) {
          Object.entries(message.params as Record<string, unknown>).forEach(([key, value]) => {
            if (value !== undefined && value !== null && typeof value !== 'object') {
              params[key] = String(value)
            }
          })
        }
        navigate(route, params)
        return
      }

      if (type === 'back' || type === 'nav.back') {
        goBack()
        return
      }

      if (type === 'status_bar.set_style') {
        const requested = message.style === 'light' || message.style === 'dark' ? (message.style as 'light' | 'dark') : null
        setStatusBarOverride((prev) => (prev === requested ? prev : requested))
        return
      }

      if (type === 'haptic') {
        if (message.style === 'heavy') {
          void hapticMedium()
        } else if (message.style === 'selection') {
          void hapticSelection()
        } else if (message.style === 'success') {
          void hapticSuccess()
        } else if (message.style === 'error') {
          void hapticError()
        } else {
          void hapticLight()
        }
        return
      }

      if (type === 'swipe.left' || type === 'swipe.right') {
        const activeRoute = routeStack[routeStack.length - 1]
        const currentIndex = bottomNavRoutes.indexOf(activeRoute)

        if (currentIndex !== -1) {
          if (type === 'swipe.left' && currentIndex < bottomNavRoutes.length - 1) {
            navigate(bottomNavRoutes[currentIndex + 1])
          } else if (type === 'swipe.right' && currentIndex > 0) {
            navigate(bottomNavRoutes[currentIndex - 1])
          }
        }
        return
      }

      if (type === 'auth.switch') {
        setAuthRoute(String(message.mode) === 'signup' ? 'signup' : 'signin')
        return
      }

      if (type === 'auth.google') {
        await handleNativeGoogleSignIn()
        return
      }

      if (type === 'auth.email') {
        const mode = String(message.mode)
        const email = String(message.email || '').trim()
        const password = String(message.password || '')

        if (!email || !password) {
          showAppFeedback({ variant: 'warning', title: 'Missing fields', message: 'Please enter both email and password.' })
          return
        }

        const result = mode === 'signup'
          ? await signUpWithEmail(email, password)
          : await signInWithEmail(email, password)

        if (!result.ok) {
          // Check for "Email not confirmed" error or similar
          if (result.message.toLowerCase().includes('confirm')) {
            showAppFeedback({
              variant: 'info',
              title: 'Check your email',
              message: 'Please confirm your email address to sign in.',
            })
          } else {
            showAppFeedback({ variant: 'error', title: 'Authentication Failed', message: result.message })
          }
        }
        return
      }

      if (type === 'signout') {
        if (authPlatform === 'android') {
          try {
            const nativeAuth = getNativeGoogleSignin()
            if (nativeAuth?.GoogleSignin) {
              await nativeAuth.GoogleSignin.signOut()
            }
          } catch { }
        }
        await signOut()
        setAuthRoute('signin')
        return
      }

      if (type === 'profile.avatar.pick') {
        console.log('[Bridge] profile.avatar.pick')
        await handlePickProfileAvatar()
        return
      }

      if (type === 'transaction.create' && currentAccount) {
        const transactionType = String(message.transactionType) === 'income' ? 'income' : 'expense'
        const categoryId = resolveCategoryId(String(message.category ?? ''), transactionType)
        const numericAmount = typeof message.amount === 'number' ? message.amount : Number(String(message.amount ?? 0).replace(/,/g, ''))

        let triggerBudgetOverrun = false
        let overrunAmount = numericAmount
        if (
          transactionType === 'expense' &&
          currentAccount.settings.budgetConfigured &&
          Number(currentAccount.settings.monthlyBudget) > 0
        ) {
          const currentSummary = getAccountSummary(currentAccount)
          const expensesBefore = currentSummary.expenses
          const expensesAfter = expensesBefore + numericAmount
          const budget = Number(currentAccount.settings.monthlyBudget)
          if (expensesAfter > budget) {
            triggerBudgetOverrun = true
            overrunAmount = Math.max(numericAmount, expensesAfter - budget)
          }
        }

        // Optimistic Navigation: Start background task and navigate immediately
        void addTransaction({
          amount: numericAmount,
          categoryId,
          note: String(message.note ?? ''),
          date: String(message.date ?? new Date().toISOString()),
          type: transactionType,
          paymentMethod: 'UPI',
          recurring: false,
        }).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Save Failed', message: 'Could not save transaction. Please try again.' })
          console.error('[Bridge] addTransaction failed:', err)
        })

        if (triggerBudgetOverrun) {
          setBudgetOverrunPrompt({
            amount: overrunAmount,
            monthlyBudget: Number(currentAccount.settings.monthlyBudget),
            currentExpenses: getAccountSummary(currentAccount).expenses + numericAmount,
          })
        } else {
          setRouteStack(['transactions'])
        }
        return
      }

      if (type === 'transaction.delete') {
        const id = String(message.id ?? '')
        if (!id || id === 'undefined') {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Missing transaction ID.' })
          return
        }
        void deleteTransaction(id).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Delete Failed', message: 'Could not delete transaction.' })
          console.error('[Bridge] deleteTransaction failed:', err)
        })
        return
      }

      if (type === 'category.create') {
        const name = String(message.name ?? '').trim()
        if (!name) {
          showAppFeedback({ variant: 'warning', title: 'Missing name', message: 'Please enter a category name.' })
          return
        }

        // Optimistic Navigation
        void addCategory({
          name,
          icon: String(message.icon ?? 'category'),
          color: String(message.color ?? '#1A237E'),
          type: String(message.categoryType ?? 'expense') === 'income' ? 'income' : 'expense',
        }).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Save Failed', message: 'Could not create category.' })
          console.error('[Bridge] addCategory failed:', err)
        })

        setRouteStack((current) => {
          const idx = current.lastIndexOf('categories')
          if (idx >= 0) return current.slice(0, idx + 1)
          return [...current.filter((r) => r !== 'addCategory' && r !== 'editCategory'), 'categories']
        })
        return
      }

      if (type === 'category.update') {
        const id = String(message.id ?? '')
        const name = String(message.name ?? '').trim()
        if (!id || !name) {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Invalid category data.' })
          return
        }

        // Optimistic Navigation
        void updateCategory(id, {
          name,
          icon: String(message.icon ?? 'category'),
          color: String(message.color ?? '#1A237E'),
          type: String(message.categoryType ?? 'expense') === 'income' ? 'income' : 'expense',
        }).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Update Failed', message: 'Could not update category.' })
          console.error('[Bridge] updateCategory failed:', err)
        })

        setRouteStack((current) => {
          const idx = current.lastIndexOf('categories')
          if (idx >= 0) return current.slice(0, idx + 1)
          return [...current.filter((r) => r !== 'addCategory' && r !== 'editCategory'), 'categories']
        })
        return
      }

      if (type === 'category.reorder' && message.ids) {
        reorderCategories(message.ids as string[])
        return
      }

      if (type === 'category.delete') {
        const id = String(message.id ?? '')
        console.log('[Bridge] Deleting category:', id)
        if (!id || id === 'undefined') {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Missing category ID or invalid data.' })
          return
        }
        const result = await deleteCategory(id)
        if (!result.ok) {
          showAppFeedback({ variant: 'warning', title: 'Cannot delete', message: result.message })
        }
        return
      }

      if (type === 'settings.profile.save') {
        // Optimistic Navigation
        void updateSettings({
          fullName: String(message.fullName ?? ''),
          email: String(message.email ?? ''),
          phoneNumber: String(message.phoneNumber ?? ''),
          dob: String(message.dob ?? ''),
        }).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Save Failed', message: 'Could not update profile.' })
          console.error('[Bridge] updateSettings Profile failed:', err)
        })
        showAppToast('Personal information saved.', 'success', true)
        goBack()
        return
      }

      if (type === 'settings.budget.save') {
        console.log('[Bridge] settings.budget.save payload:', message)
        // Optimistic Navigation
        void updateSettings({
          monthlyBudget: Number(message.monthlyBudget ?? 0),
          categoryBudgets: Array.isArray(message.categoryBudgets)
            ? message.categoryBudgets as Array<{ categoryId: string; amount: number }>
            : undefined,
        }).catch(err => {
          showAppFeedback({ variant: 'error', title: 'Save Failed', message: 'Could not update budget.' })
          console.error('[Bridge] updateSettings Budget failed:', err)
        })
        showAppToast('Budget preferences saved.', 'success', true)
        goBack()
        return
      }

      if (type === 'settings.notifications.save') {
        await updateSettings({
          notifications: {
            billReminders: Boolean(message.billReminders),
            weeklyDigest: Boolean(message.weeklyDigest),
            unusualSpendAlerts: Boolean(message.unusualSpendAlerts),
            loanReminders: Boolean(message.loanReminders ?? true),
          },
        })
        goBack()
        return
      }

      if (type === 'settings.appearance.save') {
        await setAppearance({
          style: (message.style as any) || 'liquid-glass',
          colorScheme: (message.colorScheme as any) || 'system',
          pureBlack: message.pureBlack !== undefined ? Boolean(message.pureBlack) : undefined,
          colorTheme: (message.colorTheme as any) || undefined,
          reducedMotion: Boolean(message.reducedMotion),
        })
        if (!message.live) {
          goBack()
        }
        return
      }

      if (type === 'settings.appearance.reset') {
        await resetAppearance()
        return
      }

      if (type === 'settings.currency.save') {
        const nextCurrency = String(message.currency || 'KES').trim().toUpperCase()
        if (nextCurrency) {
          await updateSettings({ currency: nextCurrency })
        }
        return
      }

      if (type === 'settings.sync.retry') {
        const result = await retrySync()
        const injectPayload = JSON.stringify({
          ok: result.ok,
          message: result.message,
          syncStatus: {
            ...syncStatusRef.current,
            pendingCount: result.remaining,
          },
        })
        webViewRef.current?.injectJavaScript(`if (window.__onSyncResult) { window.__onSyncResult(${injectPayload}); } true;`)
        return
      }

      if (type === 'settings.lending.toggle') {
        await setLendingEnabled(Boolean(message.enabled))
        return
      }

      if (type === 'settings.sms.toggle') {
        const enabled = Boolean(message.enabled)
        if (enabled) {
          const perm = await smsDetectionService.requestPermissions()
          const snap = await refreshOsPermissionsSilently()
          if (perm.ok && currentAccount) {
            await updateSettings({ smsTransactionDetection: true })
            smsDetectionService.start(currentAccount.id, (pending, totalPending) => {
              if (pending) setActiveSmsDetection({ detection: pending, queueCount: totalPending })
            })
            void syncNativeSmsQueue()
            webViewRef.current?.injectJavaScript(
              `if (window.__stitchUpdateNotificationPerms) { window.__stitchUpdateNotificationPerms(${JSON.stringify(snap)}); } true;`
            )
            showAppToast('Local SMS transaction detection enabled.', 'success')
          } else {
            await updateSettings({ smsTransactionDetection: false })
            webViewRef.current?.injectJavaScript(
              `if(window.__stitchSetSmsToggleState){window.__stitchSetSmsToggleState(false);} var t=document.getElementById('toggle-sms-detection'); if(t) t.checked=false; if(window.__stitchUpdateNotificationPerms){window.__stitchUpdateNotificationPerms(${JSON.stringify(snap)});} true;`
            )
            if (perm.neverAskAgain) {
              showAppConfirm({
                variant: 'warning',
                title: 'SMS Permission Blocked',
                message: perm.reason || 'Open App Settings -> Permissions -> SMS to allow M-PESA & bank alert detection.',
                confirmLabel: 'Open Settings',
                cancelLabel: 'Cancel',
                onConfirm: () => {
                  void Linking.openSettings()
                },
              })
            } else {
              showAppFeedback({
                variant: 'warning',
                title: 'Permission Required',
                message: perm.reason || 'SMS read and receive permissions are required to detect transactions from M-PESA and banks.',
              })
            }
          }
        } else {
          smsDetectionService.stop()
          await updateSettings({ smsTransactionDetection: false })
          showAppToast('SMS transaction detection paused.', 'info')
        }
        return
      }

      if (type === 'settings.biometric.toggle') {
        const enabled = Boolean(message.enabled)
        if (enabled) {
          try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync()
            const isEnrolled = await LocalAuthentication.isEnrolledAsync()
            if (!hasHardware || !isEnrolled) {
              void hapticError()
              showAppFeedback({
                variant: 'warning',
                title: 'Biometrics Not Available',
                message: 'Your device does not have biometric hardware enrolled. Please set up Face ID or Fingerprint in your device Settings.',
              })
              await updateSettings({ biometricLock: false })
              await AsyncStorage.setItem('@xpensetracker_biometric_lock', 'false')
              return
            }
            void hapticSelection()
            await updateSettings({ biometricLock: true })
            await AsyncStorage.setItem('@xpensetracker_biometric_lock', 'true')
            showAppFeedback({
              variant: 'success',
              title: 'App Lock Enabled',
              message: 'Biometric authentication will now be required when opening or resuming XpenseTracker.',
            })
          } catch (e) {
            void hapticError()
            showAppFeedback({ variant: 'error', title: 'Error', message: 'Failed to configure biometric security.' })
          }
        } else {
          void hapticSelection()
          await updateSettings({ biometricLock: false })
          await AsyncStorage.setItem('@xpensetracker_biometric_lock', 'false')
        }
        return
      }

      if (type === 'open_relationship_dropdown') {
        void hapticLight()
        const selected = String(message.selected || 'Friend')
        webViewRef.current?.injectJavaScript(`if (window.__stitchDropdown) { window.__stitchDropdown({ title: 'Select Relationship', subtitle: 'Choose your relationship with this contact', value: ${JSON.stringify(selected)}, options: [{ value: 'Family', label: 'Family', icon: 'family_restroom', subtitle: 'Immediate or extended family member' }, { value: 'Friend', label: 'Friend', icon: 'group', subtitle: 'Close friend or peer' }, { value: 'Co-worker', label: 'Co-worker', icon: 'work', subtitle: 'Colleague, associate, or business partner' }, { value: 'Business Partner', label: 'Business Partner', icon: 'handshake', subtitle: 'Vendor, partner, or client contact' }, { value: 'Other', label: 'Other', icon: 'person', subtitle: 'Other personal contact' }], onSelect: function(v) { if (window.__onRelationshipSelected) window.__onRelationshipSelected(v); } }); } true;`)
        return
      }

      if (type === 'lending.profile.save') {
        await updateLendingProfile({
          profileType: (message.profileType as any) || 'individual',
          ownerName: String(message.ownerName || ''),
          companyName: String(message.companyName || ''),
          mobileNumber: String(message.mobileNumber || ''),
          emailAddress: String(message.emailAddress || ''),
          officeAddress: String(message.officeAddress || ''),
          businessIdentifier: String(message.businessIdentifier || ''),
        })
        showAppToast('Lending profile details saved successfully.', 'success', true)
        goBack()
        return
      }

      if (type === 'lending.agreement.create') {
        try {
          const category = (message.agreementCategory as any) === 'formal' ? 'formal' : 'casual'
          const created = await addLoanAgreement({
            agreementCategory: category,
            direction: message.direction as any,
            relationship: message.relationship as any,
            counterpartyName: String(message.counterpartyName || ''),
            counterpartyPhone: String(message.counterpartyPhone || ''),
            counterpartyEmail: String(message.counterpartyEmail || ''),
            principalAmount: Number(message.principalAmount || 0),
            currencyCode: currentAccount?.settings.currency || 'KES',
            agreementDate: String(message.agreementDate || new Date().toISOString()),
            dueDate: message.dueDate ? String(message.dueDate) : undefined,
            repaymentFrequency: (message.repaymentFrequency as any) || 'one_time',
            interestType: category === 'casual' ? 'none' : ((message.interestType as any) || 'none'),
            agreedInterestAmount: category === 'casual' ? 0 : Number(message.agreedInterestAmount || 0),
            interestRate: category === 'casual' ? undefined : (message.interestRate ? Number(message.interestRate) : undefined),
            interestCalculationPeriod: category === 'casual' ? undefined : (message.interestCalculationPeriod ? String(message.interestCalculationPeriod) : undefined),
            penaltyType: category === 'casual' ? 'none' : ((message.penaltyType as any) || 'none'),
            penaltyRate: category === 'casual' ? undefined : (message.penaltyRate ? Number(message.penaltyRate) : undefined),
            penaltyAmount: category === 'casual' ? undefined : (message.penaltyAmount ? Number(message.penaltyAmount) : undefined),
            penaltyGraceDays: category === 'casual' ? undefined : (message.penaltyGraceDays ? Number(message.penaltyGraceDays) : undefined),
            notes: String(message.notes || ''),
          })
          if (pendingSmsCreateLinkRef.current && currentAccount) {
            await smsDetectionService.markDetectionStatus(currentAccount.id, pendingSmsCreateLinkRef.current, 'posted')
            pendingSmsCreateLinkRef.current = null
            void presentNextSmsDetection(currentAccount.id)
          }
          showAppToast(category === 'casual' ? 'Casual record saved.' : 'Loan agreement created.', 'success', true)
          navDirectionRef.current = 'forward'
          setCurrentParams({ id: created.id, origin: category })
          setRouteStack((current) => [
            ...current.filter((r) => r !== 'createAgreement'),
            'agreementDetails',
          ])
        } catch (err: any) {
          console.error('[Bridge] lending.agreement.create failed:', err)
          showAppFeedback({
            variant: 'error',
            title: 'Save Failed',
            message: err?.message ? `Could not save record: ${err.message}` : 'Failed to create record.',
          })
        }
        return
      }

      if (type === 'lending.agreement.update') {
        const id = String(message.id || '')
        const existing = loanAgreements.find((a) => a.id === id)
        if (!id || !existing) {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Agreement not found.' })
          return
        }
        try {
          const isCasual = existing.agreementCategory !== 'formal'
          await updateLoanAgreement(id, {
            direction: message.direction as any,
            relationship: message.relationship as any,
            counterpartyName: String(message.counterpartyName || ''),
            counterpartyPhone: String(message.counterpartyPhone || ''),
            counterpartyEmail: String(message.counterpartyEmail || ''),
            principalAmount: Number(message.principalAmount || existing.principalAmount),
            agreementDate: String(message.agreementDate || existing.agreementDate),
            dueDate: message.dueDate ? String(message.dueDate) : undefined,
            repaymentFrequency: (message.repaymentFrequency as any) || existing.repaymentFrequency,
            interestType: isCasual ? 'none' : ((message.interestType as any) || 'none'),
            agreedInterestAmount: isCasual ? 0 : Number(message.agreedInterestAmount || 0),
            interestRate: isCasual ? undefined : (message.interestRate ? Number(message.interestRate) : undefined),
            interestCalculationPeriod: isCasual ? undefined : (message.interestCalculationPeriod ? String(message.interestCalculationPeriod) : undefined),
            notes: String(message.notes || ''),
          })
          showAppToast('Agreement updated.', 'success', true)
          goBack()
        } catch (err) {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Failed to update agreement.' })
        }
        return
      }

      if (type === 'lending.penalty.update') {
        const id = String(message.id || '')
        if (id) {
          await updateLoanAgreement(id, {
            penaltyAmount: Number(message.penaltyAmount ?? 0),
            penaltyType: (message.penaltyType as any) || 'none',
            penaltyRate: Number(message.penaltyRate ?? 0),
            penaltyGraceDays: Number(message.penaltyGraceDays ?? 0),
          })
        }
        return
      }

      if (type === 'lending.agreement.archive') {
        const id = String(message.id || '')
        if (id) {
          const agr = loanAgreements.find((a) => a.id === id)
          const category = agr?.agreementCategory === 'formal' ? 'formal' : 'casual'
          await archiveLoanAgreement(id)
          showAppToast('Agreement marked as settled.', 'success', true)
          navigate('lendingAgreements', { category })
        }
        return
      }

      if (type === 'lending.payment.create') {
        try {
          await addLoanPayment({
            agreementId: String(message.agreementId || ''),
            idempotencyKey: '',
            amount: Number(message.amount || 0),
            penaltyComponent: Number(message.penaltyComponent || 0),
            principalComponent: Number(message.principalComponent || 0),
            interestComponent: Number(message.interestComponent || 0),
            paymentDate: String(message.paymentDate || new Date().toISOString()),
            paymentMethod: String(message.paymentMethod || 'UPI'),
            referenceNumber: String(message.referenceNumber || ''),
            notes: String(message.notes || ''),
          })
          showAppToast('Repayment has been successfully recorded.', 'success', true)
          goBack()
        } catch (err) {
          showAppFeedback({ variant: 'error', title: 'Error', message: 'Failed to record repayment.' })
        }
        return
      }

      if (type === 'lending.notifications.check') {
        const summary = await checkAndPushLoanNotifications(
          loanAgreements,
          loanPayments,
          currentAccount?.settings.currency || 'KES',
          true
        )
        showAppFeedback({
          variant: summary.overdueCount > 0 ? 'warning' : 'info',
          title: 'Loan Reminders',
          message: `Checked ${loanAgreements.length} loan agreements.\nOverdue Loans: ${summary.overdueCount}\nDue This Week: ${summary.dueThisWeekCount}\nNotifications Sent: ${summary.notificationsPushed}`,
        })
        return
      }

      if (type === 'updates.check') {
        const outcome = await checkForAppUpdate()
        latestReleaseRef.current = outcome.latestRelease
        webViewRef.current?.injectJavaScript(
          `if (window.__stitchUpdateCenterResult) { window.__stitchUpdateCenterResult(${JSON.stringify(outcome)}); } true;`
        )
        if (outcome.status === 'update_available' && outcome.latestRelease) {
          showAppToast(`Update v${outcome.latestRelease.version} available!`, 'info')
        } else if (outcome.status === 'up_to_date') {
          showAppFeedback({
            variant: 'success',
            title: 'Up to Date',
            message: outcome.message,
          })
        } else {
          showAppFeedback({
            variant: outcome.status === 'offline' ? 'offline' : 'warning',
            title: 'Update Check',
            message: outcome.message,
          })
        }
        return
      }

      if (type === 'updates.download') {
        const targetUrl = String(message.storeUrl || latestReleaseRef.current?.storeUrl || '').trim()
        const targetVersion = String(message.version || latestReleaseRef.current?.version || '').trim()
        if (targetUrl && /^https?:\/\//i.test(targetUrl)) {
          try {
            await Linking.openURL(targetUrl)
            webViewRef.current?.injectJavaScript(
              `if (window.__stitchUpdateDownloadState) { window.__stitchUpdateDownloadState('opened'); } true;`
            )
            showAppToast(
              targetVersion ? `Downloading XpenseTracker v${targetVersion}...` : 'Opening update download...',
              'success'
            )
          } catch {
            webViewRef.current?.injectJavaScript(
              `if (window.__stitchUpdateDownloadState) { window.__stitchUpdateDownloadState('reset'); } true;`
            )
            showAppFeedback({
              variant: 'error',
              title: 'Download Failed',
              message: `Could not open installer link automatically. Visit:\n${targetUrl}`,
            })
          }
        } else {
          webViewRef.current?.injectJavaScript(
            `if (window.__stitchUpdateDownloadState) { window.__stitchUpdateDownloadState('reset'); } true;`
          )
          showAppFeedback({
            variant: targetVersion ? 'info' : 'success',
            title: 'Update Status',
            message: targetVersion
              ? `Version v${targetVersion} was announced, but no APK download URL (store_url) was attached to the release record yet.`
              : `You are running the latest release (v${APP_VERSION}).`,
          })
        }
        return
      }

      if (type === 'settings.account.delete') {
        showAppConfirm({
          variant: 'danger',
          title: 'Delete Account',
          message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
          confirmLabel: 'Delete Permanently',
          cancelLabel: 'Cancel',
          onConfirm: () => {
            void deleteAccount().then((result) => {
              if (result && !result.ok) {
                showAppFeedback({ variant: 'error', title: 'Error', message: result.message })
              } else {
                setAuthRoute('signin')
              }
            }).catch(() => {
              showAppFeedback({
                variant: 'error',
                title: 'Error',
                message: 'Failed to delete account. Please try again.',
              })
            })
          },
        })
        return
      }
    } catch (error) {
      showAppFeedback({
        variant: 'error',
        title: 'Something went wrong',
        message: 'The requested action could not be completed.',
      })
      console.warn('Failed to handle Stitch message', error)
    }
  }

  const appBg = themeVars.tokens.bgCanvas

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void SystemUI.setBackgroundColorAsync(appBg).catch(() => { })
    }
  }, [appBg])

  // Don't render the WebView until Supabase has resolved the session.
  // Without this guard, the signin page can render against a stale route
  // and stay blank even after auth resolves.
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: appBg }} />
  }

  return (
    <View style={{ flex: 1, backgroundColor: appBg }}>
      <StatusBar style={activeStatusBarStyle} animated={true} />
      <SafeAreaView style={[styles.root, { backgroundColor: appBg }]} edges={['left', 'right', 'bottom']}>
        <Animated.View style={[styles.webviewWrap, { opacity: fadeAnim, backgroundColor: appBg }]}>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            originWhitelist={['*']}
            source={webViewSource}
            injectedJavaScript={INJECTED_SWIPE_SCRIPT}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            onLoadStart={() => {
              isWebViewLoadedRef.current = false
              webModalOpenRef.current = false
              presentedSmsKeyRef.current = null
              if (skeletonTimerRef.current) clearTimeout(skeletonTimerRef.current)
              skeletonTimerRef.current = setTimeout(() => {
                setShowSkeletonOverlay(true)
              }, 170)
            }}
            onLoadEnd={() => {
              isWebViewLoadedRef.current = true
              setWebLoadTick((n) => n + 1)
              if (skeletonTimerRef.current) {
                clearTimeout(skeletonTimerRef.current)
                skeletonTimerRef.current = null
              }
              setShowSkeletonOverlay(false)
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: resolvedAppearance.reducedMotion ? 0 : 75,
                useNativeDriver: true,
              }).start()
              if (queuedWebScriptRef.current && webViewRef.current) {
                const pending = queuedWebScriptRef.current
                queuedWebScriptRef.current = null
                webViewRef.current.injectJavaScript(`${pending} true;`)
              }
            }}
            onMessage={(event: any) => {
              void handleMessage(event.nativeEvent.data)
            }}
            setSupportMultipleWindows={false}
            style={[styles.webview, { backgroundColor: appBg }]}
            containerStyle={{ backgroundColor: appBg }}
            androidLayerType="hardware"
            androidHardwareAccelerationDisabled={false}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            overScrollMode="content"
          />
          {showSkeletonOverlay && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: appBg,
                  paddingTop: insets.top + 20,
                  paddingHorizontal: 20,
                  gap: 16,
                },
              ]}
            >
              <View style={{ height: 22, width: '48%', borderRadius: 10, backgroundColor: themeVars.tokens.surfaceContainerHigh }} />
              <View style={{ height: 150, borderRadius: 24, backgroundColor: themeVars.tokens.surfaceContainer, borderWidth: 1, borderColor: themeVars.tokens.outlineVariant }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, height: 92, borderRadius: 20, backgroundColor: themeVars.tokens.surfaceContainer }} />
                <View style={{ flex: 1, height: 92, borderRadius: 20, backgroundColor: themeVars.tokens.surfaceContainer }} />
              </View>
              <View style={{ height: 70, borderRadius: 18, backgroundColor: themeVars.tokens.surfaceContainerLow }} />
              <View style={{ height: 70, borderRadius: 18, backgroundColor: themeVars.tokens.surfaceContainerLow }} />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Budget Overrun Borrowing Flow Modal */}
      {budgetOverrunPrompt && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setBudgetOverrunPrompt(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: themeVars.tokens.surfaceElevated, borderColor: themeVars.tokens.outlineVariant, borderWidth: effectiveColorScheme === 'dark' ? 1 : 0 }]}>
              <Text style={[styles.modalTitle, { color: themeVars.tokens.textPrimary }]}>
                Budget Limit Exceeded
              </Text>
              <Text style={[styles.modalBody, { color: themeVars.tokens.textSecondary }]}>
                This expense brings your monthly spending to KSh {budgetOverrunPrompt.currentExpenses.toLocaleString()}, exceeding your monthly budget of KSh {budgetOverrunPrompt.monthlyBudget.toLocaleString()}.
              </Text>
              <Text style={[styles.modalPrompt, { color: themeVars.tokens.textPrimary }]}>
                Did you borrow funds to cover this expense?
              </Text>
              <View style={styles.modalBtnCol}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#0d9488' }]}
                  onPress={() => {
                    const amountToBorrow = budgetOverrunPrompt.amount
                    setBudgetOverrunPrompt(null)
                    navigate('createAgreement', {
                      mode: 'casual',
                      origin: 'casual',
                      modeLocked: 'true',
                      direction: 'borrowed',
                      principalAmount: String(amountToBorrow),
                      notes: 'Casual borrowing to cover budget limit overrun',
                    })
                  }}
                >
                  <Text style={styles.modalBtnText}>Borrowed from Friend / Peer (Casual)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: themeVars.tokens.primary }]}
                  onPress={() => {
                    const amountToBorrow = budgetOverrunPrompt.amount
                    setBudgetOverrunPrompt(null)
                    navigate('createAgreement', {
                      mode: 'formal',
                      origin: 'formal',
                      modeLocked: 'true',
                      direction: 'borrowed',
                      principalAmount: String(amountToBorrow),
                      notes: 'Institutional borrowing to cover budget limit overrun',
                    })
                  }}
                >
                  <Text style={[styles.modalBtnText, { color: themeVars.tokens.onPrimary }]}>Borrowed from Institution (Loan Agreement)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: themeVars.tokens.surfaceContainerHigh }]}
                  onPress={() => {
                    setBudgetOverrunPrompt(null)
                    setRouteStack(['transactions'])
                  }}
                >
                  <Text style={[styles.modalBtnCancelText, { color: themeVars.tokens.textSecondary }]}>
                    No, Used Savings (Dismiss)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Native Fallback Modal (used only when WebView is unavailable, e.g. splash or lock state) */}
      {nativeFallbackModal && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setNativeFallbackModal(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: themeVars.tokens.surfaceElevated, borderColor: themeVars.tokens.outlineVariant, borderWidth: 1, borderRadius: resolvedAppearance.style === 'material-expressive' ? 28 : 24 }]}>
              <Text style={[styles.modalTitle, { color: themeVars.tokens.textPrimary }]}>
                {nativeFallbackModal.title}
              </Text>
              <Text style={[styles.modalBody, { color: themeVars.tokens.textSecondary }]}>
                {nativeFallbackModal.message}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                {nativeFallbackModal.cancelLabel ? (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 11,
                      paddingHorizontal: 18,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: themeVars.tokens.outlineVariant,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setNativeFallbackModal(null)}
                  >
                    <Text style={[styles.modalBtnCancelText, { color: themeVars.tokens.textSecondary }]}>
                      {nativeFallbackModal.cancelLabel}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={{
                    paddingVertical: 11,
                    paddingHorizontal: 18,
                    borderRadius: 14,
                    backgroundColor: themeVars.tokens.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    const cb = nativeFallbackModal.onConfirm
                    setNativeFallbackModal(null)
                    if (cb) cb()
                  }}
                >
                  <Text style={{ color: themeVars.tokens.onPrimary, fontWeight: '700', fontSize: 13 }}>
                    {nativeFallbackModal.confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Biometric Privacy Shield App Lock Overlay */}
      {isAppLocked && isAuthenticated && (
        <View style={[styles.lockContainer, { backgroundColor: appBg }]}>
          <StatusBar style={activeStatusBarStyle} animated={true} />
          <View style={styles.lockContent}>
            <View style={[styles.lockIconCircle, { backgroundColor: themeVars.tokens.primaryContainer }]}>
              <Text style={styles.lockEmoji}>🛡️</Text>
            </View>
            <Text style={[styles.lockTitle, { color: themeVars.tokens.textPrimary }]}>
              XpenseTracker Protected
            </Text>
            <Text style={[styles.lockSubtitle, { color: themeVars.tokens.textSecondary }]}>
              Biometric authentication is required to access your financial records, loans, and sensitive balances.
            </Text>

            <TouchableOpacity
              style={[styles.lockPrimaryBtn, { backgroundColor: themeVars.tokens.primary, shadowColor: themeVars.tokens.primary }]}
              activeOpacity={0.8}
              onPress={() => void authenticateWithBiometrics()}
            >
              <Text style={[styles.lockPrimaryBtnText, { color: themeVars.tokens.onPrimary }]}>Unlock with Face / Fingerprint</Text>
            </TouchableOpacity>

            <Text style={[styles.lockHint, { color: themeVars.tokens.textMuted }]}>
              Device PIN / passcode fallback is available
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webviewWrap: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalTextDark: {
    color: '#f8fafc',
  },
  modalBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  modalBodyDark: {
    color: '#94a3b8',
  },
  modalPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalInfoCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  modalInfoCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalInfoAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalInfoSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalBtnCol: {
    gap: 9,
  },
  modalBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
    marginTop: 4,
  },
  modalBtnCancelDark: {
    backgroundColor: '#334155',
  },
  modalBtnCancelText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  // App Lock Screen Styles
  lockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 24,
  },
  lockContent: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIconCircleDark: {
    backgroundColor: '#312e81',
  },
  lockEmoji: {
    fontSize: 38,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },
  lockSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  lockPrimaryBtn: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  lockPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  lockHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 16,
    textAlign: 'center',
  },

  // Dropdown Modal Styles
  dropdownCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  dropdownCardDark: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownHeaderDark: {
    borderBottomColor: '#334155',
  },
  dropdownCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    padding: 4,
  },
  dropdownList: {
    gap: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  dropdownItemDark: {
    borderColor: '#334155',
    backgroundColor: '#0f172a',
  },
  dropdownItemSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  dropdownItemSelectedDark: {
    borderColor: '#0d9488',
    backgroundColor: '#134e4a',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownItemIconWrapActive: {
    backgroundColor: '#ccfbf1',
  },
  dropdownItemEmoji: {
    fontSize: 18,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  dropdownItemDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dropdownCheckmark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0d9488',
    marginLeft: 8,
  },
})
