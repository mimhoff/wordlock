/**
 * Animations Module
 * Handles all game animations for enhanced user experience
 */

import { GAME_CONFIG, TIMING } from './constants.js';

/**
 * Animation Manager Class
 * Provides methods for animating game elements
 */
export class AnimationManager {
    /**
     * Animate tile flip with color reveal
     * @param {HTMLElement} tile - Tile element to animate
     * @param {string} state - Final state (correct/present/absent)
     * @param {number} delay - Delay before animation starts (ms)
     * @returns {Promise} Resolves when animation completes
     */
    static flipTile(tile, state, delay = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                tile.style.animation = 'flip 0.6s ease-in-out';

                // Add the color class midway through the flip
                setTimeout(() => {
                    tile.classList.add(state);
                }, 300);

                // Clean up animation and resolve
                setTimeout(() => {
                    tile.style.animation = '';
                    resolve();
                }, 600);
            }, delay);
        });
    }

    /**
     * Shake a row of tiles (for invalid word)
     * @param {number} rowIndex - Row to shake
     * @param {Array<Array<HTMLElement>>} tileCache - Cached tile elements
     * @returns {Promise} Resolves when shake completes
     */
    static shakeRow(rowIndex, tileCache) {
        return new Promise(resolve => {
            const tiles = tileCache[rowIndex];

            tiles.forEach(tile => {
                tile.style.animation = 'shake 0.65s ease-in-out';
            });

            setTimeout(() => {
                tiles.forEach(tile => {
                    tile.style.animation = '';
                });
                resolve();
            }, 650);
        });
    }

    /**
     * Bounce a row of tiles (for winning)
     * @param {number} rowIndex - Row to bounce
     * @param {Array<Array<HTMLElement>>} tileCache - Cached tile elements
     * @returns {Promise} Resolves when all bounces complete
     */
    static bounceRow(rowIndex, tileCache) {
        return new Promise(resolve => {
            const tiles = tileCache[rowIndex];

            tiles.forEach((tile, index) => {
                setTimeout(() => {
                    tile.style.animation = 'bounce 0.6s ease-in-out';
                }, index * 100);
            });

            setTimeout(() => {
                tiles.forEach(tile => {
                    tile.style.animation = '';
                });
                resolve();
            }, tiles.length * 100 + 600);
        });
    }

    /**
     * Pop animation when letter is added
     * @param {HTMLElement} tile - Tile to pop
     */
    static popTile(tile) {
        tile.style.animation = 'pop 0.1s ease-in-out';
        setTimeout(() => {
            tile.style.animation = '';
        }, 100);
    }

    /**
     * Scale animation for locked letter reveal
     * @param {HTMLElement} tile - Tile with locked letter
     * @returns {Promise} Resolves when animation completes
     */
    static revealLockedLetter(tile) {
        return new Promise(resolve => {
            tile.style.animation = 'lockedReveal 0.4s ease-out';

            setTimeout(() => {
                tile.style.animation = '';
                resolve();
            }, 400);
        });
    }

    /**
     * Pulse animation for lock icon
     * @param {HTMLElement} lockIcon - Lock icon element
     */
    static pulseLockIcon(lockIcon) {
        lockIcon.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            lockIcon.style.animation = '';
        }, 600);
    }

    /**
     * Fade in animation for modals
     * @param {HTMLElement} modal - Modal element
     * @returns {Promise} Resolves when fade completes
     */
    static fadeIn(modal) {
        return new Promise(resolve => {
            modal.style.animation = 'fadeIn 0.3s ease-out';
            setTimeout(() => {
                modal.style.animation = '';
                resolve();
            }, 300);
        });
    }

    /**
     * Fade out animation for modals
     * @param {HTMLElement} modal - Modal element
     * @returns {Promise} Resolves when fade completes
     */
    static fadeOut(modal) {
        return new Promise(resolve => {
            modal.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => {
                modal.style.animation = '';
                resolve();
            }, 300);
        });
    }

    /**
     * Slide in animation for messages
     * @param {HTMLElement} element - Element to slide in
     */
    static slideIn(element) {
        element.style.animation = 'slideIn 0.5s ease-out forwards';
        element.style.opacity = '1';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    /**
     * Slide out animation for messages
     * @param {HTMLElement} element - Element to slide out
     * @returns {Promise} Resolves when slide completes
     */
    static slideOut(element) {
        return new Promise(resolve => {
            element.style.animation = 'slideOut 1s ease-out forwards';
            setTimeout(() => {
                element.style.animation = '';
                element.style.opacity = '0';
                resolve();
            }, 1000);
        });
    }

    /**
     * Success pulse for buttons (after copy, etc)
     * @param {HTMLElement} button - Button element
     */
    static successPulse(button) {
        button.style.animation = 'successPulse 0.4s ease-in-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 400);
    }

    /**
     * Animate entire guess submission with flip sequence
     * @param {Array<HTMLElement>} tiles - Row of tiles to animate
     * @param {Array<string>} results - Result states for each tile
     * @param {Function} onTileFlip - Callback for each tile flip (tile, index)
     * @returns {Promise} Resolves when all animations complete
     */
    static async animateGuessSubmission(tiles, results, onTileFlip = null) {
        const promises = tiles.map((tile, index) => {
            return this.flipTile(tile, results[index], index * TIMING.TILE_FLIP_DURATION)
                .then(() => {
                    if (onTileFlip) {
                        onTileFlip(tile, index);
                    }
                });
        });

        return Promise.all(promises);
    }

    /**
     * Check if animations should be reduced (respects user's motion preferences)
     * @returns {boolean} True if animations should be reduced
     */
    static shouldReduceMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Get animation duration multiplier based on user preferences
     * @returns {number} Multiplier (0.1 for reduced motion, 1 for normal)
     */
    static getAnimationMultiplier() {
        return this.shouldReduceMotion() ? 0.1 : 1;
    }
}
