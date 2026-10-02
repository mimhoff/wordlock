import type { TileState } from '../game/engine';
import { KeyIcon, LockIcon, LockOpenIcon } from './icons';

export interface TileProps {
  letter?: string;
  state?: TileState;
  /** Future row with a visible lock: show only the padlock. */
  lockHint?: boolean;
  /** Active row's locked tile: red with the carried-down letter. */
  locked?: boolean;
  /** Evaluated tile that was locked: keep a small padlock badge. */
  wasLocked?: boolean;
  /** A lock opened with the lock pick that can still be restored. */
  picked?: boolean;
  /** Evaluated tile whose lock was picked: keep an open-padlock badge. */
  wasPicked?: boolean;
  /** The tile the next typed letter goes to. */
  cursor?: boolean;
  /** Makes the tile a button that picks (or restores) its lock. */
  onToggleLock?: () => void;
  /** Index within a row that is currently flipping, for staggered animation. */
  revealIndex?: number;
}

export function Tile({ letter, state, lockHint, locked, wasLocked, picked, wasPicked, cursor, onToggleLock, revealIndex }: TileProps) {
  const classes = ['tile'];
  if (letter) classes.push('filled');
  if (state) classes.push(state);
  if (locked) classes.push('locked');
  if (lockHint) classes.push('lock-hint');
  if (picked) classes.push('picked');
  if (onToggleLock) classes.push('pickable');
  if (cursor) classes.push('cursor');
  if (revealIndex != null) classes.push('reveal');

  const lockText = locked || wasLocked ? 'locked' : picked || wasPicked ? 'lock picked' : lockHint ? 'will be locked' : undefined;
  const label = [letter ? letter.toUpperCase() : 'empty', state, lockText].filter(Boolean).join(', ');
  const style = revealIndex != null ? ({ '--i': revealIndex } as React.CSSProperties) : undefined;

  // The big centred icon on an empty future tile, and the small corner badge on a lettered one.
  const centre = !letter && (lockHint || picked);
  const content = (
    <>
      {centre ? (
        picked ? <LockOpenIcon className="tile-lock" /> : <LockIcon className="tile-lock lock-shut" />
      ) : (
        letter?.toUpperCase()
      )}
      {centre && onToggleLock && !picked && <KeyIcon className="tile-lock lock-key" />}
      {!centre && (locked || wasLocked) && <LockIcon className="tile-badge lock-shut" />}
      {!centre && (picked || wasPicked) && <LockOpenIcon className="tile-badge" />}
      {!centre && locked && onToggleLock && <KeyIcon className="tile-badge lock-key" />}
      {onToggleLock && !picked && <KeyIcon className="touch-key" aria-hidden="true" />}
    </>
  );

  if (onToggleLock) {
    return (
      <button
        type="button"
        className={classes.join(' ')}
        style={style}
        onClick={onToggleLock}
        aria-label={`${label}. ${picked ? 'Restore the lock' : 'Pick this lock (once per game)'}`}
        title={picked ? 'Restore the lock' : 'Pick this lock (once per game)'}
      >
        {content}
      </button>
    );
  }
  return (
    <div className={classes.join(' ')} style={style} role="img" aria-label={label}>
      {content}
    </div>
  );
}
