# WordLock - Google Play Store Deployment Guide

Complete guide to publishing your WordLock game to the Google Play Store.

## 📋 Prerequisites

- ✅ Working Android APK (you have this!)
- ✅ Google Play Developer Account ($25 one-time fee)
- ✅ Privacy Policy URL
- ✅ App screenshots and graphics
- ✅ App icon (already have in icons folder)

---

## 💳 Step 1: Create Google Play Developer Account

### Sign Up

1. Go to: https://play.google.com/console/signup
2. Sign in with your Google account
3. Pay **$25 one-time registration fee**
4. Complete account details:
   - Developer name (will be public)
   - Email address
   - Phone number
5. Accept Developer Distribution Agreement
6. Complete identity verification

**⏱️ Account approval:** Usually instant, can take up to 48 hours

---

## 🔐 Step 2: Generate Signing Key

Your app needs to be signed with a release key for Play Store.

### Create Keystore (CRITICAL - DO THIS CAREFULLY!)

```bash
cd ~/wordlock

# Generate keystore
keytool -genkey -v -keystore wordlock-release.keystore \
  -alias wordlock \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**You'll be asked for:**
1. **Keystore password:** (create a strong password)
2. **Key password:** (can be same as keystore password)
3. **First and last name:** Your name
4. **Organizational unit:** (can skip with "Unknown")
5. **Organization:** Your company/name
6. **City/Locality:** Your city
7. **State/Province:** Your state
8. **Country code:** Your country (e.g., AU)

### 🚨 EXTREMELY IMPORTANT

**SAVE THIS KEYSTORE AND PASSWORDS!**

- Store `wordlock-release.keystore` in a safe place
- Back it up to cloud storage (Google Drive, Dropbox)
- Write down passwords in a password manager
- **If you lose this, you can NEVER update your app!**

**Backup commands:**
```bash
# Backup to Windows
cp wordlock-release.keystore /mnt/c/Users/mimhoff/Desktop/

# Backup keystore info to text file
cat > keystore-info.txt << EOF
Keystore: wordlock-release.keystore
Alias: wordlock
Keystore Password: [YOUR_PASSWORD]
Key Password: [YOUR_PASSWORD]
Created: $(date)
EOF
```

---

## ⚙️ Step 3: Configure Gradle for Signing

### A. Store Keystore in Project

```bash
# Copy keystore to android folder
cp wordlock-release.keystore android/
```

### B. Create Signing Configuration

Edit: `android/key.properties` (create this file)

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=wordlock
storeFile=wordlock-release.keystore
```

**⚠️ Add to .gitignore immediately!**
```bash
echo "android/key.properties" >> .gitignore
echo "android/wordlock-release.keystore" >> .gitignore
```

### C. Update build.gradle

Edit: `android/app/build.gradle`

Find the `android {` section and add **BEFORE** `buildTypes`:

```gradle
android {
    namespace "com.mimhoff.wordlock"
    compileSdkVersion rootProject.ext.compileSdkVersion

    // ... other config ...

    // ADD THIS SECTION:
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

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release  // ADD THIS LINE
        }
    }
}
```

---

## 📦 Step 4: Build Release Bundle (AAB)

Google Play requires **Android App Bundle** (AAB) format, not APK.

### Update Version

Edit: `android/app/build.gradle`

Find `versionCode` and `versionName`:

```gradle
defaultConfig {
    applicationId "com.mimhoff.wordlock"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1          // Increment for each release
    versionName "1.0"      // User-facing version
}
```

### Build Release Bundle

```bash
cd ~/wordlock

# Make sure latest code is in www
cp -r js www/
cp index.html styles.css words.js manifest.json sw.js www/

# Sync Capacitor
npx cap sync android

# Build release bundle
cd android
./gradlew bundleRelease
```

**Build time:** 5-15 minutes

**Output location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Verify Bundle

```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

Should be around 4-5 MB.

---

## 🎨 Step 5: Prepare App Assets

### A. App Icon

You already have icons in `icons/` folder! Make sure you have:
- 512x512 hi-res icon (required for Play Store)

If you need to create one:
```bash
# Use your existing icon or create 512x512 version
# Tool: https://icon.kitchen/
```

### B. Feature Graphic (Required)

Create a **1024x500px** banner image for Play Store listing.

**Tools:**
- Canva: https://canva.com/
- Figma: https://figma.com/
- Photopea: https://photopea.com/ (free Photoshop alternative)

**Tips:**
- Include game name "WordLock"
- Show screenshot or game elements
- Use your app's colors (greens, yellows, reds from Wordle)
- Keep it simple and readable

### C. Screenshots (Required - at least 2)

You need screenshots from an Android device/emulator.

**How to capture:**
1. Install app on device/emulator
2. Play the game
3. Take screenshots (Power + Volume Down on most Android devices)

**Required screenshots:**
- Main game board
- How to Play screen
- Statistics screen
- Example of gameplay with colors

**Dimensions:** Minimum 320px, maximum 3840px

**Upload to your computer:**
```bash
# If using adb
adb pull /sdcard/DCIM/Screenshots/screenshot1.png ~/wordlock/screenshots/
```

### D. Privacy Policy (REQUIRED!)

You MUST host a privacy policy. Simple options:

**Option 1: GitHub Pages (Free)**
1. Create `PRIVACY_POLICY.md` in your repo
2. Enable GitHub Pages in repo settings
3. URL will be: `https://yourusername.github.io/wordlock/PRIVACY_POLICY`

