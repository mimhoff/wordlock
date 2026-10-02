import { describe, expect, it } from 'vitest';
import { MAX_GUESSES, toDifficulty } from './constants';
import { ANSWERS, isValidWord } from './dictionary';
import {
  activeLock,
  activeRowLetters,
  canToggleLock,
  pickUsed,
  toggleLockPick,
  createGame,
  deleteLetter,
  evaluateGuess,
  keyboardStates,
  submitGuess,
  typeLetter,
  type GameState,
} from './engine';
import { createDailyPuzzle, createPracticePuzzle, dailyNumber, decodeSeed, encodeSeed, generateLocks, type Puzzle } from './puzzle';
import { mulberry32 } from './rng';
import { buildShareText } from './shareText';
import { displayedStreak, emptyStats, recordResult } from './stats';

const puzzle = (answer: string, locks: (number | null)[]): Puzzle => ({ mode: 'practice', seed: 1, answer, locks });
const LOCKS = [null, 4, 0, 1, 2, 3, 4, null];

function type(state: GameState, letters: string) {
  return [...letters].reduce(typeLetter, state);
}

function play(state: GameState, ...words: string[]): GameState {
  for (const word of words) {
    // The locked tile is pre-filled, so only type the other letters.
    const lock = activeLock(state);
    if (lock && word[lock.position] !== lock.letter) throw new Error(`${word} breaks the lock`);
    const res = submitGuess(type(state, [...word].filter((_, i) => i !== lock?.position).join('')));
    if (!res.ok) throw new Error(`${word}: ${res.error}`);
    state = res.state;
  }
  return state;
}

describe('word lists', () => {
  it('has lowercase five-letter answers that are all valid guesses', () => {
    expect(ANSWERS.length).toBeGreaterThan(2000);
    expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
    for (const w of ANSWERS) {
      expect(w).toMatch(/^[a-z]{5}$/);
      expect(isValidWord(w)).toBe(true);
    }
    expect(isValidWord('zzzzz')).toBe(false);
  });
});

describe('locks', () => {
  it('never locks the first or last row, and never repeats a position on consecutive rows', () => {
    const bad: number[] = [];
    for (let seed = 0; seed < 2000; seed++) {
      const locks = generateLocks(mulberry32(seed));
      const middle = locks.slice(1, -1);
      const ok =
        locks.length === MAX_GUESSES &&
        locks[0] === null &&
        locks[MAX_GUESSES - 1] === null &&
        middle.every((p, i) => p !== null && p >= 0 && p < 5 && (i === 0 || p !== middle[i - 1]));
      if (!ok) bad.push(seed);
    }
    expect(bad).toEqual([]);
  });
});

describe('puzzles', () => {
  it('daily puzzles are deterministic per date and vary across dates', () => {
    expect(createDailyPuzzle('2026-10-01')).toEqual(createDailyPuzzle('2026-10-01'));
    const answers = new Set(Array.from({ length: 30 }, (_, d) => createDailyPuzzle(`2026-11-${String(d + 1).padStart(2, '0')}`).answer));
    expect(answers.size).toBeGreaterThan(25);
  });

  it('numbers daily puzzles from the epoch', () => {
    expect(dailyNumber('2026-10-01')).toBe(1);
    expect(dailyNumber('2026-10-02')).toBe(2);
    expect(dailyNumber('2027-10-01')).toBe(366);
  });

  it('round-trips practice seeds', () => {
    for (const seed of [0, 1, 123456, 0xffffffff]) expect(decodeSeed(encodeSeed(seed))).toBe(seed);
    expect(decodeSeed('not a seed!')).toBeNull();
    expect(createPracticePuzzle(42)).toEqual(createPracticePuzzle(42));
  });
});

describe('evaluateGuess', () => {
  it('scores greens, yellows and greys', () => {
    expect(evaluateGuess('crane', 'cider')).toEqual(['correct', 'present', 'absent', 'absent', 'present']);
  });

  it('does not over-count repeated letters', () => {
    expect(evaluateGuess('speed', 'abide')).toEqual(['absent', 'absent', 'present', 'absent', 'present']);
    expect(evaluateGuess('eerie', 'crepe')).toEqual(['present', 'absent', 'present', 'absent', 'correct']);
  });
});

