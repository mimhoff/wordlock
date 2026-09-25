import type { TileState } from '../game/engine';
import { LockIcon } from './icons';

export interface TileProps {
  letter?: string;
  state?: TileState;
  /** Future row with a visible lock: show only the padlock. */
  lockHint?: boolean;
  /** Active row's locked tile: red with the carried-down letter. */
  locked?: boolean;
  /** Evaluated tile that was locked: keep a small padlock badge. */
  wasLocked?: boolean;
  /** Index within a row that is currently flipping, for staggered animation. */
  revealIndex?: number;
}

export function Tile({ letter, state, lockHint, locked, wasLocked, revealIndex }: TileProps) {
  const classes = ['tile'];
  if (letter) classes.push('filled');
  if (state) classes.push(state);
  if (locked) classes.push('locked');
  if (lockHint) classes.push('lock-hint');
  if (revealIndex != null) classes.push('reveal');

  const label = [
    letter ? letter.toUpperCase() : 'empty',
    state,
    locked || wasLocked ? 'locked' : lockHint ? 'will be locked' : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={classes.join(' ')}
      style={revealIndex != null ? ({ '--i': revealIndex } as React.CSSProperties) : undefined}
      role="img"
      aria-label={label}
    >
      {lockHint && !letter ? <LockIcon className="tile-lock" /> : letter?.toUpperCase()}
      {(locked || wasLocked) && <LockIcon className="tile-badge" />}
    </div>
  );
}
