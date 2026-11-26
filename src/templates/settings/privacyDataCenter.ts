export const privacyDataCenter = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Privacy &amp; Data Center — XpenseTracker</title>
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
      <h1 class="text-base font-bold text-on-surface">Privacy &amp; Data Center</h1>
      <p class="text-[11px] text-on-surface-variant">Kenya Data Protection Act, 2019</p>
    </div>
    <div class="w-11"></div>
  </header>

  <main class="pt-20 px-4 max-w-2xl mx-auto space-y-5">
    <!-- Status & Consents Card -->
    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-on-surface">Consent &amp; Account Compliance</h2>
          <p id="pdc-account-email" class="text-xs text-on-surface-variant"></p>
        </div>
        <span id="pdc-status-badge" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Active</span>
      </div>
      <div class="grid grid-cols-2 gap-2.5 text-xs">
        <div class="p-3 rounded-2xl bg-surface-container-low">
          <div class="text-on-surface-variant">Policy &amp; Terms</div>
          <div id="pdc-legal-ver" class="font-bold text-on-surface mt-0.5">Accepted</div>
        </div>
        <div class="p-3 rounded-2xl bg-surface-container-low">
          <div class="text-on-surface-variant">SMS Processing</div>
          <div id="pdc-sms-state" class="font-bold text-on-surface mt-0.5">Disabled</div>
        </div>
      </div>

      <div id="pdc-minor-alert" class="hidden rounded-2xl p-3.5 bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
        <span>Under-18 restricted mode: Parent/Guardian verification needed for automated tracking.</span>
        <button type="button" data-stitch-route="parentalConsent" class="shrink-0 px-3 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">Review</button>
      </div>

      <div class="flex items-center justify-between pt-1">
        <div>
          <p class="text-xs font-bold text-on-surface">Help &amp; Guidance Tooltips</p>
          <p class="text-[11px] text-on-surface-variant">Disable onboarding hover/focus hints once familiar.</p>
        </div>
        <button id="btn-toggle-tooltips" type="button" role="switch" aria-checked="false" class="xp-switch" aria-label="Hide help tooltips"></button>
      </div>
    </section>

    <!-- Data Portability / Export -->
    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-3">
      <h2 class="text-sm font-bold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-primary">download</span>
        Export Your Personal &amp; Financial Data
      </h2>
      <p id="pdc-export-summary" class="text-xs text-on-surface-variant leading-relaxed">
        Download a machine-readable copy of your profile, categories, budgets, transactions, loans, payments, and consent metadata.
      </p>
      <div class="grid grid-cols-2 gap-3">
        <button id="btn-export-json" type="button" class="h-11 rounded-2xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">data_object</span>
          Export JSON
        </button>
        <button id="btn-export-csv" type="button" class="h-11 rounded-2xl bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 border border-outline-variant/30">
          <span class="material-symbols-outlined text-[18px]">table_view</span>
          Export CSV
        </button>
      </div>
    </section>

    <!-- SMS Consent Withdrawal -->
    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-3">
      <h2 class="text-sm font-bold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-indigo-500">sms_failed</span>
        SMS Detection Consent &amp; Local Queue
      </h2>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Withdrawing SMS consent immediately stops automatic Android SMS reading and clears cached local SMS queues and fingerprints from your device. You can still record transactions manually or paste SMS text.
      </p>
      <button id="btn-withdraw-sms" type="button" class="w-full h-11 rounded-2xl bg-surface-container-high border border-outline-variant/35 text-on-surface font-bold text-xs flex items-center justify-center gap-2">
        Withdraw SMS Consent &amp; Clear Local SMS Cache
      </button>
    </section>

    <!-- Formal DPA Rights Request -->
    <section class="theme-card rounded-3xl p-5 border border-outline-variant/25 space-y-3">
      <h2 class="text-sm font-bold text-on-surface">Correction, Restriction &amp; Compliance Requests</h2>
      <div class="space-y-2.5">
        <select id="pdc-request-type" class="w-full h-11 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs font-semibold px-3 text-on-surface">
          <option value="rectification">Request Data Correction (Rectification)</option>
          <option value="restriction">Request Processing Restriction / Objection</option>
          <option value="access_export">Formal Data Access Log Request</option>
        </select>
        <textarea id="pdc-request-details" rows="2" placeholder="Describe what should be corrected or restricted..." class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs p-3 text-on-surface"></textarea>
        <button id="btn-submit-dpa-request" type="button" class="w-full h-11 rounded-2xl bg-primary/12 text-primary font-bold text-xs">
          Submit Formal Request
        </button>
      </div>
    </section>

    <!-- Legal Policies Links -->
    <section class="m3-group-list">
      <button type="button" data-stitch-route="privacyPolicy" class="m3-group-row">
        <span class="material-symbols-outlined text-primary">policy</span>
        <div class="flex-1 text-left">
          <div class="text-sm font-bold">Privacy Policy</div>
          <div class="text-xs text-on-surface-variant">Kenya Data Protection Act, 2019 notice</div>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
      </button>
      <button type="button" data-stitch-route="termsOfService" class="m3-group-row">
        <span class="material-symbols-outlined text-primary">description</span>
        <div class="flex-1 text-left">
          <div class="text-sm font-bold">Terms of Service</div>
          <div class="text-xs text-on-surface-variant">Service rules, independence &amp; disclaimers</div>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
      </button>
      <button type="button" data-stitch-route="parentalConsent" class="m3-group-row">
        <span class="material-symbols-outlined text-amber-500">family_restroom</span>
        <div class="flex-1 text-left">
          <div class="text-sm font-bold">Parental / Guardian Consent</div>
          <div class="text-xs text-on-surface-variant">Verify or revoke consent for under-18 accounts</div>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
      </button>
    </section>

    <!-- Permanent Account Deletion (Identity-Verified) -->
    <section class="rounded-3xl p-5 bg-rose-500/10 border border-rose-500/30 space-y-3">
      <h2 class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px]">delete_forever</span>
        Permanent Account Deletion
      </h2>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Permanently erases your profile, transactions, categories, budgets, lending records, consent logs, and authentication credentials from active databases and local device storage. Type <strong>DELETE</strong> below to confirm.
      </p>
      <input id="pdc-delete-confirm-input" type="text" placeholder="Type DELETE to confirm" autocomplete="off" class="w-full h-11 rounded-xl border border-rose-500/40 bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface"/>
      <button id="btn-pdc-delete-account" type="button" class="w-full h-12 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md disabled:opacity-50" disabled>
        Delete My Account Permanently
      </button>
    </section>
  </main>
</body>
</html>`
