export type TransactionType = 'expense' | 'income'

export type NotificationSettings = {
  billReminders: boolean
  weeklyDigest: boolean
  unusualSpendAlerts: boolean
  loanReminders?: boolean
}

export type VisualStyle = 'liquid-glass' | 'material-expressive' | 'material'
export type ResolvedVisualStyle = 'liquid-glass' | 'material-expressive'
export type ColorSchemePreference = 'system' | 'light' | 'dark'
export type ColorThemeId = 'wallpaper' | 'concept' | 'violet' | 'coral'

export type AppearanceSettings = {
  style: VisualStyle
  colorScheme: ColorSchemePreference
  pureBlack?: boolean
  colorTheme?: ColorThemeId
  reducedMotion?: boolean
  updatedAt?: string
}

export type SyncMetadata = {
  isOnline: boolean
  pendingCount: number
  lastSyncedAt?: string
}

export type LendingSettings = {
  enabled: boolean
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  order: number
}

export type Transaction = {
  id: string
  amount: number
  categoryId: string
  note: string
  date: string
  type: TransactionType
  paymentMethod: string
  recurring: boolean
}

export type UserSettings = {
  fullName: string
  email: string
  avatarDataUrl?: string
  currency: string
  monthlyBudget: number
  budgetConfigured?: boolean
  monthlyIncomeGoal: number
  savingsGoal: number
  phoneNumber?: string
  dob?: string
  notifications: NotificationSettings
  categoryBudgets?: { categoryId: string; amount: number }[]
  appearance?: AppearanceSettings
  lending?: LendingSettings
  smsTransactionDetection?: boolean
  biometricLock?: boolean
}

export type Account = {
  id: string
  createdAt: string
  settings: UserSettings
  categories: Category[]
  transactions: Transaction[]
}

export type UserDocument = {
  createdAt: string
  settings: UserSettings
}

export type CategoryDraft = Pick<Category, 'name' | 'icon' | 'color' | 'type'>

export type TransactionDraft = Omit<Transaction, 'id'>

export type RouteName = 'dashboard' | 'transactions' | 'analytics' | 'categories' | 'settings' | 'add'

// ---------------------------------------------------------------------------
// Lending & Borrowing Types
// ---------------------------------------------------------------------------

export type LoanDirection = 'lent' | 'borrowed'
export type AgreementCategory = 'casual' | 'formal'
export type CasualRelationship = 'Family' | 'Friend' | 'Co-worker' | 'Business Partner' | 'Other'
export type InterestType = 'none' | 'fixed' | 'simple'
export type RepaymentFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
export type PenaltyType = 'none' | 'fixed' | 'percentage' | 'daily'
export type LoanStatus =
  | 'active'
  | 'due_soon'
  | 'partially_repaid'
  | 'overdue'
  | 'settled'
  | 'cancelled'
  | 'written_off'

export type LoanAgreement = {
  id: string
  userId: string
  agreementReference: string
  direction: LoanDirection
  agreementCategory?: AgreementCategory
  relationship?: CasualRelationship
  counterpartyName: string
  counterpartyPhone?: string
  counterpartyEmail?: string
  principalAmount: number
  currencyCode: string
  agreementDate: string
  dueDate?: string
  repaymentFrequency: RepaymentFrequency
  interestType: InterestType
  agreedInterestAmount: number
  interestRate?: number
  interestCalculationPeriod?: string
  penaltyType?: PenaltyType
  penaltyRate?: number
  penaltyAmount?: number
  penaltyGraceDays?: number
  notes?: string
  status: LoanStatus
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export type LoanAgreementDraft = Omit<LoanAgreement, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'agreementReference'> & {
  agreementReference?: string
  status?: LoanStatus
}

export type LoanPayment = {
  id: string
  userId: string
  agreementId: string
  idempotencyKey: string
  amount: number
  penaltyComponent: number
  interestComponent: number
  principalComponent: number
  paymentDate: string
  paymentMethod: string
  referenceNumber?: string
  notes?: string
  createdAt: string
  createdBy?: string
}

export type LoanPaymentDraft = Omit<LoanPayment, 'id' | 'userId' | 'createdAt' | 'penaltyComponent'> & {
  penaltyComponent?: number
}

export type LoanActivity = {
  id: string
  userId: string
  agreementId: string
  eventType: string
  description: string
  previousValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  actorId?: string
  createdAt: string
}

export type LendingProfile = {
  id: string
  userId: string
  profileType: 'individual' | 'company'
  companyName?: string
  ownerName?: string
  mobileNumber?: string
  emailAddress?: string
  officeAddress?: string
  businessIdentifier?: string
  logoPath?: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// In-App Updates Types
// ---------------------------------------------------------------------------

export type UpdateCheckStatus =
  | 'idle'
  | 'checking'
  | 'up_to_date'
  | 'update_available'
  | 'downloading'
  | 'download_complete'
  | 'ready_to_restart'
  | 'update_required'
  | 'offline'
  | 'failed'
  | 'unsupported_native'

export type AppReleaseMetadata = {
  version: string
  releaseTitle: string
  releaseNotes: string
  publishedAt: string
  updateType: 'ota' | 'native'
  isMandatory: boolean
  minNativeVersion?: string
  storeUrl?: string
}
