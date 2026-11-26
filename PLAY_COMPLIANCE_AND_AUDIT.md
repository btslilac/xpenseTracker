# Google Play, Play Protect, SMS Policy & Kenya DPA Compliance Audit

## 1. Android Permissions & Play Protect Remediation

| Permission in `android/app/src/main/AndroidManifest.xml` | Status | Rationale / Action Taken |
| :--- | :--- | :--- |
| `android.permission.RECORD_AUDIO` | **REMOVED** | Completely unused in JS or Kotlin; sensitive permission flagged unnecessarily by Play Protect/Play review. |
| `android.permission.SYSTEM_ALERT_WINDOW` | **REMOVED** | Legacy overlay permission unused by current in-app WebView sheets/modals; high-risk Play Protect trigger removed. |
| `android.permission.RECEIVE_SMS` & `READ_SMS` | **RETAINED (Opt-In, Disclosed)** | Core optional M-PESA/Fuliza/bank expense detection (`SmsBroadcastReceiver.kt`, `SmsExpenseCaptureModule.kt`). Guarded behind prominent in-app disclosure modal, explicit consent timestamp, adult/verified-guardian gate, and zero raw-SMS logging or upload. |
| `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion=32`) | **SCOPED** | Retained only up to Android 12 (`API 32`) for avatar/document selection; consider replacing legacy storage writes with Android Photo Picker (`ACTION_PICK_IMAGES`) if Play targets API 34+ strictly. |
| `android.permission.VIBRATE` & `INTERNET` | **REQUIRED** | Scoped wrong-password & interaction haptics (`expo-haptics`) + Supabase/OAuth transport. |

> **Note on Debug Manifests:** `android/app/src/debug/AndroidManifest.xml` and `debugOptimized/AndroidManifest.xml` contain `SYSTEM_ALERT_WINDOW` for React Native / Expo dev overlay only; Android Gradle excludes `debug` sourceSets from `assembleRelease` / `bundleRelease` APKs & AABs.

---

## 2. Play Protect Risk Reduction for Distribution

Do **not** ask users to disable Google Play Protect or sideload untrusted builds. To build Play Protect reputation and pass Play review cleanly:
1. **Use consistent, dedicated release signing (`my-upload-key.keystore` via Play App Signing)** — never distribute debug-signed APKs (`debug.keystore`) to end users.
2. **Minify & shrink release code properly** (`shrinkResources` / R8 verified with clean ProGuard keep rules) and target recent Android `targetSdkVersion` (check `android/build.gradle` `targetSdkVersion` >= 34/35).
3. **Host verifiable `PRIVACY_POLICY` and `ACCOUNT_DELETION` URLs** (`docs/` -> GitHub Pages / custom domain) matching your Play Console listing.
4. **Never log raw SMS bodies, credentials, or tokens** (enforced in JS and native buffers; pending queues strip `rawMessage`).

---

## 3. Google Play Restricted Permissions: SMS Declaration vs. Play-Compliant Alternative

Google Play restricts `READ_SMS` and `RECEIVE_SMS` strictly to approved core personal financial management / default handlers via the **Permissions Declaration Form** in Play Console:
- **Path A (Full SMS Auto-Capture via Play SMS Declaration):**
  - Provide demo video showing prominent disclosure (`Allow Local SMS Transaction Parsing?`), explicit consent toggle, on-device M-PESA/Fuliza parsing, and immediate revocation inside Privacy & Data Center.
  - Emphasize strictly on-device processing and zero upload of raw inbox SMS.
- **Path B (Play-Compliant Zero-SMS Variant if Google rejects broad SMS access):**
  - Users can already use the **Manual SMS Paste / Import** modal (`__stitchManualSmsImportModal` -> `smsDetectionService.ingestManualPastedMessages`) with M-PESA & Fuliza correlation without declaring `READ_SMS` or `RECEIVE_SMS`.
  - If shipping a Play Store APK without `READ_SMS`/`RECEIVE_SMS`, remove those two lines from `AndroidManifest.xml` (or configure a `play` Gradle flavor) and keep manual SMS paste + statement import active.

---

## 4. Google Play Data Safety Section Mapping

| Data Category | Collected | Shared with Third Parties | Purpose | Security & Deletion |
| :--- | :--- | :--- | :--- | :--- |
| **Personal Info** (Name, Email address, Optional Phone) | Yes (user-provided) | No (Supabase acts as data processor) | Account management, authentication, password recovery, guardian consent | Encrypted in transit (TLS), encrypted at rest, deleted via in-app or `/account-deletion` |
| **Financial Info** (Manual/confirmed expenses, income, budgets, loan agreements, payments) | Yes | No | Core personal expense tracking & lending ledger | Protected by Supabase RLS (`auth.uid() = user_id`) |
| **SMS Messages** (M-PESA/Bank/Fuliza alerts when opted-in) | **Processed on-device only**; NOT uploaded as raw SMS | No | Local automatic transaction candidate extraction | Stripped from persistent queues, never logged, cleared on withdrawal/deletion |
| **Device / Security** (Biometric hardware check) | Checked locally via Android OS | No | App unlock protection | OS-enforced only; biometric data never leaves device hardware |

---

## 5. Outstanding Legal Placeholders to Finalize Before Store Release

Review `src/lib/legal/complianceDocuments.ts` (`COMPLIANCE_PLACEHOLDERS`):
- `[PLACEHOLDER: Legal Entity Name / Solo Proprietor Full Registered Name]`
- `[PLACEHOLDER: Physical Office Street Address, Building, P.O. Box, Nairobi, Kenya]`
- `[PLACEHOLDER: ODPC Registration Certificate No. once issued]`
- `[PLACEHOLDER: dedicated privacy@ / DPO phone if appointed]`
- `[PLACEHOLDER: Confirm exact Supabase automated backup retention window (e.g., 7–30 days)]`
- Populate `docs/config.js` with your production Supabase Project URL and public **Anon Key** (never `service_role`) if hosting the static `/account-deletion`, `/data-request`, and `/parental-consent` pages for live interactive RPC submission.
- Run `supabase/migrations/20261126_compliance_consent_and_deletion.sql` (which also updates `delete_user()`) in your Supabase SQL Editor.
