/**
 * Game State Module
 * Manages all game state and provides methods for state manipulation
 */

import { GAME_CONFIG, GAME_MODES, STORAGE_KEYS } from './constants.js';
import { seededRandom, getTodaysSeed } from './utils.js';
import { saveToStorage, loadFromStorage } from './storage.js';

/**
 * Game State Class
 * Encapsulates all game state and provides controlled access
 */
export class GameState {
    constructor() {
        this.reset();
    }

    /**
     * Reset all game state to initial values
     */
    reset() {
        this.targetWord = '';
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        this.isDailyMode = true;
        this.dailyCompleted = false;
        this.lockedPositions = {};
        this.previousGuesses = [];
        this.guessResults = [];
    }

    /**
     * Initialize a new game with specified mode
     * @param {boolean} isDailyMode - True for daily mode, false for practice
     */
    initializeGame(isDailyMode) {
        this.reset();
        this.isDailyMode = isDailyMode;

        if (isDailyMode) {
            this.initializeDailyGame();
        } else {
            this.initializePracticeGame();
        }
    }

    /**
     * Initialize daily game with seeded random
     */
    initializeDailyGame() {
        const seed = getTodaysSeed();
        const rng = seededRandom(seed);

        // Select word using seeded random
        const wordIndex = Math.floor(rng() * window.SOLUTION_WORDS.length);
        this.targetWord = window.SOLUTION_WORDS[wordIndex].toUpperCase();

        // Generate locked positions using seeded random
        this.generateLockedPositions(rng);
    }

    /**
     * Initialize practice game with true random
     */
    initializePracticeGame() {
        this.targetWord = window.SOLUTION_WORDS[Math.floor(Math.random() * window.SOLUTION_WORDS.length)].toUpperCase();
        this.generateLockedPositions(Math.random);
    }

    /**
     * Generate locked positions for rows 1-6
     * Ensures consecutive rows don't have the same locked position
     * @param {Function} rng - Random number generator function
     */
    generateLockedPositions(rng) {
        this.lockedPositions = {};
        let previousPos = -1;

        for (let row = GAME_CONFIG.FIRST_LOCKED_ROW; row <= GAME_CONFIG.LAST_LOCKED_ROW; row++) {
            let newPos;
            do {
                newPos = Math.floor(rng() * GAME_CONFIG.WORD_LENGTH);
            } while (newPos === previousPos);

            this.lockedPositions[row] = newPos;
            previousPos = newPos;
        }
    }

    /**
     * Add a letter to the current guess
     * @param {string} letter - Letter to add
     * @returns {boolean} True if letter was added
     */
    addLetter(letter) {
        const lockedPos = this.lockedPositions[this.currentRow];
        const maxLetters = (lockedPos !== undefined && this.currentRow > 0)
            ? GAME_CONFIG.WORD_LENGTH - 1
            : GAME_CONFIG.WORD_LENGTH;

        if (this.currentGuess.length < maxLetters) {
            this.currentGuess += letter;
            return true;
        }

        return false;
    }

