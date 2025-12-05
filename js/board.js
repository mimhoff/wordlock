/**
 * Board Module
 * Handles all board rendering and tile management
 */

import { GAME_CONFIG, TILE_STATES, TIMING } from './constants.js';
import { AnimationManager } from './animations.js';

/**
 * Board Manager Class
 * Manages the game board and tile rendering
 */
export class BoardManager {
    constructor(boardElement) {
        this.boardElement = boardElement;
        this.tileCache = [];
        this.createBoard();
    }

    /**
     * Create the initial game board with all tiles
     */
    createBoard() {
        this.boardElement.innerHTML = '';
        this.tileCache = [];

        for (let i = 0; i < GAME_CONFIG.MAX_GUESSES; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            this.tileCache[i] = [];

            for (let j = 0; j < GAME_CONFIG.WORD_LENGTH; j++) {
                const tile = this.createTile(i, j);
                row.appendChild(tile);
                this.tileCache[i][j] = tile;
            }

            this.boardElement.appendChild(row);
        }
    }

    /**
     * Create a single tile element
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {HTMLElement} Tile element
     */
    createTile(row, col) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${row}-${col}`;

        // Add lock indicator (grey, always visible on future rows)
        const lockIcon = document.createElement('span');
        lockIcon.className = 'lock-icon';
        lockIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect class="lock-body" x="6" y="10" width="12" height="10" rx="1" fill="#4a4a4a"/>
                <path class="lock-shackle" d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="#4a4a4a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </svg>
        `;
        tile.appendChild(lockIcon);

