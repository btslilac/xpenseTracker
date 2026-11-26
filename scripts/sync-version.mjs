import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const rawVersion = String(process.argv[2] || '').trim().replace(/^v/i, '')
const explicitBuildArg = process.argv[3] ? parseInt(String(process.argv[3]).trim(), 10) : NaN

if (!/^\d+\.\d+\.\d+$/.test(rawVersion)) {
  console.error('Usage: node scripts/sync-version.mjs <X.Y.Z> [versionCode]')
  process.exit(1)
}

const packageJsonPath = path.join(root, 'package.json')
const appJsonPath = path.join(root, 'app.json')
const appVersionPath = path.join(root, 'src', 'lib', 'appVersion.ts')
const buildGradlePath = path.join(root, 'android', 'app', 'build.gradle')

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const appCfg = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

const currentCode = Number(appCfg?.expo?.android?.versionCode || 1)
const nextBuildCode =
  Number.isFinite(explicitBuildArg) && explicitBuildArg > 0
    ? explicitBuildArg
    : rawVersion === appCfg?.expo?.version
      ? currentCode
      : currentCode + 1

// 1. Update package.json
pkg.version = rawVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')

// 2. Update app.json
appCfg.expo.version = rawVersion
if (appCfg.expo.android) {
  appCfg.expo.android.versionCode = nextBuildCode
}
fs.writeFileSync(appJsonPath, JSON.stringify(appCfg, null, 2) + '\n', 'utf8')

// 3. Update src/lib/appVersion.ts
const appVersionContent = `export const APP_VERSION = '${rawVersion}'\nexport const APP_BUILD_NUMBER = '${nextBuildCode}'\nexport const APP_RELEASE_CHANNEL = 'Production (Hermes)'\n`
fs.writeFileSync(appVersionPath, appVersionContent, 'utf8')

// 4. Update android/app/build.gradle
let gradle = fs.readFileSync(buildGradlePath, 'utf8')
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${nextBuildCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${rawVersion}"`)
fs.writeFileSync(buildGradlePath, gradle, 'utf8')

console.log(`Synchronized XpenseTracker version=${rawVersion}, versionCode=${nextBuildCode}`)
