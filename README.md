# XpenseTracker 

<p align="center">
  <img src="assets/Expensify%20App%20Store%20Img.png" alt="XpenseTracker App Store Image" width="100%" />
</p>

**XpenseTracker** is a smart, offline-first personal finance application built with React Native and Expo. It simplifies expense tracking by automatically capturing UPI transactions and providing deep insights into your spending habits—all while ensuring your data stays synced and secure.

---

## ✨ Key Features

* 🚀 **Offline-First Architecture**: View and manage your expenses without an internet connection. Data syncs automatically in the background when you're back online.
* 🤖 **AI-Powered Insights**: Smart categorization and analytics of your spending patterns.
* 📩 **SMS Expense Capture (Android)**: Automatically detects and logs UPI payments by parsing SMS notifications—no manual entry needed!
* 🔐 **Seamless Authentication**: Secure login with Google Sign-In and Supabase Authentication.
* 📊 **Comprehensive Dashboard**: View your transactions, track monthly budgets, and analyze spending through intuitive charts.
* 🗂️ **Custom Categories**: Create, edit, and organize custom income and expense categories.
* 📱 **Cross-Platform Base**: Built with Expo and React Native, utilizing a high-performance webview-based UI layer.

## 🛠️ Tech Stack

* **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
* **Backend & Database**: [Supabase](https://supabase.com/)
* **Local Storage**: `@react-native-async-storage/async-storage` for robust offline caching
* **UI Architecture**: React Native WebView integration bridging to a dynamic web-based UI layer
* **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Expo CLI](https://docs.expo.dev/more/expo-cli/)
* Android Studio (for Android emulation) or Xcode (for iOS emulation)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/xpensetracker.git
   cd xpensetracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup Environment Variables:**
   Copy the sample environment file and configure your keys.

   ```bash
   cp .env.example .env
   ```

   *Make sure to add your Google Web Client ID and Supabase configuration to `.env`:*
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

4. **Supabase Configuration:**

   * Set up a project on [Supabase](https://supabase.com/).
   * Enable **Google Authentication** and **Email Authentication**.
   * Run the initial database migrations to create the `users`, `categories`, and `transactions` tables.

### Running the App

* **Start the Expo development server:**
  ```bash
  npx expo start
  ```
* **Run on Android:**
  ```bash
  npx expo run:android
  ```
* **Run on iOS:**
  ```bash
  npx expo run:ios
  ```

## 📱 SMS Auto-Capture (Android Only)

XpenseTracker uses background services to read incoming SMS messages related to banking and UPI transactions. For this feature to work, the app requires:

* SMS Read Permissions
* Notification Access
* Display over other apps (Overlay Permission)

The app will prompt you to grant these permissions upon first login on an Android device.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve XpenseTracker:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
