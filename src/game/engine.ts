import { MAX_GUESSES, WORD_LENGTH, type Difficulty } from './constants';
import { isValidWord } from './dictionary';
import type { Puzzle } from './puzzle';

export type TileState = 'correct' | 'present' | 'absent';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  puzzle: Puzzle;
  difficulty: Difficulty;
  guesses: string[];
  evaluations: TileState[][];
  /** Letters typed into the active row's unlocked tiles, in order. */
  input: string;
  status: GameStatus;
  /**
   * Row whose lock the player opened with the game's single lock pick, or null. Until that
   * row is submitted the pick can be undone; afterwards it is spent.
   */
  pickedRow: number | null;
}

/** Standard Wordle scoring, handling repeated letters. */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill('absent');
  const remaining = new Map<string, number>();
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) result[i] = 'correct';
    else remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1);
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    const left = remaining.get(guess[i]) ?? 0;
    if (result[i] !== 'correct' && left > 0) {
      result[i] = 'present';
      remaining.set(guess[i], left - 1);
    }
  }
  return result;
}

export function createGame(
  puzzle: Puzzle,
  difficulty: Difficulty,
  guesses: string[] = [],
  input = '',
  pickedRow: number | null = null,
): GameState {
  const evaluations = guesses.map((g) => evaluateGuess(g, puzzle.answer));
  const won = guesses.at(-1) === puzzle.answer;
  const status: GameStatus = won ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing';
  return { puzzle, difficulty, guesses, evaluations, input: status === 'playing' ? input : '', status, pickedRow };
}

export const locksVisibleAhead = (d: Difficulty) => d === 'standard';

export interface ActiveLock {
  position: number;
  letter: string;
}

/** The lock on the active row, with the letter carried down from the previous guess. */
export function activeLock(state: GameState): ActiveLock | null {
  const row = state.guesses.length;
  const position = state.puzzle.locks[row];
  if (state.status !== 'playing' || position == null || row === 0 || state.pickedRow === row) return null;
  return { position, letter: state.guesses[row - 1][position] };
}

/** Tile positions the player types into on the active row (all but the lock). */
function openPositions(state: GameState): number[] {
  const lock = activeLock(state);
  return [...Array(WORD_LENGTH).keys()].filter((p) => p !== lock?.position);
}

/** The active row's letters by position ('' for empty), including the locked letter. */
export function activeRowLetters(state: GameState): string[] {
  const letters: string[] = Array(WORD_LENGTH).fill('');
  const lock = activeLock(state);
  if (lock) letters[lock.position] = lock.letter;
  openPositions(state).forEach((pos, i) => (letters[pos] = state.input[i] ?? ''));
  return letters;
}

/** The lock pick has been spent: the row it opened was submitted. */
export const pickUsed = (state: GameState) => state.pickedRow != null && state.pickedRow < state.guesses.length;

/**
 * Whether the lock on `row` can be picked now, or restored if it is the one already picked.
 * Any lock the player can see qualifies: the active row's, and in Standard also future rows'.
 */
export function canToggleLock(state: GameState, row: number): boolean {
  const active = state.guesses.length;
  if (state.status !== 'playing' || row < active || state.puzzle.locks[row] == null || row === 0) return false;
  if (row > active && !locksVisibleAhead(state.difficulty)) return false;
  return state.pickedRow == null || state.pickedRow === row;
}

/**
 * Opens the lock on `row` with the lock pick, or restores it. On the active row the letters
 * already typed stay in their tiles as far as possible (the carried letter stays as a normal,
 * editable letter when the player has typed past it).
 */
export function toggleLockPick(state: GameState, row: number): GameState {
  if (!canToggleLock(state, row)) return state;
  const opening = state.pickedRow !== row;
  const next: GameState = { ...state, pickedRow: opening ? row : null };
  if (row !== state.guesses.length) return next;
  const lockPosition = state.puzzle.locks[row]!;
  const letters = activeRowLetters(state);
  const kept = opening ? letters : letters.filter((_, i) => i !== lockPosition);
  const firstEmpty = kept.indexOf('');
  return { ...next, input: (firstEmpty === -1 ? kept : kept.slice(0, firstEmpty)).join('') };
}

export function typeLetter(state: GameState, letter: string): GameState {
  if (state.status !== 'playing' || state.input.length >= openPositions(state).length) return state;
  return { ...state, input: state.input + letter.toLowerCase() };
}

export function deleteLetter(state: GameState): GameState {
  if (state.status !== 'playing' || !state.input) return state;
  return { ...state, input: state.input.slice(0, -1) };
}

export type SubmitResult = { ok: true; state: GameState } | { ok: false; error: string };

export function submitGuess(state: GameState): SubmitResult {
  if (state.status !== 'playing') return { ok: false, error: 'Game over' };
  const letters = activeRowLetters(state);
  if (letters.some((l) => !l)) return { ok: false, error: 'Not enough letters' };
  const guess = letters.join('');
  if (!isValidWord(guess)) return { ok: false, error: 'Not in word list' };
  return { ok: true, state: createGame(state.puzzle, state.difficulty, [...state.guesses, guess], '', state.pickedRow) };
}

const RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state of each letter, for colouring the keyboard. */
export function keyboardStates(state: GameState): Record<string, TileState> {
  const keys: Record<string, TileState> = {};
  state.guesses.forEach((guess, r) =>
    [...guess].forEach((letter, i) => {
      const s = state.evaluations[r][i];
      if (!keys[letter] || RANK[s] > RANK[keys[letter]]) keys[letter] = s;
    }),
  );
  return keys;
}
