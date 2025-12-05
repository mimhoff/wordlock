/**
 * Statistics Module
 * Handles game statistics tracking and display
 */

import { GAME_CONFIG, STORAGE_KEYS, SHARE_CONFIG } from './constants.js';
import { saveToStorage, loadFromStorage } from './storage.js';
import { getTodaysSeed, getFormattedDate } from './utils.js';
import { AnimationManager } from './animations.js';

/**
 * Get statistics from storage
 * @returns {Promise<Object>} Statistics object
 */
export async function getStats() {
    const defaultStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: new Array(GAME_CONFIG.MAX_GUESSES).fill(0)
    };

    return await loadFromStorage(STORAGE_KEYS.STATS, defaultStats);
}

/**
 * Update statistics after a game
 * @param {boolean} won - Whether the game was won
 * @param {number} guessCount - Number of guesses taken (0 if lost)
 */
export async function updateStats(won, guessCount) {
    const stats = await getStats();

    stats.gamesPlayed++;

    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.guessDistribution[guessCount - 1]++;

        // Save last game info for highlighting
        stats.lastGameGuessCount = guessCount;
        stats.lastGameDate = getTodaysSeed().toString();
    } else {
        stats.currentStreak = 0;
        // Save last game info even for losses
        stats.lastGameGuessCount = 0; // 0 means loss
        stats.lastGameDate = getTodaysSeed().toString();
    }

    await saveToStorage(STORAGE_KEYS.STATS, stats);
}

/**
 * Display statistics in the stats modal
 */
export async function displayStats() {
    const stats = await getStats();

    // Update stat values
    document.getElementById('stat-played').textContent = stats.gamesPlayed;

    const winPct = stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    document.getElementById('stat-win-pct').textContent = winPct;

    document.getElementById('stat-current-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;

    // Display guess distribution
    displayGuessDistribution(stats);

    // Show share button if a game has been completed today
    updateShareButton(stats);
}

/**
 * Display guess distribution chart
 * @param {Object} stats - Statistics object
 */
function displayGuessDistribution(stats) {
    const distributionContainer = document.getElementById('guess-distribution');
    distributionContainer.innerHTML = '';

    const maxCount = Math.max(...stats.guessDistribution, 1);
    const todaySeed = getTodaysSeed().toString();
    const playedToday = stats.lastGameDate === todaySeed;

    stats.guessDistribution.forEach((count, index) => {
        const row = document.createElement('div');
        row.className = 'distribution-row';

        const label = document.createElement('div');
        label.className = 'distribution-label';
        label.textContent = index + 1;
        row.appendChild(label);

        const bar = document.createElement('div');
        bar.className = 'distribution-bar';
        bar.textContent = count;

        // Calculate width as percentage of max count (minimum 7% for visibility)
        const width = count > 0 ? Math.max((count / maxCount) * 100, 7) : 7;
        bar.style.width = `${width}%`;

        // Highlight today's score if played today
        if (playedToday && stats.lastGameGuessCount === index + 1) {
            bar.classList.add('highlight');
        }

        row.appendChild(bar);
        distributionContainer.appendChild(row);
    });
}

/**
 * Update share button visibility
 * @param {Object} stats - Statistics object
 */
function updateShareButton(stats) {
    const shareBtn = document.getElementById('share-btn');
    const todaySeed = getTodaysSeed().toString();
    const playedToday = stats.lastGameDate === todaySeed;

    if (playedToday) {
        shareBtn.style.display = 'block';
    } else {
        shareBtn.style.display = 'none';
    }
}

/**
 * Generate share text for social media
 * @param {Object} gameState - Current game state
 * @returns {string} Formatted share text
 */
export function generateShareText(gameState) {
    const won = gameState.isWon();
    const score = won ? gameState.previousGuesses.length : 'X';

    let shareText;
    if (gameState.isDailyMode) {
        const dateStr = getFormattedDate();
        shareText = `WordLock Daily ${dateStr} - ${score}/${GAME_CONFIG.MAX_GUESSES}\n\n`;
    } else {
        shareText = `WordLock Practice ${score}/${GAME_CONFIG.MAX_GUESSES}\n\n`;
    }

    // Add colored squares for each guess
    gameState.guessResults.forEach((result, rowIndex) => {
        const rowEmojis = result.map((status, colIndex) => {
            // Check if this position was locked for this row
            const lockedPos = gameState.getLockedPosition(rowIndex);
            if (lockedPos === colIndex && rowIndex > 0) {
                return SHARE_CONFIG.LOCKED_EMOJI;
            }
            return SHARE_CONFIG.EMOJI_MAP[status];
        });
        shareText += rowEmojis.join('') + '\n';
    });

    shareText += `\nPlay at ${SHARE_CONFIG.GAME_URL}`;

    return shareText;
}

/**
 * Copy share text to clipboard
 * @param {string} shareText - Text to copy
 * @param {HTMLElement} shareBtn - Share button element
 */
export async function copyShareTextToClipboard(shareText, shareBtn) {
    const originalText = shareBtn.textContent;

    try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareText);
            showCopySuccess(shareBtn, originalText);
        } else {
            // Fallback for older browsers
            fallbackCopyToClipboard(shareText, shareBtn, originalText);
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        fallbackCopyToClipboard(shareText, shareBtn, originalText);
    }
}

/**
 * Show copy success feedback with animation
 * @param {HTMLElement} shareBtn - Share button element
 * @param {string} originalText - Original button text
 */
function showCopySuccess(shareBtn, originalText) {
    shareBtn.textContent = '✓ Copied!';
    shareBtn.style.backgroundColor = '#6aaa64';
    AnimationManager.successPulse(shareBtn);

    setTimeout(() => {
        shareBtn.textContent = originalText;
        shareBtn.style.backgroundColor = '';
    }, 2000);
}

/**
 * Show copy failure feedback
 * @param {HTMLElement} shareBtn - Share button element
 * @param {string} originalText - Original button text
 */
function showCopyFailure(shareBtn, originalText) {
    shareBtn.textContent = '✗ Failed to copy';
    shareBtn.style.backgroundColor = '#d85656';

    setTimeout(() => {
        shareBtn.textContent = originalText;
        shareBtn.style.backgroundColor = '';
    }, 2000);
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {HTMLElement} shareBtn - Share button element
 * @param {string} originalText - Original button text
 */
function fallbackCopyToClipboard(text, shareBtn, originalText) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(shareBtn, originalText);
        } else {
            showCopyFailure(shareBtn, originalText);
        }
    } catch (error) {
        console.error('Fallback copy failed:', error);
        showCopyFailure(shareBtn, originalText);
    }

    document.body.removeChild(textArea);
}
