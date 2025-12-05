/**
 * Main Game Module
 * Coordinates all game functionality
 */

import { GAME_CONFIG, TILE_STATES, TIMING } from './constants.js';
import { blurActiveElement } from './utils.js';
import { GameState } from './game-state.js';
import { BoardManager } from './board.js';
import { KeyboardManager } from './keyboard.js';
import { ModalManager } from './modals.js';
import { ThemeManager } from './theme.js';
import { updateStats, displayStats, generateShareText, copyShareTextToClipboard } from './stats.js';
import { AnimationManager } from './animations.js';
import { adManager } from './admob.js';

/**
 * Main Game Controller
 */
class WordLockGame {
    constructor() {
        this.state = new GameState();
        this.messageElement = document.getElementById('message');

        // Setup accessibility for message element
        this.messageElement.setAttribute('role', 'status');
        this.messageElement.setAttribute('aria-live', 'polite');
        this.messageElement.setAttribute('aria-atomic', 'true');

        // Initialize managers
        this.boardManager = new BoardManager(document.getElementById('game-board'));
        this.themeManager = new ThemeManager();
        this.modalManager = new ModalManager();

        // Initialize keyboard with callbacks
        this.keyboardManager = new KeyboardManager(
            document.getElementById('keyboard'),
            {
                isGameOver: () => this.state.gameOver,
                isModalOpen: () => this.modalManager.isModalOpen(),
                onEnter: () => this.submitGuess(),
                onBackspace: () => this.deleteLetter(),
                onLetter: (letter) => this.addLetter(letter)
            }
        );

        this.setupEventListeners();
        this.initialize();
        this.initializeAds();
    }

    /**
     * Initialize the game
     */
    initialize() {
        // Check daily completion status
        this.state.checkDailyCompletion();

        // Try to restore saved game state
        const hasState = this.state.loadState();

        if (!hasState) {
            // No saved state, start new game
            this.state.initializeGame(true);
            this.state.saveState();
        } else {
            // Restore board from saved state
            this.boardManager.restoreBoard(
                this.state,
                (letter, status) => this.keyboardManager.updateKey(letter, status)
            );
        }

        // Update UI
        this.boardManager.updateLockIndicators(this.state);
        this.updateModeButtons();

        // Show tutorial for first-time users
        this.modalManager.checkFirstTimeUser();

        // If game is over, show appropriate message
        if (this.state.gameOver) {
            this.showGameOverMessage();
        }
    }

