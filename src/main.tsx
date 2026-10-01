import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import App from './App';
import { migrateLegacyData } from './migration';
import { initAds } from './platform/ads';
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

async function start() {
  await initStorage();
  migrateLegacyData();
  removeLegacyCaches();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  initAds();
}

void start();
