import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from './components/Board';
import { HelpModal } from './components/HelpModal';
import { HelpIcon, KeyIcon, LockIcon, NewGameIcon, SettingsIcon, StatsIcon } from './components/icons';
import { Keyboard } from './components/Keyboard';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { Toasts, useToasts } from './components/Toasts';
import { DIFFICULTIES, WIN_MESSAGES, WORD_LENGTH, type GameMode } from './game/constants';
import {
  activeLock,
  deleteLetter,
  keyboardStates,
  pickUsed,
  submitGuess,
  toggleLockPick,
  typeLetter,
  type GameState,
} from './game/engine';
import { dailyNumber, decodeSeed, encodeSeed, toDateKey } from './game/puzzle';
import { buildShareText } from './game/shareText';
import { recordResult } from './game/stats';
import * as persist from './persistence';
import { haptic, type HapticEvent } from './platform/haptics';
import { onBackButton } from './platform/native';
import { shareText, shareUrl } from './platform/share';
import type { Settings } from './settings';

type ModalKind = 'help' | 'stats' | 'settings' | null;

type PickState = 'ready' | 'active' | 'used';
const PICK_LABELS: Record<PickState, string> = { ready: '1 pick', active: 'Picking', used: 'Picked' };
const PICK_TITLES: Record<PickState, string> = {
  ready: 'Lock pick: tap any lock to open it. One per game.',
  active: 'A lock is open. Tap it again to restore it before you submit that row.',
  used: 'Your lock pick has been used this game.',
};

const FLIP_STAGGER_MS = 250;
const FLIP_MS = 500;
const REVEAL_MS = FLIP_STAGGER_MS * (WORD_LENGTH - 1) + FLIP_MS;

