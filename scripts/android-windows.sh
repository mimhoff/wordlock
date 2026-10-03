#!/usr/bin/env bash
# Builds the game and copies it into the Windows copy of the Android project that Android Studio
# opens, so a native build there always has the latest web code, icons and splash.
#
# Usage: npm run android:windows
#        WORDLOCK_PLUS_PREVIEW=1 npm run android:windows   (test build with Plus features unlocked)
# Target: $WORDLOCK_WINDOWS_ANDROID, default C:\Users\mimhoff\AndroidProjects\wordlock\android
#
# Copied: app/src/main/res (icons, splash, colours), app/src/main/assets (the web build), the
# Gradle files Capacitor generates (capacitor.settings.gradle, app/capacitor.build.gradle, marked
# "DO NOT EDIT"), and the native plugin packages they point to in node_modules. Your own Gradle
# files, version numbers and signing settings on the Windows side are never touched.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${WORDLOCK_WINDOWS_ANDROID:-/mnt/c/Users/mimhoff/AndroidProjects/wordlock/android}"
SRC="$ROOT/android/app/src/main"
DST="$TARGET/app/src/main"

if [ ! -d "$DST" ]; then
  echo "Windows Android project not found at: $TARGET" >&2
  echo "Set WORDLOCK_WINDOWS_ANDROID to its path (as seen from WSL, e.g. /mnt/c/...)." >&2
  exit 1
fi

cd "$ROOT"
if [ "${WORDLOCK_PLUS_PREVIEW:-}" = "1" ]; then
  echo "→ Building the game (Plus PREVIEW: Plus features unlocked; don't release this build)"
  VITE_PLUS_PREVIEW=true npm run build
else
  echo "→ Building the game"
  npm run build
fi

echo "→ Syncing android/ (cap sync: web build, config and native plugin registrations)"
npx cap sync android

echo "→ Copying resources (icons, splash) to $TARGET"
# No --delete: resources added on the Windows side (e.g. by Android Studio) are kept.
rsync -r --checksum --itemize-changes "$SRC/res/" "$DST/res/" | grep -v '^\.' || true

echo "→ Copying Capacitor's generated Gradle files to $TARGET"
cp "$ROOT/android/capacitor.settings.gradle" "$TARGET/capacitor.settings.gradle"
cp "$ROOT/android/app/capacitor.build.gradle" "$TARGET/app/capacitor.build.gradle"

echo "→ Copying native plugin packages to the Windows node_modules"
# capacitor.settings.gradle points at ../node_modules/<package>/<android dir>; mirror each package.
WIN_MODULES="$(dirname "$TARGET")/node_modules"
grep -o "'\.\./node_modules/[^']*'" "$ROOT/android/capacitor.settings.gradle" | tr -d "'" | sed 's#^\.\./node_modules/##' |
  while read -r dir; do
    pkg=$(echo "$dir" | awk -F/ '{ if ($1 ~ /^@/) print $1"/"$2; else print $1 }')
    mkdir -p "$WIN_MODULES/$pkg"
    rsync -r --checksum --delete --exclude node_modules "$ROOT/node_modules/$pkg/" "$WIN_MODULES/$pkg/"
    echo "   $pkg"
  done

echo "→ Copying the web build to $TARGET"
# --delete: the web build is generated, so stale hashed files from older builds are removed.
rsync -r --checksum --delete "$SRC/assets/" "$DST/assets/"

BUNDLE=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$DST/assets/public/index.html" || true)
echo "✓ Windows project updated (web build: ${BUNDLE:-unknown})."
echo "  In Android Studio: bump versionCode, then Build → Generate Signed App Bundle."
