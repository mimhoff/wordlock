import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import App from './App';
import { migrateLegacyData } from './migration';
import { initAds } from './platform/ads';
import { initBilling } from './platform/billing';
import { initStorage } from './platform/storage';
import './styles.css';

/** v2's hand-written service worker kept its own `wordlock-*` caches; the new one doesn't use them. */
function removeLegacyCaches() {
  if (!('caches' in window)) return;
  caches
    .keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('wordlock-')).map((k) => caches.delete(k))))
    .catch(() => {});
}

/**
 * The how-to-play article in index.html is for the website. The native apps and the installed
 * PWA are full-screen games, so it's removed there rather than left to scroll under the board.
 */
function removeWebArticle() {
  if (Capacitor.isNativePlatform() || window.matchMedia('(display-mode: standalone)').matches) {
    document.getElementById('about')?.remove();
  }
}

async function start() {
  removeWebArticle();
  await initStorage();
  migrateLegacyData();
  removeLegacyCaches();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  initAds();
  // Restores WordLock Plus from the store (native apps with RevenueCat configured; otherwise a no-op).
  void initBilling();
}

void start();
