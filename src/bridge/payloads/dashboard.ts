import {
  buildCategoryBreakdownForTransactions,
  findCategory,
  formatCurrency,
  getAccountSummary,
  getCurrentMonthTransactions,
  getRecentTransactions,
} from '../../lib/finance'
import { getCategoryAppearance } from '../../lib/categoryAppearance'
import {
  calculateAgreementBalances,
  calculateLendingSummary,
  formatStatusBadge,
  isCasualAgreement,
} from '../../lib/lendingFinance'
import { DEFAULT_COMIC_AVATAR } from '../../lib/avatars'
import type { Account } from '../../types'
import type { LendingPayloadContext } from '../routeConfig'

function splitGraphemes(text: string): string[] {
  try {
    const Seg = (Intl as any)?.Segmenter
    if (typeof Seg === 'function') {
      return Array.from(new Seg('en', { granularity: 'grapheme' }).segment(text), (s: any) => s.segment)
    }
  } catch {}
  return Array.from(text)
}

/**
 * Extracts the first/calling name from a full name string, preserving any emojis
 * that might prefix or suffix the name (e.g. "Alex 🚀", "🦁 Leo", "Sarah 🌸 Connor").
 */
export function extractFirstName(fullName?: string | null): string {
  if (!fullName) return ''
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  const words = trimmed.split(/\s+/)
  if (words.length === 1) return words[0]

  const isEmoji = (w: string) => {
    try {
      const normalized = splitGraphemes(w).join('')
      return /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\ufe0f]+$/u.test(normalized)
    } catch {
      return false
    }
  }

  // Handle two-token names where one token is pure emoji (e.g., "Alex 🚀" or "🦁 Leo")
  if (words.length === 2 && (isEmoji(words[0]) || isEmoji(words[1]))) {
    return words.join(' ')
  }

  let result = words[0]
  let nextIdx = 1
  if (isEmoji(result) && words[nextIdx]) {
    result += ' ' + words[nextIdx]
    nextIdx++
  }
  if (words[nextIdx] && isEmoji(words[nextIdx])) {
    result += ' ' + words[nextIdx]
  }
  return result
}