export default function App() {
  const [settings, setSettings] = useState(persist.loadSettings);
  const [today, setToday] = useState(() => toDateKey(new Date()));
  const [linkedSeed] = useState(() => decodeSeed(new URLSearchParams(location.search).get('practice')));
  const [mode, setMode] = useState<GameMode>(() => (linkedSeed != null ? 'practice' : persist.loadMode()));
  const [daily, setDaily] = useState(() => persist.loadDailyGame(today, settings.difficulty));
  const [practice, setPractice] = useState(() => persist.loadPracticeGame(settings.difficulty, linkedSeed));
  const [stats, setStats] = useState(() => ({
    daily: persist.loadStats('daily'),
    practice: persist.loadStats('practice'),
  }));
  const [modal, setModal] = useState<ModalKind>(() => (persist.hasSeenHelp() ? null : 'help'));
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [bounceRow, setBounceRow] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const { toasts, showToast } = useToasts();

  const game = mode === 'daily' ? daily : practice;
  const setGame = mode === 'daily' ? setDaily : setPractice;

  // --- persistence -------------------------------------------------------------------
  useEffect(() => persist.saveGame(daily), [daily]);
  useEffect(() => persist.saveGame(practice), [practice]);
  useEffect(() => persist.saveSettings(settings), [settings]);
  useEffect(() => persist.saveMode(mode), [mode]);

  // A shared practice link has been consumed once loaded; keep the address bar clean.
  useEffect(() => {
    if (linkedSeed != null) history.replaceState(null, '', location.pathname);
  }, [linkedSeed]);

  // --- theme -------------------------------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  }, [settings.theme, settings.highContrast]);

  // --- daily rollover while the app stays open ---------------------------------------
  useEffect(() => {
    const check = () => {
      const key = toDateKey(new Date());
      if (key === today) return;
      setToday(key);
      setDaily(persist.loadDailyGame(key, settings.difficulty));
    };
    const id = setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, [today, settings.difficulty]);

  // --- game actions ------------------------------------------------------------------
  const buzz = useCallback((event: HapticEvent) => settings.haptics && haptic(event), [settings.haptics]);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (modal === 'help') persist.markHelpSeen();
  }, [modal]);

  const finishGame = useCallback(
    (finished: GameState) => {
      const m = finished.puzzle.mode;
      const rows = finished.guesses.length;
      setStats((s) => {
        const updated = recordResult(s[m], {
          won: finished.status === 'won',
          guesses: rows,
          dailyNumber: finished.puzzle.number,
          usedPick: pickUsed(finished),
        });
        persist.saveStats(m, updated);
        return { ...s, [m]: updated };
      });
      if (finished.status === 'won') {
        setBounceRow(rows - 1);
        setTimeout(() => setBounceRow(null), 1000);
        showToast(WIN_MESSAGES[rows - 1]);
        buzz('win');
      } else {
        showToast(finished.puzzle.answer.toUpperCase(), 1900);
      }
      setTimeout(() => setModal('stats'), 2000);
    },
    [showToast, buzz],
  );

  const submit = useCallback(() => {
    const result = submitGuess(game);
    if (!result.ok) {
      showToast(result.error);
      buzz('error');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    const next = result.state;
    setGame(next);
    setRevealRow(game.guesses.length);
    setTimeout(() => {
      setRevealRow(null);
      if (next.status !== 'playing') finishGame(next);
    }, REVEAL_MS);
  }, [game, setGame, showToast, finishGame, buzz]);

  const handleKey = useCallback(
    (key: string) => {
      if (modal || revealRow != null || game.status !== 'playing') return;
      if (key === 'Enter') submit();
      else if (key === 'Backspace') setGame(deleteLetter(game));
      else if (/^[a-z]$/i.test(key)) setGame(typeLetter(game, key));
    },
    [modal, revealRow, game, setGame, submit],
  );

  const toggleLock = useCallback(
    (row: number) => {
      if (modal || revealRow != null) return;
      buzz('key');
      setGame(toggleLockPick(game, row));
    },
    [modal, revealRow, game, setGame, buzz],
  );

  // One-time tip the first time a lock is in play.
  useEffect(() => {
    if (modal || revealRow != null || game.status !== 'playing' || persist.hasSeenPickTip()) return;
    if (!activeLock(game) && game.pickedRow == null) return;
    persist.markPickTipSeen();
    showToast('Tip: tap a lock to pick it. You get one per game.', 4500);
  }, [modal, revealRow, game, showToast]);

  // Physical keyboard. Read the latest handler through a ref so the listener is attached once.
  const handleKeyRef = useRef(handleKey);
  handleKeyRef.current = handleKey;
  const modalRef = useRef(modal);
  modalRef.current = modal;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') return setModal(null);
      if (modalRef.current) return;
      // Stops Enter from also "clicking" whichever button last had focus.
      if (e.key === 'Enter') e.preventDefault();
      handleKeyRef.current(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => onBackButton(() => (modalRef.current ? (setModal(null), true) : false)), []);

  const startPractice = useCallback(() => {
    setPractice(persist.newPracticeGame(settings.difficulty));
    setMode('practice');
    setModal(null);
  }, [settings.difficulty]);

  const switchMode = (m: GameMode) => {
    if (revealRow == null) setMode(m);
  };

  const updateSettings = (next: Settings) => {
    setSettings(next);
    if (next.difficulty !== settings.difficulty) {
      // Difficulty is fixed once a game has started, like Wordle's hard mode.
      const apply = (g: GameState) => (g.guesses.length === 0 ? { ...g, difficulty: next.difficulty } : g);
      setDaily(apply);
      setPractice(apply);
    }
  };

  const share = async () => {
    const text = buildShareText(game, { highContrast: settings.highContrast, url: shareUrl() });
    const outcome = await shareText(text);
    if (outcome === 'copied') showToast('Copied results to clipboard');
    else if (outcome === 'failed') showToast('Unable to share results');
  };

  const pickState: PickState = pickUsed(game) ? 'used' : game.pickedRow != null ? 'active' : 'ready';

  const subtitle =
    (game.puzzle.mode === 'daily' ? `Daily #${game.puzzle.number}` : `Practice ${encodeSeed(game.puzzle.seed)}`) +
    ` · ${DIFFICULTIES[game.difficulty].label}`;

  return (
    <div className="app">
      <header className="header">
        <div className="header-side">
          <button className="icon-button" onClick={() => setModal('help')} aria-label="How to play">
            <HelpIcon />
          </button>
          {mode === 'practice' && (
            <button className="icon-button" onClick={startPractice} aria-label="New practice game">
              <NewGameIcon />
            </button>
          )}
        </div>
        <div className="title-block">
          <h1 aria-label="WordLock">
            <span className="logo-mark" aria-hidden="true">
              <LockIcon />
            </span>
            wordlock
          </h1>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="header-side right">
          <button className="icon-button" onClick={() => setModal('stats')} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button className="icon-button" onClick={() => setModal('settings')} aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>
      </header>

      <div className="mode-row">
        <nav className="mode-toggle segmented" aria-label="Game mode">
          {(['daily', 'practice'] as const).map((m) => (
            <button key={m} className={mode === m ? 'active' : ''} onClick={() => switchMode(m)}>
              {m === 'daily' ? 'Daily' : 'Practice'}
            </button>
          ))}
        </nav>
        <span className={`pick-pill ${pickState}`} title={PICK_TITLES[pickState]}>
          <KeyIcon />
          {PICK_LABELS[pickState]}
        </span>
      </div>

      <main className="board-container">
        <Board game={game} revealRow={revealRow} shake={shake} bounceRow={bounceRow} onToggleLock={toggleLock} />
      </main>

      <Keyboard
        keyStates={keyboardStates(game)}
        onKey={(key) => {
          buzz('key');
          handleKey(key);
        }}
      />

      <Toasts toasts={toasts} />

      {modal === 'help' && <HelpModal onClose={closeModal} />}
      {modal === 'stats' && (
        <StatsModal
          game={game}
          stats={stats[mode]}
          todayNumber={dailyNumber(today)}
          onClose={closeModal}
          onShare={share}
          onNewGame={startPractice}
        />
      )}
      {modal === 'settings' && (
        <SettingsModal
          settings={settings}
          gameInProgress={game.guesses.length > 0}
          onChange={updateSettings}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
