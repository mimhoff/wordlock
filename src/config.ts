/** Site- and account-specific settings. Each can be overridden with a VITE_* env variable. */
const env = import.meta.env;

/** Canonical public URL, included in shared results. */
export const SHARE_URL: string = env.VITE_SHARE_URL ?? 'https://mimhoff.com/wordlock';

export const KOFI_URL: string = env.VITE_KOFI_URL ?? 'https://ko-fi.com/mimhoff';

/** Google AdSense publisher ID (web only). Set VITE_ADSENSE_CLIENT to '' to disable. */
export const ADSENSE_CLIENT: string = env.VITE_ADSENSE_CLIENT ?? 'ca-pub-5632873189325776';

/**
 * AdMob banner unit (native apps only). The AdMob *app* ID
 * (ca-app-pub-5632873189325776~1491981967) goes in the native projects; see docs/ADMOB_SETUP.md.
 */
export const ADMOB_BANNER_ID: string = env.VITE_ADMOB_BANNER_ID ?? 'ca-app-pub-5632873189325776/5646957190';

/** AdMob banner unit for the iOS app. Empty until the iOS app exists in AdMob: no ads on iOS until set. */
export const ADMOB_BANNER_ID_IOS: string = env.VITE_ADMOB_BANNER_ID_IOS ?? '';

/**
 * RevenueCat public SDK keys (safe to ship in the app; they only identify the project). With no key
 * for a platform, purchases are switched off there and the WordLock Plus section is hidden (iOS until
 * its key exists). See docs/MONETIZATION.md.
 */
export const REVENUECAT_ANDROID_KEY: string = env.VITE_REVENUECAT_ANDROID_KEY ?? 'goog_bnNXTXQreMGKcXkkdBKpwHwpPIj';
export const REVENUECAT_IOS_KEY: string = env.VITE_REVENUECAT_IOS_KEY ?? '';

/** The RevenueCat entitlement that WordLock Plus grants. */
export const PLUS_ENTITLEMENT = 'plus';
