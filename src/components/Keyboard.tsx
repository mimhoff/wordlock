import type { TileState } from '../game/engine';
import { BackspaceIcon } from './icons';

const ROWS = ['qwertyuiop', 'asdfghjkl', '+zxcvbnm-'];

interface KeyboardProps {
  keyStates: Record<string, TileState>;
  onKey: (key: string) => void;
}

export function Keyboard({ keyStates, onKey }: KeyboardProps) {
  return (
    <div className="keyboard" role="group" aria-label="Keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {i === 1 && <div className="key-spacer" />}
          {[...row].map((ch) => {
            if (ch === '+') {
              return (
                <button key="enter" className="key wide" onClick={() => onKey('Enter')}>
                  Enter
                </button>
              );
            }
            if (ch === '-') {
              return (
                <button key="back" className="key wide" onClick={() => onKey('Backspace')} aria-label="Backspace">
                  <BackspaceIcon />
                </button>
              );
            }
            return (
              <button
                key={ch}
                className={`key ${keyStates[ch] ?? ''}`}
                onClick={() => onKey(ch)}
                aria-label={`${ch}${keyStates[ch] ? `, ${keyStates[ch]}` : ''}`}
              >
                {ch}
              </button>
            );
          })}
          {i === 1 && <div className="key-spacer" />}
        </div>
      ))}
    </div>
  );
}
