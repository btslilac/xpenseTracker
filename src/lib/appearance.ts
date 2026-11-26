import {
  AppearanceSettings,
  ColorSchemePreference,
  ColorThemeId,
  ResolvedVisualStyle,
} from '../types'
import { DynamicColorPayload, NativeDynamicMonetColors } from '../native/dynamicColor'

export type ResolvedAppearance = {
  style: ResolvedVisualStyle
  colorScheme: ColorSchemePreference
  resolvedColorScheme: 'light' | 'dark'
  pureBlackPreference: boolean
  pureBlackActive: boolean
  colorTheme: ColorThemeId
  reducedMotion: boolean
  updatedAt?: string
  dynamicWallpaperSupported: boolean
  dynamicWallpaperReason?: string
  effectivePaletteId: ColorThemeId
  monetColors: NativeDynamicMonetColors | null
}

export type ThemeTokenSet = {
  scheme: 'light' | 'dark'
  pureBlack: boolean
  visualStyle: ResolvedVisualStyle
  colorTheme: ColorThemeId
  effectivePaletteId: ColorThemeId
  bgCanvas: string
  surfacePrimary: string
  surfaceContainerLowest: string
  surfaceContainerLow: string
  surfaceContainer: string
  surfaceContainerHigh: string
  surfaceContainerHighest: string
  surfaceCard: string
  surfaceCardStrong: string
  surfaceElevated: string
  headerBg: string
  navBg: string
  navBorder: string
  navShadow: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  outline: string
  outlineVariant: string
  borderSubtle: string
  borderHighlight: string
  primary: string
  onPrimary: string
  primaryHover: string
  primaryContainer: string
  onPrimaryContainer: string
  secondary: string
  onSecondary: string
  secondaryContainer: string
  onSecondaryContainer: string
  tertiary: string
  onTertiary: string
  tertiaryContainer: string
  onTertiaryContainer: string
  heroGradient: string
  heroText: string
  heroSubtext: string
  fabGradient: string
  fabText: string
  navActiveBg: string
  navActiveText: string
  focusRing: string
  selectionBg: string
  disabledBg: string
  disabledText: string
  switchTrackOff: string
  switchTrackOn: string
  switchThumbOff: string
  switchThumbOn: string
  scrim: string
  finIncome: string
  finIncomeBg: string
  finExpense: string
  finExpenseBg: string
  finWarning: string
  finWarningBg: string
  finInfo: string
  finInfoBg: string
  swatchPrimary: string
  swatchSecondary: string
  swatchTertiary: string
}

export type NormalizedAppearanceSettings = {
  style: ResolvedVisualStyle
  colorScheme: ColorSchemePreference
  pureBlack: boolean
  colorTheme: ColorThemeId
  reducedMotion: boolean
  updatedAt?: string
}

export const DEFAULT_APPEARANCE: NormalizedAppearanceSettings = {
  style: 'liquid-glass',
  colorScheme: 'system',
  pureBlack: false,
  colorTheme: 'concept',
  reducedMotion: false,
}

export function normalizeVisualStyle(raw?: string | null): ResolvedVisualStyle {
  if (raw === 'material' || raw === 'material-expressive') {
    return 'material-expressive'
  }
  return 'liquid-glass'
}

export function normalizeColorScheme(raw?: string | null): ColorSchemePreference {
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw
  }
  return 'system'
}

export function normalizeColorTheme(raw?: string | null): ColorThemeId {
  if (raw === 'wallpaper' || raw === 'concept' || raw === 'violet' || raw === 'coral') {
    return raw
  }
  return 'concept'
}

export function normalizeAppearance(
  raw?: Partial<AppearanceSettings> | null,
): NormalizedAppearanceSettings {
  return {
    style: normalizeVisualStyle(raw?.style),
    colorScheme: normalizeColorScheme(raw?.colorScheme),
    pureBlack: Boolean(raw?.pureBlack),
    colorTheme: normalizeColorTheme(raw?.colorTheme),
    reducedMotion: Boolean(raw?.reducedMotion),
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : undefined,
  }
}

