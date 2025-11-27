// Word list - you can expand this later
const WORDS = [
    'REACT', 'FOCUS', 'BRAIN', 'LUNCH', 'TRADE', 'CROWN', 'BEACH',
    'STORM', 'PLANT', 'MUSIC', 'HOUSE', 'LIGHT', 'WORLD', 'SPACE',
    'SHARK', 'SNAKE', 'APPLE', 'BREAD', 'DANCE', 'FLAME', 'GRAPH',
    'HAPPY', 'JUMPS', 'KNIFE', 'LEMON', 'MOTOR', 'NIGHT', 'OCEAN'
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let currentGuess = '';
let currentRow = 0;
let gameOver = false;

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

function initGame() {
    createBoard();
    createKeyboard();
    document.addEventListener('keydown', handleKeyPress);
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
    if (currentGuess.length < WORD_LENGTH) {
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
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        if (i < currentGuess.length) {
            tile.textContent = currentGuess[i];
            tile.classList.add('filled');
        } else {
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }
}

function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
        showMessage('Not enough letters');
        return;
    }

    checkGuess();

    if (currentGuess === targetWord) {
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

function checkGuess() {
    const guess = currentGuess;
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
