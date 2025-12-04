# Testing WordLock on Android - Step-by-Step Guide

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Android Studio installed on Windows
- [ ] At least one Android SDK installed (API 33/Android 13 recommended)
- [ ] Either: Physical Android device OR Android Emulator set up

---

## Step 1: Open Android Studio (From Windows)

Since you're using WSL, you need to open Android Studio from Windows:

### Option A: Using Windows Explorer
1. Open Windows File Explorer
2. Navigate to: `\\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android`
   - Or: `\\wsl$\Ubuntu-24.04\home\mimhoff\wordlock\android` (older Windows)
3. Right-click on the `android` folder
4. Choose "Open with Android Studio" (if available)
   - OR: Open Android Studio first, then File → Open → navigate to the android folder

### Option B: Using Command Prompt
1. Press Win+R
2. Type: `explorer.exe \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android`
3. Press Enter
4. The folder opens in Explorer, then open with Android Studio

### Option C: Direct Path in Android Studio
1. Open Android Studio from Windows Start Menu
2. Click "Open"
3. Navigate to: `\\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android`
4. Click OK

---

## Step 2: Wait for Gradle Sync (IMPORTANT!)

**This is crucial - don't skip!**

When Android Studio opens:

1. **First Time**: Gradle will automatically start syncing
   - Look at the bottom of Android Studio for progress
   - Shows: "Gradle sync in progress..."
   - **This takes 5-15 minutes the first time!** ☕

2. **Watch for messages**:
   - ✅ "Gradle sync finished" = Good! Proceed to Step 3
   - ⚠️ "Gradle sync failed" = See Troubleshooting section below

3. **Let it finish completely** before clicking anything!

---

## Step 3: Choose Your Testing Method

You have two options:

### Option A: Physical Android Device (Recommended - Faster!)

#### Enable USB Debugging on Your Phone:
1. **Enable Developer Options**:
   - Go to: Settings → About Phone
   - Find "Build Number"
   - Tap it **7 times** rapidly
   - Message appears: "You are now a developer!"

2. **Enable USB Debugging**:
   - Go to: Settings → System → Developer Options
   - Enable "USB Debugging"
   - Enable "Install via USB" (if available)

3. **Connect Your Phone**:
   - Plug phone into computer with USB cable
   - Phone shows prompt: "Allow USB debugging?"
   - Check "Always allow from this computer"
   - Tap "OK"

4. **Verify Connection**:
   - In Android Studio, check top toolbar
   - Device dropdown should show your phone name
   - Example: "Samsung Galaxy S21" or "Pixel 6"

### Option B: Android Emulator (No Phone Needed)

#### Create an Emulator:
1. In Android Studio: Tools → Device Manager
2. Click "Create Device"
3. Choose a device:
   - Recommended: "Pixel 5" or "Pixel 6"
   - Click "Next"
4. Choose a system image:
   - Recommended: "Tiramisu" (API 33) or "UpsideDownCake" (API 34)
   - Click "Download" if needed (takes 5-10 minutes)
   - Click "Next"
5. Name it: "WordLock Test Device"
6. Click "Finish"

#### Start the Emulator:
1. In Device Manager, find your emulator
2. Click the ▶️ (Play) button
3. Wait for emulator to boot (~2 minutes first time)

---

## Step 4: Run WordLock!

1. **Make sure device/emulator is selected**:
   - Top toolbar: Check device dropdown shows your phone/emulator

2. **Click the green Run button** (▶️) in the toolbar
   - OR: Run → Run 'app'
   - OR: Press Shift+F10

3. **First run tasks** (takes 1-2 minutes):
   - "Building 'app' Gradle project info..."
   - "Gradle build running..."
   - "Installing APKs..."
   - "Launching 'app'..."

4. **WordLock opens on your device!** 🎉

---

## Step 5: Test Your Game

### Things to Test:

**Basic Functionality:**
- [ ] Game loads with 8 rows of tiles
- [ ] Lock icons appear on rows 2-8
- [ ] Can type letters using on-screen keyboard
- [ ] Can type letters using physical keyboard
- [ ] Tiles turn colors after submitting valid word
- [ ] Locked letters appear on subsequent rows
- [ ] Win condition works (guess the word)
- [ ] Loss condition works (8 wrong guesses)

