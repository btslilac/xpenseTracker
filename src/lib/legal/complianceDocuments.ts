import type { Account, LoanAgreement, LoanPayment, UserConsentMetadata } from '../../types'
import { getAccountSummary } from '../finance'

export const PRIVACY_POLICY_VERSION = '2026.11.1'
export const TERMS_OF_SERVICE_VERSION = '2026.11.1'
export const SMS_DISCLOSURE_VERSION = '2026.11.1'

export interface CompliancePlaceholderField {
  key: string
  label: string
  currentValue: string
  note: string
}

export const COMPLIANCE_PLACEHOLDERS: CompliancePlaceholderField[] = [
  {
    key: 'LEGAL_ENTITY_NAME',
    label: 'Registered Legal Entity / Developer Name',
    currentValue: '[PLACEHOLDER: Legal Entity Name / Solo Proprietor Full Registered Name]',
    note: 'Replace with the business registration or incorporated company name before Google Play / ODPC submission.',
  },
  {
    key: 'KENYA_PHYSICAL_ADDRESS',
    label: 'Physical & Postal Address (Kenya)',
    currentValue: '[PLACEHOLDER: Physical Office Street Address, Building, P.O. Box, Nairobi, Kenya]',
    note: 'Required under Kenya Data Protection Act, 2019 transparency notices.',
  },
  {
    key: 'DPO_CONTACT_EMAIL',
    label: 'Dedicated Privacy / DPO Email & Phone',
    currentValue: 'support@xpensetracker.app ([PLACEHOLDER: dedicated privacy@ / DPO phone if appointed])',
    note: 'Verify inbox monitoring SLA for Data Subject Requests (within statutory timelines).',
  },
  {
    key: 'ODPC_REG_NO',
    label: 'ODPC Data Controller / Processor Certificate Number',
    currentValue: '[PLACEHOLDER: ODPC Registration Certificate No. once issued]',
    note: 'Verify threshold applicability and registration status with Office of the Data Protection Commissioner (Kenya).',
  },
  {
    key: 'BACKUP_RETENTION_DAYS',
    label: 'Encrypted Cloud Backup Purge Window',
    currentValue: '[PLACEHOLDER: Confirm exact Supabase automated backup retention window (e.g., 7–30 days)]',
    note: 'Must match active Supabase plan PITR/snapshot configuration.',
  },
  {
    key: 'PUBLIC_COMPLIANCE_BASE_URL',
    label: 'Live Hosted Compliance Base URL',
    currentValue: 'https://btslilac.github.io/xpenseTracker',
    note: 'Ensure GitHub Pages or custom domain serves docs/ before pasting URLs into Google Play Console.',
  },
]