**Option 2: Google Sites (Free)**
1. Go to https://sites.google.com/
2. Create new site
3. Add privacy policy text
4. Publish and copy URL

**Sample Privacy Policy:**
```markdown
# Privacy Policy for WordLock

Last updated: [DATE]

## Information Collection
WordLock does not collect, store, or share any personal information.

## Local Storage
The app stores game statistics and preferences locally on your device.
This data never leaves your device.

## Advertisements
This app displays ads provided by Google AdMob.
AdMob may collect and use data to personalize ads.
See Google's privacy policy: https://policies.google.com/privacy

## Changes to Policy
We may update this policy from time to time.
Updates will be posted on this page.

## Contact
Email: your.email@example.com
```

---

## 🚀 Step 6: Create Play Store Listing

### Access Play Console

1. Go to: https://play.google.com/console/
2. Click **"Create app"**

### App Details

**App name:** WordLock

**Default language:** English (US)

**App or game:** Game

**Free or paid:** Free

**Declarations:**
- [ ] I confirm this app complies with Google Play policies
- [ ] I confirm this app complies with US export laws

Click **"Create app"**

### Dashboard Tasks

You'll see a checklist. Complete each section:

---

#### 1. Store Settings → App Details

**App name:** WordLock

**Short description (80 chars):**
```
WordLock - Wordle with a strategic twist! Locked letters add planning to every guess.
```

**Full description (4000 chars max):**
```
WordLock: The Word Game That Challenges Your Strategy!

Love Wordle? You'll love WordLock even more! This isn't just another word guessing game - it adds a unique strategic twist that will make you plan every guess carefully.

🎮 HOW TO PLAY
• Guess the 5-letter word in 8 tries
• After each guess, tiles change color:
  - Green: Correct letter, right position
  - Yellow: Correct letter, wrong position
  - Gray: Letter not in word

🔒 THE WORDLOCK TWIST
Starting from row 2, one random position locks to your previous guess!
You MUST use the same letter in that position, adding strategic depth.
Plan ahead - your early guesses constrain your later options!

✨ FEATURES
• Daily Challenge - New puzzle every day
• Practice Mode - Unlimited games
• Statistics - Track your progress and streaks
• Share Results - Show off your wins
• Light & Dark Themes
• Smooth animations
• Offline play

🎯 PERFECT FOR
• Wordle fans looking for more challenge
• Strategy game enthusiasts
• Word puzzle lovers
• Daily brain training
• Quick 5-minute games

🏆 CHALLENGE YOURSELF
Can you master the lock mechanic? Every guess matters when future letters are constrained.
Test your vocabulary and strategic thinking!

Download WordLock now and experience the evolution of word guessing games!

Free to play with optional ads. No account required.
```

**App icon:** Upload your 512x512 icon

**Feature graphic:** Upload your 1024x500 banner

**Phone screenshots:** Upload 2-8 screenshots

**Category:**
- Application type: Games
- Category: Word
- Tags: Puzzle, Word, Strategy

---

#### 2. Store Settings → App Content

**Privacy policy:** Paste your privacy policy URL

**App access:**
- Select: "All functionality is available without restrictions"

**Ads:**
- Select: "Yes, my app contains ads" (if you added AdMob)
- Or: "No, my app doesn't contain ads" (if not yet added)

**Content ratings:**
- Click "Start questionnaire"
- Select: Utility, Productivity, or Communication tools
- Answer "No" to violence, sexual content, etc.
- Submit for rating (usually E for Everyone)

**Target audience:**
- Select: 13 and over (or 3+ if truly for all ages)
- Click Save

**News app:** No

**COVID-19 contact tracing:** No

