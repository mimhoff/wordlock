# Opening WordLock in Android Studio from WSL

Since you're in WSL, Android Studio is installed on Windows, not Linux. Here's how to open your project:

## 🎯 Quick Solution: Open from Windows

### Method 1: Using File Explorer (Easiest)

1. **Open Windows File Explorer**

2. **Paste this path in the address bar:**
   ```
   \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android
   ```

3. **Right-click on the `android` folder**

4. **Open with Android Studio**
   - If you see "Open Folder as Android Studio Project" → Click it
   - Otherwise, just open Android Studio and then File → Open → Navigate to this folder

---

### Method 2: Direct Windows Path

1. **Open Android Studio** (Start Menu → Android Studio)

2. **File → Open**

3. **Navigate to:**
   ```
   \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android
   ```

4. **Click OK**

---

### Method 3: From Windows Terminal/PowerShell

```powershell
# Navigate to the project
cd \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android

# Open in Android Studio (if studio is in PATH)
studio .

# Or if Android Studio is not in PATH:
"C:\Program Files\Android\Android Studio\bin\studio64.exe" .
```

---

## 🔧 Alternative: Build from WSL Command Line

If you don't want to use Android Studio GUI, you can build directly from WSL:

```bash
cd ~/wordlock/android

# Build debug APK
./gradlew assembleDebug

# The APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Then transfer the APK to your phone:
```bash
# Copy to Windows desktop
cp app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/mimhoff/Desktop/wordlock.apk

# Or use adb if phone is connected:
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎨 Visual Guide

**Step-by-step with screenshots:**

### Windows File Explorer:
```
1. Win + E (Open File Explorer)
2. Click address bar at top
3. Paste: \\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android
4. Press Enter
5. Right-click "android" folder
6. Select "Open with Android Studio"
```

### Android Studio:
```
1. Open Android Studio
2. Welcome screen → "Open"
3. Navigate to WSL location (see path above)
4. Select "android" folder
5. Click "OK"
6. Wait for Gradle sync
7. Click green Run button (▶)
```

---

## ⚡ Fastest Method (Copy-Paste)

**Option A: Copy project to Windows for faster builds**
```bash
# From WSL terminal:
cp -r /home/mimhoff/wordlock /mnt/c/Users/mimhoff/Desktop/wordlock-windows

# Then open in Android Studio from:
# C:\Users\mimhoff\Desktop\wordlock-windows\android
```

**Benefits:**
- Much faster Gradle builds (WSL filesystem is slower)
- No path issues
- Better Android Studio performance

**Option B: Keep in WSL and build from command line**
```bash
cd ~/wordlock/android
./gradlew assembleDebug
```

**Benefits:**
- Keep all your work in one place
- Easy git management
- Simple updates with cap sync

---

## 🐛 Troubleshooting

### "Android Studio not installed"
**Download from:** https://developer.android.com/studio

### "Can't find WSL path in File Explorer"
**Enable WSL in File Explorer:**
1. Open File Explorer
2. Type in address bar: `\\wsl$\`
3. You should see your WSL distributions
4. Alternative: `\\wsl.localhost\Ubuntu-24.04`

### "Gradle build is very slow"
**Solution:** Copy project to Windows filesystem (see Option A above)

WSL filesystem access from Windows tools is slower. Building on Windows side is 2-3x faster.

### "Permission denied on gradlew"
```bash
chmod +x android/gradlew
```

---

## 📱 Once Android Studio Opens

1. **Wait for Gradle sync** (bottom status bar)
2. **Connect device or start emulator**
   - Physical device: Enable USB debugging
   - Emulator: Tools → Device Manager → Create/Start device
3. **Click Run (▶)**
4. **App installs and launches!**

---

## 🎯 Recommended Workflow

**For development (fastest):**
1. Copy to Windows: `/mnt/c/Users/mimhoff/Desktop/wordlock`
2. Edit in WSL or VS Code
3. When ready to build:
   ```bash
   # From WSL:
   cp index.html styles.css words.js manifest.json sw.js /mnt/c/Users/mimhoff/Desktop/wordlock/www/
   cp -r js /mnt/c/Users/mimhoff/Desktop/wordlock/www/

   # Then from Windows PowerShell:
   cd C:\Users\mimhoff\Desktop\wordlock
   npx cap sync android
   ```
4. Build in Android Studio (much faster)

**For quick testing:**
```bash
# From WSL:
cd ~/wordlock/android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Next Steps

1. **Open Android Studio on Windows**
2. **File → Open**
3. **Navigate to:** `\\wsl.localhost\Ubuntu-24.04\home\mimhoff\wordlock\android`
4. **Wait for Gradle sync**
5. **Click Run!**

Your WordLock game with all animations will launch on Android! 🎮✨
