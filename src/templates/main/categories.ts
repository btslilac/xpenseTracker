export const categories = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XpenseTracker - Categories</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "on-primary-fixed-variant": "#343d96",
          "tertiary-fixed-dim": "#ffb3b1",
          "surface-container-low": "#f3f3f3",
          "surface-bright": "#f9f9f9",
          "on-secondary-fixed": "#002204",
          "tertiary": "#400007",
          "primary-fixed-dim": "#bdc2ff",
          "on-primary-fixed": "#000767",
          "on-primary-container": "#8690ee",
          "on-background": "#1a1c1c",
          "on-tertiary": "#ffffff",
          "on-secondary-container": "#217128",
          "primary": "#000666",
          "on-primary": "#ffffff",
          "error-container": "#ffdad6",
          "error": "#ba1a1a",
          "inverse-surface": "#2f3131",
          "background": "#f9f9f9",
          "on-surface": "#1a1c1c",
          "surface-container-high": "#e8e8e8",
          "on-tertiary-fixed-variant": "#80272b",
          "tertiary-fixed": "#ffdad8",
          "tertiary-container": "#610f16",
          "surface-tint": "#4c56af",
          "surface-dim": "#dadada",
          "secondary-container": "#a0f399",
          "on-tertiary-container": "#e87575",
          "inverse-primary": "#bdc2ff",
          "surface-container-highest": "#e2e2e2",
          "secondary-fixed": "#a3f69c",
          "on-secondary": "#ffffff",
          "surface": "#f9f9f9",
          "on-tertiary-fixed": "#410007",
          "on-error": "#ffffff",
          "primary-fixed": "#e0e0ff",
          "surface-container-lowest": "#ffffff",
          "secondary-fixed-dim": "#88d982",
          "primary-container": "#1a237e",
          "outline-variant": "#c6c5d4",
          "surface-variant": "#e2e2e2",
          "on-surface-variant": "#454652",
          "on-error-container": "#93000a",
          "on-secondary-fixed-variant": "#005312",
          "secondary": "#1b6d24",
          "surface-container": "#eeeeee",
          "outline": "#767683",
          "inverse-on-surface": "#f1f1f1"
        },
        "spacing": {
          "container-margin": "20px",
          "gutter": "16px",
          "card-padding": "16px",
          "touch-target-min": "48px",
          "base": "8px"
        },
        "fontFamily": {
          "body-base": ["Inter"],
          "title-lg": ["Inter"],
          "label-sm": ["Inter"],
          "display-lg": ["Inter"],
          "headline-md": ["Inter"]
        }
      }
    }
  }
</script>
<style>
  body { min-height: max(884px, 100dvh); }
</style>
</head>
<body class="bg-background text-on-background min-h-screen pb-24">
<!-- Top App Bar -->
<header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center px-5 h-16 w-full">
  <div class="w-full max-w-xl md:max-w-4xl mx-auto flex items-center justify-between">
    <div class="flex items-center">
      <button class="text-indigo-900 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:opacity-70 p-2 -ml-2 rounded-full mr-3 flex items-center justify-center" onclick="window.__stitchPost({type:'back'})">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="font-sans antialiased text-base font-semibold text-indigo-900 dark:text-indigo-300">Categories</h1>
    </div>
    <button id="header-add-category-btn" type="button" class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform" aria-label="Add Category">
      <span class="material-symbols-outlined text-[20px]">add</span>
    </button>
  </div>
</header>

<!-- Main Content -->
<main class="w-full max-w-xl md:max-w-4xl mx-auto p-container-margin space-y-4">
  <div class="flex items-center justify-between gap-3">
    <div>
      <h2 class="font-title-lg text-lg font-bold text-on-background">Expense &amp; Income Categories</h2>
      <p class="text-xs text-on-surface-variant">Filter, search, sort, reorder, or customize your categories.</p>
    </div>
    <span id="categories-count-badge" class="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold shrink-0">0</span>
  </div>

  <!-- Segmented Filter Tabs -->
  <div class="grid grid-cols-3 p-1 rounded-2xl bg-surface-container border border-outline-variant/40">
    <button id="cat-tab-all" type="button" class="py-2 px-3 rounded-xl text-xs font-bold transition-all bg-primary text-on-primary shadow-sm">All</button>
    <button id="cat-tab-expense" type="button" class="py-2 px-3 rounded-xl text-xs font-bold transition-all text-on-surface-variant">Expenses</button>
    <button id="cat-tab-income" type="button" class="py-2 px-3 rounded-xl text-xs font-bold transition-all text-on-surface-variant">Income</button>
  </div>

  <!-- Search & Sort Controls -->
  <div class="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-2.5 items-center">
    <div class="relative">
      <span class="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
      <input id="cat-search-input" type="text" placeholder="Search categories..." class="w-full h-[44px] pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"/>
    </div>
    <select id="cat-sort-select" aria-label="Sort Categories">
      <option value="custom">Custom Order</option>
      <option value="az">Name (A - Z)</option>
      <option value="za">Name (Z - A)</option>
    </select>
  </div>

  <!-- Category List -->
  <div class="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0" id="categories-list-container"></div>

  <p id="cat-reorder-hint" class="text-[11px] text-outline text-center pt-1">
    Tip: Drag handle to reorder in Custom Order, or swipe a card left to delete.
  </p>

  <div class="pt-3 flex justify-center w-full max-w-md mx-auto">
    <button id="btn-add-new-category" type="button" class="w-full h-[54px] bg-primary text-on-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform">
      <span class="material-symbols-outlined">add</span>
      <span>Add New Category</span>
    </button>
  </div>
</main>
</body></html>`;
