# WordLock Icons

This folder should contain app icons in various sizes for PWA and native app support.

## Required Icon Sizes

You need to create PNG images in the following sizes:
- 72x72 (icon-72x72.png)
- 96x96 (icon-96x96.png)
- 128x128 (icon-128x128.png)
- 144x144 (icon-144x144.png)
- 152x152 (icon-152x152.png) - Apple Touch Icon
- 192x192 (icon-192x192.png) - Standard PWA icon
- 384x384 (icon-384x384.png)
- 512x512 (icon-512x512.png) - High-res for splash screens

## Design Recommendations

For WordLock, consider:
- **Background color:** Dark theme (#121213) or green (#538d4e)
- **Icon design ideas:**
  - Stylized lock icon with letters
  - Grid of colored tiles (like the game board)
  - Lock + letter combination
  - Simple "W" or "WL" monogram with lock symbol

## Icon Generators

Easy ways to create these:
1. **PWA Asset Generator** (automated):
   ```bash
   npx @pwa/asset-generator [source-image] ./icons --icon-only
   ```

2. **Online tools:**
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/

3. **Design tools:**
   - Figma (free)
   - Canva (free)
   - Adobe Illustrator

## Quick Start

If you have a single 512x512 PNG source image, run:
```bash
npx @pwa/asset-generator logo.png ./icons --icon-only --padding "10%"
```

This will generate all required sizes automatically.

## Maskable Icons

The icons are marked as "maskable" in manifest.json, which means they should have important content in the center "safe zone" (80% of the canvas). Android will apply various masks (circle, squircle, rounded square) to your icon.

**Safe zone:** Keep important content within the center 80% circle.
**Full bleed:** Background color/pattern can extend to edges.
