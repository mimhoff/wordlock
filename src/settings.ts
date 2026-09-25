import type { Difficulty } from './game/constants';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  difficulty: Difficulty;
  theme: Theme;
  highContrast: boolean;
  /** Vibration feedback (native apps only). */
  haptics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'standard',
  theme: 'system',
  highContrast: false,
  haptics: true,
};
