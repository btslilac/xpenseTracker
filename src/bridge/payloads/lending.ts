import type {
  Account,
  LendingProfile,
  LoanAgreement,
  LoanPayment,
} from '../../types'
import {
  calculateAgreementBalances,
  calculateLendingSummary,
  formatStatusBadge,
  isCasualAgreement,
} from '../../lib/lendingFinance'
import { formatCurrency } from '../../lib/finance'

export function buildLendingDashboardPayload(
  account?: Account,
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = [],
  profile?: LendingProfile | null
) {
  const currency = account?.settings.currency || 'KES'
  const summary = calculateLendingSummary(agreements, payments)

  const allActive = agreements
    .filter((a) => !a.archivedAt && a.status !== 'settled')
    .map((agreement) => {
      const balances = calculateAgreementBalances(agreement, payments)
      const badge = formatStatusBadge(balances.derivedStatus)
      const isCasual = isCasualAgreement(agreement)
      return {
        id: agreement.id,
        reference: agreement.agreementReference,
        direction: agreement.direction,
        agreementCategory: isCasual ? 'casual' : 'formal',
        relationship: agreement.relationship || (isCasual ? 'Friend' : null),
        counterparty: agreement.counterpartyName,
        remainingFormatted: formatCurrency(balances.totalRemaining, currency),
        principalFormatted: formatCurrency(balances.principalAmount, currency),
        interestRateFormatted: agreement.interestRate ? `${agreement.interestRate}%` : null,
        dueDateFormatted: agreement.dueDate ? new Date(agreement.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : 'No due date',
        progress: balances.progressPercent,
        status: balances.derivedStatus,
        statusLabel: badge.label,
        statusBg: badge.bg,
        statusText: badge.text,
      }
    })

  const activeAgreements = [
    ...allActive.filter((a) => a.agreementCategory === 'casual').slice(0, 8),
    ...allActive.filter((a) => a.agreementCategory === 'formal').slice(0, 8),
  ]

  return {
    currency,
    profileName: profile?.companyName || profile?.ownerName || account?.settings.fullName || 'Financier',
    summary: {
      lentRemaining: formatCurrency(summary.totalLentRemaining, currency),
      lentPrincipal: formatCurrency(summary.totalLentPrincipal, currency),
      borrowedRemaining: formatCurrency(summary.totalBorrowedRemaining, currency),
      borrowedPrincipal: formatCurrency(summary.totalBorrowedPrincipal, currency),
      receivedMonth: formatCurrency(summary.repaymentsReceivedThisMonth, currency),
      repaidMonth: formatCurrency(summary.repaymentsMadeThisMonth, currency),
      overdueCount: summary.overdueCount,
      penaltiesReceived: formatCurrency(summary.penaltiesReceivedTotal, currency),
      penaltiesPaid: formatCurrency(summary.penaltiesPaidTotal, currency),
      casual: {
        lentRemaining: formatCurrency(summary.casual.lentRemaining, currency),
        lentPrincipal: formatCurrency(summary.casual.lentPrincipal, currency),
        borrowedRemaining: formatCurrency(summary.casual.borrowedRemaining, currency),
        borrowedPrincipal: formatCurrency(summary.casual.borrowedPrincipal, currency),
        activeCount: summary.casual.activeCount,
      },
      formal: {
        lentRemaining: formatCurrency(summary.formal.lentRemaining, currency),
        lentPrincipal: formatCurrency(summary.formal.lentPrincipal, currency),
        borrowedRemaining: formatCurrency(summary.formal.borrowedRemaining, currency),
        borrowedPrincipal: formatCurrency(summary.formal.borrowedPrincipal, currency),
        activeCount: summary.formal.activeCount,
      },
    },
    activeAgreements,
  }
}

export function buildLendingAgreementsPayload(
  account?: Account,
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = [],
  params?: Record<string, string>
) {
  const currency = account?.settings.currency || 'KES'
  const initialDirection = params?.direction === 'borrowed' ? 'borrowed' : 'lent'
  const initialCategory = params?.category || 'all'
  const initialFilter = params?.filter || 'all'

  const formattedAgreements = agreements.map((agreement) => {
    const balances = calculateAgreementBalances(agreement, payments)
    const badge = formatStatusBadge(balances.derivedStatus)
    const isCasual = isCasualAgreement(agreement)
    return {
      id: agreement.id,
      reference: agreement.agreementReference,
      direction: agreement.direction,
      agreementCategory: isCasual ? 'casual' : 'formal',
      relationship: agreement.relationship || (isCasual ? 'Friend' : null),
      counterparty: agreement.counterpartyName,
      counterpartyPhone: agreement.counterpartyPhone || '',
      principalAmount: balances.principalAmount,
      principalFormatted: formatCurrency(balances.principalAmount, currency),
      remainingAmount: balances.totalRemaining,
      remainingFormatted: formatCurrency(balances.totalRemaining, currency),
      penaltyAmount: balances.penaltyAmount,
      penaltyFormatted: formatCurrency(balances.penaltyAmount, currency),
      remainingPenalty: balances.remainingPenalty,
      remainingPenaltyFormatted: formatCurrency(balances.remainingPenalty, currency),
      paidAmount: balances.totalPaid,
      paidFormatted: formatCurrency(balances.totalPaid, currency),
      dueDateFormatted: agreement.dueDate ? new Date(agreement.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date',
      agreementDateFormatted: new Date(agreement.agreementDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
      progress: balances.progressPercent,
      status: balances.derivedStatus,
      statusLabel: badge.label,
      statusBg: badge.bg,
      statusText: badge.text,
    }
  })

  return {
    currency,
    initialDirection,
    initialCategory,
    initialFilter,
    agreements: formattedAgreements,
  }
}

export function buildAgreementDetailsPayload(
  account?: Account,
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = [],
  params?: Record<string, string>
) {
  const currency = account?.settings.currency || 'KES'
  const agreementId = params?.id
  const agreement = agreements.find((a) => a.id === agreementId)

  if (!agreement) {
    return { notFound: true, currency }
  }

  const balances = calculateAgreementBalances(agreement, payments)
  const badge = formatStatusBadge(balances.derivedStatus)
  const isCasual = isCasualAgreement(agreement)

  const agreementPayments = payments
    .filter((p) => p.agreementId === agreement.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .map((payment) => ({
      id: payment.id,
      amountFormatted: formatCurrency(payment.amount, currency),
      principalFormatted: formatCurrency(payment.principalComponent, currency),
      interestFormatted: formatCurrency(payment.interestComponent, currency),
      penaltyFormatted: formatCurrency(payment.penaltyComponent || 0, currency),
      dateFormatted: new Date(payment.paymentDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber || '',
      notes: payment.notes || '',
    }))

  return {
    currency,
    agreement: {
      id: agreement.id,
      reference: agreement.agreementReference,
      direction: agreement.direction,
      agreementCategory: agreement.agreementCategory || (isCasual ? 'casual' : 'formal'),
      relationship: agreement.relationship || (isCasual ? 'Friend' : null),
      counterparty: agreement.counterpartyName,
      counterpartyPhone: agreement.counterpartyPhone || '',
      counterpartyEmail: agreement.counterpartyEmail || '',
      principalFormatted: formatCurrency(balances.principalAmount, currency),
      interestFormatted: formatCurrency(balances.agreedInterestAmount, currency),
      penaltyFormatted: formatCurrency(balances.penaltyAmount, currency),
      principalPaidFormatted: formatCurrency(balances.principalPaid, currency),
      interestPaidFormatted: formatCurrency(balances.interestPaid, currency),
      penaltyPaidFormatted: formatCurrency(balances.penaltyPaid, currency),
      remainingFormatted: formatCurrency(balances.totalRemaining, currency),
      remainingPrincipalFormatted: formatCurrency(balances.remainingPrincipal, currency),
      remainingInterestFormatted: formatCurrency(balances.remainingInterest, currency),
      remainingPenaltyFormatted: formatCurrency(balances.remainingPenalty, currency),
      totalPaidFormatted: formatCurrency(balances.totalPaid, currency),
      totalObligationFormatted: formatCurrency(balances.totalObligation, currency),
      penaltyType: agreement.penaltyType || 'none',
      penaltyRate: agreement.penaltyRate || 0,
      penaltyGraceDays: agreement.penaltyGraceDays || 0,
      penaltyAmount: agreement.penaltyAmount || 0,
      suggestedPenalty: balances.suggestedPenalty,
      suggestedPenaltyFormatted: formatCurrency(balances.suggestedPenalty, currency),
      overdueDays: balances.overdueDays,
      isOverdue: balances.isOverdue,
      progress: balances.progressPercent,
      status: balances.derivedStatus,
      statusLabel: badge.label,
      statusBg: badge.bg,
      statusText: badge.text,
      agreementDateFormatted: new Date(agreement.agreementDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueDateFormatted: agreement.dueDate ? new Date(agreement.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible / None',
      frequency: (agreement.repaymentFrequency || 'one_time').replace('_', ' ').toUpperCase(),
      notes: agreement.notes || '',
    },
    payments: agreementPayments,
  }
}

export function buildRecordPaymentPayload(
  account?: Account,
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = [],
  params?: Record<string, string>
) {
  const currency = account?.settings.currency || 'KES'
  const agreementId = params?.id
  const agreement = agreements.find((a) => a.id === agreementId)

  if (!agreement) {
    return { notFound: true, currency }
  }

  const balances = calculateAgreementBalances(agreement, payments)

  return {
    currency,
    agreementId: agreement.id,
    reference: agreement.agreementReference,
    counterparty: agreement.counterpartyName,
    direction: agreement.direction,
    remainingAmount: balances.totalRemaining,
    remainingPrincipal: balances.remainingPrincipal,
    remainingInterest: balances.remainingInterest,
    remainingPenalty: balances.remainingPenalty,
    penaltyAmount: balances.penaltyAmount,
    penaltyPaid: balances.penaltyPaid,
    remainingFormatted: formatCurrency(balances.totalRemaining, currency),
    remainingPrincipalFormatted: formatCurrency(balances.remainingPrincipal, currency),
    remainingInterestFormatted: formatCurrency(balances.remainingInterest, currency),
    remainingPenaltyFormatted: formatCurrency(balances.remainingPenalty, currency),
  }
}

export function buildLendingProfilePayload(
  account?: Account,
  profile?: LendingProfile | null
) {
  return {
    profileType: profile?.profileType || 'individual',
    ownerName: profile?.ownerName || account?.settings.fullName || '',
    companyName: profile?.companyName || '',
    mobileNumber: profile?.mobileNumber || account?.settings.phoneNumber || '',
    emailAddress: profile?.emailAddress || account?.settings.email || '',
    officeAddress: profile?.officeAddress || '',
    businessIdentifier: profile?.businessIdentifier || '',
  }
}

export function buildLendingAnalyticsPayload(
  account?: Account,
  agreements: LoanAgreement[] = [],
  payments: LoanPayment[] = []
) {
  const currency = account?.settings.currency || 'KES'
  const summary = calculateLendingSummary(agreements, payments)

  return {
    currency,
    lentRemaining: formatCurrency(summary.totalLentRemaining, currency),
    lentPrincipal: formatCurrency(summary.totalLentPrincipal, currency),
    borrowedRemaining: formatCurrency(summary.totalBorrowedRemaining, currency),
    borrowedPrincipal: formatCurrency(summary.totalBorrowedPrincipal, currency),
    interestReceived: formatCurrency(summary.interestReceivedTotal, currency),
    interestPaid: formatCurrency(summary.interestPaidTotal, currency),
    penaltiesReceived: formatCurrency(summary.penaltiesReceivedTotal, currency),
    penaltiesPaid: formatCurrency(summary.penaltiesPaidTotal, currency),
    activeCount: summary.activeAgreementsCount,
    settledCount: summary.settledAgreementsCount,
    overdueCount: summary.overdueCount,
  }
}
