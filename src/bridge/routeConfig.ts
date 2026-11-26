import { stitchHtml } from '../stitchHtml'
import type { Account, LendingProfile, LoanAgreement, LoanPayment } from '../types'
import { addCategoryScript, addExpenseScript } from './scripts/actionScreens'
import { analyticsScript } from './scripts/analytics'
import { authScript } from './scripts/auth'
import { categoriesScript } from './scripts/categories'
import { dashboardScript } from './scripts/dashboard'
import { profileScript } from './scripts/profile'
import { budgetScript, helpSupportScript, notificationsScript, personalInfoScript } from './scripts/settings'
import { sharedScript } from './scripts/shared'
import { transactionsScript } from './scripts/transactions'
import { appearanceScript } from './scripts/appearance'
import {
  agreementDetailsScript,
  createAgreementScript,
  lendingAgreementsScript,
  lendingAnalyticsScript,
  lendingDashboardScript,
  lendingProfileScript,
  recordPaymentScript,
} from './scripts/lending'
import { updateCenterScript } from './scripts/updateCenter'
import { legalDocScript, parentalConsentScript, privacyDataCenterScript } from './scripts/compliance'
import { buildCompliancePayload } from './payloads/compliance'
import type { StitchRoute } from './routes'
import { buildAddExpensePayload } from './payloads/addExpense'
import { buildAnalyticsPayload } from './payloads/analytics'
import { buildEditCategoryPayload, buildCategoriesPayload } from './payloads/categories'
import { buildDashboardPayload } from './payloads/dashboard'
import { buildBudgetPayload, buildNotificationsPayload, buildProfilePayload } from './payloads/settings'
import { buildTransactionsPayload } from './payloads/transactions'
import { buildAppearancePayload } from './payloads/appearance'
import {
  buildAgreementDetailsPayload,
  buildLendingAgreementsPayload,
  buildLendingAnalyticsPayload,
  buildLendingDashboardPayload,
  buildLendingProfilePayload,
  buildRecordPaymentPayload,
} from './payloads/lending'
import { buildUpdateCenterPayload } from './payloads/updateCenter'

export type LendingPayloadContext = {
  agreements?: LoanAgreement[]
  payments?: LoanPayment[]
  profile?: LendingProfile | null
}

type RouteConfig = {
  html: string
  script: () => string
  payload?: (account?: Account, params?: Record<string, string>, lending?: LendingPayloadContext) => unknown
}