**Data safety:**
- Click "Start"
- "Does your app collect or share user data?" → No
- (Since you're not collecting data - local storage only)
- Save

---

#### 3. Production → Countries/regions

**Select countries:**
- Click "Add countries"
- Select all countries (or specific regions)
- Click "Add"

---

#### 4. Production → Release

**Create new release:**
- Click "Create new release"

**App signing by Google Play:**
- Accept (recommended - Google manages your signing key)
- Or upload your own signing key

**Upload app bundle:**
- Click "Upload"
- Select: `android/app/build/outputs/bundle/release/app-release.aab`
- Wait for upload and processing (2-5 minutes)

**Release name:** 1.0 (Beta) or 1.0

**Release notes:**
```
🎉 Welcome to WordLock v1.0!

• Unique locked letter mechanic
• Daily and practice modes
• Statistics tracking
• Beautiful animations
• Light and dark themes

Thanks for playing!
```

**Review release** → **Save** (don't submit yet!)

---

## ✅ Step 7: Pre-Launch Checklist

Before submitting for review:

- [ ] App builds and runs on physical device
- [ ] All animations work smoothly
- [ ] Daily and Practice modes work
- [ ] Statistics save and load correctly
- [ ] Share functionality works
- [ ] Ads display correctly (if added)
- [ ] Privacy policy URL is live and accessible
- [ ] App icon looks good
- [ ] Screenshots are clear and representative
- [ ] App description is compelling and accurate
- [ ] Version numbers are correct
- [ ] Signing key is backed up safely
- [ ] No crashes or major bugs

---

## 🎯 Step 8: Submit for Review

### Production Track

1. In Play Console → Production → Releases
2. Click "Edit release" on your draft release
3. Review all information
4. Click **"Review release"**
5. Check everything one more time
6. Click **"Start rollout to Production"**

### Review Process

**Timeline:**
- Initial review: Usually 1-7 days
- Average: 2-3 days
- Can be as quick as a few hours

**Status checks:**
- Check Play Console dashboard for status
- You'll get email updates

**Possible outcomes:**
1. ✅ **Approved** - Your app is live!
2. ⚠️ **Changes requested** - Fix issues and resubmit
3. ❌ **Rejected** - Review rejection reason and appeal or fix

---

## 📈 Step 9: After Approval

### Your App is Live!

**Play Store URL:**
```
https://play.google.com/store/apps/details?id=com.mimhoff.wordlock
```

### Monitor Performance

**Play Console → Statistics:**
- Installs
- Uninstalls
- Ratings
- Reviews
- Crashes

**AdMob Console:**
- Ad impressions
- Revenue
- eCPM

### Respond to Reviews

- Reply to user reviews
- Address bugs and feature requests
- Build community

---

## 🔄 Updating Your App

When you make changes:

### 1. Update Version

Edit `android/app/build.gradle`:
```gradle
versionCode 2        // Increment by 1
versionName "1.1"    // Update version
```

### 2. Build New Bundle

```bash
cp -r js www/
npx cap sync android
cd android
./gradlew bundleRelease
```

### 3. Upload to Play Console

1. Production → Releases → Create new release
2. Upload new AAB
3. Add release notes
4. Submit for review

**Update review:** Usually faster than initial (hours to 1 day)

---

## 💰 Monetization

### AdMob Revenue

- Set up payment info in AdMob
- Threshold: $100 minimum for payout
- Payment methods: Wire transfer, PayPal, etc.

### Paid Version

- Create "WordLock Pro" - no ads, extra features
- Price: $0.99 - $2.99
- Use in-app purchase to remove ads from free version

### In-App Purchases

- Hints system
- Extra daily puzzles
- Premium themes
- Statistics insights

---

## 🛡️ App Maintenance

### Required Updates

- **Annual:** Google requires apps to target recent Android API
- **Security:** Update dependencies for vulnerabilities
- **Bugs:** Fix crashes reported in Play Console
- **Features:** Add user-requested features

### Communication

- Update app description with new features
- Respond to reviews within 24-48 hours
- Announce updates on social media
- Create developer website/blog

---

## 🚨 Troubleshooting

### "Upload failed: Invalid signature"
**Solution:** Rebuild bundle with correct signing configuration

### "App not compliant with policy"
**Solution:** Read policy violation email, fix issues, resubmit

### "Privacy policy not accessible"
**Solution:** Verify URL works in incognito browser window

### "Screenshots don't meet requirements"
**Solution:** Ensure minimum 2 screenshots, correct dimensions

### "Content rating needed"
**Solution:** Complete content rating questionnaire in App Content

---

## 📚 Resources

- **Play Console:** https://play.google.com/console
- **Developer Policies:** https://play.google.com/about/developer-content-policy/
- **Play Academy:** https://playacademy.exceedlms.com/student/catalog
- **Support:** https://support.google.com/googleplay/android-developer

---

## 🎯 Quick Commands Summary

```bash
# Create keystore (once)
keytool -genkey -v -keystore wordlock-release.keystore -alias wordlock -keyalg RSA -keysize 2048 -validity 10000

# Build release bundle
cp -r js www/
npx cap sync android
cd android
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## ✨ Congratulations!

You're ready to publish WordLock to the Play Store!

**Timeline:**
- Account setup: 5-10 minutes
- Keystore & signing: 10-15 minutes
- Bundle build: 10-20 minutes
- Play Console setup: 30-60 minutes
- Review wait: 1-7 days
- **Total: About 1-2 hours of work + review time**

Good luck with your launch! 🚀📱
