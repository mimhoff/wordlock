import type { Difficulty, GameMode } from './game/constants';
import { createGame, type GameState } from './game/engine';
import { createDailyPuzzle, createPracticePuzzle } from './game/puzzle';
import { randomSeed } from './game/rng';
import { emptyStats, type Stats } from './game/stats';
import { load, save } from './platform/storage';
import { DEFAULT_SETTINGS, type Settings } from './settings';

/** Only the inputs are saved; the puzzle and evaluations are re-derived on load. */
interface SavedGame {
  dateKey?: string;
  seed: number;
  difficulty: Difficulty;
  guesses: string[];
  input: string;
}

function toSaved(game: GameState): SavedGame {
  const { puzzle, difficulty, guesses, input } = game;
  return { dateKey: puzzle.dateKey, seed: puzzle.seed, difficulty, guesses, input };
}

export function loadDailyGame(dateKey: string, difficulty: Difficulty): GameState {
  const saved = load<SavedGame | null>('game:daily', null);
  const puzzle = createDailyPuzzle(dateKey);
  if (saved?.dateKey === dateKey) return createGame(puzzle, saved.difficulty, saved.guesses, saved.input);
  return createGame(puzzle, difficulty);
}

export function newPracticeGame(difficulty: Difficulty, seed = randomSeed()): GameState {
  return createGame(createPracticePuzzle(seed), difficulty);
}

/** Resumes the saved practice game, unless a shared link asks for a different puzzle. */
export function loadPracticeGame(difficulty: Difficulty, requestedSeed: number | null): GameState {
  const saved = load<SavedGame | null>('game:practice', null);
  if (saved && (requestedSeed == null || requestedSeed === saved.seed)) {
    return createGame(createPracticePuzzle(saved.seed), saved.difficulty, saved.guesses, saved.input);
  }
  return newPracticeGame(difficulty, requestedSeed ?? undefined);
}

export const saveGame = (game: GameState) => save(`game:${game.puzzle.mode}`, toSaved(game));

export const loadStats = (mode: GameMode) => ({ ...emptyStats(), ...load<Partial<Stats>>(`stats:${mode}`, {}) });
export const saveStats = (mode: GameMode, stats: Stats) => save(`stats:${mode}`, stats);

export const loadSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>('settings', {}) });
export const saveSettings = (settings: Settings) => save('settings', settings);

export const loadMode = () => load<GameMode>('mode', 'daily');
export const saveMode = (mode: GameMode) => save('mode', mode);

export const hasSeenHelp = () => load('seenHelp', false);
export const markHelpSeen = () => save('seenHelp', true);
