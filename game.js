// Word lists are loaded from words.js
// SOLUTION_WORDS: possible answers (2,314 words)
// VALID_GUESSES: all acceptable guesses (10,656 words)

const WORD_LENGTH = 5;
const MAX_GUESSES = 8;

let targetWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)].toUpperCase();
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let lockedPositions = {}; // Maps row number to locked position index
let previousGuesses = []; // Stores all previous guesses

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

function initGame() {
    initLockedPositions();
    createBoard();
    createKeyboard();
    document.addEventListener('keydown', handleKeyPress);
}

function initLockedPositions() {
    // For rows 2-7 (indices 1-6), randomly pick one position to lock
    for (let row = 1; row <= 6; row++) {
        lockedPositions[row] = Math.floor(Math.random() * WORD_LENGTH);
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
        return;
    }

    currentRow++;
    currentGuess = '';
    updateLockIndicators();

    if (currentRow >= MAX_GUESSES) {
        showMessage(`Game over! The word was ${targetWord}`);
        gameOver = true;
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

function resetGame() {
    // Reset game state
    targetWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)].toUpperCase();
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    lockedPositions = {};
    previousGuesses = [];

    // Clear the board
    gameBoard.innerHTML = '';

    // Clear the keyboard
    keyboard.innerHTML = '';

    // Clear message
    message.textContent = '';

    // Reinitialize the game
    initLockedPositions();
    createBoard();
    createKeyboard();
}

// Initialize the game
initGame();

// Add New Game button event listener
document.getElementById('new-game-btn').addEventListener('click', resetGame);

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
