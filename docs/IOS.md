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
- [x] Code: iOS uses its own banner unit, `ADMOB_BANNER_ID_IOS` in `src/config.ts`. It's empty for now,
      and **AdMob isn't started at all on iOS until it's set**. Test builds use Google's test units.
- [ ] Put the iOS banner unit ID into `ADMOB_BANNER_ID_IOS`.
- [x] Code: **App Tracking Transparency** is asked once, after the player's first finished game
      (`requestTrackingIfNeeded()` in `src/platform/ads.ts`), so never at first launch and always after
      Google's consent form. Declining still shows (non-personalised) ads.
- [ ] In AdMob → **Privacy & messaging**, publish an **IDFA explainer** message for iOS (optional,
      shown before Apple's prompt) as well as the GDPR consent message.

## 4. The Xcode project (`npx cap add ios`)

- [x] The project exists (`ios/`, committed), made with `npx cap add ios`. Capacitor 8 uses Swift
      Package Manager, and all six plugins (AdMob, RevenueCat, app, haptics, preferences, share) support it.
- [x] `Info.plist`: tracking-prompt text, `ITSAppUsesNonExemptEncryption` = NO, portrait only, and
      Google's own ad-network ID in `SKAdNetworkItems`.
- [x] iPhone only (`TARGETED_DEVICE_FAMILY = 1`), so no iPad screenshots or layout testing.
- [x] App icon: the grid at 1024×1024, no transparency (iOS rounds the corners itself).
- [x] Launch screen: the white padlock on crimson `#B3203A`, matching Android's splash.
- [ ] **Replace the placeholder `GADApplicationIdentifier`** in `ios/App/App/Info.plist`. It's Google's
      public sample ID (test ads only) until WordLock's iOS app exists in AdMob.
- [ ] Optionally extend `SKAdNetworkItems` with the third-party list from AdMob's iOS guide.

After changing web code, `npx cap sync ios` copies the build into the project (CI does this).

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