export function mergeAppearanceSafely(
  local?: Partial<AppearanceSettings> | null,
  remote?: Partial<AppearanceSettings> | null,
): NormalizedAppearanceSettings | undefined {
  if (!local && !remote) return undefined
  if (!local) return normalizeAppearance(remote)
  if (!remote) return normalizeAppearance(local)

  const localTs = local.updatedAt ? Date.parse(local.updatedAt) : 0
  const remoteTs = remote.updatedAt ? Date.parse(remote.updatedAt) : 0

  if (localTs > 0 && remoteTs > 0) {
    return localTs >= remoteTs
      ? normalizeAppearance({ ...remote, ...local })
      : normalizeAppearance({ ...local, ...remote })
  }
  if (localTs > 0 && remoteTs === 0) {
    return normalizeAppearance({ ...remote, ...local })
  }
  return normalizeAppearance({ ...local, ...remote })
}

type StaticPaletteSeed = {
  id: Exclude<ColorThemeId, 'wallpaper'>
  label: string
  description: string
  swatchPrimary: string
  swatchSecondary: string
  swatchTertiary: string
  light: {
    primary: string
    onPrimary: string
    primaryHover: string
    primaryContainer: string
    onPrimaryContainer: string
    secondary: string
    onSecondary: string
    secondaryContainer: string
    onSecondaryContainer: string
    tertiary: string
    onTertiary: string
    tertiaryContainer: string
    onTertiaryContainer: string
    bgCanvas: string
    surfacePrimary: string
    surfaceContainerLowest: string
    surfaceContainerLow: string
    surfaceContainer: string
    surfaceContainerHigh: string
    surfaceContainerHighest: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    outline: string
    outlineVariant: string
    heroGradient: string
    fabGradient: string
  }
  dark: {
    primary: string
    onPrimary: string
    primaryHover: string
    primaryContainer: string
    onPrimaryContainer: string
    secondary: string
    onSecondary: string
    secondaryContainer: string
    onSecondaryContainer: string
    tertiary: string
    onTertiary: string
    tertiaryContainer: string
    onTertiaryContainer: string
    bgCanvas: string
    surfacePrimary: string
    surfaceContainerLowest: string
    surfaceContainerLow: string
    surfaceContainer: string
    surfaceContainerHigh: string
    surfaceContainerHighest: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    outline: string
    outlineVariant: string
    heroGradient: string
    fabGradient: string
  }
}

