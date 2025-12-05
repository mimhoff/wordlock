# WordLock - AdMob Banner Ads Setup

This guide will help you add non-intrusive banner ads to your WordLock game using Google AdMob.

## 📋 Prerequisites

1. **Google AdMob Account** (free)
   - Sign up at: https://admob.google.com/
   - Create an AdMob account (uses your Google account)

2. **AdMob App Setup**
   - Create a new app in AdMob console
   - Get your App ID
   - Create ad units (banner ads)

---

## 🎯 Step 1: Set Up AdMob Account

### Create AdMob Account & App

1. Go to https://admob.google.com/
2. Sign in with your Google account
3. Click **"Apps"** → **"Add App"**
4. Select **"Android"**
5. Enter app name: **"WordLock"**
6. Choose **"No"** for "Is your app listed on Google Play?" (for now)
7. Click **"Add"**

You'll get an **App ID** like: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

**SAVE THIS APP ID!** You'll need it.

### Create Banner Ad Unit

1. In your app, click **"Ad units"** → **"Add ad unit"**
2. Select **"Banner"**
3. Ad unit name: **"WordLock Banner"**
4. Click **"Create ad unit"**

You'll get an **Ad Unit ID** like: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

**SAVE THIS AD UNIT ID!**

---

## 🔧 Step 2: Install AdMob Plugin

```bash
# Install Capacitor AdMob plugin
npm install @capacitor-community/admob

# Sync with Android
npx cap sync android
```

---

## ⚙️ Step 3: Configure AdMob

### A. Update AndroidManifest.xml

Edit: `android/app/src/main/AndroidManifest.xml`

Add inside the `<application>` tag:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

Replace with your actual App ID!

### B. Add AdMob to capacitor.config.json

Edit: `capacitor.config.json`

```json
{
  "appId": "com.mimhoff.wordlock",
  "appName": "WordLock",
  "webDir": "www",
  "plugins": {
    "AdMob": {
      "appId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
      "testingDevices": ["YOUR_DEVICE_ID_FOR_TESTING"]
    }
  }
}
```

---

## 📱 Step 4: Add Banner Ad to Your App

### A. Create AdMob Module

Create: `js/admob.js`

```javascript
/**
 * AdMob Module
 * Handles banner ad display
 */

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdManager {
    constructor() {
        this.isInitialized = false;
        this.bannerShown = false;

        // Replace with your actual ad unit IDs
        this.adUnitIds = {
            banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your ad unit ID
            // For testing, use test ad unit:
            // banner: 'ca-app-pub-3940256099942544/6300978111' // Google test ad
        };
    }

    /**
     * Initialize AdMob
     */
    async initialize() {
        try {
            await AdMob.initialize({
                requestTrackingAuthorization: false,
                initializeForTesting: false, // Set to true during development
            });

            this.isInitialized = true;
            console.log('AdMob initialized successfully');
        } catch (error) {
            console.error('AdMob initialization failed:', error);
        }
    }

    /**
     * Show banner ad at bottom of screen
     */
    async showBanner() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            await AdMob.showBanner({
                adId: this.adUnitIds.banner,
                adSize: BannerAdSize.BANNER, // Standard 320x50
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
            });

            this.bannerShown = true;
            console.log('Banner ad shown');
        } catch (error) {
            console.error('Failed to show banner:', error);
        }
    }

    /**
     * Hide banner ad
     */
    async hideBanner() {
        try {
            await AdMob.hideBanner();
            this.bannerShown = false;
            console.log('Banner ad hidden');
        } catch (error) {
            console.error('Failed to hide banner:', error);
        }
    }

    /**
     * Remove banner ad completely
     */
    async removeBanner() {
        try {
            await AdMob.removeBanner();
            this.bannerShown = false;
            console.log('Banner ad removed');
        } catch (error) {
            console.error('Failed to remove banner:', error);
        }
    }

    /**
     * Resume banner (after pause)
     */
    async resumeBanner() {
        try {
            await AdMob.resumeBanner();
            console.log('Banner ad resumed');
        } catch (error) {
            console.error('Failed to resume banner:', error);
        }
    }
}

// Export singleton instance
export const adManager = new AdManager();
```

### B. Integrate into Main Game

Edit: `js/game.js`

Add import at top:
```javascript
import { adManager } from './admob.js';
```

In the `WordLockGame` constructor, initialize ads:
```javascript
constructor() {
    // ... existing code ...

    // Initialize ads after game loads
    this.initializeAds();
}

/**
 * Initialize and show banner ads
 */
async initializeAds() {
    try {
        // Only show ads on Android (Capacitor)
        if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
            await adManager.initialize();

            // Show banner after a short delay (less intrusive)
            setTimeout(() => {
                adManager.showBanner();
            }, 2000);
        }
    } catch (error) {
        console.log('Ads not available:', error);
    }
}
```

### C. Adjust Game Layout for Banner

Edit: `styles.css`

Add padding at bottom to prevent banner from covering content:

```css
/* When running as Android app with banner ads */
.container {
    padding-bottom: 70px; /* Space for banner ad (50px + margin) */
}

/* Capacitor specific styles */
@media (display-mode: standalone) {
    .container {
        padding-bottom: 70px;
    }
}
```

---

## 🧪 Step 5: Testing Ads

### Use Test Ad Units (IMPORTANT!)

**During development, ALWAYS use test ads!** Using real ads during testing can get your AdMob account banned.

**Google Test Ad Unit IDs:**
```javascript
// For testing:
banner: 'ca-app-pub-3940256099942544/6300978111'
```

### Test on Real Device

