export const lendingDashboard = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Lending & Borrowing</title>
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
  .mode-pill.active {
    background-color: var(--action-primary);
    color: var(--action-primary-text);
  }
</style>
</head>
<body class="bg-[var(--bg-canvas,#f8fafc)] text-[var(--text-primary,#0f172a)] pb-24 pt-16">
<!-- TopAppBar with Workspace Switcher -->
<header class="fixed top-0 left-0 w-full z-50 flex flex-col justify-center px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
  <div class="flex items-center justify-between w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto">
    <div class="flex items-center gap-2">
      <div class="workspace-switcher">
        <button id="ws-expenses" class="workspace-tab" data-stitch-route="dashboard">Expenses</button>
        <button id="ws-lending" class="workspace-tab active">Lending &amp; Borrowing</button>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button id="btn-check-loan-notifs" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm active:scale-95" title="Check Reminders">
        <span class="material-symbols-outlined text-[20px]">notifications</span>
      </button>
      <button data-stitch-route="lendingProfile" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm active:scale-95" title="Lending Profile">
        <span class="material-symbols-outlined text-[20px]">badge</span>
      </button>
      <button data-stitch-route="profile" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm active:scale-95">
        <span class="material-symbols-outlined text-[20px]">person</span>
      </button>
    </div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Mode Segment Filter -->
  <div class="flex items-center justify-between bg-slate-100 dark:bg-[var(--surface-container)] p-1 rounded-2xl border border-slate-200/80 dark:border-[var(--outline-variant)]">
    <button id="btn-mode-all" class="mode-pill active flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all">
      All Records
    </button>
    <button id="btn-mode-casual" class="mode-pill flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-slate-600 dark:text-[var(--text-secondary)] transition-all flex items-center justify-center gap-1">
      <span class="material-symbols-outlined text-[16px]">handshake</span>
      Casual
    </button>
    <button id="btn-mode-formal" class="mode-pill flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-slate-600 dark:text-[var(--text-secondary)] transition-all flex items-center justify-center gap-1">
      <span class="material-symbols-outlined text-[16px]">account_balance</span>
      Loan Agreements
    </button>
  </div>

  <!-- Overdue Banner (if any) -->
  <div id="overdue-banner" class="hidden p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">warning</span>
      <span id="overdue-text" class="text-xs font-bold text-amber-800 dark:text-amber-200">0 Overdue Agreements</span>
    </div>
    <button data-stitch-route="lendingAgreements" data-filter="overdue" class="text-xs font-bold text-amber-700 dark:text-amber-300 underline">View</button>
  </div>

  <!-- 1. Casual Lending & Borrowing Section -->
  <section id="section-casual" class="flex flex-col gap-3">
    <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px]">handshake</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Casual</h2>
            <p class="text-[10px] text-slate-400">Friends, Peers &amp; Family • 0% Interest Tracking</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">Personal</span>
      </div>

      <!-- Casual KPIs -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Casual Lent -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[var(--surface-container-low)] border border-slate-100 dark:border-[var(--outline-variant)] flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Owed to Me</span>
            <span class="material-symbols-outlined text-emerald-500 text-[16px]">arrow_outward</span>
          </div>
          <h3 id="stat-casual-lent-rem" class="text-base font-bold text-slate-900 dark:text-[var(--text-primary)]">KSh 0</h3>
          <span class="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-1">Total Lent: <b id="stat-casual-lent-prin" class="text-slate-600 dark:text-[var(--text-secondary)] font-semibold">KSh 0</b></span>
        </div>

        <!-- Casual Borrowed -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[var(--surface-container-low)] border border-slate-100 dark:border-[var(--outline-variant)] flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">What I Owe</span>
            <span class="material-symbols-outlined text-rose-500 text-[16px]">call_received</span>
          </div>
          <h3 id="stat-casual-borrow-rem" class="text-base font-bold text-slate-900 dark:text-[var(--text-primary)]">KSh 0</h3>
          <span class="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-1">Total Borrowed: <b id="stat-casual-borrow-prin" class="text-slate-600 dark:text-[var(--text-secondary)] font-semibold">KSh 0</b></span>
        </div>
      </div>

      <!-- Casual Actions -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button id="btn-casual-lend" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">add_circle</span>
          Lend Money
        </button>
        <button id="btn-casual-borrow" class="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">call_received</span>
          Borrow Money
        </button>
      </div>

      <!-- Active Casual List -->
      <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">Active Casual Records</h4>
          <button id="btn-view-all-casual" class="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline">View All</button>
        </div>
        <div id="agreements-casual-list" class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div id="casual-empty" class="col-span-full p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
            No active casual records.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 2. Financial Company Lending & Borrowing Section -->
  <section id="section-formal" class="flex flex-col gap-3">
    <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Loan Agreements</h2>
            <p class="text-[10px] text-slate-400">Clients, Banks &amp; SACCOs • Interest &amp; Formal Terms</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">Institutional</span>
      </div>

      <!-- Formal KPIs -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Client Receivables -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[var(--surface-container-low)] border border-slate-100 dark:border-[var(--outline-variant)] flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Client Receivables</span>
            <span class="material-symbols-outlined text-emerald-500 text-[16px]">trending_up</span>
          </div>
          <h3 id="stat-formal-lent-rem" class="text-base font-bold text-slate-900 dark:text-[var(--text-primary)]">KSh 0</h3>
          <span class="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-1">Principal: <b id="stat-formal-lent-prin" class="text-slate-600 dark:text-[var(--text-secondary)] font-semibold">KSh 0</b></span>
        </div>

        <!-- Institutional Debt -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[var(--surface-container-low)] border border-slate-100 dark:border-[var(--outline-variant)] flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Institutional Debt</span>
            <span class="material-symbols-outlined text-rose-500 text-[16px]">account_balance</span>
          </div>
          <h3 id="stat-formal-borrow-rem" class="text-base font-bold text-slate-900 dark:text-[var(--text-primary)]">KSh 0</h3>
          <span class="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-1">Principal: <b id="stat-formal-borrow-prin" class="text-slate-600 dark:text-[var(--text-secondary)] font-semibold">KSh 0</b></span>
        </div>
      </div>

      <!-- Formal Actions -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button id="btn-formal-lend" class="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">add_circle</span>
          Lend Money
        </button>
        <button id="btn-formal-borrow" class="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">call_received</span>
          Borrow Money
        </button>
      </div>

      <!-- Active Formal List -->
      <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">Active Loan Agreements</h4>
          <button id="btn-view-all-formal" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
        </div>
        <div id="agreements-formal-list" class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div id="formal-empty" class="col-span-full p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
            No active formal agreements.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Movements & Reports Strip -->
  <section class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">This Month's Movement</h3>
      <button data-stitch-route="lendingAnalytics" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
        <span class="material-symbols-outlined text-[16px]">analytics</span>
        Reports
      </button>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="p-2.5 rounded-xl bg-[var(--fin-income-bg)] border border-emerald-500/20 flex flex-col">
        <span class="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Repayments Received</span>
        <span id="stat-received-month" class="text-sm font-bold text-[var(--fin-income)]">+KSh 0</span>
      </div>
      <div class="p-2.5 rounded-xl bg-[var(--fin-expense-bg)] border border-rose-500/20 flex flex-col">
        <span class="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">Repayments Made</span>
        <span id="stat-repaid-month" class="text-sm font-bold text-[var(--fin-expense)]">-KSh 0</span>
      </div>
    </div>
  </section>
</main>

<!-- Bottom Navigation Bar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
  <a data-stitch-route="dashboard" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform active:scale-90" href="#">
    <span class="material-symbols-outlined">home</span>
    <span class="font-['Inter'] text-[10px] font-medium">Expenses</span>
  </a>
  <a data-stitch-route="lendingDashboard" class="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 px-4 py-1 transition-transform active:scale-90" href="#">
    <span class="material-symbols-outlined">account_balance</span>
    <span class="font-['Inter'] text-[10px] font-bold">Lending</span>
  </a>
  <a data-stitch-route="createAgreement" class="flex flex-col items-center justify-center -mt-5" href="#">
    <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-90 transition-transform">
      <span class="material-symbols-outlined text-2xl">add</span>
    </div>
  </a>
  <a data-stitch-route="lendingAgreements" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform active:scale-90" href="#">
    <span class="material-symbols-outlined">format_list_bulleted</span>
    <span class="font-['Inter'] text-[10px] font-medium">Agreements</span>
  </a>
  <a data-stitch-route="profile" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform active:scale-90" href="#">
    <span class="material-symbols-outlined">person</span>
    <span class="font-['Inter'] text-[10px] font-medium">Profile</span>
  </a>
</nav>
</body></html>`
