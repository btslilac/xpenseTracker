import {
  buildThemeTokens,
  normalizeAppearance,
  ResolvedAppearance,
  resolveAppearance,
  ThemeTokenSet,
} from '../lib/appearance'
import { ColorSchemePreference, VisualStyle } from '../types'

export type ThemeBridgeVariables = {
  visualStyle: 'liquid-glass' | 'material-expressive'
  colorScheme: 'light' | 'dark'
  pureBlack: boolean
  colorTheme: string
  effectivePaletteId: string
  reducedMotion: boolean
  htmlClass: string
  tokens: ThemeTokenSet
}

export function getThemeBridgeVariables(
  resolved: ResolvedAppearance,
): ThemeBridgeVariables {
  const tokens = buildThemeTokens(resolved)
  const classes = [
    resolved.resolvedColorScheme,
    `theme-${resolved.style}`,
    // Backward compatibility alias for any CSS checking theme-material
    resolved.style === 'material-expressive' ? 'theme-material' : '',
    `palette-${resolved.colorTheme}`,
    resolved.pureBlackActive ? 'pure-black' : '',
    resolved.reducedMotion ? 'reduced-motion' : '',
  ].filter(Boolean)

  return {
    visualStyle: resolved.style,
    colorScheme: resolved.resolvedColorScheme,
    pureBlack: resolved.pureBlackActive,
    colorTheme: resolved.colorTheme,
    effectivePaletteId: resolved.effectivePaletteId,
    reducedMotion: resolved.reducedMotion,
    htmlClass: classes.join(' '),
    tokens,
  }
}

