// Word lists are loaded from words.js
// SOLUTION_WORDS: possible answers (2,314 words)
// VALID_GUESSES: all acceptable guesses (10,656 words)

const WORD_LENGTH = 5;
const MAX_GUESSES = 8;

// Seeded random number generator (Mulberry32)
function seededRandom(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Get today's date as a seed
function getTodaysSeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // Convert date string to number
    return dateStr.split('-').join('') | 0;
}

// Theme management
function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle button icon
    const themeBtn = document.getElementById('theme-toggle-btn');
    themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Game mode
let isDailyMode = true;
let dailyCompleted = false;

let targetWord;
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let lockedPositions = {}; // Maps row number to locked position index
let previousGuesses = []; // Stores all previous guesses
let guessResults = []; // Stores color results for sharing

// Statistics
function getStats() {
    const stats = localStorage.getItem('stats');
    if (!stats) {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0] // Index 0 = won in 1 guess, etc.
        };
    }
    return JSON.parse(stats);
}

function saveStats(stats) {
    localStorage.setItem('stats', JSON.stringify(stats));
}

function updateStats(won, guessCount) {
    const stats = getStats();

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

    saveStats(stats);
}

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

function initGame() {
    // Load saved theme
    setTheme(getTheme());

    checkDailyCompletion();
    createBoard();
    createKeyboard();

    // Try to restore saved game state for current mode
    const restored = restoreGameState(isDailyMode ? 'dailyGameState' : 'practiceGameState');

    // If no saved state, start a new game
    if (!restored) {
        startGame(isDailyMode);
    }

    document.addEventListener('keydown', handleKeyPress);
    updateModeButtons();
}

function checkDailyCompletion() {
    const today = getTodaysSeed().toString();
    const completed = localStorage.getItem('dailyCompleted');
    const completedDate = localStorage.getItem('dailyCompletedDate');

    if (completed === 'true' && completedDate === today) {
        dailyCompleted = true;
    } else {
        dailyCompleted = false;
    }
}

function restoreGameState(stateKey) {
    const savedState = localStorage.getItem(stateKey);
    if (!savedState) return false;

    try {
        const gameState = JSON.parse(savedState);

        // For daily mode, check if the saved game is from today
        if (stateKey === 'dailyGameState') {
            const today = getTodaysSeed().toString();
            if (gameState.dateKey !== today) {
                // Old daily game, don't restore
                localStorage.removeItem('dailyGameState');
                return false;
            }
        }

        // Restore game variables
        targetWord = gameState.targetWord;
        currentGuess = gameState.currentGuess || '';
        currentRow = gameState.currentRow;
        previousGuesses = gameState.previousGuesses || [];
        guessResults = gameState.guessResults || [];
        lockedPositions = gameState.lockedPositions;
        gameOver = gameState.gameOver || false;

        // Reconstruct the board
        gameState.previousGuesses.forEach((guess, rowIndex) => {
            const result = gameState.guessResults[rowIndex];

            // Fill in the letters
            for (let i = 0; i < WORD_LENGTH; i++) {
                const tile = document.getElementById(`tile-${rowIndex}-${i}`);
                const letterSpan = tile.querySelector('.letter');
                letterSpan.textContent = guess[i];
                tile.classList.add('filled', result[i]);

                // Hide lock icon for completed tiles
                const lockIcon = tile.querySelector('.lock-icon');
                if (lockIcon) {
                    lockIcon.style.display = 'none';
                }

                // Update keyboard
                updateKeyboard(guess[i], result[i]);
            }
        });

        // Update lock indicators for remaining rows
        updateLockIndicators();

        // Show current row's locked letter if in progress
        if (!gameOver && currentRow > 0 && currentRow < MAX_GUESSES) {
            showNextLockedLetter();
        }

        // Show appropriate message if game is over
        if (gameOver) {
            const won = previousGuesses[previousGuesses.length - 1] === targetWord;
            if (won) {
                message.textContent = 'You won!';
            } else {
                message.textContent = `Game over! The word was ${targetWord}`;
            }
        }

        return true;
    } catch (err) {
        console.error('Failed to restore game state:', err);
        return false;
    }
}

function startGame(daily) {
    isDailyMode = daily;

    if (daily) {
        // Use seeded random for daily mode
        const seed = getTodaysSeed();
        const rng = seededRandom(seed);

        // Select word using seeded random
        const wordIndex = Math.floor(rng() * SOLUTION_WORDS.length);
        targetWord = SOLUTION_WORDS[wordIndex].toUpperCase();

        // Generate locked positions using seeded random
        initLockedPositions(rng);
    } else {
        // Use regular random for practice mode
        targetWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)].toUpperCase();
        initLockedPositions(Math.random);
    }
}