export interface LegalSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: 'controller',
    title: '1. Who We Are & Scope (Kenya Data Protection Act, 2019)',
    paragraphs: [
      'XpenseTracker ("we", "our", or "us") provides personal expense tracking, budgeting, informal & structured lending records, and optional on-device Kenyan M-PESA / bank SMS alert parsing. Operated by [PLACEHOLDER: Legal Entity Name / Registered Operator], [PLACEHOLDER: Physical Address in Kenya], ODPC Ref: [PLACEHOLDER: ODPC Certificate Number if applicable]. Contact: support@xpensetracker.app ([PLACEHOLDER: DPO/Privacy contact]).',
      'This Privacy Policy explains what personal data XpenseTracker collects, what stays strictly on your Android device versus what syncs to cloud infrastructure, our lawful bases under Kenya’s Data Protection Act, 2019 ("DPA"), and how you exercise your rights.',
    ],
  },
  {
    id: 'data-collected',
    title: '2. Personal & Financial Data We Process',
    paragraphs: [
      'We apply strict data minimization and collect only information necessary to deliver the features you choose to use:',
    ],
    bullets: [
      'Account & Identity Data: Email address, display name (full name), optional phone number or date of birth if you enter them in Personal Information, and profile avatar image you choose.',
      'Financial Tracking Data (User-Created Synced Records): Expenses, income entries, custom categories, monthly & category budgets, recurring flags, payment method labels, and personal lending/borrowing agreements & repayment entries.',
      'Compliance & Age Gate Records: Age bracket indicator (18+ or Under 18), parent/guardian contact email/name where required, verification status, versioned legal acceptance timestamps, SMS consent toggle state, and data/deletion request logs.',
      'App Preferences & Security: Theme choices (Liquid Glass, Material 3 Expressive, dark/light mode), currency, reminder preferences, and whether device biometric lock is enabled (biometric templates remain exclusively inside Android hardware/OS APIs; XpenseTracker never accesses raw fingerprints or face scans).',
      'Optional SMS Transaction Alerts (Strictly Opt-In, On-Device Only): Only when you explicitly enable SMS Transaction Detection and grant Android READ_SMS/RECEIVE_SMS permissions does the app inspect incoming alerts from trusted financial sender IDs (such as MPESA, Fuliza, PesaLink, and Kenyan banks) to extract structured amount, counterparty, fee, reference code, Fuliza split/recovery info, and timestamp.',
    ],
  },
  {
    id: 'on-device-vs-cloud',
    title: '3. On-Device Processing vs. Cloud Providers & Subprocessors',
    paragraphs: [
      'We separate raw SMS reading from cloud storage by design:',
    ],
    bullets: [
      'Strictly On-Device Storage & Parsing: Raw SMS alert bodies, native SMS pending queues (SharedPreferences), deduplication fingerprints, and offline AsyncStorage caches stay on your device. Raw SMS message bodies are NOT uploaded to our backend database or third-party analytics/AI APIs. Only a concise transaction candidate confirmed by you is saved to your synced ledger.',
      'Cloud Database & Authentication (Supabase): Account profile metadata, synced transactions, categories, budgets, lending records, release metadata checks, and consent/deletion logs are stored in Supabase (PostgreSQL + Supabase Auth) over TLS encryption and protected by Row-Level Security (RLS).',
      'Optional Google Sign-In: If you sign in with Google, Google LLC authenticates your identity and provides an OAuth ID token/email/name.',
      'WebView UI Assets & App Updates: UI screens load Tailwind/Material icon stylesheets from cdn.tailwindcss.com and fonts.googleapis.com when online; update checks query Supabase release metadata and open GitHub Releases when you choose to download a newer APK.',
    ],
  },
  {
    id: 'lawful-basis',
    title: '4. Lawful Basis & Purpose Limitation',
    paragraphs: [
      'Under Section 30 of the Kenya Data Protection Act, 2019, we process your data strictly for:',
    ],
    bullets: [
      'Contractual Necessity: Providing expense tracking, budgeting, sync, and lending calculation features requested by you.',
      'Explicit Consent (Opt-In): Optional SMS transaction detection, optional biometric app lock, push reminders, and guardian consent for users under 18. You may withdraw consent at any time without affecting prior lawful processing.',
      'Legal Compliance & Security: Enforcing rate limiting, preventing duplicate/fraudulent actions, verifying deletion/access requests, and complying with applicable Kenyan statutory obligations.',
      'No Sale of Data & No Advertising Profiling: We never sell your personal or financial data and do not run third-party behavioral ad SDKs.',
    ],
  },
  {
    id: 'children',
    title: '5. Children’s Privacy & Parental / Guardian Consent (Under 18)',
    paragraphs: [
      'In accordance with the Kenya Data Protection Act, 2019 (Section 33), persons under 18 years of age are children.',
      'During registration we use a privacy-preserving age check ("18 or older" vs "Under 18") without forcing unnecessary identity documents or full birthdates. If an account indicates the user is under 18, it enters a Restricted Pending Guardian Consent state: automated SMS transaction reading and cloud financial tracking remain disabled until a parent or legal guardian reviews and verifies consent via the tokenized guardian verification link.',
      'Parents or guardians may revoke consent or request immediate deletion of a minor’s data at any time via the Parental Consent portal or support@xpensetracker.app.',
    ],
  },
  {
    id: 'retention',
    title: '6. Data Retention, Deletion & Rights Under Kenya DPA',
    paragraphs: [
      'We retain your synced account data only while your account remains active or as necessary to fulfill a pending legal/compliance request. Temporary native SMS event buffers on Android are cleared immediately upon review/dismissal or when you disable SMS detection.',
      'Upon verified account deletion (in-app Privacy & Data Center, Personal Information, or public /account-deletion portal), active database rows across categories, transactions, budgets, lending records, consent logs, and auth credentials are permanently erased, and local caches are wiped. Encrypted infrastructure database snapshots expire within [PLACEHOLDER: Backup Retention Window, e.g., 7–30 days].',
      'Under the Kenya DPA, you have the right to: (a) be informed, (b) access & export your data in machine-readable JSON/CSV format, (c) rectify inaccurate data, (d) request erasure/deletion, (e) restrict or object to processing, and (f) lodge a complaint with the Office of the Data Protection Commissioner (ODPC, www.odpc.go.ke).',
    ],
  },
]

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance & Independent Product Notice',
    paragraphs: [
      'By creating an account or using XpenseTracker, you agree to these Terms of Service and our Privacy Policy. Operated by [PLACEHOLDER: Legal Entity Name / Registered Operator], Kenya.',
      'Important Independence Disclaimer: XpenseTracker is an independent personal finance software application. It is NOT affiliated with, endorsed by, sponsored by, or officially connected with Safaricom PLC, M-PESA, Fuliza M-PESA, KCB, NCBA, PesaLink, or any financial institution.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Accounts for Minors',
    paragraphs: [
      'You must be at least 18 years old to use full financial & SMS automation features independently. Users under 18 may only create an account in a restricted state awaiting verifiable consent from a parent or legal guardian under Kenyan law.',
      'You are responsible for safeguarding your login credentials and biometric/device lock settings, and for providing accurate email information for recovery and compliance communications.',
    ],
  },
  {
    id: 'financial-disclaimer',
    title: '3. Personal Finance, SMS Parsing & Fuliza Disclaimers',
    paragraphs: [
      'XpenseTracker is a record-keeping and organizational tool only. It does NOT move money, originate loans, process payments, or provide licensed investment, accounting, tax, legal, or credit advice.',
      'Automated SMS & Fuliza Classification: On-device M-PESA, Fuliza overdraft split/recovery, and bank SMS parsing rely on message patterns issued by third-party institutions whose wording may change at any time. XpenseTracker surfaces extracted figures for your review and confirmation. You are solely responsible for reviewing and verifying amounts, Fuliza fee/interest splits, loan balances, and categories before saving.',
    ],
  },
  {
    id: 'user-conduct',
    title: '4. Acceptable Use & Lending Records',
    paragraphs: [
      'When recording casual or formal lending agreements, you represent that counterparty contact details and terms you enter are accurate and lawfully held for personal record-keeping. You agree not to misuse the app to harass individuals, submit unlawful content, attempt automated brute-force access, reverse-engineer proprietary protections, or interfere with service availability.',
    ],
  },
  {
    id: 'liability-law',
    title: '5. Availability, Termination & Governing Law (Kenya)',
    paragraphs: [
      'To the maximum extent permitted by Kenyan law, XpenseTracker is provided "as is" and "as available". [PLACEHOLDER: Review statutory consumer protection carve-outs and liability cap with Kenyan legal counsel before final commercial launch.]',
      'You may stop using the app and delete your account at any time inside the app or through our public deletion portal. We may suspend accounts that violate security or legal restrictions after notice where legally appropriate.',
      'These Terms are governed by the laws of the Republic of Kenya, without prejudice to mandatory statutory rights under the Consumer Protection Act and Data Protection Act, 2019.',
    ],
  },
]