    /**
     * Setup event listeners for buttons
     */
    setupEventListeners() {
        // Mode buttons
        document.getElementById('daily-mode-btn').addEventListener('click', () => {
            this.switchMode(true);
        });

        document.getElementById('practice-mode-btn').addEventListener('click', () => {
            this.switchMode(false);
        });

        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // Share button
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareResults();
        });
    }

    /**
     * Initialize and show banner ads
     * Only shows ads on Android (Capacitor)
     */
    async initializeAds() {
        try {
            // Only show ads on Android/iOS (not in browser)
            if (window.Capacitor && window.Capacitor.getPlatform() !== 'web') {
                console.log('Initializing AdMob...');
                const initialized = await adManager.initialize();

                if (initialized) {
                    // Show banner after a short delay (less intrusive)
                    setTimeout(async () => {
                        const shown = await adManager.showBanner();
                        console.log('Banner ad shown:', shown);
                    }, 2000);
                } else {
                    console.log('AdMob initialization failed');
                }
            }
        } catch (error) {
            // Ads not available or failed to load - that's ok
            console.log('Ads error:', error);
        }
    }

    /**
     * Add a letter to the current guess
     * @param {string} letter - Letter to add
     */
    addLetter(letter) {
        if (this.state.addLetter(letter)) {
            this.boardManager.updateCurrentRow(this.state);
        }
    }

    /**
     * Delete the last letter from current guess
     */
    deleteLetter() {
        if (this.state.deleteLetter()) {
            this.boardManager.updateCurrentRow(this.state);
        }
    }

    /**
     * Submit the current guess
     */
    async submitGuess() {
        const completeGuess = this.state.buildCompleteGuess();

        // Validate guess length
        if (completeGuess.length !== GAME_CONFIG.WORD_LENGTH) {
            this.showMessage('Not enough letters');
            await this.boardManager.shakeRow(this.state.currentRow);
            return;
        }

        // Validate word is in word list
        const guessLower = completeGuess.toLowerCase();
        if (!window.SOLUTION_WORDS.includes(guessLower) && !window.VALID_GUESSES.includes(guessLower)) {
            this.showMessage('Not in word list');
            await this.boardManager.shakeRow(this.state.currentRow);
            return;
        }

        // Calculate result
        const result = this.calculateGuessResult(completeGuess, this.state.targetWord);

        // Save the guess
        this.state.submitGuess(result);

        // Animate the result (wait for animation to complete)
        const lockedPos = this.state.getLockedPosition(this.state.currentRow);
        await this.boardManager.animateGuessResult(
            completeGuess,
            result,
            this.state.currentRow,
            lockedPos,
            (letter, status) => this.keyboardManager.updateKey(letter, status)
        );

        // Check if won
        if (this.state.isWon()) {
            await this.handleWin();
            return;
        }

        // Move to next row
        this.state.nextRow();
        this.boardManager.updateLockIndicators(this.state);

        // Check if game over
        if (this.state.isMaxGuessesReached()) {
            this.handleLoss();
        } else {
            // Save in-progress state
            this.state.saveState();

            // Show locked letter for next row after animation
            setTimeout(() => {
                this.boardManager.showLockedLetter(this.state);
            }, TIMING.LOCKED_LETTER_REVEAL_DELAY);
        }
    }

    /**
     * Calculate the result of a guess
     * @param {string} guess - The guessed word
     * @param {string} target - The target word
     * @returns {Array<string>} Array of result states
     */
    calculateGuessResult(guess, target) {
        const letterCount = {};

        // Count letters in target word
        for (let letter of target) {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        }

        const result = Array(GAME_CONFIG.WORD_LENGTH).fill(TILE_STATES.ABSENT);

        // First pass: mark correct letters
        for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
            if (guess[i] === target[i]) {
                result[i] = TILE_STATES.CORRECT;
                letterCount[guess[i]]--;
            }
        }

        // Second pass: mark present letters
        for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
            if (result[i] === TILE_STATES.ABSENT && letterCount[guess[i]] > 0) {
                result[i] = TILE_STATES.PRESENT;
                letterCount[guess[i]]--;
            }
        }

        return result;
    }

    /**
     * Handle winning the game
     */
    async handleWin() {
        // Bounce the winning row
        await this.boardManager.bounceRow(this.state.currentRow);

        this.showMessage('You won!');
        this.state.endGame(true);

        if (this.state.isDailyMode) {
            updateStats(true, this.state.currentRow + 1);
            this.state.markDailyComplete();
            this.updateModeButtons();
        }

        this.state.saveState();

        if (this.state.isDailyMode) {
            setTimeout(() => {
                displayStats();
                this.modalManager.openStats();
            }, TIMING.STATS_MODAL_DELAY);
        }
    }

    /**
     * Handle losing the game
     */
    handleLoss() {
        this.showMessage(`Game over! The word was ${this.state.targetWord}`);
        this.state.endGame(false);

        if (this.state.isDailyMode) {
            updateStats(false, 0);
            this.state.markDailyComplete();
            this.updateModeButtons();
        }

        this.state.saveState();

        if (this.state.isDailyMode) {
            setTimeout(() => {
                displayStats();
                this.modalManager.openStats();
            }, TIMING.STATS_MODAL_DELAY);
        }
    }

    /**
     * Show game over message for restored games
     */
    showGameOverMessage() {
        if (this.state.isWon()) {
            this.messageElement.textContent = 'You won!';
        } else {
            this.messageElement.textContent = `Game over! The word was ${this.state.targetWord}`;
        }
    }

    /**
     * Show a temporary message with animation
     * @param {string} text - Message text
     */
    showMessage(text) {
        this.messageElement.textContent = text;
        AnimationManager.slideIn(this.messageElement);

        setTimeout(async () => {
            await AnimationManager.slideOut(this.messageElement);
            this.messageElement.textContent = '';
        }, TIMING.MESSAGE_DISPLAY_DURATION);
    }

    /**
     * Switch between daily and practice modes
     * @param {boolean} isDailyMode - True for daily, false for practice
     */
    switchMode(isDailyMode) {
        blurActiveElement();

        // Clear current board and keyboard
        this.boardManager.clear();
        this.keyboardManager.clear();
        this.messageElement.textContent = '';

        // Update state mode
        this.state.isDailyMode = isDailyMode;

        // Check daily completion if switching to daily
        if (isDailyMode) {
            this.state.checkDailyCompletion();
        }

        // Try to load saved state for this mode
        const hasState = this.state.loadState();

        if (!hasState) {
            // No saved state, start new game
            this.state.initializeGame(isDailyMode);
            this.state.saveState();
        } else {
            // Restore board from saved state
            this.boardManager.restoreBoard(
                this.state,
                (letter, status) => this.keyboardManager.updateKey(letter, status)
            );
        }

        // Update UI
        this.boardManager.updateLockIndicators(this.state);
        this.updateModeButtons();

        // Show game over message if game is complete
        if (this.state.gameOver) {
            this.showGameOverMessage();
        }
    }

    /**
     * Reset the game (practice mode only)
     */
    resetGame() {
        blurActiveElement();

        // Don't allow reset in daily mode
        if (this.state.isDailyMode) {
            this.showMessage('Switch to Practice for unlimited games');
            return;
        }

        // Clear the board and keyboard
        this.boardManager.clear();
        this.keyboardManager.clear();
        this.messageElement.textContent = '';

        // Start new game
        this.state.initializeGame(false);
        this.state.saveState();

        // Update UI
        this.boardManager.updateLockIndicators(this.state);
    }

    /**
     * Update mode button states
     */
    updateModeButtons() {
        const dailyBtn = document.getElementById('daily-mode-btn');
        const practiceBtn = document.getElementById('practice-mode-btn');

        // Update active state
        if (this.state.isDailyMode) {
            dailyBtn.classList.add('active');
            practiceBtn.classList.remove('active');
        } else {
            dailyBtn.classList.remove('active');
            practiceBtn.classList.add('active');
        }

        // Show completed state on daily button
        if (this.state.dailyCompleted) {
            dailyBtn.classList.add('completed');
            dailyBtn.textContent = 'Daily ✓';
        } else {
            dailyBtn.classList.remove('completed');
            dailyBtn.textContent = 'Daily';
        }
    }

    /**
     * Share game results
     */
    shareResults() {
        const shareText = generateShareText(this.state);
        const shareBtn = document.getElementById('share-btn');
        copyShareTextToClipboard(shareText, shareBtn);
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WordLockGame();
    });
} else {
    new WordLockGame();
}
