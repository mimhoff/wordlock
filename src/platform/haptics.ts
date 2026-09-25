import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const hapticsSupported = Capacitor.isNativePlatform();

export type HapticEvent = 'key' | 'error' | 'win';

/** Fire-and-forget vibration feedback in the native apps; a no-op on the web. */
export function haptic(event: HapticEvent): void {
  if (!hapticsSupported) return;
  const done =
    event === 'key'
      ? Haptics.impact({ style: ImpactStyle.Light })
      : Haptics.notification({ type: event === 'win' ? NotificationType.Success : NotificationType.Error });
  done.catch(() => {});
}
