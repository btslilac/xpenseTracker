import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { RealtimeChannel, User } from '@supabase/supabase-js'
import { createId, createInitialAccountData } from '../lib/finance'
import {
  calculateAgreementBalances,
  generateAgreementReference,
  generatePaymentIdempotencyKey,
} from '../lib/lendingFinance'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import {
  checkLoginRateLimit,
  classifyAuthError,
  evaluatePasswordStrength,
  isValidEmail,
  recordLoginAttemptOutcome,
} from '../lib/auth/authSecurity'
import {
  PRIVACY_POLICY_VERSION,
  SMS_DISCLOSURE_VERSION,
  TERMS_OF_SERVICE_VERSION,
} from '../lib/legal/complianceDocuments'
import { syncSmsExpenseCaptureConfiguration } from '../native/smsExpenseCapture'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import {
  DEFAULT_APPEARANCE,
  mergeAppearanceSafely,
  normalizeAppearance,
} from '../lib/appearance'
import {
  getLastSyncedAt,
  getSyncQueueCount,
  processSyncQueue,
  pushMutation,
  readSyncQueue,
  startNetworkListener,
  subscribeSyncStatus,
  type SyncAction,
} from '../lib/sync'
import type {
  Account,
  AppearanceSettings,
  AuthResult,
  Category,
  CategoryDraft,
  LendingProfile,
  LoanAgreement,
  LoanAgreementDraft,
  LoanPayment,
  LoanPaymentDraft,
  LoanStatus,
  PrivacyRequestType,
  SignUpInput,
  SyncMetadata,
  Transaction,
  TransactionDraft,
  UserConsentMetadata,
  UserDocument,
  UserSettings,
} from '../types'

const APPEARANCE_STORAGE_KEY = '@xpensetracker_appearance_v2'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type AppContextValue = {
  currentAccount: Account | null
  localAppearance?: AppearanceSettings
  syncStatus: SyncMetadata
  isAuthenticated: boolean
  isReady: boolean
  loanAgreements: LoanAgreement[]
  loanPayments: LoanPayment[]
  lendingProfile: LendingProfile | null
  signInWithGoogleIdToken: (idToken: string) => Promise<{ ok: boolean; message: string }>
  signInWithGoogleOAuth: () => Promise<{ ok: boolean; message: string }>
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>
  signUpWithEmail: (input: SignUpInput | string, passwordArg?: string) => Promise<AuthResult>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  verifyGuardianConsentCode: (token: string, guardianEmail: string, decision?: 'verified' | 'revoked') => Promise<{ ok: boolean; message: string }>
  submitPrivacyRequest: (requestType: PrivacyRequestType, details?: string) => Promise<{ ok: boolean; referenceCode?: string; message: string }>
  withdrawSmsConsent: () => Promise<void>
  signOut: () => Promise<void>
  addTransaction: (draft: TransactionDraft) => Promise<void>
  updateTransaction: (transactionId: string, draft: TransactionDraft) => Promise<void>
  deleteTransaction: (transactionId: string) => Promise<void>
  addCategory: (draft: CategoryDraft) => Promise<void>
  updateCategory: (categoryId: string, draft: CategoryDraft) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<{ ok: boolean; message: string }>
  reorderCategories: (orderedIds: string[]) => Promise<void>
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>
  deleteAccount: () => Promise<{ ok: boolean; message: string }>
  // Lending & Borrowing Actions
  addLoanAgreement: (draft: LoanAgreementDraft) => Promise<LoanAgreement>
  updateLoanAgreement: (id: string, patch: Partial<LoanAgreementDraft>) => Promise<void>
  archiveLoanAgreement: (id: string) => Promise<void>
  addLoanPayment: (draft: LoanPaymentDraft) => Promise<void>
  reverseLoanPayment: (paymentId: string, reason: string) => Promise<void>
  updateLendingProfile: (patch: Partial<LendingProfile>) => Promise<void>
  setLendingEnabled: (enabled: boolean) => Promise<void>
  setAppearance: (settings: Partial<AppearanceSettings>) => Promise<void>
  resetAppearance: () => Promise<void>
  retrySync: () => Promise<{ ok: boolean; remaining: number; message: string }>
}

const AppContext = createContext<AppContextValue | null>(null)

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message
  }
  return fallback
}

// ---------------------------------------------------------------------------
// Bootstrap: create user row + seed categories on first login
// ---------------------------------------------------------------------------

async function ensureUserBootstrap(user: User) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const fullName = user.user_metadata?.full_name?.trim() || user.email?.split('@')[0] || 'XpenseTracker User'
  const email = user.email ?? ''
  const seed = createInitialAccountData(fullName, email)
  const metaCompliance = (user.user_metadata?.compliance && typeof user.user_metadata.compliance === 'object'
    ? user.user_metadata.compliance
    : undefined) as UserConsentMetadata | undefined

  if (metaCompliance) {
    seed.settings.compliance = {
      ...seed.settings.compliance,
      ...metaCompliance,
    }
    if (metaCompliance.isMinor && metaCompliance.guardianConsentStatus !== 'verified') {
      seed.settings.smsTransactionDetection = false
    }
  }

  // Upsert user settings row
  const { error: userError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        settings: seed.settings,
        created_at: seed.createdAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  if (userError) throw userError

  // Best-effort consent record persistence (non-blocking if migration not yet applied)
  if (metaCompliance) {
    try {
      await supabase.from('user_consents').upsert(
        {
          user_id: user.id,
          age_bracket: metaCompliance.ageBracket || 'adult_18_plus',
          is_minor: Boolean(metaCompliance.isMinor),
          guardian_consent_status: metaCompliance.guardianConsentStatus || 'not_required',
          guardian_name: metaCompliance.guardianName || null,
          guardian_email: metaCompliance.guardianEmail || null,
          guardian_consent_token: metaCompliance.guardianConsentToken || null,
          terms_version: metaCompliance.termsVersion || TERMS_OF_SERVICE_VERSION,
          privacy_version: metaCompliance.privacyVersion || PRIVACY_POLICY_VERSION,
          sms_disclosure_version: SMS_DISCLOSURE_VERSION,
          terms_accepted_at: metaCompliance.termsAcceptedAt || new Date().toISOString(),
          privacy_accepted_at: metaCompliance.privacyAcceptedAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: true },
      )
    } catch {
      // ignore when compliance migration hasn't been applied on remote DB yet
    }
  }

  // Only seed categories if none exist yet
  const { count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) === 0 && seed.categories.length > 0) {
    const { error: catError } = await supabase.from('categories').insert(
      seed.categories.map((c) => ({
        id: c.id,
        user_id: user.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        order: c.order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    )
    if (catError) throw catError
  }
}

// ---------------------------------------------------------------------------
// Row → domain mappers
// ---------------------------------------------------------------------------

function rowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type,
    order: row.order ?? 0,
  }
}

function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    categoryId: row.category_id,
    note: row.note ?? '',
    date: row.date,
    type: row.type,
    paymentMethod: row.payment_method ?? 'UPI',
    recurring: Boolean(row.recurring),
  }
}