const routeConfig: Record<StitchRoute, RouteConfig> = {
  signin: {
    html: stitchHtml.signIn,
    script: () => authScript('signin'),
  },
  signup: {
    html: stitchHtml.signUp,
    script: () => authScript('signup'),
  },
  forgotPassword: {
    html: stitchHtml.forgotPassword,
    script: () => authScript('forgotPassword'),
  },
  privacyPolicy: {
    html: stitchHtml.privacyPolicy,
    script: legalDocScript,
    payload: (account, _params, lending) =>
      buildCompliancePayload(account, lending?.agreements, lending?.payments),
  },
  termsOfService: {
    html: stitchHtml.termsOfService,
    script: legalDocScript,
    payload: (account, _params, lending) =>
      buildCompliancePayload(account, lending?.agreements, lending?.payments),
  },
  privacyDataCenter: {
    html: stitchHtml.privacyDataCenter,
    script: privacyDataCenterScript,
    payload: (account, _params, lending) =>
      buildCompliancePayload(account, lending?.agreements, lending?.payments),
  },
  parentalConsent: {
    html: stitchHtml.parentalConsent,
    script: parentalConsentScript,
    payload: (account, _params, lending) =>
      buildCompliancePayload(account, lending?.agreements, lending?.payments),
  },
  dashboard: {
    html: stitchHtml.dashboard,
    script: dashboardScript,
    payload: buildDashboardPayload,
  },
  transactions: {
    html: stitchHtml.transactions,
    script: transactionsScript,
    payload: buildTransactionsPayload,
  },
  analytics: {
    html: stitchHtml.analytics,
    script: analyticsScript,
    payload: buildAnalyticsPayload,
  },
  addExpense: {
    html: stitchHtml.addExpense,
    script: addExpenseScript,
    payload: (account, params) => ({ ...buildAddExpensePayload(account), prefill: params }),
  },
  profile: {
    html: stitchHtml.profile,
    script: profileScript,
    payload: buildProfilePayload,
  },
  categories: {
    html: stitchHtml.categories,
    script: categoriesScript,
    payload: buildCategoriesPayload,
  },
  addCategory: {
    html: stitchHtml.addCategory,
    script: addCategoryScript,
  },
  editCategory: {
    html: stitchHtml.addCategory,
    script: addCategoryScript,
    payload: buildEditCategoryPayload as any,
  },
  personalInfo: {
    html: stitchHtml.personalInfo,
    script: personalInfoScript,
    payload: buildProfilePayload,
  },
  budget: {
    html: stitchHtml.budget,
    script: budgetScript,
    payload: buildBudgetPayload,
  },
  notifications: {
    html: stitchHtml.notifications,
    script: notificationsScript,
    payload: (account, params) => buildNotificationsPayload(account, params),
  },
  helpSupport: {
    html: stitchHtml.helpSupport,
    script: helpSupportScript,
    payload: buildProfilePayload,
  },
  welcome: {
    html: stitchHtml.welcome,
    script: sharedScript,
  },
  appearance: {
    html: stitchHtml.appearance,
    script: appearanceScript,
    payload: buildAppearancePayload,
  },
  settings: {
    html: stitchHtml.appearance,
    script: appearanceScript,
    payload: buildAppearancePayload,
  },
  lendingDashboard: {
    html: stitchHtml.lendingDashboard,
    script: lendingDashboardScript,
    payload: (account, _params, lending) =>
      buildLendingDashboardPayload(account, lending?.agreements, lending?.payments, lending?.profile),
  },
  lendingAgreements: {
    html: stitchHtml.lendingAgreements,
    script: lendingAgreementsScript,
    payload: (account, params, lending) =>
      buildLendingAgreementsPayload(account, lending?.agreements, lending?.payments, params),
  },
  createAgreement: {
    html: stitchHtml.createAgreement,
    script: createAgreementScript,
    payload: (account, params, lending) => {
      const editId = params?.editId || ''
      const editAgreement = editId
        ? (lending?.agreements || []).find((a) => a.id === editId)
        : undefined
      const resolvedMode = editAgreement
        ? (editAgreement.agreementCategory === 'formal' ? 'formal' : 'casual')
        : (params?.origin || params?.mode || 'casual')
      const resolvedOrigin = editAgreement
        ? (editAgreement.agreementCategory === 'formal' ? 'formal' : 'casual')
        : (params?.origin || (params?.mode === 'casual' || params?.mode === 'formal' ? params.mode : ''))
      const resolvedDirection = editAgreement
        ? editAgreement.direction
        : (params?.direction || 'lent')

      return {
        currency: account?.settings.currency || 'KES',
        initialMode: resolvedMode,
        originCategory: resolvedOrigin,
        modeLocked: Boolean(editAgreement || resolvedOrigin === 'casual' || resolvedOrigin === 'formal'),
        initialDirection: resolvedDirection,
        editAgreement: editAgreement
          ? {
              id: editAgreement.id,
              agreementReference: editAgreement.agreementReference,
              agreementCategory: editAgreement.agreementCategory || resolvedMode,
              direction: editAgreement.direction,
              relationship: editAgreement.relationship || 'Friend',
              counterpartyName: editAgreement.counterpartyName,
              counterpartyPhone: editAgreement.counterpartyPhone || '',
              counterpartyEmail: editAgreement.counterpartyEmail || '',
              principalAmount: editAgreement.principalAmount,
              agreementDate: editAgreement.agreementDate,
              dueDate: editAgreement.dueDate || '',
              repaymentFrequency: editAgreement.repaymentFrequency,
              interestType: editAgreement.interestType,
              agreedInterestAmount: editAgreement.agreedInterestAmount || 0,
              interestRate: editAgreement.interestRate || 0,
              interestCalculationPeriod: editAgreement.interestCalculationPeriod || 'monthly',
              penaltyType: editAgreement.penaltyType || 'none',
              penaltyRate: editAgreement.penaltyRate || 0,
              penaltyAmount: editAgreement.penaltyAmount || 0,
              penaltyGraceDays: editAgreement.penaltyGraceDays || 0,
              notes: editAgreement.notes || '',
            }
          : null,
        prefill: params || {},
      }
    },
  },
  agreementDetails: {
    html: stitchHtml.agreementDetails,
    script: agreementDetailsScript,
    payload: (account, params, lending) =>
      buildAgreementDetailsPayload(account, lending?.agreements, lending?.payments, params),
  },
  recordPayment: {
    html: stitchHtml.recordPayment,
    script: recordPaymentScript,
    payload: (account, params, lending) =>
      buildRecordPaymentPayload(account, lending?.agreements, lending?.payments, params),
  },
  lendingProfile: {
    html: stitchHtml.lendingProfile,
    script: lendingProfileScript,
    payload: (account, _params, lending) =>
      buildLendingProfilePayload(account, lending?.profile),
  },
  lendingAnalytics: {
    html: stitchHtml.lendingAnalytics,
    script: lendingAnalyticsScript,
    payload: (account, _params, lending) =>
      buildLendingAnalyticsPayload(account, lending?.agreements, lending?.payments),
  },
  updateCenter: {
    html: stitchHtml.updateCenter,
    script: updateCenterScript,
    payload: buildUpdateCenterPayload,
  },
}

export function getRouteConfig(route: StitchRoute) {
  return routeConfig[route] ?? routeConfig.dashboard
}
