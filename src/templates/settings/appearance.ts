export const appearance = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Settings - XpenseTracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "#1d4ed8",
          "on-primary": "#ffffff",
          "primary-container": "#dbeafe",
          "on-primary-container": "#0f2c67",
          "surface": "#f7f9fd",
          "surface-container-low": "#eff3fa",
          "surface-container": "#e7edf7",
          "surface-container-high": "#dde5f2",
          "on-surface": "#0f172a",
          "on-surface-variant": "#475569",
          "outline-variant": "#cbd5e1",
          "background": "#f4f7fc",
        },
        fontFamily: {
          "sans": ["Inter", "sans-serif"]
        }
      }
    }
  }
</script>
<style>
  body {
    font-family: 'Inter', sans-serif;
    min-height: 100dvh;
    -webkit-tap-highlight-color: transparent;
  }
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 450, 'GRAD' 0, 'opsz' 24;
  }
  .material-symbols-filled {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .style-preview-option {
    position: relative;
    border-radius: 18px;
    padding: 12px;
    border: 2px solid var(--outline-variant);
    background: var(--surface-container);
    text-align: left;
    transition: border-color var(--motion-duration) ease, background-color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve);
  }
  .style-preview-option.is-selected {
    border-color: var(--action-primary);
    background: color-mix(in srgb, var(--primary-container) 55%, var(--surface-container-low));
  }
  .style-preview-option:active {
    transform: scale(0.98);
  }

  .scheme-pill-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    min-height: 40px !important;
    border-radius: 14px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    background: transparent;
    transition: background-color var(--motion-duration) ease, color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve);
  }
  .scheme-pill-btn.is-selected {
    background: var(--primary-container);
    color: var(--on-primary-container);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .swatch-card {
    flex-shrink: 0;
    min-width: 82px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 10px 8px;
    border-radius: 18px;
    border: 2px solid transparent;
    background: var(--surface-container);
    cursor: pointer;
    transition: border-color var(--motion-duration) ease, background-color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve);
  }
  .swatch-card.is-selected {
    border-color: var(--action-primary);
    background: color-mix(in srgb, var(--primary-container) 50%, var(--surface-container-low));
  }
  .swatch-card:active {
    transform: scale(0.96);
  }
  .swatch-disc-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 9999px;
    padding: 3px;
    border: 2px solid transparent;
  }
  .swatch-card.is-selected .swatch-disc-wrap {
    border-color: var(--action-primary);
  }
  .swatch-disc {
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.35), 0 2px 6px rgba(0, 0, 0, 0.14);
  }
</style>
</head>
<body class="bg-background text-on-surface antialiased pt-16 pb-12">

<!-- Sticky Top Bar -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
  <div class="flex items-center gap-2.5">
    <button id="btn-back" type="button" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-transform" aria-label="Back">
      <span class="material-symbols-outlined text-[22px]">arrow_back</span>
    </button>
    <h1 class="text-lg font-extrabold tracking-tight">Settings</h1>
  </div>
  <span id="header-style-pill" class="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--primary-container)] text-[var(--on-primary-container)]">
    Liquid Glass
  </span>
</header>

