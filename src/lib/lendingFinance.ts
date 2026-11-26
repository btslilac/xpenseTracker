import type {
  LoanAgreement,
  LoanPayment,
  LoanStatus,
  LendingProfile,
  PenaltyType,
} from '../types'
import { formatCurrency } from './finance'

export type AgreementBalance = {
  principalAmount: number
  agreedInterestAmount: number
  penaltyAmount: number
  totalObligation: number
  principalPaid: number
  interestPaid: number
  penaltyPaid: number
  totalPaid: number
  remainingPrincipal: number
  remainingInterest: number
  remainingPenalty: number
  totalRemaining: number
  progressPercent: number
  isOverdue: boolean
  isSettled: boolean
  derivedStatus: LoanStatus
  overdueDays: number
  suggestedPenalty: number
}

export type CategoryLendingSummary = {
  lentRemaining: number
  lentPrincipal: number
  borrowedRemaining: number
  borrowedPrincipal: number
  activeCount: number
}

export type LendingWorkspaceSummary = {
  totalLentPrincipal: number
  totalLentRemaining: number
  totalBorrowedPrincipal: number
  totalBorrowedRemaining: number
  repaymentsReceivedThisMonth: number
  repaymentsMadeThisMonth: number
  interestReceivedTotal: number
  interestPaidTotal: number
  penaltiesReceivedTotal: number
  penaltiesPaidTotal: number
  overdueCount: number
  activeAgreementsCount: number
  settledAgreementsCount: number
  casual: CategoryLendingSummary
  formal: CategoryLendingSummary
}

export function isCasualAgreement(agreement: LoanAgreement): boolean {
  if (agreement.agreementCategory === 'casual') return true
  if (agreement.agreementCategory === 'formal') return false
  return !agreement.interestRate || Number(agreement.interestRate) === 0 || agreement.interestType === 'none'
}