export function generateThemeCss(
  styleOrResolved: VisualStyle | ResolvedAppearance = 'liquid-glass',
  colorScheme: ColorSchemePreference = 'light',
  reducedMotion = false,
): string {
  const resolved: ResolvedAppearance =
    typeof styleOrResolved === 'string'
      ? resolveAppearance(
          normalizeAppearance({
            style: styleOrResolved,
            colorScheme,
            reducedMotion,
          }),
          colorScheme === 'dark' ? 'dark' : 'light',
        )
      : styleOrResolved

  const t = buildThemeTokens(resolved)
  const isDark = t.scheme === 'dark'
  const isGlass = t.visualStyle === 'liquid-glass'
  const isPureBlack = t.pureBlack
  const rm = resolved.reducedMotion

  const blurStandard = isGlass ? 'blur(20px) saturate(165%)' : 'none'
  const blurHeavy = isGlass ? 'blur(28px) saturate(180%)' : 'none'
  const cardRadius = isGlass ? '22px' : '24px'
  const modalRadius = isGlass ? '26px' : '28px'
  const motionDuration = rm ? '0.01ms' : '0.22s'
  const expressCurve = rm ? 'linear' : 'cubic-bezier(0.2, 0.9, 0.3, 1.15)'

  const cardShadow = isGlass
    ? isDark
      ? isPureBlack
        ? '0 10px 30px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.14)'
        : '0 10px 32px -8px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
      : '0 10px 30px -8px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.85)'
    : isDark
      ? isPureBlack
        ? '0 0 0 1px rgba(255, 255, 255, 0.08)'
        : '0 2px 8px rgba(0, 0, 0, 0.24)'
      : '0 1px 3px rgba(15, 23, 42, 0.04)'

  const elevatedShadow = isGlass
    ? isDark
      ? '0 22px 48px -12px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
      : '0 22px 48px -12px rgba(15, 23, 42, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.90)'
    : isDark
      ? '0 16px 36px rgba(0, 0, 0, 0.55), 0 0 0 1px ' + t.outlineVariant
      : '0 14px 32px rgba(15, 23, 42, 0.14)'

  const bgAmbient = isGlass
    ? isPureBlack
      ? 'radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.035), transparent 45%), ' + t.bgCanvas
      : isDark
        ? `radial-gradient(circle at 15% 6%, color-mix(in srgb, ${t.primary} 12%, transparent), transparent 48%), radial-gradient(circle at 88% 18%, color-mix(in srgb, ${t.tertiary} 10%, transparent), transparent 44%), ${t.bgCanvas}`
        : `radial-gradient(circle at 14% 6%, color-mix(in srgb, ${t.primary} 9%, transparent), transparent 50%), radial-gradient(circle at 86% 14%, color-mix(in srgb, ${t.secondary} 8%, transparent), transparent 46%), ${t.bgCanvas}`
    : t.bgCanvas

  return `
:root {
  color-scheme: ${t.scheme};
  --bg-canvas: ${t.bgCanvas};
  --surface-primary: ${t.surfacePrimary};
  --surface-container-lowest: ${t.surfaceContainerLowest};
  --surface-container-low: ${t.surfaceContainerLow};
  --surface-container: ${t.surfaceContainer};
  --surface-container-high: ${t.surfaceContainerHigh};
  --surface-container-highest: ${t.surfaceContainerHighest};
  --surface-card: ${t.surfaceCard};
  --surface-card-strong: ${t.surfaceCardStrong};
  --surface-elevated: ${t.surfaceElevated};
  --header-bg: ${t.headerBg};
  --nav-bg: ${t.navBg};
  --nav-border: ${t.navBorder};
  --nav-shadow: ${t.navShadow};
  --text-primary: ${t.textPrimary};
  --text-secondary: ${t.textSecondary};
  --text-muted: ${t.textMuted};
  --outline: ${t.outline};
  --outline-variant: ${t.outlineVariant};
  --border-subtle: ${t.borderSubtle};
  --border-highlight: ${t.borderHighlight};
  --action-primary: ${t.primary};
  --action-primary-text: ${t.onPrimary};
  --action-primary-hover: ${t.primaryHover};
  --primary-container: ${t.primaryContainer};
  --on-primary-container: ${t.onPrimaryContainer};
  --secondary: ${t.secondary};
  --on-secondary: ${t.onSecondary};
  --secondary-container: ${t.secondaryContainer};
  --on-secondary-container: ${t.onSecondaryContainer};
  --tertiary: ${t.tertiary};
  --on-tertiary: ${t.onTertiary};
  --tertiary-container: ${t.tertiaryContainer};
  --on-tertiary-container: ${t.onTertiaryContainer};
  --hero-gradient: ${t.heroGradient};
  --hero-text: ${t.heroText};
  --hero-subtext: ${t.heroSubtext};
  --fab-gradient: ${t.fabGradient};
  --fab-text: ${t.fabText};
  --nav-active-bg: ${t.navActiveBg};
  --nav-active-text: ${t.navActiveText};
  --focus-ring: ${t.focusRing};
  --selection-bg: ${t.selectionBg};
  --disabled-bg: ${t.disabledBg};
  --disabled-text: ${t.disabledText};
  --switch-track-off: ${t.switchTrackOff};
  --switch-track-on: ${t.switchTrackOn};
  --switch-thumb-off: ${t.switchThumbOff};
  --switch-thumb-on: ${t.switchThumbOn};
  --scrim-bg: ${t.scrim};
  --fin-income: ${t.finIncome};
  --fin-income-bg: ${t.finIncomeBg};
  --fin-expense: ${t.finExpense};
  --fin-expense-bg: ${t.finExpenseBg};
  --fin-warning: ${t.finWarning};
  --fin-warning-bg: ${t.finWarningBg};
  --fin-info: ${t.finInfo};
  --fin-info-bg: ${t.finInfoBg};
  --glass-blur: ${blurStandard};
  --glass-blur-heavy: ${blurHeavy};
  --card-radius: ${cardRadius};
  --modal-radius: ${modalRadius};
  --card-shadow: ${cardShadow};
  --elevated-shadow: ${elevatedShadow};
  --motion-duration: ${motionDuration};
  --motion-curve: ${expressCurve};
}

html, body {
  background: ${bgAmbient} !important;
  background-color: var(--bg-canvas) !important;
  color: var(--text-primary) !important;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
  transition: background-color var(--motion-duration) ease, color var(--motion-duration) ease;
}

/* Suppress all color/surface transitions while switching themes so colors never flicker mid-frame */
html.xp-theme-switching *,
html.xp-theme-switching *::before,
html.xp-theme-switching *::after {
  transition: none !important;
}

::selection {
  background-color: var(--selection-bg);
  color: var(--text-primary);
}

/* =========================================================
   SEMANTIC SURFACE & TYPOGRAPHY OVERRIDES FOR TEMPLATES
   Overrides static hex tokens from per-template tailwind-config
   while preserving financial semantic colors.
   ========================================================= */
.bg-background,
.bg-surface,
.bg-surface-bright {
  background-color: var(--bg-canvas) !important;
  color: var(--text-primary);
}

.bg-surface-dim {
  background-color: var(--surface-container-high) !important;
}

.bg-surface-container-lowest {
  background-color: var(--surface-card) !important;
  border-color: var(--border-subtle) !important;
  color: var(--text-primary);
}

.bg-surface-container-low {
  background-color: var(--surface-container-low) !important;
  color: var(--text-primary);
}

.bg-surface-container {
  background-color: var(--surface-container) !important;
  color: var(--text-primary);
}

.bg-surface-container-high {
  background-color: var(--surface-container-high) !important;
  color: var(--text-primary);
}

.bg-surface-container-highest,
.bg-surface-variant {
  background-color: var(--surface-container-highest) !important;
  color: var(--text-primary);
}

.text-on-background,
.text-on-surface {
  color: var(--text-primary) !important;
}

.text-on-surface-variant,
.text-outline {
  color: var(--text-secondary) !important;
}

.border-outline-variant,
.border-surface-container {
  border-color: var(--outline-variant) !important;
}

.bg-primary {
  background-color: var(--action-primary) !important;
  color: var(--action-primary-text) !important;
}
.bg-primary.text-white,
.bg-primary .text-white,
.bg-primary .text-on-primary {
  color: var(--action-primary-text) !important;
}

.text-primary {
  color: var(--action-primary) !important;
}

.border-primary {
  border-color: var(--action-primary) !important;
}

.bg-primary-container,
.bg-primary-fixed {
  background-color: var(--primary-container) !important;
  color: var(--on-primary-container) !important;
}

.text-on-primary-container,
.text-on-primary-fixed,
.text-on-primary-fixed-variant {
  color: var(--on-primary-container) !important;
}

/* Indigo accent migration to active palette primary */
.bg-indigo-600,
.bg-indigo-700 {
  background-color: var(--action-primary) !important;
  color: var(--action-primary-text) !important;
}
.bg-indigo-600.text-white,
.bg-indigo-700.text-white {
  color: var(--action-primary-text) !important;
}
.text-indigo-600,
.text-indigo-700,
.dark .text-indigo-400,
.dark .text-indigo-300 {
  color: var(--action-primary) !important;
}
.bg-indigo-50,
.dark .bg-indigo-900\\/30,
.dark .bg-indigo-950\\/40 {
  background-color: var(--primary-container) !important;
}
.text-indigo-900,
.dark .text-indigo-100 {
  color: var(--on-primary-container) !important;
}
.border-indigo-200,
.border-indigo-500,
.border-indigo-600,
.dark .border-indigo-800\\/60 {
  border-color: ${isDark ? 'color-mix(in srgb, var(--action-primary) 42%, transparent)' : 'color-mix(in srgb, var(--action-primary) 30%, transparent)'} !important;
}

/* White card fallback harmonization in Dark / Pure Black / Material modes */
${isDark || !isGlass ? `
.theme-card,
.surface-card,
section.bg-white,
div.bg-white.rounded-2xl,
div.bg-white.rounded-3xl,
div.bg-white.rounded-xl,
a.bg-white.rounded-2xl,
button.bg-white.rounded-2xl,
.dark .bg-slate-800\\/80,
.dark .bg-slate-800\\/90,
.dark .bg-slate-800 {
  background-color: var(--surface-card) !important;
  border-color: var(--border-subtle) !important;
  color: var(--text-primary);
}
.dark .bg-slate-900,
.dark .bg-slate-950 {
  background-color: var(--bg-canvas) !important;
}
.dark .bg-slate-900\\/80,
.dark .bg-slate-900\\/90 {
  background-color: var(--surface-card-strong) !important;
}
.dark .border-slate-700,
.dark .border-slate-800,
.dark .border-slate-200 {
  border-color: var(--outline-variant) !important;
}
` : `
.theme-card {
  background-color: var(--surface-card) !important;
  border-color: var(--border-subtle) !important;
}
`}

${isDark ? `
.text-slate-900,
.text-gray-900,
.text-slate-800 {
  color: var(--text-primary) !important;
}
.text-slate-500,
.text-gray-500,
.text-slate-600 {
  color: var(--text-secondary) !important;
}
.text-slate-400 {
  color: var(--text-muted) !important;
}
` : ''}

/* Card & Glass Surface Treatments */
.theme-card,
.glass-surface,
.glass-card {
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: background-color var(--motion-duration) ease, border-color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve), box-shadow var(--motion-duration) ease;
}

${isGlass ? `
.theme-card,
.glass-surface,
.glass-card,
.bg-surface-container-lowest.rounded-2xl,
.bg-surface-container-lowest.rounded-3xl,
.bg-surface-container-lowest.rounded-xl {
  background-color: var(--surface-card) !important;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-subtle) !important;
}
` : `
.theme-card,
.glass-surface,
.glass-card {
  background-color: var(--surface-card) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: ${isPureBlack ? '1px solid var(--outline-variant)' : '1px solid transparent'} !important;
}
`}

/* Workspace Switcher Pill */
.workspace-switcher {
  background-color: ${isGlass ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)') : 'var(--surface-container-high)'};
  border: 1px solid ${isGlass ? 'var(--border-subtle)' : 'var(--outline-variant)'};
  border-radius: 9999px;
  backdrop-filter: ${isGlass ? 'blur(12px)' : 'none'};
  -webkit-backdrop-filter: ${isGlass ? 'blur(12px)' : 'none'};
}
.workspace-tab-active {
  background-color: ${isGlass ? (isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.92)') : 'var(--primary-container)'};
  color: ${isGlass ? 'var(--action-primary)' : 'var(--on-primary-container)'};
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.workspace-tab-inactive {
  color: var(--text-secondary);
}

/* =========================================================
   MATERIAL 3 EXPRESSIVE GROUPED LISTS & ICON CONTAINERS
   Adapts authentically between Liquid Glass & M3 Expressive
   ========================================================= */
.m3-group-list {
  display: flex;
  flex-direction: column;
  gap: ${isGlass ? '0px' : '3px'};
  ${isGlass ? `
  background-color: var(--surface-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  ` : `
  background: transparent;
  `}
}

.m3-group-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 15px 16px;
  min-height: 60px;
  text-align: left;
  transition: background-color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve), border-color var(--motion-duration) ease;
  ${isGlass ? `
  background-color: transparent;
  border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.07)'};
  ` : `
  background-color: var(--surface-container-low);
  border: ${isPureBlack ? '1px solid var(--outline-variant)' : '1px solid transparent'};
  border-radius: 8px;
  `}
}

${isGlass ? `
.m3-group-row:last-child {
  border-bottom: none;
}
` : `
.m3-group-row:first-child {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}
.m3-group-row:last-child {
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
.m3-group-row:only-child {
  border-radius: 24px;
}
`}

button.m3-group-row:active,
a.m3-group-row:active,
[role="button"].m3-group-row:active {
  transform: ${rm ? 'none' : 'scale(0.985)'};
  background-color: ${isGlass ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)') : 'var(--surface-container-high)'};
}

.m3-group-row.is-disabled {
  opacity: 0.52;
}

.m3-icon-tile {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--motion-duration) var(--motion-curve), background-color var(--motion-duration) ease;
  ${isGlass ? `
  border-radius: 14px;
  background-color: color-mix(in srgb, var(--action-primary) ${isDark ? '22%' : '13%'}, transparent);
  color: var(--action-primary);
  border: 1px solid color-mix(in srgb, var(--action-primary) 26%, transparent);
  ` : `
  border-radius: 14px;
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  `}
}
.m3-icon-tile.tile-secondary {
  ${isGlass ? `
  background-color: color-mix(in srgb, var(--secondary) ${isDark ? '22%' : '13%'}, transparent);
  color: var(--secondary);
  border-color: color-mix(in srgb, var(--secondary) 26%, transparent);
  ` : `
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
  `}
}
.m3-icon-tile.tile-tertiary {
  ${isGlass ? `
  background-color: color-mix(in srgb, var(--tertiary) ${isDark ? '22%' : '13%'}, transparent);
  color: var(--tertiary);
  border-color: color-mix(in srgb, var(--tertiary) 26%, transparent);
  ` : `
  background-color: var(--tertiary-container);
  color: var(--on-tertiary-container);
  `}
}
.m3-icon-tile.tile-income {
  background-color: var(--fin-income-bg);
  color: var(--fin-income);
  ${isGlass ? 'border-color: color-mix(in srgb, var(--fin-income) 28%, transparent);' : ''}
}
.m3-icon-tile.tile-expense {
  background-color: var(--fin-expense-bg);
  color: var(--fin-expense);
  ${isGlass ? 'border-color: color-mix(in srgb, var(--fin-expense) 28%, transparent);' : ''}
}
.m3-icon-tile.tile-warning {
  background-color: var(--fin-warning-bg);
  color: var(--fin-warning);
  ${isGlass ? 'border-color: color-mix(in srgb, var(--fin-warning) 28%, transparent);' : ''}
}
.m3-icon-tile.tile-neutral {
  background-color: var(--surface-container-high);
  color: var(--text-secondary);
}

/* Expressive Pill Switch */
.xp-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 52px;
  height: 32px;
  border-radius: 9999px;
  padding: 0;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color var(--motion-duration) ease, border-color var(--motion-duration) ease, opacity var(--motion-duration) ease;
  background-color: var(--switch-track-off);
  border: 2px solid ${isGlass ? 'transparent' : 'var(--outline)'};
}
.xp-switch[aria-checked="true"] {
  background-color: var(--switch-track-on);
  border-color: var(--switch-track-on);
}
.xp-switch[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}
.xp-switch-thumb {
  position: relative;
  width: 18px;
  height: 18px;
  margin-left: 5px;
  border-radius: 9999px;
  background-color: var(--switch-thumb-off);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--switch-track-on);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform var(--motion-duration) var(--motion-curve), width var(--motion-duration) var(--motion-curve), height var(--motion-duration) var(--motion-curve), background-color var(--motion-duration) ease;
}
.xp-switch[aria-checked="true"] .xp-switch-thumb {
  width: 24px;
  height: 24px;
  background-color: var(--switch-thumb-on);
  transform: translateX(18px);
}

/* Primary Action / Hero Surfaces */
.xp-hero-surface {
  background: var(--hero-gradient) !important;
  color: var(--hero-text) !important;
}
.xp-fab-gradient {
  background: var(--fab-gradient) !important;
  color: var(--fab-text) !important;
}

/* Form Inputs Contrast & Focus */
input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
select,
textarea {
  color: var(--text-primary);
  caret-color: var(--action-primary);
}
${isDark ? `
input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
select,
textarea {
  background-color: var(--surface-container-high);
  border-color: var(--outline-variant);
}
input::placeholder,
textarea::placeholder {
  color: var(--text-muted);
}
` : ''}
input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-ring);
}
input[type="range"] {
  accent-color: var(--action-primary);
}

/* Semantic Financial Helpers */
.fin-income-text { color: var(--fin-income) !important; }
.fin-expense-text { color: var(--fin-expense) !important; }
.fin-warning-text { color: var(--fin-warning) !important; }
.fin-info-text { color: var(--fin-info) !important; }

/* Navigation Bar & Header Chrome */
#xpense-top-header {
  background-color: var(--header-bg) !important;
  backdrop-filter: ${isGlass ? 'var(--glass-blur)' : 'none'} !important;
  -webkit-backdrop-filter: ${isGlass ? 'var(--glass-blur)' : 'none'} !important;
  border-bottom: 1px solid ${isGlass ? 'var(--border-subtle)' : 'var(--outline-variant)'};
  transition: background-color var(--motion-duration) ease, border-color var(--motion-duration) ease;
}

#xpense-bottom-nav-wrap {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

#xpense-bottom-nav {
  margin-left: auto !important;
  margin-right: auto !important;
  left: 0 !important;
  right: 0 !important;
  justify-content: center !important;
  justify-items: center !important;
  border-radius: ${isGlass ? '28px' : '0px'} !important;
  transition: background-color var(--motion-duration) ease, border-color var(--motion-duration) ease, border-radius var(--motion-duration) ease;
}

${!isGlass ? `
@media (min-width: 768px) {
  #xpense-bottom-nav {
    border-top: 1px solid var(--outline-variant) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}
` : `
@media (min-width: 768px) {
  #xpense-bottom-nav {
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }
}
`}

#xpense-bottom-nav .nav-item,
#xpense-bottom-nav > a:not([class*="rounded-full"]):not([class*="bg-gradient"]) {
  border-radius: 9999px !important;
  padding: 6px 14px;
  color: var(--text-muted);
  transition: background-color var(--motion-duration) ease, color var(--motion-duration) ease, transform var(--motion-duration) var(--motion-curve);
}
#xpense-bottom-nav .nav-item.nav-item-active,
#xpense-bottom-nav > a[class*="bg-indigo-50"],
#xpense-bottom-nav > a[class*="text-primary"],
#xpense-bottom-nav > a.nav-item-active {
  background-color: var(--nav-active-bg) !important;
  color: var(--nav-active-text) !important;
  font-weight: 700;
}
#xpense-bottom-nav .nav-item.nav-item-active .material-symbols-outlined,
#xpense-bottom-nav > a[class*="bg-indigo-50"] .material-symbols-outlined,
#xpense-bottom-nav > a.nav-item-active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

/* Tablet & Desktop Responsive Enhancements */
@media (min-width: 600px) {
  main {
    max-width: 920px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  header {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  .responsive-grid-2 {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
  .responsive-grid-3 {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
}

@media (min-width: 960px) {
  main {
    max-width: 1120px !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }
  .settings-responsive-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
    gap: 24px !important;
    align-items: start !important;
  }
}

/* Minimum Accessible Touch Targets (44-48dp logical target sizing) */
button, a, [role="button"], input[type="submit"], input[type="button"], select {
  touch-action: manipulation;
}
a[href], button:not(.no-min-touch):not(.xp-switch), [role="button"]:not(.xp-switch) {
  min-height: 44px;
  min-width: 44px;
}

/* Phase 2/3 Motion Engineering System — transform & opacity only, unified squash-and-stretch (0.97) */
@keyframes xpPasswordShake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  16% { transform: translate3d(-7px, 0, 0); }
  34% { transform: translate3d(7px, 0, 0); }
  52% { transform: translate3d(-5px, 0, 0); }
  70% { transform: translate3d(4px, 0, 0); }
  86% { transform: translate3d(-2px, 0, 0); }
}

@keyframes xpStepEnterNext {
  from { opacity: 0.01; transform: translate3d(18px, 0, 0) scale(0.985); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes xpStepEnterPrev {
  from { opacity: 0.01; transform: translate3d(-18px, 0, 0) scale(0.985); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes xpSurfacePop {
  from { opacity: 0.01; transform: translate3d(0, 6px, 0) scale(0.97); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

.xp-shake {
  animation: ${rm ? 'none' : 'xpPasswordShake 340ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both'};
  will-change: transform;
}

.xp-input-error {
  border-color: var(--fin-expense, #ef4444) !important;
  box-shadow: 0 0 0 3px var(--fin-expense-bg, rgba(239, 68, 68, 0.16)) !important;
}

.xp-step-enter-next {
  animation: ${rm ? 'none' : 'xpStepEnterNext 200ms var(--motion-curve) both'};
}

.xp-step-enter-prev {
  animation: ${rm ? 'none' : 'xpStepEnterPrev 200ms var(--motion-curve) both'};
}

.xp-surface-enter {
  animation: ${rm ? 'none' : 'xpSurfacePop 180ms var(--motion-curve) both'};
}

/* Smooth CSS-Grid Accordion (pose-to-pose transition without abrupt snap) */
.xp-accordion-body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: ${rm ? 'none' : 'grid-template-rows 200ms var(--motion-curve), opacity 180ms ease'};
}
.xp-accordion-body > .xp-accordion-inner {
  overflow: hidden;
  min-height: 0;
}
.xp-accordion-item[data-open="true"] > .xp-accordion-body {
  grid-template-rows: 1fr;
  opacity: 1;
}

/* Elastic Horizontal Carousel */
.xp-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  gap: 12px;
}
.xp-carousel::-webkit-scrollbar { display: none; }
.xp-carousel > * { scroll-snap-align: start; flex-shrink: 0; }

/* Adaptive Tooltip */
.xp-tooltip-bubble {
  position: fixed;
  z-index: 100030;
  max-width: 240px;
  padding: 8px 11px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  background: var(--surface-card-strong, #0f172a);
  color: var(--text-primary, #f8fafc);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--elevated-shadow);
  backdrop-filter: var(--glass-blur);
  pointer-events: none;
  opacity: 0;
  transform: translate3d(0, 4px, 0) scale(0.97);
  transition: ${rm ? 'none' : 'opacity 140ms ease, transform 160ms var(--motion-curve)'};
}
.xp-tooltip-bubble.visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

/* Reduced Motion Accessibility Override */
${rm ? `
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
` : `
button:not(.xp-switch):not(.no-press-scale),
a[href],
[role="button"]:not(.xp-switch),
.active\\:scale-95,
.active\\:scale-98,
.active\\:scale-\\[0\\.98\\] {
  transition: transform 140ms var(--motion-curve), opacity 140ms ease, background-color 140ms ease, border-color 140ms ease;
}
button:not(.xp-switch):not(.no-press-scale):active,
a[href]:active,
[role="button"]:not(.xp-switch):active,
.active\\:scale-95:active,
.active\\:scale-98:active,
.active\\:scale-\\[0\\.98\\]:active {
  transform: scale(0.97) !important;
}
`}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`
}
