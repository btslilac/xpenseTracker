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

  /* ── Profile group list (mirrors .m3-group-list from appearance.ts) ── */
  .xp-group-list {
    background: var(--glass-bg, rgba(255,255,255,0.72));
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-subtle, rgba(0,0,0,0.07));
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .xp-group-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 16px;
    border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06));
    transition: background 0.15s ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .xp-group-row:last-child { border-bottom: none; }
  .xp-group-row:active { background: var(--surface-container, rgba(0,0,0,0.04)); }
  .xp-group-row.non-interactive { cursor: default; }

  /* Icon tile (44×44, rounded-2xl, tinted background) */
  .xp-icon-tile {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-container, #dbeafe);
    color: var(--on-primary-container, #0f2c67);
    font-size: 21px;
  }
  .xp-icon-tile.tile-green {
    background: color-mix(in srgb, #22c55e 15%, var(--surface-container-low, #f0fdf4));
    color: #16a34a;
  }
  .xp-icon-tile.tile-purple {
    background: color-mix(in srgb, #a855f7 15%, var(--surface-container-low, #faf5ff));
    color: #9333ea;
  }
  .xp-icon-tile.tile-amber {
    background: color-mix(in srgb, #f59e0b 15%, var(--surface-container-low, #fffbeb));
    color: #d97706;
  }
  .xp-icon-tile.tile-blue {
    background: color-mix(in srgb, #3b82f6 15%, var(--surface-container-low, #eff6ff));
    color: #2563eb;
  }
  .xp-icon-tile.tile-red {
    background: color-mix(in srgb, #ef4444 12%, var(--surface-container-low, #fef2f2));
    color: #dc2626;
  }
  .xp-icon-tile.tile-neutral {
    background: var(--surface-container-high, #e2e8f0);
    color: var(--text-secondary, #475569);
  }
  .xp-icon-tile.tile-teal {
    background: color-mix(in srgb, #14b8a6 15%, var(--surface-container-low, #f0fdfa));
    color: #0d9488;
  }

  /* Toggle pill */
  .xp-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
  .xp-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
  .xp-toggle-track {
    width: 50px; height: 28px;
    background: var(--surface-container-high, #e2e8f0);
    border-radius: 999px;
    transition: background 0.2s ease;
    position: relative;
  }
  .xp-toggle input:checked + .xp-toggle-track { background: var(--action-primary, #1d4ed8); }
  .xp-toggle-track::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 22px; height: 22px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .xp-toggle input:checked + .xp-toggle-track::after { transform: translateX(22px); }

  /* Section heading (matches appearance.ts h2) */
  .xp-section-heading {
    padding: 0 4px;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--action-primary, #1d4ed8);
  }

  /* Hero card */
  .xp-hero-card {
    background: var(--glass-bg, rgba(255,255,255,0.80));
    border-radius: 24px;
    border: 1px solid var(--border-subtle, rgba(0,0,0,0.07));
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  }

  /* Danger button */
  .xp-danger-btn {
    width: 100%;
    padding: 14px;
    border-radius: 16px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--fin-expense, #ef4444);
    border: 1.5px solid color-mix(in srgb, var(--fin-expense, #ef4444) 30%, transparent);
    background: var(--fin-expense-bg, #fef2f2);
    transition: transform 0.1s ease, opacity 0.15s ease;
  }
  .xp-danger-btn:active { transform: scale(0.97); opacity: 0.85; }
</style>
</head>
<body class="bg-background text-on-background pb-28 pt-16">

<!-- ── Top App Bar ── -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-3xl mx-auto flex items-center justify-between">
    <h1 class="text-lg font-extrabold tracking-tight text-[var(--text-primary,#0f172a)]">Profile</h1>
    <!-- Active style pill (dynamic, populated by script) -->
    <span id="profile-style-pill" class="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--primary-container,#dbeafe)] text-[var(--on-primary-container,#0f2c67)]">Liquid Glass</span>
  </div>
</header>

<!-- ── Main ── -->
<main class="max-w-xl md:max-w-3xl mx-auto px-4 pt-5 pb-10 flex flex-col gap-6">

  <!-- ══ HERO: User Identity Card ══ -->
  <section class="xp-hero-card p-5 flex flex-col items-center text-center gap-3">
    <div class="relative w-20 h-20">
      <img id="profile-avatar"
        alt="User Avatar"
        class="w-full h-full rounded-full object-cover ring-4 ring-[var(--primary-container,#dbeafe)] shadow-md"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&accessories=shades&top=shortHair"/>
      <button aria-label="Edit Photo" id="btn-edit-photo"
        class="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        style="background:var(--action-primary,#1d4ed8);color:#fff;z-index:10;">
        <span class="material-symbols-outlined text-[15px]">photo_camera</span>
      </button>
    </div>
    <div>
      <h2 id="user-name" class="text-lg font-extrabold text-[var(--text-primary,#0f172a)] leading-tight">User</h2>
      <p id="user-email" class="text-xs text-[var(--text-secondary,#475569)] mt-0.5">user@example.com</p>
      <span id="user-currency-badge"
        class="inline-block mt-2 text-[11px] font-bold px-3 py-1 rounded-full"
        style="background:var(--primary-container,#dbeafe);color:var(--on-primary-container,#0f2c67);">KES</span>
    </div>
  </section>

  <!-- ══ GROUP: Account ══ -->
  <section aria-labelledby="heading-account">
    <p class="xp-section-heading" id="heading-account">Account</p>
    <div class="xp-group-list">

      <button data-stitch-route="personalInfo" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Personal Information</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Name, email, phone &amp; date of birth</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

      <button data-stitch-route="budget" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile tile-amber">
          <span class="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Budget Settings</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Monthly limits &amp; spending controls</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

      <button data-stitch-route="categories" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile tile-teal">
          <span class="material-symbols-outlined">category</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Category Management</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Expense &amp; income labels</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Lending & Borrowing ══ -->
  <section aria-labelledby="heading-lending">
    <p class="xp-section-heading" id="heading-lending">Lending &amp; Borrowing</p>
    <div class="xp-group-list">

      <div class="xp-group-row non-interactive">
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

      <button id="btn-lending-profile" data-stitch-route="lendingProfile" class="xp-group-row w-full text-left" style="display:none;">
        <div class="xp-icon-tile tile-purple">
          <span class="material-symbols-outlined">badge</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Lending Profile</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Branding for statements &amp; receipts</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Security ══ -->
  <section aria-labelledby="heading-security">
    <p class="xp-section-heading" id="heading-security">Security</p>
    <div class="xp-group-list">

      <div class="xp-group-row non-interactive">
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
    <div class="xp-group-list">

      <div class="xp-group-row non-interactive">
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

      <button data-stitch-route="notifications" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile tile-neutral">
          <span class="material-symbols-outlined">notifications</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Notification Settings</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">Alerts, reminders &amp; push preferences</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: Appearance ══ -->
  <section aria-labelledby="heading-appearance">
    <p class="xp-section-heading" id="heading-appearance">Appearance</p>
    <div class="xp-group-list">

      <button data-stitch-route="settings" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile">
          <span class="material-symbols-outlined">tune</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Settings &amp; Appearance</p>
          <p id="profile-appearance-summary" class="text-[11px] text-[var(--text-secondary)] mt-0.5">Liquid Glass · System · Concept</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ GROUP: About ══ -->
  <section aria-labelledby="heading-about">
    <p class="xp-section-heading" id="heading-about">About</p>
    <div class="xp-group-list">

      <button data-stitch-route="updateCenter" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile tile-blue">
          <span class="material-symbols-outlined">system_update</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Update Center</p>
          <p id="profile-version-subtitle" class="text-[11px] text-[var(--text-secondary)] mt-0.5">Version 1.0.2 (Build 3) · Check for updates</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

      <button data-stitch-route="helpSupport" class="xp-group-row w-full text-left">
        <div class="xp-icon-tile tile-neutral">
          <span class="material-symbols-outlined">help_outline</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-[var(--text-primary)]">Help &amp; Support</p>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">FAQs, feedback &amp; contact</p>
        </div>
        <span class="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">chevron_right</span>
      </button>

    </div>
  </section>

  <!-- ══ DANGER ZONE ══ -->
  <div class="pt-1 pb-2">
    <button data-stitch-event="signout" class="xp-danger-btn">
      <span class="material-symbols-outlined text-[20px]">logout</span>
      Sign Out
    </button>
  </div>

</main>
</body></html>`
