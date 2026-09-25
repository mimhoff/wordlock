# Ads and support links

| | Where | ID | Configured in |
|---|---|---|---|
| **AdSense** auto ads | Website only (production builds) | `ca-pub-5632873189325776` | `src/config.ts` (`VITE_ADSENSE_CLIENT`) |
| **AdMob** banner | Android/iOS apps | App `ca-app-pub-5632873189325776~1491981967`, banner unit `ca-app-pub-5632873189325776/5646957190` | Unit: `src/config.ts` (`VITE_ADMOB_BANNER_ID`); app ID: native projects (below) |
| **Ko-fi** link | Stats dialog on web and Android (hidden on iOS) | `https://ko-fi.com/mimhoff` | `src/config.ts` (`VITE_KOFI_URL`) |

Any of these can be overridden per build with an env variable (e.g. in `.env.production.local`).
Setting the AdSense or Ko-fi value to an empty string turns it off.

The Ko-fi link is hidden in the iOS app because App Store rules restrict links to outside payment
for tips.

## How the AdMob banner works

`src/platform/ads.ts`, called once at startup:

1. Initializes AdMob, 2 seconds after launch so it doesn't compete with first paint (as in v2).
2. Runs Google's **UMP consent flow**. Players in the EEA/UK (GDPR) and some US states see Google's
   consent form once; elsewhere it's skipped. If consent isn't given, no ad is shown.
   v2 didn't do this, and Google requires it for EEA traffic.
3. Shows an **adaptive banner** at the bottom. Its height is written to the `--ad-height` CSS
   variable, and the layout reserves that space so the ad never covers the keyboard.

### Test ads

Never tap real ads on your own device; AdMob can suspend the account. Build with test ads:

```bash
VITE_ADMOB_TESTING=true npm run cap:sync
```

Remember to run a normal `npm run cap:sync` before building the release bundle.

### Consent message

In AdMob → **Privacy & messaging**, create and publish a GDPR message for the app (and a US state
regulations message if wanted). Until one is published, the consent step reports "not required".

## Native setup (once per generated project)

### Android

In `android/app/src/main/AndroidManifest.xml`, inside `<application>`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-5632873189325776~1491981967"/>
```

The app crashes on launch without it.

### iOS

In `ios/App/App/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-5632873189325776~1491981967</string>
```

An iOS app needs its own AdMob app registration (with its own app ID and banner unit) and the
`SKAdNetworkItems` list from Google's iOS quick-start guide.

## app-ads.txt

AdMob asks for an `app-ads.txt` at the root of the developer website listed in Play Console
(`https://mimhoff.com/app-ads.txt`):

```
google.com, pub-5632873189325776, DIRECT, f08c47fec0942fa0
```

## Play Console declarations

Answer **"Yes, my app contains ads"** under **App content → Ads**, and in the **Data safety** form
declare that the AdMob SDK collects device identifiers for advertising.
`play-store-assets/privacy-policy.*` already covers AdMob and AdSense.
