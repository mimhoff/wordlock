import { toDifficulty, type Difficulty, type GameMode } from './game/constants';
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
  pickedRow?: number | null;
}

function toSaved(game: GameState): SavedGame {
  const { puzzle, difficulty, guesses, input, pickedRow } = game;
  return { dateKey: puzzle.dateKey, seed: puzzle.seed, difficulty, guesses, input, pickedRow };
}

export function loadDailyGame(dateKey: string, difficulty: Difficulty): GameState {
  const saved = load<SavedGame | null>('game:daily', null);
  const puzzle = createDailyPuzzle(dateKey);
  if (saved?.dateKey === dateKey) return createGame(puzzle, toDifficulty(saved.difficulty), saved.guesses, saved.input, saved.pickedRow ?? null);
  return createGame(puzzle, difficulty);
}

export function newPracticeGame(difficulty: Difficulty, seed = randomSeed()): GameState {
  return createGame(createPracticePuzzle(seed), difficulty);
}

/** Resumes the saved practice game, unless a shared link asks for a different puzzle. */
export function loadPracticeGame(difficulty: Difficulty, requestedSeed: number | null): GameState {
  const saved = load<SavedGame | null>('game:practice', null);
  if (saved && (requestedSeed == null || requestedSeed === saved.seed)) {
    return createGame(createPracticePuzzle(saved.seed), toDifficulty(saved.difficulty), saved.guesses, saved.input, saved.pickedRow ?? null);
  }
  return newPracticeGame(difficulty, requestedSeed ?? undefined);
}

export const saveGame = (game: GameState) => save(`game:${game.puzzle.mode}`, toSaved(game));

export function loadStats(mode: GameMode): Stats {
  const saved = load<Partial<Stats>>(`stats:${mode}`, {});
  // Stats saved before the lock pick existed: every win was a clean win.
  return { ...emptyStats(), ...saved, cleanWins: saved.cleanWins ?? saved.won ?? 0 };
}
export const saveStats = (mode: GameMode, stats: Stats) => save(`stats:${mode}`, stats);

export function loadSettings(): Settings {
  const settings = { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>('settings', {}) };
  return { ...settings, difficulty: toDifficulty(settings.difficulty) };
}
export const saveSettings = (settings: Settings) => save('settings', settings);

export const loadMode = () => load<GameMode>('mode', 'daily');
export const saveMode = (mode: GameMode) => save('mode', mode);

export const hasSeenHelp = () => load('seenHelp', false);
export const markHelpSeen = () => save('seenHelp', true);

export const hasSeenPickTip = () => load('seenPickTip', false);
export const markPickTipSeen = () => save('seenPickTip', true);
