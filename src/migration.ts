import { MAX_GUESSES } from './game/constants';
import { dailyNumber } from './game/puzzle';
import type { Stats } from './game/stats';
import { has, load, loadLegacy, save } from './platform/storage';
import type { Settings } from './settings';

/** Daily stats as stored by WordLock v2 (the plain-JS version) under the `stats` key. */
export interface LegacyStats {
  gamesPlayed?: number;
  gamesWon?: number;
  currentStreak?: number;
  maxStreak?: number;
  guessDistribution?: number[];
  /** Date of the last daily played, as YYYYMMDD. */
  lastGameDate?: string | number;
}

export function convertLegacyStats(old: LegacyStats): Stats {
  const distribution = Array.from({ length: MAX_GUESSES }, (_, i) => Number(old.guessDistribution?.[i]) || 0);
  const date = String(old.lastGameDate ?? '');
  const lastDaily = /^\d{8}$/.test(date)
    ? dailyNumber(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`)
    : undefined;
  return {
    played: old.gamesPlayed ?? 0,
    won: old.gamesWon ?? 0,
    cleanWins: old.gamesWon ?? 0, // v2 had no lock pick
    currentStreak: old.currentStreak ?? 0,
    maxStreak: old.maxStreak ?? 0,
    distribution,
    lastDaily,
  };
}

/**
 * One-time import of v2 data: daily stats, theme and whether the help has been seen.
 * v2 data is left in place, so it's safe to roll back.
 */
export function migrateLegacyData(): void {
  if (load('migrated', false)) return;

  const stats = loadLegacy<LegacyStats>('stats');
  if (stats && !has('stats:daily')) save('stats:daily', convertLegacyStats(stats));

  const hasVisited = loadLegacy<boolean>('hasVisited');
  if (hasVisited) save('seenHelp', true);

  // v2 defaulted to dark, and a bug (an un-awaited async load) meant it usually saved the
  // theme as "{}", so returning v2 players have always seen dark. Keep it that way.
  const theme = loadLegacy<unknown>('theme');
  if ((stats || hasVisited || theme != null) && !has('settings')) {
    save<Partial<Settings>>('settings', { theme: theme === 'light' ? 'light' : 'dark' });
  }

  save('migrated', true);
}
