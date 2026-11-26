import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LoanAgreement, LoanPayment } from '../types'
import { calculateAgreementBalances } from './lendingFinance'
import { formatCurrency } from './finance'

const STORAGE_KEY_LAST_NOTIF_DATE = '@xpense_loan_notif_last_date'
const NOTIFICATION_CHANNEL_ID = 'loan-reminders'

// Configure global notification presentation for foreground and background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
})

/**
 * Initializes notification permissions and Android channels.
 */
export async function initLoanNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Loan & Overdue Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4f46e5',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    return finalStatus === 'granted'
  } catch (error) {
    console.warn('[LoanNotifications] Initialization error:', error)
    return false
  }
}

export type LoanNotificationSummary = {
  overdueCount: number
  dueThisWeekCount: number
  notificationsPushed: number
}

/**
 * Evaluates all loan agreements and pushes device notifications for:
 * 1. Overdue loans
 * 2. Loans due this week (within next 7 days)
 *
 * @param agreements Active loan agreements
 * @param payments Payment history
 * @param currency Display currency
 * @param forcePush Bypass once-per-day throttle
 */
export async function checkAndPushLoanNotifications(
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = [],
  currency = 'KES',
  forcePush = false
): Promise<LoanNotificationSummary> {
  const summary: LoanNotificationSummary = {
    overdueCount: 0,
    dueThisWeekCount: 0,
    notificationsPushed: 0,
  }

  try {
    const hasPermission = await initLoanNotifications()
    if (!hasPermission) {
      console.log('[LoanNotifications] Notification permissions not granted, skipping.')
      return summary
    }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    if (!forcePush) {
      const lastNotifiedDate = await AsyncStorage.getItem(STORAGE_KEY_LAST_NOTIF_DATE)
      if (lastNotifiedDate === todayStr) {
        // Already notified today, prevent duplicate pushes
        return summary
      }
    }

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const endOfWeek = new Date(now.getTime() + oneWeekMs)

    const overdueList: Array<{ agreement: LoanAgreement; remaining: number; dueDateStr: string }> = []
    const dueThisWeekList: Array<{ agreement: LoanAgreement; remaining: number; dueDateStr: string }> = []

    for (const agreement of agreements) {
      if (agreement.archivedAt || agreement.status === 'settled' || !agreement.dueDate) {
        continue
      }

      const balances = calculateAgreementBalances(agreement, payments)
      if (balances.isSettled || balances.totalRemaining <= 0) {
        continue
      }

      const dueDate = new Date(agreement.dueDate)
      const dueDateFormatted = dueDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })

      if (balances.isOverdue) {
        overdueList.push({
          agreement,
          remaining: balances.totalRemaining,
          dueDateStr: dueDateFormatted,
        })
      } else if (dueDate.getTime() >= now.getTime() && dueDate.getTime() <= endOfWeek.getTime()) {
        dueThisWeekList.push({
          agreement,
          remaining: balances.totalRemaining,
          dueDateStr: dueDateFormatted,
        })
      }
    }

    summary.overdueCount = overdueList.length
    summary.dueThisWeekCount = dueThisWeekList.length

    // 1. Push Overdue Loan Notification
    if (overdueList.length > 0) {
      if (overdueList.length === 1) {
        const item = overdueList[0]
        const isLent = item.agreement.direction === 'lent'
        const title = isLent
          ? `⚠️ Overdue Loan: ${item.agreement.counterpartyName}`
          : `⚠️ Overdue Debt Reminder`
        const body = isLent
          ? `Repayment of ${formatCurrency(item.remaining, currency)} was due on ${item.dueDateStr}. Tap to assess manual penalties or contact borrower.`
          : `Your repayment of ${formatCurrency(item.remaining, currency)} to ${item.agreement.counterpartyName} is overdue. Please settle to avoid late penalties.`

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { route: 'agreementDetails', id: item.agreement.id },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
          },
          trigger: null, // Send immediately
        })
        summary.notificationsPushed++
      } else {
        const totalOverdue = overdueList.reduce((sum, item) => sum + item.remaining, 0)
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${overdueList.length} Loans Overdue`,
            body: `You have ${overdueList.length} overdue loan obligations totaling ${formatCurrency(totalOverdue, currency)}. Tap to review and assess penalties.`,
            data: { route: 'lendingAgreements', filter: 'overdue' },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
          },
          trigger: null,
        })
        summary.notificationsPushed++
      }
    }

    // 2. Push Due This Week Notification
    if (dueThisWeekList.length > 0) {
      if (dueThisWeekList.length === 1) {
        const item = dueThisWeekList[0]
        const isLent = item.agreement.direction === 'lent'
        const title = isLent
          ? `📅 Loan Due This Week: ${item.agreement.counterpartyName}`
          : `📅 Upcoming Payment Due: ${item.agreement.counterpartyName}`
        const body = isLent
          ? `${item.agreement.counterpartyName} has a loan repayment of ${formatCurrency(item.remaining, currency)} due on ${item.dueDateStr}.`
          : `Reminder: Payment of ${formatCurrency(item.remaining, currency)} to ${item.agreement.counterpartyName} is due on ${item.dueDateStr}.`

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { route: 'agreementDetails', id: item.agreement.id },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
          },
          trigger: null,
        })
        summary.notificationsPushed++
      } else {
        const totalDue = dueThisWeekList.reduce((sum, item) => sum + item.remaining, 0)
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `📅 ${dueThisWeekList.length} Loans Due This Week`,
            body: `You have ${dueThisWeekList.length} loan repayments scheduled this week totaling ${formatCurrency(totalDue, currency)}.`,
            data: { route: 'lendingAgreements', filter: 'active' },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
          },
          trigger: null,
        })
        summary.notificationsPushed++
      }
    }

    // Record notification timestamp
    if (summary.notificationsPushed > 0) {
      await AsyncStorage.setItem(STORAGE_KEY_LAST_NOTIF_DATE, todayStr)
    }

    return summary
  } catch (error) {
    console.warn('[LoanNotifications] Error checking/pushing notifications:', error)
    return summary
  }
}
