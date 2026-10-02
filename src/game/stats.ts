import { MAX_GUESSES } from './constants';

export interface Stats {
  played: number;
  won: number;
  /** Wins without using the lock pick. */
  cleanWins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = games won in i + 1 guesses. */
  distribution: number[];
  /** Daily only: number of the last daily puzzle completed, used to detect broken streaks. */
  lastDaily?: number;
}

export const emptyStats = (): Stats => ({
  played: 0,
  won: 0,
  cleanWins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
});

export interface GameResult {
  won: boolean;
  guesses: number;
  dailyNumber?: number;
  /** Whether the lock pick was used. */
  usedPick?: boolean;
}

export function recordResult(stats: Stats, result: GameResult): Stats {
  // A daily puzzle only counts once (e.g. a v2 player who already played today's daily).
  if (result.dailyNumber != null && stats.lastDaily === result.dailyNumber) return stats;
  const continuesStreak = result.dailyNumber == null || stats.lastDaily === result.dailyNumber - 1;
  const currentStreak = result.won ? (continuesStreak ? stats.currentStreak : 0) + 1 : 0;
  const distribution = [...stats.distribution];
  if (result.won) distribution[result.guesses - 1]++;
  return {
    played: stats.played + 1,
    won: stats.won + (result.won ? 1 : 0),
    cleanWins: stats.cleanWins + (result.won && !result.usedPick ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
    lastDaily: result.dailyNumber ?? stats.lastDaily,
  };
}

/** A daily streak lapses if yesterday's puzzle wasn't completed. */
export function displayedStreak(stats: Stats, todayNumber?: number): number {
  if (todayNumber == null || stats.lastDaily == null) return stats.currentStreak;
  return stats.lastDaily >= todayNumber - 1 ? stats.currentStreak : 0;
}
