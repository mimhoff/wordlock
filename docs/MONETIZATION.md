# Monetisation plan

**Principle:** the free game is complete. The daily puzzle, practice, both difficulties, the lock
pick, stats and sharing are never paywalled, and nothing bought can change a result. The daily
puzzle and the 🔒/🔑 share grid are how the game grows, so nothing gets in front of them.

## Model

| | Free | WordLock Plus (one-time purchase) |
|---|---|---|
| Daily, practice, difficulties, lock pick, stats, sharing | ✅ | ✅ |
| Banner ad (Android, below the keyboard) | shown | **removed** |
| **Expert** difficulty: start from a given word whose row-2 lock carries a yellow letter; no lock pick | — | ✅ |
| Extras (e.g. the Heist / Dig / Frozen themes, a puzzle archive) | — | ✅ |

- **Price:** around $2.99–$4.99, one-time. No subscription.
- **No full-screen interstitial ads**, ever.
- **Rewarded ads**, if any, only in Practice and never for lock picks or anything that appears in a
  shared result.
- **Web** keeps AdSense and the Ko-fi link; purchases are Android (and later iOS) only.

## Where things stand

Done:
- [x] AdMob banner with Google's consent flow (`src/platform/ads.ts`)
- [x] `app-ads.txt` live at https://mimhoff.com/app-ads.txt
- [x] Ko-fi shown on the website only: app stores require their own billing for payments in apps
- [x] A single premium switch, `isPremium()` / `setPremium()` in `src/platform/entitlements.ts`.
      The banner already respects it, and buying removes a banner that's showing.
- [x] Expert difficulty, gated by `plusUnlocked()`. Unlocked on the dev server and in preview test
      builds (`WORDLOCK_PLUS_PREVIEW=1 npm run android:windows`); never in normal website or release
      builds. Don't upload a preview build to production.

To do, in your accounts:
- [ ] **AdMob → Privacy & messaging:** create and publish the GDPR (and optionally US states)
      consent message for the app. Without it, players in the EEA/UK get no ads.
- [ ] **Play Console → Setup → Payments profile:** set up a merchant account (needed to sell anything).
- [ ] **Play Console → Monetize → Products → In-app products:** create a managed product, e.g.
      `wordlock_plus`, with the price and a short description.
- [ ] **Play Console → Setup → License testing:** add your test accounts so test purchases are free.
- [ ] **Play Console → App content → Data safety:** declare ads (AdMob SDK) and in-app purchases.
- [ ] **Play Console → App content → Ads:** "Yes, my app contains ads".

Done in code (RevenueCat, `@revenuecat/purchases-capacitor`):
- [x] `src/platform/billing.ts`: configures RevenueCat in the native app, restores the player's Plus
      status on start-up, and keeps `isPremium()` in sync with the store.
- [x] Settings → **WordLock Plus**: the store price, **Get Plus** and **Restore purchase**; a thank-you
      once bought. Hidden on the website and until a RevenueCat key is configured.
- [x] Privacy policy mentions RevenueCat (re-publish the hosted copy).

To do in RevenueCat (https://app.revenuecat.com), after the Play Console product exists:
- [ ] Create a project and add the **Android app** (package `com.mimhoff.wordlock`).
- [ ] Connect it to Play Console with a **service account JSON key** (RevenueCat's docs walk through
      creating it in Google Cloud and granting it access in Play Console → Users and permissions).
- [ ] **Entitlement** `plus` (the ID the app checks), with the `wordlock_plus` product attached.
- [ ] **Offering** `default` (current), with one package containing `wordlock_plus`.
- [ ] Copy the Android **public SDK key** (starts `goog_`) into `src/config.ts` as the default for
      `REVENUECAT_ANDROID_KEY` (it's safe to commit), or set `VITE_REVENUECAT_ANDROID_KEY`.
- [ ] Test with a licence-tester account: buy, uninstall, reinstall, **Restore purchase**.
- [ ] Re-check the store listing ("Contains ads · In-app purchases") and the Data safety form.

## Measuring

Play Console already shows installs, uninstalls and retention. Before pricing decisions, watch for
a few weeks: daily active players, day-1/day-7 retention, and how many reach a 7-day streak.
