export const dashboard = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport"/>
<title>XpenseTracker - Dashboard</title>

<!-- Tailwind CSS with Plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

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
                        "2xl": "1rem",
                        "3xl": "1.5rem",
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
                        "sans": ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
                        "display-lg": ["Inter", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
                        "headline-md": ["Inter", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
                        "label-sm": ["Inter", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
                        "title-lg": ["Inter", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
                        "body-base": ["Inter", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"]
                    },
                    "fontSize": {
                        "display-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
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
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Liquid Glass & Specular Glow Effect */
    .liquid-glass {
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4);
    }

    .liquid-glass-dark {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .material-glass-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 226, 226, 0.6);
    }

    /* Custom Scrollbar for Smooth Touch Scrolling */
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(150, 150, 150, 0.3);
      border-radius: 99px;
    }

    /* TOP NAVBAR RESPONSIVE BEHAVIOR:
       - On Tablet (md: >= 768px): Full-width standard horizontal top navbar matching other pages
       - On Phone (< 768px): Turns into a sleek floating menu bar for superior UI/UX
    */
    @media (min-width: 768px) {
      #top-navbar, #sticky-header {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: calc(4rem + var(--safe-area-top, 0px)) !important;
        padding-top: var(--safe-area-top, 0px) !important;
        border-radius: 0 !important;
        border-bottom-width: 1px !important;
        border-left-width: 0 !important;
        border-right-width: 0 !important;
        border-top-width: 0 !important;
        background: var(--header-bg);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border-color: var(--outline-variant) !important;
      }
      .dark #top-navbar, .dark #sticky-header {
        background: var(--header-bg);
      }
    }

    @media (max-width: 767px) {
      #top-navbar, #sticky-header {
        top: calc(var(--safe-area-top, 16px) + 0.5rem) !important;
        left: 0.75rem !important;
        right: 0.75rem !important;
        width: calc(100% - 1.5rem) !important;
        max-width: 480px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        height: auto !important;
        padding: 0.5rem 0.85rem !important;
        border-radius: 1.25rem !important;
        border-width: 1px !important;
        border-color: var(--border-subtle);
        box-shadow: var(--elevated-shadow);
        background: var(--surface-elevated);
        backdrop-filter: var(--glass-blur-heavy);
        -webkit-backdrop-filter: var(--glass-blur-heavy);
      }
      .dark #top-navbar, .dark #sticky-header {
        border-color: var(--border-subtle);
        background: var(--surface-elevated);
      }
      #phone-nav-menu {
        top: calc(var(--safe-area-top, 16px) + 4.25rem) !important;
        max-width: 480px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
    }

    @media (orientation: landscape) {
      #hero-section {
        min-height: calc(230px + var(--safe-area-top, 0px)) !important;
      }
      #hero-content-container {
        padding-top: calc(var(--safe-area-top, 0px) + 0.5rem) !important;
        min-height: calc(230px + var(--safe-area-top, 0px)) !important;
        padding-bottom: 1rem !important;
      }
    }

    @media (max-width: 767px) and (orientation: landscape) {
      #top-navbar, #sticky-header {
        top: max(var(--safe-area-top, 8px), env(safe-area-inset-top, 0px)) !important;
        left: max(0.75rem, env(safe-area-inset-left, 0px)) !important;
        right: max(0.75rem, env(safe-area-inset-right, 0px)) !important;
        width: calc(100% - max(1.5rem, calc(env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px)))) !important;
      }
      #phone-nav-menu {
        top: calc(max(var(--safe-area-top, 8px), env(safe-area-inset-top, 0px)) + 3.25rem) !important;
      }
    }

    /* Subtle pulse dot */
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.15); }
    }
    .animate-pulse-subtle {
      animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Material symbols styling */
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .material-symbols-outlined.fill-1 {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
</style>
</head>
<body class="bg-background text-on-background pb-28 min-h-screen selection:bg-primary-container selection:text-white">

<!-- TOP STATUS BAR SHADE: Soft subtle gradient shade ensures system status bar (clock, battery, Wi-Fi, notifications) remains 100% legible -->
<div id="status-bar-shade" class="fixed top-0 left-0 right-0 pointer-events-none z-50 h-[calc(var(--safe-area-top,24px)+16px)] min-h-[44px] bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300"></div>

<!-- TRANSFORMING TOP NAVBAR / PHONE FLOATING MENU (On tablet: standard horizontal top navbar; On phone: turns into a floating action menu) -->
<header id="top-navbar" class="fixed z-50 transition-all duration-300 -translate-y-full opacity-0 pointer-events-none flex items-center">
  <!-- TABLET VIEW CONTAINER -->
  <div class="hidden md:flex w-full max-w-4xl lg:max-w-5xl mx-auto justify-between items-center px-6">
    <div class="flex items-center gap-2.5">
      <h1 class="text-xl font-bold text-indigo-900 dark:text-indigo-100 font-['Inter'] tracking-tight">XpenseTracker</h1>
      <button type="button" onclick="openWorkspaceDropdown()" class="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 hover:border-primary/40 transition-colors">
        <span id="sticky-workspace-label">Expenses</span>
        <span class="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
    </div>

    <div class="flex items-center gap-3">
      <button id="sticky-quick-add-btn" onclick="openWorkspaceQuickAction()" class="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform">
        <span class="material-symbols-outlined text-[16px]">add</span>
        <span id="sticky-quick-add-label">Add Transaction</span>
      </button>

      <button onclick="toggleNotifications()" class="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-transform" aria-label="Notifications">
        <span class="material-symbols-outlined text-[20px]">notifications</span>
        <span id="notification-badge-sticky" class="hidden absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-md">0</span>
      </button>

      <div onclick="window.__stitchPost({type:'navigate',route:'profile'})" class="relative w-9 h-9 rounded-full overflow-hidden bg-indigo-600/90 text-white flex items-center justify-center ring-2 ring-indigo-600/30 shadow-sm cursor-pointer active:scale-95 transition-transform" title="Profile">
        <span id="sticky-user-initials" class="text-xs font-extrabold select-none">U</span>
        <img id="sticky-user-avatar" alt="User profile" class="absolute inset-0 w-full h-full object-cover hidden" onload="this.classList.remove('hidden')" onerror="this.classList.add('hidden')"/>
      </div>
    </div>
  </div>

  <!-- PHONE VIEW CONTAINER -->
  <div class="flex md:hidden w-full items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
      </div>
      <div>
        <h2 class="text-xs font-extrabold text-slate-900 dark:text-white leading-tight font-['Inter']">XpenseTracker</h2>
        <button type="button" onclick="openWorkspaceDropdown()" class="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <span id="phone-workspace-label">Expenses</span>
          <span class="material-symbols-outlined text-[12px]">expand_more</span>
        </button>
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button onclick="openWorkspaceQuickAction()" class="flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform">
        <span class="material-symbols-outlined text-[14px]">add</span>
        <span id="phone-quick-add-label">Add</span>
      </button>

      <button id="phone-menu-toggle-btn" onclick="togglePhoneMenu()" class="relative w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-90 transition-transform" aria-label="Open Menu">
        <span id="phone-menu-icon" class="material-symbols-outlined text-[20px]">menu</span>
        <span id="phone-menu-badge" class="hidden absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
      </button>
    </div>
  </div>
</header>

<!-- PHONE QUICK MENU POPOVER -->
<div id="phone-menu-backdrop" onclick="togglePhoneMenu(false)" class="hidden md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 opacity-0 pointer-events-none"></div>

<div id="phone-nav-menu" class="hidden md:hidden fixed left-3 right-3 z-50 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 transition-all duration-200 origin-top scale-95 opacity-0 pointer-events-none">
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
    <div class="flex items-center gap-2">
      <div class="relative w-7 h-7 rounded-full overflow-hidden bg-primary/20 text-primary ring-1 ring-primary/40 flex items-center justify-center">
        <span id="phone-menu-user-initials" class="text-[10px] font-extrabold select-none">U</span>
        <img id="phone-menu-user-avatar" alt="User Profile" class="absolute inset-0 w-full h-full object-cover hidden" onload="this.classList.remove('hidden')" onerror="this.classList.add('hidden')"/>
      </div>
      <div>
        <p id="phone-menu-user-name" class="text-xs font-bold text-slate-800 dark:text-white leading-tight">User</p>
        <p class="text-[10px] text-slate-400">Quick Actions</p>
      </div>
    </div>
    <button onclick="togglePhoneMenu(false)" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <button onclick="togglePhoneMenu(false); openAddTransactionModal('Expense');" class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 active:scale-95 transition-all text-left">
      <div class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[16px]">arrow_downward</span>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-800 dark:text-slate-100">Add Expense</p>
        <p class="text-[9px] text-slate-400">Log spending</p>
      </div>
    </button>

    <button onclick="togglePhoneMenu(false); openAddTransactionModal('Income');" class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 active:scale-95 transition-all text-left">
      <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-800 dark:text-slate-100">Add Income</p>
        <p class="text-[9px] text-slate-400">Record cash in</p>
      </div>
    </button>

    <button onclick="togglePhoneMenu(false); toggleNotifications();" class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 active:scale-95 transition-all text-left">
      <div class="relative w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[16px]">notifications</span>
        <span id="phone-menu-alert-badge" class="hidden absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">0</span>
      </div>
      <div class="overflow-hidden">
        <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Alerts</p>
        <p id="phone-menu-alert-sub" class="text-[9px] text-slate-400 truncate">All clear</p>
      </div>
    </button>

    <button onclick="togglePhoneMenu(false); selectWorkspace(state.currentWorkspace === 'expenses' ? 'lending' : 'expenses');" class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 active:scale-95 transition-all text-left">
      <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
      </div>
      <div>
        <p id="phone-menu-switch-label" class="text-xs font-bold text-slate-800 dark:text-slate-100">Lending View</p>
        <p class="text-[9px] text-slate-400">Switch workspace</p>
      </div>
    </button>
  </div>

  <div class="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
    <button onclick="togglePhoneMenu(false); window.__stitchPost({type:'navigate',route:'profile'});" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold hover:text-primary">
      <span class="material-symbols-outlined text-[16px]">person</span>
      <span>My Profile</span>
    </button>
    <button onclick="togglePhoneMenu(false); window.__stitchPost({type:'navigate',route:'appearance'});" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold hover:text-primary">
      <span class="material-symbols-outlined text-[16px]">palette</span>
      <span>Theme &amp; Style</span>
    </button>
  </div>
</div>

<!-- HERO SECTION WITH RESILIENT BACKDROP & WORKSPACE DROPDOWN -->
<section id="hero-section" class="relative w-full xp-hero-surface rounded-b-[32px] md:rounded-b-[40px] shadow-2xl overflow-hidden text-white flex flex-col justify-between" style="min-height: calc(300px + var(--safe-area-top, 24px));">
    <!-- Ambient Fallback Gradient Mesh (Visible immediately & if photo unavailable offline) -->
    <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 85% 20%, rgba(16,185,129,0.28), transparent 52%), radial-gradient(circle at 12% 85%, rgba(99,102,241,0.38), transparent 58%);"></div>

    <!-- Resilient Profile Hero Photo -->
    <img id="hero-bg-img" alt="" class="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 pointer-events-none" onload="this.style.display='block'; this.classList.remove('opacity-0'); this.classList.add('opacity-65');" onerror="this.style.display='none';"/>

    <!-- Natural scrim for high-contrast typography across all Light/Dark/Pure Black modes -->
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/25 pointer-events-none"></div>

    <!-- Status Bar Top Shade -->
    <div class="absolute inset-x-0 top-0 h-[calc(var(--safe-area-top,24px)+32px)] bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10"></div>

    <div id="hero-content-container" class="relative z-10 w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-container-margin pb-7 flex flex-col justify-between h-full" style="padding-top: calc(var(--safe-area-top, 24px) + 0.85rem); min-height: calc(300px + var(--safe-area-top, 24px));">
        <!-- Top Bar Inside Hero -->
        <div class="flex items-center justify-between pt-2">
            <div>
                <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-white font-['Inter'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    XpenseTracker
                </h1>
                <p class="text-[10px] text-white/75 font-semibold tracking-wider uppercase">Your Money, Accounted for.</p>
            </div>

            <div class="flex items-center gap-3">
                <button id="notification-bell-btn" onclick="toggleNotifications()" class="relative w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform duration-200" aria-label="Notifications">
                    <span class="material-symbols-outlined text-[22px]">notifications</span>
                    <span id="notification-badge-hero" class="hidden absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900 shadow-md">0</span>
                </button>

                <div onclick="window.__stitchPost({type:'navigate',route:'profile'})" class="relative w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-0.5 cursor-pointer active:scale-90 transition-transform duration-200 flex items-center justify-center overflow-hidden" title="Profile">
                    <span id="hero-user-initials" class="text-sm font-extrabold text-white select-none">U</span>
                    <img id="hero-user-avatar" alt="User profile" class="absolute inset-0 w-full h-full rounded-[14px] object-cover hidden" onload="this.classList.remove('hidden')" onerror="this.classList.add('hidden')"/>
                </div>
            </div>
        </div>

        <!-- Greeting & Timezone -->
        <div class="mt-5 mb-2">
            <div class="flex items-center gap-2 mb-1">
                <span id="timezone-date-badge" class="text-xs font-medium text-white/85 tracking-wide">Loading date...</span>
            </div>
            <div class="w-1/2 max-w-[50%]">
                <h2 id="greeting-text" class="font-headline-md text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] break-words">
                    Welcome!
                </h2>
                <p id="hero-workspace-subtitle" class="text-xs sm:text-sm text-white/85 font-medium mt-1 drop-shadow">Here is your spending overview</p>
            </div>
        </div>

        <!-- THEME-AWARE CUSTOM WORKSPACE DROPDOWN -->
        <div class="mt-3 flex flex-wrap items-center gap-2.5">
            <button id="workspace-dropdown-btn" type="button" onclick="openWorkspaceDropdown()" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-sm transition-all active:scale-95">
                <span id="workspace-dropdown-icon" class="material-symbols-outlined text-[17px] text-emerald-300">payments</span>
                <span id="workspace-dropdown-label">Expenses &amp; Budget</span>
                <span class="material-symbols-outlined text-[17px] text-white/80">keyboard_arrow_down</span>
            </button>
            <button id="hero-lending-hub-link" type="button" onclick="window.__stitchPost({type:'navigate',route:'lendingDashboard'})" class="hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold transition-all active:scale-95">
                <span>Full Lending Hub</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
        </div>
    </div>
</section>

<!-- MAIN DASHBOARD CONTENT -->
<main class="w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-container-margin pt-6 flex flex-col gap-6">

    <!-- Notifications Drawer Popover -->
    <div id="notifications-popover" class="hidden relative w-full bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xl transition-all duration-300">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/30">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">notifications_active</span>
                <h3 class="font-bold text-sm text-on-surface">Recent Alerts &amp; Updates</h3>
            </div>
            <button onclick="toggleNotifications()" class="text-xs font-semibold text-outline hover:text-on-surface">Close</button>
        </div>
        <div id="notifications-popover-content" class="space-y-3">
            <div class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs">
                <span class="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                <span>All clear! No pending alerts or overdue entries.</span>
            </div>
        </div>
    </div>

    <!-- EXPENSES WORKSPACE VIEW -->
    <div id="expenses-workspace-content" class="flex flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <section class="md:col-span-2 xp-hero-surface text-white rounded-[28px] md:rounded-[32px] p-6 md:p-7 lg:p-8 shadow-xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between border border-white/15 min-h-[260px] md:min-h-[290px]">
                <div class="relative z-10 h-full flex flex-col justify-between">
                    <div class="flex justify-between items-center mb-2">
                        <p id="main-balance-title" class="font-label-sm text-xs md:text-sm font-semibold text-white/75 uppercase tracking-widest">Current Expenses</p>
                        <span id="workspace-badge-pill" class="text-[10px] md:text-xs font-bold py-1 px-3 rounded-full bg-white/15 backdrop-blur-md text-emerald-300 uppercase tracking-wider border border-white/10">Expenses Active</span>
                    </div>

                    <div class="flex items-baseline gap-2.5 my-auto py-3 md:py-4">
                        <span id="currency-prefix-label" class="text-2xl md:text-3xl lg:text-4xl font-bold opacity-90 text-white">KSh</span>
                        <h1 id="total-expense-main" class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">0</h1>
                    </div>

                    <div class="mt-auto pt-4 md:pt-5 border-t border-white/15">
                        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
                            <div>
                                <p class="font-label-sm text-[11px] md:text-xs text-white/75 mb-0.5">Monthly Limit</p>
                                <p id="monthly-budget" class="font-title-lg text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight text-white">KSh 0</p>
                            </div>
                            <div id="budget-comparison-badge" class="self-start sm:self-auto flex items-center gap-1.5 py-1 px-2.5 md:py-1.5 md:px-3 rounded-full bg-white/20 backdrop-blur-md text-emerald-300 border border-white/10 shadow-sm">
                                <span class="material-symbols-outlined text-[16px]">trending_flat</span>
                                <span class="font-label-sm text-[11px] md:text-xs font-bold">vs last month</span>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-white/80 font-medium">Budget Utilization</span>
                                <span id="budget-percentage-label" class="font-bold text-white">0% Used</span>
                            </div>
                            <div class="w-full h-2.5 md:h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                                <div id="budget-progress-bar" class="h-full bg-emerald-400 rounded-full transition-all duration-700" style="width: 0%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="absolute -right-16 -top-16 w-56 h-56 md:w-80 md:h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -left-16 -bottom-16 w-56 h-56 md:w-80 md:h-80 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none"></div>
            </section>

            <div class="grid grid-cols-2 md:grid-cols-1 gap-4">
                <div class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <div class="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-[20px]">south_west</span>
                            </div>
                            <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">Total In</span>
                        </div>
                        <span class="font-label-sm text-xs font-semibold text-outline">Total Income</span>
                        <p id="total-income" class="font-title-lg text-xl font-black text-on-surface mt-1">KSh 0</p>
                    </div>
                    <button onclick="openAddTransactionModal('Income')" class="mt-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1 active:scale-95 transition-transform">
                        <span class="material-symbols-outlined text-[14px]">add_circle</span>
                        <span>Log Income</span>
                    </button>
                </div>

                <div class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <div class="w-9 h-9 rounded-xl bg-error-container flex items-center justify-center text-on-error-container shadow-sm group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-[20px]">north_east</span>
                            </div>
                            <span class="text-[10px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded-md">Total Out</span>
                        </div>
                        <span class="font-label-sm text-xs font-semibold text-outline">Expense Total</span>
                        <p id="total-expense-small" class="font-title-lg text-xl font-black text-on-surface mt-1">KSh 0</p>
                    </div>
                    <button onclick="openAddTransactionModal('Expense')" class="mt-3 text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:opacity-80 flex items-center gap-1 active:scale-95 transition-transform">
                        <span class="material-symbols-outlined text-[14px]">remove_circle</span>
                        <span>Log Expense</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <section id="category-breakdown-section" class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant/40 shadow-sm">
                <div class="flex justify-between items-center gap-3 mb-4">
                    <div>
                        <h2 id="category-section-title" class="font-title-lg text-lg font-bold text-on-surface">Category Breakdown</h2>
                        <p class="text-[11px] text-on-surface-variant">Distribution of this month's spending</p>
                    </div>
                    <button type="button" onclick="switchRoute('analytics')" class="text-[11px] font-bold uppercase tracking-[0.12em] bg-[var(--primary-container)] text-[var(--on-primary-container)] px-3 py-1 rounded-full active:scale-95 transition-transform">This month</button>
                </div>
                <div id="category-breakdown-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
            </section>

            <section id="recent-activity-section" class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h2 class="font-title-lg text-lg font-bold text-on-surface">Recent Activity</h2>
                        <p class="text-[11px] text-on-surface-variant">Latest transactions</p>
                    </div>
                    <button id="show-all-history" onclick="switchRoute('transactions')" class="font-label-sm text-xs font-bold flex items-center gap-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                        <span>Show history</span>
                        <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                </div>
                <div id="recent-transactions-list" class="space-y-3"></div>
            </section>
        </div>
    </div>

    <!-- LENDING & BORROWING WORKSPACE VIEW (Isolated from Expenses cards) -->
    <div id="lending-workspace-content" class="hidden flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <section class="md:col-span-2 xp-hero-surface text-white rounded-[28px] md:rounded-[32px] p-6 md:p-7 lg:p-8 shadow-xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between border border-white/15 min-h-[250px]">
                <div class="relative z-10 h-full flex flex-col justify-between gap-4">
                    <div class="flex justify-between items-center gap-2">
                        <p class="font-label-sm text-xs md:text-sm font-semibold text-white/75 uppercase tracking-widest">Net Lending Position</p>
                        <span id="lending-hero-counts-pill" class="text-[10px] md:text-xs font-bold py-1 px-3 rounded-full bg-white/15 backdrop-blur-md text-indigo-200 uppercase tracking-wider border border-white/10">0 Active</span>
                    </div>
                    <div class="my-auto py-2">
                        <h1 id="lending-net-balance" class="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">KSh 0</h1>
                        <p class="text-xs text-white/75 mt-1">Receivables minus what you currently owe</p>
                    </div>
                    <div class="pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p class="text-white/70 mb-0.5">Owed to You (Lent)</p>
                            <p id="lending-receivables-val" class="text-base md:text-lg font-extrabold text-emerald-300">KSh 0</p>
                        </div>
                        <div>
                            <p class="text-white/70 mb-0.5">You Owe (Borrowed)</p>
                            <p id="lending-payables-val" class="text-base md:text-lg font-extrabold text-rose-300">KSh 0</p>
                        </div>
                    </div>
                </div>
                <div class="absolute -right-16 -top-16 w-56 h-56 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
            </section>

            <div class="grid grid-cols-2 md:grid-cols-1 gap-4">
                <div class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Casual</span>
                            <span id="lending-casual-count" class="text-xs font-extrabold text-on-surface">0</span>
                        </div>
                        <p class="text-xs text-on-surface-variant">Informal 0% peer &amp; family loans</p>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button type="button" onclick="window.__stitchPost({type:'navigate',route:'createAgreement',params:{direction:'lent',origin:'casual',modeLocked:'true'}})" class="flex-1 py-2 px-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold active:scale-95 transition-transform">Lend</button>
                        <button type="button" onclick="window.__stitchPost({type:'navigate',route:'createAgreement',params:{direction:'borrowed',origin:'casual',modeLocked:'true'}})" class="flex-1 py-2 px-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold active:scale-95 transition-transform">Borrow</button>
                    </div>
                </div>

                <div class="theme-card bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">Loan Agreements</span>
                            <span id="lending-formal-count" class="text-xs font-extrabold text-on-surface">0</span>
                        </div>
                        <p class="text-xs text-on-surface-variant">Formal percentage &amp; penalty terms</p>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button type="button" onclick="window.__stitchPost({type:'navigate',route:'createAgreement',params:{direction:'lent',origin:'formal',modeLocked:'true'}})" class="flex-1 py-2 px-2 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold active:scale-95 transition-transform">Lend</button>
                        <button type="button" onclick="window.__stitchPost({type:'navigate',route:'createAgreement',params:{direction:'borrowed',origin:'formal',modeLocked:'true'}})" class="flex-1 py-2 px-2 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold active:scale-95 transition-transform">Borrow</button>
                    </div>
                </div>
            </div>
        </div>

        <section class="theme-card bg-surface-container-lowest rounded-[24px] p-card-padding border border-outline-variant/40 shadow-sm mb-6">
            <div class="flex justify-between items-center gap-3 mb-4">
                <div>
                    <h2 class="font-title-lg text-lg font-bold text-on-surface">Active Obligations</h2>
                    <p class="text-[11px] text-on-surface-variant">Recent casual &amp; institutional agreements</p>
                </div>
                <button type="button" onclick="window.__stitchPost({type:'navigate',route:'lendingAgreements'})" class="font-label-sm text-xs font-bold flex items-center gap-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                    <span>See All</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
            </div>
            <div id="lending-recent-list" class="space-y-3"></div>
        </section>
    </div>
</main>

<!-- ADD TRANSACTION MODAL / BOTTOM SHEET -->
<div id="add-transaction-modal" class="fixed inset-0 z-50 hidden flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 p-0 sm:p-4">
    <div id="modal-content" class="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border transition-transform duration-300 transform translate-y-full sm:translate-y-0" style="background: var(--surface-elevated, #ffffff); border-color: var(--border-subtle, #e2e8f0); color: var(--text-primary, #0f172a);">
        <div class="flex justify-between items-center pb-4 mb-4 border-b" style="border-color: var(--border-subtle, #e2e8f0);">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-lg">add_card</span>
                </div>
                <h3 class="font-bold text-lg">Record Transaction</h3>
            </div>
            <button type="button" onclick="closeAddTransactionModal()" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        </div>

        <form id="transaction-form" onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl">
                <button type="button" id="btn-type-expense" onclick="setTransactionType('Expense')" class="py-2 text-xs font-bold rounded-lg bg-surface-container-lowest shadow text-on-surface transition-all">Expense</button>
                <button type="button" id="btn-type-income" onclick="setTransactionType('Income')" class="py-2 text-xs font-bold rounded-lg text-on-surface-variant transition-all">Income</button>
            </div>

            <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Title / Note</label>
                <input type="text" id="tx-title" required placeholder="e.g. Supermarket, Coffee, Salary" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface text-sm p-3 focus:ring-2 focus:ring-primary focus:border-transparent"/>
            </div>

            <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Amount</label>
                <div class="relative">
                    <span id="modal-currency-symbol" class="absolute left-3 top-3 text-sm font-bold text-outline">KSh</span>
                    <input type="text" inputmode="decimal" id="tx-amount" required placeholder="0.00" class="w-full pl-14 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-bold text-base p-3 focus:ring-2 focus:ring-primary focus:border-transparent"/>
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Category</label>
                <select id="tx-category" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface text-sm p-3 focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="General">General</option>
                </select>
            </div>

            <button type="submit" class="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 mt-2">
                <span class="material-symbols-outlined text-lg">check_circle</span>
                <span>Save Transaction</span>
            </button>
        </form>
    </div>
</div>

<!-- FULL HISTORY MODAL -->
<div id="history-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
    <div class="w-full max-w-2xl rounded-3xl p-6 shadow-2xl border max-h-[85vh] flex flex-col" style="background: var(--surface-elevated, #ffffff); border-color: var(--border-subtle, #e2e8f0); color: var(--text-primary, #0f172a);">
        <div class="flex justify-between items-center pb-3 border-b" style="border-color: var(--border-subtle, #e2e8f0);">
            <div>
                <h3 class="font-bold text-lg">Transaction History</h3>
                <p class="text-xs text-on-surface-variant">All recorded movements for this period</p>
            </div>
            <button type="button" onclick="toggleAllHistoryModal()" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        </div>

        <div id="full-history-container" class="overflow-y-auto my-4 space-y-3 pr-1 flex-1"></div>

        <div class="flex gap-2 pt-2">
            <button onclick="switchRoute('transactions')" class="flex-1 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm">
                View Full Ledger
            </button>
            <button onclick="toggleAllHistoryModal()" class="px-4 py-2.5 bg-surface-container text-on-surface font-bold text-xs rounded-xl">
                Close
            </button>
        </div>
    </div>
</div>

<!-- DYNAMIC JAVASCRIPT: Respects Native App Data Bridge, Theme Modals & Workspaces -->
<script>
    const WORKSPACE_STORAGE_KEY = 'xpense:homeWorkspace';
    let savedWs = 'expenses';
    try { savedWs = localStorage.getItem(WORKSPACE_STORAGE_KEY) || 'expenses'; } catch(e) {}

    const state = {
        currentWorkspace: savedWs === 'lending' ? 'lending' : 'expenses',
        selectedTxType: 'Expense',
        serverData: null,
        availableCategories: [],
        addModalStackId: null,
        historyModalStackId: null
    };
    window.__XPENSE_ACTIVE_WORKSPACE = state.currentWorkspace;

    function splitGraphemes(text) {
        try {
            if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
                return Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text), function(s) { return s.segment; });
            }
        } catch(e) {}
        return Array.from(String(text || ''));
    }

    function computeInitials(name) {
        const clean = String(name || 'User').trim();
        const segs = splitGraphemes(clean);
        for (let i = 0; i < segs.length; i++) {
            if (/[A-Za-z0-9]/.test(segs[i])) return segs[i].toUpperCase();
        }
        return segs[0] || 'U';
    }

    function extractFirstName(fullName) {
        if (!fullName) return '';
        var trimmed = String(fullName).trim();
        if (!trimmed) return '';
        var words = trimmed.split(/\\s+/);
        if (words.length === 1) return words[0];
        var isEmoji = function(w) {
            try {
                var norm = splitGraphemes(w).join('');
                return /^[\\p{Extended_Pictographic}\\p{Emoji_Presentation}\\u200d\\ufe0f]+$/u.test(norm);
            } catch(e) { return false; }
        };
        if (words.length === 2 && (isEmoji(words[0]) || isEmoji(words[1]))) {
            return words.join(' ');
        }
        var result = words[0];
        var nextIdx = 1;
        if (isEmoji(result) && words[nextIdx]) {
            result += ' ' + words[nextIdx];
            nextIdx++;
        }
        if (words[nextIdx] && isEmoji(words[nextIdx])) {
            result += ' ' + words[nextIdx];
        }
        return result;
    }

    function updateTimezoneAndGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        let greeting = 'Good Evening!';
        if (hour >= 5 && hour < 12) greeting = 'Good Morning!';
        else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon!';

        const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const badgeElem = document.getElementById('timezone-date-badge');
        if (badgeElem) badgeElem.textContent = \`\${timeZoneName.replace('_', ' ')} • \${dateStr}\`;

        const greetingElem = document.getElementById('greeting-text');
        if (greetingElem) {
            const nameToUse = (state.serverData && state.serverData.firstName)
                ? state.serverData.firstName
                : ((state.serverData && state.serverData.userName) ? extractFirstName(state.serverData.userName) : '');
            if (nameToUse) {
                greetingElem.textContent = \`\${greeting.replace('!', '')}, \${nameToUse}!\`;
            } else if (state.serverData && state.serverData.greeting) {
                greetingElem.textContent = state.serverData.greeting;
            } else {
                greetingElem.textContent = greeting;
            }
        }
    }

    function syncWorkspaceChrome(workspaceKey, lendingEnabled) {
        const effective = (lendingEnabled === false) ? 'expenses' : (workspaceKey === 'lending' ? 'lending' : 'expenses');
        state.currentWorkspace = effective;
        window.__XPENSE_ACTIVE_WORKSPACE = effective;
        const isExpenses = effective === 'expenses';

        const ddBtn = document.getElementById('workspace-dropdown-btn');
        const ddIcon = document.getElementById('workspace-dropdown-icon');
        const ddLabel = document.getElementById('workspace-dropdown-label');
        const hubLink = document.getElementById('hero-lending-hub-link');
        const subtitle = document.getElementById('hero-workspace-subtitle');
        const stickyLabel = document.getElementById('sticky-workspace-label');
        const stickyAddLabel = document.getElementById('sticky-quick-add-label');
        const phoneWsLabel = document.getElementById('phone-workspace-label');
        const phoneAddLabel = document.getElementById('phone-quick-add-label');
        const phoneSwitchLabel = document.getElementById('phone-menu-switch-label');

        if (ddBtn) ddBtn.classList.toggle('hidden', lendingEnabled === false);
        if (ddIcon) {
            ddIcon.textContent = isExpenses ? 'payments' : 'real_estate_agent';
            ddIcon.className = isExpenses
                ? 'material-symbols-outlined text-[17px] text-emerald-300'
                : 'material-symbols-outlined text-[17px] text-indigo-200';
        }
        if (ddLabel) ddLabel.textContent = isExpenses ? 'Expenses & Budget' : 'Lending & Borrowing';
        if (hubLink) hubLink.classList.toggle('hidden', isExpenses || lendingEnabled === false);
        if (subtitle) {
            subtitle.textContent = isExpenses
                ? 'Here is your spending overview'
                : 'Your casual & institutional lending portfolio';
        }
        if (stickyLabel) stickyLabel.textContent = isExpenses ? 'Expenses' : 'Lending';
        if (stickyAddLabel) stickyAddLabel.textContent = isExpenses ? 'Add Transaction' : 'New Loan / Casual';
        if (phoneWsLabel) {
            phoneWsLabel.textContent = isExpenses ? 'Expenses' : 'Lending';
            phoneWsLabel.className = isExpenses
                ? 'text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'
                : 'text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider';
        }
        if (phoneAddLabel) phoneAddLabel.textContent = isExpenses ? 'Add' : 'Lend/Borrow';
        if (phoneSwitchLabel) phoneSwitchLabel.textContent = isExpenses ? 'Lending View' : 'Expenses View';

        const expWrap = document.getElementById('expenses-workspace-content');
        const lendWrap = document.getElementById('lending-workspace-content');
        if (expWrap) expWrap.classList.toggle('hidden', !isExpenses);
        if (lendWrap) {
            lendWrap.classList.toggle('hidden', isExpenses);
            lendWrap.classList.toggle('flex', !isExpenses);
        }
    }

    function hydrateDashboardWithData(data) {
        if (!data) return;
        state.serverData = data;

        const firstName = data.firstName || extractFirstName(data.userName || 'User');
        const initials = computeInitials(data.userName || firstName || 'User');
        const heroUserName = document.getElementById('hero-user-name');
        if (heroUserName) heroUserName.textContent = firstName;
        const phoneMenuUserName = document.getElementById('phone-menu-user-name');
        if (phoneMenuUserName) phoneMenuUserName.textContent = firstName || data.userName || 'User';

        ['hero-user-initials', 'sticky-user-initials', 'phone-menu-user-initials'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.textContent = initials;
        });

        if (data.avatarUrl) {
            const heroBgImg = document.getElementById('hero-bg-img');
            const stickyAvatar = document.getElementById('sticky-user-avatar');
            const heroAvatar = document.getElementById('hero-user-avatar');
            const phoneMenuAvatar = document.getElementById('phone-menu-user-avatar');
            if (heroBgImg && heroBgImg.src !== data.avatarUrl) heroBgImg.src = data.avatarUrl;
            [stickyAvatar, heroAvatar, phoneMenuAvatar].forEach(function(img) {
                if (img && img.src !== data.avatarUrl) img.src = data.avatarUrl;
            });
        }

        if (data.preferredWorkspace && !localStorage.getItem(WORKSPACE_STORAGE_KEY)) {
            state.currentWorkspace = data.preferredWorkspace === 'lending' ? 'lending' : 'expenses';
        }
        syncWorkspaceChrome(state.currentWorkspace, data.lendingEnabled !== false);

        const rawCurr = data.currency || 'KSh';
        const displayCurr = (rawCurr === 'KES') ? 'KSh' : rawCurr;
        const modalCurr = document.getElementById('modal-currency-symbol');
        if (modalCurr) modalCurr.textContent = displayCurr;
        const currPrefix = document.getElementById('currency-prefix-label');
        if (currPrefix) currPrefix.textContent = displayCurr;

        if (data.availableCategories) {
            state.availableCategories = data.availableCategories;
            updateCategorySelectOptions();
        }

        if (state.currentWorkspace === 'lending' && data.lendingEnabled !== false) {
            renderLendingView(data);
        } else {
            renderExpensesView(data);
        }
        updateNotifications(data);
        updateTimezoneAndGreeting();
    }

    function renderExpensesView(data) {
        const totalExpenseMain = document.getElementById('total-expense-main');
        if (totalExpenseMain) {
            if (data.rawSummary && typeof data.rawSummary.expenses === 'number') {
                totalExpenseMain.textContent = formatCurrency(data.rawSummary.expenses);
            } else {
                const expStr = data.summary?.expenses || '0';
                totalExpenseMain.textContent = expStr.replace(/^[A-Za-z$€£¥₹\\s]+/, '').trim() || expStr;
            }
        }

        const monthlyBudgetElem = document.getElementById('monthly-budget');
        const progressBar = document.getElementById('budget-progress-bar');
        const percentLabel = document.getElementById('budget-percentage-label');
        const rawExp = data.rawSummary?.expenses || 0;
        const rawBud = data.rawSummary?.budget || 0;
        const budgetConfigured = Boolean(data.rawSummary?.budgetConfigured);

        if (monthlyBudgetElem) {
            monthlyBudgetElem.textContent = budgetConfigured && rawBud > 0
                ? (data.summary?.budget || \`KSh \${formatCurrency(rawBud)}\`)
                : 'Not configured';
        }

        if (progressBar && percentLabel) {
            if (budgetConfigured && rawBud > 0) {
                const percentUsed = Math.min(Math.round((rawExp / rawBud) * 100), 100);
                progressBar.style.width = \`\${percentUsed}%\`;
                percentLabel.textContent = \`\${percentUsed}% Used\`;
                progressBar.className = percentUsed >= 90
                    ? 'h-full bg-rose-400 rounded-full transition-all duration-700'
                    : percentUsed >= 75
                    ? 'h-full bg-amber-400 rounded-full transition-all duration-700'
                    : 'h-full bg-emerald-400 rounded-full transition-all duration-700';
            } else {
                progressBar.style.width = '0%';
                percentLabel.textContent = 'No budget limit set';
                progressBar.className = 'h-full bg-slate-400/50 rounded-full transition-all duration-700';
            }
        }

        const compBadge = document.getElementById('budget-comparison-badge');
        if (compBadge) {
            if (data.expenseChange) {
                compBadge.style.display = 'flex';
                const compIcon = compBadge.querySelector('.material-symbols-outlined');
                const compText = compBadge.querySelector('span:last-child');
                if (compText) compText.textContent = data.expenseChange.label;
                if (compIcon) {
                    compIcon.textContent = data.expenseChange.direction === 'up' ? 'trending_up' : data.expenseChange.direction === 'down' ? 'trending_down' : 'trending_flat';
                }
            } else {
                compBadge.style.display = 'none';
            }
        }

        const totalIncomeElem = document.getElementById('total-income');
        if (totalIncomeElem) totalIncomeElem.textContent = data.summary?.income || 'KSh 0';

        const totalExpenseSmallElem = document.getElementById('total-expense-small');
        if (totalExpenseSmallElem) totalExpenseSmallElem.textContent = data.summary?.expenses || 'KSh 0';

        renderCategoryBreakdown(data.categories || []);
        renderRecentTransactions(data.recentTransactions || []);
    }

    function renderLendingView(data) {
        const stats = data.lendingStats || {};
        const netEl = document.getElementById('lending-net-balance');
        const recEl = document.getElementById('lending-receivables-val');
        const payEl = document.getElementById('lending-payables-val');
        const pillEl = document.getElementById('lending-hero-counts-pill');
        const casualEl = document.getElementById('lending-casual-count');
        const formalEl = document.getElementById('lending-formal-count');
        const listEl = document.getElementById('lending-recent-list');

        if (netEl) netEl.textContent = stats.netLending || 'KSh 0';
        if (recEl) recEl.textContent = stats.totalReceivables || 'KSh 0';
        if (payEl) payEl.textContent = stats.totalPayables || 'KSh 0';
        if (pillEl) {
            const active = stats.activeAgreementsCount || 0;
            const overdue = stats.overdueCount || 0;
            pillEl.textContent = overdue > 0 ? \`\${active} Active • \${overdue} Overdue\` : \`\${active} Active\`;
        }
        if (casualEl) casualEl.textContent = String(stats.casualCount || 0);
        if (formalEl) formalEl.textContent = String(stats.formalCount || 0);

        if (listEl) {
            const items = Array.isArray(stats.recentAgreements) ? stats.recentAgreements : [];
            if (items.length === 0) {
                listEl.innerHTML = \`
                    <div class="py-8 px-4 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low">
                        <span class="material-symbols-outlined text-3xl text-outline mb-1 opacity-70">handshake</span>
                        <p class="text-xs font-bold text-on-surface">No active casual loans or agreements</p>
                        <p class="text-[11px] text-on-surface-variant mt-0.5">Record casual peer loans or institutional loan agreements above.</p>
                    </div>
                \`;
                return;
            }
            listEl.innerHTML = items.map(function(ag) {
                const isCasual = ag.agreementCategory === 'casual';
                const modeLabel = isCasual ? (ag.relationship || 'Casual') : 'Loan Agreement';
                const dirText = ag.direction === 'lent' ? 'Lent' : 'Borrowed';
                const dirBadgeStyle = ag.direction === 'lent'
                    ? 'background-color: var(--fin-income-bg); color: var(--fin-income);'
                    : 'background-color: var(--fin-expense-bg); color: var(--fin-expense);';
                return \`
                    <button type="button" onclick="window.__stitchPost({type:'navigate',route:'agreementDetails',params:{id:'\${ag.id}',origin:'\${ag.agreementCategory}'}})" class="w-full text-left flex items-center justify-between gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant hover:shadow-sm active:scale-[0.99] transition-all">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="\${dirBadgeStyle}">
                                <span class="material-symbols-outlined text-[18px]">\${ag.direction === 'lent' ? 'arrow_outward' : 'call_received'}</span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <p class="text-xs font-bold text-on-surface truncate">\${ag.counterparty || 'Unknown'}</p>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">\${modeLabel}</span>
                                </div>
                                <p class="text-[10px] text-on-surface-variant mt-0.5">\${dirText} • Due \${ag.dueDateFormatted || '—'}</p>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xs font-extrabold text-on-surface">\${ag.remainingFormatted || 'KSh 0'}</p>
                            <span class="inline-block mt-0.5 text-[10px] font-bold \${ag.statusText || 'text-emerald-600 dark:text-emerald-400'}">\${ag.statusLabel || 'Active'}</span>
                        </div>
                    </button>
                \`;
            }).join('');
        }
    }

    function openWorkspaceDropdown() {
        const data = state.serverData || {};
        if (data.lendingEnabled === false) {
            showToast('Enable Lending workspace in Profile to switch workspaces.');
            return;
        }
        const options = [
            {
                value: 'expenses',
                label: 'Expenses & Budget',
                subtitle: 'Track spending, income & monthly limits',
                icon: 'payments',
                badge: data.summary?.expenses || ''
            },
            {
                value: 'lending',
                label: 'Lending & Borrowing',
                subtitle: 'Casual loans & formal Loan Agreements',
                icon: 'real_estate_agent',
                badge: (data.lendingStats?.activeAgreementsCount || 0) + ' active'
            }
        ];
        if (typeof window.__stitchDropdown === 'function') {
            window.__stitchDropdown({
                title: 'Switch Home Workspace',
                subtitle: 'Your selected workspace stays active across sessions',
                value: state.currentWorkspace,
                options: options,
                onSelect: function(val) { selectWorkspace(val); }
            });
        } else {
            selectWorkspace(state.currentWorkspace === 'expenses' ? 'lending' : 'expenses');
        }
    }
    window.openWorkspaceDropdown = openWorkspaceDropdown;

    function openWorkspaceQuickAction() {
        if (state.currentWorkspace === 'lending' && state.serverData?.lendingEnabled !== false) {
            if (typeof window.__stitchActionSheet === 'function') {
                window.__stitchActionSheet({
                    title: 'New Lending or Borrowing',
                    subtitle: 'Choose Casual peer tracking or a Formal Loan Agreement',
                    actions: [
                        { id: 'c_lent', label: 'Casual — I Lent Money', subtitle: '0% informal peer tracking', icon: 'north_east', tone: 'success', onSelect: function() { window.__stitchPost({ type: 'navigate', route: 'createAgreement', params: { direction: 'lent', origin: 'casual', modeLocked: 'true' } }); } },
                        { id: 'c_borr', label: 'Casual — I Borrowed Money', subtitle: '0% informal friend/family loan', icon: 'south_west', tone: 'warning', onSelect: function() { window.__stitchPost({ type: 'navigate', route: 'createAgreement', params: { direction: 'borrowed', origin: 'casual', modeLocked: 'true' } }); } },
                        { id: 'f_lent', label: 'Loan Agreement — Lend Money', subtitle: 'Formal percentage & penalty terms', icon: 'account_balance', tone: 'primary', onSelect: function() { window.__stitchPost({ type: 'navigate', route: 'createAgreement', params: { direction: 'lent', origin: 'formal', modeLocked: 'true' } }); } },
                        { id: 'f_borr', label: 'Loan Agreement — Borrow Money', subtitle: 'Bank, SACCO, or digital lender facility', icon: 'request_quote', tone: 'danger', onSelect: function() { window.__stitchPost({ type: 'navigate', route: 'createAgreement', params: { direction: 'borrowed', origin: 'formal', modeLocked: 'true' } }); } }
                    ]
                });
                return;
            }
            window.__stitchPost({ type: 'navigate', route: 'lendingDashboard' });
            return;
        }
        openAddTransactionModal('Expense');
    }
    window.openWorkspaceQuickAction = openWorkspaceQuickAction;

    function selectWorkspace(workspaceKey) {
        const next = workspaceKey === 'lending' ? 'lending' : 'expenses';
        try { localStorage.setItem(WORKSPACE_STORAGE_KEY, next); } catch(e) {}
        if (window.__stitchPost) {
            window.__stitchPost({ type: 'dashboard.workspace.set', workspace: next });
        }
        syncWorkspaceChrome(next, state.serverData?.lendingEnabled !== false);
        if (state.serverData) {
            if (next === 'lending') renderLendingView(state.serverData);
            else renderExpensesView(state.serverData);
        }
        showToast(\`Switched to \${next === 'lending' ? 'Lending & Borrowing' : 'Expenses & Budget'}\`);
    }
    window.selectWorkspace = selectWorkspace;

    function getAdaptiveCategoryColors(hexColor, fallbackBg, fallbackFg) {
        const isDark = document.documentElement.classList.contains('dark');
        const clean = String(hexColor || '').replace('#', '').trim();
        if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
            if (!isDark) return { bg: fallbackBg || '#f1f5f9', fg: fallbackFg || '#1e293b', bar: fallbackFg || '#4c56af' };
            return { bg: 'rgba(148, 163, 184, 0.2)', fg: '#cbd5e1', bar: 'var(--action-primary, #93c5fd)' };
        }
        let r = parseInt(clean.slice(0, 2), 16);
        let g = parseInt(clean.slice(2, 4), 16);
        let b = parseInt(clean.slice(4, 6), 16);
        if (!isDark) {
            return {
                bg: \`rgba(\${r}, \${g}, \${b}, 0.14)\`,
                fg: \`#\${clean}\`,
                bar: \`#\${clean}\`
            };
        }
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (lum < 0.56) {
            const lift = Math.min(0.74, Math.max(0.42, 0.72 - lum));
            r = Math.round(r + (255 - r) * lift);
            g = Math.round(g + (255 - g) * lift);
            b = Math.round(b + (255 - b) * lift);
        }
        const brightHex = '#' + [r, g, b].map(function(v) { return Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'); }).join('');
        return {
            bg: \`rgba(\${r}, \${g}, \${b}, 0.22)\`,
            fg: brightHex,
            bar: brightHex
        };
    }

    function renderCategoryBreakdown(categories) {
        const breakdownContainer = document.getElementById('category-breakdown-list');
        if (!breakdownContainer) return;

        if (!categories || categories.length === 0) {
            breakdownContainer.className = 'col-span-full';
            breakdownContainer.innerHTML = \`
                <div class="col-span-full py-8 px-4 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low">
                    <span class="material-symbols-outlined text-3xl text-outline mb-1 opacity-70">pie_chart</span>
                    <p class="text-xs font-bold text-on-surface">No expenses recorded this month</p>
                    <p class="text-[11px] text-on-surface-variant mt-0.5">Your category distribution will appear here as you log expenses.</p>
                </div>
            \`;
            return;
        }

        breakdownContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
        let html = '';
        categories.forEach(cat => {
            const palette = getAdaptiveCategoryColors(cat.color || cat.foreground, cat.background, cat.foreground);
            const bgStyle = \`background-color: \${palette.bg}; color: \${palette.fg}; border-color: \${palette.fg}26;\`;
            const txLabel = typeof cat.txCount === 'number' && cat.txCount > 0
                ? \` · \${cat.txCount} \${cat.txCount === 1 ? 'txn' : 'txns'}\`
                : '';
            html += \`
                <div class="bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant flex flex-col justify-between hover:shadow-sm transition-all">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs" style="\${bgStyle}">
                            <span class="material-symbols-outlined text-[18px]">\${cat.icon || 'category'}</span>
                        </div>
                        <span class="text-xs font-bold text-on-surface-variant">\${cat.percent}%</span>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-on-surface truncate">\${cat.name}</p>
                        <p class="text-sm font-extrabold text-on-surface mt-0.5">\${cat.amount}</p>
                        <p class="text-[10px] text-on-surface-variant mt-0.5">\${cat.percent}% of spend\${txLabel}</p>
                    </div>
                    <div class="w-full h-1.5 rounded-full overflow-hidden mt-2.5" style="background-color: var(--surface-container-high, #e2e8e2);">
                        <div class="h-full rounded-full transition-all duration-500" style="width: \${Math.max(cat.percent, 3)}%; background-color: \${palette.bar}"></div>
                    </div>
                </div>
            \`;
        });
        breakdownContainer.innerHTML = html;
    }

    function renderRecentTransactions(transactions) {
        const listContainer = document.getElementById('recent-transactions-list');
        if (!listContainer) return;

        if (!transactions || transactions.length === 0) {
            listContainer.innerHTML = \`
                <div class="py-8 px-4 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest shadow-2xs">
                    <span class="material-symbols-outlined text-3xl text-outline mb-1 opacity-70">receipt_long</span>
                    <p class="text-xs font-bold text-on-surface">No recent activity</p>
                    <p class="text-[11px] text-outline mt-0.5">Your recorded transactions will show up here.</p>
                    <button onclick="openAddTransactionModal('Expense')" class="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform">
                        <span class="material-symbols-outlined text-[16px]">add</span>
                        <span>Log First Expense</span>
                    </button>
                </div>
            \`;
            return;
        }

        let html = '';
        transactions.forEach(tx => {
            const isExpense = tx.kind === 'expense';
            const amountClass = isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';
            const palette = getAdaptiveCategoryColors(tx.foreground, tx.background, tx.foreground);
            const bgStyle = \`background-color: \${palette.bg}; color: \${palette.fg};\`;

            html += \`
                <div class="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs hover:shadow-sm transition-all">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs" style="\${bgStyle}">
                            <span class="material-symbols-outlined text-[20px]">\${tx.icon || 'receipt'}</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-bold text-on-surface truncate">\${tx.title}</p>
                            <p class="text-[10px] text-outline font-medium truncate mt-0.5">\${tx.subtitle}</p>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0 pl-3">
                        <p class="text-xs font-extrabold \${amountClass}">\${tx.amount}</p>
                        <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">\${tx.kind}</span>
                    </div>
                </div>
            \`;
        });
        listContainer.innerHTML = html;
    }

    function updateNotifications(data) {
        const container = document.getElementById('notifications-popover-content');
        const overdueCount = Number(data.lendingStats?.overdueCount || 0);
        const heroBadge = document.getElementById('notification-badge-hero');
        const stickyBadge = document.getElementById('notification-badge-sticky');
        const phoneMenuBadge = document.getElementById('phone-menu-badge');
        const phoneMenuAlertBadge = document.getElementById('phone-menu-alert-badge');
        const phoneMenuAlertSub = document.getElementById('phone-menu-alert-sub');

        if (overdueCount > 0) {
            const countText = overdueCount > 99 ? '99+' : String(overdueCount);
            [heroBadge, stickyBadge, phoneMenuAlertBadge].forEach(function(el) {
                if (el) { el.textContent = countText; el.classList.remove('hidden'); }
            });
            if (phoneMenuBadge) phoneMenuBadge.classList.remove('hidden');
            if (phoneMenuAlertSub) {
                phoneMenuAlertSub.textContent = overdueCount + ' overdue obligation' + (overdueCount === 1 ? '' : 's');
                phoneMenuAlertSub.className = 'text-[9px] text-rose-500 font-bold truncate';
            }
        } else {
            [heroBadge, stickyBadge, phoneMenuBadge, phoneMenuAlertBadge].forEach(function(el) {
                if (el) el.classList.add('hidden');
            });
            if (phoneMenuAlertSub) {
                phoneMenuAlertSub.textContent = 'All clear';
                phoneMenuAlertSub.className = 'text-[9px] text-slate-400 truncate';
            }
        }

        if (!container) return;

        const rawExp = data.rawSummary?.expenses || 0;
        const rawBud = data.rawSummary?.budget || 0;
        const budgetConfigured = Boolean(data.rawSummary?.budgetConfigured);
        const percentUsed = (budgetConfigured && rawBud > 0) ? Math.round((rawExp / rawBud) * 100) : 0;

        let alertsHtml = '';
        if (overdueCount > 0) {
            alertsHtml += \`
                <div class="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <div class="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <div class="flex-1 text-xs">
                        <p class="font-bold text-rose-700 dark:text-rose-200">Overdue Obligations (\${overdueCount})</p>
                        <p class="text-on-surface-variant mt-1">\${overdueCount} loan agreement\${overdueCount === 1 ? ' is' : 's are'} currently overdue.</p>
                        <button onclick="selectWorkspace('lending'); toggleNotifications();" class="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-300">
                            <span>View in Lending Workspace</span>
                            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            \`;
        }

        if (budgetConfigured && rawBud > 0 && percentUsed >= 80) {
            alertsHtml += \`
                <div class="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span class="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">warning</span>
                    <div class="text-xs">
                        <p class="font-semibold text-amber-700 dark:text-amber-200">Budget Warning (\${percentUsed}%)</p>
                        <p class="text-on-surface-variant">You have utilized \${percentUsed}% of your \${data.summary?.budget || 'budget'}.</p>
                    </div>
                </div>
            \`;
        }

        if (data.recentTransactions && data.recentTransactions.length > 0) {
            const latest = data.recentTransactions[0];
            alertsHtml += \`
                <div class="flex items-start gap-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">receipt_long</span>
                    <div class="text-xs">
                        <p class="font-semibold text-on-surface">Latest Transaction</p>
                        <p class="text-on-surface-variant">\${latest.title} — \${latest.amount}</p>
                    </div>
                </div>
            \`;
        }

        if (!alertsHtml) {
            alertsHtml = \`
                <div class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs">
                    <span class="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                    <span>All clear! No overdue obligations or critical alerts.</span>
                </div>
            \`;
        }
        container.innerHTML = alertsHtml;
    }

    function updateCategorySelectOptions() {
        const select = document.getElementById('tx-category');
        if (!select) return;
        const currentType = (state.selectedTxType || 'Expense').toLowerCase();
        const filtered = (state.availableCategories || []).filter(c => c.type === currentType);

        if (filtered.length > 0) {
            select.innerHTML = filtered.map(c => \`<option value="\${c.name}">\${c.name}</option>\`).join('');
        } else if (currentType === 'expense') {
            select.innerHTML = '<option value="Food & Dining">Food &amp; Dining</option><option value="Transport & Fuel">Transport &amp; Fuel</option><option value="Utilities & Bills">Utilities &amp; Bills</option><option value="General">General</option>';
        } else {
            select.innerHTML = '<option value="Salary">Salary</option><option value="Business">Business</option><option value="Investment">Investment</option><option value="General Income">General Income</option>';
        }
        if (window.__stitchEnhanceSelects) {
            window.__stitchEnhanceSelects();
        }
    }

    function initScrollEffects() {
        const topNavbar = document.getElementById('top-navbar') || document.getElementById('sticky-header');
        const heroSection = document.getElementById('hero-section');
        const statusBarShade = document.getElementById('status-bar-shade');
        var currentReportedStatusStyle = null;

        function updateScrollState() {
            const isDark = document.documentElement.classList.contains('dark');
            var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
            var threshold = heroSection ? Math.max(heroSection.offsetHeight - 72, 80) : 180;

            if (scrollY > threshold) {
                if (topNavbar) {
                    topNavbar.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
                    topNavbar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
                }
                if (statusBarShade) statusBarShade.style.opacity = '0';
                var targetStyle = isDark ? 'light' : 'dark';
                if (currentReportedStatusStyle !== targetStyle) {
                    currentReportedStatusStyle = targetStyle;
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'status_bar.set_style', style: targetStyle }));
                    }
                }
            } else {
                if (topNavbar) {
                    topNavbar.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
                    topNavbar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
                }
                if (typeof togglePhoneMenu === 'function') togglePhoneMenu(false);
                if (statusBarShade) statusBarShade.style.opacity = '1';
                var heroStyle = 'light';
                if (currentReportedStatusStyle !== heroStyle) {
                    currentReportedStatusStyle = heroStyle;
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'status_bar.set_style', style: heroStyle }));
                    }
                }
            }
        }

        window.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState, { passive: true });
        document.addEventListener('xpense:theme-changed', function() {
            currentReportedStatusStyle = null;
            updateScrollState();
            if (state.serverData) {
                if (state.currentWorkspace === 'lending' && state.serverData.lendingEnabled !== false) {
                    renderLendingView(state.serverData);
                } else {
                    renderExpensesView(state.serverData);
                }
            }
        });
        updateScrollState();
    }

    function openAddTransactionModal(defaultType = 'Expense') {
        setTransactionType(defaultType);
        const modal = document.getElementById('add-transaction-modal');
        const content = document.getElementById('modal-content');
        if (!modal || !content) return;
        modal.classList.remove('hidden');
        setTimeout(() => content.classList.remove('translate-y-full'), 10);
        if (window.__stitchUI && !state.addModalStackId) {
            state.addModalStackId = window.__stitchUI.registerCustomModal(closeAddTransactionModal, true);
        }
    }
    window.openAddTransactionModal = openAddTransactionModal;

    function closeAddTransactionModal() {
        const modal = document.getElementById('add-transaction-modal');
        const content = document.getElementById('modal-content');
        if (!modal || !content) return;
        if (window.__stitchUI && state.addModalStackId) {
            window.__stitchUI.unregisterCustomModal(state.addModalStackId);
            state.addModalStackId = null;
        }
        content.classList.add('translate-y-full');
        setTimeout(() => modal.classList.add('hidden'), 260);
    }
    window.closeAddTransactionModal = closeAddTransactionModal;

    function setTransactionType(type) {
        state.selectedTxType = type;
        const btnExp = document.getElementById('btn-type-expense');
        const btnInc = document.getElementById('btn-type-income');
        if (btnExp && btnInc) {
            if (type === 'Expense') {
                btnExp.className = 'py-2 text-xs font-bold rounded-lg bg-surface-container-lowest shadow text-on-surface transition-all';
                btnInc.className = 'py-2 text-xs font-bold rounded-lg text-on-surface-variant transition-all';
            } else {
                btnInc.className = 'py-2 text-xs font-bold rounded-lg bg-surface-container-lowest shadow text-on-surface transition-all';
                btnExp.className = 'py-2 text-xs font-bold rounded-lg text-on-surface-variant transition-all';
            }
        }
        updateCategorySelectOptions();
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('tx-title').value.trim();
        const amount = window.__stitchParseNumeric
            ? window.__stitchParseNumeric(document.getElementById('tx-amount').value)
            : parseFloat(String(document.getElementById('tx-amount').value).replace(/,/g, ''));
        const category = document.getElementById('tx-category').value;

        if (!title || isNaN(amount) || amount <= 0) {
            if (window.__stitchToast) window.__stitchToast('Enter a valid title and positive amount.', 'error');
            return;
        }

        const payload = {
            type: 'transaction.create',
            amount: amount,
            note: title,
            category: category,
            transactionType: state.selectedTxType.toLowerCase(),
            date: new Date().toISOString()
        };

        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        } else if (window.__stitchPost) {
            window.__stitchPost(payload);
        }

        closeAddTransactionModal();
        document.getElementById('transaction-form').reset();
        showToast(\`\${state.selectedTxType} of KSh \${formatCurrency(amount)} saved!\`);
    }

    function toggleNotifications() {
        const popover = document.getElementById('notifications-popover');
        if (popover) popover.classList.toggle('hidden');
    }

    function toggleAllHistoryModal() {
        const modal = document.getElementById('history-modal');
        const container = document.getElementById('full-history-container');
        if (!modal || !container) return;

        if (modal.classList.contains('hidden')) {
            const list = state.serverData?.recentTransactions || [];
            if (list.length === 0) {
                container.innerHTML = '<p class="text-xs text-outline text-center py-4">No transactions recorded yet.</p>';
            } else {
                container.innerHTML = list.map(tx => \`
                    <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                        <div>
                            <p class="text-xs font-bold text-on-surface">\${tx.title}</p>
                            <p class="text-[10px] text-on-surface-variant">\${tx.subtitle}</p>
                        </div>
                        <p class="text-xs font-bold \${tx.kind === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}">\${tx.amount}</p>
                    </div>
                \`).join('');
            }
            modal.classList.remove('hidden');
            if (window.__stitchUI && !state.historyModalStackId) {
                state.historyModalStackId = window.__stitchUI.registerCustomModal(toggleAllHistoryModal, true);
            }
        } else {
            if (window.__stitchUI && state.historyModalStackId) {
                window.__stitchUI.unregisterCustomModal(state.historyModalStackId);
                state.historyModalStackId = null;
            }
            modal.classList.add('hidden');
        }
    }
    window.toggleAllHistoryModal = toggleAllHistoryModal;

    function switchRoute(routeName, event) {
        if (event) event.preventDefault();
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'navigate', route: routeName }));
        } else if (window.__stitchPost) {
            window.__stitchPost({ type: 'navigate', route: routeName });
        }
    }

    function formatCurrency(num) {
        return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function showToast(msg) {
        if (typeof window.__stitchToast === 'function') {
            window.__stitchToast(msg, 'info');
        }
    }

    function togglePhoneMenu(forceState) {
        const menu = document.getElementById('phone-nav-menu');
        const backdrop = document.getElementById('phone-menu-backdrop');
        const menuIcon = document.getElementById('phone-menu-icon');
        if (!menu) return;

        const isCurrentlyOpen = !menu.classList.contains('hidden') && menu.classList.contains('opacity-100');
        const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyOpen;

        if (shouldOpen) {
            menu.classList.remove('hidden');
            if (backdrop) {
                backdrop.classList.remove('hidden');
                backdrop.classList.remove('pointer-events-none');
                setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
            }
            setTimeout(() => {
                menu.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
                menu.classList.add('scale-100', 'opacity-100', 'pointer-events-auto');
            }, 10);
            if (menuIcon) menuIcon.textContent = 'close';
        } else {
            menu.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto');
            menu.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
            if (backdrop) {
                backdrop.classList.add('opacity-0');
                backdrop.classList.add('pointer-events-none');
            }
            setTimeout(() => {
                menu.classList.add('hidden');
                if (backdrop) backdrop.classList.add('hidden');
            }, 200);
            if (menuIcon) menuIcon.textContent = 'menu';
        }
    }
    window.togglePhoneMenu = togglePhoneMenu;

    window.__stitchRenderDashboard = function(data) {
        hydrateDashboardWithData(data);
    };

    window.addEventListener('DOMContentLoaded', () => {
        updateTimezoneAndGreeting();
        initScrollEffects();
        if (window.__STITCH_DATA__) {
            hydrateDashboardWithData(window.__STITCH_DATA__);
        }
        setInterval(updateTimezoneAndGreeting, 60000);
    });
</script>

</body>
</html>`;
