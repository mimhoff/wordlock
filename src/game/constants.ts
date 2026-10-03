export const WORD_LENGTH = 5;
export const MAX_GUESSES = 8;

/** Local date of daily puzzle #1. Puzzle numbers count days from here. */
export const DAILY_EPOCH = '2026-10-01';

export type GameMode = 'daily' | 'practice';

export type Difficulty = 'standard' | 'hidden' | 'expert';

export const DIFFICULTIES: Record<Difficulty, { label: string; description: string; plus?: boolean }> = {
  standard: {
    label: 'Standard',
    description: 'Every lock is visible from the start, so you can plan ahead.',
  },
  hidden: {
    label: 'Hidden Locks',
    description: 'A lock is only revealed when its row becomes active. No planning ahead.',
  },
  expert: {
    label: 'Expert',
    description: 'You start from a given word, so the locks bite from your first move. No lock pick.',
    plus: true,
  },
};

/** Reads a saved difficulty, falling back to Standard for anything unknown. */
export function toDifficulty(value: unknown): Difficulty {
  return value === 'hidden' || value === 'expert' ? value : 'standard';
}

/** Toast after a win, indexed by guesses used (1–8). */
export const WIN_MESSAGES = ['Picked it!', 'Brilliant', 'Sharp', 'Solid', 'Nice', 'Good', 'Close one', 'Just made it'];
