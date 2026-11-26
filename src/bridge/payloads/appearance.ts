import type { Account } from '../../types'
import { APP_VERSION } from '../../lib/appVersion'
import { getPaletteSwatches, resolveAppearance } from '../../lib/appearance'
import type { DynamicColorPayload } from '../../native/dynamicColor'

export function buildAppearancePayload(account?: Account, params?: Record<string, string>) {
  let dynamicPayload: DynamicColorPayload | null = null
  try {
    if (params?._dynamicPaletteJson) {
      dynamicPayload = JSON.parse(params._dynamicPaletteJson) as DynamicColorPayload
    }
  } catch {
    dynamicPayload = null
  }

  let syncMeta = {
    isOnline: true,
    pendingCount: 0,
    lastSyncedAt: undefined as string | undefined,
  }
  try {
    if (params?._syncMetaJson) {
      syncMeta = { ...syncMeta, ...JSON.parse(params._syncMetaJson) }
    }
  } catch {
    // keep default
  }

  const systemScheme: 'light' | 'dark' =
    params?._systemColorScheme === 'dark'
      ? 'dark'
      : params?._colorScheme === 'dark'
        ? 'dark'
        : 'light'

  const resolved = resolveAppearance(account?.settings.appearance, systemScheme, dynamicPayload)
  const swatches = getPaletteSwatches(dynamicPayload)

  return {
    style: resolved.style,
    colorScheme: resolved.colorScheme,
    resolvedColorScheme: resolved.resolvedColorScheme,
    pureBlack: resolved.pureBlackPreference,
    pureBlackActive: resolved.pureBlackActive,
    colorTheme: resolved.colorTheme,
    effectivePaletteId: resolved.effectivePaletteId,
    reducedMotion: resolved.reducedMotion,
    dynamicWallpaperSupported: resolved.dynamicWallpaperSupported,
    dynamicWallpaperReason: resolved.dynamicWallpaperReason,
    swatches,
    currency: account?.settings.currency || 'KES',
    monthlyBudget: account?.settings.budgetConfigured ? account?.settings.monthlyBudget || 0 : 0,
    budgetConfigured: Boolean(account?.settings.budgetConfigured),
    categoriesCount: account?.categories?.length || 0,
    lendingEnabled: Boolean(account?.settings.lending?.enabled),
    smsTransactionDetection: Boolean(account?.settings.smsTransactionDetection),
    biometricLock: Boolean(account?.settings.biometricLock),
    fullName: account?.settings.fullName || '',
    email: account?.settings.email || '',
    syncStatus: syncMeta,
    appVersion: APP_VERSION,
  }
}
