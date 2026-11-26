import assert from 'node:assert/strict'
import test from 'node:test'
import {
  checkLoginRateLimit,
  classifyAuthError,
  evaluatePasswordStrength,
  isValidEmail,
  recordLoginAttemptOutcome,
  resetLoginRateLimitsForTests,
} from '../src/lib/auth/authSecurity'
import {
  buildUserDataExportPackage,
  COMPLIANCE_PLACEHOLDERS,
  escapeCsvCell,
  PRIVACY_POLICY_VERSION,
  TERMS_OF_SERVICE_VERSION,
} from '../src/lib/legal/complianceDocuments'
import {
  correlateParsedSmsTransactions,
  isTrustedSender,
  parseTransactionSms,
  parseTransactionSmsOutcome,
} from '../src/lib/sms/parseTransactionSms'
import type { Account, LoanAgreement, LoanPayment } from '../src/types'

test('Auth security: email validation, password strength, rate limiting, and error scoping', () => {
  assert.equal(isValidEmail('user@example.com'), true)
  assert.equal(isValidEmail('bad-email'), false)

  const weak = evaluatePasswordStrength('password123')
  assert.equal(weak.isAcceptable, false)

  const strong = evaluatePasswordStrength('Keny@Fin2026!')
  assert.equal(strong.isAcceptable, true)
  assert.ok(strong.score >= 3)

  // Network/timeout/rate-limit MUST NEVER classify as invalid_credentials (prevents wrong-pw vibration bug)
  assert.equal(classifyAuthError('Network request failed').errorType, 'network')
  assert.equal(classifyAuthError('Failed to fetch', 0).errorType, 'network')
  assert.equal(classifyAuthError('Request timed out', 504).errorType, 'network')
  assert.equal(classifyAuthError('Email not confirmed').errorType, 'email_not_confirmed')
  assert.equal(classifyAuthError('Too many requests', 429).errorType, 'rate_limited')
  assert.equal(classifyAuthError('Invalid login credentials', 400).errorType, 'invalid_credentials')

  // Client rate limiter triggers temporary cooldown after 5 consecutive failures and clears on success
  resetLoginRateLimitsForTests()
  const now = 1_700_000_000_000
  for (let i = 0; i < 4; i++) {
    const out = recordLoginAttemptOutcome('alice@example.com', false, now + i * 1000)
    assert.equal(out.retryAfterSeconds, 0)
  }
  const fifth = recordLoginAttemptOutcome('alice@example.com', false, now + 5000)
  assert.equal(fifth.retryAfterSeconds, 30)
  assert.equal(checkLoginRateLimit('alice@example.com', now + 6000).allowed, false)
  assert.equal(checkLoginRateLimit('alice@example.com', now + 40000).allowed, true)
  recordLoginAttemptOutcome('alice@example.com', true)
  assert.equal(checkLoginRateLimit('alice@example.com', now + 6000).allowed, true)
})

test('SMS Anti-spoofing and non-transaction filtering', () => {
  assert.equal(isTrustedSender('MPESA'), true)
  assert.equal(isTrustedSender('FULIZA'), true)
  assert.equal(isTrustedSender('+254712345678'), false)
  assert.equal(isTrustedSender('0712345678'), false)

  const spoofed = parseTransactionSms('0712345678', 'UA10ABC123 Confirmed. Ksh 500.00 sent to TEST')
  assert.equal(spoofed, null)

  const promo = parseTransactionSmsOutcome('MPESA', 'Dear Customer, enjoy 50% bonus airtime today only!')
  assert.equal(promo.status, 'unsupported')

  const otp = parseTransactionSmsOutcome('KCB', 'Your OTP verification code is 482910. Do not share.')
  assert.equal(otp.status, 'unsupported')

  const limitNotice = parseTransactionSmsOutcome('MPESA', 'Your Fuliza M-PESA limit is now Ksh 5,000.00')
  assert.equal(limitNotice.status, 'unsupported')
})

