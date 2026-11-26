import {
  buildCategoryBreakdownForTransactions,
  buildCurrentMonthDailyTrend,
  buildCurrentMonthTrend,
  buildCurrentWeekTrend,
  buildCurrentYearTrend,
  findCategory,
  formatCurrency,
  getCurrentMonthTransactions,
  getCurrentWeekTransactions,
  getCurrentYearTransactions,
  getPreviousMonthTransactions,
  getPreviousWeekTransactions,
  getPreviousYearTransactions,
  getSummaryForTransactions,
} from '../../lib/finance'
import { getCategoryAppearance } from '../../lib/categoryAppearance'
import type { Account, Transaction } from '../../types'

type ReportViewKey = 'weekly' | 'monthly' | 'yearly'

function getWeekRangeLabel(referenceDate = new Date()) {
  const start = new Date(referenceDate)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`
}

function getMonthRangeLabel(referenceDate = new Date()) {
  return referenceDate.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
}

function getYearRangeLabel(referenceDate = new Date()) {
  return `Jan – Dec ${referenceDate.getFullYear()}`
}

function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function getDisplayCurrencyCode(currency: string) {
  return currency === 'KES' ? 'KSh' : currency
}

function computeDeltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? null : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

export function buildAnalyticsPayload(account?: Account) {
  if (!account) {
    return {}
  }

  const now = new Date()
  const currency = account.settings.currency || 'KES'
  const currencyCodeDisplay = getDisplayCurrencyCode(currency)
  const budgetConfigured = Boolean(account.settings.budgetConfigured && Number(account.settings.monthlyBudget) > 0)
  const monthlyBudget = Number(account.settings.monthlyBudget) || 0

  const buildView = (opts: {
    viewKey: ReportViewKey
    periodLabel: string
    periodTitle: string
    dateRangeLabel: string
    trendTitle: string
    trendSubtitle: string
    transactions: Transaction[]
    previousTransactions: Transaction[]
    trendSource: Array<{ label: string; income: number; expenses: number; detailLabel?: string }>
    periodDays: number
    budgetFactor: number
    budgetScopeLabel: string
    averageDivisor: number
    averageLabel: string
    averageUnitText: string
  }) => {
    const {
      viewKey,
      periodLabel,
      periodTitle,
      dateRangeLabel,
      trendTitle,
      trendSubtitle,
      transactions,
      previousTransactions,
      trendSource,
      periodDays,
      budgetFactor,
      budgetScopeLabel,
      averageDivisor,
      averageLabel,
      averageUnitText,
    } = opts

    const summary = getSummaryForTransactions(account, transactions)
    const previousSummary = getSummaryForTransactions(account, previousTransactions)
    const breakdown = buildCategoryBreakdownForTransactions(account, transactions)
    const totalBreakdown = breakdown.reduce((sum, item) => sum + item.value, 0) || summary.expenses || 1
    const maxTrendValue = Math.max(
      ...trendSource.map((item) => Math.max(item.expenses, item.income)),
      1,
    )

    const expenseTransactions = transactions.filter((item) => item.type === 'expense')
    const incomeTransactions = transactions.filter((item) => item.type === 'income')
    const uniqueExpenseDays = new Set(expenseTransactions.map((item) => new Date(item.date).toDateString())).size
    const largestExpense = [...expenseTransactions].sort((left, right) => right.amount - left.amount)[0]
    const largestExpenseCategory = largestExpense ? findCategory(account, largestExpense.categoryId) : undefined
    const topCategory = breakdown[0]

    const avgPerUnit = summary.expenses / Math.max(averageDivisor, 1)
    const avgDailySpend = summary.expenses / Math.max(periodDays, 1)
    const avgTransactionAmount = expenseTransactions.length > 0
      ? summary.expenses / expenseTransactions.length
      : 0

    const targetBudget = budgetConfigured ? Math.round(monthlyBudget * budgetFactor) : 0
    const budgetRemaining = targetBudget - summary.expenses
    const budgetUsedPercent = budgetConfigured && targetBudget > 0
      ? Math.round((summary.expenses / targetBudget) * 100)
      : 0

    const expenseDeltaPercent = computeDeltaPercent(summary.expenses, previousSummary.expenses)
    const incomeDeltaPercent = computeDeltaPercent(summary.income, previousSummary.income)

    const prevPeriodWord = periodLabel.toLowerCase()
    const comparisonText = previousSummary.expenses > 0
      ? `${expenseDeltaPercent !== null && expenseDeltaPercent > 0 ? '+' : ''}${expenseDeltaPercent ?? 0}% vs last ${prevPeriodWord} (${formatCurrency(previousSummary.expenses, currency)})`
      : summary.expenses > 0
        ? `No recorded spend last ${prevPeriodWord}`
        : `No expenses recorded yet this ${prevPeriodWord}`

    const categoryBudgetStatuses = (account.settings.categoryBudgets || [])
      .filter((item) => Number(item.amount) > 0)
      .map((item) => {
        const scaledBudget = Math.round(Number(item.amount) * budgetFactor)
        const category = findCategory(account, item.categoryId)
        const spent = expenseTransactions
          .filter((transaction) => transaction.categoryId === item.categoryId)
          .reduce((sum, transaction) => sum + transaction.amount, 0)
        const ratio = scaledBudget > 0 ? spent / scaledBudget : 0
        const appearance = getCategoryAppearance({
          name: category?.name ?? 'Category',
          icon: category?.icon,
          color: category?.color,
          type: category?.type ?? 'expense',
        })
        const statusKey = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'good'
        const statusLabel = ratio >= 1
          ? `${formatCurrency(spent - scaledBudget, currency)} over`
          : ratio >= 0.8
            ? `${Math.round(ratio * 100)}% used`
            : `${formatCurrency(Math.max(0, scaledBudget - spent), currency)} left`

        return {
          categoryName: category?.name ?? 'Category',
          icon: appearance.icon,
          color: appearance.color,
          background: appearance.background,
          foreground: appearance.foreground,
          barColor: statusKey === 'over' ? '#BA1A1A' : appearance.color,
          budget: formatCurrency(scaledBudget, currency),
          spent: formatCurrency(spent, currency),
          statusKey,
          statusLabel,
          progress: Math.min(Math.round(ratio * 100), 100),
          progressText: `${Math.round(ratio * 100)}%`,
          sortWeight: ratio,
        }
      })
      .sort((left, right) => right.sortWeight - left.sortWeight)
      .map(({ sortWeight: _sortWeight, ...item }) => item)

    const savingsRatePercent = summary.income > 0 ? Math.round(summary.savingsRate) : 0

    return {
      viewKey,
      periodLabel,
      periodTitle,
      dateRangeLabel,
      trendTitle,
      trendSubtitle,
      budgetScopeLabel,
      summary: {
        income: formatCurrency(summary.income, currency),
        expenses: formatCurrency(summary.expenses, currency),
        rawIncome: summary.income,
        rawExpenses: summary.expenses,
        rawNet: summary.balance,
        previousExpenses: formatCurrency(previousSummary.expenses, currency),
        previousIncome: formatCurrency(previousSummary.income, currency),
        expenseDeltaPercent,
        incomeDeltaPercent,
        savingsRatePercent,
        expenseCount: expenseTransactions.length,
        incomeCount: incomeTransactions.length,
        activeDays: uniqueExpenseDays,
        avgTransactionAmount: formatCurrency(avgTransactionAmount, currency),
      },
      comparisonText,
      summaryCaption:
        summary.expenses === 0 && summary.income === 0
          ? `No activity recorded ${periodTitle.toLowerCase()}.`
          : `${expenseTransactions.length} expense ${expenseTransactions.length === 1 ? 'entry' : 'entries'} across ${uniqueExpenseDays} active day${uniqueExpenseDays === 1 ? '' : 's'} · Avg ticket ${formatCurrency(avgTransactionAmount, currency)}`,
      metrics: {
        income: formatCurrency(summary.income, currency),
        incomeCaption: incomeTransactions.length > 0
          ? `From ${incomeTransactions.length} income ${incomeTransactions.length === 1 ? 'entry' : 'entries'}`
          : `No income logged this ${prevPeriodWord}`,
        net: formatCurrency(summary.balance, currency),
        netCaption: summary.income > 0
          ? `${savingsRatePercent}% savings rate (${summary.balance >= 0 ? 'surplus' : 'deficit'})`
          : summary.balance >= 0
            ? 'Money left after expenses'
            : 'Spending exceeded inflows',
        budget: budgetConfigured ? `${budgetUsedPercent}% used` : 'Not set',
        budgetTarget: budgetConfigured ? formatCurrency(targetBudget, currency) : 'Not set',
        budgetCaption: budgetConfigured
          ? budgetRemaining >= 0
            ? `${formatCurrency(budgetRemaining, currency)} left of ${formatCurrency(targetBudget, currency)}`
            : `${formatCurrency(Math.abs(budgetRemaining), currency)} over ${budgetScopeLabel.toLowerCase()}`
          : 'Set a budget to track your pace',
        average: formatCurrency(avgPerUnit, currency),
        averageLabel,
        averageCaption: viewKey === 'yearly'
          ? `Per month · ${formatCurrency(avgDailySpend, currency)}/day`
          : averageUnitText,
      },
      signals: {
        topCategoryName: topCategory?.name ?? 'No category data',
        topCategoryAmount: topCategory ? formatCurrency(topCategory.value, currency) : formatCurrency(0, currency),
        topCategoryCaption: topCategory
          ? `${Math.round((topCategory.value / totalBreakdown) * 100)}% of ${periodTitle.toLowerCase()} spending (${topCategory.txCount} ${topCategory.txCount === 1 ? 'txn' : 'txns'})`
          : 'Add spending to see category leaders',
        largestExpenseName: largestExpenseCategory?.name || largestExpense?.note || 'No expense recorded',
        largestExpenseNote: largestExpense?.note || '',
        largestExpenseAmount: largestExpense ? formatCurrency(largestExpense.amount, currency) : formatCurrency(0, currency),
        largestExpenseCaption: largestExpense
          ? `${new Date(largestExpense.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: viewKey === 'yearly' ? 'numeric' : undefined })}${largestExpense.note ? ` · ${largestExpense.note}` : ''}`
          : 'Your biggest expense will appear here',
      },
      trend: trendSource.map((item) => ({
        label: item.label,
        detailLabel: item.detailLabel ?? item.label,
        amount: formatCurrency(item.expenses, currency),
        incomeAmount: formatCurrency(item.income, currency),
        netAmount: formatCurrency(item.income - item.expenses, currency),
        rawAmount: item.expenses,
        rawIncome: item.income,
        height: `${Math.max((item.expenses / maxTrendValue) * 100, item.expenses > 0 ? 10 : 4)}%`,
        incomeHeight: `${Math.max((item.income / maxTrendValue) * 100, item.income > 0 ? 10 : 0)}%`,
      })),
      categories: breakdown.slice(0, 8).map((item) => {
        const category = findCategory(account, item.id)
        const appearance = getCategoryAppearance({
          name: category?.name ?? item.name,
          icon: category?.icon,
          color: category?.color ?? item.color,
          type: category?.type ?? 'expense',
        })
        const txAvg = item.txCount > 0 ? item.value / item.txCount : item.value

        return {
          name: item.name,
          icon: appearance.icon,
          color: appearance.color,
          background: appearance.background,
          foreground: appearance.foreground,
          barColor: appearance.color,
          amount: formatCurrency(item.value, currency),
          rawAmount: item.value,
          txCount: item.txCount,
          avgAmount: formatCurrency(txAvg, currency),
          percent: Math.round((item.value / totalBreakdown) * 100),
        }
      }),
      categoryBudgetStatuses,
    }
  }

  const weeklyTransactions = getCurrentWeekTransactions(account, now)
  const previousWeeklyTransactions = getPreviousWeekTransactions(account, now)
  const elapsedWeekDays = ((now.getDay() + 6) % 7) + 1

  const monthlyTransactions = getCurrentMonthTransactions(account)
  const previousMonthlyTransactions = getPreviousMonthTransactions(account, now)
  const monthlyWeeklyView = buildView({
    viewKey: 'monthly',
    periodLabel: 'Month',
    periodTitle: 'This Month',
    dateRangeLabel: getMonthRangeLabel(now),
    trendTitle: 'Monthly Spending & Income Trend',
    trendSubtitle: 'Weekly blocks across the current month',
    transactions: monthlyTransactions,
    previousTransactions: previousMonthlyTransactions,
    trendSource: buildCurrentMonthTrend(account, now),
    periodDays: now.getDate(),
    budgetFactor: 1,
    budgetScopeLabel: 'Monthly Budget',
    averageDivisor: now.getDate(),
    averageLabel: 'Avg Daily Spend',
    averageUnitText: `Across ${now.getDate()} elapsed day${now.getDate() === 1 ? '' : 's'}`,
  })
  const monthlyDailyView = buildView({
    viewKey: 'monthly',
    periodLabel: 'Month',
    periodTitle: 'This Month',
    dateRangeLabel: getMonthRangeLabel(now),
    trendTitle: 'Daily Spending Breakdown',
    trendSubtitle: 'Day-by-day activity this month',
    transactions: monthlyTransactions,
    previousTransactions: previousMonthlyTransactions,
    trendSource: buildCurrentMonthDailyTrend(account, now),
    periodDays: now.getDate(),
    budgetFactor: 1,
    budgetScopeLabel: 'Monthly Budget',
    averageDivisor: now.getDate(),
    averageLabel: 'Avg Daily Spend',
    averageUnitText: `Across ${now.getDate()} elapsed day${now.getDate() === 1 ? '' : 's'}`,
  })

  const yearlyTransactions = getCurrentYearTransactions(account, now)
  const previousYearlyTransactions = getPreviousYearTransactions(account, now)
  const elapsedMonths = now.getMonth() + 1

  return {
    currency,
    currencySymbol: currencyCodeDisplay,
    defaultView: 'monthly',
    views: {
      weekly: buildView({
        viewKey: 'weekly',
        periodLabel: 'Week',
        periodTitle: 'This Week',
        dateRangeLabel: getWeekRangeLabel(now),
        trendTitle: 'Weekly Daily Breakdown',
        trendSubtitle: 'Mon – Sun expenses vs income',
        transactions: weeklyTransactions,
        previousTransactions: previousWeeklyTransactions,
        trendSource: buildCurrentWeekTrend(account, now),
        periodDays: elapsedWeekDays,
        budgetFactor: 12 / 52,
        budgetScopeLabel: 'Weekly Pace',
        averageDivisor: elapsedWeekDays,
        averageLabel: 'Avg Daily Spend',
        averageUnitText: `Across ${elapsedWeekDays} day${elapsedWeekDays === 1 ? '' : 's'} this week`,
      }),
      monthly: {
        ...monthlyWeeklyView,
        defaultTrendMode: 'weekly',
        trendModes: {
          weekly: monthlyWeeklyView.trend,
          daily: monthlyDailyView.trend,
        },
      },
      yearly: buildView({
        viewKey: 'yearly',
        periodLabel: 'Year',
        periodTitle: 'This Year',
        dateRangeLabel: getYearRangeLabel(now),
        trendTitle: 'Annual Monthly Report',
        trendSubtitle: `Jan – Dec ${now.getFullYear()} cash flow & expenses`,
        transactions: yearlyTransactions,
        previousTransactions: previousYearlyTransactions,
        trendSource: buildCurrentYearTrend(account, now),
        periodDays: getDayOfYear(now),
        budgetFactor: 12,
        budgetScopeLabel: 'Annual Limit',
        averageDivisor: elapsedMonths,
        averageLabel: 'Avg Monthly Spend',
        averageUnitText: `Across ${elapsedMonths} elapsed month${elapsedMonths === 1 ? '' : 's'}`,
      }),
    },
  }
}
