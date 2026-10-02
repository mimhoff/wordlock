import { AdMob, AdmobConsentStatus, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { ADMOB_BANNER_ID, ADSENSE_CLIENT } from '../config';
import { isPremium, onPremiumChange } from './entitlements';

/** Web: Google AdSense auto ads (production builds only). */
function loadAdSense(): void {
  if (!ADSENSE_CLIENT || !import.meta.env.PROD) return;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

/**
 * Native: AdMob banner pinned to the bottom of the screen. The app reserves space for it
 * through the --ad-height CSS variable so it never covers the keyboard. Dev-server and
 * VITE_ADMOB_TESTING=true builds request Google's test ads.
 */
async function showAdMobBanner(): Promise<void> {
  const testing = import.meta.env.DEV || import.meta.env.VITE_ADMOB_TESTING === 'true';
  await AdMob.initialize({ initializeForTesting: testing });

  // Google's UMP consent form (GDPR/EEA and US state privacy laws), shown only where required.
  let consent = await AdMob.requestConsentInfo();
  if (consent.status === AdmobConsentStatus.REQUIRED && consent.isConsentFormAvailable) {
    consent = await AdMob.showConsentForm();
  }
  if (!consent.canRequestAds) return;

  await AdMob.addListener(BannerAdPluginEvents.SizeChanged, ({ height }) =>
    document.documentElement.style.setProperty('--ad-height', `${height}px`),
  );
  await AdMob.showBanner({
    adId: ADMOB_BANNER_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: testing,
  });
}

/** Ads are best-effort: failures are logged and never affect the game. */
/** Takes the banner away straight after a purchase, and gives its space back to the game. */
async function removeAdMobBanner(): Promise<void> {
  await AdMob.removeBanner().catch(() => {});
  document.documentElement.style.removeProperty('--ad-height');
}

export function initAds(): void {
  if (Capacitor.isNativePlatform()) {
    // Premium (WordLock Plus) players never see the banner; buying it removes one already shown.
    onPremiumChange((premium) => premium && void removeAdMobBanner());
    if (isPremium()) return;
    // A short delay keeps the banner from competing with first paint, as in v2.
    setTimeout(() => {
      if (!isPremium()) showAdMobBanner().catch((err) => console.warn('AdMob unavailable', err));
    }, 2000);
  } else {
    loadAdSense();
  }
}
