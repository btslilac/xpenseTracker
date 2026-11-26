export const parentalConsent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Guardian Consent — XpenseTracker</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
</head>
<body class="bg-background text-on-surface font-['Inter',sans-serif] pb-12">
  <header class="fixed top-0 left-0 right-0 z-40 h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/25 flex items-center justify-between">
    <button type="button" data-stitch-event="back" class="w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div class="text-center">
      <h1 class="text-base font-bold text-on-surface">Guardian Verification</h1>
      <p class="text-[11px] text-on-surface-variant">Kenya DPA Section 33 Protection</p>
    </div>
    <div class="w-11"></div>
  </header>

  <main class="pt-20 px-4 max-w-xl mx-auto space-y-5">
    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Account Age Status</span>
        <span id="gc-status-pill" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">Checking...</span>
      </div>
      <p id="gc-status-desc" class="text-xs text-on-surface-variant leading-relaxed"></p>
      <div id="gc-token-box" class="hidden rounded-2xl p-3.5 bg-surface-container-low border border-outline-variant/30 space-y-1">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Guardian Verification Code</div>
        <div id="gc-token-value" class="text-base font-extrabold tracking-widest text-primary select-all"></div>
        <div id="gc-email-value" class="text-xs text-on-surface-variant"></div>
      </div>
    </section>

    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-4">
      <h2 class="text-sm font-bold text-on-surface">Parent / Guardian Verification</h2>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        As a parent or legal guardian, enter your registered guardian email address and the verification code to authorize or revoke financial tracking features for this minor account.
      </p>
      <div class="space-y-3">
        <div>
          <label for="gc-input-email" class="block text-xs font-semibold text-on-surface-variant mb-1">Parent / Guardian Email</label>
          <input id="gc-input-email" type="email" placeholder="guardian@example.com" class="w-full h-11 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 text-sm text-on-surface"/>
        </div>
        <div>
          <label for="gc-input-token" class="block text-xs font-semibold text-on-surface-variant mb-1">Verification Code</label>
          <input id="gc-input-token" type="text" placeholder="GC-XXXXXXXXXX" class="w-full h-11 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 text-sm uppercase tracking-wider text-on-surface"/>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button id="btn-gc-verify" type="button" class="h-11 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-sm">
            Approve &amp; Verify
          </button>
          <button id="btn-gc-revoke" type="button" class="h-11 rounded-2xl bg-rose-500/12 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs">
            Revoke Consent
          </button>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`
