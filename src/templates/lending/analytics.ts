export const lendingAnalytics = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Lending Analytics</title>
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
  <div class="w-full max-w-xl md:max-w-4xl mx-auto flex justify-between items-center">
    <button data-stitch-route="lendingDashboard" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </button>
    <h1 class="text-base font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Lending &amp; Borrowing Reports</h1>
    <div class="w-10"></div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-4xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Financial Integrity Disclaimer Note -->
  <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
    <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px] mt-0.5">account_balance</span>
    <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
      <strong>Accounting Standard:</strong> Loan principal is tracked as receivables and payables and does not distort your daily expense or income budget. Only interest portions reflect as income or expense.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
    <!-- Receivables vs Payables Card -->
    <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Position Overview</h2>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex flex-col">
          <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Receivables (Money Lent)</span>
          <h3 id="stat-report-lent-rem" class="text-base font-black text-emerald-800 dark:text-emerald-200 mt-1">KSh 0</h3>
          <span id="stat-report-lent-tot" class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Total: KSh 0</span>
        </div>

        <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 flex flex-col">
          <span class="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Payables (Money I Owe)</span>
          <h3 id="stat-report-borrow-rem" class="text-base font-black text-rose-800 dark:text-rose-200 mt-1">KSh 0</h3>
          <span id="stat-report-borrow-tot" class="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Total: KSh 0</span>
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-5">
      <!-- Interest Analytics -->
      <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interest Performance</h2>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 flex flex-col">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Interest Earned</span>
            <h3 id="stat-interest-received" class="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">+KSh 0</h3>
            <span class="text-[9px] text-slate-400">Recorded as income</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 flex flex-col">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Interest Paid</span>
            <h3 id="stat-interest-paid" class="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">-KSh 0</h3>
            <span class="text-[9px] text-slate-400">Recorded as expense</span>
          </div>
        </div>
      </section>

      <!-- Health & Fulfillment Rates -->
      <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Portfolio Health</h2>

        <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
          <span class="text-slate-600 dark:text-slate-400">Active Agreements</span>
          <span id="stat-active-count" class="font-bold text-slate-900 dark:text-slate-100">0</span>
        </div>

        <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
          <span class="text-slate-600 dark:text-slate-400">Settled Agreements</span>
          <span id="stat-settled-count" class="font-bold text-emerald-600 dark:text-emerald-400">0</span>
        </div>

        <div class="flex items-center justify-between py-2 text-xs">
          <span class="text-slate-600 dark:text-slate-400">Overdue Obligations</span>
          <span id="stat-overdue-count" class="font-bold text-rose-600 dark:text-rose-400">0</span>
        </div>
      </section>
    </div>
  </div>
</main>
</body></html>`