export const STATIC_PALETTES: Record<Exclude<ColorThemeId, 'wallpaper'>, StaticPaletteSeed> = {
  concept: {
    id: 'concept',
    label: 'Concept',
    description: 'Clean cobalt-slate fintech palette',
    swatchPrimary: '#2563eb',
    swatchSecondary: '#0ea5e9',
    swatchTertiary: '#4f46e5',
    light: {
      primary: '#1d4ed8',
      onPrimary: '#ffffff',
      primaryHover: '#1e40af',
      primaryContainer: '#dbeafe',
      onPrimaryContainer: '#0f2c67',
      secondary: '#0369a1',
      onSecondary: '#ffffff',
      secondaryContainer: '#e0f2fe',
      onSecondaryContainer: '#0c4a6e',
      tertiary: '#4338ca',
      onTertiary: '#ffffff',
      tertiaryContainer: '#e0e7ff',
      onTertiaryContainer: '#1e1b4b',
      bgCanvas: '#f4f7fc',
      surfacePrimary: '#f7f9fd',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#eff3fa',
      surfaceContainer: '#e7edf7',
      surfaceContainerHigh: '#dde5f2',
      surfaceContainerHighest: '#d2dceb',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      outline: '#6f7c91',
      outlineVariant: '#cbd5e1',
      heroGradient: 'linear-gradient(135deg, #0b1644 0%, #1d4ed8 55%, #0284c7 100%)',
      fabGradient: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
    },
    dark: {
      primary: '#93c5fd',
      onPrimary: '#082659',
      primaryHover: '#bfdbfe',
      primaryContainer: '#1e3a8a',
      onPrimaryContainer: '#dbeafe',
      secondary: '#7dd3fc',
      onSecondary: '#082f49',
      secondaryContainer: '#0c4a6e',
      onSecondaryContainer: '#e0f2fe',
      tertiary: '#a5b4fc',
      onTertiary: '#1e1b4b',
      tertiaryContainer: '#312e81',
      onTertiaryContainer: '#e0e7ff',
      bgCanvas: '#0e131b',
      surfacePrimary: '#111722',
      surfaceContainerLowest: '#090d14',
      surfaceContainerLow: '#161d29',
      surfaceContainer: '#1c2432',
      surfaceContainerHigh: '#242e3f',
      surfaceContainerHighest: '#2d394d',
      textPrimary: '#f1f5f9',
      textSecondary: '#b2bfd3',
      textMuted: '#7f8da3',
      outline: '#7c8ba1',
      outlineVariant: '#2f3a4b',
      heroGradient: 'linear-gradient(135deg, #0b132b 0%, #1d3a78 58%, #0c4a6e 100%)',
      fabGradient: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    description: 'Expressive amethyst & lavender tones',
    swatchPrimary: '#7c3aed',
    swatchSecondary: '#a855f7',
    swatchTertiary: '#c084fc',
    light: {
      primary: '#6750a4',
      onPrimary: '#ffffff',
      primaryHover: '#533b94',
      primaryContainer: '#eaddff',
      onPrimaryContainer: '#21005d',
      secondary: '#625b71',
      onSecondary: '#ffffff',
      secondaryContainer: '#e8def8',
      onSecondaryContainer: '#1d192b',
      tertiary: '#7d5260',
      onTertiary: '#ffffff',
      tertiaryContainer: '#ffd8e4',
      onTertiaryContainer: '#31111d',
      bgCanvas: '#f8f5fc',
      surfacePrimary: '#fbf8ff',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#f4effa',
      surfaceContainer: '#ede7f5',
      surfaceContainerHigh: '#e6ddf0',
      surfaceContainerHighest: '#ddd3ea',
      textPrimary: '#1c1824',
      textSecondary: '#4a4358',
      textMuted: '#6d657c',
      outline: '#7a7288',
      outlineVariant: '#cec4da',
      heroGradient: 'linear-gradient(135deg, #27134e 0%, #6750a4 58%, #8b5cf6 100%)',
      fabGradient: 'linear-gradient(135deg, #6750a4 0%, #8b5cf6 100%)',
    },
    dark: {
      primary: '#d0bcff',
      onPrimary: '#381e72',
      primaryHover: '#eaddff',
      primaryContainer: '#4f378b',
      onPrimaryContainer: '#eaddff',
      secondary: '#ccc2dc',
      onSecondary: '#332d41',
      secondaryContainer: '#4a4458',
      onSecondaryContainer: '#e8def8',
      tertiary: '#efb8c8',
      onTertiary: '#492532',
      tertiaryContainer: '#633b48',
      onTertiaryContainer: '#ffd8e4',
      bgCanvas: '#13111a',
      surfacePrimary: '#16131e',
      surfaceContainerLowest: '#0d0b13',
      surfaceContainerLow: '#1d1927',
      surfaceContainer: '#241f30',
      surfaceContainerHigh: '#2e283c',
      surfaceContainerHighest: '#383148',
      textPrimary: '#f3effa',
      textSecondary: '#c7bed7',
      textMuted: '#9288a4',
      outline: '#8e849e',
      outlineVariant: '#3e364f',
      heroGradient: 'linear-gradient(135deg, #1b1035 0%, #4f378b 60%, #7c3aed 100%)',
      fabGradient: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
    },
  },
  coral: {
    id: 'coral',
    label: 'Coral',
    description: 'Warm terracotta & sunset peach tones',
    swatchPrimary: '#ea580c',
    swatchSecondary: '#f97316',
    swatchTertiary: '#fb7185',
    light: {
      primary: '#b84321',
      onPrimary: '#ffffff',
      primaryHover: '#9a3415',
      primaryContainer: '#ffdbd1',
      onPrimaryContainer: '#3b0c00',
      secondary: '#844e39',
      onSecondary: '#ffffff',
      secondaryContainer: '#ffdbd0',
      onSecondaryContainer: '#321206',
      tertiary: '#785722',
      onTertiary: '#ffffff',
      tertiaryContainer: '#ffdea7',
      onTertiaryContainer: '#291800',
      bgCanvas: '#fcf6f4',
      surfacePrimary: '#fffaf8',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#faefec',
      surfaceContainer: '#f4e6e2',
      surfaceContainerHigh: '#eddbd6',
      surfaceContainerHighest: '#e4cfc9',
      textPrimary: '#221816',
      textSecondary: '#554440',
      textMuted: '#78635e',
      outline: '#85706a',
      outlineVariant: '#d8c5bf',
      heroGradient: 'linear-gradient(135deg, #4d1908 0%, #b84321 55%, #ea580c 100%)',
      fabGradient: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
    },
    dark: {
      primary: '#ffb5a0',
      onPrimary: '#5e1702',
      primaryHover: '#ffdbd1',
      primaryContainer: '#8a2b0d',
      onPrimaryContainer: '#ffdbd1',
      secondary: '#f0b8a4',
      onSecondary: '#4b2314',
      secondaryContainer: '#693725',
      onSecondaryContainer: '#ffdbd0',
      tertiary: '#e9c07f',
      onTertiary: '#412c00',
      tertiaryContainer: '#5c410d',
      onTertiaryContainer: '#ffdea7',
      bgCanvas: '#171110',
      surfacePrimary: '#1b1413',
      surfaceContainerLowest: '#110c0b',
      surfaceContainerLow: '#231b19',
      surfaceContainer: '#2b211f',
      surfaceContainerHigh: '#362a27',
      surfaceContainerHighest: '#413330',
      textPrimary: '#faeeeb',
      textSecondary: '#d4beb8',
      textMuted: '#9f8781',
      outline: '#98817b',
      outlineVariant: '#4b3b37',
      heroGradient: 'linear-gradient(135deg, #331107 0%, #7c2d12 58%, #c2410c 100%)',
      fabGradient: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
    },
  },
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return [100, 116, 139]
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function hexWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const srgb = v / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastOnColor(bgHex: string, darkInk = '#111827', lightInk = '#ffffff'): string {
  const lum = relativeLuminance(bgHex)
  return lum > 0.36 ? darkInk : lightInk
}

export function resolveAppearance(
  appearance: Partial<AppearanceSettings> | undefined,
  systemColorScheme: 'light' | 'dark' | null | undefined,
  dynamicPayload?: DynamicColorPayload | null,
): ResolvedAppearance {
  const norm = normalizeAppearance(appearance)
  const resolvedColorScheme: 'light' | 'dark' =
    norm.colorScheme === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : norm.colorScheme

  const pureBlackActive = resolvedColorScheme === 'dark' && norm.pureBlack
  const dynamicWallpaperSupported = Boolean(dynamicPayload?.supported && dynamicPayload?.colors)
  const effectivePaletteId: ColorThemeId =
    norm.colorTheme === 'wallpaper' && !dynamicWallpaperSupported ? 'concept' : norm.colorTheme

  return {
    style: norm.style,
    colorScheme: norm.colorScheme,
    resolvedColorScheme,
    pureBlackPreference: norm.pureBlack,
    pureBlackActive,
    colorTheme: norm.colorTheme,
    reducedMotion: norm.reducedMotion,
    updatedAt: norm.updatedAt,
    dynamicWallpaperSupported,
    dynamicWallpaperReason: dynamicPayload?.reason,
    effectivePaletteId,
    monetColors: dynamicPayload?.colors ?? null,
  }
}

export function getPaletteSwatches(
  dynamicPayload?: DynamicColorPayload | null,
): Array<{
  id: ColorThemeId
  label: string
  subtitle: string
  supported: boolean
  fallbackNotice?: string
  primary: string
  secondary: string
  tertiary: string
}> {
  const monet = dynamicPayload?.colors
  const wallpaperSupported = Boolean(dynamicPayload?.supported && monet)

  return [
    {
      id: 'wallpaper',
      label: 'Wallpaper',
      subtitle: wallpaperSupported ? 'Android Material You' : 'Fallback: Concept',
      supported: wallpaperSupported,
      fallbackNotice: wallpaperSupported
        ? undefined
        : dynamicPayload?.reason || 'Dynamic wallpaper colors require Android 12 or newer.',
      primary: monet?.accent1_500 ?? STATIC_PALETTES.concept.swatchPrimary,
      secondary: monet?.accent2_200 ?? STATIC_PALETTES.concept.swatchSecondary,
      tertiary: monet?.accent3_200 ?? STATIC_PALETTES.concept.swatchTertiary,
    },
    {
      id: 'concept',
      label: 'Concept',
      subtitle: 'Cobalt & Slate',
      supported: true,
      primary: STATIC_PALETTES.concept.swatchPrimary,
      secondary: STATIC_PALETTES.concept.swatchSecondary,
      tertiary: STATIC_PALETTES.concept.swatchTertiary,
    },
    {
      id: 'violet',
      label: 'Violet',
      subtitle: 'Expressive Plums',
      supported: true,
      primary: STATIC_PALETTES.violet.swatchPrimary,
      secondary: STATIC_PALETTES.violet.swatchSecondary,
      tertiary: STATIC_PALETTES.violet.swatchTertiary,
    },
    {
      id: 'coral',
      label: 'Coral',
      subtitle: 'Warm Terracotta',
      supported: true,
      primary: STATIC_PALETTES.coral.swatchPrimary,
      secondary: STATIC_PALETTES.coral.swatchSecondary,
      tertiary: STATIC_PALETTES.coral.swatchTertiary,
    },
  ]
}

export function buildThemeTokens(resolved: ResolvedAppearance): ThemeTokenSet {
  const isDark = resolved.resolvedColorScheme === 'dark'
  const isPureBlack = resolved.pureBlackActive
  const isGlass = resolved.style === 'liquid-glass'

  let palette: StaticPaletteSeed['light']
  let swatchPrimary: string
  let swatchSecondary: string
  let swatchTertiary: string

  if (resolved.colorTheme === 'wallpaper' && resolved.monetColors) {
    const m = resolved.monetColors
    swatchPrimary = m.accent1_500
    swatchSecondary = m.accent2_200
    swatchTertiary = m.accent3_200
    if (isDark) {
      const p = m.accent1_200
      const pCont = m.accent1_700
      const s = m.accent2_200
      const t = m.accent3_200
      palette = {
        primary: p,
        onPrimary: contrastOnColor(p, m.accent1_900, '#ffffff'),
        primaryHover: m.accent1_100,
        primaryContainer: pCont,
        onPrimaryContainer: contrastOnColor(pCont, m.accent1_900, m.accent1_100),
        secondary: s,
        onSecondary: contrastOnColor(s, m.accent2_900, '#ffffff'),
        secondaryContainer: m.accent2_700,
        onSecondaryContainer: contrastOnColor(m.accent2_700, m.accent2_900, m.accent2_100),
        tertiary: t,
        onTertiary: contrastOnColor(t, m.accent3_900, '#ffffff'),
        tertiaryContainer: m.accent3_700,
        onTertiaryContainer: contrastOnColor(m.accent3_700, m.accent3_900, m.accent3_100),
        bgCanvas: m.neutral1_900,
        surfacePrimary: m.neutral1_900,
        surfaceContainerLowest: m.neutral1_1000,
        surfaceContainerLow: m.neutral1_800,
        surfaceContainer: m.neutral2_800,
        surfaceContainerHigh: m.neutral2_700,
        surfaceContainerHighest: m.neutral2_700,
        textPrimary: m.neutral1_50,
        textSecondary: m.neutral2_200,
        textMuted: m.neutral2_400,
        outline: m.neutral2_400,
        outlineVariant: m.neutral2_700,
        heroGradient: `linear-gradient(135deg, ${m.accent1_900} 0%, ${m.accent1_700} 60%, ${m.accent2_700} 100%)`,
        fabGradient: `linear-gradient(135deg, ${m.accent1_500} 0%, ${m.accent3_600} 100%)`,
      }
    } else {
      const p = m.accent1_600
      const pCont = m.accent1_100
      const s = m.accent2_700
      const t = m.accent3_700
      palette = {
        primary: p,
        onPrimary: contrastOnColor(p, m.accent1_900, '#ffffff'),
        primaryHover: m.accent1_700,
        primaryContainer: pCont,
        onPrimaryContainer: contrastOnColor(pCont, m.accent1_900, '#ffffff'),
        secondary: s,
        onSecondary: contrastOnColor(s, m.accent2_900, '#ffffff'),
        secondaryContainer: m.accent2_100,
        onSecondaryContainer: contrastOnColor(m.accent2_100, m.accent2_900, '#ffffff'),
        tertiary: t,
        onTertiary: contrastOnColor(t, m.accent3_900, '#ffffff'),
        tertiaryContainer: m.accent3_100,
        onTertiaryContainer: contrastOnColor(m.accent3_100, m.accent3_900, '#ffffff'),
        bgCanvas: m.neutral1_10,
        surfacePrimary: m.neutral1_50,
        surfaceContainerLowest: '#ffffff',
        surfaceContainerLow: m.neutral1_50,
        surfaceContainer: m.neutral1_100,
        surfaceContainerHigh: m.neutral2_100,
        surfaceContainerHighest: m.neutral2_200,
        textPrimary: m.neutral1_900,
        textSecondary: m.neutral2_700,
        textMuted: m.neutral2_500,
        outline: m.neutral2_700,
        outlineVariant: m.neutral2_200,
        heroGradient: `linear-gradient(135deg, ${m.accent1_900} 0%, ${m.accent1_600} 60%, ${m.accent3_600} 100%)`,
        fabGradient: `linear-gradient(135deg, ${m.accent1_600} 0%, ${m.accent3_600} 100%)`,
      }
    }
  } else {
    const seedKey: Exclude<ColorThemeId, 'wallpaper'> =
      resolved.effectivePaletteId === 'wallpaper' ? 'concept' : resolved.effectivePaletteId
    const seed = STATIC_PALETTES[seedKey]
    palette = isDark ? seed.dark : seed.light
    swatchPrimary = seed.swatchPrimary
    swatchSecondary = seed.swatchSecondary
    swatchTertiary = seed.swatchTertiary
  }

  // Apply Pure Black AMOLED overrides when in dark mode and pureBlackActive is true
  const bgCanvas = isPureBlack ? '#000000' : palette.bgCanvas
  const surfacePrimary = isPureBlack ? '#000000' : palette.surfacePrimary
  const surfaceContainerLowest = isPureBlack ? '#050507' : palette.surfaceContainerLowest
  const surfaceContainerLow = isPureBlack ? '#0b0c10' : palette.surfaceContainerLow
  const surfaceContainer = isPureBlack ? '#121318' : palette.surfaceContainer
  const surfaceContainerHigh = isPureBlack ? '#191b22' : palette.surfaceContainerHigh
  const surfaceContainerHighest = isPureBlack ? '#22252e' : palette.surfaceContainerHighest
  const textPrimary = isPureBlack ? '#f8fafc' : palette.textPrimary
  const outlineVariant = isPureBlack ? '#262933' : palette.outlineVariant

  // Style-specific surfaces: Liquid Glass keeps authentic translucent blur & specular rims,
  // Material 3 Expressive uses opaque tonal surface containers without blur.
  const surfaceCard = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(18, 20, 26, 0.78)'
        : 'rgba(26, 33, 46, 0.68)'
      : 'rgba(255, 255, 255, 0.72)'
    : surfaceContainerLow

  const surfaceCardStrong = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(25, 28, 36, 0.86)'
        : 'rgba(32, 41, 56, 0.80)'
      : 'rgba(255, 255, 255, 0.88)'
    : surfaceContainer

  const surfaceElevated = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(16, 18, 24, 0.94)'
        : 'rgba(22, 29, 41, 0.90)'
      : 'rgba(255, 255, 255, 0.93)'
    : surfaceContainerHigh

  const headerBg = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(0, 0, 0, 0.72)'
        : 'rgba(14, 19, 27, 0.74)'
      : 'rgba(248, 250, 252, 0.76)'
    : bgCanvas

  const navBg = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(16, 18, 24, 0.82)'
        : 'rgba(22, 29, 41, 0.78)'
      : 'rgba(255, 255, 255, 0.76)'
    : surfaceContainer

  const navBorder = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(255, 255, 255, 0.16)'
        : 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.70)'
    : outlineVariant

  const navShadow = isGlass
    ? isDark
      ? '0 16px 40px -10px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.16)'
      : '0 14px 36px -8px rgba(15, 23, 42, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.85)'
    : isDark
      ? '0 -2px 12px rgba(0, 0, 0, 0.35)'
      : '0 -1px 8px rgba(15, 23, 42, 0.05)'

  const borderSubtle = isGlass
    ? isDark
      ? isPureBlack
        ? 'rgba(255, 255, 255, 0.16)'
        : 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.68)'
    : outlineVariant

  const borderHighlight = isGlass
    ? isDark
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.90)'
    : 'transparent'

  const navActiveBg = isGlass
    ? hexWithAlpha(palette.primary, isDark ? 0.22 : 0.13)
    : palette.primaryContainer

  const navActiveText = isGlass ? palette.primary : palette.onPrimaryContainer

  return {
    scheme: resolved.resolvedColorScheme,
    pureBlack: isPureBlack,
    visualStyle: resolved.style,
    colorTheme: resolved.colorTheme,
    effectivePaletteId: resolved.effectivePaletteId,
    bgCanvas,
    surfacePrimary,
    surfaceContainerLowest,
    surfaceContainerLow,
    surfaceContainer,
    surfaceContainerHigh,
    surfaceContainerHighest,
    surfaceCard,
    surfaceCardStrong,
    surfaceElevated,
    headerBg,
    navBg,
    navBorder,
    navShadow,
    textPrimary,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    outline: palette.outline,
    outlineVariant,
    borderSubtle,
    borderHighlight,
    primary: palette.primary,
    onPrimary: palette.onPrimary,
    primaryHover: palette.primaryHover,
    primaryContainer: palette.primaryContainer,
    onPrimaryContainer: palette.onPrimaryContainer,
    secondary: palette.secondary,
    onSecondary: palette.onSecondary,
    secondaryContainer: palette.secondaryContainer,
    onSecondaryContainer: palette.onSecondaryContainer,
    tertiary: palette.tertiary,
    onTertiary: palette.onTertiary,
    tertiaryContainer: palette.tertiaryContainer,
    onTertiaryContainer: palette.onTertiaryContainer,
    heroGradient: palette.heroGradient,
    heroText: '#ffffff',
    heroSubtext: 'rgba(255, 255, 255, 0.80)',
    fabGradient: palette.fabGradient,
    fabText: '#ffffff',
    navActiveBg,
    navActiveText,
    focusRing: hexWithAlpha(palette.primary, 0.38),
    selectionBg: hexWithAlpha(palette.primary, 0.22),
    disabledBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.07)',
    disabledText: isDark ? 'rgba(255, 255, 255, 0.36)' : 'rgba(15, 23, 42, 0.36)',
    switchTrackOff: isDark ? '#3a3f4b' : '#cbd5e1',
    switchTrackOn: palette.primary,
    switchThumbOff: isDark ? '#b8c0cc' : '#ffffff',
    switchThumbOn: palette.onPrimary,
    scrim: isPureBlack ? 'rgba(0, 0, 0, 0.80)' : isDark ? 'rgba(4, 7, 13, 0.72)' : 'rgba(15, 23, 42, 0.45)',
    finIncome: isDark ? '#34d399' : '#059669',
    finIncomeBg: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5',
    finExpense: isDark ? '#fb7185' : '#dc2626',
    finExpenseBg: isDark ? 'rgba(244, 63, 94, 0.16)' : '#fef2f2',
    finWarning: isDark ? '#fbbf24' : '#d97706',
    finWarningBg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#fffbeb',
    finInfo: isDark ? '#38bdf8' : '#0284c7',
    finInfoBg: isDark ? 'rgba(56, 189, 248, 0.16)' : '#f0f9ff',
    swatchPrimary,
    swatchSecondary,
    swatchTertiary,
  }
}
