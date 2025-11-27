# WordLock

A Wordle clone with a strategic twist! Built with vanilla HTML, CSS, and JavaScript.

## How to Play

1. Open `index.html` in your web browser
2. Guess the 5-letter word in **8 tries**
3. After each guess, the tiles change color:
   - **Green**: Letter is correct and in the right position
   - **Yellow**: Letter is in the word but in the wrong position
   - **Gray**: Letter is not in the word

## The WordLock Twist

In rows 2-7, one letter position is randomly **locked** (shown with a gold border). A locked letter **must** be the same as the letter directly above it from your previous guess. This means your early word choices will constrain your later guesses, adding a strategic planning element to the game!

Example:
- Row 1: BREAD (no locks)
- Row 2: BR_AD (position 2 is locked to 'E' from row 1)
- Row 3: BRE__ (position 3 might be locked to 'A' from row 2)

## Features

- 8 attempts to guess the word
- Locked letter mechanic for strategic gameplay
- On-screen keyboard with color feedback
- Physical keyboard support
- Color-coded tiles showing guess accuracy
- Random word selection from word list

## Running the Game

Simply open `index.html` in any modern web browser. No build process or server required!

## Future Enhancements

- Larger word list
- Daily word mode
- Statistics tracking
- Share results
- Hard mode
- Dark/light theme toggle
