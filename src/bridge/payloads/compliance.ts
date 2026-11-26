import type { Account, LoanAgreement, LoanPayment } from '../../types'
import {
  PRIVACY_POLICY_VERSION,
  TERMS_OF_SERVICE_VERSION,
} from '../../lib/legal/complianceDocuments'

export function buildCompliancePayload(
  account?: Account,
  loanAgreements: LoanAgreement[] = [],
  loanPayments: LoanPayment[] = []
) {
  if (!account) {
    return {
      isAuthenticated: false,
      privacyVersion: PRIVACY_POLICY_VERSION,
      termsVersion: TERMS_OF_SERVICE_VERSION,
    }
  }

  const c = account.settings.compliance || {}
  const isMinor = Boolean(c.isMinor)
  const guardianStatus = c.guardianConsentStatus || (isMinor ? 'pending' : 'not_required')

  return {
    isAuthenticated: true,
    email: account.settings.email,
    smsTransactionDetection: Boolean(account.settings.smsTransactionDetection),
    privacyVersion: c.privacyVersion || PRIVACY_POLICY_VERSION,
    termsVersion: c.termsVersion || TERMS_OF_SERVICE_VERSION,
    helpTooltipsDisabled: Boolean(c.helpTooltipsDisabled),
    compliance: {
      ageBracket: c.ageBracket || 'adult_18_plus',
      isMinor,
      guardianConsentStatus: guardianStatus,
      guardianName: c.guardianName || '',
      guardianEmail: c.guardianEmail || '',
      guardianConsentToken: c.guardianConsentToken || '',
      termsAcceptedAt: c.termsAcceptedAt || null,
      smsConsentGrantedAt: c.smsConsentGrantedAt || null,
      smsConsentWithdrawnAt: c.smsConsentWithdrawnAt || null,
    },
    counts: {
      transactions: account.transactions.length,
      categories: account.categories.length,
      loanAgreements: loanAgreements.length,
      loanPayments: loanPayments.length,
    },
  }
}