export function buildDashboardPayload(
  account?: Account,
  params?: Record<string, string>,
  lending?: LendingPayloadContext
) {
  if (!account) {
    return {}
  }

  const summary = getAccountSummary(account)
  const currency = account.settings.currency || 'KES'
  const now = new Date()
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthExpense = account.transactions
    .filter((transaction) => {
      if (transaction.type !== 'expense') {
        return false
      }
      const date = new Date(transaction.date)
      return (
        date.getMonth() === previousMonthDate.getMonth() &&
        date.getFullYear() === previousMonthDate.getFullYear()
      )
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const expenseDeltaPercent = previousMonthExpense > 0
    ? Math.round(((summary.expenses - previousMonthExpense) / previousMonthExpense) * 100)
    : null

  const recentTransactions = getRecentTransactions(account, 6).map((transaction) => {
    const category = findCategory(account, transaction.categoryId)
    const appearance = getCategoryAppearance({
      name: category?.name,
      icon: category?.icon,
      color: category?.color,
      type: category?.type ?? transaction.type,
    })

    return {
      title: transaction.note || category?.name || 'Transaction',
      subtitle: `${category?.name ?? 'Uncategorized'} • ${new Date(transaction.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`,
      amount: `${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount, currency)}`,
      kind: transaction.type,
      icon: appearance.icon,
      background: appearance.background,
      foreground: appearance.foreground,
    }
  })

  const currentMonthTransactions = getCurrentMonthTransactions(account)
  const allBreakdown = buildCategoryBreakdownForTransactions(account, currentMonthTransactions)
  const totalBreakdown = allBreakdown.reduce((sum, item) => sum + item.value, 0) || 1
  const breakdown = allBreakdown.slice(0, 8)

  const firstName = extractFirstName(account.settings.fullName)
  const greeting = firstName ? `Welcome, ${firstName}!` : 'Welcome!'

  const lendingAgreements = lending?.agreements || []
  const lendingPayments = lending?.payments || []
  const lendingSummary = calculateLendingSummary(lendingAgreements, lendingPayments)
  const recentAgreements = lendingAgreements
    .filter((a) => !a.archivedAt && a.status !== 'settled')
    .slice(0, 5)
    .map((agreement) => {
      const balances = calculateAgreementBalances(agreement, lendingPayments)
      const badge = formatStatusBadge(balances.derivedStatus)
      const casual = isCasualAgreement(agreement)
      return {
        id: agreement.id,
        reference: agreement.agreementReference,
        direction: agreement.direction,
        agreementCategory: casual ? 'casual' : 'formal',
        relationship: agreement.relationship || (casual ? 'Friend' : null),
        counterparty: agreement.counterpartyName,
        remainingFormatted: formatCurrency(balances.totalRemaining, currency),
        dueDateFormatted: agreement.dueDate
          ? new Date(agreement.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
          : 'No due date',
        statusLabel: badge.label,
        statusBg: badge.bg,
        statusText: badge.text,
      }
    })

  return {
    greeting,
    firstName,
    userName: account.settings.fullName || 'User',
    avatarUrl: account.settings.avatarDataUrl || DEFAULT_COMIC_AVATAR,
    currency,
    lendingEnabled: account.settings.lending?.enabled ?? true,
    preferredWorkspace: params?.workspace || 'expenses',
    summary: {
      balance: formatCurrency(summary.balance, currency),
      income: formatCurrency(summary.income, currency),
      expenses: formatCurrency(summary.expenses, currency),
      budget: account.settings.budgetConfigured
        ? formatCurrency(account.settings.monthlyBudget, currency)
        : formatCurrency(0, currency),
    },
    rawSummary: {
      balance: summary.balance,
      income: summary.income,
      expenses: summary.expenses,
      budget: account.settings.monthlyBudget || 0,
      budgetConfigured: Boolean(account.settings.budgetConfigured),
    },
    lendingStats: {
      totalReceivables: formatCurrency(lendingSummary.totalLentRemaining, currency),
      totalReceivablesRaw: lendingSummary.totalLentRemaining,
      totalLentPrincipal: formatCurrency(lendingSummary.totalLentPrincipal, currency),
      totalPayables: formatCurrency(lendingSummary.totalBorrowedRemaining, currency),
      totalPayablesRaw: lendingSummary.totalBorrowedRemaining,
      totalBorrowedPrincipal: formatCurrency(lendingSummary.totalBorrowedPrincipal, currency),
      netLending: formatCurrency(lendingSummary.totalLentRemaining - lendingSummary.totalBorrowedRemaining, currency),
      netLendingRaw: lendingSummary.totalLentRemaining - lendingSummary.totalBorrowedRemaining,
      casualCount: lendingSummary.casual.activeCount,
      formalCount: lendingSummary.formal.activeCount,
      activeAgreementsCount: lendingSummary.activeAgreementsCount,
      overdueCount: lendingSummary.overdueCount,
      recentAgreements,
    },
    expenseChange:
      expenseDeltaPercent === null
        ? null
        : {
          direction:
            expenseDeltaPercent > 0 ? 'up' : expenseDeltaPercent < 0 ? 'down' : 'flat',
          label: `${Math.abs(expenseDeltaPercent)}% vs last month`,
        },
    categories: breakdown.map((item) => {
      const category = findCategory(account, item.id)
      const appearance = getCategoryAppearance({
        name: category?.name ?? item.name,
        icon: category?.icon,
        color: category?.color ?? item.color,
        type: category?.type ?? 'expense',
      })

      return {
        name: item.name,
        amount: formatCurrency(item.value, currency),
        rawAmount: item.value,
        txCount: item.txCount,
        icon: appearance.icon,
        color: appearance.color,
        background: appearance.background,
        foreground: appearance.foreground,
        percent: Math.round((item.value / totalBreakdown) * 100),
      }
    }),
    availableCategories: (account.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
    })),
    recentTransactions,
  }
}
