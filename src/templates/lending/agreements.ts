export const lendingAgreements = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Loan Agreements - XpenseTracker</title>
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
  .filter-pill.active {
    background-color: var(--action-primary);
    color: var(--action-primary-text);
  }
  .cat-pill.active {
    background-color: var(--action-primary);
    color: var(--action-primary-text);
  }
</style>
</head>
<body class="bg-[var(--bg-canvas,#f8fafc)] text-[var(--text-primary,#0f172a)] pb-24 pt-16">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </button>
    <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Records &amp; Agreements</h1>
    <button id="btn-add-agreement" type="button" class="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">add</span>
    </button>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
  <!-- Category Selector: All vs Casual vs Loan Agreements -->
  <div class="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md mx-auto w-full md:max-w-lg">
    <button id="cat-all" class="cat-pill active py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 shadow-sm">
      All Modes
    </button>
    <button id="cat-casual" class="cat-pill py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
      <span class="material-symbols-outlined text-[15px]">handshake</span>
      Casual
    </button>
    <button id="cat-formal" class="cat-pill py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
      <span class="material-symbols-outlined text-[15px]">account_balance</span>
      Loan Agreements
    </button>
  </div>

  <!-- Direction Segment Switcher -->
  <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md mx-auto w-full md:max-w-lg">
    <button id="tab-lent" class="py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm">
      <span class="material-symbols-outlined text-[16px]">arrow_outward</span>
      Money I Lent
    </button>
    <button id="tab-borrowed" class="py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
      <span class="material-symbols-outlined text-[16px]">call_received</span>
      Money I Owe
    </button>
  </div>

  <!-- Search & Filter Controls -->
  <div class="flex flex-col gap-2">
    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
      <input id="search-input" type="text" placeholder="Search by name, reference..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
    </div>

    <!-- Filter Pills -->
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <button class="filter-pill active px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap" data-status="all">All</button>
      <button class="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap" data-status="active">Active</button>
      <button class="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap" data-status="due_soon">Due Soon</button>
      <button class="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap" data-status="overdue">Overdue</button>
      <button class="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap" data-status="settled">Settled</button>
    </div>
  </div>

  <!-- Agreements Card List -->
  <div id="agreements-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <!-- Rendered via JS -->
  </div>
</main>
</body></html>`
