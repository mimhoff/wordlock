export const WORD_LENGTH = 5;
export const MAX_GUESSES = 8;

/** Local date of daily puzzle #1. Puzzle numbers count days from here. */
export const DAILY_EPOCH = '2026-10-02';

export type GameMode = 'daily' | 'practice';

export type Difficulty = 'standard' | 'hidden';

export const DIFFICULTIES: Record<Difficulty, { label: string; description: string }> = {
  standard: {
    label: 'Standard',
    description: 'Every lock is visible from the start, so you can plan ahead.',
  },
  hidden: {
    label: 'Hidden Locks',
    description: 'A lock is only revealed when its row becomes active. No planning ahead.',
  },
};

/**
 * Reads a saved difficulty. An earlier build had an 'expert' mode (hidden locks plus a
 * hard-mode rule); it maps to its closest remaining mode, Hidden Locks.
 */
export function toDifficulty(value: unknown): Difficulty {
  if (value === 'standard' || value === 'hidden') return value;
  return value === 'expert' ? 'hidden' : 'standard';
}

/** Toast after a win, indexed by guesses used (1–8). */
export const WIN_MESSAGES = ['Picked it!', 'Brilliant', 'Sharp', 'Solid', 'Nice', 'Good', 'Close one', 'Just made it'];
