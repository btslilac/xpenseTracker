import { NativeModules, Platform } from 'react-native'

export type NativeDynamicMonetColors = {
  accent1_100: string
  accent1_200: string
  accent1_500: string
  accent1_600: string
  accent1_700: string
  accent1_800: string
  accent1_900: string
  accent2_100: string
  accent2_200: string
  accent2_500: string
  accent2_600: string
  accent2_700: string
  accent2_900: string
  accent3_100: string
  accent3_200: string
  accent3_600: string
  accent3_700: string
  accent3_900: string
  neutral1_10: string
  neutral1_50: string
  neutral1_100: string
  neutral1_800: string
  neutral1_900: string
  neutral1_1000: string
  neutral2_100: string
  neutral2_200: string
  neutral2_400: string
  neutral2_500: string
  neutral2_700: string
  neutral2_800: string
  neutral2_900: string
}

export type DynamicColorPayload = {
  supported: boolean
  sdkInt?: number
  reason?: string
  colors?: NativeDynamicMonetColors
}

type DynamicColorNativeModule = {
  getDynamicPalette(): Promise<DynamicColorPayload>
}

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && HEX_COLOR_RE.test(value.trim())) {
    return value.trim().toUpperCase()
  }
  return fallback
}

function getNativeModule(): DynamicColorNativeModule | undefined {
  if (Platform.OS !== 'android') {
    return undefined
  }
  return NativeModules.DynamicColor as DynamicColorNativeModule | undefined
}

export function isDynamicColorNativeBridgePresent(): boolean {
  return Platform.OS === 'android' && Boolean(getNativeModule())
}

/**
 * Fetches validated system wallpaper/Monet colors on Android 12+ (API 31+).
 * Never fabricates dynamic colors on unsupported platforms/devices.
 */
export async function fetchNativeDynamicPalette(): Promise<DynamicColorPayload> {
  const mod = getNativeModule()
  if (!mod || typeof mod.getDynamicPalette !== 'function') {
    return {
      supported: false,
      reason:
        Platform.OS === 'android'
          ? 'Native Monet bridge unavailable in current runtime (requires Android 12+ native build).'
          : 'Dynamic wallpaper colors are only available on Android 12+.',
    }
  }

  try {
    const raw = await mod.getDynamicPalette()
    if (!raw || !raw.supported || !raw.colors) {
      return {
        supported: false,
        sdkInt: typeof raw?.sdkInt === 'number' ? raw.sdkInt : undefined,
        reason: raw?.reason || 'Dynamic wallpaper colors unavailable on this device.',
      }
    }

    const c = raw.colors as Record<string, unknown>
    const validated: NativeDynamicMonetColors = {
      accent1_100: sanitizeHex(c.accent1_100, '#DCE1FF'),
      accent1_200: sanitizeHex(c.accent1_200, '#B6C4FF'),
      accent1_500: sanitizeHex(c.accent1_500, '#4F46E5'),
      accent1_600: sanitizeHex(c.accent1_600, '#2D409A'),
      accent1_700: sanitizeHex(c.accent1_700, '#223585'),
      accent1_800: sanitizeHex(c.accent1_800, '#0E236F'),
      accent1_900: sanitizeHex(c.accent1_900, '#001356'),
      accent2_100: sanitizeHex(c.accent2_100, '#CCFBF1'),
      accent2_200: sanitizeHex(c.accent2_200, '#5EEAD4'),
      accent2_500: sanitizeHex(c.accent2_500, '#0D9488'),
      accent2_600: sanitizeHex(c.accent2_600, '#0F766E'),
      accent2_700: sanitizeHex(c.accent2_700, '#134E4A'),
      accent2_900: sanitizeHex(c.accent2_900, '#042F2E'),
      accent3_100: sanitizeHex(c.accent3_100, '#E0E7FF'),
      accent3_200: sanitizeHex(c.accent3_200, '#A5B4FC'),
      accent3_600: sanitizeHex(c.accent3_600, '#4F46E5'),
      accent3_700: sanitizeHex(c.accent3_700, '#3730A3'),
      accent3_900: sanitizeHex(c.accent3_900, '#1E1B4B'),
      neutral1_10: sanitizeHex(c.neutral1_10, '#F8F9FC'),
      neutral1_50: sanitizeHex(c.neutral1_50, '#F1F3F9'),
      neutral1_100: sanitizeHex(c.neutral1_100, '#E9ECF5'),
      neutral1_800: sanitizeHex(c.neutral1_800, '#1F2536'),
      neutral1_900: sanitizeHex(c.neutral1_900, '#0F121C'),
      neutral1_1000: sanitizeHex(c.neutral1_1000, '#05070B'),
      neutral2_100: sanitizeHex(c.neutral2_100, '#E1E5F0'),
      neutral2_200: sanitizeHex(c.neutral2_200, '#C5CCE0'),
      neutral2_400: sanitizeHex(c.neutral2_400, '#8E97B0'),
      neutral2_500: sanitizeHex(c.neutral2_500, '#6E7790'),
      neutral2_700: sanitizeHex(c.neutral2_700, '#444B5E'),
      neutral2_800: sanitizeHex(c.neutral2_800, '#272E42'),
      neutral2_900: sanitizeHex(c.neutral2_900, '#181D2B'),
    }

    return {
      supported: true,
      sdkInt: raw.sdkInt,
      colors: validated,
    }
  } catch (err) {
    return {
      supported: false,
      reason: err instanceof Error ? err.message : 'Unable to read dynamic colors.',
    }
  }
}
