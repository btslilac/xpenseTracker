export const notifications = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XpenseTracker - Notification Settings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "surface-container-lowest": "#ffffff",
          "outline-variant": "#c6c5d4",
          "background": "#f9f9f9",
          "on-error-container": "#93000a",
          "primary-fixed": "#e0e0ff",
          "surface-bright": "#f9f9f9",
          "on-surface": "#1a1c1c",
          "on-error": "#ffffff",
          "tertiary": "#400007",
          "on-secondary": "#ffffff",
          "on-primary-fixed": "#000767",
          "on-secondary-fixed-variant": "#005312",
          "on-primary-fixed-variant": "#343d96",
          "on-secondary-container": "#217128",
          "error": "#ba1a1a",
          "outline": "#767683",
          "on-tertiary-fixed-variant": "#80272b",
          "surface-tint": "#4c56af",
          "secondary-container": "#a0f399",
          "on-secondary-fixed": "#002204",
          "tertiary-fixed-dim": "#ffb3b1",
          "surface-container": "#eeeeee",
          "surface-container-low": "#f3f3f3",
          "on-primary-container": "#8690ee",
          "inverse-primary": "#bdc2ff",
          "surface-variant": "#e2e2e2",
          "secondary-fixed": "#a3f69c",
          "secondary": "#1b6d24",
          "on-tertiary": "#ffffff",
          "tertiary-container": "#610f16",
          "primary-container": "#1a237e",
          "inverse-surface": "#2f3131",
          "on-background": "#1a1c1c",
          "on-primary": "#ffffff",
          "primary": "#000666",
          "on-tertiary-container": "#e87575",
          "surface-dim": "#dadada",
          "surface": "#f9f9f9",
          "secondary-fixed-dim": "#88d982",
          "error-container": "#ffdad6",
          "surface-container-high": "#e8e8e8",
          "surface-container-highest": "#e2e2e2",
          "on-surface-variant": "#454652",
          "inverse-on-surface": "#f1f1f1",
          "primary-fixed-dim": "#bdc2ff",
          "on-tertiary-fixed": "#410007",
          "tertiary-fixed": "#ffdad8"
        },
        "spacing": {
          "touch-target-min": "48px",
          "container-margin": "20px",
          "base": "8px",
          "gutter": "16px",
          "card-padding": "16px"
        },
        "fontFamily": {
          "headline-md": ["Inter"],
          "body-base": ["Inter"],
          "label-sm": ["Inter"],
          "display-lg": ["Inter"],
          "title-lg": ["Inter"]
        }
      }
    }
  }
