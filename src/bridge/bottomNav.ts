import type { StitchRoute } from './routes'

export type WorkspaceMode = 'expenses' | 'lending'

const LENDING_WORKSPACE_ROUTES = new Set<StitchRoute>([
  'lendingDashboard',
  'lendingAgreements',
  'lendingAnalytics',
  'lendingProfile',
])

const HIDDEN_NAV_ROUTES = new Set<StitchRoute>([
  'signin',
  'signup',
  'forgotPassword',
  'privacyPolicy',
  'termsOfService',
  'privacyDataCenter',
  'parentalConsent',
  'welcome',
  'createAgreement',
  'recordPayment',
  'agreementDetails',
  'addCategory',
  'editCategory',
  'categories',
  'personalInfo',
  'budget',
  'notifications',
  'helpSupport',
  'appearance',
  'settings',
  'lendingProfile',
  'updateCenter',
])

export function getBottomNavCss(): string {
  return `
    /* ── Unified Interactive Curved-Cradle Bottom Navigation (Shallow Cradle + 26px Overlap) ── */
    html.xp-has-bottom-nav body {
      padding-bottom: calc(96px + var(--safe-area-bottom, 0px)) !important;
    }

    #xpense-bottom-nav-wrap {
      position: fixed;
      left: 0;
      right: 0;
      bottom: max(10px, var(--safe-area-bottom, 0px));
      width: 90%;
      z-index: 900;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      padding: 0 14px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Tablet & Desktop (768px+): sleek low 6px bottom offset */
    @media (min-width: 768px) {
      #xpense-bottom-nav-wrap {
        bottom: max(6px, var(--safe-area-bottom, 0px));
        padding: 0 10px;
      }
    }

    #xpense-bottom-nav {
      pointer-events: auto;
      position: relative;
      margin-left: auto;
      margin-right: auto;
      width: 90%;
      max-width: 440px;
      height: 70px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr)) 72px repeat(2, minmax(0, 1fr));
      align-items: center;
      justify-items: center;
      padding: 0 8px;
      border-radius: 26px;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      isolation: isolate;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }

    @media (min-width: 640px) {
      #xpense-bottom-nav {
        max-width: 480px;
        padding: 0 10px;
      }
    }

    @media (min-width: 768px) {
      #xpense-bottom-nav {
        height: 72px;
        max-width: 520px;
        padding: 0 14px;
      }
    }

    @media (min-width: 1024px) and (orientation: landscape) {
      #xpense-bottom-nav {
        max-width: 560px;
        padding: 0 18px;
      }
    }

    .xp-nav-shadow-shell {
      position: absolute;
      inset: 0;
      z-index: 0;
      border-radius: 26px;
      pointer-events: none;
      filter: drop-shadow(0 12px 24px rgba(15, 23, 42, 0.16));
    }

    /* Dock surface clipped to precision SVG path (z-index: 1, below z-index: 10 FAB) */
    .xp-nav-backdrop {
      position: absolute;
      inset: 0;
      z-index: 1;
      border-radius: 26px;
      overflow: hidden;
      background: var(--nav-bg, rgba(255, 255, 255, 0.86));
      clip-path: url(#xp-nav-squircle-clip);
      -webkit-clip-path: url(#xp-nav-squircle-clip);
      transition: background 0.25s ease;
    }

    html[data-visual-style="glass"] .xp-nav-backdrop {
      backdrop-filter: var(--glass-blur, blur(22px) saturate(1.55));
      -webkit-backdrop-filter: var(--glass-blur, blur(22px) saturate(1.55));
    }

    html[data-visual-style="m3"] .xp-nav-backdrop {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: var(--surface-container-high, var(--nav-bg)) !important;
    }

    html[data-pure-black="true"] .xp-nav-backdrop {
      background: rgba(12, 12, 16, 0.94) !important;
    }

    #xp-nav-vector-chrome {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: visible;
    }

    #xp-nav-border-path {
      fill: none;
      stroke: var(--nav-border, rgba(148, 163, 184, 0.34));
      stroke-width: 1px;
    }

    #xp-nav-rim-highlight-path {
      fill: none;
      stroke: var(--border-highlight, rgba(255, 255, 255, 0.45));
      stroke-width: 1px;
    }

    .xp-nav-sheen {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(140px circle at var(--xp-mx, 50%) var(--xp-my, 50%), var(--nav-active-bg, rgba(99,102,241,0.14)), transparent 72%);
      transition: opacity 0.2s ease;
    }

    #xpense-bottom-nav.xp-nav-hover .xp-nav-sheen {
      opacity: 1;
    }

    .xp-nav-tab {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 3px;
      width: 100%;
      max-width: 74px;
      height: 54px;
      margin: 0 auto;
      border-radius: 16px;
      border: none;
      background: transparent;
      color: var(--text-muted, #64748b);
      padding: 4px;
      cursor: pointer;
      outline: none;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.18s ease, transform 0.14s var(--motion-curve, ease);
    }

    .xp-nav-tab:hover {
      color: var(--nav-active-text, var(--action-primary));
    }

    .xp-nav-tab.xp-pressed {
      transform: scale(0.92);
    }

    .xp-nav-tab-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 28px;
      margin: 0 auto;
      border-radius: 999px;
      transition: background-color 0.2s var(--motion-curve, ease), transform 0.2s var(--motion-curve, ease);
    }

    .xp-nav-tab.active {
      color: var(--nav-active-text, var(--action-primary, #4f46e5));
    }

    .xp-nav-tab.active .xp-nav-tab-pill {
      background: var(--nav-active-bg, rgba(99, 102, 241, 0.14));
      transform: translateY(-0.5px);
    }

    .xp-nav-tab.active .material-symbols-outlined {
      font-variation-settings: 'FILL' 1, 'wght' 600;
    }

    .xp-nav-tab .material-symbols-outlined {
      font-size: 22px;
      line-height: 1;
    }

    .xp-nav-label {
      font-size: 11px;
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70px;
      text-align: center;
      margin: 0 auto;
    }

    .xp-nav-tab.active .xp-nav-label {
      font-weight: 700;
    }

    /* Elevated Center Squircle FAB (z-index: 10 on top of dock surface) */
    .xp-nav-fab-slot {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 72px;
      margin: 0 auto;
    }

    #xp-nav-fab {
      position: absolute;
      z-index: 10;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      width: 54px;
      height: 54px;
      border-radius: 18px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--fab-gradient, linear-gradient(145deg, var(--action-primary, #4f46e5), var(--action-primary-hover, #3730a3)));
      color: var(--fab-text, #ffffff);
      box-shadow:
        0 4px 8px -1px rgba(15, 23, 42, 0.34),
        0 12px 24px -2px rgba(79, 70, 229, 0.44),
        inset 0 1px 0 rgba(255, 255, 255, 0.46),
        inset 0 0 0 1px rgba(255, 255, 255, 0.16);
      cursor: pointer;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.18s var(--motion-curve, ease), box-shadow 0.18s ease;
    }

    @media (min-width: 768px) {
      #xp-nav-fab {
        top: -22px;
        width: 64px;
        height: 64px;
      }
    }

    #xp-nav-fab:hover {
      transform: translateX(-50%) translateY(-2px) scale(1.03);
      box-shadow:
        0 6px 12px -1px rgba(15, 23, 42, 0.36),
        0 16px 28px -2px rgba(79, 70, 229, 0.50),
        inset 0 1px 0 rgba(255, 255, 255, 0.54);
    }

    #xp-nav-fab.xp-pressed {
      transform: translateX(-50%) scale(0.91);
    }

    .xp-nav-tab:focus-visible,
    #xp-nav-fab:focus-visible {
      outline: 2px solid var(--focus-ring, var(--action-primary));
      outline-offset: 2px;
    }
  `
}

