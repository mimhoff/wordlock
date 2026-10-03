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

// --- Privacy options (Google's UMP) -----------------------------------------------------
// Where the law requires it (e.g. some US states, and changing a GDPR choice later), Google expects
// an in-app way to reopen the privacy message. The SDK says when; Settings shows the button then.
let privacyRequired = false;
const privacyListeners = new Set<(required: boolean) => void>();

function setPrivacyRequired(status: string | undefined): void {
  // The plugin doesn't export its PrivacyOptionsRequirementStatus enum, so compare the value.
  const required = status === 'REQUIRED';
  if (required === privacyRequired) return;
  privacyRequired = required;
  privacyListeners.forEach((listener) => listener(required));
}

/** Whether Settings should offer "Ad privacy choices" for this player. */
export const privacyOptionsRequired = () => privacyRequired;

export function onPrivacyOptionsChange(listener: (required: boolean) => void): () => void {
  privacyListeners.add(listener);
  return () => privacyListeners.delete(listener);
}

// --- Banner --------------------------------------------------------------------------------
let bannerShown = false;

/** Shows the banner once consent allows it. The app reserves --ad-height so it never covers the keyboard. */
async function showBannerNow(adId: string): Promise<void> {
  if (bannerShown || isPremium()) return;
  bannerShown = true;
  await AdMob.addListener(BannerAdPluginEvents.SizeChanged, ({ height }) =>
    document.documentElement.style.setProperty('--ad-height', `${height}px`),
  );
  await AdMob.showBanner({
    adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: adTesting(),
  });
}

/** Native: AdMob with Google's consent flow, then the banner pinned below the keyboard. */
async function showAdMobBanner(): Promise<void> {
  const adId = bannerUnit();
  if (!adId) return;
  await AdMob.initialize({ initializeForTesting: adTesting() });

  // Google's UMP consent form (GDPR/EEA and US state privacy laws), shown only where required.
  let consent = await AdMob.requestConsentInfo();
  if (consent.status === AdmobConsentStatus.REQUIRED && consent.isConsentFormAvailable) {
    consent = await AdMob.showConsentForm();
  }
  // Recorded even if ads are declined: the player must be able to change their mind later.
  setPrivacyRequired(consent.privacyOptionsRequirementStatus);
  if (!consent.canRequestAds) return;
  await showBannerNow(adId);
}

/**
 * Settings → "Ad privacy choices": reopens Google's privacy message, then applies the new choice
 * straight away (banner removed if ads are no longer allowed, shown if newly allowed).
 */
export async function openPrivacyOptions(): Promise<void> {
  try {
    await AdMob.showPrivacyOptionsForm();
    const consent = await AdMob.requestConsentInfo();
    setPrivacyRequired(consent.privacyOptionsRequirementStatus);
    const adId = bannerUnit();
    if (!consent.canRequestAds) await removeAdMobBanner();
    else if (adId) await showBannerNow(adId);
  } catch (err) {
    console.warn('Privacy options unavailable', err);
  }
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
  bannerShown = false;
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
