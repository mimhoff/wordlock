# WordLock - Google Play Store Deployment Guide

## Prerequisites Checklist

- [x] Signed release bundle (AAB) created
- [x] App icon (512x512)
- [x] Feature graphic (1024x500)
- [x] Privacy policy created
- [x] App description written
- [ ] Screenshots captured (need at least 2)
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Privacy policy hosted online (required)

## Files Ready for Upload

### Release Bundle
- **Location**: `C:\users\mimhoff\projects\wordlock-release-v1.0.aab`
- **Size**: 6.5 MB
- **Version**: 1.0 (versionCode: 1, versionName: "1.0")
- **Signed**: Yes (with wordlock-release.keystore)

### Graphics Assets
- **App Icon**: `icons/icon-512x512.png`
- **Feature Graphic**: `play-store-assets/feature-graphic.png`

### Text Assets
- **App Description**: `play-store-assets/app-description.txt`
- **Privacy Policy**: `play-store-assets/privacy-policy.md`

## Step-by-Step Deployment

### 1. Set Up Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay the one-time $25 registration fee
4. Complete the account details form

### 2. Host Privacy Policy

You need to host the privacy policy online. Options:

**Option A: GitHub Pages (Free, Recommended)**
```bash
# Create a gh-pages branch
git checkout -b gh-pages
cp play-store-assets/privacy-policy.md privacy-policy.md
git add privacy-policy.md
git commit -m "Add privacy policy"
git push origin gh-pages
```
Then enable GitHub Pages in your repo settings.
Privacy Policy URL will be: `https://mimhoff.github.io/wordlock/privacy-policy`

**Option B: GitHub Gist**
- Create a public Gist at https://gist.github.com
- Paste privacy-policy.md content
- Use the raw URL

**Option C: Your own website**
- Host the privacy-policy.md on your personal website

### 3. Capture Screenshots

You need at least 2 screenshots. Recommended: 4-8 screenshots showing:

1. **Main game board** - Show an in-progress game
2. **Locked tile example** - Highlight the lock mechanic
3. **Statistics screen** - Show stats modal
4. **Daily completion** - Show completed puzzle
5. **How to Play** - Show tutorial modal
6. **Dark mode** (optional) - If you have dark mode

**How to capture:**
- Install the debug APK on your phone
- Play through different game states
- Take screenshots (Power + Volume Down on most Android phones)
- Transfer screenshots to computer
- Recommended dimensions: 1080x1920 or similar phone aspect ratio

### 4. Create App in Play Console

1. Log into https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name**: WordLock
   - **Default language**: English (United States)
   - **App or game**: Game
   - **Free or paid**: Free
   - **Declarations**: Check the boxes confirming policies

### 5. Fill in Store Listing

Navigate to "Store presence" → "Main store listing"

**App details:**
- **App name**: WordLock
- **Short description**: (Copy from app-description.txt)
- **Full description**: (Copy from app-description.txt)

**Graphics:**
- **App icon**: Upload `icons/icon-512x512.png`
- **Feature graphic**: Upload `play-store-assets/feature-graphic.png`
- **Phone screenshots**: Upload your captured screenshots (minimum 2)

**Categorization:**
- **App category**: Games
- **Subcategory**: Word
- **Tags**: word game, puzzle, wordle, brain game, daily challenge

**Contact details:**
- **Email**: Your email address
- **Website**: (Optional) Your website or GitHub repo
- **Privacy policy URL**: Your hosted privacy policy URL

### 6. Set Up App Content

Navigate to "Policy" → "App content"

**Privacy policy:**
- Enter your hosted privacy policy URL

**Ads:**
- Select "Yes, my app contains ads"
- App uses AdMob banner ads

**Target audience:**
- Select "13+" (or "Everyone" if appropriate)
- The app doesn't specifically target children

**Content ratings:**
- Complete the questionnaire
- WordLock should get an "Everyone" or "PEGI 3" rating

**Data safety:**
- **Data collection**: Yes (for ads)
- **Data types collected**:
  - Device or other IDs (for AdMob)
  - App interactions (anonymous usage data)
