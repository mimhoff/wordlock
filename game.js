// Word list - you can expand this later
const WORDS = [
    'REACT', 'FOCUS', 'BRAIN', 'LUNCH', 'TRADE', 'CROWN', 'BEACH',
    'STORM', 'PLANT', 'MUSIC', 'HOUSE', 'LIGHT', 'WORLD', 'SPACE',
    'SHARK', 'SNAKE', 'APPLE', 'BREAD', 'DANCE', 'FLAME', 'GRAPH',
    'HAPPY', 'JUMPS', 'KNIFE', 'LEMON', 'MOTOR', 'NIGHT', 'OCEAN'
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 8;

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
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
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
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

function handleKeyPress(e) {
    if (gameOver) return;

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

    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);

        // Check if this position is locked
        if (i === lockedPos && currentRow > 0 && previousGuesses.length > 0) {
            const lockedLetter = previousGuesses[currentRow - 1][i];
            tile.textContent = lockedLetter;
            tile.classList.add('filled', 'locked');
        } else if (i < currentGuess.length) {
            tile.textContent = currentGuess[i];
            tile.classList.add('filled');
            tile.classList.remove('locked');
        } else {
            tile.textContent = '';
            tile.classList.remove('filled', 'locked');
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

    if (currentRow >= MAX_GUESSES) {
        showMessage(`Game over! The word was ${targetWord}`);
        gameOver = true;
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

initGame();
