import { AdMob, AdmobConsentStatus, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { ADMOB_BANNER_ID, ADMOB_BANNER_ID_IOS, ADSENSE_CLIENT } from '../config';
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

/** Google's public test banner units: test builds never show real ads (tapping those risks the account). */
const TEST_BANNERS: Record<string, string> = {
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
};

const adTesting = () => import.meta.env.DEV || import.meta.env.VITE_ADMOB_TESTING === 'true';

/** The banner unit for this platform, or null when there's none yet (then AdMob isn't started at all). */
function bannerUnit(): string | null {
  const platform = Capacitor.getPlatform();
  if (adTesting()) return TEST_BANNERS[platform] ?? null;
  if (platform === 'android') return ADMOB_BANNER_ID || null;
  if (platform === 'ios') return ADMOB_BANNER_ID_IOS || null;
  return null;
}

/**
 * Native: AdMob banner pinned to the bottom of the screen. The app reserves space for it
 * through the --ad-height CSS variable so it never covers the keyboard.
 */
async function showAdMobBanner(): Promise<void> {
  const adId = bannerUnit();
  if (!adId) return;
  const testing = adTesting();
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
    adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: testing,
  });
}

let trackingAsked = false;

/**
 * iOS: asks Apple's App Tracking Transparency permission, once, so ads can be personalised (they
 * still show, non-personalised, if the player declines). Called after the player finishes their
 * first game, so it never greets a brand-new player and always follows Google's consent form.
 */
export async function requestTrackingIfNeeded(): Promise<void> {
  if (Capacitor.getPlatform() !== 'ios' || trackingAsked || isPremium() || !bannerUnit()) return;
  trackingAsked = true;
  try {
    const { status } = await AdMob.trackingAuthorizationStatus();
    if (status === 'notDetermined') await AdMob.requestTrackingAuthorization();
  } catch (err) {
    console.warn('Tracking permission unavailable', err);
  }
}

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
