export const analytics = `<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XpenseTracker - Analytics</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-secondary-container": "#217128",
                        "primary-container": "#1a237e",
                        "surface-container-low": "#f3f3f3",
                        "on-secondary-fixed-variant": "#005312",
                        "on-error": "#ffffff",
                        "inverse-surface": "#2f3131",
                        "secondary-fixed-dim": "#88d982",
                        "tertiary-fixed": "#ffdad8",
                        "on-tertiary": "#ffffff",
                        "on-primary": "#ffffff",
                        "tertiary-container": "#610f16",
                        "background": "#f9f9f9",
                        "primary-fixed": "#e0e0ff",
                        "on-background": "#1a1c1c",
                        "surface-tint": "#4c56af",
                        "surface": "#f9f9f9",
                        "surface-bright": "#f9f9f9",
                        "surface-container-lowest": "#ffffff",
                        "on-primary-fixed-variant": "#343d96",
                        "surface-variant": "#e2e2e2",
                        "on-primary-fixed": "#000767",
                        "error-container": "#ffdad6",
                        "tertiary-fixed-dim": "#ffb3b1",
                        "on-tertiary-fixed": "#410007",
                        "surface-container-highest": "#e2e2e2",
                        "on-tertiary-fixed-variant": "#80272b",
                        "on-error-container": "#93000a",
                        "on-primary-container": "#8690ee",
                        "outline-variant": "#c6c5d4",
                        "surface-container": "#eeeeee",
                        "on-secondary": "#ffffff",
                        "secondary-fixed": "#a3f69c",
                        "tertiary": "#400007",
                        "outline": "#767683",
                        "secondary": "#1b6d24",
                        "primary": "#000666",
                        "inverse-primary": "#bdc2ff",
                        "secondary-container": "#a0f399",
                        "on-surface-variant": "#454652",
                        "primary-fixed-dim": "#bdc2ff",
                        "on-tertiary-container": "#e87575",
                        "on-surface": "#1a1c1c",
                        "surface-container-high": "#e8e8e8",
                        "inverse-on-surface": "#f1f1f1",
                        "surface-dim": "#dadada",
                        "on-secondary-fixed": "#002204",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "touch-target-min": "48px",
                        "card-padding": "16px",
                        "gutter": "16px",
                        "container-margin": "20px",
                        "base": "8px"
                    },
                    "fontFamily": {
                        "display-lg": ["Inter"],
                        "headline-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "title-lg": ["Inter"],
                        "body-base": ["Inter"]
                    },
                    "fontSize": {
                        "display-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
                        "title-lg": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "body-base": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
                    }
                }
            }
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
      -webkit-tap-highlight-color: transparent;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-background text-on-background pb-24 pt-16">
<header class="fixed top-0 left-0 w-full z-50 px-5 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-200 flex items-center">
<div class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto flex justify-between items-center">
<div class="flex items-center gap-2.5">
<h1 class="text-xl font-bold text-[var(--text-primary)] font-['Inter']">Analytics</h1>
<span id="header-range-pill" class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">Monthly</span>
</div>
<div onclick="window.__stitchPost({type:'navigate',route:'profile'})" class="w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
<img alt="User profile photo" class="w-full h-full object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&amp;accessories=shades&amp;top=shortHair"/>
</div>
</div>
</header>

<main class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-container-margin py-base flex flex-col gap-5">
<!-- Period Filter Segmented Control -->
<div class="flex bg-surface-container rounded-full p-1 mt-4 border border-outline-variant shadow-sm" role="tablist" aria-label="Report period">
<button type="button" role="tab" class="analytics-toggle flex-1 text-center py-2 rounded-full font-label-sm text-label-sm font-bold text-on-surface-variant transition-all" data-view="weekly">Weekly</button>
<button type="button" role="tab" class="analytics-toggle flex-1 text-center py-2 rounded-full font-label-sm text-label-sm font-bold bg-primary text-on-primary shadow-sm transition-all" data-view="monthly">Monthly</button>
<button type="button" role="tab" class="analytics-toggle flex-1 text-center py-2 rounded-full font-label-sm text-label-sm font-bold text-on-surface-variant transition-all" data-view="yearly">Yearly</button>
</div>

<!-- Period Hero Summary Card -->
<section class="xp-hero-surface text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden transition-all duration-300 border border-white/15">
<div class="relative z-10">
<div class="flex items-start justify-between gap-4">
<div>
<p class="font-label-sm text-label-sm opacity-85 uppercase tracking-widest mb-1" id="period-chip">This Month</p>
<p class="text-[11px] font-medium text-white/75 mb-2" id="period-range-label"></p>
<h2 id="total-expense" class="text-[32px] sm:text-[36px] font-extrabold tracking-tight leading-none text-white">KSh 0</h2>
</div>
<div class="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/95 shrink-0 border border-white/15">
Expense Report
</div>
</div>
<p id="comparison-text" class="mt-3 text-sm leading-5 text-white/90 font-medium">vs last month</p>
<p id="summary-caption" class="mt-1 text-xs leading-5 text-white/75"></p>
<div class="mt-5 grid grid-cols-2 gap-3">
<div class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm border border-white/15">
<p class="text-[11px] uppercase tracking-[0.14em] text-white/75">Net Cash Flow</p>
<p id="hero-net" class="mt-1 text-base sm:text-lg font-bold text-white">KSh 0</p>
</div>
<div class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm border border-white/15">
<p id="hero-budget-label" class="text-[11px] uppercase tracking-[0.14em] text-white/75">Monthly Limit</p>
<p id="hero-budget" class="mt-1 text-base sm:text-lg font-bold text-white">Not set</p>
</div>
</div>
</div>
<div class="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
</section>

<!-- Core Financial Metrics Grid -->
<section class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center gap-2 mb-2">
<div class="w-8 h-8 rounded-full bg-[var(--fin-income-bg)] text-[var(--fin-income)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">south_west</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Income</span>
</div>
<p id="metric-income" class="font-title-lg text-lg sm:text-xl font-bold text-on-surface">KSh 0</p>
<p id="metric-income-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Cash inflows</p>
</article>
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center gap-2 mb-2">
<div class="w-8 h-8 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">account_balance</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Net Flow</span>
</div>
<p id="metric-net" class="font-title-lg text-lg sm:text-xl font-bold text-on-surface">KSh 0</p>
<p id="metric-net-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Money left after expenses</p>
</article>
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center gap-2 mb-2">
<div class="w-8 h-8 rounded-full bg-[var(--fin-warning-bg)] text-[var(--fin-warning)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">speed</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Budget Pace</span>
</div>
<p id="metric-budget" class="font-title-lg text-lg sm:text-xl font-bold text-on-surface">Not set</p>
<p id="metric-budget-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Set a budget to track your pace</p>
</article>
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center gap-2 mb-2">
<div class="w-8 h-8 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
</div>
<span id="metric-average-label" class="font-label-sm text-label-sm text-outline">Avg Spend</span>
</div>
<p id="metric-average" class="font-title-lg text-lg sm:text-xl font-bold text-on-surface">KSh 0</p>
<p id="metric-average-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Average spend per day</p>
</article>
</section>

<!-- Expounded Cash Flow & Spending Trend Section -->
<section id="analytics-trend-section" class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant shadow-sm">
<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
<div>
<h2 id="trend-section-title" class="font-title-lg text-on-surface">Spending &amp; Income Trend</h2>
<p id="trend-section-subtitle" class="text-[11px] text-on-surface-variant">Period activity breakdown</p>
</div>
<div class="flex items-center gap-2">
<div id="monthly-trend-mode-wrap" class="hidden bg-surface-container rounded-full p-0.5 border border-outline-variant">
<button type="button" class="trend-mode-btn no-min-touch px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors" data-mode="weekly">Weeks</button>
<button type="button" class="trend-mode-btn no-min-touch px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors" data-mode="daily">Daily</button>
</div>
<div class="flex items-center gap-2.5 text-[10px] font-semibold text-on-surface-variant">
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[var(--action-primary)] inline-block"></span>Spend</span>
<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[var(--fin-income)] inline-block"></span>Income</span>
</div>
</div>
</div>

<!-- Selected Period Inspection Pill -->
<div id="trend-selected-banner" class="mb-4 px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-between gap-2 text-xs">
<span id="trend-selected-label" class="font-bold text-on-surface truncate">Tap any bar to inspect</span>
<div class="flex items-center gap-3 shrink-0">
<span id="trend-selected-expense" class="font-bold text-[var(--fin-expense)]"></span>
<span id="trend-selected-income" class="font-bold text-[var(--fin-income)]"></span>
</div>
</div>

<!-- Interactive Bar Chart -->
<div id="trend-bars-container" class="flex items-end gap-1.5 sm:gap-2 h-44 pt-2 pb-1 overflow-x-auto no-scrollbar"></div>
</section>

<!-- Expounded Category Breakdown & Category Budget Status -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
<section id="analytics-category-section" class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant shadow-sm">
<div class="flex items-center justify-between gap-3">
<div>
<h2 class="font-title-lg text-on-surface">Category Breakdown</h2>
<p id="analytics-category-subtitle" class="text-[11px] text-on-surface-variant">Where your money went</p>
</div>
<span id="analytics-category-scope" class="text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">Monthly</span>
</div>
<div id="analytics-category-list" class="mt-4 flex flex-col gap-3"></div>
</section>

<div class="flex flex-col gap-5">
<section id="category-budget-status-section" class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant shadow-sm">
<div class="flex items-center justify-between gap-3">
<div>
<h2 class="font-title-lg text-on-surface">Category Budget Status</h2>
<p class="text-[11px] text-on-surface-variant">Tracking limits per category</p>
</div>
<span id="budget-scope-badge" class="text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">Monthly</span>
</div>
<div id="category-budget-status-list" class="mt-4 flex flex-col gap-3"></div>
</section>

<section class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant shadow-sm">
<div class="flex items-center justify-between gap-3">
<div>
<h2 class="font-title-lg text-on-surface">Period Insights</h2>
<p class="text-[11px] text-on-surface-variant">Highlights &amp; behavioral signals</p>
</div>
<span class="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
</div>
<div id="insight-list" class="mt-4 flex flex-col gap-3"></div>
</section>
</div>
</div>

<!-- Leader Highlights -->
<section class="grid grid-cols-1 md:grid-cols-2 gap-4">
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center justify-between">
<div>
<p class="font-label-sm text-label-sm text-outline">Top Category</p>
<h3 id="signal-top-name" class="mt-1.5 text-lg font-bold leading-6 text-on-surface">No category data</h3>
</div>
<div class="w-10 h-10 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">pie_chart</span>
</div>
</div>
<p id="signal-top-amount" class="mt-2.5 text-xl font-extrabold leading-7 text-on-surface">KSh 0</p>
<p id="signal-top-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Add spending to see category leaders</p>
</article>
<article class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
<div class="flex items-center justify-between">
<div>
<p class="font-label-sm text-label-sm text-outline">Largest Expense</p>
<h3 id="signal-largest-name" class="mt-1.5 text-lg font-bold leading-6 text-on-surface">No expense recorded</h3>
</div>
<div class="w-10 h-10 rounded-full bg-[var(--fin-expense-bg)] text-[var(--fin-expense)] flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">receipt_long</span>
</div>
</div>
<p id="signal-largest-amount" class="mt-2.5 text-xl font-extrabold leading-7 text-on-surface">KSh 0</p>
<p id="signal-largest-caption" class="mt-1 text-[11px] leading-4 text-on-surface-variant">Your biggest expense will appear here</p>
</article>
</section>

</main>

<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
<a data-stitch-route="dashboard" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform duration-200 active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="home">home</span>
<span class="font-['Inter'] text-[10px] font-medium">Home</span>
</a>
<a data-stitch-route="analytics" class="flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 rounded-2xl px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform duration-200 active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="analytics" style="font-variation-settings: 'FILL' 1;">analytics</span>
<span class="font-['Inter'] text-[10px] font-medium">Analytics</span>
</a>
<a data-stitch-route="addExpense" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform duration-200 active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="add">add</span>
<span class="font-['Inter'] text-[10px] font-medium">Add</span>
</a>
<a data-stitch-route="transactions" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform duration-200 active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="history">history</span>
<span class="font-['Inter'] text-[10px] font-medium">History</span>
</a>
<a data-stitch-route="profile" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-transform duration-200 active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="person">person</span>
<span class="font-['Inter'] text-[10px] font-medium">Profile</span>
</a>
</nav>
</body></html>`;