export function generateAgreementReference(direction: 'lent' | 'borrowed'): string {
  const prefix = direction === 'lent' ? 'LND' : 'BRW'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${year}-${random}`
}

export function generatePaymentIdempotencyKey(agreementId: string, timestamp: number): string {
  return `pay_${agreementId}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Assessed penalty is applied manually by the user/financier.
 * Returns the exact penalty amount manually assessed on this agreement.
 */
export function calculateAssessedPenalty(agreement: LoanAgreement): number {
  return Math.max(0, Number(agreement.penaltyAmount) || 0)
}

/**
 * Calculates suggested penalty based on penalty terms and overdue days.
 * Used as a guide or one-tap calculation when the user manually assesses penalties.
 */
export function calculateSuggestedPenalty(
  agreement: LoanAgreement,
  asOfDate: Date = new Date()
): number {
  if (!agreement.dueDate || !agreement.penaltyType || agreement.penaltyType === 'none') {
    return 0
  }

  const dueDate = new Date(agreement.dueDate)
  const graceDays = Number(agreement.penaltyGraceDays) || 0
  const gracePeriodMs = graceDays * 24 * 60 * 60 * 1000
  const effectiveOverdueDate = new Date(dueDate.getTime() + gracePeriodMs)

  if (asOfDate.getTime() <= effectiveOverdueDate.getTime()) {
    // Within due date + grace period, no penalty suggested yet
    return 0
  }

  const overdueMs = asOfDate.getTime() - effectiveOverdueDate.getTime()
  const overdueDays = Math.ceil(overdueMs / (24 * 60 * 60 * 1000))
  const principal = Number(agreement.principalAmount) || 0
  const rate = Number(agreement.penaltyRate) || 0

  let penalty = 0
  if (agreement.penaltyType === 'fixed') {
    penalty = rate
  } else if (agreement.penaltyType === 'percentage') {
    penalty = (principal * rate) / 100
  } else if (agreement.penaltyType === 'daily') {
    penalty = overdueDays * rate
  }

  return Math.round(penalty * 100) / 100
}

/**
 * Waterfall Repayment Allocation:
 * 1. Penalties FIRST
 * 2. Interest SECOND
 * 3. Principal LAST
 */
export function allocateWaterfallPayment(
  paymentAmount: number,
  remainingPenalty: number,
  remainingInterest: number,
  remainingPrincipal: number
): {
  penaltyComponent: number
  interestComponent: number
  principalComponent: number
  excessAmount: number
} {
  let remaining = Math.max(0, Number(paymentAmount) || 0)

  // 1. Penalties FIRST
  const penaltyComponent = Math.min(remaining, Math.max(0, remainingPenalty))
  remaining -= penaltyComponent

  // 2. Interest SECOND
  const interestComponent = Math.min(remaining, Math.max(0, remainingInterest))
  remaining -= interestComponent

  // 3. Principal LAST
  const principalComponent = Math.min(remaining, Math.max(0, remainingPrincipal))
  remaining -= principalComponent

  const excessAmount = remaining

  return {
    penaltyComponent,
    interestComponent,
    principalComponent,
    excessAmount,
  }
}

export function calculateAgreementBalances(
  agreement: LoanAgreement,
  payments: LoanPayment[]
): AgreementBalance {
  const agreementPayments = payments.filter((p) => p.agreementId === agreement.id)

  const penaltyPaid = agreementPayments.reduce((sum, p) => sum + (Number(p.penaltyComponent) || 0), 0)
  const interestPaid = agreementPayments.reduce((sum, p) => sum + (Number(p.interestComponent) || 0), 0)
  const principalPaid = agreementPayments.reduce((sum, p) => sum + (Number(p.principalComponent) || 0), 0)
  const totalPaid = penaltyPaid + interestPaid + principalPaid

  const principalAmount = Number(agreement.principalAmount) || 0
  const agreedInterestAmount = Number(agreement.agreedInterestAmount) || 0

  const now = new Date()
  let isOverdue = false
  let overdueDays = 0

  if (agreement.dueDate) {
    const due = new Date(agreement.dueDate)
    if (due.getTime() < now.getTime()) {
      isOverdue = true
      overdueDays = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const penaltyAmount = calculateAssessedPenalty(agreement)
  const suggestedPenalty = calculateSuggestedPenalty(agreement, now)
  const totalObligation = principalAmount + agreedInterestAmount + penaltyAmount

  const remainingPenalty = Math.max(0, penaltyAmount - penaltyPaid)
  const remainingInterest = Math.max(0, agreedInterestAmount - interestPaid)
  const remainingPrincipal = Math.max(0, principalAmount - principalPaid)
  const totalRemaining = remainingPenalty + remainingInterest + remainingPrincipal

  const progressPercent = totalObligation > 0
    ? Math.min(100, Math.round((totalPaid / totalObligation) * 100))
    : 100

  const isSettled = totalRemaining <= 0 || Boolean(agreement.archivedAt)

  // Derive Status
  let derivedStatus: LoanStatus = agreement.status
  if (agreement.archivedAt || isSettled) {
    derivedStatus = 'settled'
  } else if (isOverdue) {
    derivedStatus = 'overdue'
  } else if (agreement.dueDate) {
    const due = new Date(agreement.dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays <= 3) {
      derivedStatus = 'due_soon'
    } else if (totalPaid > 0) {
      derivedStatus = 'partially_repaid'
    } else {
      derivedStatus = 'active'
    }
  } else if (totalPaid > 0) {
    derivedStatus = 'partially_repaid'
  } else {
    derivedStatus = 'active'
  }

  return {
    principalAmount,
    agreedInterestAmount,
    penaltyAmount,
    totalObligation,
    principalPaid,
    interestPaid,
    penaltyPaid,
    totalPaid,
    remainingPrincipal,
    remainingInterest,
    remainingPenalty,
    totalRemaining,
    progressPercent,
    isOverdue,
    isSettled,
    derivedStatus,
    overdueDays,
    suggestedPenalty,
  }
}

export function calculateLendingSummary(
  agreements: LoanAgreement[],
  payments: LoanPayment[]
): LendingWorkspaceSummary {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let totalLentPrincipal = 0
  let totalLentRemaining = 0
  let totalBorrowedPrincipal = 0
  let totalBorrowedRemaining = 0
  let repaymentsReceivedThisMonth = 0
  let repaymentsMadeThisMonth = 0
  let interestReceivedTotal = 0
  let interestPaidTotal = 0
  let penaltiesReceivedTotal = 0
  let penaltiesPaidTotal = 0
  let overdueCount = 0
  let activeAgreementsCount = 0
  let settledAgreementsCount = 0

  const casual = {
    lentRemaining: 0,
    lentPrincipal: 0,
    borrowedRemaining: 0,
    borrowedPrincipal: 0,
    activeCount: 0,
  }

  const formal = {
    lentRemaining: 0,
    lentPrincipal: 0,
    borrowedRemaining: 0,
    borrowedPrincipal: 0,
    activeCount: 0,
  }

  for (const agreement of agreements) {
    const balances = calculateAgreementBalances(agreement, payments)
    const isCasual = isCasualAgreement(agreement)
    const targetCat = isCasual ? casual : formal

    if (balances.isSettled) {
      settledAgreementsCount++
    } else {
      activeAgreementsCount++
      targetCat.activeCount++
    }

    if (balances.isOverdue && !balances.isSettled) {
      overdueCount++
    }

    if (agreement.direction === 'lent') {
      totalLentPrincipal += balances.principalAmount
      targetCat.lentPrincipal += balances.principalAmount
      if (!balances.isSettled) {
        totalLentRemaining += balances.totalRemaining
        targetCat.lentRemaining += balances.totalRemaining
      }
      interestReceivedTotal += balances.interestPaid
      penaltiesReceivedTotal += balances.penaltyPaid
    } else {
      totalBorrowedPrincipal += balances.principalAmount
      targetCat.borrowedPrincipal += balances.principalAmount
      if (!balances.isSettled) {
        totalBorrowedRemaining += balances.totalRemaining
        targetCat.borrowedRemaining += balances.totalRemaining
      }
      interestPaidTotal += balances.interestPaid
      penaltiesPaidTotal += balances.penaltyPaid
    }
  }

  // Monthly payment activity
  for (const payment of payments) {
    const payDate = new Date(payment.paymentDate)
    const isThisMonth = payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear

    const agreement = agreements.find((a) => a.id === payment.agreementId)
    if (!agreement) continue

    if (isThisMonth) {
      if (agreement.direction === 'lent') {
        repaymentsReceivedThisMonth += Number(payment.amount) || 0
      } else {
        repaymentsMadeThisMonth += Number(payment.amount) || 0
      }
    }
  }

  return {
    totalLentPrincipal,
    totalLentRemaining,
    totalBorrowedPrincipal,
    totalBorrowedRemaining,
    repaymentsReceivedThisMonth,
    repaymentsMadeThisMonth,
    interestReceivedTotal,
    interestPaidTotal,
    penaltiesReceivedTotal,
    penaltiesPaidTotal,
    overdueCount,
    activeAgreementsCount,
    settledAgreementsCount,
    casual,
    formal,
  }
}

export function formatStatusBadge(status: LoanStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'active':
      return { label: 'Active', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' }
    case 'due_soon':
      return { label: 'Due Soon', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' }
    case 'partially_repaid':
      return { label: 'Partial', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' }
    case 'overdue':
      return { label: 'Overdue', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' }
    case 'settled':
      return { label: 'Settled', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' }
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' }
    case 'written_off':
      return { label: 'Written Off', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300' }
    default:
      return { label: status, bg: 'bg-slate-100', text: 'text-slate-700' }
  }
}