function rowToLoanAgreement(row: any, cached?: LoanAgreement): LoanAgreement {
  const hasExplicitCat = row.agreement_category === 'casual' || row.agreement_category === 'formal'
  const inferredCategory: 'casual' | 'formal' = hasExplicitCat
    ? row.agreement_category
    : cached?.agreementCategory
      ? cached.agreementCategory
      : (row.interest_type === 'simple' || row.interest_type === 'fixed' || (row.interest_rate && Number(row.interest_rate) > 0) || Number(row.agreed_interest_amount) > 0)
        ? 'formal'
        : 'casual'

  const resolvedRelationship = row.relationship
    || (inferredCategory === 'casual' ? (cached?.relationship || 'Friend') : undefined)

  return {
    id: row.id,
    userId: row.user_id,
    agreementReference: row.agreement_reference,
    direction: row.direction,
    agreementCategory: inferredCategory,
    relationship: resolvedRelationship,
    counterpartyName: row.counterparty_name,
    counterpartyPhone: row.counterparty_phone || '',
    counterpartyEmail: row.counterparty_email || '',
    principalAmount: Number(row.principal_amount) || 0,
    currencyCode: row.currency_code || 'KES',
    agreementDate: row.agreement_date,
    dueDate: row.due_date || undefined,
    repaymentFrequency: row.repayment_frequency || 'one_time',
    interestType: row.interest_type || 'none',
    agreedInterestAmount: Number(row.agreed_interest_amount) || 0,
    interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
    interestCalculationPeriod: row.interest_calculation_period,
    penaltyType: row.penalty_type || 'none',
    penaltyRate: row.penalty_rate ? Number(row.penalty_rate) : 0,
    penaltyAmount: Number(row.penalty_amount) || 0,
    penaltyGraceDays: Number(row.penalty_grace_days) || 0,
    notes: row.notes || '',
    status: row.status || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || undefined,
  }
}

