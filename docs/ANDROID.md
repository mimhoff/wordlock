# Android: build, test and release

WordLock's Android app is the web build (`dist/`) wrapped by Capacitor 8. The `android/` project is
generated and git-ignored, so it's created locally with `npx cap add android`.

> **Upgrading from v2:** v2 used Capacitor 6 and `webDir: www`. Don't reuse an old `android/` folder;
> generate a fresh one (below) and re-apply the two manual edits: the AdMob app ID and release signing.
> Keep using the same keystore if a build signed with it was ever uploaded to Play Console.

## Prerequisites

- Node 20+ (`nvm use` in WSL)
- Android Studio (on Windows is fine; see [Working from WSL](#working-from-wsl)), with an Android SDK and JDK 21

## One-time setup

```bash
npm install
npm run build
npx cap add android
```

Then make two manual edits in `android/`:

1. **AdMob app ID**: see [ADMOB_SETUP.md](ADMOB_SETUP.md#android). The app crashes on launch without it.
2. **Release signing**: see [Signing](#signing-release-builds).

## Everyday loop

```bash
npm run cap:android   # build web app → copy into android/ → open Android Studio
```

Press **Run** in Android Studio for a device or emulator. After changing web code, just rerun
`npm run cap:sync` and press Run again; no Gradle changes are needed.

Debug the WebView from desktop Chrome at `chrome://inspect` while the app runs on a USB-connected device.

### Testing on a phone

1. Phone: **Settings → About phone → tap Build number 7×** to enable Developer options.
2. **Developer options → USB debugging** on, connect by USB and accept the prompt.
3. The device appears in Android Studio's device picker.

Or create an emulator in **Device Manager** (a Pixel image with a recent API level works well).

### What to check on a device

- Daily and practice games, all three difficulties, sharing (should open the Android share sheet)
- Stats persist after force-closing the app (they're stored in native Preferences)
- The banner ad sits below the keyboard without covering it (use test ads: `VITE_ADMOB_TESTING=true npm run cap:sync`, see [ADMOB_SETUP.md](ADMOB_SETUP.md#test-ads))
- The hardware back button closes dialogs, then exits the app
- Vibration on key taps, which can be turned off in Settings

## Working from WSL

Gradle is much faster on the Windows filesystem than over `\\wsl$`. Either:

- **Open directly**: in Android Studio, open `\\wsl$\Ubuntu\home\mimhoff\projects\games\wordlock\android`
  (simple, slower builds), or
- **Build on Windows**: clone the repo to e.g. `C:\Users\mimhoff\wordlock`, run `npm install` and
  `npm run cap:sync` there from PowerShell, and open its `android` folder.

For a quick build without Android Studio: `cd android && ./gradlew assembleDebug`, then
`adb install app/build/outputs/apk/debug/app-debug.apk`.

## Signing release builds

Create the upload keystore once:

```bash
keytool -genkey -v -keystore wordlock-release.keystore -alias wordlock -keyalg RSA -keysize 2048 -validity 10000
```

**Back up the keystore and its passwords** (password manager + cloud storage). If you lose it you can
never publish an update. `*.keystore`, `*.jks` and `key.properties` are git-ignored.

Copy it to `android/` and create `android/key.properties`:

```properties
storePassword=...
keyPassword=...
keyAlias=wordlock
storeFile=../wordlock-release.keystore
```

In `android/app/build.gradle`, inside `android { … }`, add before `buildTypes`:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
```

and add `signingConfig signingConfigs.release` to `buildTypes { release { … } }`.

## Building a release

1. Bump `versionCode` (+1 every upload) and `versionName` in `android/app/build.gradle`.
2. Build:

   ```bash
   npm run cap:sync
   cd android && ./gradlew bundleRelease
   ```

3. Upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console.

The store listing, privacy policy, data-safety answers and the pre-launch checklist live in
[`play-store-assets/`](../play-store-assets/) (start with `DEPLOYMENT-GUIDE.md` and `PLAY-STORE-CHECKLIST.md`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Crash on launch mentioning `MobileAdsInitProvider` | AdMob app ID missing from `AndroidManifest.xml` |
| Blank white screen | Run `npm run cap:sync` (no `dist/` copied), then check `chrome://inspect` for errors |
| Changes don't appear | You edited source but didn't `npm run cap:sync` |
| Gradle sync fails | **File → Invalidate Caches / Restart**; check the JDK is 21 under **Settings → Build Tools → Gradle** |
| Device not listed | Re-plug USB, accept the debugging prompt, try another cable; `adb devices` should list it |
