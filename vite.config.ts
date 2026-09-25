import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base lets the same build run from any sub-path of a website
  // (e.g. https://example.com/wordlock/) and inside the Capacitor native shell.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-152x152.png'],
      manifest: {
        name: 'WordLock - Daily Word Puzzle',
        short_name: 'WordLock',
        description: 'Wordle with a strategic twist! Guess the 5-letter word with locked letter positions.',
        theme_color: '#538d4e',
        background_color: '#121213',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['games', 'entertainment'],
        icons: [72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
          src: `icons/icon-${size}x${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
});
