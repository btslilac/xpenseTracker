export const agreementDetails = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Loan Agreement Details</title>
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
  <div class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </button>
    <div class="flex flex-col items-center">
      <h1 class="text-base font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Loan Details</h1>
      <span id="header-ref" class="text-[10px] text-slate-400">LND-26-0000</span>
    </div>
    <div class="flex items-center gap-1">
      <button id="btn-edit-agreement" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95" title="Edit Agreement">
        <span class="material-symbols-outlined text-[20px]">edit</span>
      </button>
      <button id="btn-settle-archive" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95" title="Settle / Archive">
        <span class="material-symbols-outlined text-[20px]">archive</span>
      </button>
    </div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 py-4 flex flex-col gap-5">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
    <!-- Left Column: Hero Overview, Late Penalty Card & CTAs -->
    <div class="flex flex-col gap-5">
      <!-- Agreement Hero Card -->
      <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div id="direction-icon-wrap" class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <span id="direction-icon" class="material-symbols-outlined text-[26px]">arrow_outward</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 id="counterparty-name" class="text-base font-bold text-slate-900 dark:text-slate-100">Borrower Name</h2>
                <span id="relationship-badge" class="hidden px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">Friend</span>
              </div>
              <span id="direction-subtitle" class="text-xs text-slate-500 dark:text-slate-400">Money I've Lent</span>
            </div>
          </div>
          <span id="status-badge" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>
        </div>

        <!-- Outstanding Amount Big Indicator -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
          <span class="text-xs text-slate-500 dark:text-slate-400">Remaining Obligation</span>
          <h3 id="amount-remaining" class="text-2xl font-black text-slate-900 dark:text-slate-100">KSh 0</h3>
          <!-- Repayment Progress Bar -->
          <div class="w-full mt-2 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div id="progress-bar" class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
          <span id="progress-text" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">0% Repaid</span>
        </div>

        <!-- Detailed Ledger Breakdown -->
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Principal</span>
            <p id="amount-principal" class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">KSh 0</p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Interest</span>
            <p id="amount-interest" class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">KSh 0</p>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <span class="text-amber-700 dark:text-amber-300 text-[10px] uppercase font-bold">Late Penalties</span>
            <p id="amount-penalty" class="font-bold text-amber-600 dark:text-amber-400 mt-0.5">KSh 0</p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Principal Paid</span>
            <p id="amount-principal-paid" class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">KSh 0</p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Interest Paid</span>
            <p id="amount-interest-paid" class="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">KSh 0</p>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <span class="text-amber-700 dark:text-amber-300 text-[10px] uppercase font-bold">Penalty Paid</span>
            <p id="amount-penalty-paid" class="font-bold text-amber-600 dark:text-amber-400 mt-0.5">KSh 0</p>
          </div>
        </div>

        <!-- Dates & Frequency -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span class="text-[10px] block text-slate-400">Agreed On</span>
            <span id="date-agreed" class="font-medium text-slate-700 dark:text-slate-300">-</span>
          </div>
          <div>
            <span class="text-[10px] block text-slate-400">Due Date</span>
            <span id="date-due" class="font-medium text-slate-700 dark:text-slate-300">-</span>
          </div>
          <div>
            <span class="text-[10px] block text-slate-400">Frequency</span>
            <span id="text-frequency" class="font-medium text-slate-700 dark:text-slate-300">-</span>
          </div>
        </div>
      </section>

      <!-- Late Penalty Control Card -->
      <section class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Late Payment Penalty</h4>
              <span id="penalty-rule-badge" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">None</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Accrued: <span id="label-accrued-penalty" class="font-bold text-amber-600 dark:text-amber-400">KSh 0</span> &bull; Unpaid: <span id="label-unpaid-penalty" class="font-bold text-slate-800 dark:text-slate-200">KSh 0</span></p>
          </div>
        </div>
        <button id="btn-adjust-penalty" type="button" class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">tune</span>
          Adjust
        </button>
      </section>

      <!-- Action CTAs -->
      <section class="grid grid-cols-2 gap-3">
        <button id="btn-record-payment" class="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">add_card</span>
          Record Repayment
        </button>
        <button id="btn-view-statement" class="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">receipt_long</span>
          Statement
        </button>
      </section>
    </div>

    <!-- Right Column: Payment History Ledger -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment History</h3>
        <span id="payments-count" class="text-xs text-slate-400">0 payments</span>
      </div>

      <div id="payments-list" class="flex flex-col gap-2">
        <!-- Dynamically filled -->
        <div id="payments-empty" class="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
          No repayments recorded yet for this agreement.
        </div>
      </div>
    </section>
  </div>
</main>
</body></html>`
