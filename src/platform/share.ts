import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { SHARE_URL } from '../config';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Public URL included in shared results (the same for web and native). */
export const shareUrl = (): string | undefined => SHARE_URL || undefined;

const isTouchDevice = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

/**
 * Native share sheet in the mobile app and on touch devices; clipboard on desktop,
 * where the OS share sheet is usually less useful than pasting into a chat.
 */
export async function shareText(text: string): Promise<ShareOutcome> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ text });
      return 'shared';
    }
    if (isTouchDevice() && navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof Error && /cancel|abort/i.test(`${err.name} ${err.message}`)) return 'cancelled';
    // Otherwise fall back to the clipboard.
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
