# XpenseTracker — Application Context & Architecture Guide

## 1. Executive Summary

**XpenseTracker** (previously named *Xpensify*) is an offline-first personal finance and expense tracking mobile application built with **React Native** and **Expo (SDK 56)**. The app is tailored for Indian personal finance tracking with automatic UPI payment detection through SMS notifications, combined with a hybrid webview-based rendering layer, Supabase cloud backend, and robust offline synchronization.

---

## 2. Core Architecture & Tech Stack

### 2.1 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | React Native `0.85.3`, Expo SDK `~56.0.0` (New Architecture enabled) |
| **Language & Tooling** | TypeScript `~6.0.3`, Node.js |
| **JS Engine & Bundler** | Hermes Engine (Bytecode compilation `.hbc`), Metro Bundler |
| **UI Presentation Layer** | Hybrid `react-native-webview` (v13.16.1) rendering dynamic HTML/CSS/JS templates |
| **Local Storage & Cache** | `@react-native-async-storage/async-storage` (`^2.2.0`) |
| **Network & Connectivity** | `@react-native-community/netinfo` (`^12.0.1`) |
| **Authentication** | Supabase Auth (Email/Password) + Native Google Sign-In (`@react-native-google-signin/google-signin` `^16.1.2`) |
| **Cloud Backend & Database** | Supabase PostgreSQL (`@supabase/supabase-js` `^2.108.2`) with Row Level Security (RLS) |
| **Native Device Integration** | `expo-image-picker`, `expo-notifications`, `expo-status-bar`, native Android SMS & overlay modules |

### 2.2 Hybrid Architecture (Native Shell + Web Presentation)

Instead of traditional React Native JSX rendering for all screens, XpenseTracker utilizes an optimized **Hybrid Web-Native Bridge**:

1. **Native Container (`App.tsx`)**:
   - Manages top-level device features: safe-area insets (`react-native-safe-area-context`), status bar styling, hardware back button navigation (`BackHandler`), gesture handling, image picking (`expo-image-picker`), and device vibration/haptics (`Vibration`).
   - Hosts a full-screen `WebView` (`react-native-webview`) that mounts pre-rendered and sanitized HTML/CSS templates.
2. **Template Layer (`src/templates/`)**:
   - High-fidelity visual components structured as modular HTML/CSS strings (`dashboard`, `transactions`, `analytics`, `categories`, `profile`, `auth`, `settings`).
3. **Bridge Communication (`src/stitchBridge.ts`, `src/bridge/`)**:
   - **JavaScript Injections (`src/bridge/scripts/`)**: Screen-specific logic, interaction listeners, and DOM updates injected into the WebView.
   - **Bi-directional Messaging**: 
     - *Web -> Native*: `window.ReactNativeWebView.postMessage(JSON.stringify({ type, ... }))` sends events such as `navigate`, `back`, `swipe.left`, `swipe.right`, `haptic`, `auth.google`, `auth.email`, `profile.avatar.pick`, `transaction.create`, `transaction.delete`, and `category.create`.
     - *Native -> Web*: State updates, payload serialization (`src/bridge/payloads/`), and DOM re-renders triggered when data or navigation changes.

---

## 3. Key Features & Systems

### 3.1 Offline-First Synchronization (`src/lib/sync.ts` & `src/context/AppContext.tsx`)

- **Instant Local Feedback**: All CRUD operations (creating/deleting transactions, updating categories, editing budgets) apply immediately to in-memory state and local disk storage (`AsyncStorage`).
- **Mutation Queue (`@syncQueue_<userId>`)**: When network requests fail or offline status is detected, mutations are enqueued locally with their target table, action (`insert`, `update`, `delete`), and payload.
- **Automatic Sync Recovery**: `NetInfo.addEventListener` detects network restoration and triggers `processSyncQueue()`, draining pending mutations in FIFO order against Supabase.
- **Local Data Caching**: User profile (`@cache_userDoc_<uid>`), categories (`@cache_categories_<uid>`), and transactions (`@cache_transactions_<uid>`) are persisted so the app loads instantly without waiting for network responses.

### 3.2 Automated SMS Expense Capture (Android Native Module)

- **Targeted Domain**: Auto-capturing Indian bank & UPI transaction SMS notifications (e.g., Google Pay, PhonePe, Paytm, HDFC, SBI, ICICI).
- **Native Android Engine (`src/native/smsExpenseCapture.ts`)**:
  - Requires `RECEIVE_SMS`, Notification Access, and `SYSTEM_ALERT_WINDOW` (display over other apps).
  - Listens to incoming SMS broadcasts, extracts amounts and merchant tags, and compares them against user expense categories.
  - Queues pending captures in native shared preferences; on app resume or broadcast event, `syncCapturedExpenses()` matches categories and adds transactions directly to the user's ledger.

### 3.3 Financial Calculations & Analytics Engine (`src/lib/finance.ts`)

- Provides aggregated insights:
  - **Budget Tracking**: Computes total monthly spending vs. `monthlyBudget`, percentage consumed, and category-level budget limits (`categoryBudgets`).
  - **Cash Flow Analytics**: Total monthly income, total expenses, net savings, and savings goal progress (`savingsGoal`).
  - **Category Breakdown**: Percentage and total expenditure grouped per category for chart rendering.
  - **Time Series Aggregations**: Daily and weekly spending distribution for visualizing spending trends.

### 3.4 Authentication & Identity

- **Dual Auth Paths**:
  - **Native Google Sign-In**: Powered by `@react-native-google-signin/google-signin` on Android, returning an ID token exchanged with Supabase (`supabase.auth.signInWithIdToken()`).
  - **Email & Password**: Standard Supabase email auth with email confirmation support.
