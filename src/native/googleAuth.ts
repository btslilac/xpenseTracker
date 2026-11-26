import { NativeModules, TurboModuleRegistry } from 'react-native'

export type NativeGoogleSigninModule = typeof import('@react-native-google-signin/google-signin')

let cachedModule: NativeGoogleSigninModule | null | undefined = undefined

/**
 * Safely resolves @react-native-google-signin/google-signin ONLY if the native
 * binary actually links RNGoogleSignin (e.g. standalone APK or custom dev client).
 * In Expo Go, this returns null without evaluating NativeGoogleSignin.js, preventing
 * the fatal TurboModuleRegistry.getEnforcing('RNGoogleSignin') runtime crash.
 */
export function getNativeGoogleSignin(): NativeGoogleSigninModule | null {
  if (cachedModule !== undefined) {
    return cachedModule
  }

  try {
    const hasTurbo = typeof TurboModuleRegistry?.get === 'function'
      ? TurboModuleRegistry.get('RNGoogleSignin')
      : null
    const hasLegacy = NativeModules?.RNGoogleSignin

    if (!hasTurbo && !hasLegacy) {
      cachedModule = null
      return null
    }

    cachedModule = require('@react-native-google-signin/google-signin')
    return cachedModule ?? null
  } catch (err) {
    console.warn('Could not load native GoogleSignin module:', err)
    cachedModule = null
    return null
  }
}
