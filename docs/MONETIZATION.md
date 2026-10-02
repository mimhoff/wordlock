# Monetisation plan

**Principle:** the free game is complete. The daily puzzle, practice, both difficulties, the lock
pick, stats and sharing are never paywalled, and nothing bought can change a result. The daily
puzzle and the 🔒/🔑 share grid are how the game grows, so nothing gets in front of them.

## Model

| | Free | WordLock Plus (one-time purchase) |
|---|---|---|
| Daily, practice, difficulties, lock pick, stats, sharing | ✅ | ✅ |
| Banner ad (Android, below the keyboard) | shown | **removed** |
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

To do, in your accounts:
- [ ] **AdMob → Privacy & messaging:** create and publish the GDPR (and optionally US states)
      consent message for the app. Without it, players in the EEA/UK get no ads.
- [ ] **Play Console → Setup → Payments profile:** set up a merchant account (needed to sell anything).
- [ ] **Play Console → Monetize → Products → In-app products:** create a managed product, e.g.
      `wordlock_plus`, with the price and a short description.
- [ ] **Play Console → Setup → License testing:** add your test accounts so test purchases are free.
- [ ] **Play Console → App content → Data safety:** declare ads (AdMob SDK) and in-app purchases.
- [ ] **Play Console → App content → Ads:** "Yes, my app contains ads".

To do, in code (once the product exists):
- [ ] Add a billing plugin. **RevenueCat** (`@revenuecat/purchases-capacitor`) is the easiest:
      it handles receipts and restores, and covers iOS later; free up to a revenue threshold.
      The alternative is a direct Play Billing plugin with no third party, but more code.
- [ ] On start-up, restore purchases and call `setPremium()` with the result.
- [ ] Settings: a "WordLock Plus" row with the price, **Buy** and **Restore purchases**.
- [ ] Gate the extras on `isPremium()`.
- [ ] Re-check the store listing text once Plus exists ("Contains ads · In-app purchases").

## Measuring

Play Console already shows installs, uninstalls and retention. Before pricing decisions, watch for
a few weeks: daily active players, day-1/day-7 retention, and how many reach a 7-day streak.