export function shouldRenderBottomNav(route: StitchRoute): boolean {
  return !HIDDEN_NAV_ROUTES.has(route)
}

export function isLendingRoute(route: StitchRoute): boolean {
  return LENDING_WORKSPACE_ROUTES.has(route)
}

export function getBottomNavHtml(route: StitchRoute): string {
  const lending = isLendingRoute(route)

  const profileRoutes = new Set<StitchRoute>([
    'profile',
    'categories',
    'budget',
    'notifications',
    'personalInfo',
    'helpSupport',
  ])

  const activeTab = lending
    ? route === 'lendingDashboard'
      ? 'lending'
      : route === 'lendingAgreements'
        ? 'records'
        : route === 'lendingAnalytics'
          ? 'insights'
          : 'lending'
    : route === 'dashboard'
      ? 'home'
      : route === 'analytics'
        ? 'analytics'
        : route === 'transactions'
          ? 'history'
          : profileRoutes.has(route)
            ? 'profile'
            : ''

  const chromeSvg = `
    <div class="xp-nav-shadow-shell"></div>
    <div class="xp-nav-backdrop">
      <div class="xp-nav-sheen"></div>
    </div>
    <svg id="xp-nav-vector-chrome" aria-hidden="true">
      <defs>
        <clipPath id="xp-nav-squircle-clip" clipPathUnits="userSpaceOnUse">
          <path id="xp-nav-clip-path-el" d="" />
        </clipPath>
      </defs>
      <path id="xp-nav-border-path" d="" />
      <path id="xp-nav-rim-highlight-path" d="" />
    </svg>`

  if (lending) {
    return `
<div id="xpense-bottom-nav-wrap" data-workspace="lending">
  <nav id="xpense-bottom-nav" role="navigation" aria-label="Lending Navigation">
    ${chromeSvg}

    <button type="button" class="xp-nav-tab" data-nav-route="dashboard" aria-label="Expenses">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">home</span></span>
      <span class="xp-nav-label">Expenses</span>
    </button>

    <button type="button" class="xp-nav-tab ${activeTab === 'lending' ? 'active' : ''}" data-nav-route="lendingDashboard" aria-label="Lending">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">account_balance</span></span>
      <span class="xp-nav-label">Lending</span>
    </button>

    <div class="xp-nav-fab-slot">
      <button type="button" id="xp-nav-fab" data-nav-fab="lending" aria-label="New Lending Action">
        <span class="material-symbols-outlined text-[27px]">add</span>
      </button>
    </div>

    <button type="button" class="xp-nav-tab ${activeTab === 'records' ? 'active' : ''}" data-nav-route="lendingAgreements" aria-label="Records">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">receipt_long</span></span>
      <span class="xp-nav-label">Records</span>
    </button>

    <button type="button" class="xp-nav-tab ${activeTab === 'insights' ? 'active' : ''}" data-nav-route="lendingAnalytics" aria-label="Insights">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">analytics</span></span>
      <span class="xp-nav-label">Insights</span>
    </button>
  </nav>
</div>`
  }

  return `
<div id="xpense-bottom-nav-wrap" data-workspace="expenses">
  <nav id="xpense-bottom-nav" role="navigation" aria-label="Main Navigation">
    ${chromeSvg}

    <button type="button" class="xp-nav-tab ${activeTab === 'home' ? 'active' : ''}" data-nav-route="dashboard" aria-label="Home">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">home</span></span>
      <span class="xp-nav-label">Home</span>
    </button>

    <button type="button" class="xp-nav-tab ${activeTab === 'analytics' ? 'active' : ''}" data-nav-route="analytics" aria-label="Analytics">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">analytics</span></span>
      <span class="xp-nav-label">Analytics</span>
    </button>

    <div class="xp-nav-fab-slot">
      <button type="button" id="xp-nav-fab" data-nav-fab="expenses" aria-label="Add Transaction">
        <span class="material-symbols-outlined text-[27px]">add</span>
      </button>
    </div>

    <button type="button" class="xp-nav-tab ${activeTab === 'history' ? 'active' : ''}" data-nav-route="transactions" aria-label="History">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">history</span></span>
      <span class="xp-nav-label">History</span>
    </button>

    <button type="button" class="xp-nav-tab ${activeTab === 'profile' ? 'active' : ''}" data-nav-route="profile" aria-label="Profile">
      <span class="xp-nav-tab-pill"><span class="material-symbols-outlined">person</span></span>
      <span class="xp-nav-label">Profile</span>
    </button>
  </nav>
</div>`
}