- **Data sharing**: Yes (with Google AdMob)
- **Data security**: Data is encrypted in transit
- **Data deletion**: Users can delete data by uninstalling

### 7. Select Countries

Navigate to "Release" → "Production" → "Countries/regions"

- Select all countries (or specific markets)
- Or start with just a few countries for testing

### 8. Upload Release Bundle

Navigate to "Release" → "Production" → "Create new release"

1. **Upload AAB**: Upload `wordlock-release-v1.0.aab`
2. **Release name**: Version 1.0
3. **Release notes** (English):
```
Initial release of WordLock!

🔒 Features:
• Daily word puzzle with strategic locked letters
• Practice mode for unlimited play
• Beautiful animations and smooth gameplay
• Statistics tracking
• Dark mode support
• Share your results

Enjoy the strategic twist on word puzzles!
```

4. Click "Next" then "Save"

### 9. Set Up Pricing & Distribution

Navigate to "Release" → "Production" → "Pricing & distribution"

- **Price**: Free
- **Countries**: (Select from previous step)
- **Content guidelines**: Check that you comply
- **US export laws**: Check the compliance box

### 10. Complete Pre-launch Report (Optional)

Google will automatically test your app on real devices.
- Review any crashes or issues
- Fix if necessary
- Re-upload updated AAB

### 11. Submit for Review

1. Review all sections - all must have green checkmarks
2. Click "Send for review" or "Start rollout to production"
3. Wait for Google's review (usually 1-3 days, can take up to 7 days)

### 12. Monitor Release

Once approved:
- App will be live on Google Play Store
- Monitor reviews and crash reports
- Respond to user feedback

## Post-Launch Checklist

- [ ] Monitor Play Console for crashes
- [ ] Respond to user reviews
- [ ] Track download and user statistics
- [ ] Monitor AdMob revenue in AdMob console
- [ ] Plan updates based on user feedback

## Updating the App

When you make changes and want to release an update:

1. Update version in `android/app/build.gradle`:
```gradle
versionCode 2  // Increment by 1
versionName "1.1"  // New version number
```

2. Rebuild the release bundle:
```bash
cd android
./gradlew bundleRelease
```

3. Upload new AAB to Play Console in a new release
4. Add release notes describing changes
5. Submit for review

## Important Files to Keep Safe

**CRITICAL - BACKUP THESE FILES:**
- `wordlock-release.keystore` (Keystore file)
- `android/key.properties` (Keystore credentials)
- **Store these securely! You cannot update the app without them!**

**Backup location:** `C:\users\mimhoff\projects\wordlock-release.keystore`

## Troubleshooting

### Common Issues

**"Your app has a vulnerable version of..."**
- Update dependencies in `package.json`
- Run `npm install`
- Rebuild the AAB

**"The app icon doesn't meet requirements"**
- Ensure icon is exactly 512x512 pixels
- Ensure it's a PNG with transparency (if applicable)

**"Privacy policy URL not accessible"**
- Make sure your privacy policy is publicly accessible
- Test the URL in an incognito browser window

**"Screenshots don't meet requirements"**
- Minimum 2 screenshots required
- Must be PNG or JPEG
- Recommended: 1080x1920 or similar phone dimensions

### Need Help?

- Google Play Console Help: https://support.google.com/googleplay/android-developer
- Capacitor Docs: https://capacitorjs.com/docs
- AdMob Support: https://support.google.com/admob

## Marketing & Promotion

After launch, consider:
- Share on social media (Twitter, Reddit r/AndroidGaming, r/wordgames)
- Post on Product Hunt
- Create a landing page for the game
- Share on indie game forums
- Request reviews from gaming blogs
- Cross-promote on your website

## Analytics & Monitoring

**Play Console:**
- User acquisition reports
- Crash reports and ANRs
- User reviews and ratings
- Revenue (if using in-app purchases)

**AdMob Console:**
- Ad revenue
- Fill rates
- eCPM (earnings per thousand impressions)

**GitHub:**
- Track issues and feature requests
- Manage releases and changelogs

---

Good luck with your launch! 🚀
