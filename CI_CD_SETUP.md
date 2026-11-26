# XpenseTracker CI/CD & In-App Auto-Update Guide

## 1. Automated Workflows Overview

Three GitHub Actions workflows live in `.github/workflows/`:

1. **CI Verification ([`ci.yml`](.github/workflows/ci.yml))**:
   - Runs automatically on every push and pull request targeting `main`.
   - Executes `npm ci`, `npm run typecheck`, `npm test` (Auth security, M-PESA/Fuliza parser & correlation, DSAR export), and static AndroidManifest security checks.

2. **Build & Publish Android Release Update ([`release-update.yml`](.github/workflows/release-update.yml))**:
   - Triggers when you push a version tag (`v*.*.*`, e.g., `v1.0.3`) OR trigger **Actions -> Build & Publish Android Release Update -> Run workflow** manually.
   - Automatically synchronizes `package.json`, `app.json`, `src/lib/appVersion.ts`, and `android/app/build.gradle` via `scripts/sync-version.mjs` **before** bundling, runs typecheck & automated tests, builds a signed **Release APK** (+ optional **Release AAB**), uploads binaries & SHA-256 checksums to **GitHub Releases**, and upserts the release record into Supabase `public.app_releases` so users immediately see the update inside **Profile -> Update Center**.

3. **Public Compliance Portal ([`deploy-pages.yml`](.github/workflows/deploy-pages.yml))**:
   - Automatically publishes `docs/` (`/privacy-policy/`, `/terms-of-service/`, `/account-deletion/`, `/data-request/`, `/parental-consent/`) to **GitHub Pages** (`https://btslilac.github.io/xpenseTracker/`) when `docs/` changes on `main`.

---

## 2. One-Time GitHub Repository Setup

### A. Add Repository Secrets (`Settings -> Secrets and variables -> Actions`)

| Secret Name | Required? | Description |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase Project URL (`https://<ref>.supabase.co`). |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Your Supabase public `anon` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase `service_role` key (used ONLY in GitHub Actions to publish rows into `app_releases`). Never expose in client `.env`. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Recommended | Google OAuth Web Client ID for Google Sign-In in production APKs. |
| `ANDROID_KEYSTORE_BASE64` | Optional override | Base64-encoded `.keystore` if rotating away from `android/app/release.keystore`. |
| `ANDROID_KEY_ALIAS` | Optional override | Keystore alias (defaults to `xpensetracker`). |
| `ANDROID_STORE_PASSWORD` | Optional override | Keystore store password (defaults to `xpensetracker`). |
| `ANDROID_KEY_PASSWORD` | Optional override | Key password (defaults to `xpensetracker`). |

### B. Enable GitHub Pages (`Settings -> Pages`)
- Set **Build and deployment -> Source** to **GitHub Actions**.
- Once enabled, pushes to `main` touching `docs/**` (or manual dispatch of `Deploy Public Compliance Portal`) publish live URLs under `https://btslilac.github.io/xpenseTracker/`.

### C. Security Note on Keystore Rotation
- For public repositories or Play Store App Signing, consider rotating to a private Play Upload Keystore via `ANDROID_KEYSTORE_BASE64` + secrets rather than keeping a shared keystore password in `gradle.properties`. Never lose your upload key once Play App Signing / user sideload upgrades rely on that signature.

---

## 3. Releasing a New Version (Two Ways)

### Option 1: Git Tag Release (Recommended for clean version history)
```powershell
npm run version:sync 1.0.3 4
git add -A
git commit -m "Release v1.0.3: Auth, M-PESA/Fuliza intelligence, privacy & CI/CD"
git push origin main
git tag v1.0.3
git push origin v1.0.3
```
Pushing `v1.0.3` runs tests, builds the signed `v1.0.3` APK/AAB, creates the GitHub Release, and updates Supabase `app_releases`.

### Option 2: Manual GitHub Actions Dispatch
Open **GitHub -> Actions -> Build & Publish Android Release Update -> Run workflow**, enter `version` (`1.0.3`), `release_title`, and `release_notes`, and run. Users open **Update Center** inside XpenseTracker -> tap **Check for Updates** -> tap **Download Update** to install directly.
