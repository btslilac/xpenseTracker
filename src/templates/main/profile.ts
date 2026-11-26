export const profile = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Profile</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "var(--action-primary, #1d4ed8)",
          "surface": "var(--surface-bg, #f7f9fd)",
          "on-surface": "var(--text-primary, #0f172a)",
          "on-surface-variant": "var(--text-secondary, #475569)",
          "surface-container-low": "var(--surface-container-low, #eff3fa)",
          "surface-container-high": "var(--surface-container-high, #dde5f2)",
          "surface-variant": "var(--surface-container, #e7edf7)",
          "outline-variant": "var(--border-subtle, #cbd5e1)",
          "background": "var(--page-bg, #f4f7fc)",
          "on-background": "var(--text-primary, #0f172a)",
          "error-container": "var(--fin-expense-bg, #fef2f2)",
          "on-error-container": "var(--fin-expense, #ef4444)"
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

  /* Icon tile (42x42, rounded-2xl, dark-mode calibrated) */
  .xp-icon-tile {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-container);
    color: var(--on-primary-container);
    font-size: 21px;
    border: 1px solid color-mix(in srgb, var(--action-primary) 18%, transparent);
  }
  .xp-icon-tile.tile-green {
    background: var(--fin-income-bg);
    color: var(--fin-income);
    border-color: color-mix(in srgb, var(--fin-income) 24%, transparent);
  }
  .xp-icon-tile.tile-purple {
    background: color-mix(in srgb, #a855f7 16%, transparent);
    color: #9333ea;
    border-color: color-mix(in srgb, #a855f7 24%, transparent);
  }
  html.dark .xp-icon-tile.tile-purple {
    background: rgba(168, 85, 247, 0.20);
    color: #d8b4fe;
  }
  .xp-icon-tile.tile-amber {
    background: var(--fin-warning-bg);
    color: var(--fin-warning);
    border-color: color-mix(in srgb, var(--fin-warning) 24%, transparent);
  }
  .xp-icon-tile.tile-blue {
    background: var(--fin-info-bg);
    color: var(--fin-info);
    border-color: color-mix(in srgb, var(--fin-info) 24%, transparent);
  }
  .xp-icon-tile.tile-red {
    background: var(--fin-expense-bg);
    color: var(--fin-expense);
    border-color: color-mix(in srgb, var(--fin-expense) 24%, transparent);
  }
  .xp-icon-tile.tile-neutral {
    background: var(--surface-container-high);
    color: var(--text-secondary);
    border-color: var(--outline-variant);
  }
  .xp-icon-tile.tile-teal {
    background: rgba(20, 184, 166, 0.14);
    color: #0d9488;
    border-color: rgba(20, 184, 166, 0.24);
  }
  html.dark .xp-icon-tile.tile-teal {
    background: rgba(20, 184, 166, 0.20);
    color: #5eead4;
  }

  /* Toggle pill using active theme switch tokens */
  .xp-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
  .xp-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
  .xp-toggle-track {
    width: 52px; height: 30px;
    background: var(--switch-track-off, #cbd5e1);
    border: 1.5px solid var(--outline-variant, transparent);
    border-radius: 999px;
    transition: background 0.2s ease, border-color 0.2s ease;
    position: relative;
  }
  .xp-toggle input:checked + .xp-toggle-track {
    background: var(--switch-track-on, var(--action-primary));
    border-color: var(--switch-track-on, var(--action-primary));
  }
  .xp-toggle-track::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 21px; height: 21px;
    background: var(--switch-thumb-off, #ffffff);
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.22);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease;
  }
  .xp-toggle input:checked + .xp-toggle-track::after {
    transform: translateX(22px);
    background: var(--switch-thumb-on, #ffffff);
  }

  /* Section heading (matches appearance.ts) */
  .xp-section-heading {
    padding: 0 8px;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--action-primary, #1d4ed8);
  }

  /* Hero card aligned with Liquid Glass & Material 3 Expressive */
  .xp-hero-card {
    background: var(--surface-card);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-radius: var(--card-radius, 24px);
    border: 1px solid var(--border-subtle, var(--outline-variant));
    box-shadow: var(--card-shadow);
  }

  /* Danger button */
  .xp-danger-btn {
    width: 100%;
    padding: 14px;
    border-radius: 18px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--fin-expense, #ef4444);
    border: 1.5px solid color-mix(in srgb, var(--fin-expense, #ef4444) 32%, transparent);
    background: var(--fin-expense-bg, #fef2f2);
    transition: transform 0.1s ease, opacity 0.15s ease;
  }
  .xp-danger-btn:active { transform: scale(0.97); opacity: 0.85; }
</style>
</head>
<body class="bg-background text-on-background pb-28 pt-16">

<!-- ── Top App Bar ── -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-3xl mx-auto flex items-center justify-between">
    <h1 class="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">Profile</h1>
    <!-- Active style pill (dynamic, populated by script) -->
    <span id="profile-style-pill" class="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--primary-container)] text-[var(--on-primary-container)]">Liquid Glass</span>
  </div>
</header>

<!-- ── Main ── -->
<main class="max-w-xl md:max-w-3xl mx-auto px-4 pt-5 pb-10 flex flex-col gap-6">

  <!-- ══ HERO: User Identity Card ══ -->
  <section class="xp-hero-card p-5 flex flex-col items-center text-center gap-3">
    <div class="relative w-20 h-20">
      <img id="profile-avatar"
        alt="User Avatar"
        class="w-full h-full rounded-full object-cover ring-4 ring-[var(--primary-container)] shadow-md"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&accessories=shades&top=shortHair"/>
      <button aria-label="Edit Photo" id="btn-edit-photo"
        class="no-min-touch absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform bg-[var(--action-primary)] text-[var(--action-primary-text)]"
        style="z-index:10;">
        <span class="material-symbols-outlined text-[15px]">photo_camera</span>
      </button>
    </div>
    <div>
      <h2 id="user-name" class="text-lg font-extrabold text-[var(--text-primary)] leading-tight">User</h2>
      <p id="user-email" class="text-xs text-[var(--text-secondary)] mt-0.5">user@example.com</p>
      <span id="user-currency-badge"
        class="inline-block mt-2 text-[11px] font-bold px-3 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">KES</span>
    </div>
  </section>

  <!-- ══ GROUP: Account ══ -->
  <section aria-labelledby="heading-account">
    <p class="xp-section-heading" id="heading-account">Account</p>
    <div class="m3-group-list">

      <button type="button" data-stitch-route="personalInfo" class="m3-group-row">
        <div class="xp-icon-tile">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Personal Information</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Name, email, phone &amp; date of birth</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

      <button type="button" data-stitch-route="budget" class="m3-group-row">
        <div class="xp-icon-tile tile-amber">
          <span class="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Budget Settings</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Monthly limits &amp; spending controls</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

      <button type="button" data-stitch-route="categories" class="m3-group-row">
        <div class="xp-icon-tile tile-teal">
          <span class="material-symbols-outlined">category</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Category Management</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Expense &amp; income labels</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Lending & Borrowing ══ -->
  <section aria-labelledby="heading-lending">
    <p class="xp-section-heading" id="heading-lending">Lending &amp; Borrowing</p>
    <div class="m3-group-list">

      <div class="m3-group-row">
        <div class="xp-icon-tile tile-green">
          <span class="material-symbols-outlined">handshake</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Lending &amp; Borrowing</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Track money lent and borrowed</p>
        </div>
        <label class="xp-toggle" aria-label="Toggle Lending">
          <input id="toggle-lending-workspace" type="checkbox"/>
          <div class="xp-toggle-track"></div>
        </label>
      </div>

      <button type="button" id="btn-lending-profile" data-stitch-route="lendingProfile" class="m3-group-row" style="display:none;">
        <div class="xp-icon-tile tile-purple">
          <span class="material-symbols-outlined">badge</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Lending Profile</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Branding for statements &amp; receipts</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Security ══ -->
  <section aria-labelledby="heading-security">
    <p class="xp-section-heading" id="heading-security">Security</p>
    <div class="m3-group-list">

      <div class="m3-group-row">
        <div class="xp-icon-tile tile-green">
          <span class="material-symbols-outlined">fingerprint</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Biometric App Lock</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Face ID / Fingerprint on every open</p>
        </div>
        <label class="xp-toggle" aria-label="Toggle Biometric Lock">
          <input id="toggle-biometric-lock" type="checkbox"/>
          <div class="xp-toggle-track"></div>
        </label>
      </div>

    </div>
  </section>

  <!-- ══ GROUP: Notifications & Data ══ -->
  <section aria-labelledby="heading-notifications">
    <p class="xp-section-heading" id="heading-notifications">Notifications &amp; Data</p>
    <div class="m3-group-list">

      <div class="m3-group-row">
        <div class="xp-icon-tile tile-blue">
          <span class="material-symbols-outlined">sms</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">SMS Transaction Detection</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Auto-detect M-PESA &amp; bank alerts</p>
        </div>
        <label class="xp-toggle" aria-label="Toggle SMS Detection">
          <input id="toggle-sms-detection" type="checkbox"/>
          <div class="xp-toggle-track"></div>
        </label>
      </div>

      <button type="button" data-stitch-route="notifications" class="m3-group-row">
        <div class="xp-icon-tile tile-neutral">
          <span class="material-symbols-outlined">notifications</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Notification Settings</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Alerts, reminders &amp; push preferences</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Appearance ══ -->
  <section aria-labelledby="heading-appearance">
    <p class="xp-section-heading" id="heading-appearance">Appearance</p>
    <div class="m3-group-list">

      <button type="button" data-stitch-route="settings" class="m3-group-row">
        <div class="xp-icon-tile">
          <span class="material-symbols-outlined">tune</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Settings &amp; Appearance</p>
          <p id="profile-appearance-summary" class="text-[11px] text-[var(--text-secondary)] mt-0.5">Liquid Glass · System · Concept</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: About ══ -->
  <section aria-labelledby="heading-about">
    <p class="xp-section-heading" id="heading-about">About</p>
    <div class="m3-group-list">

      <button type="button" data-stitch-route="updateCenter" class="m3-group-row">
        <div class="xp-icon-tile tile-blue">
          <span class="material-symbols-outlined">system_update</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Update Center</p>
          <p id="profile-version-subtitle" class="text-[11px] text-[var(--text-secondary)] mt-0.5">Version 1.0.2 (Build 3) · Check for updates</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

      <button type="button" data-stitch-route="privacyDataCenter" class="m3-group-row">
        <div class="xp-icon-tile tile-blue">
          <span class="material-symbols-outlined">shield_person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Privacy &amp; Data Center</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Export data, legal terms, guardian &amp; deletion</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

      <button type="button" data-stitch-route="helpSupport" class="m3-group-row">
        <div class="xp-icon-tile tile-neutral">
          <span class="material-symbols-outlined">help_outline</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Help &amp; Support</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">FAQs, feedback &amp; contact</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-muted)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ DANGER ZONE ══ -->
  <div class="pt-1 pb-2">
    <button type="button" data-stitch-event="signout" class="xp-danger-btn">
      <span class="material-symbols-outlined text-[20px]">logout</span>
      Sign Out
    </button>
  </div>

</main>
</body></html>`