function reconcileLoanAgreements(
  serverRows: any[],
  localList: LoanAgreement[],
  syncQueue: SyncAction[],
): LoanAgreement[] {
  const localById = new Map<string, LoanAgreement>()
  localList.forEach((a) => {
    if (a?.id) localById.set(a.id, a)
  })

  const map = new Map<string, LoanAgreement>()
  for (const row of serverRows) {
    if (!row?.id) continue
    map.set(row.id, rowToLoanAgreement(row, localById.get(row.id)))
  }

  for (const item of syncQueue) {
    if (item.table !== 'loan_agreements') continue
    if (item.action === 'insert' && item.payload?.id) {
      if (!map.has(item.payload.id)) {
        map.set(item.payload.id, rowToLoanAgreement(item.payload, localById.get(item.payload.id)))
      }
    } else if (item.action === 'update' && item.matchValue && map.has(item.matchValue)) {
      const existing = map.get(item.matchValue)!
      map.set(item.matchValue, {
        ...existing,
        ...(item.payload?.direction !== undefined ? { direction: item.payload.direction } : {}),
        ...(item.payload?.relationship !== undefined ? { relationship: item.payload.relationship } : {}),
        ...(item.payload?.counterparty_name !== undefined ? { counterpartyName: item.payload.counterparty_name } : {}),
        ...(item.payload?.counterparty_phone !== undefined ? { counterpartyPhone: item.payload.counterparty_phone } : {}),
        ...(item.payload?.counterparty_email !== undefined ? { counterpartyEmail: item.payload.counterparty_email } : {}),
        ...(item.payload?.principal_amount !== undefined ? { principalAmount: Number(item.payload.principal_amount) } : {}),
        ...(item.payload?.agreement_date !== undefined ? { agreementDate: item.payload.agreement_date } : {}),
        ...(item.payload?.due_date !== undefined ? { dueDate: item.payload.due_date || undefined } : {}),
        ...(item.payload?.repayment_frequency !== undefined ? { repaymentFrequency: item.payload.repayment_frequency } : {}),
        ...(item.payload?.interest_type !== undefined ? { interestType: item.payload.interest_type } : {}),
        ...(item.payload?.agreed_interest_amount !== undefined ? { agreedInterestAmount: Number(item.payload.agreed_interest_amount) } : {}),
        ...(item.payload?.interest_rate !== undefined ? { interestRate: Number(item.payload.interest_rate) } : {}),
        ...(item.payload?.interest_calculation_period !== undefined ? { interestCalculationPeriod: item.payload.interest_calculation_period } : {}),
        ...(item.payload?.penalty_type !== undefined ? { penaltyType: item.payload.penalty_type } : {}),
        ...(item.payload?.penalty_rate !== undefined ? { penaltyRate: Number(item.payload.penalty_rate) } : {}),
        ...(item.payload?.penalty_amount !== undefined ? { penaltyAmount: Number(item.payload.penalty_amount) } : {}),
        ...(item.payload?.penalty_grace_days !== undefined ? { penaltyGraceDays: Number(item.payload.penalty_grace_days) } : {}),
        ...(item.payload?.notes !== undefined ? { notes: item.payload.notes } : {}),
        ...(item.payload?.status !== undefined ? { status: item.payload.status } : {}),
        ...(item.payload?.archived_at !== undefined ? { archivedAt: item.payload.archived_at } : {}),
        ...(item.payload?.updated_at !== undefined ? { updatedAt: item.payload.updated_at } : {}),
      })
    } else if (item.action === 'delete' && item.matchValue) {
      map.delete(item.matchValue)
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function rowToLoanPayment(row: any): LoanPayment {
  return {
    id: row.id,
    userId: row.user_id,
    agreementId: row.agreement_id,
    idempotencyKey: row.idempotency_key,
    amount: Number(row.amount) || 0,
    penaltyComponent: Number(row.penalty_component) || 0,
    principalComponent: Number(row.principal_component) || 0,
    interestComponent: Number(row.interest_component) || 0,
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method || 'UPI',
    referenceNumber: row.reference_number || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    createdBy: row.created_by,
  }
}

function rowToLendingProfile(row: any): LendingProfile {
  return {
    id: row.id,
    userId: row.user_id,
    profileType: row.profile_type || 'individual',
    companyName: row.company_name || '',
    ownerName: row.owner_name || '',
    mobileNumber: row.mobile_number || '',
    emailAddress: row.email_address || '',
    officeAddress: row.office_address || '',
    businessIdentifier: row.business_identifier || '',
    logoPath: row.logo_path || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [dataReady, setDataReady] = useState(!isSupabaseConfigured)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null)
  const [categories, setCategories] = useState<Account['categories']>([])
  const [transactions, setTransactions] = useState<Account['transactions']>([])
  const [loanAgreements, setLoanAgreements] = useState<LoanAgreement[]>([])
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([])
  const [lendingProfile, setLendingProfile] = useState<LendingProfile | null>(null)
  const [localAppearance, setLocalAppearance] = useState<AppearanceSettings | undefined>(undefined)
  const [syncStatus, setSyncStatus] = useState<SyncMetadata>({
    isOnline: true,
    pendingCount: 0,
    lastSyncedAt: undefined,
  })
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    void AsyncStorage.getItem(APPEARANCE_STORAGE_KEY).then((raw) => {
      if (!raw) return
      try {
        setLocalAppearance(normalizeAppearance(JSON.parse(raw)))
      } catch {
        // ignore corrupt stored appearance
      }
    })
  }, [])

  useEffect(() => {
    const netUnsub = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false)
      setSyncStatus((prev) => ({ ...prev, isOnline: online }))
    })
    return () => netUnsub()
  }, [])

  useEffect(() => {
    if (!supabaseUser) {
      setSyncStatus((prev) => ({ ...prev, pendingCount: 0, lastSyncedAt: undefined }))
      return
    }
    const uid = supabaseUser.id
    void Promise.all([getSyncQueueCount(uid), getLastSyncedAt(uid)]).then(([pendingCount, lastSyncedAt]) => {
      setSyncStatus((prev) => ({ ...prev, pendingCount, lastSyncedAt }))
    })
    const unsubSync = subscribeSyncStatus((info) => {
      if (info.userId === uid) {
        setSyncStatus((prev) => ({
          ...prev,
          pendingCount: info.pendingCount,
          lastSyncedAt: info.lastSyncedAt ?? prev.lastSyncedAt,
        }))
      }
    })
    const unsubscribe = startNetworkListener(uid)
    return () => {
      unsubscribe()
      unsubSync()
    }
  }, [supabaseUser])

  // ── Auth state ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSupabaseUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (!session?.user) {
        setUserDoc(null)
        setCategories([])
        setTransactions([])
        setLoanAgreements([])
        setLoanPayments([])
        setLendingProfile(null)
        setDataReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Data loading + real-time subscriptions ────────────────────────────────

  useEffect(() => {
    if (!supabaseUser || !supabase) {
      if (authReady) setDataReady(true)
      return
    }

    setDataReady(false)
    const uid = supabaseUser.id

    async function loadAll() {
      if (!supabase) return

      let cachedAgreementsLocal: LoanAgreement[] = []
      try {
        const cachedUserDoc = await AsyncStorage.getItem(`@cache_userDoc_${uid}`)
        const cachedCategories = await AsyncStorage.getItem(`@cache_categories_${uid}`)
        const cachedTransactions = await AsyncStorage.getItem(`@cache_transactions_${uid}`)
        const cachedAgreements = await AsyncStorage.getItem(`@cache_agreements_${uid}`)
        const cachedPayments = await AsyncStorage.getItem(`@cache_payments_${uid}`)
        const cachedProfile = await AsyncStorage.getItem(`@cache_lending_profile_${uid}`)

        if (cachedUserDoc) {
          const parsedCachedDoc = JSON.parse(cachedUserDoc) as UserDocument
          setUserDoc(parsedCachedDoc)
          if (parsedCachedDoc?.settings?.appearance) {
            const norm = normalizeAppearance(parsedCachedDoc.settings.appearance)
            setLocalAppearance((prev) => mergeAppearanceSafely(prev, norm))
          }
        }
        if (cachedCategories) setCategories(JSON.parse(cachedCategories))
        if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions))
        if (cachedAgreements) {
          cachedAgreementsLocal = JSON.parse(cachedAgreements)
          setLoanAgreements(cachedAgreementsLocal)
        }
        if (cachedPayments) setLoanPayments(JSON.parse(cachedPayments))
        if (cachedProfile) setLendingProfile(JSON.parse(cachedProfile))

        if (cachedUserDoc && cachedCategories && cachedTransactions) {
          setDataReady(true)
        }
      } catch (err) { }

      let storedLocalAppearance: AppearanceSettings | undefined
      try {
        const rawLocal = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
        if (rawLocal) storedLocalAppearance = normalizeAppearance(JSON.parse(rawLocal))
      } catch {
        // ignore
      }

      try {
        const [userRes, catRes, txRes, agrRes, payRes, profRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', uid).single(),
          supabase.from('categories').select('*').eq('user_id', uid).order('order', { ascending: true }),
          supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
          supabase.from('loan_agreements').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
          supabase.from('loan_payments').select('*').eq('user_id', uid).order('payment_date', { ascending: false }),
          supabase.from('lending_profiles').select('*').eq('user_id', uid).maybeSingle(),
        ])

        if (userRes.data) {
          const remoteSettings = userRes.data.settings as UserSettings
          const mergedAppearance = mergeAppearanceSafely(storedLocalAppearance, remoteSettings?.appearance)
          const mergedSettings: UserSettings = {
            ...remoteSettings,
            appearance: mergedAppearance,
          }
          const doc = { createdAt: userRes.data.created_at, settings: mergedSettings }
          setUserDoc(doc)
          if (mergedAppearance) {
            setLocalAppearance(mergedAppearance)
            void AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(mergedAppearance))
          }
          void AsyncStorage.setItem(`@cache_userDoc_${uid}`, JSON.stringify(doc))
        } else if (supabaseUser) {
          try {
            await ensureUserBootstrap(supabaseUser)
            const { data: freshUser } = await supabase.from('users').select('*').eq('id', uid).single()
            if (freshUser) {
              const freshSettings = freshUser.settings as UserSettings
              const mergedAppearance = mergeAppearanceSafely(storedLocalAppearance, freshSettings?.appearance)
              const doc = {
                createdAt: freshUser.created_at,
                settings: { ...freshSettings, appearance: mergedAppearance },
              }
              setUserDoc(doc)
              if (mergedAppearance) {
                setLocalAppearance(mergedAppearance)
                void AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(mergedAppearance))
              }
              void AsyncStorage.setItem(`@cache_userDoc_${uid}`, JSON.stringify(doc))
            }
          } catch (bErr) {
            console.error('Failed to bootstrap user record:', bErr)
          }
        }

        if (catRes.data) {
          const cats = catRes.data.map(rowToCategory)
          setCategories(cats)
          void AsyncStorage.setItem(`@cache_categories_${uid}`, JSON.stringify(cats))
        }

        if (txRes.data) {
          const txs = txRes.data.map(rowToTransaction)
          setTransactions(txs)
          void AsyncStorage.setItem(`@cache_transactions_${uid}`, JSON.stringify(txs))
        }

        const pendingQueue = await readSyncQueue(uid)

        if (agrRes.data) {
          const agrs = reconcileLoanAgreements(agrRes.data, cachedAgreementsLocal, pendingQueue)
          setLoanAgreements(agrs)
          void AsyncStorage.setItem(`@cache_agreements_${uid}`, JSON.stringify(agrs))
        }

        if (payRes.data) {
          const pays = payRes.data.map(rowToLoanPayment)
          setLoanPayments(pays)
          void AsyncStorage.setItem(`@cache_payments_${uid}`, JSON.stringify(pays))
        }

        if (profRes.data) {
          const prof = rowToLendingProfile(profRes.data)
          setLendingProfile(prof)
          void AsyncStorage.setItem(`@cache_lending_profile_${uid}`, JSON.stringify(prof))
        }

        if (pendingQueue.length > 0) {
          void processSyncQueue(uid)
        }
      } catch (err) {
        console.warn('Network fetch failed, using cache', err)
      }

      setDataReady(true)
    }

    void loadAll()

    // Real-time channel
    const channel = supabase
      .channel(`user-data:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, (payload) => {
        const row = (payload.new ?? payload.old) as any
        if (payload.eventType !== 'DELETE' && row?.settings) {
          const remoteSettings = row.settings as UserSettings
          setUserDoc((prev) => {
            const mergedAppearance = mergeAppearanceSafely(prev?.settings?.appearance, remoteSettings?.appearance)
            const nextDoc = {
              createdAt: row.created_at,
              settings: { ...remoteSettings, appearance: mergedAppearance },
            }
            if (mergedAppearance) {
              setLocalAppearance(mergedAppearance)
              void AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(mergedAppearance))
            }
            void AsyncStorage.setItem(`@cache_userDoc_${uid}`, JSON.stringify(nextDoc))
            return nextDoc
          })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${uid}` }, () => {
        if (!supabase) return
        void supabase.from('categories').select('*').eq('user_id', uid).order('order', { ascending: true }).then(({ data }) => {
          if (data) setCategories(data.map(rowToCategory))
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${uid}` }, () => {
        if (!supabase) return
        void supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }).then(({ data }) => {
          if (data) setTransactions(data.map(rowToTransaction))
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_agreements', filter: `user_id=eq.${uid}` }, () => {
        if (!supabase) return
        void Promise.all([
          supabase.from('loan_agreements').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
          readSyncQueue(uid),
        ]).then(([{ data }, pendingQueue]) => {
          if (data) {
            setLoanAgreements((prev) => {
              const reconciled = reconcileLoanAgreements(data, prev, pendingQueue)
              void AsyncStorage.setItem(`@cache_agreements_${uid}`, JSON.stringify(reconciled))
              return reconciled
            })
          }
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_payments', filter: `user_id=eq.${uid}` }, () => {
        if (!supabase) return
        void supabase.from('loan_payments').select('*').eq('user_id', uid).order('payment_date', { ascending: false }).then(({ data }) => {
          if (data) setLoanPayments(data.map(rowToLoanPayment))
        })
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      void supabase?.removeChannel(channel)
      channelRef.current = null
    }
  }, [authReady, supabaseUser])

  // ── Derived account ───────────────────────────────────────────────────────

  const currentAccount = useMemo<Account | null>(() => {
    if (!supabaseUser || !userDoc) return null
    const mergedAppearance = mergeAppearanceSafely(localAppearance, userDoc.settings.appearance)
    return {
      id: supabaseUser.id,
      createdAt: userDoc.createdAt || new Date().toISOString(),
      settings: {
        ...userDoc.settings,
        appearance: mergedAppearance ? normalizeAppearance(mergedAppearance) : DEFAULT_APPEARANCE,
        budgetConfigured: userDoc.settings.budgetConfigured ?? false,
        email: supabaseUser.email ?? userDoc.settings.email,
      },
      categories,
      transactions,
    }
  }, [categories, localAppearance, supabaseUser, transactions, userDoc])

  const isReady = authReady && (!supabaseUser || dataReady)

  // ── Actions ───────────────────────────────────────────────────────────────

  const value = useMemo<AppContextValue>(() => {
    async function updateSettings(patch: Partial<UserSettings>) {
      if (!currentAccount || !supabase) return

      const nextSettings: UserSettings = {
        ...currentAccount.settings,
        ...patch,
        budgetConfigured:
          patch.monthlyBudget !== undefined
            ? true
            : currentAccount.settings.budgetConfigured ?? false,
        email: supabaseUser?.email ?? currentAccount.settings.email,
        notifications: {
          ...currentAccount.settings.notifications,
          ...patch.notifications,
        },
      }

      if (userDoc) {
        const nextDoc = { ...userDoc, settings: nextSettings }
        setUserDoc(nextDoc)
        void AsyncStorage.setItem(`@cache_userDoc_${currentAccount.id}`, JSON.stringify(nextDoc))
      }

      if (patch.fullName !== undefined) {
        try {
          await supabase.auth.updateUser({
            data: { full_name: patch.fullName }
          })
        } catch (err) {
          console.error('Failed to sync profile to Supabase Auth:', err)
        }
      }

      await pushMutation(currentAccount.id, 'users', 'update', {
        settings: nextSettings, updated_at: new Date().toISOString()
      }, 'id', currentAccount.id)
    }

    async function addTransaction(draft: TransactionDraft) {
      if (!currentAccount || !supabase) return
      const id = createId()
      const newTx: Transaction = {
        id, amount: draft.amount, categoryId: draft.categoryId, note: draft.note,
        date: draft.date, type: draft.type, paymentMethod: draft.paymentMethod, recurring: draft.recurring
      }
      setTransactions(prev => {
        const next = [newTx, ...prev]
        void AsyncStorage.setItem(`@cache_transactions_${currentAccount.id}`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'transactions', 'insert', {
        id, user_id: currentAccount.id, amount: draft.amount, category_id: draft.categoryId, note: draft.note,
        date: draft.date, type: draft.type, payment_method: draft.paymentMethod, recurring: draft.recurring, updated_at: new Date().toISOString()
      })
    }

    return {
      currentAccount,
      localAppearance,
      syncStatus,
      isAuthenticated: Boolean(currentAccount),
      isReady,
      loanAgreements,
      loanPayments,
      lendingProfile,
      addTransaction,
      updateSettings,

      async signInWithGoogleIdToken(idToken) {
        if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          })
          if (error) return { ok: false, message: error.message }
          if (!data.user) return { ok: false, message: 'No user returned from Supabase.' }
          await ensureUserBootstrap(data.user)
          return { ok: true, message: 'Signed in successfully.' }
        } catch (error) {
          return { ok: false, message: getErrorMessage(error, 'Google sign-in failed.') }
        }
      },

      async signInWithGoogleOAuth() {
        if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
        try {
          const redirectUrl = AuthSession.makeRedirectUri({
            scheme: 'com.xpensetracker',
          })

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          })

          if (error) return { ok: false, message: error.message }
          if (!data?.url) return { ok: false, message: 'No authentication URL returned from Supabase.' }

          const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)
          if (res.type === 'success' && res.url) {
            const url = res.url
            // Extract parameters from fragment or query string
            const extractParam = (name: string): string | null => {
              const match = url.match(new RegExp(`[#?&]${name}=([^&#]*)`))
              return match ? decodeURIComponent(match[1]) : null
            }

            const accessToken = extractParam('access_token')
            const refreshToken = extractParam('refresh_token')

            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              if (sessionErr) return { ok: false, message: sessionErr.message }
              if (sessionData.user) await ensureUserBootstrap(sessionData.user)
              return { ok: true, message: 'Signed in successfully.' }
            }

            const code = extractParam('code')
            if (code) {
              const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
              if (codeErr) return { ok: false, message: codeErr.message }
              if (codeData.user) await ensureUserBootstrap(codeData.user)
              return { ok: true, message: 'Signed in successfully.' }
            }

            return { ok: true, message: 'Signed in successfully.' }
          } else if (res.type === 'cancel' || res.type === 'dismiss') {
            return { ok: false, message: 'Sign-in cancelled.' }
          }

          return { ok: false, message: 'Authentication was not completed.' }
        } catch (error) {
          return { ok: false, message: getErrorMessage(error, 'Google sign-in failed.') }
        }
      },

      async signInWithEmail(email, password) {
        if (!supabase) {
          return { ok: false, errorType: 'unknown', message: 'Supabase is not configured.' }
        }
        const cleanEmail = String(email || '').trim().toLowerCase()
        if (!isValidEmail(cleanEmail) || !password) {
          return {
            ok: false,
            errorType: 'validation',
            message: 'Enter a valid email address and password.',
          }
        }

        const rate = checkLoginRateLimit(cleanEmail)
        if (!rate.allowed) {
          return {
            ok: false,
            errorType: 'rate_limited',
            retryAfterSeconds: rate.retryAfterSeconds,
            message: `Too many failed attempts. Please wait ${rate.retryAfterSeconds}s before trying again.`,
          }
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })
          if (error) {
            const classified = classifyAuthError(error.message, (error as any).status)
            if (classified.errorType === 'invalid_credentials') {
              const outcome = recordLoginAttemptOutcome(cleanEmail, false)
              if (outcome.retryAfterSeconds > 0) {
                return {
                  ok: false,
                  errorType: 'rate_limited',
                  retryAfterSeconds: outcome.retryAfterSeconds,
                  message: `Incorrect password. Sign-in is paused for ${outcome.retryAfterSeconds}s to protect your account.`,
                }
              }
            }
            return { ok: false, errorType: classified.errorType, message: classified.userMessage }
          }
          if (!data.user) {
            return { ok: false, errorType: 'unknown', message: 'No user returned from authentication service.' }
          }
          recordLoginAttemptOutcome(cleanEmail, true)
          await ensureUserBootstrap(data.user)
          return { ok: true, message: 'Signed in successfully.' }
        } catch (error) {
          const classified = classifyAuthError(getErrorMessage(error, 'Sign-in failed.'))
          return { ok: false, errorType: classified.errorType, message: classified.userMessage }
        }
      },

      async signUpWithEmail(input, passwordArg) {
        if (!supabase) {
          return { ok: false, errorType: 'unknown', message: 'Supabase is not configured.' }
        }

        const payload: SignUpInput = typeof input === 'string'
          ? {
              fullName: input.split('@')[0] || 'XpenseTracker User',
              email: input,
              password: String(passwordArg || ''),
              ageBracket: 'adult_18_plus',
              acceptedLegal: true,
            }
          : input

        const cleanEmail = String(payload.email || '').trim().toLowerCase()
        const cleanName = String(payload.fullName || '').trim()
        const pw = String(payload.password || '')
        const isMinor = payload.ageBracket === 'under_18'

        if (cleanName.length < 2) {
          return { ok: false, errorType: 'validation', message: 'Please enter your full name.' }
        }
        if (!isValidEmail(cleanEmail)) {
          return { ok: false, errorType: 'validation', message: 'Please enter a valid email address.' }
        }
        const pwStrength = evaluatePasswordStrength(pw)
        if (!pwStrength.isAcceptable) {
          return { ok: false, errorType: 'validation', message: pwStrength.feedback }
        }
        if (!payload.acceptedLegal) {
          return { ok: false, errorType: 'validation', message: 'You must accept the Terms of Service and Privacy Policy.' }
        }
        if (isMinor) {
          const gName = String(payload.guardianName || '').trim()
          const gEmail = String(payload.guardianEmail || '').trim().toLowerCase()
          if (gName.length < 2 || !isValidEmail(gEmail) || gEmail === cleanEmail) {
            return {
              ok: false,
              errorType: 'validation',
              message: 'Please provide a valid parent or guardian name and distinct email address.',
            }
          }
        }

        const nowIso = new Date().toISOString()
        const guardianToken = isMinor
          ? `GC-${createId().replace(/-/g, '').slice(0, 10).toUpperCase()}`
          : undefined
        const complianceMeta: UserConsentMetadata = {
          ageBracket: payload.ageBracket,
          isMinor,
          guardianConsentStatus: isMinor ? 'pending' : 'not_required',
          guardianName: isMinor ? String(payload.guardianName || '').trim() : undefined,
          guardianEmail: isMinor ? String(payload.guardianEmail || '').trim().toLowerCase() : undefined,
          guardianConsentToken: guardianToken,
          termsVersion: TERMS_OF_SERVICE_VERSION,
          privacyVersion: PRIVACY_POLICY_VERSION,
          smsDisclosureVersion: SMS_DISCLOSURE_VERSION,
          termsAcceptedAt: nowIso,
          privacyAcceptedAt: nowIso,
          smsConsentGrantedAt: null,
          smsConsentWithdrawnAt: null,
        }

        try {
          const redirectTo = AuthSession.makeRedirectUri({ scheme: 'com.xpensetracker' })
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: pw,
            options: {
              emailRedirectTo: redirectTo,
              data: {
                full_name: cleanName,
                compliance: complianceMeta,
              },
            },
          })
          if (error) {
            const classified = classifyAuthError(error.message, (error as any).status)
            return { ok: false, errorType: classified.errorType, message: classified.userMessage }
          }
          if (!data.user) {
            return { ok: false, errorType: 'unknown', message: 'Registration could not be completed.' }
          }
          if (data.session) {
            await ensureUserBootstrap(data.user)
            return {
              ok: true,
              requiresGuardianConsent: isMinor,
              message: isMinor
                ? `Account created in restricted mode. Share code ${guardianToken} with your parent/guardian (${complianceMeta.guardianEmail}) to verify consent.`
                : 'Account created successfully.',
            }
          }
          return {
            ok: true,
            requiresEmailVerification: true,
            requiresGuardianConsent: isMinor,
            message: isMinor
              ? `Verification email sent to ${cleanEmail}. Once confirmed, your parent/guardian (${complianceMeta.guardianEmail}) must verify consent using code ${guardianToken}.`
              : `Check ${cleanEmail} for your confirmation link to activate your account.`,
          }
        } catch (error) {
          const classified = classifyAuthError(getErrorMessage(error, 'Sign-up failed.'))
          return { ok: false, errorType: classified.errorType, message: classified.userMessage }
        }
      },

      async requestPasswordReset(email) {
        if (!supabase) {
          return { ok: false, errorType: 'unknown', message: 'Supabase is not configured.' }
        }
        const cleanEmail = String(email || '').trim().toLowerCase()
        if (!isValidEmail(cleanEmail)) {
          return { ok: false, errorType: 'validation', message: 'Enter a valid email address.' }
        }
        try {
          const redirectTo = AuthSession.makeRedirectUri({ scheme: 'com.xpensetracker' })
          const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo })
          if (error) {
            const classified = classifyAuthError(error.message, (error as any).status)
            if (classified.errorType === 'network' || classified.errorType === 'rate_limited') {
              return { ok: false, errorType: classified.errorType, message: classified.userMessage }
            }
          }
          // Non-enumerating confirmation response regardless of whether an account matches cleanEmail
          return {
            ok: true,
            message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
          }
        } catch (error) {
          const classified = classifyAuthError(getErrorMessage(error, 'Password reset failed.'))
          if (classified.errorType === 'network') {
            return { ok: false, errorType: 'network', message: classified.userMessage }
          }
          return {
            ok: true,
            message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
          }
        }
      },

      async verifyGuardianConsentCode(token, guardianEmail, decision = 'verified') {
        if (!supabase || !currentAccount) return { ok: false, message: 'Not signed in.' }
        const cleanToken = String(token || '').trim()
        const cleanEmail = String(guardianEmail || '').trim().toLowerCase()
        if (!cleanToken || !isValidEmail(cleanEmail)) {
          return { ok: false, message: 'Enter the verification code and guardian email address.' }
        }

        // First try server-side verified RPC if migration is installed
        try {
          const { data, error } = await supabase.rpc('verify_guardian_consent', {
            p_token: cleanToken,
            p_guardian_email: cleanEmail,
            p_decision: decision,
          })
          if (!error && data && typeof data === 'object' && 'ok' in data) {
            if ((data as any).ok) {
              await updateSettings({
                smsTransactionDetection: decision === 'revoked' ? false : currentAccount.settings.smsTransactionDetection,
                compliance: {
                  ...currentAccount.settings.compliance,
                  guardianConsentStatus: decision,
                },
              })
            }
            return { ok: Boolean((data as any).ok), message: String((data as any).message || 'Processed.') }
          }
        } catch {
          // Fallback to local verified comparison if RPC isn't deployed yet
        }

        const expectedToken = currentAccount.settings.compliance?.guardianConsentToken
        const expectedEmail = String(currentAccount.settings.compliance?.guardianEmail || '').toLowerCase()
        if (expectedToken && expectedEmail && cleanToken === expectedToken && cleanEmail === expectedEmail) {
          await updateSettings({
            smsTransactionDetection: decision === 'revoked' ? false : currentAccount.settings.smsTransactionDetection,
            compliance: {
              ...currentAccount.settings.compliance,
              guardianConsentStatus: decision,
            },
          })
          return {
            ok: true,
            message: decision === 'verified'
              ? 'Guardian consent verified. Full features are now unlocked.'
              : 'Guardian consent revoked. Automated tracking is disabled.',
          }
        }
        return { ok: false, message: 'Token or guardian email did not match our records.' }
      },

      async submitPrivacyRequest(requestType, details = '') {
        if (!supabase || !currentAccount) return { ok: false, message: 'Not signed in.' }
        const ref = `DSAR-${createId().replace(/-/g, '').slice(0, 8).toUpperCase()}`
        try {
          const { error } = await supabase.from('privacy_requests').insert({
            user_id: currentAccount.id,
            request_type: requestType,
            contact_email: currentAccount.settings.email,
            reference_code: ref,
            status: 'submitted',
            details: details.slice(0, 1500),
          })
          if (error) {
            return {
              ok: true,
              referenceCode: ref,
              message: `Request recorded locally (${ref}). You can also email support@xpensetracker.app citing this reference.`,
            }
          }
          return {
            ok: true,
            referenceCode: ref,
            message: `Privacy request ${ref} submitted under Kenya Data Protection Act, 2019.`,
          }
        } catch {
          return {
            ok: true,
            referenceCode: ref,
            message: `Request recorded (${ref}). Contact support@xpensetracker.app with this reference if offline.`,
          }
        }
      },

      async withdrawSmsConsent() {
        if (!currentAccount) return
        const uid = currentAccount.id
        const nowIso = new Date().toISOString()
        await updateSettings({
          smsTransactionDetection: false,
          compliance: {
            ...currentAccount.settings.compliance,
            smsConsentWithdrawnAt: nowIso,
          },
        })
        await syncSmsExpenseCaptureConfiguration(null)
        await AsyncStorage.multiRemove([
          `@pendingSmsDetections_${uid}`,
          `@processedSmsFingerprints_${uid}`,
        ]).catch(() => {})
        if (supabase) {
          try {
            await supabase.from('user_consents').upsert(
              {
                user_id: uid,
                sms_consent_withdrawn_at: nowIso,
                updated_at: nowIso,
              },
              { onConflict: 'user_id' },
            )
          } catch {
            // best-effort when migration hasn't been deployed
          }
        }
      },

      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
      },

      async updateTransaction(transactionId, draft) {
        if (!currentAccount || !supabase) return
        setTransactions(prev => {
          const next = prev.map(t => t.id === transactionId ? { ...t, amount: draft.amount, categoryId: draft.categoryId, note: draft.note, date: draft.date, type: draft.type, paymentMethod: draft.paymentMethod, recurring: draft.recurring } : t)
          void AsyncStorage.setItem(`@cache_transactions_${currentAccount.id}`, JSON.stringify(next))
          return next
        })
        await pushMutation(currentAccount.id, 'transactions', 'update', {
          amount: draft.amount, category_id: draft.categoryId, note: draft.note, date: draft.date, type: draft.type, payment_method: draft.paymentMethod, recurring: draft.recurring, updated_at: new Date().toISOString()
        }, 'id', transactionId)
      },

      async deleteTransaction(transactionId) {
        if (!currentAccount || !supabase) return
        setTransactions(prev => {
          const next = prev.filter(t => t.id !== transactionId)
          void AsyncStorage.setItem(`@cache_transactions_${currentAccount.id}`, JSON.stringify(next))
          return next
        })
        await pushMutation(currentAccount.id, 'transactions', 'delete', {}, 'id', transactionId)
      },

      async addCategory(draft) {
        if (!currentAccount || !supabase) return
        const id = createId()
        const newCat: Category = { id, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, order: currentAccount.categories.length }
        setCategories(prev => {
          const next = [...prev, newCat]
          void AsyncStorage.setItem(`@cache_categories_${currentAccount.id}`, JSON.stringify(next))
          return next
        })
        await pushMutation(currentAccount.id, 'categories', 'insert', {
          id, user_id: currentAccount.id, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, order: newCat.order, updated_at: new Date().toISOString()
        })
      },

      async updateCategory(categoryId, draft) {
        if (!currentAccount || !supabase) return
        setCategories(prev => {
          const next = prev.map(c => c.id === categoryId ? { ...c, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type } : c)
          void AsyncStorage.setItem(`@cache_categories_${currentAccount.id}`, JSON.stringify(next))
          return next
        })
        await pushMutation(currentAccount.id, 'categories', 'update', {
          name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, updated_at: new Date().toISOString()
        }, 'id', categoryId)
      },

      async deleteCategory(categoryId) {
        if (!currentAccount) return { ok: false, message: 'No active account.' }
        if (!supabase) return { ok: false, message: 'Database connection is missing.' }

        const inUse = currentAccount.transactions.some((tx) => tx.categoryId === categoryId)
        if (inUse) {
          return {
            ok: false,
            message: 'This category is used in existing transactions. Delete or reassign those transactions first.',
          }
        }

        try {
          setCategories(prev => {
            const next = prev.filter(c => c.id !== categoryId)
            void AsyncStorage.setItem(`@cache_categories_${currentAccount.id}`, JSON.stringify(next))
            return next
          })
          await pushMutation(currentAccount.id, 'categories', 'delete', {}, 'id', categoryId)
          return { ok: true, message: 'Category deleted.' }
        } catch (error) {
          return { ok: false, message: 'Failed to delete category: ' + getErrorMessage(error, 'Unknown error') }
        }
      },

      async reorderCategories(orderedIds) {
        if (!currentAccount || !supabase) return
        try {
          await Promise.all(
            orderedIds.map((id, index) =>
              supabase!
                .from('categories')
                .update({ order: index, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', currentAccount.id),
            ),
          )
        } catch (error) {
          console.error('Failed to reorder categories:', error)
        }
      },

      async setAppearance(settings) {
        const base = mergeAppearanceSafely(localAppearance, currentAccount?.settings.appearance) ?? DEFAULT_APPEARANCE
        const nextAppearance = normalizeAppearance({
          ...base,
          ...settings,
          updatedAt: new Date().toISOString(),
        })
        setLocalAppearance(nextAppearance)
        void AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(nextAppearance))
        if (!currentAccount) return
        await updateSettings({
          appearance: nextAppearance,
        })
      },

      async resetAppearance() {
        const nextAppearance: AppearanceSettings = {
          ...DEFAULT_APPEARANCE,
          updatedAt: new Date().toISOString(),
        }
        setLocalAppearance(nextAppearance)
        void AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(nextAppearance))
        if (!currentAccount) return
        await updateSettings({
          appearance: nextAppearance,
        })
      },

      async retrySync() {
        if (!currentAccount) {
          return { ok: false, remaining: 0, message: 'Sign in to sync your cloud data.' }
        }
        const net = await NetInfo.fetch()
        const online = Boolean(net.isConnected && net.isInternetReachable !== false)
        setSyncStatus((prev) => ({ ...prev, isOnline: online }))
        if (!online) {
          const count = await getSyncQueueCount(currentAccount.id)
          return {
            ok: false,
            remaining: count,
            message: 'Device is offline. Changes remain safely stored locally until connection returns.',
          }
        }
        const res = await processSyncQueue(currentAccount.id)
        const [remainingCount, lastAt] = await Promise.all([
          getSyncQueueCount(currentAccount.id),
          getLastSyncedAt(currentAccount.id),
        ])
        setSyncStatus({ isOnline: true, pendingCount: remainingCount, lastSyncedAt: lastAt })
        if (remainingCount === 0) {
          return {
            ok: true,
            remaining: 0,
            message: res.processed > 0 ? `Synced ${res.processed} queued change(s) to cloud.` : 'Everything is up to date.',
          }
        }
        return {
          ok: false,
          remaining: remainingCount,
          message: `${remainingCount} change(s) still waiting to sync. Will retry automatically.`,
        }
      },

      async setLendingEnabled(enabled) {
        if (!currentAccount) return
        await updateSettings({
          lending: { enabled },
        })
      },

      async deleteAccount() {
        if (!supabase || !currentAccount) return { ok: false, message: 'Not ready' }
        const uid = currentAccount.id
        try {
          const { error } = await supabase.rpc('delete_user')
          if (error) throw error
          await syncSmsExpenseCaptureConfiguration(null)
          await AsyncStorage.multiRemove([
            `@cache_userDoc_${uid}`,
            `@cache_categories_${uid}`,
            `@cache_transactions_${uid}`,
            `@cache_agreements_${uid}`,
            `@cache_payments_${uid}`,
            `@cache_lending_profile_${uid}`,
            `@pendingSmsDetections_${uid}`,
            `@processedSmsFingerprints_${uid}`,
            `@syncQueue_${uid}`,
            `@lastSyncedAt_${uid}`,
            '@xpensetracker_biometric_lock',
          ]).catch(() => {})
          await supabase.auth.signOut()
          return { ok: true, message: 'Your account and associated records have been permanently deleted.' }
        } catch (err) {
          return { ok: false, message: getErrorMessage(err, 'Failed to delete account') }
        }
      },

      // ── Lending & Borrowing Actions ──────────────────────────────────────────

      async addLoanAgreement(draft) {
        if (!currentAccount || !supabase) throw new Error('Not authenticated')
        const id = createId()
        const agreementRef = draft.agreementReference || generateAgreementReference(draft.direction)
        const now = new Date().toISOString()
        const newAgreement: LoanAgreement = {
          id,
          userId: currentAccount.id,
          agreementReference: agreementRef,
          direction: draft.direction,
          agreementCategory: draft.agreementCategory || 'casual',
          relationship: draft.relationship || (draft.agreementCategory === 'casual' ? 'Friend' : undefined),
          counterpartyName: draft.counterpartyName,
          counterpartyPhone: draft.counterpartyPhone || '',
          counterpartyEmail: draft.counterpartyEmail || '',
          principalAmount: Number(draft.principalAmount) || 0,
          currencyCode: draft.currencyCode || currentAccount.settings.currency || 'KES',
          agreementDate: draft.agreementDate || now,
          dueDate: draft.dueDate,
          repaymentFrequency: draft.repaymentFrequency || 'one_time',
          interestType: draft.interestType || 'none',
          agreedInterestAmount: Number(draft.agreedInterestAmount) || 0,
          interestRate: draft.interestRate,
          interestCalculationPeriod: draft.interestCalculationPeriod,
          penaltyType: draft.penaltyType || 'none',
          penaltyRate: Number(draft.penaltyRate) || 0,
          penaltyAmount: Number(draft.penaltyAmount) || 0,
          penaltyGraceDays: Number(draft.penaltyGraceDays) || 0,
          notes: draft.notes || '',
          status: draft.status || 'active',
          createdAt: now,
          updatedAt: now,
        }

        setLoanAgreements(prev => {
          const next = [newAgreement, ...prev]
          void AsyncStorage.setItem(`@cache_agreements_${currentAccount.id}`, JSON.stringify(next))
          return next
        })

        await pushMutation(currentAccount.id, 'loan_agreements', 'insert', {
          id,
          user_id: currentAccount.id,
          agreement_reference: newAgreement.agreementReference,
          direction: newAgreement.direction,
          agreement_category: newAgreement.agreementCategory || 'casual',
          relationship: newAgreement.agreementCategory === 'casual' ? (newAgreement.relationship || 'Friend') : null,
          counterparty_name: newAgreement.counterpartyName,
          counterparty_phone: newAgreement.counterpartyPhone || '',
          counterparty_email: newAgreement.counterpartyEmail || '',
          principal_amount: newAgreement.principalAmount,
          currency_code: newAgreement.currencyCode,
          agreement_date: newAgreement.agreementDate,
          due_date: newAgreement.dueDate || null,
          repayment_frequency: newAgreement.repaymentFrequency,
          interest_type: newAgreement.interestType,
          agreed_interest_amount: newAgreement.agreedInterestAmount,
          interest_rate: newAgreement.interestRate ?? null,
          interest_calculation_period: newAgreement.interestCalculationPeriod || null,
          penalty_type: newAgreement.penaltyType,
          penalty_rate: newAgreement.penaltyRate,
          penalty_amount: newAgreement.penaltyAmount,
          penalty_grace_days: newAgreement.penaltyGraceDays,
          notes: newAgreement.notes || '',
          status: newAgreement.status,
          created_at: newAgreement.createdAt,
          updated_at: newAgreement.updatedAt,
        })

        await pushMutation(currentAccount.id, 'loan_activity', 'insert', {
          id: createId(),
          user_id: currentAccount.id,
          agreement_id: id,
          event_type: 'agreement_created',
          description: `Created agreement ${newAgreement.agreementReference} with ${newAgreement.counterpartyName}`,
          new_values: newAgreement,
          created_at: now,
        })

        return newAgreement
      },

      async updateLoanAgreement(id, patch) {
        if (!currentAccount || !supabase) return
        const now = new Date().toISOString()
        const safePatch = { ...patch }
        delete (safePatch as Partial<LoanAgreement>).agreementCategory
        setLoanAgreements(prev => {
          const next = prev.map(a => a.id === id ? { ...a, ...safePatch, updatedAt: now } : a)
          void AsyncStorage.setItem(`@cache_agreements_${currentAccount.id}`, JSON.stringify(next))
          return next
        })

        const dbPatch: Record<string, unknown> = { updated_at: now }
        if (safePatch.direction !== undefined) dbPatch.direction = safePatch.direction
        if (safePatch.relationship !== undefined) dbPatch.relationship = safePatch.relationship
        if (safePatch.counterpartyName !== undefined) dbPatch.counterparty_name = safePatch.counterpartyName
        if (safePatch.counterpartyPhone !== undefined) dbPatch.counterparty_phone = safePatch.counterpartyPhone
        if (safePatch.counterpartyEmail !== undefined) dbPatch.counterparty_email = safePatch.counterpartyEmail
        if (safePatch.principalAmount !== undefined) dbPatch.principal_amount = safePatch.principalAmount
        if (safePatch.currencyCode !== undefined) dbPatch.currency_code = safePatch.currencyCode
        if (safePatch.agreementDate !== undefined) dbPatch.agreement_date = safePatch.agreementDate
        if (safePatch.dueDate !== undefined) dbPatch.due_date = safePatch.dueDate
        if (safePatch.repaymentFrequency !== undefined) dbPatch.repayment_frequency = safePatch.repaymentFrequency
        if (safePatch.interestType !== undefined) dbPatch.interest_type = safePatch.interestType
        if (safePatch.agreedInterestAmount !== undefined) dbPatch.agreed_interest_amount = safePatch.agreedInterestAmount
        if (safePatch.interestRate !== undefined) dbPatch.interest_rate = safePatch.interestRate
        if (safePatch.interestCalculationPeriod !== undefined) dbPatch.interest_calculation_period = safePatch.interestCalculationPeriod
        if (safePatch.notes !== undefined) dbPatch.notes = safePatch.notes
        if (safePatch.status !== undefined) dbPatch.status = safePatch.status
        if (safePatch.penaltyType !== undefined) dbPatch.penalty_type = safePatch.penaltyType
        if (safePatch.penaltyRate !== undefined) dbPatch.penalty_rate = safePatch.penaltyRate
        if (safePatch.penaltyAmount !== undefined) dbPatch.penalty_amount = safePatch.penaltyAmount
        if (safePatch.penaltyGraceDays !== undefined) dbPatch.penalty_grace_days = safePatch.penaltyGraceDays

        await pushMutation(currentAccount.id, 'loan_agreements', 'update', dbPatch, 'id', id)
      },

      async archiveLoanAgreement(id) {
        if (!currentAccount || !supabase) return
        const now = new Date().toISOString()
        setLoanAgreements(prev => {
          const next = prev.map(a => a.id === id ? { ...a, archivedAt: now, status: 'settled' as LoanStatus, updatedAt: now } : a)
          void AsyncStorage.setItem(`@cache_agreements_${currentAccount.id}`, JSON.stringify(next))
          return next
        })

        await pushMutation(currentAccount.id, 'loan_agreements', 'update', {
          archived_at: now,
          status: 'settled',
          updated_at: now,
        }, 'id', id)
      },

      async addLoanPayment(draft) {
        if (!currentAccount || !supabase) return
        const id = createId()
        const now = new Date().toISOString()
        const idempotencyKey = draft.idempotencyKey || generatePaymentIdempotencyKey(draft.agreementId, Date.now())

        const newPayment: LoanPayment = {
          id,
          userId: currentAccount.id,
          agreementId: draft.agreementId,
          idempotencyKey,
          amount: Number(draft.amount) || 0,
          penaltyComponent: Number(draft.penaltyComponent) || 0,
          principalComponent: Number(draft.principalComponent) || 0,
          interestComponent: Number(draft.interestComponent) || 0,
          paymentDate: draft.paymentDate || now,
          paymentMethod: draft.paymentMethod || 'UPI',
          referenceNumber: draft.referenceNumber || '',
          notes: draft.notes || '',
          createdAt: now,
          createdBy: currentAccount.id,
        }

        setLoanPayments(prev => {
          if (prev.some(p => p.idempotencyKey === idempotencyKey)) return prev
          const next = [newPayment, ...prev]
          void AsyncStorage.setItem(`@cache_payments_${currentAccount.id}`, JSON.stringify(next))
          return next
        })

        // Update agreement status if needed
        const agreement = loanAgreements.find(a => a.id === draft.agreementId)
        if (agreement) {
          const allPayments = [newPayment, ...loanPayments.filter(p => p.agreementId === agreement.id)]
          const balances = calculateAgreementBalances(agreement, allPayments)
          if (balances.derivedStatus !== agreement.status) {
            setLoanAgreements(prev => {
              const next = prev.map(a => a.id === agreement.id ? { ...a, status: balances.derivedStatus, updatedAt: now } : a)
              void AsyncStorage.setItem(`@cache_agreements_${currentAccount.id}`, JSON.stringify(next))
              return next
            })
            await pushMutation(currentAccount.id, 'loan_agreements', 'update', {
              status: balances.derivedStatus,
              updated_at: now,
            }, 'id', agreement.id)
          }

          // Section 6.1: Record interest as transaction if applicable
          if (draft.interestComponent && draft.interestComponent > 0) {
            const targetType = agreement.direction === 'lent' ? 'income' : 'expense'
            const matchingCat = currentAccount.categories.find(c => c.type === targetType)
            if (matchingCat) {
              void addTransaction({
                amount: draft.interestComponent,
                categoryId: matchingCat.id,
                note: `Interest for ${agreement.agreementReference} (${agreement.counterpartyName})`,
                date: draft.paymentDate || now,
                type: targetType,
                paymentMethod: draft.paymentMethod || 'UPI',
                recurring: false,
              })
            }
          }

          // Record penalty as transaction if applicable
          if (newPayment.penaltyComponent > 0) {
            const targetType = agreement.direction === 'lent' ? 'income' : 'expense'
            const matchingCat = currentAccount.categories.find(c => c.type === targetType)
            if (matchingCat) {
              void addTransaction({
                amount: newPayment.penaltyComponent,
                categoryId: matchingCat.id,
                note: `Late Penalty for ${agreement.agreementReference} (${agreement.counterpartyName})`,
                date: draft.paymentDate || now,
                type: targetType,
                paymentMethod: draft.paymentMethod || 'UPI',
                recurring: false,
              })
            }
          }
        }

        await pushMutation(currentAccount.id, 'loan_payments', 'insert', {
          id,
          user_id: currentAccount.id,
          agreement_id: newPayment.agreementId,
          idempotency_key: newPayment.idempotencyKey,
          amount: newPayment.amount,
          penalty_component: newPayment.penaltyComponent,
          principal_component: newPayment.principalComponent,
          interest_component: newPayment.interestComponent,
          payment_date: newPayment.paymentDate,
          payment_method: newPayment.paymentMethod,
          reference_number: newPayment.referenceNumber,
          notes: newPayment.notes,
          created_at: newPayment.createdAt,
          created_by: newPayment.createdBy,
        })

        await pushMutation(currentAccount.id, 'loan_activity', 'insert', {
          id: createId(),
          user_id: currentAccount.id,
          agreement_id: draft.agreementId,
          event_type: 'payment_recorded',
          description: `Recorded payment of ${newPayment.amount} (Principal: ${newPayment.principalComponent}, Interest: ${newPayment.interestComponent})`,
          new_values: newPayment,
          created_at: now,
        })
      },

      async reverseLoanPayment(paymentId, reason) {
        if (!currentAccount || !supabase) return
        const payment = loanPayments.find(p => p.id === paymentId)
        if (!payment) return

        setLoanPayments(prev => {
          const next = prev.filter(p => p.id !== paymentId)
          void AsyncStorage.setItem(`@cache_payments_${currentAccount.id}`, JSON.stringify(next))
          return next
        })

        await pushMutation(currentAccount.id, 'loan_payments', 'delete', {}, 'id', paymentId)

        await pushMutation(currentAccount.id, 'loan_activity', 'insert', {
          id: createId(),
          user_id: currentAccount.id,
          agreement_id: payment.agreementId,
          event_type: 'payment_reversed',
          description: `Reversed payment of ${payment.amount}. Reason: ${reason}`,
          previous_values: payment,
          created_at: new Date().toISOString(),
        })
      },

      async updateLendingProfile(patch) {
        if (!currentAccount || !supabase) return
        const now = new Date().toISOString()
        const nextProfile: LendingProfile = {
          id: lendingProfile?.id || createId(),
          userId: currentAccount.id,
          profileType: patch.profileType || lendingProfile?.profileType || 'individual',
          companyName: patch.companyName !== undefined ? patch.companyName : lendingProfile?.companyName,
          ownerName: patch.ownerName !== undefined ? patch.ownerName : lendingProfile?.ownerName,
          mobileNumber: patch.mobileNumber !== undefined ? patch.mobileNumber : lendingProfile?.mobileNumber,
          emailAddress: patch.emailAddress !== undefined ? patch.emailAddress : lendingProfile?.emailAddress,
          officeAddress: patch.officeAddress !== undefined ? patch.officeAddress : lendingProfile?.officeAddress,
          businessIdentifier: patch.businessIdentifier !== undefined ? patch.businessIdentifier : lendingProfile?.businessIdentifier,
          logoPath: patch.logoPath !== undefined ? patch.logoPath : lendingProfile?.logoPath,
          createdAt: lendingProfile?.createdAt || now,
          updatedAt: now,
        }

        setLendingProfile(nextProfile)
        void AsyncStorage.setItem(`@cache_lending_profile_${currentAccount.id}`, JSON.stringify(nextProfile))

        if (lendingProfile?.id) {
          await pushMutation(currentAccount.id, 'lending_profiles', 'update', {
            profile_type: nextProfile.profileType,
            company_name: nextProfile.companyName,
            owner_name: nextProfile.ownerName,
            mobile_number: nextProfile.mobileNumber,
            email_address: nextProfile.emailAddress,
            office_address: nextProfile.officeAddress,
            business_identifier: nextProfile.businessIdentifier,
            logo_path: nextProfile.logoPath,
            updated_at: now,
          }, 'id', lendingProfile.id)
        } else {
          await pushMutation(currentAccount.id, 'lending_profiles', 'insert', {
            id: nextProfile.id,
            user_id: currentAccount.id,
            profile_type: nextProfile.profileType,
            company_name: nextProfile.companyName,
            owner_name: nextProfile.ownerName,
            mobile_number: nextProfile.mobileNumber,
            email_address: nextProfile.emailAddress,
            office_address: nextProfile.officeAddress,
            business_identifier: nextProfile.businessIdentifier,
            logo_path: nextProfile.logoPath,
            created_at: now,
            updated_at: now,
          })
        }
      },
    }
  }, [currentAccount, isReady, lendingProfile, loanAgreements, loanPayments, localAppearance, supabaseUser, syncStatus, userDoc]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
