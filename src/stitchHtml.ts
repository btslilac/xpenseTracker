import { signUp } from './templates/auth/signUp'
import { signIn } from './templates/auth/signIn'
import { forgotPassword } from './templates/auth/forgotPassword'
import { welcome } from './templates/main/welcome'
import { dashboard } from './templates/main/dashboard'
import { transactions } from './templates/main/transactions'
import { analytics } from './templates/main/analytics'
import { profile } from './templates/main/profile'
import { categories } from './templates/main/categories'
import { addExpense } from './templates/actions/addExpense'
import { addCategory } from './templates/actions/addCategory'
import { categoryPopup } from './templates/actions/categoryPopup'
import { personalInfo } from './templates/settings/personalInfo'
import { budget } from './templates/settings/budget'
import { notifications } from './templates/settings/notifications'
import { helpSupport } from './templates/settings/helpSupport'
import { appearance } from './templates/settings/appearance'
import { lendingDashboard } from './templates/lending/dashboard'
import { lendingAgreements } from './templates/lending/agreements'
import { createAgreement } from './templates/lending/createAgreement'
import { agreementDetails } from './templates/lending/agreementDetails'
import { recordPayment } from './templates/lending/recordPayment'
import { lendingProfile } from './templates/settings/lendingProfile'
import { lendingAnalytics } from './templates/lending/analytics'
import { updateCenter } from './templates/settings/updateCenter'
import { privacyPolicy } from './templates/settings/privacyPolicy'
import { termsOfService } from './templates/settings/termsOfService'
import { privacyDataCenter } from './templates/settings/privacyDataCenter'
import { parentalConsent } from './templates/settings/parentalConsent'

export const stitchHtml = {
  signUp,
  signIn,
  forgotPassword,
  privacyPolicy,
  termsOfService,
  privacyDataCenter,
  parentalConsent,
  welcome,
  dashboard,
  transactions,
  analytics,
  profile,
  categories,
  addExpense,
  addCategory,
  categoryPopup,
  personalInfo,
  budget,
  notifications,
  helpSupport,
  appearance,
  lendingDashboard,
  lendingAgreements,
  createAgreement,
  agreementDetails,
  recordPayment,
  lendingProfile,
  lendingAnalytics,
  updateCenter,
} as const;
