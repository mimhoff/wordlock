# WordLock - Google Play Store Deployment Checklist

## 📦 Files Ready in C:\users\mimhoff\projects\

### Release Bundle
- ✅ `wordlock-release-v1.0.aab` (6.5 MB) - **Upload this to Play Store**
- ✅ `wordlock-release.keystore` - **BACKUP SAFELY! You cannot update the app without this!**

### Graphics
- ✅ `wordlock-icon-512.png` (App icon for Play Store)
- ✅ `wordlock-feature-graphic.png` (1024x500 banner)

### Documentation
- ✅ `app-description.txt` (Short and full descriptions)
- ✅ `privacy-policy.html` (Ready to host online)
- ✅ `privacy-policy.md` (Markdown version)
- ✅ `DEPLOYMENT-GUIDE.md` (Step-by-step instructions)

### Testing
- ✅ `wordlock-debug-v2.apk` (Latest debug build with storage fixes)

## 🚀 Quick Start Guide

### 1. Host Privacy Policy (Required!)

**Option A: GitHub Pages (Recommended)**
```bash
# Navigate to your repo
cd /home/mimhoff/wordlock

# Create gh-pages branch
git checkout -b gh-pages

# Copy privacy policy
cp play-store-assets/privacy-policy.html index.html

# Commit and push
git add index.html
git commit -m "Add privacy policy for Play Store"
git push origin gh-pages

# Enable GitHub Pages in repo settings
# Your privacy policy URL will be: https://mimhoff.github.io/wordlock/
```

**Option B: Quick Gist**
1. Go to https://gist.github.com
2. Create new Gist
3. Paste `privacy-policy.html` content
4. Make it public
5. Use the raw URL

### 2. Capture Screenshots (Need at least 2)

Install the debug APK and capture:
1. Main game in progress
2. Locked tile example
3. Statistics screen
4. Completed game
5. How to Play modal

### 3. Create Play Store Listing

Go to: https://play.google.com/console

#### App Details
- **App Name**: WordLock
- **Short Description**:
  ```
  Wordle with a strategic twist - locked letters add a new challenge!
  ```
- **Full Description**: Copy from `app-description.txt`

#### Graphics
- **App icon**: Upload `wordlock-icon-512.png`
- **Feature graphic**: Upload `wordlock-feature-graphic.png`
- **Screenshots**: Upload your captured screenshots (minimum 2)

#### Store Settings
- **Category**: Games > Word
- **Tags**: word game, puzzle, wordle, brain game, daily challenge
- **Content rating**: Everyone
- **Price**: Free
- **Contains ads**: Yes

#### Privacy & Legal
- **Privacy policy URL**: Your hosted URL (from step 1)
- **Email**: Your email
- **Website**: (Optional) GitHub repo or your site

### 4. Upload Release Bundle

1. Go to "Production" → "Create new release"
2. Upload `wordlock-release-v1.0.aab`
3. Release notes:
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

### 5. Data Safety Form

Required answers:

**Data Collection:**
- Yes, collects data

**Data Types:**
- Device or other IDs (for AdMob ads)
- App interactions (anonymous analytics)

**Data Usage:**
- Advertising
- App functionality

**Data Sharing:**
- Yes, shared with Google AdMob

**Data Security:**
- Data is encrypted in transit
- Users can request deletion by uninstalling app

**User Controls:**
- Users can delete data by uninstalling
- Users can opt out of personalized ads in device settings

### 6. Content Rating

Complete the questionnaire. WordLock should receive:
- **ESRB**: Everyone
- **PEGI**: 3
- **USK**: All ages

Answer "No" to questions about:
- Violence, sexual content, profanity
- User-generated content
- In-app purchases
- Social features
- Location sharing

### 7. Submit for Review

1. Verify all sections have green checkmarks
2. Click "Send for review"
3. Wait 1-7 days for approval

## ⚠️ Important Reminders

### CRITICAL - Backup Your Keystore!
- File: `wordlock-release.keystore`
- Password: WordLock2024!
- **If you lose this, you cannot update your app!**
- Store it in multiple safe locations

### Version Management
Current version:
- versionCode: 1
- versionName: "1.0"

For next update, increment these in `android/app/build.gradle`

### Privacy Policy Hosting
- Must be publicly accessible
- Must be HTTPS (not HTTP)
- Test in incognito window before submitting

## 📊 Post-Launch

### Monitor
- Play Console: Crashes, ANRs, reviews
- AdMob Console: Ad performance, revenue
- GitHub: Issues, feature requests

### Promote
- Share on Reddit: r/AndroidGaming, r/wordgames
- Tweet about it
- Post on Product Hunt
- Share with friends and family

### Updates
When you make changes:
```bash
# 1. Update version in android/app/build.gradle
versionCode 2
versionName "1.1"

# 2. Sync and rebuild
npm run copy
npx cap sync android
cd android
./gradlew bundleRelease

# 3. Upload new AAB to Play Console
```

## 📝 App Information Summary

**Application ID**: com.mimhoff.wordlock
**Package Name**: com.mimhoff.wordlock
**Version**: 1.0 (versionCode 1)
**Min SDK**: 23 (Android 6.0)
**Target SDK**: 35 (Android 15)
**Size**: ~6.5 MB (AAB), ~8.3 MB (installed)

**AdMob IDs**:
- App ID: ca-pub-5632873189325776~1491981967
- Banner Unit: ca-pub-5632873189325776/5646957190

**Signing**:
- Keystore: wordlock-release.keystore
- Alias: wordlock
- Password: WordLock2024!

## 🎯 What Makes WordLock Special?

Use this in promotional materials:
- "Wordle meets strategy"
- "Every guess constrains your future moves"
- "Think 3 moves ahead"
- "The word game that rewards planning"
- "Locked letters add a whole new dimension"

## 📧 Support & Contact

- GitHub Issues: https://github.com/mimhoff/wordlock/issues
- Ko-fi: https://ko-fi.com/mimhoff
- Email: (Your email)

## ✅ Final Pre-Submission Checklist

- [ ] Privacy policy hosted and URL tested
- [ ] At least 2 screenshots captured
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Short description (under 80 chars)
- [ ] Full description written
- [ ] AAB uploaded
- [ ] Release notes written
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] All store listing fields filled
- [ ] Keystore backed up in safe location
- [ ] Test APK works on real device

## 🎉 You're Ready!

Once you've completed the checklist above, hit "Submit for Review" and you're done!

Good luck with your launch! 🚀
