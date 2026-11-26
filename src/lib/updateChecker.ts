import type { AppReleaseMetadata } from '../types'
import { APP_VERSION } from './appVersion'
import { supabase } from './supabase'

export type UpdateCheckOutcome = {
  status: 'update_available' | 'up_to_date' | 'offline' | 'error'
  currentVersion: string
  latestRelease: AppReleaseMetadata | null
  message: string
}

/**
 * Compares two semantic version strings (e.g. "1.0.2" vs "v1.0.1").
 * Returns > 0 if `a > b`, < 0 if `a < b`, 0 if equal.
 */
export function compareVersions(a: string, b: string): number {
  const normalize = (v: string) =>
    String(v || '0.0.0')
      .trim()
      .replace(/^v/i, '')
      .split('-')[0]
      .split('.')
      .map((part) => {
        const n = parseInt(part, 10)
        return Number.isFinite(n) ? n : 0
      })

  const pa = normalize(a)
  const pb = normalize(b)
  const len = Math.max(pa.length, pb.length, 3)

  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0
    const vb = pb[i] ?? 0
    if (va > vb) return 1
    if (va < vb) return -1
  }
  return 0
}

export async function checkForAppUpdate(): Promise<UpdateCheckOutcome> {
  if (!supabase) {
    return {
      status: 'error',
      currentVersion: APP_VERSION,
      latestRelease: null,
      message: 'Update service is not configured.',
    }
  }

  try {
    const { data, error } = await supabase
      .from('app_releases')
      .select('version, release_title, release_notes, update_type, is_mandatory, min_native_version, store_url, published_at')
      .order('published_at', { ascending: false })
      .limit(15)

    if (error) {
      throw error
    }

    const rows = Array.isArray(data) ? data : []
    if (rows.length === 0) {
      return {
        status: 'up_to_date',
        currentVersion: APP_VERSION,
        latestRelease: null,
        message: `You are running the latest version (v${APP_VERSION}).`,
      }
    }

    // Select the highest semantic version row
    const sorted = rows
      .filter((r) => Boolean(r && r.version))
      .sort((left, right) => compareVersions(String(right.version), String(left.version)))

    const top = sorted[0]
    if (!top) {
      return {
        status: 'up_to_date',
        currentVersion: APP_VERSION,
        latestRelease: null,
        message: `You are running the latest version (v${APP_VERSION}).`,
      }
    }

    const release: AppReleaseMetadata = {
      version: String(top.version).replace(/^v/i, ''),
      releaseTitle: String(top.release_title || `XpenseTracker v${top.version}`),
      releaseNotes: String(top.release_notes || 'Bug fixes and performance improvements.'),
      updateType: top.update_type === 'native' ? 'native' : 'ota',
      isMandatory: Boolean(top.is_mandatory),
      minNativeVersion: top.min_native_version ? String(top.min_native_version) : undefined,
      storeUrl: top.store_url ? String(top.store_url) : undefined,
      publishedAt: String(top.published_at || new Date().toISOString()),
    }

    if (compareVersions(release.version, APP_VERSION) > 0) {
      return {
        status: 'update_available',
        currentVersion: APP_VERSION,
        latestRelease: release,
        message: `New version v${release.version} is available!`,
      }
    }

    return {
      status: 'up_to_date',
      currentVersion: APP_VERSION,
      latestRelease: release,
      message: `Your application is up to date (v${APP_VERSION}).`,
    }
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase()
    const isNetwork = msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')
    return {
      status: isNetwork ? 'offline' : 'error',
      currentVersion: APP_VERSION,
      latestRelease: null,
      message: isNetwork
        ? 'Could not reach the update server. Check your internet connection and try again.'
        : `Unable to check for updates right now (${err?.message || 'Unknown error'}).`,
    }
  }
}
