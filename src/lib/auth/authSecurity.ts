import type { AuthErrorType } from '../../types'

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Too weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong'
  isAcceptable: boolean
  checks: {
    minLength: boolean
    hasLower: boolean
    hasUpper: boolean
    hasNumber: boolean
    hasSymbol: boolean
    notCommon: boolean
  }
  feedback: string
}

const COMMON_WEAK_PASSWORDS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'qwerty123',
  '11111111',
  '00000000',
  'letmein123',
  'xpensetracker',
])

export function isValidEmail(email: string): boolean {
  const trimmed = String(email || '').trim()
  if (trimmed.length < 5 || trimmed.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const raw = String(password || '')
  const minLength = raw.length >= 8
  const hasLower = /[a-z]/.test(raw)
  const hasUpper = /[A-Z]/.test(raw)
  const hasNumber = /\d/.test(raw)
  const hasSymbol = /[^A-Za-z0-9]/.test(raw)
  const notCommon = !COMMON_WEAK_PASSWORDS.has(raw.trim().toLowerCase())

  let scoreNum = 0
  if (minLength) scoreNum += 1
  if (hasLower && hasUpper) scoreNum += 1
  if (hasNumber) scoreNum += 1
  if (hasSymbol || raw.length >= 12) scoreNum += 1
  if (!notCommon || raw.length < 6) {
    scoreNum = Math.min(scoreNum, 1)
  }

  const score = Math.max(0, Math.min(4, scoreNum)) as 0 | 1 | 2 | 3 | 4
  const labels: PasswordStrengthResult['label'][] = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  const isAcceptable = minLength && notCommon && ((hasLower && (hasUpper || hasNumber || hasSymbol)) || raw.length >= 10)

  const missing: string[] = []
  if (!minLength) missing.push('at least 8 characters')
  if (!hasUpper) missing.push('an uppercase letter')
  if (!hasNumber) missing.push('a number')
  if (!hasSymbol) missing.push('a symbol')

  let feedback = 'Solid password.'
  if (!notCommon) {
    feedback = 'Avoid common passwords that are easy to guess.'
  } else if (missing.length > 0 && !isAcceptable) {
    feedback = `Use ${missing.slice(0, 2).join(' and ')}.`
  } else if (score <= 2) {
    feedback = `Add ${missing[0] || 'more characters'} to make it stronger.`
  }

  return {
    score,
    label: labels[score],
    isAcceptable,
    checks: { minLength, hasLower, hasUpper, hasNumber, hasSymbol, notCommon },
    feedback,
  }
}

export function classifyAuthError(rawMessage: string, status?: number): {
  errorType: AuthErrorType
  userMessage: string
} {
  const msg = String(rawMessage || '').trim()
  const lower = msg.toLowerCase()

  // Strict network / timeout / availability checks FIRST so connectivity problems never trigger wrong-password UX
  if (
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('unable to resolve host') ||
    lower.includes('connection') ||
    lower.includes('offline') ||
    status === 0 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return {
      errorType: 'network',
      userMessage: 'We could not reach the sign-in service. Check your internet connection and try again.',
    }
  }

  if (
    lower.includes('too many requests') ||
    lower.includes('rate limit') ||
    lower.includes('over_request_rate_limit') ||
    lower.includes('for security purposes, you can only request this after') ||
    status === 429
  ) {
    return {
      errorType: 'rate_limited',
      userMessage: 'Too many sign-in attempts. Please wait a moment before trying again.',
    }
  }

  if (lower.includes('email not confirmed') || lower.includes('confirm your email')) {
    return {
      errorType: 'email_not_confirmed',
      userMessage: 'Please verify your email address using the link sent to your inbox before signing in.',
    }
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid_credentials') ||
    lower.includes('invalid_grant') ||
    lower.includes('wrong password') ||
    lower.includes('invalid password')
  ) {
    return {
      errorType: 'invalid_credentials',
      userMessage: 'Incorrect email or password. Please check your password and try again.',
    }
  }

  return {
    errorType: 'unknown',
    userMessage: msg || 'Authentication could not be completed. Please try again.',
  }
}

type AttemptState = {
  failures: number
  lockedUntilMs: number
}

const attemptMap = new Map<string, AttemptState>()

export function checkLoginRateLimit(identifier: string, nowMs = Date.now()): {
  allowed: boolean
  retryAfterSeconds: number
} {
  const key = String(identifier || '').trim().toLowerCase() || '_default'
  const entry = attemptMap.get(key)
  if (!entry) return { allowed: true, retryAfterSeconds: 0 }
  if (entry.lockedUntilMs > nowMs) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.lockedUntilMs - nowMs) / 1000)),
    }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordLoginAttemptOutcome(
  identifier: string,
  succeeded: boolean,
  nowMs = Date.now(),
): {
  failures: number
  retryAfterSeconds: number
} {
  const key = String(identifier || '').trim().toLowerCase() || '_default'
  if (succeeded) {
    attemptMap.delete(key)
    return { failures: 0, retryAfterSeconds: 0 }
  }
  const prev = attemptMap.get(key) || { failures: 0, lockedUntilMs: 0 }
  const failures = prev.failures + 1
  let lockSeconds = 0
  if (failures >= 8) {
    lockSeconds = 120
  } else if (failures >= 5) {
    lockSeconds = 30
  }
  const lockedUntilMs = lockSeconds > 0 ? nowMs + lockSeconds * 1000 : 0
  attemptMap.set(key, { failures, lockedUntilMs })
  return { failures, retryAfterSeconds: lockSeconds }
}

export function resetLoginRateLimitsForTests(): void {
  attemptMap.clear()
}
