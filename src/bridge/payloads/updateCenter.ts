import type { Account } from '../../types'
import { APP_BUILD_NUMBER, APP_RELEASE_CHANNEL, APP_VERSION } from '../../lib/appVersion'

export function buildUpdateCenterPayload(_account?: Account, params?: Record<string, string>) {
  let availableUpdate: any = null
  try {
    if (params?._latestReleaseJson) {
      availableUpdate = JSON.parse(params._latestReleaseJson)
    }
  } catch {
    availableUpdate = null
  }

  return {
    currentVersion: APP_VERSION,
    buildNumber: APP_BUILD_NUMBER,
    channel: APP_RELEASE_CHANNEL,
    isMandatory: Boolean(availableUpdate?.isMandatory),
    availableUpdate,
  }
}
