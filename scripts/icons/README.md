# Icons

| Icon | Source | Used for |
|---|---|---|
| **Grid** (WOR / D🔒L / OCK) | `icon-grid.html` | App icons: installed web app, iPhone home screen, Android, Play Store, the mimhoff.com project card |
| **Padlock** | `padlock.svg` (and `public/favicon.svg`) | Browser-tab favicon and the in-game logo; the in-game lock icons in `src/components/icons.tsx` are traced from it |

The grid is too detailed for a 16–32 px favicon, so the favicon stays the padlock.

## Re-rendering the grid icons

`icon-grid.html` uses the bundled Space Grotesk font from `node_modules`, so run `npm install` first.
Render it at exactly 512×512 with a headless browser and save as PNG without transparency, then scale down:

- `public/icons/icon-{72,96,128,144,152,192,384,512}x….png`: render `icon-grid.html`
- `public/icons/icon-maskable-{192,512}.png`: render `icon-grid.html?maskable`, where the grid is shrunk so
  Android's circle and squircle masks only crop the dark background

With Playwright, for example: open the file at a 512×512 viewport, `await document.fonts.ready`, screenshot,
then resize with any image tool. Copy `icon-512x512.png` to the site repo as
`astro-site/public/icons/wordlock-icon.png` for the homepage card.