- **Account Lifecycle**:
  - Upon first authentication, a trigger in Supabase provisions default categories (Food & Dining, Transport, Shopping, Bills, Entertainment, Salary, etc.) and a user record with default settings.
  - Full account deletion via Supabase RPC (`delete_user`).

---

## 4. Directory & Codebase Structure

```
expensetracker/
├── App.tsx                     # Main React Native application entry & WebView bridge handler
├── app.json                    # Expo project configuration (SDK 56, plugins, permissions, scheme)
├── index.ts                    # Root entry point registering App via registerRootComponent
├── metro.config.js             # Metro bundler configuration with Expo defaults
├── package.json                # Project dependencies and script definitions
├── tsconfig.json               # TypeScript configuration
├── .env / .env.example         # Supabase and Google Web Client ID environment configuration
│
├── src/
│   ├── types.ts                # TypeScript domain models (Transaction, Category, UserSettings, Account)
│   ├── stitchBridge.ts         # Bridge handler wiring postMessage events to actions
│   ├── stitchHtml.ts           # Registry of HTML view templates
│   │
│   ├── bridge/
│   │   ├── inject.ts           # WebView injection runtime & stylesheet assembler
│   │   ├── routeConfig.ts      # Route metadata, bottom nav definitions, screen mapping
│   │   ├── routes.ts           # Route names and definitions
│   │   ├── icons.ts            # SVG icon definitions used across templates
│   │   ├── payloads/           # Data serializers for dashboard, analytics, transactions, categories
│   │   └── scripts/            # Client-side JavaScript injected into webviews for interactions
│   │
│   ├── context/
│   │   └── AppContext.tsx      # Central React Context (State, Supabase Auth, Offline Cache, CRUD)
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client instantiation, auth helpers, and config guards
│   │   ├── sync.ts             # Offline mutation queue and NetInfo reconnection processor
│   │   ├── finance.ts          # Budgeting, totals, distributions, and analytics calculators
│   │   ├── categoryAppearance.ts # Icon and color mapping for categories
│   │   └── avatars.ts          # Default avatar assets and avatar helpers
│   │
│   ├── native/
│   │   └── smsExpenseCapture.ts# Android native module bridge for SMS/notification expense capture
│   │
│   └── templates/              # HTML/CSS view templates injected into the WebView
│       ├── actions/            # addCategory, addExpense, categoryPopup
│       ├── auth/               # signIn, signUp
│       ├── main/               # dashboard, transactions, analytics, categories, profile, welcome
│       └── settings/           # budget, helpSupport, notifications, personalInfo
│
├── supabase/
│   ├── schema.sql              # PostgreSQL database schema (tables, RLS policies, triggers, defaults)
│   └── delete_user.sql         # RPC function for cascading user deletion
│
├── android/                    # Android native project directory
│   ├── app/                    # Application module (build.gradle, AndroidManifest.xml, keystores)
│   ├── build.gradle            # Root Gradle configuration
│   └── gradle.properties       # Release signing configs, Hermes enabled, newArchEnabled
│
├── scripts/                    # Utility scripts
│   ├── patch_appcontext.js     # Context patching helper for offline sync integration
│   ├── rename_app.js           # Renaming automation (Xpensify -> XpenseTracker)
│   └── replace_currency.js     # Currency symbol substitution script
│
├── assets/                     # Static icons, splash images, and store banners
└── dist/                       # Output directory for exported static bundles (Hermes bytecode)
```

---

## 5. Database Schema & Data Models

Defined in [`supabase/schema.sql`](file:///c:/Users/-/Music/backedupfiles/elelyon/expensetracker/supabase/schema.sql):

- **`users`**: Primary user profile table keyed by `id references auth.users(id) on delete cascade`, storing flexible user settings in `settings jsonb` (currency, monthly budget, income goals, notification preferences).
- **`categories`**: User-defined or default categories (`id`, `user_id`, `name`, `icon`, `color`, `type` [`expense` | `income`], `order`).
- **`transactions`**: Financial records (`id`, `user_id`, `amount`, `category_id`, `note`, `date`, `type`, `payment_method`, `recurring`).
- **`budgets`**: Monthly/weekly budget limits per category or overall user budget.
- **`recurring_transactions`**: Subscriptions or recurring income/expenses.
- **`payment_methods`**: Payment channels (`UPI`, `Cash`, `Card`).
- **Row Level Security (RLS)**: Enforced across all tables using `user_id = auth.uid()` policies to guarantee user data isolation.

---

## 6. Environment Configuration

The application requires the following environment variables (defined in `.env`):

| Variable | Description |
| :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g. `https://<ref>.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web Client ID for native Google Sign-In |

---

## 7. Build, Export & Packaging

- **JavaScript / Hermes Bytecode Bundle**:
  Run Expo export to build optimized static bundles for Android and iOS:
  ```bash
  npx expo export
  ```
  Artifacts are output to `dist/`:
  - `dist/_expo/static/js/android/index-<hash>.hbc`
  - `dist/_expo/static/js/ios/index-<hash>.hbc`
  - `dist/metadata.json`

- **Native Android Build (EAS Cloud)**:
  Configured with EAS Project ID `f753873c-6716-4a5b-97f2-42b5274c1a5a`:
  ```bash
  npx eas-cli build --platform android
  ```

- **Local Native Android Build**:
  Local Gradle builds (`./gradlew assembleRelease` or `./gradlew bundleRelease`) utilize:
  - Keystore: [`android/app/release.keystore`](file:///c:/Users/-/Music/backedupfiles/elelyon/expensetracker/android/app/release.keystore)
  - Key Alias: `xpensetracker`
  - Requires JDK 17+ and valid `sdk.dir` configured in `android/local.properties`.
