import { generateThemeCss, getThemeBridgeVariables } from './themeTokens'
import { getUiModalsScript } from './uiModals'
import { getBottomNavCss, getBottomNavHtml, getBottomNavScript, shouldRenderBottomNav } from './bottomNav'
import type { StitchRoute } from './routes'
import { resolveAppearance } from '../lib/appearance'
import type { DynamicColorPayload } from '../native/dynamicColor'

function escapeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function parseDynamicPayload(raw?: string): DynamicColorPayload | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as DynamicColorPayload
  } catch {
    return null
  }
}

export function inject(baseHtml: string, script: string, payload?: any, route?: StitchRoute) {
  const safeAreaTop = payload?.routeParams?._safeAreaTop || '0'
  const safeAreaBottom = payload?.routeParams?._safeAreaBottom || '0'
  const systemColorScheme: 'light' | 'dark' =
    payload?.routeParams?._systemColorScheme === 'dark'
      ? 'dark'
      : payload?.routeParams?._colorScheme === 'dark'
        ? 'dark'
        : 'light'

  const dynamicPayload = parseDynamicPayload(payload?.routeParams?._dynamicPaletteJson)

  const resolved = resolveAppearance(
    {
      style: payload?.routeParams?._visualStyle,
      colorScheme:
        payload?.routeParams?._colorSchemePref || payload?.routeParams?._colorScheme || 'system',
      pureBlack: payload?.routeParams?._pureBlack === 'true',
      colorTheme: payload?.routeParams?._colorTheme,
      reducedMotion: payload?.routeParams?._reducedMotion === 'true',
    },
    systemColorScheme,
    dynamicPayload,
  )

  const vars = getThemeBridgeVariables(resolved)
  const themeCss = generateThemeCss(resolved)
  const uiModalsScript = getUiModalsScript()

  const enrichedPayload =
    payload === undefined
      ? undefined
      : {
          ...payload,
          resolvedAppearance: resolved,
          themeTokens: vars.tokens,
        }

  const dataScript =
    enrichedPayload === undefined
      ? ''
      : `window.__STITCH_DATA__=${escapeJson(enrichedPayload)};`

  let finalHtml = baseHtml.replace(/<html([^>]*)>/i, (_full, attrs) => {
    const cleaned = String(attrs || '').replace(/\s*class="[^"]*"/i, '')
    return `<html${cleaned} class="${vars.htmlClass}" style="--safe-area-top: ${safeAreaTop}px; --safe-area-bottom: ${safeAreaBottom}px; --safe-top: ${safeAreaTop}px; --safe-bottom: ${safeAreaBottom}px;">`
  })

  finalHtml = finalHtml.replace(
    '</head>',
    `<style id="xpense-safe-area-css">
      :root {
        --safe-area-top: ${safeAreaTop}px;
        --safe-area-bottom: ${safeAreaBottom}px;
        --safe-top: ${safeAreaTop}px;
        --safe-bottom: ${safeAreaBottom}px;
      }
      @keyframes xpEnterForward {
        from { opacity: 0.01; transform: translate3d(14px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes xpEnterBack {
        from { opacity: 0.01; transform: translate3d(-14px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes xpEnterTab {
        from { opacity: 0.01; transform: translate3d(0, 6px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      html:not([data-reduced-motion="true"]) main {
        animation: ${
          payload?.routeParams?._navDirection === 'back'
            ? 'xpEnterBack 200ms var(--motion-curve, cubic-bezier(0.2, 0, 0, 1)) both'
            : payload?.routeParams?._navDirection === 'forward'
              ? 'xpEnterForward 220ms var(--motion-curve, cubic-bezier(0.2, 0, 0, 1)) both'
              : 'xpEnterTab 180ms var(--motion-curve, cubic-bezier(0.2, 0, 0, 1)) both'
        };
      }
      html[data-reduced-motion="true"] main {
        animation: none !important;
      }
    </style><style id="xpense-theme-css">${themeCss}</style></head>`,
  )

  const themeLiveScript = `
    window.__applyXpenseTheme = function(update) {
      try {
        if (!update) return;
        var rootEl = document.documentElement;
        rootEl.classList.add('xp-theme-switching');
        if (typeof update.htmlClass === 'string') {
          rootEl.className = update.htmlClass + ' xp-theme-switching';
        }
        if (typeof update.themeCss === 'string') {
          var styleEl = document.getElementById('xpense-theme-css');
          if (styleEl) styleEl.textContent = update.themeCss;
        }
        if (window.__STITCH_MODALS_UPDATE__) {
          window.__STITCH_MODALS_UPDATE__(update);
        }
        if (window.__STITCH_DATA__) {
          if (update.resolvedAppearance) {
            window.__STITCH_DATA__.resolvedAppearance = update.resolvedAppearance;
          }
          if (update.tokens) {
            window.__STITCH_DATA__.themeTokens = update.tokens;
          }
        }
        if (typeof window.__onXpenseThemeApplied === 'function') {
          window.__onXpenseThemeApplied(update);
        }
        document.dispatchEvent(new CustomEvent('xpense:theme-changed', { detail: update }));
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            rootEl.classList.remove('xp-theme-switching');
          });
        });
      } catch (e) {}
    };

    // Adaptive Tooltip Timing + Disableable Help Hints
    (function() {
      var bubble = null;
      var showTimer = null;
      var hideTimer = null;
      var lastDismissTs = 0;

      function tooltipsDisabled() {
        try {
          if (window.__STITCH_DATA__ && window.__STITCH_DATA__.helpTooltipsDisabled === true) return true;
          return localStorage.getItem('xpense_tooltips_disabled') === 'true';
        } catch (e) { return false; }
      }

      window.__stitchSetTooltipsDisabled = function(disabled) {
        try { localStorage.setItem('xpense_tooltips_disabled', disabled ? 'true' : 'false'); } catch (e) {}
        if (disabled && bubble) {
          bubble.classList.remove('visible');
        }
      };

      function ensureBubble() {
        if (!bubble) {
          bubble = document.createElement('div');
          bubble.className = 'xp-tooltip-bubble';
          bubble.setAttribute('role', 'tooltip');
          document.body && document.body.appendChild(bubble);
        }
        return bubble;
      }

      function hideTooltip() {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        if (bubble && bubble.classList.contains('visible')) {
          bubble.classList.remove('visible');
          lastDismissTs = Date.now();
        }
      }

      function showTooltipFor(el) {
        if (tooltipsDisabled()) return;
        var text = el && el.getAttribute('data-xp-tooltip');
        if (!text) return;
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        var warmSession = Date.now() - lastDismissTs < 1200;
        var delay = warmSession ? 75 : 360;
        showTimer = setTimeout(function() {
          if (tooltipsDisabled()) return;
          var b = ensureBubble();
          b.textContent = text;
          b.style.left = '-9999px';
          b.style.top = '0px';
          b.classList.add('visible');
          var rect = el.getBoundingClientRect();
          var bRect = b.getBoundingClientRect();
          var left = Math.max(12, Math.min(window.innerWidth - bRect.width - 12, rect.left + (rect.width - bRect.width) / 2));
          var top = rect.top - bRect.height - 8;
          if (top < 12) top = rect.bottom + 8;
          b.style.left = left + 'px';
          b.style.top = top + 'px';
          hideTimer = setTimeout(hideTooltip, 4500);
        }, delay);
      }

      document.addEventListener('pointerenter', function(e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-xp-tooltip]') : null;
        if (el) showTooltipFor(el);
      }, true);
      document.addEventListener('pointerleave', function(e) {
        if (e.target && e.target.closest && e.target.closest('[data-xp-tooltip]')) hideTooltip();
      }, true);
      document.addEventListener('focusin', function(e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-xp-tooltip]') : null;
        if (el) showTooltipFor(el);
      });
      document.addEventListener('focusout', hideTooltip);
      document.addEventListener('scroll', hideTooltip, { passive: true });
    })();
  `

  const hapticScript = `
    document.addEventListener('touchstart', function(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.getAttribute('data-stitch-route') || target.getAttribute('data-stitch-event') || (target.classList && target.classList.contains('touch-manipulation'))) {
          var style = target.classList && target.classList.contains('bg-primary') ? 'heavy' : 'light';
          if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: style });
          break;
        }
        target = target.parentNode;
      }
    }, { passive: true });
  `

  // Transform top app bars (preserving custom collapsing #top-navbar on home dashboard)
  finalHtml = finalHtml.replace(
    /<header[^>]*backdrop-blur-(?:md|lg)[^>]*>/,
    (match) => {
      let updated = match
        .replace(/\bh-16\b/, '')
        .replace(/\bbg-white\/80\b/g, '')
        .replace(/\bdark:bg-slate-900\/80\b/g, '')
      if (!/\bid="/i.test(updated)) {
        updated = updated.replace('<header', '<header id="xpense-top-header"')
      }
      return updated.replace(
        'class="',
        'class="!pt-[var(--safe-area-top)] !h-[calc(4rem+var(--safe-area-top))] ',
      )
    },
  )

  const useBottomNav = route ? shouldRenderBottomNav(route) : /<nav\b/i.test(finalHtml)
  const bottomPad = useBottomNav ? '7.5rem' : '1.5rem'

  // Transform body safe-area spacing
  finalHtml = finalHtml.replace(/<body[^>]*>/, (match) => {
    let updated = match
    if (updated.includes('pt-16')) {
      updated = updated.replace(/\bpt-16\b/, '')
      updated = updated.replace('class="', 'class="!pt-[calc(4rem+var(--safe-area-top))] ')
    }
    if (updated.includes('pt-20')) {
      updated = updated.replace(/\bpt-20\b/, '')
      updated = updated.replace('class="', 'class="!pt-[calc(5rem+var(--safe-area-top))] ')
    }
    if (updated.includes('pt-[88px]')) {
      updated = updated.replace(/pt-\[88px\]/, '')
      updated = updated.replace('class="', 'class="!pt-[calc(5.5rem+var(--safe-area-top))] ')
    }
    if (updated.includes('pb-24')) {
      updated = updated.replace(/\bpb-24\b/, '')
      updated = updated.replace('class="', `class="!pb-[calc(${bottomPad}+var(--safe-area-bottom))] `)
    }
    if (updated.includes('pb-28')) {
      updated = updated.replace(/\bpb-28\b/, '')
      updated = updated.replace('class="', `class="!pb-[calc(${bottomPad}+var(--safe-area-bottom))] `)
    }
    if (updated.includes('pb-[80px]')) {
      updated = updated.replace(/pb-\[80px\]/, '')
      updated = updated.replace('class="', `class="!pb-[calc(${bottomPad}+var(--safe-area-bottom))] `)
    }
    return updated
  })

  const navCssBlock = useBottomNav ? `<style id="xpense-nav-css">${getBottomNavCss()}</style>` : ''
  if (navCssBlock) {
    finalHtml = finalHtml.replace('</head>', `${navCssBlock}</head>`)
  }

  // Strip template-hardcoded bottom <nav> elements and inject our unified curved-cradle interactive dock
  finalHtml = finalHtml.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')

  const navHtml = useBottomNav ? getBottomNavHtml(route || 'dashboard') : ''
  const navScript = useBottomNav ? getBottomNavScript() : ''

  return finalHtml.replace(
    '</body>',
    `${navHtml}<script>${uiModalsScript}\n${themeLiveScript}\n(function(){${dataScript}${script}${hapticScript}${navScript}try{window.__stitchEnhanceSelects&&window.__stitchEnhanceSelects();}catch(e){}})();</script></body>`,
  )
}
