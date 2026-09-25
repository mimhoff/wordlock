import { DIFFICULTIES, MAX_GUESSES } from './constants';
import type { GameState, TileState } from './engine';
import { encodeSeed } from './puzzle';

const SQUARES: Record<TileState, [normal: string, highContrast: string]> = {
  correct: ['🟩', '🟧'],
  present: ['🟨', '🟦'],
  absent: ['⬛', '⬛'],
};

/**
 * Spoiler-free result grid. Locked tiles are shown as 🔒 — their colour always repeats
 * the tile above, so the lock pattern is the more interesting information.
 */
export function buildShareText(state: GameState, opts: { highContrast: boolean; url?: string }): string {
  const { puzzle } = state;
  const score = state.status === 'won' ? state.guesses.length : 'X';
  const title = puzzle.mode === 'daily' ? `WordLock #${puzzle.number}` : `WordLock Practice ${encodeSeed(puzzle.seed)}`;
  const mark = state.difficulty === 'standard' ? '' : ` (${DIFFICULTIES[state.difficulty].label})`;
  const grid = state.evaluations.map((row, r) =>
    row.map((s, i) => (puzzle.locks[r] === i ? '🔒' : SQUARES[s][opts.highContrast ? 1 : 0])).join(''),
  );
  let url = opts.url;
  if (url && puzzle.mode === 'practice') {
    url += `${url.includes('?') ? '&' : '?'}practice=${encodeSeed(puzzle.seed)}`;
  }
  return [`${title} ${score}/${MAX_GUESSES}${mark}`, '', ...grid, ...(url ? ['', url] : [])].join('\n');
}
