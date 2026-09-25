import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Synchronous key/value persistence.
 *
 * On the web this is localStorage. In the native apps it's Capacitor Preferences
 * (SharedPreferences / UserDefaults), which the OS won't evict the way it can a WebView's
 * localStorage. Preferences is async, so everything is read into memory once by
 * `initStorage()` before the app renders; writes update memory immediately and persist
 * in the background.
 */
const PREFIX = 'wordlock:';
const native = Capacitor.isNativePlatform();
const cache = new Map<string, string>();

export async function initStorage(): Promise<void> {
  if (!native) return;
  try {
    const { keys } = await Preferences.keys();
    await Promise.all(
      keys.map(async (key) => {
        const { value } = await Preferences.get({ key });
        if (value != null) cache.set(key, value);
      }),
    );
  } catch (err) {
    console.warn('Could not load saved data', err);
  }
}

function getRaw(key: string): string | null {
  try {
    return native ? (cache.get(key) ?? null) : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setRaw(key: string, value: string): void {
  try {
    if (native) {
      cache.set(key, value);
      void Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Storage full or blocked (private mode) — the game still works, it just won't persist.
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  try {
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export const load = <T>(key: string, fallback: T): T => parse(getRaw(PREFIX + key), fallback);
export const save = <T>(key: string, value: T): void => setRaw(PREFIX + key, JSON.stringify(value));
export const has = (key: string): boolean => getRaw(PREFIX + key) != null;

/** Reads a key written by WordLock v2, which stored data without the `wordlock:` prefix. */
export const loadLegacy = <T>(key: string): T | null => parse<T | null>(getRaw(key), null);
