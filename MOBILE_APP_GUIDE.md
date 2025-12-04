# WordLock Mobile App Guide

Your WordLock game is now set up as both a PWA (Progressive Web App) and an Android app using Capacitor!

## What Was Done

### Phase 1: PWA Setup ✅
- ✅ Created `manifest.json` with app metadata
- ✅ Created `sw.js` (service worker) for offline functionality
- ✅ Added PWA meta tags to `index.html`
- ✅ Set up service worker registration
- ✅ Created icons directory structure

### Phase 2: Capacitor Setup ✅
- ✅ Initialized npm project (`package.json`)
- ✅ Installed Capacitor 6 (compatible with Node.js 18)
- ✅ Created `capacitor.config.json`
- ✅ Added Android platform
- ✅ Created `www/` directory for web assets

## Project Structure

```
wordlock/
├── index.html              ← Original web app files
├── game.js
├── styles.css
├── words.js
├── manifest.json           ← PWA manifest (NEW)
├── sw.js                   ← Service worker (NEW)
├── package.json            ← npm configuration (NEW)
├── capacitor.config.json   ← Capacitor config (NEW)
├── icons/                  ← App icons directory (NEW)
│   └── README.md           ← Icon requirements
├── www/                    ← Built web assets (NEW)
│   ├── index.html          ← Copied from root
│   ├── game.js
│   ├── styles.css
│   ├── words.js
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── android/                ← Android project (NEW)
│   └── app/
│       └── src/
│           └── main/
│               ├── assets/public/  ← Web files copied here
│               └── AndroidManifest.xml
└── node_modules/           ← Dependencies (NEW)
```

## Workflow: Making Changes

### For Web Development (Testing in Browser)
1. Edit files in the **root directory** (index.html, game.js, etc.)
2. Open in browser with live server or Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Visit: http://localhost:8000

### For Android Development
When you make changes to your game:

1. **Copy changes to www/**:
   ```bash
   cp index.html game.js styles.css words.js manifest.json sw.js www/
   cp -r icons www/
   ```

2. **Sync to Android project**:
   ```bash
   npm run sync
   # or
   node node_modules/@capacitor/cli/bin/capacitor sync
   ```

3. **Open in Android Studio**:
   ```bash
   npm run open:android
   # or
   node node_modules/@capacitor/cli/bin/capacitor open android
   ```

## Building the Android App

### Prerequisites

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install Android SDK

2. **Set up Android SDK** (if not done during installation):
   - Open Android Studio
   - Tools → SDK Manager
   - Install at least one Android SDK (recommend Android 13/API 33)

### Build Steps

1. **Sync your latest changes**:
   ```bash
   npm run sync
   ```

2. **Open Android Studio**:
   ```bash
   npm run open:android
   ```

3. **In Android Studio**:
   - Wait for Gradle sync to complete (first time takes 5-10 minutes)
   - Click green play button or "Run → Run 'app'"
   - Choose a device:
     - Physical device (enable USB debugging)
     - Android Emulator (create one via AVD Manager)

4. **Build APK for distribution**:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Creating a Signed Release APK

For Google Play Store or sharing with others:

1. **Generate a keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore wordlock-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias wordlock
   ```

2. **Create `android/key.properties`**:
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=wordlock
   storeFile=../wordlock-release.keystore
   ```

3. **Update `android/app/build.gradle`**:
   Add before `android {`:
   ```gradle
   def keystorePropertiesFile = rootProject.file("key.properties")
   def keystoreProperties = new Properties()
   keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   ```

   Inside `android {`, add:
   ```gradle
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile file(keystoreProperties['storeFile'])
           storePassword keystoreProperties['storePassword']
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

4. **Build release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **Find your APK**:
   `android/app/build/outputs/apk/release/app-release.apk`

## Installing Icons

You need app icons before publishing. See `icons/README.md` for details.

**Quick method with a 512x512 source image**:
```bash
npx @pwa/asset-generator logo.png ./icons --icon-only --padding "10%"
```

Then copy icons to www:
```bash
cp -r icons www/
npm run sync
```

## Testing as PWA (Without Android Studio)

Your app also works as a PWA on any device:

1. **Deploy to a web server** with HTTPS (required for PWA):
   - GitHub Pages
   - Netlify
   - Vercel
   - Your mimhoff.com domain

2. **On Android Chrome**:
   - Visit your site
   - Menu → "Add to Home Screen"
   - App installs like a native app!

3. **On iOS Safari**:
   - Visit your site
   - Share → "Add to Home Screen"

## Publishing to Google Play Store

1. **Create a Google Play Developer account** ($25 one-time fee)
   - https://play.google.com/console

2. **Prepare store listing**:
   - App name: WordLock
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2, ideally 8)
   - Feature graphic (1024x500)
   - Icon (512x512)

3. **Upload your release APK or build an App Bundle**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Upload `android/app/build/outputs/bundle/release/app-release.aab`

4. **Fill out content rating questionnaire**

5. **Set pricing** (free or paid)

6. **Submit for review** (takes 1-3 days)

## Troubleshooting

### Gradle sync fails
- Make sure Android SDK is installed
- Try: File → Sync Project with Gradle Files

### App shows blank screen
- Check Android Studio Logcat for errors
- Make sure you ran `npm run sync` after making changes
- Verify files are in `android/app/src/main/assets/public/`

### Changes not appearing
- Remember to copy files to `www/` first
- Run `npm run sync`
- Do a clean build in Android Studio: Build → Clean Project

### PWA not installing
- Make sure you're using HTTPS
- Check browser console for manifest errors
- Verify manifest.json is accessible at `/manifest.json`

## Common Commands Reference

```bash
# Sync web files to Android project
npm run sync

# Open Android Studio
npm run open:android

# Copy web files to www/
cp *.html *.js *.css www/
cp manifest.json sw.js www/
cp -r icons www/

# Start local development server
npm start  # or python3 -m http.server 8000

# Update Capacitor (future)
npm update @capacitor/core @capacitor/cli @capacitor/android
```

## Next Steps

1. **Create app icons** (see `icons/README.md`)
2. **Test on a real Android device**
3. **Deploy web version** to mimhoff.com/wordlock
4. **Test PWA installation** from your domain
5. **Build release APK** when ready
6. **Submit to Play Store** (optional)

## Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Guide**: https://developer.android.com/studio/publish
- **PWA Guide**: https://web.dev/progressive-web-apps/
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/

---

**Congratulations! Your WordLock game is now mobile-ready!** 🎉