<main class="max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-5 pb-14 flex flex-col gap-6">

  <!-- Expressive Live Theme Summary Strip -->
  <section class="theme-card p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
    <div class="flex items-center gap-3.5 min-w-0">
      <div class="w-11 h-11 rounded-2xl flex items-center justify-center xp-hero-surface shrink-0 shadow-sm">
        <span class="material-symbols-outlined text-[22px] text-white">auto_awesome</span>
      </div>
      <div class="min-w-0">
        <p class="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Look &amp; Feel</p>
        <p id="live-summary-title" class="text-sm font-extrabold truncate">Liquid Glass &bull; System &bull; Concept</p>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <span class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[var(--action-primary)] text-[var(--action-primary-text)]">Primary</span>
      <span class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[var(--primary-container)] text-[var(--on-primary-container)]">Container</span>
      <span class="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-[var(--fin-income-bg)] text-[var(--fin-income)]">+Income</span>
      <span class="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-[var(--fin-expense-bg)] text-[var(--fin-expense)]">-Expense</span>
    </div>
  </section>

  <!-- Responsive Two-Column Grid on Tablet Landscape, Single Column on Phone & Tablet Portrait -->
  <div class="settings-responsive-grid flex flex-col gap-6">

    <!-- LEFT COLUMN: APPEARANCE + PERSONAL FINANCE -->
    <div class="flex flex-col gap-6 min-w-0">

      <!-- GROUP 1: APPEARANCE -->
      <section aria-labelledby="heading-appearance">
        <h2 id="heading-appearance" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Appearance
        </h2>
        <div class="m3-group-list">

          <!-- 1. Design System Selector -->
          <div class="m3-group-row flex-col !items-stretch gap-3">
            <div class="flex items-center gap-3.5">
              <div class="m3-icon-tile">
                <span class="material-symbols-outlined text-[21px]">layers</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[14px] font-bold leading-tight">Design System</p>
                <p id="style-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Liquid Glass — Frosted depth &amp; floating nav</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <button type="button" id="opt-style-liquid-glass" data-visual-style="liquid-glass" class="style-preview-option no-min-touch">
                <div class="flex items-center justify-between mb-2">
                  <div class="w-9 h-6 rounded-lg bg-gradient-to-br from-sky-400/35 to-blue-600/40 border border-white/50 backdrop-blur flex items-center justify-center">
                    <div class="w-5 h-1.5 rounded-full bg-white/80"></div>
                  </div>
                  <span id="check-style-liquid-glass" class="material-symbols-outlined material-symbols-filled text-[18px] text-[var(--action-primary)]">check_circle</span>
                </div>
                <p class="text-xs font-extrabold">Liquid Glass</p>
                <p class="text-[10px] text-[var(--text-secondary)] mt-0.5">Translucent &amp; floating dock</p>
              </button>

              <button type="button" id="opt-style-material-expressive" data-visual-style="material-expressive" class="style-preview-option no-min-touch">
                <div class="flex items-center justify-between mb-2">
                  <div class="w-9 h-6 rounded-lg bg-[var(--primary-container)] flex flex-col justify-between p-1">
                    <div class="w-6 h-1.5 rounded-sm bg-[var(--action-primary)] opacity-80"></div>
                    <div class="w-4 h-1 rounded-sm bg-[var(--on-primary-container)] opacity-45"></div>
                  </div>
                  <span id="check-style-material-expressive" class="material-symbols-outlined material-symbols-filled text-[18px] text-[var(--action-primary)] hidden">check_circle</span>
                </div>
                <p class="text-xs font-extrabold">Material 3</p>
                <p class="text-[10px] text-[var(--text-secondary)] mt-0.5">Expressive tonal shapes</p>
              </button>
            </div>
          </div>

          <!-- 2. Theme Mode Selector (System / Light / Dark) -->
          <div class="m3-group-row flex-col !items-stretch gap-3">
            <div class="flex items-center gap-3.5">
              <div class="m3-icon-tile tile-secondary">
                <span class="material-symbols-outlined text-[21px]">contrast</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[14px] font-bold leading-tight">Theme</p>
                <p id="theme-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Follow device setting</p>
              </div>
            </div>
            <div class="p-1 rounded-2xl bg-[var(--surface-container-high)] flex items-center gap-1">
              <button type="button" data-color-scheme="system" class="scheme-pill-btn">
                <span class="material-symbols-outlined text-[15px]">brightness_auto</span>
                <span>System</span>
              </button>
              <button type="button" data-color-scheme="light" class="scheme-pill-btn">
                <span class="material-symbols-outlined text-[15px]">light_mode</span>
                <span>Light</span>
              </button>
              <button type="button" data-color-scheme="dark" class="scheme-pill-btn">
                <span class="material-symbols-outlined text-[15px]">dark_mode</span>
                <span>Dark</span>
              </button>
            </div>
          </div>

          <!-- 3. Pure Black Toggle -->
          <div id="row-pure-black" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-neutral">
                <span class="material-symbols-outlined text-[21px]">brightness_2</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Pure Black</p>
                <p id="pure-black-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">True #000000 AMOLED canvas in dark mode</p>
              </div>
            </div>
            <button id="switch-pure-black" type="button" role="switch" aria-checked="false" aria-label="Pure Black mode" class="xp-switch">
              <span class="xp-switch-thumb"></span>
            </button>
          </div>

          <!-- 4. Colour Theme Palette Swatches -->
          <div class="m3-group-row flex-col !items-stretch gap-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="m3-icon-tile tile-tertiary">
                  <span class="material-symbols-outlined text-[21px]">palette</span>
                </div>
                <div class="min-w-0">
                  <p class="text-[14px] font-bold leading-tight">Colour Theme</p>
                  <p id="palette-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Concept</p>
                </div>
              </div>
            </div>

            <div id="wallpaper-fallback-banner" class="hidden px-3 py-2 rounded-xl bg-[var(--surface-container-high)] text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-[var(--fin-warning)] shrink-0">info</span>
              <span id="wallpaper-fallback-text">Dynamic wallpaper colors unavailable — using Concept fallback.</span>
            </div>

            <div id="palette-swatch-strip" class="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5 md:grid md:grid-cols-4">
              <!-- Populated dynamically by settings appearance controller -->
            </div>
          </div>

          <!-- 5. Reduced Motion -->
          <div class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-neutral">
                <span class="material-symbols-outlined text-[21px]">motion_photos_off</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Reduced Motion</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Minimize transitions &amp; spring physics</p>
              </div>
            </div>
            <button id="switch-reduced-motion" type="button" role="switch" aria-checked="false" aria-label="Reduced motion" class="xp-switch">
              <span class="xp-switch-thumb"></span>
            </button>
          </div>

          <!-- 6. Reset Appearance -->
          <button id="btn-reset-appearance" type="button" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-neutral">
                <span class="material-symbols-outlined text-[21px]">restart_alt</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Reset Appearance Settings</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Restore defaults without affecting financial data</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>

        </div>
      </section>

      <!-- GROUP 2: PERSONAL FINANCE -->
      <section aria-labelledby="heading-finance">
        <h2 id="heading-finance" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Personal Finance
        </h2>
        <div class="m3-group-list">
          <button id="btn-currency-picker" type="button" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-income">
                <span class="material-symbols-outlined text-[21px]">payments</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Preferred Currency</p>
                <p id="currency-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">KES &mdash; Kenyan Shilling</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span id="currency-code-pill" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--surface-container-high)]">KES</span>
              <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
            </div>
          </button>

          <button type="button" data-stitch-route="budget" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile">
                <span class="material-symbols-outlined text-[21px]">account_balance_wallet</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Monthly Budget</p>
                <p id="budget-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Configure spending limits</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>

          <button type="button" data-stitch-route="categories" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-secondary">
                <span class="material-symbols-outlined text-[21px]">category</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Expense &amp; Income Categories</p>
                <p id="categories-active-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Customize tracking labels</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

    </div>

    <!-- RIGHT COLUMN: LENDING, NOTIFICATIONS, SECURITY, SYNC, APPLICATION -->
    <div class="flex flex-col gap-6 min-w-0">

      <!-- GROUP 3: LENDING & BORROWING -->
      <section aria-labelledby="heading-lending">
        <h2 id="heading-lending" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Lending &amp; Borrowing
        </h2>
        <div class="m3-group-list">
          <div class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-tertiary">
                <span class="material-symbols-outlined text-[21px]">handshake</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Lending Workspace</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Casual IOUs and formal loan agreements</p>
              </div>
            </div>
            <button id="switch-lending-enabled" type="button" role="switch" aria-checked="false" aria-label="Toggle Lending Workspace" class="xp-switch">
              <span class="xp-switch-thumb"></span>
            </button>
          </div>

          <button id="row-lending-profile" type="button" data-stitch-route="lendingProfile" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-secondary">
                <span class="material-symbols-outlined text-[21px]">badge</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Lending Profile</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Lender business details &amp; branding</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

      <!-- GROUP 4: NOTIFICATIONS & SMS -->
      <section aria-labelledby="heading-notifications">
        <h2 id="heading-notifications" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Notifications &amp; SMS
        </h2>
        <div class="m3-group-list">
          <button type="button" data-stitch-route="notifications" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-warning">
                <span class="material-symbols-outlined text-[21px]">notifications</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Notification Settings</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Budget thresholds &amp; overdue reminders</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>

          <div class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-info">
                <span class="material-symbols-outlined text-[21px]">sms</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">SMS Transaction Detection</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Detect M-Pesa &amp; bank receipts automatically</p>
              </div>
            </div>
            <button id="switch-sms-detection" type="button" role="switch" aria-checked="false" aria-label="SMS Transaction Detection" class="xp-switch">
              <span class="xp-switch-thumb"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- GROUP 5: SECURITY & ACCOUNT -->
      <section aria-labelledby="heading-security">
        <h2 id="heading-security" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Security &amp; Account
        </h2>
        <div class="m3-group-list">
          <div class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile">
                <span class="material-symbols-outlined text-[21px]">fingerprint</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Biometric App Lock</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Unlock financial records with Face ID / Fingerprint</p>
              </div>
            </div>
            <button id="switch-biometric-lock" type="button" role="switch" aria-checked="false" aria-label="Biometric App Lock" class="xp-switch">
              <span class="xp-switch-thumb"></span>
            </button>
          </div>

          <button type="button" data-stitch-route="personalInfo" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-secondary">
                <span class="material-symbols-outlined text-[21px]">person</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Personal Information</p>
                <p id="account-user-desc" class="text-xs text-[var(--text-secondary)] mt-0.5 truncate">Manage profile &amp; email</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

      <!-- GROUP 6: DATA & SYNCHRONIZATION -->
      <section aria-labelledby="heading-sync">
        <h2 id="heading-sync" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Data &amp; Synchronization
        </h2>
        <div class="m3-group-list">
          <div class="m3-group-row flex-wrap">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div id="sync-icon-tile" class="m3-icon-tile tile-income">
                <span id="sync-icon-glyph" class="material-symbols-outlined text-[21px]">cloud_done</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Cloud Synchronization</p>
                <p id="sync-status-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">Checking connection...</p>
              </div>
            </div>
            <button id="btn-sync-now" type="button" class="no-min-touch px-3.5 py-2 rounded-full text-xs font-bold bg-[var(--primary-container)] text-[var(--on-primary-container)] active:scale-95 transition-transform">
              Sync Now
            </button>
          </div>
        </div>
      </section>

      <!-- GROUP 7: APPLICATION -->
      <section aria-labelledby="heading-app">
        <h2 id="heading-app" class="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-widest text-[var(--action-primary)]">
          Application
        </h2>
        <div class="m3-group-list">
          <button type="button" data-stitch-route="updateCenter" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-neutral">
                <span class="material-symbols-outlined text-[21px]">system_update</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Updates &amp; App Info</p>
                <p id="app-version-desc" class="text-xs text-[var(--text-secondary)] mt-0.5">XpenseTracker v1.0.2</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>

          <button type="button" data-stitch-route="privacyDataCenter" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-blue">
                <span class="material-symbols-outlined text-[21px]">shield_person</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Privacy &amp; Data Center</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Export data, consents &amp; delete account</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>

          <button type="button" data-stitch-route="helpSupport" class="m3-group-row">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <div class="m3-icon-tile tile-neutral">
                <span class="material-symbols-outlined text-[21px]">help</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold leading-tight">Help &amp; Support</p>
                <p class="text-xs text-[var(--text-secondary)] mt-0.5">Guides, troubleshooting &amp; contact</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[var(--text-muted)] text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

    </div>

  </div>

</main>
</body></html>`;
