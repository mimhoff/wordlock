import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { KOFI_URL } from '../config';
import type { GameState } from '../game/engine';
import { msUntilNextDay } from '../game/puzzle';
import { displayedStreak, type Stats } from '../game/stats';
import { Modal } from './Modal';

interface StatsModalProps {
  game: GameState;
  stats: Stats;
  todayNumber: number;
  onClose: () => void;
  onShare: () => void;
  onNewGame: () => void;
}

function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextDay(new Date()));
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextDay(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="countdown">
      {pad(Math.floor(total / 3600))}:{pad(Math.floor((total % 3600) / 60))}:{pad(total % 60)}
    </span>
  );
}

export function StatsModal({ game, stats, todayNumber, onClose, onShare, onNewGame }: StatsModalProps) {
  const isDaily = game.puzzle.mode === 'daily';
  const finished = game.status !== 'playing';
  const winPct = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxCount = Math.max(1, ...stats.distribution);
  const highlight = game.status === 'won' ? game.guesses.length - 1 : -1;

  const figures: [number, string][] = [
    [stats.played, 'Played'],
    [winPct, 'Win %'],
    [displayedStreak(stats, isDaily ? todayNumber : undefined), 'Current Streak'],
    [stats.maxStreak, 'Max Streak'],
    [stats.cleanWins, 'Clean Wins'],
  ];

  return (
    <Modal title={isDaily ? 'Daily statistics' : 'Practice statistics'} onClose={onClose}>
      {game.status === 'lost' && (
        <p className="answer-reveal">
          The word was <strong>{game.puzzle.answer.toUpperCase()}</strong>
        </p>
      )}
      <div className="stat-figures">
        {figures.map(([value, label]) => (
          <div key={label} className="stat">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <h3>Guess distribution</h3>
      <div className="distribution">
        {stats.distribution.map((count, i) => (
          <div key={i} className="dist-row">
            <span className="dist-label">{i + 1}</span>
            <div
              className={`dist-bar ${i === highlight ? 'highlight' : ''}`}
              style={{ width: `${Math.max(7, (count / maxCount) * 100)}%` }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>

      {(finished || !isDaily) && (
        <div className="stats-footer">
          {isDaily ? (
            <div className="next-puzzle">
              <div className="stat-label">Next WordLock</div>
              <Countdown />
            </div>
          ) : (
            <button className="button secondary" onClick={onNewGame}>
              New game
            </button>
          )}
          {finished && (
            <button className="button primary" onClick={onShare}>
              Share
            </button>
          )}
        </div>
      )}

      {/* Website only: app stores require their own billing for payments in apps. */}
      {KOFI_URL && !Capacitor.isNativePlatform() && (
        <div className="support">
          <span>Enjoying WordLock?</span>
          <a className="kofi-link" href={KOFI_URL} target="_blank" rel="noopener noreferrer">
            ☕ Support on Ko-fi
          </a>
        </div>
      )}
    </Modal>
  );
}
