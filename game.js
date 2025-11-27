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

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

function initGame() {
    checkDailyCompletion();
    startGame(isDailyMode);
    createBoard();
    createKeyboard();

    // If daily is already completed, restore and display the saved game
    if (dailyCompleted && isDailyMode) {
        restoreDailyGame();
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

function restoreDailyGame() {
    const savedState = localStorage.getItem('dailyGameState');
    if (!savedState) return;

    try {
        const gameState = JSON.parse(savedState);

        // Restore game variables
        previousGuesses = gameState.previousGuesses;
        guessResults = gameState.guessResults;
        currentRow = gameState.currentRow;
        lockedPositions = gameState.lockedPositions;
        gameOver = true;

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

        // Show appropriate message
        if (gameState.won) {
            message.textContent = 'You won!';
        } else {
            message.textContent = `Game over! The word was ${targetWord}`;
        }

        // Show share button
        showShareButton();

    } catch (err) {
        console.error('Failed to restore daily game:', err);
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

    // Don't process keyboard input if modal is open
    const modal = document.getElementById('how-to-play-modal');
    if (modal.style.display === 'block') return;

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
        markDailyComplete();
        setTimeout(showShareButton, 1500);
        return;
    }

    currentRow++;
    currentGuess = '';
    updateLockIndicators();

    if (currentRow >= MAX_GUESSES) {
        showMessage(`Game over! The word was ${targetWord}`);
        gameOver = true;
        markDailyComplete();
        setTimeout(showShareButton, 1500);
    } else {
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

function markDailyComplete() {
    if (isDailyMode) {
        const today = getTodaysSeed().toString();
        localStorage.setItem('dailyCompleted', 'true');
        localStorage.setItem('dailyCompletedDate', today);

        // Save game state for sharing later
        const gameState = {
            previousGuesses: previousGuesses,
            guessResults: guessResults,
            currentRow: currentRow,
            won: previousGuesses[previousGuesses.length - 1] === targetWord,
            lockedPositions: lockedPositions
        };
        localStorage.setItem('dailyGameState', JSON.stringify(gameState));

        dailyCompleted = true;
        updateModeButtons();
    }
}

function generateShareText() {
    const won = previousGuesses[previousGuesses.length - 1] === targetWord;
    const score = won ? (currentRow + 1) : 'X';
    const mode = isDailyMode ? 'Daily' : 'Practice';

    let shareText = `WordLock ${mode} ${score}/${MAX_GUESSES}\n\n`;

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

function showShareButton() {
    const shareBtn = document.getElementById('share-btn');
    shareBtn.style.display = 'block';
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

    // Hide share button
    document.getElementById('share-btn').style.display = 'none';

    // Reinitialize the game with current mode
    startGame(isDailyMode);
    createBoard();
    createKeyboard();
}

function switchMode(daily) {
    if (daily && dailyCompleted) {
        showMessage('Already completed today!');
        return;
    }

    isDailyMode = daily;
    resetGame();
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
