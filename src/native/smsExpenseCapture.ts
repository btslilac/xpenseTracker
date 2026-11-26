import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, type Permission } from 'react-native'
import type { Account, TransactionDraft } from '../types'
import { getCategoryAppearance } from '../lib/categoryAppearance'
import type { NativeCapturedSmsEvent } from '../lib/sms/smsParser.types'

type CaptureCategoryConfig = {
  id: string
  name: string
  icon: string
  background: string
  foreground: string
}

export type PendingCapturedExpense = TransactionDraft & {
  id: string
  userId: string
  sourceBody?: string
}

type SmsExpenseCaptureNativeModule = {
  configure(configJson: string): Promise<void>
  clearConfiguration(): Promise<void>
  getPendingTransactions(): Promise<string>
  scanRecentInboxTransactions?(): Promise<string>
  removePendingTransactions(ids: string[]): Promise<void>
  hasSmsPermission?(): Promise<boolean>
  hasOverlayPermission(): Promise<boolean>
  hasNotificationAccess(): Promise<boolean>
  openOverlayPermissionSettings(): Promise<void>
  openNotificationAccessSettings(): Promise<void>
}

const nativeModule = Platform.OS === 'android'
  ? (NativeModules.SmsExpenseCapture as SmsExpenseCaptureNativeModule | undefined)
  : undefined

const eventEmitter = nativeModule ? new NativeEventEmitter(NativeModules.SmsExpenseCapture) : null

export function isSmsExpenseCaptureAvailable() {
  return Platform.OS === 'android' && Boolean(nativeModule)
}

export async function syncSmsExpenseCaptureConfiguration(account: Account | null) {
  if (!nativeModule) {
    return
  }

  if (!account) {
    await nativeModule.clearConfiguration()
    return
  }

  const categories: CaptureCategoryConfig[] = account.categories
    .filter((category) => category.type === 'expense')
    .sort((left, right) => left.order - right.order)
    .map((category) => ({
      ...getCategoryAppearance(category),
      id: category.id,
      name: category.name,
    }))

  await nativeModule.configure(
    JSON.stringify({
      userId: account.id,
      enabled: Boolean(account.settings.smsTransactionDetection),
      categories,
    }),
  )
}

export async function getPendingSmsEvents(): Promise<NativeCapturedSmsEvent[]> {
  if (!nativeModule) {
    return []
  }

  try {
    const raw = await nativeModule.getPendingTransactions()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is NativeCapturedSmsEvent =>
        Boolean(item && typeof item.id === 'string' && typeof item.sender === 'string' && typeof item.rawBody === 'string')
    )
  } catch {
    return []
  }
}

export async function scanRecentInboxSmsEvents(): Promise<NativeCapturedSmsEvent[]> {
  if (!nativeModule || typeof nativeModule.scanRecentInboxTransactions !== 'function') {
    return []
  }

  try {
    const raw = await nativeModule.scanRecentInboxTransactions()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is NativeCapturedSmsEvent =>
        Boolean(item && typeof item.id === 'string' && typeof item.sender === 'string' && typeof item.rawBody === 'string')
    )
  } catch {
    return []
  }
}

export async function removePendingSmsEvents(ids: string[]) {
  if (!nativeModule || ids.length === 0) {
    return
  }
  await nativeModule.removePendingTransactions(ids)
}

// Legacy alias kept for compatibility
export async function getPendingCapturedExpenses(): Promise<PendingCapturedExpense[]> {
  return []
}

export async function removePendingCapturedExpenses(ids: string[]) {
  await removePendingSmsEvents(ids)
}

export async function checkSmsPermissionsSilently(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false
  }
  try {
    const receiveCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS)
    const readCheck = 'READ_SMS' in PermissionsAndroid.PERMISSIONS
      ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS)
      : true
    return receiveCheck && readCheck
  } catch {
    return false
  }
}

export async function ensureSmsPermission() {
  if (Platform.OS !== 'android') {
    return true
  }

  const permissions: Permission[] = [PermissionsAndroid.PERMISSIONS.RECEIVE_SMS]
  if (PermissionsAndroid.PERMISSIONS.READ_SMS) {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_SMS)
  }

  const checks = await Promise.all(permissions.map((permission) => PermissionsAndroid.check(permission)))
  if (checks.every(Boolean)) {
    return true
  }

  const result = await PermissionsAndroid.requestMultiple(permissions)
  return permissions.every((permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED)
}

export async function hasOverlayPermission() {
  if (!nativeModule) {
    return false
  }
  return nativeModule.hasOverlayPermission()
}

export async function hasNotificationAccess() {
  if (!nativeModule) {
    return false
  }
  return nativeModule.hasNotificationAccess()
}

export async function openOverlayPermissionSettings() {
  if (!nativeModule) {
    return
  }
  await nativeModule.openOverlayPermissionSettings()
}

export async function openNotificationAccessSettings() {
  if (!nativeModule) {
    return
  }
  await nativeModule.openNotificationAccessSettings()
}

export function addPendingExpenseListener(listener: () => void) {
  if (!eventEmitter) {
    return () => { }
  }

  const subscription = eventEmitter.addListener('SmsExpenseCapturePendingChanged', listener)
  return () => subscription.remove()
}