        // Add special gold/silver lock for animation (appears in corner)
        const animLockIcon = document.createElement('span');
        animLockIcon.className = 'lock-icon-anim';
        animLockIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="10" width="12" height="10" rx="1" fill="#F4C542"/>
                <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="#C0C0C0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </svg>
        `;
        tile.appendChild(animLockIcon);

        // Add letter container
        const letter = document.createElement('span');
        letter.className = 'letter';
        tile.appendChild(letter);

        return tile;
    }

    /**
     * Update the current row with the current guess
     * @param {Object} gameState - Current game state
     */
    updateCurrentRow(gameState) {
        const lockedPos = gameState.getLockedPosition(gameState.currentRow);
        let guessIndex = 0;

        for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
            const tile = this.tileCache[gameState.currentRow][i];
            const letterSpan = tile.querySelector('.letter');

            // Check if this position is locked
            if (i === lockedPos && gameState.currentRow > 0 && gameState.previousGuesses.length > 0) {
                const lockedLetter = gameState.previousGuesses[gameState.currentRow - 1][i];
                letterSpan.textContent = lockedLetter;
                tile.classList.add(TILE_STATES.FILLED, TILE_STATES.LOCKED);
            } else {
                // Display letters from currentGuess, skipping over the locked position
                if (guessIndex < gameState.currentGuess.length) {
                    letterSpan.textContent = gameState.currentGuess[guessIndex];
                    tile.classList.add(TILE_STATES.FILLED);
                    tile.classList.remove(TILE_STATES.LOCKED);
                } else {
                    letterSpan.textContent = '';
                    tile.classList.remove(TILE_STATES.FILLED, TILE_STATES.LOCKED);
                }
                guessIndex++;
            }
        }
    }

    /**
     * Animate the guess result with tile flipping
     * @param {string} guess - The guessed word
     * @param {Array<string>} result - Result array (correct/present/absent)
     * @param {number} rowIndex - Row index to animate
     * @param {number} lockedPos - Locked position index
     * @param {Function} keyboardUpdateCallback - Callback to update keyboard
     * @returns {Promise} Resolves when all animations complete
     */
    async animateGuessResult(guess, result, rowIndex, lockedPos, keyboardUpdateCallback) {
        const tiles = this.tileCache[rowIndex];

        // Animate each tile with a staggered delay
        const animationPromises = tiles.map((tile, i) => {
            return AnimationManager.flipTile(tile, result[i], i * TIMING.TILE_FLIP_DURATION)
                .then(() => {
                    // Update lock icon visibility and styling
                    const lockIcon = tile.querySelector('.lock-icon');
                    if (lockIcon && i === lockedPos && rowIndex > 0) {
                        lockIcon.style.display = 'block';
                        lockIcon.className = 'lock-icon lock-' + result[i];
                    } else if (lockIcon) {
                        lockIcon.style.display = 'none';
                    }

                    // Update keyboard
                    if (keyboardUpdateCallback) {
                        keyboardUpdateCallback(guess[i], result[i]);
                    }
                });
        });

        return Promise.all(animationPromises);
    }

    /**
     * Show the locked letter for the current row with animation
     * @param {Object} gameState - Current game state
     * @returns {Promise} Resolves when animation completes
     */
    async showLockedLetter(gameState) {
        const lockedPos = gameState.getLockedPosition(gameState.currentRow);

        if (lockedPos !== undefined && gameState.currentRow > 0 && gameState.previousGuesses.length > 0) {
            const lockedLetter = gameState.previousGuesses[gameState.currentRow - 1][lockedPos];
            const tile = this.tileCache[gameState.currentRow][lockedPos];
            const letterSpan = tile.querySelector('.letter');

            letterSpan.textContent = lockedLetter;
            tile.classList.add(TILE_STATES.FILLED, TILE_STATES.LOCKED);

            // Trigger corner gold/silver lock animation
            tile.classList.add('lock-revealing');

            // Animate the locked letter reveal
            await AnimationManager.revealLockedLetter(tile);

            // Remove the revealing class after animation completes
            // The corner lock animation is 800ms, remove class after that
            setTimeout(() => {
                tile.classList.remove('lock-revealing');
            }, 800);
        }
    }

    /**
     * Shake a row (for invalid word)
     * @param {number} rowIndex - Row to shake
     * @returns {Promise} Resolves when shake completes
     */
    async shakeRow(rowIndex) {
        return AnimationManager.shakeRow(rowIndex, this.tileCache);
    }

    /**
     * Bounce a row (for winning)
     * @param {number} rowIndex - Row to bounce
     * @returns {Promise} Resolves when bounce completes
     */
    async bounceRow(rowIndex) {
        return AnimationManager.bounceRow(rowIndex, this.tileCache);
    }

    /**
     * Update lock indicators for all remaining rows
     * @param {Object} gameState - Current game state
     */
    updateLockIndicators(gameState) {
        for (let row = gameState.currentRow; row < GAME_CONFIG.MAX_GUESSES; row++) {
            const lockedPos = gameState.getLockedPosition(row);

            if (lockedPos !== undefined) {
                for (let col = 0; col < GAME_CONFIG.WORD_LENGTH; col++) {
                    const tile = this.tileCache[row][col];
                    const lockIcon = tile.querySelector('.lock-icon');

                    if (col === lockedPos && row > 0) {
                        lockIcon.style.display = 'block';
                    } else {
                        lockIcon.style.display = 'none';
                    }
                }
            }
        }
    }

    /**
     * Restore board state from saved game
     * @param {Object} gameState - Game state to restore
     * @param {Function} keyboardUpdateCallback - Callback to update keyboard
     */
    restoreBoard(gameState, keyboardUpdateCallback) {
        gameState.previousGuesses.forEach((guess, rowIndex) => {
            const result = gameState.guessResults[rowIndex];
            const lockedPos = gameState.getLockedPosition(rowIndex);

            // Fill in the letters
            for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
                const tile = this.tileCache[rowIndex][i];
                const letterSpan = tile.querySelector('.letter');

                letterSpan.textContent = guess[i];
                tile.classList.add(TILE_STATES.FILLED, result[i]);

                // Keep lock icon visible for locked positions, hide for others
                const lockIcon = tile.querySelector('.lock-icon');
                if (lockIcon && i === lockedPos && rowIndex > 0) {
                    lockIcon.style.display = 'block';
                    lockIcon.className = 'lock-icon lock-' + result[i];
                } else if (lockIcon) {
                    lockIcon.style.display = 'none';
                }

                // Update keyboard
                if (keyboardUpdateCallback) {
                    keyboardUpdateCallback(guess[i], result[i]);
                }
            }
        });

        // Update lock indicators for remaining rows
        this.updateLockIndicators(gameState);

        // Show current row's locked letter if in progress
        if (!gameState.gameOver && gameState.currentRow > 0 && gameState.currentRow < GAME_CONFIG.MAX_GUESSES) {
            this.showLockedLetter(gameState);
        }
    }

    /**
     * Clear the board completely
     */
    clear() {
        this.createBoard();
    }

    /**
     * Get tile element at specific position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {HTMLElement} Tile element
     */
    getTile(row, col) {
        return this.tileCache[row]?.[col];
    }
}
