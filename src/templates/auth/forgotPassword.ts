import { BRAND_LOGO_DATA_URI } from '../../lib/brandLogo'

export const forgotPassword = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Reset Password — XpenseTracker</title>
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
    }
    .xp-field-input:focus {
      border-color: var(--action-primary, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
    }
  </style>
</head>
<body class="bg-background text-on-surface antialiased">
  <main class="xp-auth-shell max-w-md w-full mx-auto">
    <div class="mb-4">
      <button id="btn-back-to-signin" type="button" class="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface px-2 py-2 rounded-xl">
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        <span>Back to Sign In</span>
      </button>
    </div>

    <div class="text-center mb-6 xp-surface-enter">
      <div class="inline-flex items-center justify-center p-1.5 rounded-3xl bg-surface-container-lowest/90 shadow-lg border border-outline-variant/30 mb-4">
        <img src="${BRAND_LOGO_DATA_URI}" alt="XpenseTracker" class="w-16 h-16 rounded-2xl object-contain block"/>
      </div>
      <h1 class="text-2xl font-extrabold tracking-tight text-on-surface">Recover your password</h1>
      <p class="text-sm text-on-surface-variant mt-1">Enter your registered email to receive secure reset instructions.</p>
    </div>

    <div class="theme-card rounded-3xl p-6 shadow-xl border border-outline-variant/25 space-y-4 xp-surface-enter">
      <div id="recovery-status-banner" class="hidden rounded-2xl px-3.5 py-3 text-xs font-medium leading-relaxed border" role="status" aria-live="polite"></div>

      <form id="recovery-form" class="space-y-4" novalidate>
        <div>
          <label for="recovery-email" class="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Address</label>
          <input id="recovery-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com" aria-describedby="recovery-email-error" class="xp-field-input"/>
          <p id="recovery-email-error" class="hidden text-xs text-rose-500 font-medium mt-1.5" role="alert"></p>
        </div>

        <button id="btn-recovery-submit" type="submit" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <span id="recovery-submit-label">Send Recovery Instructions</span>
        </button>
      </form>

      <div id="recovery-next-steps" class="hidden rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs text-on-surface-variant">
        <p class="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">mark_email_read</span>
          Recovery request submitted
        </p>
        <p>1. Check your inbox and spam folder for a password reset email.</p>
        <p>2. Open the secure link to choose a new password, then return here to sign in.</p>
        <div class="pt-1 flex items-center justify-between">
          <span id="recovery-countdown-text" class="text-[11px] font-medium"></span>
          <button id="btn-recovery-resend" type="button" class="no-min-touch text-xs font-bold text-primary hover:underline disabled:opacity-45 px-2 py-1" disabled>Resend email</button>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`
