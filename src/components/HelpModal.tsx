import { MAX_GUESSES } from '../game/constants';
import type { TileState } from '../game/engine';
import { Modal } from './Modal';
import { Tile, type TileProps } from './Tile';

function ExampleRow({ word, tiles }: { word: string; tiles: Record<number, Partial<TileProps>> }) {
  return (
    <div className="row example">
      {[...word].map((l, i) => (
        <Tile key={i} letter={l} {...tiles[i]} />
      ))}
    </div>
  );
}

const state = (s: TileState) => ({ state: s });

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <div className="help">
        <p>
          Guess the word in {MAX_GUESSES} tries. Each guess must be a valid five-letter word. The tiles change colour to
          show how close you were.
        </p>
        <ExampleRow word="crane" tiles={{ 0: state('correct') }} />
        <p>
          <strong>C</strong> is in the word and in the right spot.
        </p>
        <ExampleRow word="pilot" tiles={{ 1: state('present') }} />
        <p>
          <strong>I</strong> is in the word but in the wrong spot.
        </p>
        <ExampleRow word="vague" tiles={{ 3: state('absent') }} />
        <p>
          <strong>U</strong> is not in the word.
        </p>

        <h3>The lock</h3>
        <p>
          On every row except the first and last, one tile is <strong>locked</strong>. A locked tile is filled in for
          you with the letter from the same spot in your previous guess, and you can't change it.
        </p>
        <div className="row example">
          <Tile letter="c" state="absent" />
          <Tile letter="r" state="absent" />
          <Tile letter="a" state="correct" />
          <Tile letter="n" state="absent" />
          <Tile letter="e" state="present" />
        </div>
        <div className="row example">
          <Tile letter="s" />
          <Tile letter="t" />
          <Tile letter="a" />
          <Tile letter="" />
          <Tile letter="e" locked />
        </div>
        <p>
          Here the last tile is locked, so your next guess must end in <strong>E</strong>, even though you know E
          belongs somewhere else. Locks never fall in the same spot on two rows in a row.
        </p>
        <div className="row example">
          <Tile />
          <Tile lockHint />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <p>
          On <strong>Standard</strong> difficulty you can see where upcoming locks are, so plan ahead. On{' '}
          <strong>Hidden Locks</strong> and <strong>Expert</strong>, they only appear when the row becomes active.
        </p>

        <h3>Modes</h3>
        <p>
          <strong>Daily</strong>: everyone gets the same word and locks each day. <strong>Practice</strong>: play as
          many random puzzles as you like, and share a link so friends can play the same one.
        </p>
      </div>
    </Modal>
  );
}
