/**
 * Keyboard Module
 * Handles on-screen and physical keyboard input
 */

import { KEYBOARD_LAYOUT, TILE_STATES } from './constants.js';
import { isSingleLetter } from './utils.js';

/**
 * Keyboard Manager Class
 * Manages keyboard rendering and input handling
 */
export class KeyboardManager {
    constructor(keyboardElement, callbacks) {
        this.keyboardElement = keyboardElement;
        this.callbacks = callbacks;
        this.keyElements = new Map();
        this.createKeyboard();
        this.setupPhysicalKeyboard();
    }

    /**
     * Create the on-screen keyboard
     */
    createKeyboard() {
        this.keyboardElement.innerHTML = '';

        KEYBOARD_LAYOUT.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';

            row.forEach(key => {
                const button = document.createElement('button');
                button.className = key.length > 1 ? 'key wide' : 'key';
                button.id = `key-${key}`;

                // Display backspace SVG icon for BACK button
                if (key === 'BACK') {
                    button.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14z" fill="currentColor"/>
                            <path d="M17.59 8L15 10.59 12.41 8 11 9.41 13.59 12 11 14.59 12.41 16 15 13.41 17.59 16 19 14.59 16.41 12 19 9.41z" fill="currentColor"/>
                        </svg>
                    `;
                } else {
                    button.textContent = key;
                }

                button.addEventListener('click', () => this.handleKeyClick(key));

                keyboardRow.appendChild(button);
                this.keyElements.set(key, button);
            });

            this.keyboardElement.appendChild(keyboardRow);
        });
    }

    /**
     * Setup physical keyboard event listener
     */
    setupPhysicalKeyboard() {
        this.physicalKeyHandler = (e) => this.handlePhysicalKeyPress(e);
        document.addEventListener('keydown', this.physicalKeyHandler);
    }

    /**
     * Remove physical keyboard event listener
     */
    removePhysicalKeyboard() {
        document.removeEventListener('keydown', this.physicalKeyHandler);
    }

    /**
     * Handle on-screen key click
     * @param {string} key - Key that was clicked
     */
    handleKeyClick(key) {
        if (this.callbacks.isGameOver()) {
            return;
        }

        if (key === 'ENTER') {
            this.callbacks.onEnter();
        } else if (key === 'BACK') {
            this.callbacks.onBackspace();
        } else {
            this.callbacks.onLetter(key);
        }
    }

    /**
     * Handle physical keyboard press
     * @param {KeyboardEvent} e - Keyboard event
     */
    handlePhysicalKeyPress(e) {
        if (this.callbacks.isGameOver()) {
            return;
        }

        // Don't process keyboard input if any modal is open
        if (this.callbacks.isModalOpen()) {
            return;
        }

        const key = e.key.toUpperCase();

        if (key === 'ENTER') {
            this.callbacks.onEnter();
        } else if (key === 'BACKSPACE') {
            this.callbacks.onBackspace();
        } else if (isSingleLetter(key)) {
            this.callbacks.onLetter(key);
        }
    }

    /**
     * Update a key's visual state based on guess result
     * @param {string} letter - Letter to update
     * @param {string} status - Status (correct/present/absent)
     */
    updateKey(letter, status) {
        const key = this.keyElements.get(letter);
        if (!key) {
            return;
        }

        const currentStatus = key.classList.contains(TILE_STATES.CORRECT) ? TILE_STATES.CORRECT :
                             key.classList.contains(TILE_STATES.PRESENT) ? TILE_STATES.PRESENT :
                             TILE_STATES.ABSENT;

        // Only update if new status is better (correct > present > absent)
        if (status === TILE_STATES.CORRECT ||
            (status === TILE_STATES.PRESENT && currentStatus !== TILE_STATES.CORRECT) ||
            (status === TILE_STATES.ABSENT && currentStatus === TILE_STATES.ABSENT)) {
            key.classList.remove(TILE_STATES.CORRECT, TILE_STATES.PRESENT, TILE_STATES.ABSENT);
            key.classList.add(status);
        }
    }

    /**
     * Reset all key states
     */
    resetKeys() {
        this.keyElements.forEach(key => {
            key.classList.remove(TILE_STATES.CORRECT, TILE_STATES.PRESENT, TILE_STATES.ABSENT);
        });
    }

    /**
     * Clear and recreate keyboard
     */
    clear() {
        this.resetKeys();
    }

    /**
     * Destroy keyboard and remove event listeners
     */
    destroy() {
        this.removePhysicalKeyboard();
        this.keyboardElement.innerHTML = '';
        this.keyElements.clear();
    }
}
