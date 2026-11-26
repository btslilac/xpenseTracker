import { BRAND_LOGO_DATA_URI } from '../../lib/brandLogo'

export const signUp = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Create Account — XpenseTracker</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100dvh; }
    .xp-auth-shell { min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; padding: max(20px, var(--safe-area-top, 20px)) 20px max(28px, var(--safe-area-bottom, 28px)); }
    .xp-field-input {
      width: 100%; height: 48px; border-radius: 14px; padding: 0 14px;
      border: 1.5px solid var(--border-subtle, rgba(148,163,184,0.32));
      background: var(--surface-card, rgba(255,255,255,0.9));
      color: var(--text-primary, #0f172a); font-size: 14.5px; outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .xp-field-input:focus {
      border-color: var(--action-primary, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
    }
    .xp-eye-btn {
      position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; color: var(--text-secondary, #64748b); background: transparent; border: none; cursor: pointer;
    }
    .xp-age-pill {
      flex: 1; min-height: 44px; border-radius: 14px; padding: 10px 12px; text-align: left;
      border: 1.5px solid var(--border-subtle, rgba(148,163,184,0.32));
      background: var(--surface-container-low, rgba(148,163,184,0.08));
      transition: border-color 150ms ease, background-color 150ms ease, transform 140ms var(--motion-curve);
    }
    .xp-age-pill[data-selected="true"] {
      border-color: var(--action-primary, #4f46e5);
      background: rgba(79, 70, 229, 0.10);
    }
  </style>
</head>
<body class="bg-background text-on-surface antialiased">
  <main class="xp-auth-shell max-w-md w-full mx-auto">
    <div class="text-center mb-5 xp-surface-enter">
      <div class="inline-flex items-center justify-center p-1.5 rounded-3xl bg-surface-container-lowest/90 shadow-lg border border-outline-variant/30 mb-3">
        <img src="${BRAND_LOGO_DATA_URI}" alt="XpenseTracker" class="w-14 h-14 rounded-2xl object-contain block"/>
      </div>
      <h1 class="text-2xl font-extrabold tracking-tight text-on-surface">Create your account</h1>
      <p class="text-sm text-on-surface-variant mt-1">Track expenses, M-PESA alerts, and loans securely under Kenyan privacy standards.</p>
    </div>

    <div class="theme-card rounded-3xl p-5 shadow-xl border border-outline-variant/25 space-y-4 xp-surface-enter">
      <div id="auth-status-banner" class="hidden rounded-2xl px-3.5 py-3 text-xs font-medium leading-relaxed border" role="status" aria-live="polite"></div>

      <form id="signup-form" class="space-y-3.5" novalidate>
        <div>
          <label for="signup-fullname" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Full Name</label>
          <input id="signup-fullname" name="fullName" type="text" autocomplete="name" required placeholder="Amina Wanjiku" aria-describedby="signup-fullname-error" class="xp-field-input"/>
          <p id="signup-fullname-error" class="hidden text-xs text-rose-500 font-medium mt-1" role="alert"></p>
        </div>

        <div>
          <label for="signup-email" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Email Address</label>
          <input id="signup-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com" aria-describedby="signup-email-hint signup-email-error" class="xp-field-input"/>
          <p id="signup-email-hint" class="text-[11px] text-on-surface-variant mt-1">Used for sign-in, password recovery, and data export/deletion verification.</p>
          <p id="signup-email-error" class="hidden text-xs text-rose-500 font-medium mt-1" role="alert"></p>
        </div>

        <div>
          <label for="signup-password" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Password</label>
          <div class="relative">
            <input id="signup-password" name="password" type="password" autocomplete="new-password" required placeholder="At least 8 characters" aria-describedby="pw-strength-hint signup-password-error" class="xp-field-input pr-12"/>
            <button id="toggle-signup-password" type="button" class="xp-eye-btn no-press-scale" aria-label="Show password" aria-pressed="false">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          </div>
          <div class="mt-2 space-y-1">
            <div class="flex gap-1.5 h-1.5" aria-hidden="true">
              <span id="pw-bar-1" class="flex-1 rounded-full bg-outline-variant/40 transition-colors"></span>
              <span id="pw-bar-2" class="flex-1 rounded-full bg-outline-variant/40 transition-colors"></span>
              <span id="pw-bar-3" class="flex-1 rounded-full bg-outline-variant/40 transition-colors"></span>
              <span id="pw-bar-4" class="flex-1 rounded-full bg-outline-variant/40 transition-colors"></span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span id="pw-strength-label" class="font-semibold text-on-surface-variant">Password strength</span>
              <span id="pw-strength-hint" class="text-on-surface-variant">8+ chars, uppercase &amp; number</span>
            </div>
          </div>
          <p id="signup-password-error" class="hidden text-xs text-rose-500 font-medium mt-1" role="alert"></p>
        </div>

        <div>
          <label for="signup-confirm-password" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Confirm Password</label>
          <div class="relative">
            <input id="signup-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required placeholder="Re-enter password" aria-describedby="signup-confirm-error" class="xp-field-input pr-12"/>
            <button id="toggle-signup-confirm" type="button" class="xp-eye-btn no-press-scale" aria-label="Show confirm password" aria-pressed="false">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          </div>
          <p id="signup-confirm-error" class="hidden text-xs text-rose-500 font-medium mt-1" role="alert"></p>
        </div>

        <!-- Privacy-Preserving Age Verification (Kenya Data Protection Act, 2019) -->
        <div class="pt-1">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Age Confirmation</span>
            <span class="text-[11px] text-on-surface-variant">Kenya DPA Compliance</span>
          </div>
          <div class="flex gap-2.5" role="radiogroup" aria-label="Age group">
            <button id="age-btn-adult" type="button" role="radio" aria-checked="true" data-selected="true" class="xp-age-pill">
              <div class="text-xs font-bold text-on-surface">18 or older</div>
              <div class="text-[11px] text-on-surface-variant mt-0.5">Standard account</div>
            </button>
            <button id="age-btn-minor" type="button" role="radio" aria-checked="false" data-selected="false" class="xp-age-pill">
              <div class="text-xs font-bold text-on-surface">Under 18</div>
              <div class="text-[11px] text-on-surface-variant mt-0.5">Guardian consent</div>
            </button>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-1.5">We only record your age bracket—never national IDs or forced full birthdates.</p>
        </div>

        <div id="guardian-fields-accordion" class="xp-accordion-item" data-open="false">
          <div class="xp-accordion-body">
            <div class="xp-accordion-inner space-y-2.5 rounded-2xl p-3.5 bg-amber-500/10 border border-amber-500/30">
              <p class="text-[11px] font-medium text-amber-800 dark:text-amber-200 leading-snug">
                Accounts under 18 stay restricted with SMS auto-detection disabled until a parent or legal guardian verifies consent.
              </p>
              <div>
                <label for="guardian-name" class="block text-[11px] font-semibold text-on-surface mb-1">Parent / Guardian Full Name</label>
                <input id="guardian-name" type="text" placeholder="Parent or guardian name" class="xp-field-input !h-11 text-sm"/>
              </div>
              <div>
                <label for="guardian-email" class="block text-[11px] font-semibold text-on-surface mb-1">Parent / Guardian Email</label>
                <input id="guardian-email" type="email" inputmode="email" placeholder="guardian@example.com" class="xp-field-input !h-11 text-sm"/>
              </div>
              <p id="guardian-error" class="hidden text-xs text-rose-500 font-medium" role="alert"></p>
            </div>
          </div>
        </div>

        <!-- Terms & Privacy Explicit Consent -->
        <div class="pt-1">
          <label class="flex items-start gap-3 cursor-pointer">
            <input id="signup-legal-consent" type="checkbox" class="mt-0.5 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"/>
            <span class="text-xs text-on-surface-variant leading-relaxed">
              I agree to the
              <button type="button" data-stitch-route="termsOfService" class="no-min-touch font-semibold text-primary hover:underline px-0.5 py-0">Terms of Service</button>
              and acknowledge the
              <button type="button" data-stitch-route="privacyPolicy" class="no-min-touch font-semibold text-primary hover:underline px-0.5 py-0">Privacy Policy</button>
              (Kenya Data Protection Act, 2019).
            </span>
          </label>
          <p id="signup-consent-error" class="hidden text-xs text-rose-500 font-medium mt-1" role="alert"></p>
        </div>

        <button id="btn-signup-submit" type="submit" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <span id="signup-submit-label">Create Account</span>
          <span id="signup-submit-spinner" class="hidden material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        </button>
      </form>

      <div class="relative flex items-center gap-3">
        <div class="h-px flex-1 bg-outline-variant/40"></div>
        <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">or</span>
        <div class="h-px flex-1 bg-outline-variant/40"></div>
      </div>

      <button id="btn-google-signin" type="button" class="w-full h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm">
        <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>

    <div class="text-center mt-5">
      <p class="text-sm text-on-surface-variant">
        Already have an account?
        <button id="btn-switch-signin" type="button" class="no-min-touch font-bold text-primary hover:underline px-1.5 py-1">Sign In</button>
      </p>
    </div>
  </main>
</body>
</html>`
