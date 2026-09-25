import { DAILY_EPOCH, MAX_GUESSES, WORD_LENGTH, type GameMode } from './constants';
import { ANSWERS } from './dictionary';
import { hashString, mulberry32, randomInt } from './rng';

export interface Puzzle {
  mode: GameMode;
  seed: number;
  answer: string;
  /**
   * Locked tile position for each row, or null for no lock. The first and last rows are
   * never locked, and no two consecutive rows share a lock position.
   */
  locks: (number | null)[];
  /** Daily only: the local date (YYYY-MM-DD) and puzzle number. */
  dateKey?: string;
  number?: number;
}

export function generateLocks(rng: () => number): (number | null)[] {
  const locks: (number | null)[] = [null];
  for (let row = 1; row < MAX_GUESSES - 1; row++) {
    const prev = locks[row - 1];
    const options = [...Array(WORD_LENGTH).keys()].filter((p) => p !== prev);
    locks.push(options[randomInt(rng, options.length)]);
  }
  locks.push(null);
  return locks;
}

function buildPuzzle(mode: GameMode, seed: number): Puzzle {
  const rng = mulberry32(seed);
  const answer = ANSWERS[randomInt(rng, ANSWERS.length)];
  return { mode, seed, answer, locks: generateLocks(rng) };
}

/** Local calendar date as YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dailyNumber(dateKey: string): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(dateKey) - toUtc(DAILY_EPOCH)) / 86_400_000) + 1;
}

/** The daily puzzle is seeded by a hash of the date, so every player gets the same one. */
export function createDailyPuzzle(dateKey: string): Puzzle {
  return { ...buildPuzzle('daily', hashString(`wordlock:${dateKey}`)), dateKey, number: dailyNumber(dateKey) };
}

export function createPracticePuzzle(seed: number): Puzzle {
  return buildPuzzle('practice', seed >>> 0);
}

/** Practice seeds are shown/shared in base 36 so links stay short. */
export const encodeSeed = (seed: number) => (seed >>> 0).toString(36).toUpperCase();

export function decodeSeed(code: string | null | undefined): number | null {
  if (!code || !/^[0-9a-z]{1,7}$/i.test(code)) return null;
  const n = parseInt(code, 36);
  return Number.isFinite(n) && n <= 0xffffffff ? n : null;
}

export function msUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}