describe('game engine', () => {
  it('pre-fills the locked tile with the letter from the previous guess', () => {
    const game = play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane');
    expect(activeLock(game)).toEqual({ position: 4, letter: 'e' });
    expect(activeRowLetters(game)).toEqual(['', '', '', '', 'e']);
  });

  it('typing skips the locked tile and stops when the row is full', () => {
    let game = play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane', 'plate');
    expect(activeLock(game)).toEqual({ position: 0, letter: 'p' });
    game = type(game, 'rizex');
    expect(activeRowLetters(game)).toEqual(['p', 'r', 'i', 'z', 'e']);
    game = deleteLetter(deleteLetter(game));
    expect(activeRowLetters(game)).toEqual(['p', 'r', 'i', '', '']);
    game = deleteLetter(deleteLetter(deleteLetter(game)));
    expect(activeRowLetters(game)).toEqual(['p', '', '', '', '']);
  });

  it('rejects incomplete rows and unknown words', () => {
    const game = createGame(puzzle('stare', LOCKS), 'standard');
    expect(submitGuess(type(game, 'cra'))).toEqual({ ok: false, error: 'Not enough letters' });
    expect(submitGuess(type(game, 'xxxxx'))).toEqual({ ok: false, error: 'Not in word list' });
  });

  it('wins when the answer is guessed', () => {
    const game = play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane', 'store', 'stare');
    expect(game.status).toBe('won');
    expect(activeLock(game)).toBeNull();
  });

  it('loses after the final row', () => {
    // Repeating a guess always satisfies the lock, so a game can never get stuck.
    const game = play(createGame(puzzle('stare', LOCKS), 'standard'), ...Array(MAX_GUESSES).fill('crane'));
    expect(game.status).toBe('lost');
    expect(submitGuess(game)).toEqual({ ok: false, error: 'Game over' });
  });

  it('maps difficulties saved by older builds, including the removed Expert mode', () => {
    expect(toDifficulty('standard')).toBe('standard');
    expect(toDifficulty('hidden')).toBe('hidden');
    expect(toDifficulty('expert')).toBe('hidden');
    expect(toDifficulty(undefined)).toBe('standard');
  });

  it('colours the keyboard with the best known state', () => {
    const game = play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane', 'tease');
    const keys = keyboardStates(game);
    expect(keys.a).toBe('correct');
    expect(keys.t).toBe('present');
    expect(keys.c).toBe('absent');
  });

  it('restores a saved game from its guesses', () => {
    const played = play(createGame(puzzle('stare', LOCKS), 'hidden'), 'crane', 'tease');
    const restored = createGame(played.puzzle, 'hidden', played.guesses, 'xy');
    expect(restored.evaluations).toEqual(played.evaluations);
    expect(restored.input).toBe('xy');
  });
});

