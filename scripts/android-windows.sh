#!/usr/bin/env bash
# Builds the game and copies it into the Windows copy of the Android project that Android Studio
# opens, so a native build there always has the latest web code, icons and splash.
#
# Usage: npm run android:windows
# Target: $WORDLOCK_WINDOWS_ANDROID, default C:\Users\mimhoff\AndroidProjects\wordlock\android
#
# Only app/src/main/res (icons, splash, colours) and app/src/main/assets (the web build) are
# copied. Gradle files, version numbers and signing settings on the Windows side are never touched.

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
echo "→ Building the game"
npm run build

echo "→ Copying the web build into android/ (cap copy: web assets and config only)"
npx cap copy android

echo "→ Copying resources (icons, splash) to $TARGET"
# No --delete: resources added on the Windows side (e.g. by Android Studio) are kept.
rsync -r --checksum --itemize-changes "$SRC/res/" "$DST/res/" | grep -v '^\.' || true

echo "→ Copying the web build to $TARGET"
# --delete: the web build is generated, so stale hashed files from older builds are removed.
rsync -r --checksum --delete "$SRC/assets/" "$DST/assets/"

BUNDLE=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$DST/assets/public/index.html" || true)
echo "✓ Windows project updated (web build: ${BUNDLE:-unknown})."
echo "  In Android Studio: bump versionCode, then Build → Generate Signed App Bundle."