test('SMS Fuliza Borrow is never misclassified as income', () => {
  const fulizaSms =
    'UL12ABC345 Confirmed. Fuliza M-PESA amount is Ksh 500.00. Access fee charged Ksh 5.00. Total Fuliza M-PESA outstanding balance is Ksh 505.00 on 26/11/26 at 10:00 AM.'
  const parsed = parseTransactionSms('MPESA', fulizaSms)
  if (!parsed) throw new Error('Expected parsed Fuliza SMS')
  assert.equal(parsed.classificationCategory, 'FULIZA_BORROWING')
  assert.notEqual(parsed.direction, 'INCOMING')
  assert.equal(parsed.amount, 500)
  assert.equal(parsed.fulizaDetails?.fulizaAccessFee, 5)
  assert.equal(parsed.fulizaDetails?.outstandingFulizaBalance, 505)
})

test('Scenario A: Paired outgoing Buy Goods + Fuliza Borrow correlates into 1 split expense candidate', () => {
  const baseTs = new Date('2026-11-26T10:15:00.000Z').getTime()
  const primary = parseTransactionSms(
    'MPESA',
    'UA10XYZ901 Confirmed. Ksh 1,500.00 paid to NAIVAS SUPERMARKET on 26/11/26 at 1:15 PM. New M-PESA balance is Ksh 0.00. Transaction cost, Ksh 0.00.',
    baseTs,
  )
  const fuliza = parseTransactionSms(
    'MPESA',
    'UA10XYZ902 Confirmed. Fuliza M-PESA amount is Ksh 600.00. Access fee charged Ksh 6.00. Total Fuliza M-PESA outstanding balance is Ksh 606.00 on 26/11/26 at 1:15 PM.',
    baseTs + 2000,
  )
  if (!primary || !fuliza) throw new Error('Expected both Scenario A messages to parse')

  const correlated = correlateParsedSmsTransactions([primary, fuliza])
  assert.equal(correlated.length, 1)
  const item = correlated[0]
  assert.equal(item.classificationCategory, 'CONFIRMED_EXPENSE')
  assert.equal(item.amount, 1500)
  assert.equal(item.fulizaDetails?.isFulizaInvolved, true)
  assert.equal(item.fulizaDetails?.fulizaAmount, 600)
  assert.equal(item.fulizaDetails?.walletPortion, 900)
  assert.equal(item.fulizaDetails?.fulizaAccessFee, 6)
  assert.equal(item.correlatedFingerprints?.length, 2)
})

test('Scenario B & C: Incoming money + Fuliza auto-recovery (paired & inline, partial & full) without double-counting', () => {
  const baseTs = new Date('2026-11-26T11:00:00.000Z').getTime()
  const incoming = parseTransactionSms(
    'MPESA',
    'UB20INC001 Confirmed. You have received Ksh 2,000.00 from JOHN DOE 0712345678 on 26/11/26 at 2:00 PM. New M-PESA balance is Ksh 1,400.00.',
    baseTs,
  )
  const recovery = parseTransactionSms(
    'MPESA',
    'UB20REC002 Confirmed. Ksh 600.00 from your M-PESA has been used to fully pay your Fuliza M-PESA. Total Fuliza M-PESA outstanding balance is Ksh 0.00 on 26/11/26 at 2:00 PM.',
    baseTs + 3000,
  )
  if (!incoming || !recovery) throw new Error('Expected incoming and recovery SMS to parse')
  assert.equal(recovery.classificationCategory, 'FULIZA_REPAYMENT')
  assert.equal(recovery.fulizaDetails?.isPartialRecovery, false)

  const correlated = correlateParsedSmsTransactions([incoming, recovery])
  assert.equal(correlated.length, 1)
  assert.equal(correlated[0].classificationCategory, 'CONFIRMED_INCOME')
  assert.equal(correlated[0].fulizaDetails?.grossInflowAmount, 2000)
  assert.equal(correlated[0].fulizaDetails?.fulizaAmount, 600)
  assert.equal(correlated[0].fulizaDetails?.netWalletImpact, 1400)

  // Standalone partial Fuliza recovery SMS
  const partialSms =
    'UC30PAR003 Confirmed. Ksh 300.00 from your M-PESA has been used to partially pay your Fuliza M-PESA. Fuliza M-PESA outstanding balance is Ksh 200.00.'
  const partial = parseTransactionSms('MPESA', partialSms)
  if (!partial) throw new Error('Expected partial recovery SMS to parse')
  assert.equal(partial.classificationCategory, 'FULIZA_REPAYMENT')
  assert.equal(partial.fulizaDetails?.isPartialRecovery, true)
  assert.equal(partial.fulizaDetails?.outstandingFulizaBalance, 200)
})