export function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value)
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

export interface ExportBuildInput {
  account: Account
  loanAgreements: LoanAgreement[]
  loanPayments: LoanPayment[]
  consents?: UserConsentMetadata
}

export function buildUserDataExportPackage(input: ExportBuildInput): {
  generatedAt: string
  jsonString: string
  csvString: string
  summaryCounts: {
    transactions: number
    categories: number
    loanAgreements: number
    loanPayments: number
    categoryBudgets: number
  }
} {
  const generatedAt = new Date().toISOString()
  const { account, loanAgreements, loanPayments, consents } = input
  const summary = getAccountSummary(account)

  const sanitizedProfile = {
    id: account.id,
    createdAt: account.createdAt,
    fullName: account.settings.fullName,
    email: account.settings.email,
    phoneNumber: account.settings.phoneNumber || '',
    dob: account.settings.dob || '',
    currency: account.settings.currency,
    monthlyBudget: account.settings.monthlyBudget,
    budgetConfigured: Boolean(account.settings.budgetConfigured),
    monthlyIncomeGoal: account.settings.monthlyIncomeGoal,
    savingsGoal: account.settings.savingsGoal,
    smsTransactionDetection: Boolean(account.settings.smsTransactionDetection),
    biometricLock: Boolean(account.settings.biometricLock),
    notifications: account.settings.notifications,
    compliance: consents || account.settings.compliance || {},
  }

  const payload = {
    exportSchema: 'xpensetracker.dsar.export.v1',
    generatedAt,
    profile: sanitizedProfile,
    summary,
    categories: account.categories,
    categoryBudgets: account.settings.categoryBudgets || [],
    transactions: account.transactions,
    loanAgreements,
    loanPayments,
  }

  const lines: string[] = []
  lines.push('SECTION,FIELD_OR_ID,TYPE_OR_CATEGORY,AMOUNT,CURRENCY,DATE,STATUS_OR_METHOD,NOTES_OR_DETAILS')

  lines.push([
    'PROFILE',
    account.id,
    sanitizedProfile.fullName,
    sanitizedProfile.monthlyBudget,
    sanitizedProfile.currency,
    generatedAt,
    sanitizedProfile.compliance.guardianConsentStatus || 'active',
    `Email=${sanitizedProfile.email}; SMSOptIn=${sanitizedProfile.smsTransactionDetection}`,
  ].map(escapeCsvCell).join(','))

  account.categories.forEach((c) => {
    lines.push([
      'CATEGORY',
      c.id,
      `${c.type}:${c.name}`,
      '',
      sanitizedProfile.currency,
      '',
      `order=${c.order}`,
      `icon=${c.icon}`,
    ].map(escapeCsvCell).join(','))
  })

  ;(account.settings.categoryBudgets || []).forEach((b) => {
    lines.push([
      'CATEGORY_BUDGET',
      b.categoryId,
      'budget',
      b.amount,
      sanitizedProfile.currency,
      '',
      'configured',
      '',
    ].map(escapeCsvCell).join(','))
  })

  const catMap = new Map(account.categories.map((c) => [c.id, c.name]))
  account.transactions.forEach((tx) => {
    lines.push([
      'TRANSACTION',
      tx.id,
      `${tx.type}:${catMap.get(tx.categoryId) || tx.categoryId}`,
      tx.amount,
      sanitizedProfile.currency,
      tx.date,
      tx.paymentMethod,
      tx.note || '',
    ].map(escapeCsvCell).join(','))
  })

  loanAgreements.forEach((agr) => {
    lines.push([
      'LOAN_AGREEMENT',
      agr.id,
      `${agr.agreementCategory}:${agr.direction}`,
      agr.principalAmount,
      agr.currencyCode,
      agr.agreementDate,
      agr.status,
      `Ref=${agr.agreementReference}; Counterparty=${agr.counterpartyName}`,
    ].map(escapeCsvCell).join(','))
  })

  loanPayments.forEach((pmt) => {
    lines.push([
      'LOAN_PAYMENT',
      pmt.id,
      pmt.agreementId,
      pmt.amount,
      sanitizedProfile.currency,
      pmt.paymentDate,
      pmt.paymentMethod,
      pmt.notes || '',
    ].map(escapeCsvCell).join(','))
  })

  return {
    generatedAt,
    jsonString: JSON.stringify(payload, null, 2),
    csvString: lines.join('\n'),
    summaryCounts: {
      transactions: account.transactions.length,
      categories: account.categories.length,
      loanAgreements: loanAgreements.length,
      loanPayments: loanPayments.length,
      categoryBudgets: (account.settings.categoryBudgets || []).length,
    },
  }
}
