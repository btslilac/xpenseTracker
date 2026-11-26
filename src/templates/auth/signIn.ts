import { BRAND_LOGO_DATA_URI } from '../../lib/brandLogo'

export const signIn = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Sign In — XpenseTracker</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100dvh; }
    .xp-auth-shell { min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; padding: max(24px, var(--safe-area-top, 24px)) 20px max(24px, var(--safe-area-bottom, 24px)); }
    .xp-field-input {
      width: 100%; height: 50px; border-radius: 14px; padding: 0 14px;
      border: 1.5px solid var(--border-subtle, rgba(148,163,184,0.32));
      background: var(--surface-card, rgba(255,255,255,0.9));
      color: var(--text-primary, #0f172a); font-size: 15px; outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
    }
    .xp-field-input:focus {
      border-color: var(--action-primary, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
    }
    .xp-field-input.xp-input-error:focus {
      border-color: var(--fin-expense, #ef4444);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
    }
    .xp-eye-btn {
      position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; color: var(--text-secondary, #64748b); background: transparent; border: none; cursor: pointer;
    }
  </style>
</head>
<body class="bg-background text-on-surface antialiased">
  <main class="xp-auth-shell max-w-md w-full mx-auto">
    <div class="text-center mb-6 xp-surface-enter">
      <div class="inline-flex items-center justify-center p-1.5 rounded-3xl bg-surface-container-lowest/90 shadow-lg border border-outline-variant/30 mb-4">
        <img src="${BRAND_LOGO_DATA_URI}" alt="XpenseTracker" class="w-16 h-16 rounded-2xl object-contain block"/>
      </div>
      <h1 class="text-2xl font-extrabold tracking-tight text-on-surface">Welcome back</h1>
      <p class="text-sm text-on-surface-variant mt-1">Sign in cleanly to manage your expenses, M-PESA tracking, and budgets.</p>
    </div>

    <div class="theme-card rounded-3xl p-6 shadow-xl border border-outline-variant/25 space-y-5 xp-surface-enter">
      <!-- General Status / Rate Limit / Verification Banner (never shakes) -->
      <div id="auth-status-banner" class="hidden rounded-2xl px-3.5 py-3 text-xs font-medium leading-relaxed border" role="status" aria-live="polite"></div>

      <form id="signin-form" class="space-y-4" novalidate>
        <div>
          <label for="signin-email" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Address</label>
          <div class="relative">
            <input id="signin-email" name="email" type="email" inputmode="email" autocomplete="username email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com" aria-describedby="signin-email-error" class="xp-field-input"/>
          </div>
          <p id="signin-email-error" class="hidden text-xs text-rose-500 font-medium mt-1.5" role="alert"></p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="signin-password" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
            <button id="btn-forgot-password" type="button" class="no-min-touch text-xs font-semibold text-primary hover:underline px-1.5 py-1 rounded-lg">Forgot password?</button>
          </div>
          <div id="signin-password-wrap" class="relative rounded-[14px]">
            <input id="signin-password" name="password" type="password" autocomplete="current-password" required placeholder="Enter your password" aria-describedby="signin-password-error" class="xp-field-input pr-12"/>
            <button id="toggle-signin-password" type="button" class="xp-eye-btn no-press-scale" aria-label="Show password" aria-pressed="false">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          </div>
          <p id="signin-password-error" class="hidden text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1" role="alert"></p>
        </div>

        <button id="btn-signin-submit" type="submit" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <span id="signin-submit-label">Sign In</span>
          <span id="signin-submit-spinner" class="hidden material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
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

    <div class="text-center mt-5 space-y-3">
      <p class="text-sm text-on-surface-variant">
        New to XpenseTracker?
        <button id="btn-switch-signup" type="button" class="no-min-touch font-bold text-primary hover:underline px-1.5 py-1">Create an account</button>
      </p>
      <div class="flex items-center justify-center gap-4 text-xs text-on-surface-variant">
        <button type="button" data-stitch-route="privacyPolicy" class="no-min-touch hover:underline px-2 py-1">Privacy Policy</button>
        <span aria-hidden="true">·</span>
        <button type="button" data-stitch-route="termsOfService" class="no-min-touch hover:underline px-2 py-1">Terms of Service</button>
      </div>
    </div>
  </main>
</body>
</html>`
