export const lendingProfile = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Lending Profile</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-dark": "#4338ca",
      }
    }
  }
}
</script>
<style>
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
  body { min-height: 100dvh; }
  .type-tab.active {
    background-color: var(--action-primary) !important;
    color: var(--action-primary-text) !important;
  }
</style>
</head>
<body class="bg-[var(--bg-canvas,#f8fafc)] text-[var(--text-primary,#0f172a)] pb-24 pt-16">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-2xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </button>
    <h1 class="text-base font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Lending Profile (My Company)</h1>
    <div class="w-10"></div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Header Note based on supplied design reference -->
  <div class="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
    <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px] mt-0.5">verified_user</span>
    <p class="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
      These details are used as the header identity on generated loan statements, agreement summaries, and repayment receipts.
    </p>
  </div>

  <!-- Profile Type Switcher -->
  <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
    <button id="type-individual" class="type-tab active py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center">
      Individual Lender
    </button>
    <button id="type-company" class="type-tab py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center text-slate-500 dark:text-slate-400">
      Company / Business
    </button>
  </div>

  <form id="lending-profile-form" class="flex flex-col gap-4">
    <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
      <div>
        <label id="label-name" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Owner / Financier Name *</label>
        <input id="input-owner-name" type="text" required placeholder="e.g. Samuel Mutua" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <div id="group-company-name" class="hidden">
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Business Name</label>
        <input id="input-company-name" type="text" placeholder="e.g. Mutua Capital Ltd" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
          <input id="input-mobile" type="tel" placeholder="+254 700 000000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input id="input-email" type="email" placeholder="contact@domain.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Office / Residential Address</label>
        <textarea id="input-address" rows="2" placeholder="e.g. 4th Floor, Plaza Towers, Nairobi" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tax / Business ID (Optional)</label>
        <input id="input-tax-id" type="text" placeholder="e.g. P051234567Z" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>
    </div>

    <!-- Save Details Button -->
    <div class="w-full max-w-md mx-auto pt-2">
      <button type="submit" class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">save</span>
        Save Details
      </button>
    </div>
  </form>
</main>
</body></html>`
