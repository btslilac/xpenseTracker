export const updateCenter = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Update Center</title>
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
  <div class="w-full max-w-xl md:max-w-2xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" type="button" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all" aria-label="Back">
      <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </button>
    <h1 class="text-base font-bold text-slate-900 dark:text-slate-100 font-['Inter']">Application Updates</h1>
    <div class="w-10"></div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Version & Status Hero Card -->
  <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-3">
    <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
      <span class="material-symbols-outlined text-[32px]">system_update</span>
    </div>
    
    <div>
      <h2 id="version-current" class="text-base font-bold text-slate-900 dark:text-slate-100">XpenseTracker v1.0.2 (Build 3)</h2>
      <p id="channel-name" class="text-xs text-slate-400">Release Channel: Production (Hermes)</p>
    </div>

    <!-- Status Badge -->
    <div id="status-pill" class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
      <span class="material-symbols-outlined text-[14px]">check_circle</span>
      <span id="status-text">Your app is up to date</span>
    </div>

    <!-- Action Button -->
    <button id="btn-check-update" class="mt-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-[18px]">sync</span>
      Check for Updates
    </button>
  </section>

  <!-- Available Update Card (hidden if up to date) -->
  <section id="update-available-card" class="hidden theme-card p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-sm flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px]">new_releases</span>
        <h3 id="update-available-title" class="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">New Version Available</h3>
      </div>
      <span id="update-available-version" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">v1.1.0</span>
    </div>

    <p id="update-available-notes" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
      Liquid Glass &amp; Material 3 themes, Lending &amp; Borrowing workspace, and performance optimizations.
    </p>

    <!-- CTAs -->
    <div class="grid grid-cols-2 gap-2 mt-2">
      <button id="btn-update-later" class="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-95">
        Later
      </button>
      <button id="btn-download-update" class="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95">
        Download &amp; Apply
      </button>
    </div>
  </section>

  <!-- Release Changelog Section -->
  <section class="theme-card p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Release Highlights</h3>
    
    <div class="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
      <div class="flex items-start gap-2">
        <span class="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">palette</span>
        <span><strong>Liquid Glass &amp; Material Design 3:</strong> Selectable refined design styles with full Light, Dark, and System palettes.</span>
      </div>
      <div class="flex items-start gap-2">
        <span class="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">handshake</span>
        <span><strong>Lending &amp; Borrowing Workspace:</strong> Dedicated ledger for receivables and liabilities with separate principal and interest tracking.</span>
      </div>
      <div class="flex items-start gap-2">
        <span class="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">cloud_sync</span>
        <span><strong>Offline-First Synchronization:</strong> Instant local mutation queue with network reconnect drain.</span>
      </div>
    </div>
  </section>
</main>
</body></html>`