    /**
     * Remove the last letter from current guess
     * @returns {boolean} True if letter was removed
     */
    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            return true;
        }

        return false;
    }

    /**
     * Build the complete guess including locked letter
     * @returns {string} Complete guess word
     */
    buildCompleteGuess() {
        const lockedPos = this.lockedPositions[this.currentRow];

        // If no locked position or first row, return guess as-is
        if (lockedPos === undefined || this.currentRow === 0 || this.previousGuesses.length === 0) {
            return this.currentGuess;
        }

        const lockedLetter = this.previousGuesses[this.currentRow - 1][lockedPos];
        let completeGuess = '';

        // Build the complete word by inserting letters around the locked position
        for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
            if (i === lockedPos) {
                completeGuess += lockedLetter;
            } else if (i < lockedPos) {
                completeGuess += this.currentGuess[i] || '';
            } else {
                completeGuess += this.currentGuess[i - 1] || '';
            }
        }

        return completeGuess;
    }

    /**
     * Submit the current guess
     * @param {Array<string>} result - Result array from guess evaluation
     */
    submitGuess(result) {
        const completeGuess = this.buildCompleteGuess();
        this.previousGuesses.push(completeGuess);
        this.guessResults.push([...result]);
        this.currentGuess = '';
    }

    /**
     * Move to the next row
     */
    nextRow() {
        this.currentRow++;
    }

    /**
     * Mark game as over
     * @param {boolean} won - Whether the game was won
     */
    endGame(won) {
        this.gameOver = true;
    }

    /**
     * Check if the game is won
     * @returns {boolean} True if game is won
     */
    isWon() {
        return this.previousGuesses.length > 0 &&
               this.previousGuesses[this.previousGuesses.length - 1] === this.targetWord;
    }

    /**
     * Check if maximum guesses reached
     * @returns {boolean} True if no more guesses available
     */
    isMaxGuessesReached() {
        return this.currentRow >= GAME_CONFIG.MAX_GUESSES;
    }

    /**
     * Get the locked letter for current row
     * @returns {string|null} Locked letter or null if none
     */
    getLockedLetter() {
        const lockedPos = this.lockedPositions[this.currentRow];

        if (lockedPos !== undefined && this.currentRow > 0 && this.previousGuesses.length > 0) {
            return this.previousGuesses[this.currentRow - 1][lockedPos];
        }

        return null;
    }

    /**
     * Get the locked position for a specific row
     * @param {number} row - Row number
     * @returns {number|undefined} Locked position index or undefined
     */
    getLockedPosition(row) {
        return this.lockedPositions[row];
    }

    /**
     * Save current game state to storage
     * @returns {boolean} True if save successful
     */
    saveState() {
        const gameState = {
            targetWord: this.targetWord,
            currentGuess: this.currentGuess,
            currentRow: this.currentRow,
            previousGuesses: this.previousGuesses,
            guessResults: this.guessResults,
            lockedPositions: this.lockedPositions,
            gameOver: this.gameOver
        };

        const stateKey = this.isDailyMode
            ? STORAGE_KEYS.DAILY_GAME_STATE
            : STORAGE_KEYS.PRACTICE_GAME_STATE;

        if (this.isDailyMode) {
            gameState.dateKey = getTodaysSeed().toString();
        }

        return saveToStorage(stateKey, gameState);
    }

    /**
     * Load game state from storage
     * @returns {boolean} True if state was loaded successfully
     */
    loadState() {
        const stateKey = this.isDailyMode
            ? STORAGE_KEYS.DAILY_GAME_STATE
            : STORAGE_KEYS.PRACTICE_GAME_STATE;

        const savedState = loadFromStorage(stateKey);

        if (!savedState) {
            return false;
        }

        // For daily mode, check if the saved game is from today
        if (this.isDailyMode) {
            const today = getTodaysSeed().toString();
            if (savedState.dateKey !== today) {
                return false;
            }
        }

        // Restore state
        this.targetWord = savedState.targetWord;
        this.currentGuess = savedState.currentGuess || '';
        this.currentRow = savedState.currentRow;
        this.previousGuesses = savedState.previousGuesses || [];
        this.guessResults = savedState.guessResults || [];
        this.lockedPositions = savedState.lockedPositions;
        this.gameOver = savedState.gameOver || false;

        return true;
    }

    /**
     * Check if daily challenge is completed
     * @returns {boolean} True if daily is completed today
     */
    checkDailyCompletion() {
        const today = getTodaysSeed().toString();
        const completed = loadFromStorage(STORAGE_KEYS.DAILY_COMPLETED);
        const completedDate = loadFromStorage(STORAGE_KEYS.DAILY_COMPLETED_DATE);

        this.dailyCompleted = (completed === true && completedDate === today);
        return this.dailyCompleted;
    }

    /**
     * Mark daily challenge as completed
     */
    markDailyComplete() {
        if (this.isDailyMode) {
            const today = getTodaysSeed().toString();
            saveToStorage(STORAGE_KEYS.DAILY_COMPLETED, true);
            saveToStorage(STORAGE_KEYS.DAILY_COMPLETED_DATE, today);
            this.dailyCompleted = true;
        }
    }

    /**
     * Export state for serialization
     * @returns {Object} State object
     */
    export() {
        return {
            targetWord: this.targetWord,
            currentGuess: this.currentGuess,
            currentRow: this.currentRow,
            gameOver: this.gameOver,
            isDailyMode: this.isDailyMode,
            dailyCompleted: this.dailyCompleted,
            lockedPositions: { ...this.lockedPositions },
            previousGuesses: [...this.previousGuesses],
            guessResults: this.guessResults.map(r => [...r])
        };
    }
}