describe('lock pick', () => {
  const fresh = () => play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane'); // row 1 locked at 4 ('e')

  it('opens the active lock so every tile can be typed', () => {
    const game = toggleLockPick(fresh(), 1);
    expect(activeLock(game)).toBeNull();
    expect(activeRowLetters(type(game, 'stare'))).toEqual(['s', 't', 'a', 'r', 'e']);
    expect(submitGuess(type(game, 'stare'))).toMatchObject({ ok: true, state: { status: 'won' } });
  });

  it('keeps typed letters in place when opening and restoring', () => {
    let game = type(fresh(), 'pla'); // P L A _ [E]
    game = toggleLockPick(game, 1);
    expect(activeRowLetters(game)).toEqual(['p', 'l', 'a', '', '']); // carried E not reached yet
    game = type(game, 'te');
    game = toggleLockPick(game, 1); // restore: E comes back locked
    expect(activeRowLetters(game)).toEqual(['p', 'l', 'a', 't', 'e']);
    expect(activeLock(game)).toEqual({ position: 4, letter: 'e' });
    expect(game.pickedRow).toBeNull();
  });

  it('keeps the carried letter as a normal letter when opened after typing past it', () => {
    let game = play(createGame(puzzle('stare', LOCKS), 'standard'), 'crane', 'plate'); // row 2 locked at 0 ('p')
    game = type(game, 'ar'); // [P] A R _ _
    game = toggleLockPick(game, 2);
    expect(activeRowLetters(game)).toEqual(['p', 'a', 'r', '', '']);
    game = deleteLetter(deleteLetter(deleteLetter(game)));
    expect(activeRowLetters(game)).toEqual(['', '', '', '', '']);
  });

  it('allows one pick per game, spent once its row is submitted', () => {
    let game = toggleLockPick(fresh(), 1);
    expect(canToggleLock(game, 3)).toBe(false); // already holding the pick on row 1
    game = play(game, 'stale');
    expect(pickUsed(game)).toBe(true);
    expect(canToggleLock(game, 2)).toBe(false);
    expect(toggleLockPick(game, 2)).toBe(game);
  });

  it('can pick a future lock in Standard but not with Hidden Locks', () => {
    const standard = toggleLockPick(fresh(), 4);
    expect(standard.pickedRow).toBe(4);
    expect(pickUsed(standard)).toBe(false); // not spent until row 4 is submitted
    const hidden = play(createGame(puzzle('stare', LOCKS), 'hidden'), 'crane');
    expect(canToggleLock(hidden, 4)).toBe(false);
    expect(canToggleLock(hidden, 1)).toBe(true);
  });

  it('never applies to unlocked rows or past rows', () => {
    const game = play(fresh(), 'plate');
    expect(canToggleLock(game, 0)).toBe(false);
    expect(canToggleLock(game, 1)).toBe(false);
    expect(canToggleLock(game, 7)).toBe(false);
  });

  it('shows in shared results', () => {
    const won = play(toggleLockPick(fresh(), 1), 'stare');
    const text = buildShareText({ ...won, puzzle: { ...won.puzzle, mode: 'daily', number: 3 } }, { highContrast: false });
    expect(text.split('\n')).toEqual(['WordLock #3 2/8 🔓', '', '⬛🟨🟩⬛🟩', '🟩🟩🟩🟩🔓']);
  });

  it('survives a save and reload', () => {
    const game = toggleLockPick(fresh(), 1);
    const restored = createGame(game.puzzle, game.difficulty, game.guesses, game.input, game.pickedRow);
    expect(activeLock(restored)).toBeNull();
  });
});

describe('stats', () => {
  it('tracks wins, distribution and daily streaks', () => {
    let s = emptyStats();
    s = recordResult(s, { won: true, guesses: 3, dailyNumber: 1 });
    s = recordResult(s, { won: true, guesses: 5, dailyNumber: 2 });
    expect(s).toMatchObject({ played: 2, won: 2, currentStreak: 2, maxStreak: 2 });
    expect(s.distribution).toEqual([0, 0, 1, 0, 1, 0, 0, 0]);
    expect(displayedStreak(s, 3)).toBe(2);
    expect(displayedStreak(s, 4)).toBe(0); // missed day 3
    s = recordResult(s, { won: true, guesses: 8, dailyNumber: 5 });
    expect(s).toMatchObject({ currentStreak: 1, maxStreak: 2 });
    s = recordResult(s, { won: false, guesses: 8, dailyNumber: 6 });
    expect(s).toMatchObject({ played: 4, won: 3, currentStreak: 0 });
    expect(s.cleanWins).toBe(3);
    s = recordResult(s, { won: true, guesses: 4, dailyNumber: 7, usedPick: true });
    expect(s).toMatchObject({ won: 4, cleanWins: 3 });
  });
});

describe('share text', () => {
  it('renders the grid with locks and no letters', () => {
    const game = play(createGame({ ...puzzle('stare', LOCKS), mode: 'daily', number: 7 }, 'standard'), 'crane', 'stare');
    expect(buildShareText(game, { highContrast: false, url: 'https://example.com/wordlock/' })).toBe(
      ['WordLock #7 2/8 🔒', '', '⬛🟨🟩⬛🟩', '🟩🟩🟩🟩🔒', '', 'https://example.com/wordlock/'].join('\n'),
    );
  });

  it('adds a replay link and difficulty for practice games', () => {
    const game = play(createGame(createPracticePuzzle(99), 'hidden'), ...Array(MAX_GUESSES).fill('crane'));
    const text = buildShareText(game, { highContrast: true, url: 'https://example.com/' });
    expect(text.split('\n')[0]).toBe(`WordLock Practice ${encodeSeed(99)} X/8 (Hidden Locks)`);
    expect(text).toContain(`https://example.com/?practice=${encodeSeed(99)}`);
  });
});
