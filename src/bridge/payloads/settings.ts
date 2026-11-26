import type { Account } from '../../types'
import { APP_BUILD_NUMBER, APP_VERSION } from '../../lib/appVersion'

export function buildProfilePayload(account?: Account) {
  if (!account) {
    return {}
  }

  const appearance = account.settings.appearance
  return {
    fullName: account.settings.fullName,
    email: account.settings.email,
    phoneNumber: account.settings.phoneNumber || '',
    dob: account.settings.dob || '',
    lendingEnabled: Boolean(account.settings.lending?.enabled),
    smsTransactionDetection: Boolean(account.settings.smsTransactionDetection),
    biometricLock: Boolean(account.settings.biometricLock),
    currency: account.settings.currency || 'KES',
    appearanceStyle: appearance?.style === 'material' || appearance?.style === 'material-expressive' ? 'Material 3 Expressive' : 'Liquid Glass',
    appearanceScheme: appearance?.colorScheme || 'system',
    appearanceTheme: appearance?.colorTheme || 'concept',
    appearancePureBlack: Boolean(appearance?.pureBlack),
    appVersion: APP_VERSION,
    buildNumber: APP_BUILD_NUMBER,
  }
}

export function buildBudgetPayload(account?: Account) {
  if (!account) {
    return {}
  }

  return {
    monthlyBudget: account.settings.budgetConfigured ? account.settings.monthlyBudget : 0,
    budgetConfigured: account.settings.budgetConfigured ?? false,
    categories: account.categories || [],
    categoryBudgets: account.settings.categoryBudgets || [],
  }
}

export function buildNotificationsPayload(account?: Account, params?: Record<string, string>) {
  return {
    ...(account?.settings.notifications ?? {}),
    smsTransactionDetection: Boolean(account?.settings.smsTransactionDetection),
    osPermissions: {
      notificationsGranted: params?._notifGranted === 'true',
      smsGranted: params?._smsGranted === 'true',
      notificationListenerGranted: params?._listenerGranted === 'true',
      platform: params?._platform || 'android',
    },
  }
}
