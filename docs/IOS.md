# iOS release checklist

WordLock's iOS app is the same web build wrapped by Capacitor, like Android. Building needs macOS
(Xcode), but **you don't need to own a Mac**: a cloud build service builds, signs and uploads to
TestFlight. Recommended route: **Codemagic + TestFlight on your own iPhone**.

Bundle ID: `com.mimhoff.wordlock` (same as Android's package name).

## 1. Accounts (start early: enrolment can take a few days)

- [ ] Join the **Apple Developer Program** (US$99/year) at https://developer.apple.com/programs/.
- [ ] In **App Store Connect → Apps**, create the app record: name "WordLock", bundle ID
      `com.mimhoff.wordlock`, primary language, SKU (e.g. `wordlock`).
- [ ] **App Store Connect → Users and Access → Integrations → App Store Connect API**: create an API
      key (role: App Manager). Codemagic uses it for signing and uploads; keep the `.p8` file safe.
- [ ] **Agreements, Tax, and Banking**: accept the Paid Apps agreement and add bank/tax details
      (needed before in-app purchases can be sold).

## 2. In-app purchase (WordLock Plus)

- [ ] **App Store Connect → your app → Monetization → In-App Purchases**: create a **Non-Consumable**
      with product ID `wordlock_plus` (same as Android), price tier, display name and description.
- [ ] **RevenueCat**: add an **iOS app** to the existing project; upload an **In-App Purchase key**
      (App Store Connect → Users and Access → Integrations → In-App Purchase).
- [ ] In RevenueCat, attach the iOS `wordlock_plus` product to the **`plus` entitlement** and the
      **`default` offering** (alongside the Android one).
- [ ] Put the iOS **public SDK key** (starts `appl_`) into `src/config.ts` as `REVENUECAT_IOS_KEY`.

## 3. Ads (AdMob)

- [ ] In AdMob, add an **iOS app** (it gets its own app ID `ca-app-pub-…~…`) and an iOS **banner
      ad unit**.
- [ ] **Code change**: use the iOS banner unit on iOS (today `ADMOB_BANNER_ID` in `src/config.ts` is
      the Android one), e.g. an `ADMOB_BANNER_ID_IOS`.
- [ ] **Code change**: ask for **App Tracking Transparency** permission on iOS before loading ads
      (`AdMob.trackingAuthorizationStatus()` / `requestTrackingAuthorization()` in
      `src/platform/ads.ts`). Without it, ads are non-personalised and earn less. Ask once, after the
      consent form, never at first launch before the player has seen the game.
- [ ] In AdMob → **Privacy & messaging**, publish an **IDFA explainer** message for iOS (optional,
      shown before Apple's prompt) as well as the GDPR consent message.

## 4. The Xcode project (`npx cap add ios`)

Run `npm install @capacitor/ios && npx cap add ios`. Capacitor 8 sets new iOS projects up with Swift
Package Manager; if a plugin (e.g. AdMob) fails to resolve, recreate with CocoaPods instead
(`npx cap add ios --packagemanager CocoaPods`, which needs CocoaPods on the build machine).
Then, in `ios/App/App/Info.plist`:

- [ ] `GADApplicationIdentifier`: the iOS AdMob app ID.
- [ ] `SKAdNetworkItems`: Google's list of ad-network IDs (from AdMob's iOS quick-start guide).
- [ ] `NSUserTrackingUsageDescription`: e.g. "Lets WordLock show you more relevant ads. The game
      works the same either way."
- [ ] `ITSAppUsesNonExemptEncryption` = `NO`, so each upload skips the export-compliance question.
- [ ] Portrait only (`UISupportedInterfaceOrientations`), and iPhone only unless you want to
      support iPad (iPad needs its own screenshots and layout checks).

Assets:
- [ ] **App icon**: one 1024×1024 PNG, **no transparency**: the grid, rendered from
      `scripts/icons/icon-grid.html` (same as `public/icons/icon-512x512.png`, at 1024).
      iOS rounds the corners itself.
- [ ] **Launch screen**: crimson `#B3203A` with the white padlock, to match Android's splash
      (`LaunchScreen.storyboard`: background colour plus a centred padlock image).

Commit the `ios/` folder (unlike `android/`, nothing in it is secret), or regenerate it in CI.

## 5. Cloud builds with Codemagic

- [ ] Sign up at https://codemagic.io with GitHub and add the `wordlock` repo.
- [ ] Add the App Store Connect API key under **Team integrations → Developer Portal**, and enable
      **automatic code signing** for `com.mimhoff.wordlock`.
- [ ] Add a `codemagic.yaml` workflow: `npm ci` → `npm test` → `npm run build` → `npx cap sync ios`
      → build the IPA → publish to **TestFlight**. (I can write this file when you're ready.)
- [ ] Each upload needs a higher build number: let Codemagic set it from the build counter.

## 6. Testing on your iPhone (TestFlight)

- [ ] Install **TestFlight** from the App Store, and add yourself as an internal tester.
- [ ] Check: daily and practice, the lock pick, sharing (iOS share sheet), haptics, dark mode,
      the notch and home-indicator spacing, offline play, stats surviving an app restart.
- [ ] Ads: Apple's tracking prompt appears once and the banner sits below the keyboard (use test ads:
      `VITE_ADMOB_TESTING=true`).
- [ ] Purchases with a **Sandbox** tester (App Store Connect → Users and Access → Sandbox): buy,
      delete the app, reinstall, **Restore purchase**.
- [ ] The Ko-fi link must **not** appear (it's website-only already).

## 7. App Store listing

- [ ] **Screenshots** for the largest iPhone size App Store Connect asks for (currently 6.9-inch).
      They can be generated like the Play Store set, at the iPhone resolution.
- [ ] Description, keywords, promotional text; **support URL** and **privacy policy URL**
      (re-publish `play-store-assets/privacy-policy.html` with the RevenueCat section).
- [ ] **App Privacy** ("nutrition label"): Identifiers (for third-party advertising, if tracking is
      allowed), Usage Data (advertising), Purchases (RevenueCat). No account, no name or email.
- [ ] Age rating questionnaire; price **Free**, with in-app purchases.
- [ ] **App Review notes**: explain the lock mechanic in a sentence, and that the name, art, word
      lists and rules are original. Apple has rejected Wordle look-alikes under its copycat/spam
      guidelines, so lead with what's different, not with "like Wordle".

## 8. Submit

- [ ] Submit a TestFlight build for **App Review** with the in-app purchase attached (the first IAP
      is reviewed together with the app).
- [ ] After approval: release manually or automatically, then watch crashes and reviews in App
      Store Connect.
