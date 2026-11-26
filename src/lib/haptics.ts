import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/**
 * Trigger subtle selection tick for dropdowns, list taps, and switches.
 */
export async function hapticSelection(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
      return
    }
    await Haptics.selectionAsync()
  } catch {
    // Fail silently on simulators / unsupported hardware
  }
}

/**
 * Trigger soft light impact for button presses and prompt launches.
 */
export async function hapticLight(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15)
      }
      return
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  } catch {
    // Fail silently on simulators / unsupported hardware
  }
}

/**
 * Trigger medium impact for important actions.
 */
export async function hapticMedium(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25)
      }
      return
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  } catch {
    // Fail silently on simulators / unsupported hardware
  }
}

/**
 * Trigger crisp success notification pulse upon biometric unlock or save.
 */
export async function hapticSuccess(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 30, 20])
      }
      return
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } catch {
    // Fail silently on simulators / unsupported hardware
  }
}

/**
 * Trigger gentle error vibration pulse upon authentication failure.
 */
export async function hapticError(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 50, 30])
      }
      return
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  } catch {
    // Fail silently on simulators / unsupported hardware
  }
}
