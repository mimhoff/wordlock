import { MAX_GUESSES } from '../game/constants';
import { Modal } from './Modal';
import { Tile } from './Tile';

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <div className="help">
        <p>
          Find the hidden five-letter word in {MAX_GUESSES} guesses. After each guess, the tiles show how close you
          were.
        </p>
        <div className="row example">
          <Tile letter="b" state="correct" />
          <Tile letter="r" state="present" />
          <Tile letter="a" state="absent" />
          <Tile letter="k" state="absent" />
          <Tile letter="e" state="absent" />
        </div>
        <p>
          <strong>B</strong> is in the right spot. <strong>R</strong> is in the word, but somewhere else.{' '}
          <strong>A</strong>, <strong>K</strong> and <strong>E</strong> aren't in the word.
        </p>

        <h3>Every row locks a letter</h3>
        <p>
          From the second row on, one tile in each row is <strong>locked</strong>. It keeps the letter from the same
          spot in your previous guess, and you can't change it.
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
          <Tile />
          <Tile letter="e" locked />
        </div>
        <p>
          Here the last spot is locked, so this guess has to end in <strong>E</strong>, even though E belongs somewhere
          else. The first and last rows are always free, and a lock never lands in the same spot twice in a row.
        </p>

        <h3>Plan ahead</h3>
        <div className="row example">
          <Tile />
          <Tile lockHint />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <p>
          On <strong>Standard</strong> you can see where the upcoming locks are, so pick guesses that leave useful
          letters behind. On <strong>Hidden Locks</strong>, each lock only appears when you reach its row.
        </p>

        <h3>Your lock pick</h3>
        <div className="row example">
          <Tile letter="s" />
          <Tile letter="t" />
          <Tile letter="a" />
          <Tile letter="r" />
          <Tile letter="e" picked />
        </div>
        <p>
          Once per game, tap or click a lock to open it and play that row freely. Changed your mind? Tap it again to
          put the lock back, any time before you submit. Shared results show 🔑 where you used it, or 🔒 if you won
          without it.
        </p>

        <h3>Daily and practice</h3>
        <p>
          <strong>Daily</strong> is a new puzzle every midnight, with the same word and locks for everyone.{' '}
          <strong>Practice</strong> is unlimited, and you can share a practice puzzle's link to challenge friends.
        </p>
      </div>
    </Modal>
  );
}
