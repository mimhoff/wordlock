import { MAX_GUESSES, WORD_LENGTH } from '../game/constants';
import { activeLock, activeRowLetters, canToggleLock, cursorPosition, locksVisibleAhead, type GameState } from '../game/engine';
import { Tile } from './Tile';

interface BoardProps {
  game: GameState;
  /** Row currently flipping to reveal its colours. */
  revealRow: number | null;
  shake: boolean;
  /** Row to celebrate with a bounce after a win. */
  bounceRow: number | null;
  onToggleLock: (row: number) => void;
}

const COLUMNS = [...Array(WORD_LENGTH).keys()];

export function Board({ game, revealRow, shake, bounceRow, onToggleLock }: BoardProps) {
  // The next row (and its lock) only activates once the previous row has finished flipping.
  const activeRow = game.status === 'playing' && revealRow == null ? game.guesses.length : -1;
  const lock = activeLock(game);
  const activeLetters = activeRowLetters(game);
  const cursor = activeRow === -1 ? null : cursorPosition(game);
  const showFutureLocks = locksVisibleAhead(game.difficulty);

  return (
    <div className="board" role="grid" aria-label="Game board">
      {[...Array(MAX_GUESSES).keys()].map((r) => {
        const rowClasses = ['row'];
        if (r === activeRow && shake) rowClasses.push('shake');
        if (r === bounceRow) rowClasses.push('bounce');
        const lockPos = game.puzzle.locks[r];
        const pickedHere = game.pickedRow === r;
        const toggle = revealRow == null && canToggleLock(game, r) ? () => onToggleLock(r) : undefined;

        return (
          <div key={r} className={rowClasses.join(' ')} role="row">
            {COLUMNS.map((c) => {
              const isLockTile = lockPos === c;
              if (r < game.guesses.length) {
                return (
                  <Tile
                    key={c}
                    letter={game.guesses[r][c]}
                    state={game.evaluations[r][c]}
                    wasLocked={isLockTile && !pickedHere}
                    wasPicked={isLockTile && pickedHere}
                    revealIndex={r === revealRow ? c : undefined}
                  />
                );
              }
              if (r === activeRow) {
                return (
                  <Tile
                    key={c}
                    letter={activeLetters[c]}
                    locked={lock?.position === c}
                    picked={isLockTile && pickedHere}
                    cursor={c === cursor}
                    onToggleLock={isLockTile ? toggle : undefined}
                  />
                );
              }
              const visible = isLockTile && (showFutureLocks || pickedHere);
              return (
                <Tile
                  key={c}
                  lockHint={visible && !pickedHere}
                  picked={visible && pickedHere}
                  onToggleLock={visible ? toggle : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
