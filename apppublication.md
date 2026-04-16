# ThriftLoyalty — App Publication Checklist

> Complete guide for publishing to Google Play Store and Apple App Store using Expo/EAS.

---

## Table of Contents

1. [App Store Listing Copy](#1-app-store-listing-copy)
2. [Prerequisites & Accounts](#2-prerequisites--accounts)
3. [App Configuration](#3-app-configuration)
4. [Privacy Policy & Legal](#4-privacy-policy--legal)
5. [App Icons & Splash Screen](#5-app-icons--splash-screen)
6. [Screenshots & Promotional Graphics](#6-screenshots--promotional-graphics)
7. [Build for Production](#7-build-for-production)
8. [Submit to Google Play Store](#8-submit-to-google-play-store)
9. [Submit to Apple App Store](#9-submit-to-apple-app-store)
10. [Post-Submission](#10-post-submission)

---

## 1. App Store Listing Copy

### App Name

```
ThriftLoyalty
```

### Short Description (Google Play — max 80 characters)

```
Earn rewards, track points & redeem perks at your favorite thrift stores.
```

### Full Description (Google Play — max 4000 characters / Apple App Store — Promotional Text + Description)

```
ThriftLoyalty is the free loyalty rewards app that connects you to your favorite
thrift and retail stores. Sign in with just your phone number, join participating
stores, and start earning points every time you shop.

KEY FEATURES

• Instant Sign-In — Log in quickly with your phone number and a one-time
  verification code. No passwords to remember.

• Multi-Store Support — Join multiple participating stores and switch between
  them with a tap. Each store tracks your points and rewards independently.

• Digital Loyalty Card — Show your personalized QR code at checkout and earn
  points automatically. No more lost paper punch cards.

• Real-Time Balances — See exactly how many points you've earned at each store,
  updated after every purchase.

• Rewards & Redemptions — Browse available rewards, see what you've unlocked,
  and redeem them right from your phone.

• Transaction History — View a detailed log of past purchases including line
  items, totals, and point changes so you always know where you stand.

• Dark & Light Mode — ThriftLoyalty adapts to your device's display settings for
  a comfortable experience day or night.

HOW IT WORKS

1. Download ThriftLoyalty and sign in with your phone number.
2. Search for and join your favorite participating stores.
3. Show your QR code at checkout to earn points.
4. Check your balances and redeem rewards anytime.

Whether you're a thrift-store regular or just getting started, ThriftLoyalty
makes it easy to get rewarded for shopping smart. Download now and start earning!
```

### Apple App Store — Promotional Text (max 170 characters)

```
Earn points, unlock rewards, and track your loyalty balances at participating thrift & retail stores. Free to use — no account fees, ever.
```

### Apple App Store — Subtitle (max 30 characters)

```
Thrift Store Loyalty Rewards
```

### Keywords (Apple — max 100 characters, comma-separated)

```
loyalty,rewards,thrift,points,QR,card,shopping,earn,redeem,store,punch,discount
```

### Category

| Store        | Primary Category     | Secondary Category   |
|-------------|---------------------|---------------------|
| Google Play | Shopping            | Lifestyle           |
| Apple       | Shopping            | Lifestyle           |

### Content Rating

- **Google Play:** Everyone (no objectionable content)
- **Apple:** 4+ (no objectionable content)

---

## 2. Prerequisites & Accounts

### Developer Accounts

- [ ] **Apple Developer Program** — Enrolled and active ($99/year)
      → https://developer.apple.com/programs/
- [ ] **Google Play Developer Account** — Registered ($25 one-time)
      → https://play.google.com/console/signup

### Expo / EAS

- [ ] **Expo account** created at https://expo.dev
- [ ] **EAS CLI** installed globally:
      ```
      npm install -g eas-cli
      ```
- [ ] Logged in to EAS:
      ```
      eas login
      ```
- [ ] Project linked (already done — project ID `9862bae8-d770-4efe-ac83-a57d28e05d2c` is in `app.json`)

### Apple-Specific Setup

- [ ] **App Store Connect** — Create the app listing:
      → https://appstoreconnect.apple.com
      → "My Apps" → "+" → "New App"
      → Bundle ID: `com.quiltsoftware.thriftloyalty`
      → SKU: `thriftloyalty` (or any unique string)
      → Name: `ThriftLoyalty`
- [ ] **Apple Developer Portal** — Ensure a Distribution Certificate and Provisioning Profile exist
      (EAS Build handles this automatically if you let it manage credentials)

### Google-Specific Setup

- [ ] **Google Play Console** — Create the app:
      → https://play.google.com/console
      → "Create app"
      → App name: `ThriftLoyalty`
      → Default language: English (United States)
      → App or Game: App
      → Free or Paid: Free

---

## 3. App Configuration

Review and update `app.json` before building:

- [ ] **`version`** — Set to your release version (currently `1.0.0` ✅)
- [ ] **`ios.bundleIdentifier`** — `com.quiltsoftware.thriftloyalty` ✅
- [ ] **`android.package`** — `com.quiltsoftware.thriftloyalty` ✅
- [ ] **`ios.buildNumber`** — Managed remotely via EAS (`appVersionSource: "remote"`) ✅
- [ ] **`android.versionCode`** — Auto-incremented via EAS (`autoIncrement: true`) ✅
- [ ] **`orientation`** — `portrait` ✅
- [ ] **`ios.infoPlist.ITSAppUsesNonExemptEncryption`** — `false` ✅
      (Avoids the export compliance prompt in App Store Connect)
- [ ] **`icon`** — Points to a valid 1024×1024 PNG (see Section 5)
- [ ] **`splash`** — Configured ✅

### Recommended Additions to `app.json` — ✅ DONE

The following fields have been verified and applied:

- [x] **`ios.infoPlist.ITSAppUsesNonExemptEncryption`** — Already set to `false` ✅
- [x] **`android.permissions`** — Set to `[]` (no dangerous permissions requested) ✅

> **Note:** If you add camera, location, or other sensitive features later,
> update `android.permissions` and add the corresponding `ios.infoPlist` usage
> descriptions accordingly.

---

## 4. Privacy Policy & Legal

Both stores **require** a publicly accessible privacy policy URL.

- [x] **Privacy policy** — Hosted at https://thriftcart.com/privacy-policy ✅
- [ ] **Add the URL** to both store listings (see Sections 8 and 9)
- [ ] **(Optional) Terms of Service** — Not strictly required but recommended

---

## 5. App Icons & Splash Screen

### Required Icon Specs

| Platform       | Size         | Format | Notes                                    |
|---------------|-------------|--------|------------------------------------------|
| Expo/Both     | 1024×1024   | PNG    | No transparency, no rounded corners      |
| Android Adaptive | 1024×1024 | PNG  | Foreground layer; system applies masking  |
| Apple App Store | 1024×1024 | PNG   | No alpha channel                         |

### Checklist

- [x] **`assets/icon.png`** — Present and linked in `app.json` → `icon` ✅
- [x] **`assets/adaptive-icon.png`** — Present and linked in `app.json` → `android.adaptiveIcon.foregroundImage` ✅
      Keep the logo/symbol within the inner **safe zone** (centered 66% of the canvas, ~672×672)
      so it isn't clipped by circle/squircle masks.
- [x] **`assets/splash-icon.png`** — Present and linked in `app.json` → `splash.image` ✅
- [ ] **(Optional) `assets/favicon.png`** — Referenced in `app.json` → `web.favicon` but **file does not exist**.
      Create if you plan to support the web version; otherwise remove the `web` entry from `app.json`.

### Quick Validation

```bash
# Check icon dimensions (requires ImageMagick or similar)
identify assets/icon.png
# Should output: ... PNG 1024x1024 ...
```

---

## 6. Screenshots & Promotional Graphics

### Google Play Requirements

| Asset                  | Dimensions (px)       | Count     |
|-----------------------|----------------------|-----------|
| Phone screenshots     | 1080×1920 (or 16:9)  | 2–8       |
| 7" tablet screenshots | 1200×1920            | Up to 8   |
| 10" tablet screenshots| 1800×2560            | Up to 8   |
| Feature graphic       | 1024×500             | 1         |

### Apple App Store Requirements

| Device                  | Dimensions (px)            | Count   |
|------------------------|---------------------------|---------|
| 6.7" (iPhone 15 Pro Max) | 1290×2796                | 2–10   |
| 6.5" (iPhone 14 Plus)   | 1284×2778 or 1242×2688   | 2–10   |
| 5.5" (iPhone 8 Plus)    | 1242×2208                | 2–10   |
> **Tip:** You only strictly *need* the 6.7" and 6.5" sets — Apple will scale
> for smaller devices. iPad screenshots are not required since `supportsTablet`
> is set to `false` in `app.json`.

### Recommended Screenshots (capture these screens)

1. **Login screen** — Clean sign-in experience
2. **Home screen** — QR code, point balances, active store
3. **Rewards list** — Available and redeemed rewards
4. **Store selector** — Multi-store support
5. **Transaction history** — Purchase detail view
6. **Dark mode variant** — Show one key screen in dark mode

### How to Capture Screenshots

**Option A: Expo + Simulator/Emulator**

```bash
# Start the app
npx expo start

# iOS Simulator: Cmd+S to save screenshot
# Android Emulator: Click camera icon in toolbar, or:
adb exec-out screencap -p > screenshot.png
```

**Option B: Physical Device**

- iOS: Side button + Volume Up
- Android: Power + Volume Down

**Option C: Automated with Fastlane (advanced)**

```bash
# Install fastlane
gem install fastlane
# Use `fastlane snapshot` (iOS) or `fastlane screengrab` (Android)
```

### Feature Graphic (Google Play)

- 1024×500 PNG or JPEG
- Should include app name, logo, and a tagline
- Example tagline: "Earn rewards at your favorite thrift stores"
- Tools: Canva, Figma, or any design tool

---

## 7. Build for Production

### Pre-Build Checklist

- [ ] All code changes committed and pushed to `main`
- [ ] App tested thoroughly on both iOS and Android (simulator + real device)
- [ ] No hardcoded development/debug values
- [ ] API base URL points to production (`https://thriftloyalty.com/api` ✅)
- [ ] API key is production-ready (check `src/services/api.ts`)

### Build Commands

**Build for both platforms simultaneously:**

```bash
eas build --platform all --profile production
```

**Or build individually:**

```bash
# Android (produces .aab for Play Store)
eas build --platform android --profile production

# iOS (produces .ipa for App Store)
eas build --platform ios --profile production
```

### During the iOS Build

EAS will prompt you about Apple credentials:

1. **Log in with your Apple ID** when prompted
2. **Let EAS manage credentials** (recommended) — it will create/reuse:
   - Distribution certificate
   - Provisioning profile
3. If you prefer manual management, set up credentials in Apple Developer Portal first

### During the Android Build

- First build: EAS generates a new **upload keystore** automatically
- **IMPORTANT:** EAS stores this securely. If you ever need to manage it manually:
  ```bash
  eas credentials --platform android
  ```

### Monitor Build Progress

```bash
# Check build status
eas build:list

# Or visit the Expo dashboard
# https://expo.dev/accounts/[your-username]/projects/thriftloyalty/builds
```

---

## 8. Submit to Google Play Store

### Step 1: Configure Google Play Console

- [ ] Complete the **app content** section in Google Play Console:
  - [ ] **Privacy policy** — Paste `https://thriftcart.com/privacy-policy`
  - [ ] **App access** — Select "All functionality is available without special access"
        (unless testers need a loyalty account — in that case provide test credentials)
  - [ ] **Ads** — Select "No, my app does not contain ads"
  - [ ] **Content rating** — Complete the IARC questionnaire (select "Everyone")
  - [ ] **Target audience** — Select appropriate age groups (18+ is safest if unsure)
  - [ ] **News app** — Select "No"
  - [ ] **COVID-19 contact tracing / status app** — Select "No"
  - [ ] **Data safety** — Complete the form:
    - Data collected: Phone number (account management), Purchase history (app functionality)
    - Data shared: None (or specify if shared with store partners)
    - Security practices: Data encrypted in transit, users can request deletion

### Step 2: Create Store Listing

- [ ] **App name:** `ThriftLoyalty`
- [ ] **Short description:** (see Section 1)
- [ ] **Full description:** (see Section 1)
- [ ] **App icon:** 512×512 PNG (Google auto-scales from your 1024×1024)
- [ ] **Feature graphic:** 1024×500 (see Section 6)
- [ ] **Phone screenshots:** Upload 2–8 screenshots (see Section 6)
- [ ] **Tablet screenshots:** Upload if supporting tablets
- [ ] **App category:** Shopping
- [ ] **Contact email:** (your support email)
- [ ] **Privacy policy URL:** `https://thriftcart.com/privacy-policy`

### Step 3: Submit via EAS

```bash
eas submit --platform android --profile production
```

**First time setup — you'll need a Google Service Account key:**

1. Go to **Google Play Console** → **Settings** → **API access**
2. Create or link a **Google Cloud project**
3. Create a **Service Account** with "Release Manager" role
4. Download the **JSON key file**
5. When EAS prompts, provide the path to this JSON key file

**Or submit manually:**

1. Download the `.aab` file from the Expo build dashboard
2. Go to Google Play Console → your app → **Production** → **Create new release**
3. Upload the `.aab` file
4. Add release notes (e.g., "Initial release of ThriftLoyalty")
5. **Review and roll out**

### Step 4: Release Track

- [ ] Start with **Internal testing** (up to 100 testers, instant approval)
- [ ] Then **Closed testing** (limited audience, requires review)
- [ ] Then **Open testing** (public beta)
- [ ] Finally **Production** (full public release, requires Google review — typically 1–7 days for first app)

---

## 9. Submit to Apple App Store

### Step 1: Configure in App Store Connect

- [ ] Go to https://appstoreconnect.apple.com → **My Apps** → **ThriftLoyalty**
- [ ] Under **App Information:**
  - [ ] **Name:** `ThriftLoyalty`
  - [ ] **Subtitle:** `Thrift Store Loyalty Rewards`
  - [ ] **Primary category:** Shopping
  - [ ] **Secondary category:** Lifestyle
  - [ ] **Privacy policy URL:** `https://thriftcart.com/privacy-policy`
  - [ ] **Content rights:** "Does not contain third-party content"

### Step 2: Prepare for Submission (Version page)

- [ ] **Screenshots:** Upload for required device sizes (see Section 6)
- [ ] **Promotional text:** (see Section 1 — can be changed anytime without a new build)
- [ ] **Description:** (see Section 1)
- [ ] **Keywords:** (see Section 1)
- [ ] **Support URL:** (your website or support page, e.g., `https://thriftloyalty.com`)
- [ ] **Marketing URL:** (optional — `https://thriftloyalty.com`)
- [ ] **App Review Information:**
  - [ ] **Contact info:** Name, phone, email for the review team
  - [ ] **Demo account:** If reviewers need to test the app, provide:
    - A test phone number and the OTP it will receive, OR
    - Notes explaining how to sign in (Apple reviewers must be able to fully test the app)
  - [ ] **Notes:** "Sign in with any US phone number. An SMS verification code will be sent.
        For testing, you may use: [provide a test number + code if available]"

### Step 3: App Privacy (Apple)

- [ ] Complete the **App Privacy** section in App Store Connect:
  - [ ] **Phone Number** — Collected for "App Functionality" (account sign-in)
  - [ ] **Purchase History** — Collected for "App Functionality" (loyalty tracking)
  - [ ] **Product Interaction** — Collected for "App Functionality" (reward tracking)
  - [ ] Data is **not linked to identity** OR **linked to identity** (choose based on your backend)
  - [ ] Data is **not used for tracking**

### Step 4: Submit via EAS

```bash
eas submit --platform ios --profile production
```

EAS will:
1. Prompt for your **Apple ID** and **app-specific password**
   (Generate at https://appleid.apple.com → Security → App-Specific Passwords)
2. Upload the `.ipa` to App Store Connect
3. You'll see it appear in the **TestFlight** tab or **App Store** tab

**Or submit manually:**

1. Download the `.ipa` from the Expo build dashboard
2. Use **Transporter** (Mac App Store) to upload
3. Wait for processing in App Store Connect (~5–30 minutes)

### Step 5: TestFlight (Recommended before production)

- [ ] After upload, the build appears in **TestFlight** in App Store Connect
- [ ] Add **internal testers** (your team — up to 25, no review required)
- [ ] Add **external testers** (requires Beta App Review — usually < 24 hours)
- [ ] Test thoroughly on real devices
- [ ] When satisfied, go to the **App Store** tab → select the build → **Submit for Review**

### Step 6: Apple Review

- First-time apps typically take **24–48 hours** for review
- Common rejection reasons to avoid:
  - [ ] App crashes or has broken functionality
  - [ ] Login doesn't work for reviewers (always provide demo account info!)
  - [ ] Missing privacy policy
  - [ ] Misleading screenshots
  - [ ] Incomplete metadata

---

## 10. Post-Submission

### After Approval

- [ ] **Verify** the live listing on both stores
- [ ] **Download and test** the production app from the stores
- [ ] Set up **crash reporting** (consider adding `expo-updates` and Sentry/Bugsnag)
- [ ] Monitor **reviews and ratings** in both consoles

### Future Updates

To release updates:

```bash
# 1. Make code changes and commit

# 2. Build new version (version auto-increments via EAS)
eas build --platform all --profile production

# 3. Submit to stores
eas submit --platform all --profile production

# 4. For Google Play: create a new release in Production track
# 5. For Apple: select new build in App Store Connect and submit for review
```

### Over-the-Air Updates (Optional — Expo Updates)

For JS-only changes (no native code changes), you can push OTA updates:

```bash
# Install expo-updates if not already
npx expo install expo-updates

# Publish an update
eas update --branch production --message "Bug fix: ..."
```

This bypasses app store review for minor fixes and ships instantly to users.

---

## Quick Reference: All Build & Submit Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in
eas login

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production

# Check build status
eas build:list

# Manage credentials
eas credentials --platform android
eas credentials --platform ios

# OTA update (after setting up expo-updates)
eas update --branch production --message "Description of changes"
```

---

## Estimated Timeline

| Task                              | Time Estimate       |
|----------------------------------|-------------------- |
| Account setup (if not done)      | 1–2 days            |
| Icon & screenshot preparation    | 1–3 hours           |
| Privacy policy creation + hosting| 1–2 hours           |
| Store listing configuration      | 1–2 hours per store |
| Production build (EAS Cloud)     | 15–30 min per platform |
| Google Play review (first app)   | 1–7 days            |
| Apple review (first app)         | 1–2 days            |
| **Total from start to live**     | **~3–10 days**      |

---

## Troubleshooting

### Build fails with credential errors (iOS)

```bash
# Reset iOS credentials
eas credentials --platform ios
# Choose "Remove" and then rebuild — EAS will generate fresh credentials
```

### Build fails with keystore issues (Android)

```bash
# View/manage Android credentials
eas credentials --platform android
```

### App rejected by Apple

1. Read the rejection reason carefully in App Store Connect → **Resolution Center**
2. Fix the issue
3. Rebuild and resubmit (or just resubmit metadata if it was a listing issue)

### "Not yet published" on Google Play after submission

- Make sure you've completed ALL sections in the app content checklist
- Google requires 100% completion of the dashboard before review begins

---

*Last updated: April 2026*