1. Build new APK with AdMob:
   ```bash
   cp -r js www/
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

2. Install on device:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

3. You should see a test banner ad at the bottom!

---

## 💰 Step 6: Non-Intrusive Ad Placement

### Best Practices for WordLock:

#### Option 1: Bottom Banner (Recommended)
- Always visible at bottom
- Doesn't interfere with gameplay
- Standard and expected

#### Option 2: Between Games
- Show banner only on game over screen
- Hide during active gameplay
- Most non-intrusive

**Implementation:**
```javascript
// In handleWin() and handleLoss():
async handleWin() {
    // ... existing win logic ...

    // Show banner on game over
    if (window.Capacitor) {
        await adManager.showBanner();
    }
}

// When starting new game:
resetGame() {
    // Hide banner during gameplay
    if (window.Capacitor) {
        adManager.hideBanner();
    }

    // ... existing reset logic ...
}
```

#### Option 3: Daily Mode Only
- Show ads only in Daily mode (free)
- Practice mode is ad-free
- Good for user experience

```javascript
switchMode(isDailyMode) {
    // ... existing code ...

    if (isDailyMode && window.Capacitor) {
        adManager.showBanner();
    } else {
        adManager.hideBanner();
    }
}
```

---

## 📊 Step 7: Monitor Ad Performance

1. Go to AdMob console: https://admob.google.com/
2. View **Reports** to see:
   - Impressions
   - Clicks
   - Revenue
   - eCPM (earnings per thousand impressions)

**Typical earnings:**
- Banner ads: $0.10 - $1.00 per 1000 impressions
- Depends on location, niche, and user engagement

---

## 🚨 Important Considerations

### Privacy & Compliance

#### Add Privacy Policy
You MUST have a privacy policy that mentions ads. Create one and host it (e.g., on GitHub Pages).

**Sample privacy policy clause:**
```
This app displays advertisements provided by Google AdMob.
AdMob may collect and use data to personalize ads.
For more information, see Google's privacy policy at
https://policies.google.com/privacy
```

#### Update AndroidManifest.xml for GDPR/CCPA

If you have users in Europe or California, you need consent:

```xml
<meta-data
    android:name="com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT"
    android:value="true"/>
```

Then show consent dialog before initializing ads.

### Ad Policy Compliance

**Don't:**
- Click your own ads (instant ban)
- Ask users to click ads
- Place ads too close to buttons
- Use misleading ad placements
- Show ads on blank screens

**Do:**
- Use test ads during development
- Place ads naturally
- Respect user experience
- Follow AdMob policies

---

## 🎨 Styling Recommendations

### Make Banner Blend In

```css
/* Ensure banner doesn't overlap game */
.game-container {
    margin-bottom: 60px;
}

/* Mobile adjustments */
@media screen and (max-width: 600px) {
    .container {
        padding-bottom: 80px;
    }
}
```

### Dark Theme Compatibility

AdMob automatically adjusts banner colors, but you can request specific themes:

```javascript
await AdMob.showBanner({
    adId: this.adUnitIds.banner,
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    // isTesting: false, // Set true for testing
});
```

---

## 💡 Advanced: Different Ad Strategies

### 1. Hybrid Model
- Free version with ads
- Paid version ($0.99-$2.99) with no ads
- Use in-app purchases to remove ads

### 2. Reward Ads
- Offer hints/extra guesses for watching video ads
- Higher revenue per impression
- Optional, doesn't interrupt gameplay

### 3. Interstitial Ads
- Full-screen ads between games
- Higher revenue but more intrusive
- Show maximum once per session

---

## 🔄 Update Workflow

**After adding AdMob code:**

```bash
# 1. Copy files to www
cp -r js www/
cp index.html styles.css www/

# 2. Sync Capacitor
npx cap sync android

# 3. Build
cd android
./gradlew assembleDebug

# 4. Test
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📝 Checklist

Before going live with ads:

- [ ] Created AdMob account
- [ ] Created WordLock app in AdMob
- [ ] Created banner ad unit
- [ ] Saved App ID and Ad Unit ID
- [ ] Installed @capacitor-community/admob
- [ ] Updated AndroidManifest.xml with App ID
- [ ] Created admob.js module
- [ ] Integrated ads into game.js
- [ ] Adjusted CSS for banner space
- [ ] Tested with test ad units
- [ ] Created privacy policy
- [ ] Updated to real ad unit IDs
- [ ] Tested on real device
- [ ] Verified ads show correctly
- [ ] Ads don't interfere with gameplay

---

## 🎯 Next Steps

Once ads are working:
1. Monitor performance in AdMob console
2. Optimize placement based on data
3. Consider adding more ad units (interstitial, rewarded)
4. Set up payment information in AdMob
5. Deploy to Play Store (see PLAY_STORE_DEPLOYMENT.md)

---

## 🆘 Troubleshooting

### "Ad failed to load"
- Check internet connection
- Verify ad unit IDs are correct
- Ensure App ID is in AndroidManifest.xml
- Make sure AdMob account is active

### "No ads showing"
- New ad units take hours to activate
- Use test ad units first
- Check AdMob console for account status

### "App crashes when showing ad"
- Verify plugin is installed: `npm list @capacitor-community/admob`
- Check Android logs: `adb logcat | grep AdMob`
- Ensure permissions in AndroidManifest.xml

### "Ads showing in web browser"
- Normal - ads only work on Android/iOS
- Check with: `if (window.Capacitor)`

---

## 📚 Resources

- **AdMob Console:** https://admob.google.com/
- **Plugin Docs:** https://github.com/capacitor-community/admob
- **AdMob Policies:** https://support.google.com/admob/answer/6128543
- **Privacy Policy Generator:** https://app-privacy-policy-generator.firebaseapp.com/

Good luck with monetization! 💰