function initLockedPositions(rng) {
    // For rows 2-7 (indices 1-6), randomly pick one position to lock
    for (let row = 1; row <= 6; row++) {
        lockedPositions[row] = Math.floor(rng() * WORD_LENGTH);
    }
}

function createBoard() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;

            // Add lock indicator
            const lockIcon = document.createElement('span');
            lockIcon.className = 'lock-icon';
            lockIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="10" width="12" height="10" rx="1" fill="#4a4a4a"/>
                    <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="#4a4a4a" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            `;
            tile.appendChild(lockIcon);

            // Add letter container
            const letter = document.createElement('span');
            letter.className = 'letter';
            tile.appendChild(letter);

            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }

    // Show lock indicators for future rows
    updateLockIndicators();
}

function createKeyboard() {
    keyboardLayout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        row.forEach(key => {
            const button = document.createElement('button');
            button.className = key.length > 1 ? 'key wide' : 'key';
            button.textContent = key;
            button.id = `key-${key}`;
            button.addEventListener('click', () => handleKeyClick(key));
            keyboardRow.appendChild(button);
        });
        keyboard.appendChild(keyboardRow);
    });
}

function updateLockIndicators() {
    // Show lock icons for rows that haven't been played yet
    for (let row = currentRow; row < MAX_GUESSES; row++) {
        const lockedPos = lockedPositions[row];
        if (lockedPos !== undefined) {
            for (let col = 0; col < WORD_LENGTH; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
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

function handleKeyPress(e) {
    if (gameOver) return;

    // Don't process keyboard input if any modal is open
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const statsModal = document.getElementById('stats-modal');
    if (howToPlayModal.style.display === 'block' || statsModal.style.display === 'block') return;

    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

function handleKeyClick(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACK') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

function addLetter(letter) {
    const lockedPos = lockedPositions[currentRow];
    const maxLetters = (lockedPos !== undefined && currentRow > 0) ? WORD_LENGTH - 1 : WORD_LENGTH;

    if (currentGuess.length < maxLetters) {
        currentGuess += letter;
        updateBoard();
    }
}

function deleteLetter() {
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    }
}

function updateBoard() {
    const lockedPos = lockedPositions[currentRow];
    let guessIndex = 0;

    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        const letterSpan = tile.querySelector('.letter');

        // Check if this position is locked
        if (i === lockedPos && currentRow > 0 && previousGuesses.length > 0) {
            const lockedLetter = previousGuesses[currentRow - 1][i];
            letterSpan.textContent = lockedLetter;
            tile.classList.add('filled', 'locked');
        } else {
            // Display letters from currentGuess, skipping over the locked position
            if (guessIndex < currentGuess.length) {
                letterSpan.textContent = currentGuess[guessIndex];
                tile.classList.add('filled');
                tile.classList.remove('locked');
            } else {
                letterSpan.textContent = '';
                tile.classList.remove('filled', 'locked');
            }
            guessIndex++;
        }
    }
}

function submitGuess() {
    // Build the complete guess including locked letter
    const completeGuess = buildCompleteGuess();

    if (completeGuess.length !== WORD_LENGTH) {
        showMessage('Not enough letters');
        return;
    }

    // Validate the word is in either the solutions or valid guesses list
    const guessLower = completeGuess.toLowerCase();
    if (!SOLUTION_WORDS.includes(guessLower) && !VALID_GUESSES.includes(guessLower)) {
        showMessage('Not in word list');
        return;
    }

    // Save the complete guess
    previousGuesses.push(completeGuess);

    checkGuess(completeGuess);

    if (completeGuess === targetWord) {
        showMessage('You won!');
        gameOver = true;
        updateStats(true, currentRow + 1);
        markDailyComplete();
        saveGameState();
        if (isDailyMode) {
            setTimeout(showStatsModal, 1500);
        }
        return;
    }

    currentRow++;
    currentGuess = '';
    updateLockIndicators();

    if (currentRow >= MAX_GUESSES) {
        showMessage(`Game over! The word was ${targetWord}`);
        gameOver = true;
        updateStats(false, 0);
        markDailyComplete();
        saveGameState();
        if (isDailyMode) {
            setTimeout(showStatsModal, 1500);
        }
    } else {
        // Save in-progress game state
        saveGameState();
        // Show the locked letter after tile animations complete
        // Animation time: (WORD_LENGTH - 1) * 200ms + small buffer
        setTimeout(() => {
            showNextLockedLetter();
        }, 1000);
    }
}

function showNextLockedLetter() {
    const lockedPos = lockedPositions[currentRow];
    if (lockedPos !== undefined && currentRow > 0 && previousGuesses.length > 0) {
        const lockedLetter = previousGuesses[currentRow - 1][lockedPos];
        const tile = document.getElementById(`tile-${currentRow}-${lockedPos}`);
        const letterSpan = tile.querySelector('.letter');
        letterSpan.textContent = lockedLetter;
        tile.classList.add('filled', 'locked');
    }
}

function buildCompleteGuess() {
    const lockedPos = lockedPositions[currentRow];
    let completeGuess = '';

    // If there's a locked position, insert the locked letter
    if (lockedPos !== undefined && currentRow > 0 && previousGuesses.length > 0) {
        const lockedLetter = previousGuesses[currentRow - 1][lockedPos];

        // Build the complete word by inserting letters around the locked position
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (i === lockedPos) {
                completeGuess += lockedLetter;
            } else if (i < lockedPos) {
                completeGuess += currentGuess[i] || '';
            } else {
                completeGuess += currentGuess[i - 1] || '';
            }
        }
    } else {
        completeGuess = currentGuess;
    }

    return completeGuess;
}

function checkGuess(guess) {
    const letterCount = {};

    // Count letters in target word
    for (let letter of targetWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    const result = Array(WORD_LENGTH).fill('absent');

    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === targetWord[i]) {
            result[i] = 'correct';
            letterCount[guess[i]]--;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'absent' && letterCount[guess[i]] > 0) {
            result[i] = 'present';
            letterCount[guess[i]]--;
        }
    }

    // Save results for sharing
    guessResults.push([...result]);

    // Apply colors to tiles
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        setTimeout(() => {
            tile.classList.add(result[i]);
            // Hide lock icon once tile is colored
            const lockIcon = tile.querySelector('.lock-icon');
            if (lockIcon) {
                lockIcon.style.display = 'none';
            }
        }, i * 200);

        updateKeyboard(guess[i], result[i]);
    }
}

function updateKeyboard(letter, status) {
    const key = document.getElementById(`key-${letter}`);
    if (!key) return;

    const currentStatus = key.classList.contains('correct') ? 'correct' :
                         key.classList.contains('present') ? 'present' : 'absent';

    if (status === 'correct' ||
        (status === 'present' && currentStatus !== 'correct') ||
        (status === 'absent' && currentStatus === 'absent')) {
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(status);
    }
}

function showMessage(text) {
    message.textContent = text;
    setTimeout(() => {
        message.textContent = '';
    }, 2000);
}

function saveGameState() {
    const gameState = {
        targetWord: targetWord,
        currentGuess: currentGuess,
        currentRow: currentRow,
        previousGuesses: previousGuesses,
        guessResults: guessResults,
        lockedPositions: lockedPositions,
        gameOver: gameOver
    };

    if (isDailyMode) {
        const today = getTodaysSeed().toString();
        gameState.dateKey = today;
        localStorage.setItem('dailyGameState', JSON.stringify(gameState));
    } else {
        localStorage.setItem('practiceGameState', JSON.stringify(gameState));
    }
}

function markDailyComplete() {
    if (isDailyMode) {
        const today = getTodaysSeed().toString();
        localStorage.setItem('dailyCompleted', 'true');
        localStorage.setItem('dailyCompletedDate', today);
        dailyCompleted = true;
        updateModeButtons();
    }
}

function generateShareText() {
    const won = previousGuesses[previousGuesses.length - 1] === targetWord;
    const score = won ? (currentRow + 1) : 'X';

    let shareText;
    if (isDailyMode) {
        // Add date for daily mode
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        shareText = `WordLock Daily ${day}/${month} - ${score}/${MAX_GUESSES}\n\n`;
    } else {
        shareText = `WordLock Practice ${score}/${MAX_GUESSES}\n\n`;
    }

    // Add colored squares for each guess
    const emojiMap = {
        'correct': '🟩',
        'present': '🟨',
        'absent': '⬛'
    };

    guessResults.forEach((result, rowIndex) => {
        const rowEmojis = result.map((status, colIndex) => {
            // Check if this position was locked for this row
            const lockedPos = lockedPositions[rowIndex];
            if (lockedPos === colIndex && rowIndex > 0) {
                return '🟥'; // Red square for locked positions
            }
            return emojiMap[status];
        });
        shareText += rowEmojis.join('') + '\n';
    });

    shareText += '\nPlay at mimhoff.com/wordlock';

    return shareText;
}

function copyToClipboard() {
    const shareText = generateShareText();

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('Copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            fallbackCopyToClipboard(shareText);
        });
    } else {
        fallbackCopyToClipboard(shareText);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showMessage('Copied to clipboard!');
    } catch (err) {
        showMessage('Failed to copy');
    }

    document.body.removeChild(textArea);
}

function resetGame() {
    // Don't allow reset in daily mode
    if (isDailyMode) {
        showMessage('Switch to Practice for unlimited games');
        return;
    }

    // Clear practice game state
    localStorage.removeItem('practiceGameState');

    // Reset game state
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    lockedPositions = {};
    previousGuesses = [];
    guessResults = [];

    // Clear the board
    gameBoard.innerHTML = '';

    // Clear the keyboard
    keyboard.innerHTML = '';

    // Clear message
    message.textContent = '';

    // Reinitialize the game with current mode
    startGame(isDailyMode);
    createBoard();
    createKeyboard();
}

function switchMode(daily) {
    isDailyMode = daily;

    // Clear current board and keyboard
    gameBoard.innerHTML = '';
    keyboard.innerHTML = '';
    message.textContent = '';
    currentGuess = '';

    // Try to restore saved game state for the selected mode first
    const stateKey = isDailyMode ? 'dailyGameState' : 'practiceGameState';
    const savedState = localStorage.getItem(stateKey);
    let hasState = false;

    if (savedState) {
        try {
            const gameState = JSON.parse(savedState);
            // For daily mode, check if the saved game is from today
            if (stateKey === 'dailyGameState') {
                const today = getTodaysSeed().toString();
                hasState = (gameState.dateKey === today);
            } else {
                hasState = true;
            }
        } catch (err) {
            hasState = false;
        }
    }

    // If no saved state, start a new game to set up locks
    if (!hasState) {
        startGame(isDailyMode);
    }

    // Recreate board and keyboard
    createBoard();
    createKeyboard();

    // Restore saved game state if available
    if (hasState) {
        restoreGameState(stateKey);
    }

    updateModeButtons();
}

function updateModeButtons() {
    const dailyBtn = document.getElementById('daily-mode-btn');
    const practiceBtn = document.getElementById('practice-mode-btn');

    // Update active state
    if (isDailyMode) {
        dailyBtn.classList.add('active');
        practiceBtn.classList.remove('active');
    } else {
        dailyBtn.classList.remove('active');
        practiceBtn.classList.add('active');
    }

    // Show completed state on daily button
    if (dailyCompleted) {
        dailyBtn.classList.add('completed');
        dailyBtn.textContent = 'Daily ✓';
    } else {
        dailyBtn.classList.remove('completed');
        dailyBtn.textContent = 'Daily';
    }
}

function displayStats() {
    const stats = getStats();

    // Update stat values
    document.getElementById('stat-played').textContent = stats.gamesPlayed;

    const winPct = stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    document.getElementById('stat-win-pct').textContent = winPct;

    document.getElementById('stat-current-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;

    // Display guess distribution
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

    // Show share button if a game has been completed today
    const shareBtn = document.getElementById('share-btn');
    if (playedToday) {
        shareBtn.style.display = 'block';
    } else {
        shareBtn.style.display = 'none';
    }
}

function showStatsModal() {
    displayStats();
    const statsModal = document.getElementById('stats-modal');
    statsModal.style.display = 'block';
}

// Initialize the game
initGame();

// Add New Game button event listener
document.getElementById('new-game-btn').addEventListener('click', resetGame);

// Add Share button event listener
document.getElementById('share-btn').addEventListener('click', copyToClipboard);

// Add mode button event listeners
document.getElementById('daily-mode-btn').addEventListener('click', () => switchMode(true));
document.getElementById('practice-mode-btn').addEventListener('click', () => switchMode(false));

// How to Play modal functionality
const modal = document.getElementById('how-to-play-modal');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const closeBtn = document.querySelector('.close');

howToPlayBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Stats modal functionality
const statsModal = document.getElementById('stats-modal');
const statsBtn = document.getElementById('stats-btn');
const statsCloseBtn = document.querySelector('.stats-close');

statsBtn.addEventListener('click', showStatsModal);

statsCloseBtn.addEventListener('click', () => {
    statsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === statsModal) {
        statsModal.style.display = 'none';
    }
});

// Theme toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle-btn');
themeToggleBtn.addEventListener('click', toggleTheme);
