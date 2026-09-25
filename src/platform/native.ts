import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Android hardware back button. `handler` returns true if it handled the press
 * (e.g. closed a dialog); otherwise the app exits, matching platform conventions.
 */
export function onBackButton(handler: () => boolean): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  const listener = App.addListener('backButton', () => {
    if (!handler()) void App.exitApp();
  });
  return () => void listener.then((l) => l.remove());
}
