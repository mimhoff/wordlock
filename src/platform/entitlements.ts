import { load, save } from './storage';

/**
 * What the player has bought. WordLock is free and complete; a one-time purchase ("WordLock Plus")
 * removes ads and unlocks small extras. Nothing in the daily game, the lock pick or the share
 * results may ever depend on this.
 *
 * Nothing can be bought yet. When Google Play Billing is connected (see docs/MONETIZATION.md),
 * the billing code calls setPremium() after a verified purchase, and again on start-up after
 * restoring purchases, so this saved flag is only a cache of what the store says.
 */
const KEY = 'premium';
type Listener = (premium: boolean) => void;
const listeners = new Set<Listener>();

export const isPremium = (): boolean => load(KEY, false);

/**
 * Plus features (e.g. Expert) are unlocked for premium players, and for previews: the dev server,
 * and test builds made with VITE_PLUS_PREVIEW=true (`WORDLOCK_PLUS_PREVIEW=1 npm run android:windows`).
 * Ordinary website and release builds never get them for free.
 */
const PLUS_PREVIEW = import.meta.env.DEV || import.meta.env.VITE_PLUS_PREVIEW === 'true';
export const plusUnlocked = (): boolean => PLUS_PREVIEW || isPremium();

export function setPremium(value: boolean): void {
  if (value === isPremium()) return;
  save(KEY, value);
  listeners.forEach((listener) => listener(value));
}

/** Notifies when the premium state changes (e.g. right after a purchase). Returns an unsubscribe. */
export function onPremiumChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
