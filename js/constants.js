/**
 * Game Constants
 * All configuration values and constants used throughout the game
 */

export const GAME_CONFIG = {
    WORD_LENGTH: 5,
    MAX_GUESSES: 8,
    FIRST_LOCKED_ROW: 1, // Locks start from row 1 (0-indexed)
    LAST_LOCKED_ROW: 6
};

export const TIMING = {
    TILE_FLIP_DURATION: 200,
    MESSAGE_DISPLAY_DURATION: 4000,
    LOCKED_LETTER_REVEAL_DELAY: 400,
    FIRST_TIME_MODAL_DELAY: 300,
    STATS_MODAL_DELAY: 5000,
    FOCUS_DELAY: 100,
    SHARE_BUTTON_FEEDBACK_DURATION: 2000
};

export const TILE_STATES = {
    CORRECT: 'correct',
    PRESENT: 'present',
    ABSENT: 'absent',
    LOCKED: 'locked',
    FILLED: 'filled'
};

export const GAME_MODES = {
    DAILY: 'daily',
    PRACTICE: 'practice'
};

export const STORAGE_KEYS = {
    THEME: 'theme',
    STATS: 'stats',
    HAS_VISITED: 'hasVisited',
    DAILY_GAME_STATE: 'dailyGameState',
    PRACTICE_GAME_STATE: 'practiceGameState',
    DAILY_COMPLETED: 'dailyCompleted',
    DAILY_COMPLETED_DATE: 'dailyCompletedDate'
};

export const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export const SHARE_CONFIG = {
    EMOJI_MAP: {
        [TILE_STATES.CORRECT]: '🟩',
        [TILE_STATES.PRESENT]: '🟨',
        [TILE_STATES.ABSENT]: '⬛'
    },
    LOCKED_EMOJI: '🟥',
    GAME_URL: 'mimhoff.com/wordlock'
};

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
};
