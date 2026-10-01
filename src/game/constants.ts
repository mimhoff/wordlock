export const WORD_LENGTH = 5;
export const MAX_GUESSES = 8;

/** Local date of daily puzzle #1. Puzzle numbers count days from here. */
export const DAILY_EPOCH = '2026-10-01';

export type GameMode = 'daily' | 'practice';

export type Difficulty = 'standard' | 'hidden' | 'expert';

export const DIFFICULTIES: Record<Difficulty, { label: string; description: string }> = {
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
    description: 'Hidden locks, plus revealed hints must be used: green letters stay put and yellow letters must be reused.',
  },
};

export const WIN_MESSAGES = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Nice', 'Phew', 'Clutch'];