</script>
</head>
<body class="bg-background text-on-background min-h-screen pb-24">
<header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center px-5 h-16">
  <div class="w-full max-w-xl md:max-w-2xl mx-auto flex items-center">
    <button class="text-indigo-900 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:opacity-70 p-2 -ml-2 rounded-full mr-3 flex items-center justify-center" onclick="window.__stitchPost({type:'back'})">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <h1 class="font-sans antialiased text-base font-semibold text-indigo-900 dark:text-indigo-300">Notification &amp; Alert Settings</h1>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-2xl mx-auto px-container-margin pt-[84px] flex flex-col gap-5">
  <p class="text-sm text-on-surface-variant">Control budget warnings, lending reminders, and local M-PESA / bank SMS transaction detection.</p>

  <!-- Live Device & OS Permission Diagnostics Card -->
  <section class="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-4 shadow-sm flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">verified_user</span>
        <h2 class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Device Permission Status</h2>
      </div>
      <button id="btn-refresh-perms" type="button" class="text-[11px] font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 active:scale-95 transition-transform">Refresh</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
        <span class="font-semibold text-on-surface">OS Notifications</span>
        <span id="perm-notif-status" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">Checking...</span>
      </div>
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
        <span class="font-semibold text-on-surface">SMS Read Access</span>
        <span id="perm-sms-status" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">Optional</span>
      </div>
    </div>
    <button id="btn-manage-os-perms" type="button" class="hidden w-full py-2.5 px-3 rounded-xl bg-amber-500/12 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform">
      <span class="material-symbols-outlined text-[16px]">settings</span>
      <span id="btn-manage-os-label">Grant Notification or SMS Permission</span>
    </button>
  </section>

  <!-- Group 1: Expenses & Budgets -->
  <section class="flex flex-col gap-2">
    <h2 class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Expenses &amp; Budgets</h2>
    <div class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/40 p-4 flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/30" data-notification-row>
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <div class="bg-primary-fixed p-2 rounded-xl text-on-primary-fixed flex items-center justify-center mt-0.5 shrink-0">
            <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div class="min-w-0">
            <h3 class="text-[15px] font-bold text-on-surface">Budget Threshold Alerts</h3>
            <p class="text-xs leading-5 text-on-surface-variant">Notify when monthly or category expenses exceed 80% or 100% of limit.</p>
          </div>
        </div>
        <label class="relative flex h-7 w-12 shrink-0 cursor-pointer items-center" for="toggle1">
          <input class="peer sr-only" id="toggle1" type="checkbox"/>
          <span class="xp-switch-track absolute inset-0 rounded-full border border-outline-variant bg-surface-container-high transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary"></span>
          <span class="xp-switch-thumb pointer-events-none absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
        </label>
      </div>

      <div class="flex items-start justify-between gap-4" data-notification-row>
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <div class="bg-primary-fixed p-2 rounded-xl text-on-primary-fixed flex items-center justify-center mt-0.5 shrink-0">
            <span class="material-symbols-outlined text-[20px]">summarize</span>
          </div>
          <div class="min-w-0">
            <h3 class="text-[15px] font-bold text-on-surface">Weekly Spending Digest</h3>
            <p class="text-xs leading-5 text-on-surface-variant">Receive a weekly summary of your cashflow and top spending categories.</p>
          </div>
        </div>
        <label class="relative flex h-7 w-12 shrink-0 cursor-pointer items-center" for="toggle2">
          <input class="peer sr-only" id="toggle2" type="checkbox"/>
          <span class="xp-switch-track absolute inset-0 rounded-full border border-outline-variant bg-surface-container-high transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary"></span>
          <span class="xp-switch-thumb pointer-events-none absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
        </label>
      </div>
    </div>
  </section>

  <!-- Group 2: Lending & Borrowing -->
  <section class="flex flex-col gap-2">
    <h2 class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">Lending &amp; Borrowing</h2>
    <div class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/40 p-4 flex items-start justify-between gap-4" data-notification-row>
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <div class="bg-emerald-500/15 p-2 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center justify-center mt-0.5 shrink-0">
          <span class="material-symbols-outlined text-[20px]">event_upcoming</span>
        </div>
        <div class="min-w-0">
          <h3 class="text-[15px] font-bold text-on-surface">Loan Due &amp; Overdue Reminders</h3>
          <p class="text-xs leading-5 text-on-surface-variant">Remind before Casual &amp; Formal due dates and flag overdue repayments.</p>
        </div>
      </div>
      <label class="relative flex h-7 w-12 shrink-0 cursor-pointer items-center" for="toggle3">
        <input class="peer sr-only" id="toggle3" type="checkbox"/>
        <span class="xp-switch-track absolute inset-0 rounded-full border border-outline-variant bg-surface-container-high transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary"></span>
        <span class="xp-switch-thumb pointer-events-none absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
      </label>
    </div>
  </section>

  <!-- Group 3: Automatic Transaction Capture -->
  <section class="flex flex-col gap-2">
    <h2 class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">SMS Transaction Detection</h2>
    <div class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/40 p-4 flex flex-col gap-3">
      <div class="flex items-start justify-between gap-4" data-notification-row>
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <div class="bg-indigo-500/15 p-2 rounded-xl text-indigo-700 dark:text-indigo-300 flex items-center justify-center mt-0.5 shrink-0">
            <span class="material-symbols-outlined text-[20px]">sms</span>
          </div>
          <div class="min-w-0">
            <h3 class="text-[15px] font-bold text-on-surface">Detect M-PESA &amp; Bank SMS</h3>
            <p class="text-xs leading-5 text-on-surface-variant">Parse incoming &amp; outgoing mobile-money/bank SMS locally and ask how to record each amount. Raw SMS stays private on your device.</p>
          </div>
        </div>
        <label class="relative flex h-7 w-12 shrink-0 cursor-pointer items-center" for="toggle-sms-detection">
          <input class="peer sr-only" id="toggle-sms-detection" type="checkbox"/>
          <span class="xp-switch-track absolute inset-0 rounded-full border border-outline-variant bg-surface-container-high transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary"></span>
          <span class="xp-switch-thumb pointer-events-none absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
        </label>
      </div>
    </div>
  </section>

  <div class="pt-2 flex justify-center max-w-md mx-auto w-full">
    <button id="btn-save-notifications" type="button" class="bg-primary text-on-primary font-bold text-sm w-full h-[54px] rounded-2xl shadow-md hover:bg-surface-tint active:scale-95 transition-all duration-200">
      Save Preferences
    </button>
  </div>
</main>
</body></html>`;