**App Icon:**
- [ ] Icon shows your WORD/LOCK grid design
- [ ] Icon looks good in app drawer
- [ ] Icon looks good on home screen

**PWA Features:**
- [ ] Game works offline (toggle airplane mode)
- [ ] Returns to last game state after closing/reopening
- [ ] Statistics persist between sessions

**UI/UX:**
- [ ] Text is readable
- [ ] Tiles are properly sized
- [ ] Touch targets are easy to tap
- [ ] No visual glitches
- [ ] Dark/Light theme toggle works

**Performance:**
- [ ] App launches quickly
- [ ] No lag when typing
- [ ] Smooth animations
- [ ] No crashes

---

## Troubleshooting

### Gradle Sync Failed

**Error: "SDK location not found"**
1. File → Project Structure → SDK Location
2. Set Android SDK Location to your SDK path
   - Usually: `C:\Users\YourName\AppData\Local\Android\Sdk`
3. Click "Apply" → "OK"
4. File → Sync Project with Gradle Files

**Error: "Failed to find Build Tools"**
1. Tools → SDK Manager
2. SDK Tools tab
3. Check "Android SDK Build-Tools"
4. Click "Apply"
5. Wait for installation
6. File → Sync Project with Gradle Files

**Error: "Unsupported Gradle version"**
1. File → Project Structure
2. Project → Gradle Version
3. Select latest version
4. Click "Apply" → "OK"

### Device Not Showing

**Physical Device:**
- Unplug and replug USB cable
- Try different USB port
- Try different USB cable
- On phone: Disable and re-enable USB debugging
- On Windows: Update Android USB drivers

**Emulator:**
- Tools → Device Manager → Delete emulator → Create new one
- Restart Android Studio
- Check Windows Hyper-V is disabled (conflicts with emulator)

### App Crashes on Launch

1. Check Android Studio Logcat (bottom panel)
2. Filter by "Error" or "Fatal"
3. Look for red lines showing crash reason
4. Common fixes:
   - Build → Clean Project
   - Build → Rebuild Project
   - File → Invalidate Caches → Invalidate and Restart

### App Shows Blank Screen

1. Check Logcat for errors
2. Verify files in: `android/app/src/main/assets/public/`
   - Should have: index.html, game.js, styles.css, etc.
3. If missing, run in WSL:
   ```bash
   cd /home/mimhoff/wordlock
   npm run copy
   npm run sync
   ```
4. Rebuild in Android Studio

### Changes Not Appearing

**After editing game code:**
1. In WSL:
   ```bash
   npm run copy    # Copy to www/
   npm run sync    # Sync to Android
   ```
2. In Android Studio:
   - Build → Rebuild Project
   - Run → Run 'app' (re-install on device)

---

## Making Changes & Testing Again

Workflow when you edit code:

1. **Edit files** in WSL (index.html, game.js, styles.css, etc.)

2. **In WSL terminal**:
   ```bash
   cd /home/mimhoff/wordlock
   npm run copy
   npm run sync
   ```

3. **In Android Studio**:
   - Click green Run button (▶️)
   - Or: Build → Rebuild Project, then Run

4. **App updates on device!**

---

## Next Steps After Testing

Once your app works well:

1. **Build Release APK** (See MOBILE_APP_GUIDE.md)
2. **Prepare Play Store listing**:
   - Screenshots (at least 2)
   - Description
   - Category: Games → Word
   - Privacy policy (if collecting data)
3. **Submit for review**
4. **Wait 1-3 days for approval**

---

## Quick Reference Commands

```bash
# WSL - Copy changes to Android
cd /home/mimhoff/wordlock
npm run copy && npm run sync

# WSL - Check if files synced
ls android/app/src/main/assets/public/

# Windows - Open Android project folder
explorer.exe \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android
```

---

## Getting Help

**Android Studio Issues:**
- Help → Submit Feedback
- https://developer.android.com/studio/intro

**Capacitor Issues:**
- https://capacitorjs.com/docs/android/troubleshooting

**WSL + Android Studio:**
- Make sure you're opening from Windows, not WSL
- Use `\\wsl.localhost\` paths in Windows

---

**Good luck! Your game is going to look amazing on Android!** 🚀
