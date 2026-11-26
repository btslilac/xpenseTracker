import { sharedScript } from './shared'

export function appearanceScript() {
  return `
${sharedScript()}
(function() {
  var data = window.__STITCH_DATA__ || {};
  var state = {
    style: data.style === 'material-expressive' || data.style === 'material' ? 'material-expressive' : 'liquid-glass',
    colorScheme: data.colorScheme || 'system',
    resolvedColorScheme: data.resolvedColorScheme || 'light',
    pureBlack: Boolean(data.pureBlack),
    colorTheme: data.colorTheme || 'concept',
    effectivePaletteId: data.effectivePaletteId || 'concept',
    reducedMotion: Boolean(data.reducedMotion),
    dynamicWallpaperSupported: Boolean(data.dynamicWallpaperSupported),
    dynamicWallpaperReason: data.dynamicWallpaperReason || '',
    swatches: Array.isArray(data.swatches) ? data.swatches : [],
    currency: data.currency || 'KES',
    monthlyBudget: Number(data.monthlyBudget) || 0,
    budgetConfigured: Boolean(data.budgetConfigured),
    categoriesCount: Number(data.categoriesCount) || 0,
    lendingEnabled: Boolean(data.lendingEnabled),
    smsTransactionDetection: Boolean(data.smsTransactionDetection),
    biometricLock: Boolean(data.biometricLock),
    fullName: data.fullName || '',
    email: data.email || '',
    syncStatus: data.syncStatus || { isOnline: true, pendingCount: 0 }
  };

  var CURRENCIES = [
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  function currencyLabel(code) {
    for (var i = 0; i < CURRENCIES.length; i++) {
      if (CURRENCIES[i].code === code) return CURRENCIES[i].code + ' — ' + CURRENCIES[i].name;
    }
    return code;
  }

  function formatRelativeSync(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return 'Last synced ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function postAppearanceLive() {
    if (window.__stitchPost) {
      window.__stitchPost({
        type: 'settings.appearance.save',
        live: true,
        style: state.style,
        colorScheme: state.colorScheme,
        pureBlack: state.pureBlack,
        colorTheme: state.colorTheme,
        reducedMotion: state.reducedMotion
      });
    }
  }

  function renderSwatches() {
    var strip = document.getElementById('palette-swatch-strip');
    if (!strip) return;
    strip.innerHTML = '';

    var swatches = state.swatches;
    if (!swatches || swatches.length === 0) {
      swatches = [
        { id: 'wallpaper', label: 'Wallpaper', supported: false, primary: '#2563eb', secondary: '#0ea5e9', tertiary: '#4f46e5' },
        { id: 'concept', label: 'Concept', supported: true, primary: '#2563eb', secondary: '#0ea5e9', tertiary: '#4f46e5' },
        { id: 'violet', label: 'Violet', supported: true, primary: '#7c3aed', secondary: '#a855f7', tertiary: '#c084fc' },
        { id: 'coral', label: 'Coral', supported: true, primary: '#ea580c', secondary: '#f97316', tertiary: '#fb7185' }
      ];
    }

    swatches.forEach(function(sw) {
      var isSelected = state.colorTheme === sw.id;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-card no-min-touch' + (isSelected ? ' is-selected' : '');
      btn.setAttribute('data-color-theme', sw.id);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      var badgeHtml = '';
      if (sw.id === 'wallpaper' && !sw.supported) {
        badgeHtml = '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)]">Fallback</span>';
      } else if (sw.id === 'wallpaper' && sw.supported) {
        badgeHtml = '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">Dynamic</span>';
      }

      btn.innerHTML =
        '<div class="swatch-disc-wrap">' +
          '<div class="swatch-disc">' +
            '<div style="position:absolute;inset:0 0 48% 0;background:' + sw.primary + ';"></div>' +
            '<div style="position:absolute;inset:52% 50% 0 0;background:' + sw.secondary + ';"></div>' +
            '<div style="position:absolute;inset:52% 0 0 50%;background:' + sw.tertiary + ';"></div>' +
            (isSelected ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.22);"><span class="material-symbols-outlined text-white text-[18px]" style="font-variation-settings:\\'FILL\\' 1;">check</span></div>' : '') +
          '</div>' +
        '</div>' +
        '<span class="text-[11px] font-bold leading-tight">' + sw.label + '</span>' +
        badgeHtml;

      btn.addEventListener('click', function() {
        if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
        state.colorTheme = sw.id;
        state.effectivePaletteId = (sw.id === 'wallpaper' && !sw.supported) ? 'concept' : sw.id;
        renderAll();
        try {
          btn.scrollIntoView({
            behavior: state.reducedMotion ? 'auto' : 'smooth',
            inline: 'center',
            block: 'nearest'
          });
        } catch (e) {}
        postAppearanceLive();
      });

      strip.appendChild(btn);
    });
  }

  function renderAll() {
    var isGlass = state.style === 'liquid-glass';
    var styleLabel = isGlass ? 'Liquid Glass' : 'Material 3 Expressive';
    var headerPill = document.getElementById('header-style-pill');
    if (headerPill) headerPill.textContent = isGlass ? 'Liquid Glass' : 'M3 Expressive';

    var styleDesc = document.getElementById('style-active-desc');
    if (styleDesc) {
      styleDesc.textContent = isGlass
        ? 'Liquid Glass — Frosted translucency & floating dock'
        : 'Material 3 Expressive — Tonal containers & docked bar';
    }

    var optGlass = document.getElementById('opt-style-liquid-glass');
    var optM3 = document.getElementById('opt-style-material-expressive');
    var checkGlass = document.getElementById('check-style-liquid-glass');
    var checkM3 = document.getElementById('check-style-material-expressive');
    if (optGlass) optGlass.classList.toggle('is-selected', isGlass);
    if (optM3) optM3.classList.toggle('is-selected', !isGlass);
    if (checkGlass) checkGlass.classList.toggle('hidden', !isGlass);
    if (checkM3) checkM3.classList.toggle('hidden', isGlass);

    // Scheme buttons & caption
    var schemeLabels = { system: 'System (' + (state.resolvedColorScheme === 'dark' ? 'Dark' : 'Light') + ')', light: 'Light', dark: 'Dark' };
    var themeDesc = document.getElementById('theme-active-desc');
    if (themeDesc) themeDesc.textContent = schemeLabels[state.colorScheme] || 'System';

    document.querySelectorAll('[data-color-scheme]').forEach(function(btn) {
      var sc = btn.getAttribute('data-color-scheme');
      btn.classList.toggle('is-selected', sc === state.colorScheme);
    });

    // Pure Black row (locked when resolved scheme is Light while preserving saved preference)
    var effectiveDark = state.colorScheme === 'dark' || (state.colorScheme === 'system' && state.resolvedColorScheme === 'dark');
    var rowPureBlack = document.getElementById('row-pure-black');
    var switchPureBlack = document.getElementById('switch-pure-black');
    var descPureBlack = document.getElementById('pure-black-desc');
    if (rowPureBlack) rowPureBlack.classList.toggle('is-disabled', !effectiveDark);
    if (switchPureBlack) {
      switchPureBlack.setAttribute('aria-checked', state.pureBlack ? 'true' : 'false');
      switchPureBlack.setAttribute('aria-disabled', effectiveDark ? 'false' : 'true');
    }
    if (descPureBlack) {
      descPureBlack.textContent = effectiveDark
        ? 'True #000000 AMOLED canvas for night comfort'
        : (state.pureBlack ? 'Saved — applies automatically when Dark mode is active' : 'Switch Theme to Dark mode to enable Pure Black');
    }

    // Palette description & fallback banner
    var palName = state.colorTheme.charAt(0).toUpperCase() + state.colorTheme.slice(1);
    var palDesc = document.getElementById('palette-active-desc');
    if (palDesc) {
      palDesc.textContent = (state.colorTheme === 'wallpaper' && !state.dynamicWallpaperSupported)
        ? 'Wallpaper (Fallback: Concept)'
        : palName;
    }
    var fallbackBanner = document.getElementById('wallpaper-fallback-banner');
    var fallbackText = document.getElementById('wallpaper-fallback-text');
    if (fallbackBanner) {
      var showFallback = state.colorTheme === 'wallpaper' && !state.dynamicWallpaperSupported;
      fallbackBanner.classList.toggle('hidden', !showFallback);
      if (showFallback && fallbackText && state.dynamicWallpaperReason) {
        fallbackText.textContent = state.dynamicWallpaperReason + ' — using Concept fallback.';
      }
    }

    // Switches
    var switchMotion = document.getElementById('switch-reduced-motion');
    if (switchMotion) switchMotion.setAttribute('aria-checked', state.reducedMotion ? 'true' : 'false');

    var switchLending = document.getElementById('switch-lending-enabled');
    var rowLendingProfile = document.getElementById('row-lending-profile');
    if (switchLending) switchLending.setAttribute('aria-checked', state.lendingEnabled ? 'true' : 'false');
    if (rowLendingProfile) rowLendingProfile.style.display = state.lendingEnabled ? 'flex' : 'none';

    var switchSms = document.getElementById('switch-sms-detection');
    if (switchSms) switchSms.setAttribute('aria-checked', state.smsTransactionDetection ? 'true' : 'false');

    var switchBio = document.getElementById('switch-biometric-lock');
    if (switchBio) switchBio.setAttribute('aria-checked', state.biometricLock ? 'true' : 'false');

    // Summary Title
    var summaryEl = document.getElementById('live-summary-title');
    if (summaryEl) {
      var modeLabel = state.colorScheme === 'system' ? ('System (' + (state.resolvedColorScheme === 'dark' ? 'Dark' : 'Light') + ')') : (state.colorScheme === 'dark' ? 'Dark' : 'Light');
      if (effectiveDark && state.pureBlack) modeLabel += ' · Pure Black';
      summaryEl.textContent = styleLabel + ' · ' + modeLabel + ' · ' + palName;
    }

    // Finance & Account metadata
    var currencyDesc = document.getElementById('currency-active-desc');
    var currencyPill = document.getElementById('currency-code-pill');
    if (currencyDesc) currencyDesc.textContent = currencyLabel(state.currency);
    if (currencyPill) currencyPill.textContent = state.currency;

    var budgetDesc = document.getElementById('budget-active-desc');
    if (budgetDesc) {
      budgetDesc.textContent = state.budgetConfigured && state.monthlyBudget > 0
        ? state.currency + ' ' + Number(state.monthlyBudget).toLocaleString() + ' / month'
        : 'Not configured yet';
    }

    var catDesc = document.getElementById('categories-active-desc');
    if (catDesc) {
      catDesc.textContent = state.categoriesCount + ' active categories';
    }

    var userDesc = document.getElementById('account-user-desc');
    if (userDesc) {
      userDesc.textContent = state.fullName
        ? state.fullName + (state.email ? ' · ' + state.email : '')
        : (state.email || 'Manage profile & security');
    }

    var appVersionDesc = document.getElementById('app-version-desc');
    if (appVersionDesc && data.appVersion) {
      appVersionDesc.textContent = 'XpenseTracker v' + data.appVersion;
    }

    // Sync section
    renderSyncStatus();
    renderSwatches();
  }

  function renderSyncStatus() {
    var syncDesc = document.getElementById('sync-status-desc');
    var syncTile = document.getElementById('sync-icon-tile');
    var syncGlyph = document.getElementById('sync-icon-glyph');
    var s = state.syncStatus || { isOnline: true, pendingCount: 0 };

    if (!syncDesc || !syncTile || !syncGlyph) return;
    syncTile.className = 'm3-icon-tile';
    if (!s.isOnline) {
      syncTile.classList.add('tile-warning');
      syncGlyph.textContent = 'cloud_off';
      syncDesc.textContent = 'Offline' + (s.pendingCount > 0 ? ' · ' + s.pendingCount + ' queued change(s)' : ' · Working locally');
    } else if (s.pendingCount > 0) {
      syncTile.classList.add('tile-warning');
      syncGlyph.textContent = 'cloud_sync';
      syncDesc.textContent = s.pendingCount + ' pending change(s) ready to sync';
    } else {
      syncTile.classList.add('tile-income');
      syncGlyph.textContent = 'cloud_done';
      var rel = formatRelativeSync(s.lastSyncedAt);
      syncDesc.textContent = rel ? 'Up to date · ' + rel : 'Online · All changes synced';
    }
  }

  function openCurrencyModal() {
    var backdrop = document.createElement('div');
    backdrop.className = 'stitch-modal-backdrop';
    var optionsHtml = CURRENCIES.map(function(c) {
      var active = c.code === state.currency;
      return '<button type="button" data-pick-currency="' + c.code + '" class="no-min-touch w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors ' +
        (active ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] font-bold' : 'stitch-modal-surface') + '">' +
        '<div><span class="text-xs font-extrabold block">' + c.code + '</span><span class="text-[11px] opacity-75">' + c.name + '</span></div>' +
        (active ? '<span class="material-symbols-outlined text-[18px]">check</span>' : '') +
      '</button>';
    }).join('');

    backdrop.innerHTML =
      '<div class="stitch-modal-card p-5 flex flex-col gap-3">' +
        '<div class="flex items-center justify-between pb-2 border-b stitch-modal-divider">' +
          '<h3 class="text-sm font-extrabold">Preferred Currency</h3>' +
          '<button type="button" id="curr-close" class="no-min-touch p-1 rounded-full"><span class="material-symbols-outlined text-[20px]">close</span></button>' +
        '</div>' +
        '<div class="flex flex-col gap-2 max-h-[55vh] overflow-y-auto">' + optionsHtml + '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    requestAnimationFrame(function() { backdrop.classList.add('stitch-visible'); });

    function close() {
      backdrop.classList.remove('stitch-visible');
      setTimeout(function() { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }, 180);
    }

    backdrop.querySelector('#curr-close').addEventListener('click', close);
    backdrop.addEventListener('click', function(e) { if (e.target === backdrop) close(); });
    backdrop.querySelectorAll('[data-pick-currency]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var code = btn.getAttribute('data-pick-currency');
        if (code && code !== state.currency) {
          state.currency = code;
          renderAll();
          if (window.__stitchPost) {
            window.__stitchPost({ type: 'settings.currency.save', currency: code });
          }
        }
        close();
      });
    });
  }

  // Bind UI events
  var btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      if (window.__stitchPost) window.__stitchPost({ type: 'back' });
    });
  }

  document.querySelectorAll('[data-visual-style]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = btn.getAttribute('data-visual-style');
      if (!val || val === state.style) return;
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.style = val;
      renderAll();
      postAppearanceLive();
    });
  });

  document.querySelectorAll('[data-color-scheme]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = btn.getAttribute('data-color-scheme');
      if (!val || val === state.colorScheme) return;
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.colorScheme = val;
      if (val === 'light' || val === 'dark') {
        state.resolvedColorScheme = val;
      }
      renderAll();
      postAppearanceLive();
    });
  });

  var switchPureBlack = document.getElementById('switch-pure-black');
  if (switchPureBlack) {
    switchPureBlack.addEventListener('click', function() {
      var disabled = switchPureBlack.getAttribute('aria-disabled') === 'true';
      if (disabled) {
        if (window.__stitchAlert) {
          window.__stitchAlert('Pure Black AMOLED applies only when Theme is Dark (or System is in Dark mode). Switch Theme to Dark to turn it on.', 'Pure Black Mode', 'info');
        }
        return;
      }
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.pureBlack = !state.pureBlack;
      renderAll();
      postAppearanceLive();
    });
  }

  var switchMotion = document.getElementById('switch-reduced-motion');
  if (switchMotion) {
    switchMotion.addEventListener('click', function() {
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.reducedMotion = !state.reducedMotion;
      renderAll();
      postAppearanceLive();
    });
  }

  var btnReset = document.getElementById('btn-reset-appearance');
  if (btnReset) {
    btnReset.addEventListener('click', function() {
      if (window.__stitchConfirm) {
        window.__stitchConfirm(
          'Restore Liquid Glass design system, System theme, Concept palette, and standard animations? Your expenses, loans, and settings stay untouched.',
          'Reset Appearance Settings',
          function() {
            state.style = 'liquid-glass';
            state.colorScheme = 'system';
            state.pureBlack = false;
            state.colorTheme = 'concept';
            state.effectivePaletteId = 'concept';
            state.reducedMotion = false;
            renderAll();
            if (window.__stitchPost) window.__stitchPost({ type: 'settings.appearance.reset' });
          },
          null,
          'Reset',
          'Cancel'
        );
      }
    });
  }

  var btnCurrency = document.getElementById('btn-currency-picker');
  if (btnCurrency) btnCurrency.addEventListener('click', openCurrencyModal);

  var switchLending = document.getElementById('switch-lending-enabled');
  if (switchLending) {
    switchLending.addEventListener('click', function() {
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.lendingEnabled = !state.lendingEnabled;
      renderAll();
      if (window.__stitchPost) {
        window.__stitchPost({ type: 'settings.lending.toggle', enabled: state.lendingEnabled });
      }
    });
  }

  var switchSms = document.getElementById('switch-sms-detection');
  window.__stitchSetSmsToggleState = function(enabled) {
    state.smsTransactionDetection = Boolean(enabled);
    renderAll();
  };
  if (switchSms) {
    switchSms.addEventListener('click', function() {
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.smsTransactionDetection = !state.smsTransactionDetection;
      renderAll();
      if (window.__stitchPost) {
        window.__stitchPost({ type: 'settings.sms.toggle', enabled: state.smsTransactionDetection });
      }
    });
  }

  var switchBio = document.getElementById('switch-biometric-lock');
  if (switchBio) {
    switchBio.addEventListener('click', function() {
      if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
      state.biometricLock = !state.biometricLock;
      renderAll();
      if (window.__stitchPost) {
        window.__stitchPost({ type: 'settings.biometric.toggle', enabled: state.biometricLock });
      }
    });
  }

  var btnSync = document.getElementById('btn-sync-now');
  if (btnSync) {
    btnSync.addEventListener('click', function() {
      btnSync.textContent = 'Syncing...';
      btnSync.disabled = true;
      if (window.__stitchPost) window.__stitchPost({ type: 'settings.sync.retry' });
      setTimeout(function() {
        btnSync.textContent = 'Sync Now';
        btnSync.disabled = false;
      }, 2500);
    });
  }

  window.__onSyncResult = function(res) {
    if (!res) return;
    if (res.syncStatus) {
      state.syncStatus = res.syncStatus;
      renderSyncStatus();
    }
    if (btnSync) {
      btnSync.textContent = 'Sync Now';
      btnSync.disabled = false;
    }
    if (res.message && window.__stitchAlert) {
      window.__stitchAlert(res.message, 'Cloud Sync', res.ok ? 'success' : 'warning');
    }
  };

  document.addEventListener('xpense:theme-changed', function(e) {
    var detail = e && e.detail;
    if (detail && detail.resolvedAppearance) {
      state.resolvedColorScheme = detail.resolvedAppearance.resolvedColorScheme || state.resolvedColorScheme;
      state.dynamicWallpaperSupported = Boolean(detail.resolvedAppearance.dynamicWallpaperSupported);
      state.dynamicWallpaperReason = detail.resolvedAppearance.dynamicWallpaperReason || state.dynamicWallpaperReason;
      renderAll();
    }
  });

  renderAll();
})();
`;
}
