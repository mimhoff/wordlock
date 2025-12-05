# WordLock - Android Deployment Guide

Your app is now ready for Android! Here's what I've done and your next steps.

## ✅ What's Been Done

1. **Copied all updated files to `www/` folder**
   - Modular JavaScript structure (js/ folder)
   - All animations included
   - Latest styles and fixes

2. **Synced with Capacitor**
   - Web assets copied to Android project
   - Configuration updated
   - Ready to build!

---

## 🚀 Next Steps - Deploy to Android

### Method 1: Build and Test with Android Studio (Recommended)

**Step 1: Open in Android Studio**
```bash
npx cap open android
```

This will:
- Launch Android Studio
- Open your WordLock Android project
- Allow you to use Android Studio's full build/debug tools

**Step 2: In Android Studio**
1. Wait for Gradle sync to complete (bottom status bar)
2. Connect your Android device via USB **OR** start an emulator
   - For physical device: Enable USB debugging in Developer Options
   - For emulator: Tools → Device Manager → Create/Start device

**Step 3: Run the App**
- Click the green "Run" button (▶) in toolbar
- Or press Shift+F10
- Select your device/emulator
- App will install and launch!

---

### Method 2: Build from Command Line (Faster for testing)

**Requirements:**
- Android device connected with USB debugging enabled
- OR Android emulator running

**Commands:**
```bash
# Build and run in one step
npx cap run android

# Or manually:
cd android
./gradlew assembleDebug
./gradlew installDebug
```

---

### Method 3: Generate APK for Distribution

**Debug APK (for testing):**
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (for distribution):**
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Install APK on device:**
```bash
# Transfer to phone and install
# OR use adb:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔧 Troubleshooting

### Issue: "Android SDK not found"
**Solution:**
1. Install Android Studio: https://developer.android.com/studio
2. Open Android Studio
3. Tools → SDK Manager → Install Android SDK Platform 33+
4. Set ANDROID_HOME environment variable

### Issue: "Gradle build failed"
**Solution:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

### Issue: "Device not detected"
**Solution:**
- **Physical device:**
  1. Enable Developer Options (Settings → About → Tap "Build number" 7 times)
  2. Enable USB Debugging in Developer Options
  3. Reconnect device
  4. Accept "Allow USB debugging" prompt

- **Emulator:**
  1. Android Studio → Tools → Device Manager
  2. Create Virtual Device
  3. Download system image if needed
  4. Start emulator

### Issue: "App crashes on launch"
**Solution:**
1. Check logcat in Android Studio (View → Tool Windows → Logcat)
2. Look for JavaScript errors
3. Verify all files synced: `npx cap sync android`

### Issue: "White screen / blank app"
**Solution:**
1. Open Chrome on your computer
2. Navigate to: `chrome://inspect`
3. Connect device
4. Click "inspect" under your app
5. Check JavaScript console for errors

---

## 📱 Testing Your App

### What to Test:
- ✅ Game board displays correctly
- ✅ Can type letters
- ✅ Can submit guesses
- ✅ Animations work smoothly
  - Tile flip animations
  - Shake animation on invalid words
  - Bounce animation on win
  - Gold/silver lock corner animation
- ✅ Lock mechanic works
- ✅ Daily and Practice modes switch correctly
- ✅ Statistics save and display
- ✅ Share button works
- ✅ Modals open/close properly
- ✅ Theme toggle works

### Performance Check:
- Animations should be 60fps
- No lag when typing
- Fast tile flips
- Smooth transitions

---

## 🎨 Customizing Your App

### Change App Icon
1. Generate icons: https://icon.kitchen/
2. Replace files in `android/app/src/main/res/` folders
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Change App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">WordLock</string>
```

### Change App ID
Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourname.wordlock"
}
```
Then sync: `npx cap sync android`

---

## 📦 Publishing to Google Play Store

### Step 1: Generate Signed APK/AAB

**Create keystore (first time only):**
```bash
keytool -genkey -v -keystore wordlock.keystore -alias wordlock -keyalg RSA -keysize 2048 -validity 10000
```
**IMPORTANT:** Keep this keystore file safe! You'll need it for all future updates.

**Configure signing in `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../wordlock.keystore")
            storePassword "YOUR_PASSWORD"
            keyAlias "wordlock"
            keyPassword "YOUR_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

**Build release bundle:**
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 2: Upload to Play Console
1. Go to: https://play.google.com/console
2. Create app (one-time $25 fee)
3. Fill in app details
4. Upload AAB file
5. Complete all required sections
6. Submit for review

---

## 🔄 Future Updates

**When you make changes to the web app:**

```bash
# 1. Copy files to www
cp index.html styles.css words.js manifest.json sw.js www/
cp -r js www/

# 2. Sync with Capacitor
npx cap sync android

# 3. Rebuild
cd android
./gradlew assembleDebug

# 4. Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Or just:**
```bash
npx cap copy android && npx cap run android
```

---

## 🐛 Debug Mode

**Enable Chrome DevTools for your app:**
1. Run app on device
2. Open Chrome: `chrome://inspect`
3. Click "inspect" under WordLock
4. Full JavaScript debugging available!

**Enable Capacitor logs:**
Edit `capacitor.config.json`:
```json
{
  "appId": "com.mimhoff.wordlock",
  "appName": "WordLock",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  }
}
```

---

## 📊 Your Current Setup

- ✅ Capacitor configured
- ✅ Android project initialized
- ✅ All files synced to Android
- ✅ Ready to build!

**App Details:**
- **App ID:** com.mimhoff.wordlock
- **App Name:** WordLock
- **Web Directory:** www/
- **Platform:** Android

---

## 🎯 Quick Start Commands

```bash
# Open in Android Studio (recommended)
npx cap open android

# Or run directly (if device connected)
npx cap run android

# Or build APK
cd android
./gradlew assembleDebug
```

---

## 📚 Additional Resources

- **Capacitor Docs:** https://capacitorjs.com/docs/android
- **Android Studio:** https://developer.android.com/studio
- **Play Console:** https://play.google.com/console
- **Icon Generator:** https://icon.kitchen/

---

## ✨ Your App Features (Android)

All features from the web app work perfectly on Android:
- 🎮 Full game functionality
- 🎨 Smooth animations (60fps)
- 🔒 Unique lock mechanic
- 📊 Statistics tracking
- 🌓 Light/dark theme
- 📱 Responsive design
- ✅ Daily and practice modes
- 🎯 Share results
- 💾 Offline capable (PWA features)

Good luck with your Android deployment! 🚀
