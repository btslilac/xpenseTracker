export const recordPayment = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Record Repayment</title>
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
</style>
</head>
<body class="bg-[var(--bg-canvas,#f8fafc)] text-[var(--text-primary,#0f172a)] pb-24 pt-16">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-3xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">close</span>
    </button>
    <h1 id="screen-title" class="text-base font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Record Repayment</h1>
    <div class="w-10"></div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-3xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Agreement Context Pill -->
  <div class="theme-card p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
    <div>
      <span id="label-counterparty" class="text-xs font-bold text-slate-800 dark:text-slate-200">Borrower: -</span>
      <p id="label-ref" class="text-[10px] text-slate-400">Ref: -</p>
    </div>
    <div class="text-right">
      <span class="text-[10px] text-slate-400 block">Remaining</span>
      <span id="label-remaining" class="text-xs font-bold text-slate-900 dark:text-slate-100">KSh 0</span>
    </div>
  </div>

  <form id="payment-form" class="flex flex-col gap-4">
    <!-- Amount Group -->
    <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Repayment Waterfall</h2>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">Strict Waterfall Flow</span>
      </div>

      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <span class="material-symbols-outlined text-indigo-600 text-[16px]">waterfall_chart</span>
        <span>Allocates to <b>1st Late Penalties</b> &rarr; <b>2nd Interest</b> &rarr; <b>3rd Principal</b></span>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">Total Payment Amount *</label>
          <button type="button" id="btn-auto-allocate" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Re-allocate Waterfall</button>
        </div>
        <div class="relative">
          <input id="input-payment-amount" type="text" inputmode="decimal" required placeholder="0" class="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          <span id="currency-tag" class="absolute right-4 top-3 text-xs font-semibold text-slate-400">KES</span>
        </div>
      </div>

      <!-- Waterfall Split Tiers -->
      <div class="flex flex-col gap-2.5 pt-1">
        <!-- Tier 1: Penalties -->
        <div class="p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">1</span>
              <label class="text-xs font-bold text-amber-900 dark:text-amber-200">Penalty / Late Fees Portion</label>
            </div>
            <span class="text-[10px] text-amber-700 dark:text-amber-300">Unpaid: <b id="label-rem-penalty">KSh 0</b></span>
          </div>
          <input id="input-penalty-comp" type="text" inputmode="decimal" required placeholder="0" class="w-full px-3 py-2 rounded-xl border border-amber-300/60 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"/>
        </div>

        <!-- Tier 2: Interest -->
        <div class="p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
              <label class="text-xs font-bold text-indigo-900 dark:text-indigo-200">Agreed Interest Portion</label>
            </div>
            <span class="text-[10px] text-indigo-700 dark:text-indigo-300">Unpaid: <b id="label-rem-interest">KSh 0</b></span>
          </div>
          <input id="input-interest-comp" type="text" inputmode="decimal" required placeholder="0" class="w-full px-3 py-2 rounded-xl border border-indigo-300/60 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>

        <!-- Tier 3: Principal -->
        <div class="p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
              <label class="text-xs font-bold text-emerald-900 dark:text-emerald-200">Principal Portion</label>
            </div>
            <span class="text-[10px] text-emerald-700 dark:text-emerald-300">Unpaid: <b id="label-rem-principal">KSh 0</b></span>
          </div>
          <input id="input-principal-comp" type="text" inputmode="decimal" required placeholder="0" class="w-full px-3 py-2 rounded-xl border border-emerald-300/60 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        </div>
      </div>

      <div id="allocation-warning" class="hidden p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-600 dark:text-rose-300 font-medium flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px]">error</span>
        <span>Penalties + Interest + Principal must equal Total Payment Amount.</span>
      </div>
    </div>

    <!-- Metadata Group -->
    <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Transaction Details</h2>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
          <input id="input-payment-date" type="date" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
          <select id="select-payment-method" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="UPI">UPI / Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reference / Transaction ID</label>
        <input id="input-reference-no" type="text" placeholder="e.g. M-Pesa code or Bank Ref" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Notes (Optional)</label>
        <input id="input-payment-notes" type="text" placeholder="e.g. March installment" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="w-full max-w-md mx-auto pt-2">
      <button type="submit" class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">verified</span>
        Confirm Repayment
      </button>
    </div>
  </form>
</main>
</body></html>`