export function getBottomNavScript(): string {
  return `
  (function() {
    var nav = document.getElementById('xpense-bottom-nav');
    if (!nav || nav.__xpBound) return;
    nav.__xpBound = true;
    document.documentElement.classList.add('xp-has-bottom-nav');

    function syncDockSvgGeometry() {
      var w = nav.offsetWidth;
      var h = nav.offsetHeight;
      if (!w || !h) return;
      var isTablet = window.innerWidth >= 768;
      var cx = w / 2;
      var R = 26, inset = 0.5, Rb = 25.5;
      var d = isTablet ? 16 : 14;
      var halfW = isTablet ? 34 : 33;

      var clipD = '', borderD = '';
      if (d <= 0) {
        clipD = 'M ' + R + ' 0 L ' + (w - R) + ' 0 A ' + R + ' ' + R + ' 0 0 1 ' + w + ' ' + R +
                ' L ' + w + ' ' + (h - R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + (w - R) + ' ' + h +
                ' L ' + R + ' ' + h + ' A ' + R + ' ' + R + ' 0 0 1 0 ' + (h - R) +
                ' L 0 ' + R + ' A ' + R + ' ' + R + ' 0 0 1 ' + R + ' 0 Z';
        borderD = 'M ' + R + ' ' + inset + ' L ' + (w - R) + ' ' + inset + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - inset) + ' ' + R +
                  ' L ' + (w - inset) + ' ' + (h - R) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - R) + ' ' + (h - inset) +
                  ' L ' + R + ' ' + (h - inset) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + inset + ' ' + (h - R) +
                  ' L ' + inset + ' ' + R + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + R + ' ' + inset + ' Z';
      } else if (d < 20) {
        var r = 20, shStart = halfW + 14;
        var theta = (52 * Math.PI) / 180;
        var arcDx = r * Math.sin(theta), arcDy = r * (1 - Math.cos(theta));
        var jY = +(d - arcDy).toFixed(2), arcCenterX = +(halfW - arcDx).toFixed(2);
        var cp2Dx = +(jY / Math.tan(theta)).toFixed(2);
        clipD = 'M ' + R + ' 0 L ' + (cx - shStart) + ' 0 ' +
                'C ' + (cx - shStart + 7.2) + ' 0, ' + (cx - halfW - cp2Dx) + ' 0, ' + (cx - halfW) + ' ' + jY + ' ' +
                'A ' + r + ' ' + r + ' 0 0 0 ' + (cx - arcCenterX) + ' ' + d + ' L ' + (cx + arcCenterX) + ' ' + d + ' ' +
                'A ' + r + ' ' + r + ' 0 0 0 ' + (cx + halfW) + ' ' + jY + ' ' +
                'C ' + (cx + halfW + cp2Dx) + ' 0, ' + (cx + shStart - 7.2) + ' 0, ' + (cx + shStart) + ' 0 ' +
                'L ' + (w - R) + ' 0 A ' + R + ' ' + R + ' 0 0 1 ' + w + ' ' + R +
                ' L ' + w + ' ' + (h - R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + (w - R) + ' ' + h +
                ' L ' + R + ' ' + h + ' A ' + R + ' ' + R + ' 0 0 1 0 ' + (h - R) +
                ' L 0 ' + R + ' A ' + R + ' ' + R + ' 0 0 1 ' + R + ' 0 Z';
        var rb = r - inset, halfWb = halfW - inset, db = d - inset, jYb = +(jY + 0.25).toFixed(2);
        borderD = 'M ' + R + ' ' + inset + ' L ' + (cx - shStart) + ' ' + inset + ' ' +
                  'C ' + (cx - shStart + 7.2) + ' ' + inset + ', ' + (cx - halfWb - cp2Dx) + ' ' + inset + ', ' + (cx - halfWb) + ' ' + jYb + ' ' +
                  'A ' + rb + ' ' + rb + ' 0 0 0 ' + (cx - arcCenterX) + ' ' + db + ' L ' + (cx + arcCenterX) + ' ' + db + ' ' +
                  'A ' + rb + ' ' + rb + ' 0 0 0 ' + (cx + halfWb) + ' ' + jYb + ' ' +
                  'C ' + (cx + halfWb + cp2Dx) + ' ' + inset + ', ' + (cx + shStart - 7.2) + ' ' + inset + ', ' + (cx + shStart) + ' ' + inset + ' ' +
                  'L ' + (w - R) + ' ' + inset + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - inset) + ' ' + R +
                  ' L ' + (w - inset) + ' ' + (h - R) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - R) + ' ' + (h - inset) +
                  ' L ' + R + ' ' + (h - inset) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + inset + ' ' + (h - R) +
                  ' L ' + inset + ' ' + R + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + R + ' ' + inset + ' Z';
      } else {
        var rDeep = 24, wallY = d - rDeep, arcOffX = halfW - rDeep, shDeep = halfW + 15;
        clipD = 'M ' + R + ' 0 L ' + (cx - shDeep) + ' 0 ' +
                'C ' + (cx - shDeep + 9) + ' 0, ' + (cx - halfW) + ' 4.5, ' + (cx - halfW) + ' ' + wallY + ' ' +
                'A ' + rDeep + ' ' + rDeep + ' 0 0 0 ' + (cx - arcOffX) + ' ' + d + ' L ' + (cx + arcOffX) + ' ' + d + ' ' +
                'A ' + rDeep + ' ' + rDeep + ' 0 0 0 ' + (cx + halfW) + ' ' + wallY + ' ' +
                'C ' + (cx + halfW) + ' 4.5, ' + (cx + shDeep - 9) + ' 0, ' + (cx + shDeep) + ' 0 ' +
                'L ' + (w - R) + ' 0 A ' + R + ' ' + R + ' 0 0 1 ' + w + ' ' + R +
                ' L ' + w + ' ' + (h - R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + (w - R) + ' ' + h +
                ' L ' + R + ' ' + h + ' A ' + R + ' ' + R + ' 0 0 1 0 ' + (h - R) +
                ' L 0 ' + R + ' A ' + R + ' ' + R + ' 0 0 1 ' + R + ' 0 Z';
        var rbDeep = rDeep - inset, halfWbDeep = halfW - inset, dbDeep = d - inset;
        borderD = 'M ' + R + ' ' + inset + ' L ' + (cx - shDeep) + ' ' + inset + ' ' +
                  'C ' + (cx - shDeep + 9) + ' ' + inset + ', ' + (cx - halfWbDeep) + ' 4.7, ' + (cx - halfWbDeep) + ' ' + wallY + ' ' +
                  'A ' + rbDeep + ' ' + rbDeep + ' 0 0 0 ' + (cx - arcOffX) + ' ' + dbDeep + ' L ' + (cx + arcOffX) + ' ' + dbDeep + ' ' +
                  'A ' + rbDeep + ' ' + rbDeep + ' 0 0 0 ' + (cx + halfWbDeep) + ' ' + wallY + ' ' +
                  'C ' + (cx + halfWbDeep) + ' 4.7, ' + (cx + shDeep - 9) + ' ' + inset + ', ' + (cx + shDeep) + ' ' + inset + ' ' +
                  'L ' + (w - R) + ' ' + inset + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - inset) + ' ' + R +
                  ' L ' + (w - inset) + ' ' + (h - R) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + (w - R) + ' ' + (h - inset) +
                  ' L ' + R + ' ' + (h - inset) + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + inset + ' ' + (h - R) +
                  ' L ' + inset + ' ' + R + ' A ' + Rb + ' ' + Rb + ' 0 0 1 ' + R + ' ' + inset + ' Z';
      }

      var svg = document.getElementById('xp-nav-vector-chrome');
      var clipEl = document.getElementById('xp-nav-clip-path-el');
      var borderEl = document.getElementById('xp-nav-border-path');
      if (svg) svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      if (clipEl) clipEl.setAttribute('d', clipD);
      if (borderEl) borderEl.setAttribute('d', borderD);
    }

    syncDockSvgGeometry();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncDockSvgGeometry).observe(nav);
    } else {
      window.addEventListener('resize', syncDockSvgGeometry);
    }

    function postNav(payload) {
      if (window.__stitchPost) {
        window.__stitchPost(payload);
      } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function openLendingFabSheet() {
      if (window.__stitchActionSheet) {
        window.__stitchActionSheet({
          title: 'New Lending or Borrowing',
          subtitle: 'Choose Casual personal tracking or formal Loan Agreement',
          actions: [
            {
              id: 'casual_lent',
              label: 'Casual: Lend Money',
              subtitle: 'Informal money owed to you (0% interest)',
              icon: 'handshake',
              tone: 'success',
              onSelect: function() {
                postNav({ type: 'navigate', route: 'createAgreement', mode: 'casual', origin: 'casual', direction: 'lent' });
              }
            },
            {
              id: 'casual_borrowed',
              label: 'Casual: Borrow Money',
              subtitle: 'Informal personal loan you owe (0% interest)',
              icon: 'call_received',
              tone: 'warning',
              onSelect: function() {
                postNav({ type: 'navigate', route: 'createAgreement', mode: 'casual', origin: 'casual', direction: 'borrowed' });
              }
            },
            {
              id: 'formal_lent',
              label: 'Loan Agreement: Lend Money',
              subtitle: 'Formal client loan with interest & penalty terms',
              icon: 'account_balance',
              tone: 'primary',
              onSelect: function() {
                postNav({ type: 'navigate', route: 'createAgreement', mode: 'formal', origin: 'formal', direction: 'lent' });
              }
            },
            {
              id: 'formal_borrowed',
              label: 'Loan Agreement: Borrow Money',
              subtitle: 'Institution, bank, or SACCO facility you owe',
              icon: 'receipt_long',
              tone: 'default',
              onSelect: function() {
                postNav({ type: 'navigate', route: 'createAgreement', mode: 'formal', origin: 'formal', direction: 'borrowed' });
              }
            }
          ]
        });
      } else {
        postNav({ type: 'navigate', route: 'createAgreement', mode: 'casual', origin: 'casual', direction: 'lent' });
      }
    }

    function triggerAction(target) {
      if (!target) return;
      var route = target.getAttribute('data-nav-route');
      var fabKind = target.getAttribute('data-nav-fab');
      if (fabKind) {
        postNav({ type: 'haptic', style: 'selection' });
        var workspace = (document.getElementById('xpense-bottom-nav-wrap') || {}).getAttribute
          ? document.getElementById('xpense-bottom-nav-wrap').getAttribute('data-workspace')
          : 'expenses';
        var homeWs = window.__XPENSE_ACTIVE_WORKSPACE || workspace;
        if (fabKind === 'lending' || homeWs === 'lending') {
          openLendingFabSheet();
        } else {
          postNav({ type: 'navigate', route: 'addExpense' });
        }
        return;
      }
      if (route) {
        if (target.classList.contains('active')) return;
        postNav({ type: 'haptic', style: 'selection' });
        postNav({ type: 'navigate', route: route });
      }
    }

    var activePointerId = null;
    var activeTarget = null;
    var startX = 0;
    var startY = 0;
    var movedAway = false;

    function clearPressed() {
      if (activeTarget) activeTarget.classList.remove('xp-pressed');
      activePointerId = null;
      activeTarget = null;
      movedAway = false;
    }

    nav.addEventListener('pointerdown', function(e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-nav-route], [data-nav-fab]') : null;
      if (!btn) return;
      activePointerId = e.pointerId;
      activeTarget = btn;
      startX = e.clientX;
      startY = e.clientY;
      movedAway = false;
      btn.classList.add('xp-pressed');
    });

    nav.addEventListener('pointermove', function(e) {
      var rect = nav.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        nav.style.setProperty('--xp-mx', (e.clientX - rect.left) + 'px');
        nav.style.setProperty('--xp-my', (e.clientY - rect.top) + 'px');
        nav.classList.add('xp-nav-hover');
      }
      if (!activeTarget || e.pointerId !== activePointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var btnRect = activeTarget.getBoundingClientRect();
      var inside = e.clientX >= btnRect.left - 8 && e.clientX <= btnRect.right + 8 && e.clientY >= btnRect.top - 12 && e.clientY <= btnRect.bottom + 8;
      if (!inside || Math.hypot(dx, dy) > 26) {
        movedAway = true;
        activeTarget.classList.remove('xp-pressed');
      }
    });

    nav.addEventListener('pointerup', function(e) {
      if (!activeTarget || e.pointerId !== activePointerId) return;
      var target = activeTarget;
      var cancelled = movedAway;
      var btnRect = target.getBoundingClientRect();
      var releasedInside = e.clientX >= btnRect.left - 8 && e.clientX <= btnRect.right + 8 && e.clientY >= btnRect.top - 12 && e.clientY <= btnRect.bottom + 8;
      clearPressed();
      if (!cancelled && releasedInside) {
        target.__xpSkipClick = true;
        triggerAction(target);
      }
    });

    nav.addEventListener('pointercancel', clearPressed);
    nav.addEventListener('pointerleave', function() {
      nav.classList.remove('xp-nav-hover');
      if (activePointerId !== null) clearPressed();
    });

    nav.addEventListener('click', function(e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-nav-route], [data-nav-fab]') : null;
      if (!btn) return;
      if (btn.__xpSkipClick) {
        btn.__xpSkipClick = false;
        return;
      }
      triggerAction(btn);
    });
  })();
  `
}