test('Scenario: Ambiguous closely-spaced payments do not misattribute Fuliza overdraft', () => {
  const baseTs = new Date('2026-11-26T12:00:00.000Z').getTime()
  const tx1 = parseTransactionSms(
    'MPESA',
    'UD10AAA111 Confirmed. Ksh 800.00 paid to JAVA HOUSE on 26/11/26 at 3:00 PM.',
    baseTs,
  )
  const tx2 = parseTransactionSms(
    'MPESA',
    'UD10BBB222 Confirmed. Ksh 900.00 paid to CARREFOUR on 26/11/26 at 3:00 PM.',
    baseTs + 10_000,
  )
  const fuliza = parseTransactionSms(
    'MPESA',
    'UD10FUL333 Confirmed. Fuliza M-PESA amount is Ksh 500.00 on 26/11/26 at 3:00 PM.',
    baseTs + 15_000,
  )
  if (!tx1 || !tx2 || !fuliza) throw new Error('Expected ambiguous fixture messages to parse')
  const res = correlateParsedSmsTransactions([tx1, tx2, fuliza])
  // Kept separate safely instead of guessing between JAVA HOUSE and CARREFOUR
  assert.equal(res.length, 3)
})

test('Compliance DSAR Data Export & CSV quoting + legal placeholders', () => {
  assert.ok(PRIVACY_POLICY_VERSION.length > 0)
  assert.ok(TERMS_OF_SERVICE_VERSION.length > 0)
  assert.ok(COMPLIANCE_PLACEHOLDERS.some((p) => p.currentValue.includes('[PLACEHOLDER')))

  assert.equal(escapeCsvCell('Naivas, "Westlands"'), '"Naivas, ""Westlands"""')

  const mockAccount: Account = {
    id: 'user-1',
    createdAt: '2026-11-01T00:00:00.000Z',
    settings: {
      fullName: 'Amina Wanjiku',
      email: 'amina@example.com',
      currency: 'KES',
      monthlyBudget: 25000,
      budgetConfigured: true,
      monthlyIncomeGoal: 60000,
      savingsGoal: 15000,
      notifications: { billReminders: true, weeklyDigest: false, unusualSpendAlerts: true },
      compliance: {
        ageBracket: 'adult_18_plus',
        isMinor: false,
        guardianConsentStatus: 'not_required',
        termsVersion: TERMS_OF_SERVICE_VERSION,
        privacyVersion: PRIVACY_POLICY_VERSION,
      },
    },
    categories: [{ id: 'cat-1', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444', type: 'expense', order: 0 }],
    transactions: [
      {
        id: 'tx-1',
        amount: 1500,
        categoryId: 'cat-1',
        note: 'MPESA To Naivas, Westlands',
        date: '2026-11-26T10:15:00.000Z',
        type: 'expense',
        paymentMethod: 'MPESA',
        recurring: false,
      },
    ],
  }
  const agr: LoanAgreement[] = []
  const pay: LoanPayment[] = []

  const pkg = buildUserDataExportPackage({
    account: mockAccount,
    loanAgreements: agr,
    loanPayments: pay,
  })

  const parsedJson = JSON.parse(pkg.jsonString)
  assert.equal(parsedJson.exportSchema, 'xpensetracker.dsar.export.v1')
  assert.equal(parsedJson.summary.expenses, 1500)
  assert.equal(pkg.summaryCounts.transactions, 1)
  assert.ok(pkg.csvString.includes('"MPESA To Naivas, Westlands"'))
})
