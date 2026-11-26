import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

function isMissingValue(value?: string) {
  if (!value) return true
  const n = value.trim().toLowerCase()
  return n.length === 0 || n.includes('your-') || n.includes('placeholder')
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

const missingKeys: string[] = []
if (isMissingValue(supabaseUrl)) missingKeys.push('EXPO_PUBLIC_SUPABASE_URL')
if (isMissingValue(supabaseAnonKey)) missingKeys.push('EXPO_PUBLIC_SUPABASE_ANON_KEY')

export const isSupabaseConfigured = missingKeys.length === 0

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null

// ---------------------------------------------------------------------------
// Helpers used by App.tsx (mirrors the old firebase.ts API surface)
// ---------------------------------------------------------------------------

type SupportedPlatform = 'android' | 'ios' | 'web'

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ''

export function isGoogleAuthConfigured(_platform: SupportedPlatform) {
  return !isMissingValue(googleWebClientId)
}

export function getGoogleNativeWebClientId() {
  return googleWebClientId
}

export function getSetupMessage(platform: SupportedPlatform): string {
  if (!isSupabaseConfigured) {
    return `Add these Supabase env vars to a .env file: ${missingKeys.join(', ')}.`
  }
  if (!isGoogleAuthConfigured(platform)) {
    return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to a .env file to enable Google sign-in.'
  }
  return ''
}
