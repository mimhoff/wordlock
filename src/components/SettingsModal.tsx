import { DIFFICULTIES, type Difficulty } from '../game/constants';
import { hapticsSupported } from '../platform/haptics';
import type { Settings, Theme } from '../settings';
import { Modal } from './Modal';

interface SettingsModalProps {
  settings: Settings;
  /** True when the current game has guesses, so a difficulty change only applies to the next game. */
  gameInProgress: boolean;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

const THEMES: Theme[] = ['system', 'light', 'dark'];

export function SettingsModal({ settings, gameInProgress, onChange, onClose }: SettingsModalProps) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <section className="setting">
        <h3>Difficulty</h3>
        <div className="difficulty-options" role="radiogroup" aria-label="Difficulty">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
            <label key={d} className={`difficulty-option ${settings.difficulty === d ? 'selected' : ''}`}>
              <input
                type="radio"
                name="difficulty"
                checked={settings.difficulty === d}
                onChange={() => onChange({ ...settings, difficulty: d })}
              />
              <span>
                <strong>{DIFFICULTIES[d].label}</strong>
                <small>{DIFFICULTIES[d].description}</small>
              </span>
            </label>
          ))}
        </div>
        {gameInProgress && <p className="setting-note">Changes to difficulty apply from your next game.</p>}
      </section>

      <section className="setting row-setting">
        <span>
          <strong>Theme</strong>
        </span>
        <div className="segmented">
          {THEMES.map((t) => (
            <button
              key={t}
              className={settings.theme === t ? 'active' : ''}
              onClick={() => onChange({ ...settings, theme: t })}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="setting row-setting">
        <span>
          <strong>High contrast</strong>
          <small>Colour-blind friendly colours</small>
        </span>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => onChange({ ...settings, highContrast: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </section>

      {hapticsSupported && (
        <section className="setting row-setting">
          <span>
            <strong>Vibration</strong>
            <small>Haptic feedback on key taps</small>
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.haptics}
              onChange={(e) => onChange({ ...settings, haptics: e.target.checked })}
            />
            <span className="slider" />
          </label>
        </section>
      )}
    </Modal>
  );
}
