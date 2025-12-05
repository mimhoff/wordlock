# WordLock - Code Structure

This document describes the refactored code architecture for WordLock.

## Overview

The codebase has been refactored from a monolithic `game.js` file (~1000 lines) into a modular architecture with clear separation of concerns. This improves maintainability, testability, and code organization.

## Directory Structure

```
wordlock/
├── index.html                 # Main HTML file
├── styles.css                 # Styling
├── words.js                   # Word lists (SOLUTION_WORDS, VALID_GUESSES)
├── sw.js                      # Service Worker for PWA functionality
├── js/                        # JavaScript modules
│   ├── constants.js           # All configuration constants
│   ├── utils.js               # Utility functions
│   ├── storage.js             # localStorage wrapper with error handling
│   ├── game-state.js          # Game state management
│   ├── board.js               # Board rendering and tile management
│   ├── keyboard.js            # Keyboard input handling
│   ├── stats.js               # Statistics tracking and display
│   ├── modals.js              # Modal dialog management
│   ├── theme.js               # Theme switching (light/dark)
│   └── game.js                # Main game controller
└── game.js.backup             # Original monolithic file (backup)
```

## Module Descriptions

### constants.js
Contains all configuration values, timing constants, and enums used throughout the application.

**Exports:**
- `GAME_CONFIG` - Game rules (word length, max guesses, etc.)
- `TIMING` - Animation and delay timings
- `TILE_STATES` - Tile state constants (correct, present, absent, locked)
- `GAME_MODES` - Daily vs practice mode
- `STORAGE_KEYS` - localStorage key names
- `KEYBOARD_LAYOUT` - On-screen keyboard layout
- `SHARE_CONFIG` - Share functionality configuration
- `THEMES` - Theme names (dark, light)

### utils.js
General utility functions used across the application.

**Key Functions:**
- `seededRandom(seed)` - Deterministic random number generator
- `getTodaysSeed()` - Generate today's date as a seed
- `getFormattedDate()` - Format date for display
- `delay(ms)` - Promise-based delay
- `blurActiveElement()` - Blur focused element
- `isSingleLetter(str)` - Validate single letter input
- `triggerHaptic(duration)` - Haptic feedback for mobile
- `getFocusableElements(container)` - Find focusable elements
- `focusFirstElement(container, delayMs)` - Focus management

### storage.js
Wrapper around localStorage with comprehensive error handling.

**Key Functions:**
- `saveToStorage(key, value)` - Safe save with error handling
- `loadFromStorage(key, defaultValue)` - Safe load with fallback
- `removeFromStorage(key)` - Safe remove
- `isStorageAvailable()` - Check if localStorage works
- `getStorageSize()` - Calculate storage usage
- `clearGameData(keys)` - Clear multiple keys

**Features:**
- Handles QuotaExceededError
- Graceful degradation for private browsing
- JSON serialization/deserialization with error handling

### game-state.js
Encapsulates all game state and provides controlled access through a class.

**GameState Class:**
- `initializeGame(isDailyMode)` - Start new game
- `initializeDailyGame()` - Start daily game with seeded random
- `initializePracticeGame()` - Start practice game with true random
- `generateLockedPositions(rng)` - Create lock positions for rows
- `addLetter(letter)` - Add letter to current guess
- `deleteLetter()` - Remove last letter
- `buildCompleteGuess()` - Build guess including locked letter
- `submitGuess(result)` - Submit and record guess
- `saveState()` - Persist state to localStorage
- `loadState()` - Restore state from localStorage
- `checkDailyCompletion()` - Check if daily is complete
- `markDailyComplete()` - Mark daily as complete

**Benefits:**
- Centralized state management
- No global variables
- Easy to test and debug
- Clear state transitions

### board.js
Manages the game board DOM and tile rendering.

**BoardManager Class:**
- `createBoard()` - Initialize board with all tiles
- `createTile(row, col)` - Create individual tile element
- `updateCurrentRow(gameState)` - Update tiles during typing
- `animateGuessResult(guess, result, ...)` - Animate tile flips
- `showLockedLetter(gameState)` - Display locked letter
- `updateLockIndicators(gameState)` - Show lock icons
- `restoreBoard(gameState, ...)` - Restore from saved state
- `clear()` - Reset board to empty state
- `getTile(row, col)` - Get specific tile element

**Features:**
- Tile caching for performance
- Proper cleanup and recreation
- Separation of DOM manipulation from game logic

### keyboard.js
Handles both on-screen and physical keyboard input.

**KeyboardManager Class:**
- `createKeyboard()` - Build on-screen keyboard
- `setupPhysicalKeyboard()` - Add event listeners
- `removePhysicalKeyboard()` - Clean up listeners
- `handleKeyClick(key)` - On-screen key press
- `handlePhysicalKeyPress(e)` - Physical key press
- `updateKey(letter, status)` - Update key color
- `resetKeys()` - Clear all key states
- `destroy()` - Complete cleanup

**Features:**
- Callback-based architecture for loose coupling
- Prevents input when modals are open
- Proper event listener cleanup

### stats.js
Manages game statistics and sharing functionality.

**Key Functions:**
- `getStats()` - Load statistics from storage
- `updateStats(won, guessCount)` - Update after game
- `displayStats()` - Render stats in modal
- `displayGuessDistribution(stats)` - Show distribution chart
- `generateShareText(gameState)` - Create share message
- `copyShareTextToClipboard(shareText, shareBtn)` - Copy to clipboard

**Features:**
- Tracks games played, won, streaks
- Guess distribution histogram
- Share functionality with fallback for older browsers
- Highlights today's result

### modals.js
Manages modal dialogs (How to Play, Statistics).

**ModalManager Class:**
- `setupEventListeners()` - Initialize modal handlers
- `openHowToPlay()` - Show tutorial modal
- `closeHowToPlay()` - Hide tutorial modal
- `openStats()` - Show statistics modal
- `closeStats()` - Hide statistics modal
- `isModalOpen()` - Check if any modal is open
- `checkFirstTimeUser()` - Show tutorial for new users

**Features:**
- Focus management for accessibility
- Click outside to close
- First-time user detection
- Proper focus return after close

### theme.js
Handles light/dark theme switching.

**ThemeManager Class:**
- `loadTheme()` - Load theme from storage
- `applyTheme(theme)` - Apply theme to document
- `toggleTheme()` - Switch between themes
- `getTheme()` - Get current theme

**Features:**
- Persists theme preference
- Updates icon display
- Smooth transitions via CSS

### game.js (Main Controller)
Coordinates all modules and implements game logic.

**WordLockGame Class:**
- `initialize()` - Set up game on load
- `setupEventListeners()` - Wire up UI events
- `addLetter(letter)` - Handle letter input
- `deleteLetter()` - Handle backspace
- `submitGuess()` - Process guess submission
- `calculateGuessResult(guess, target)` - Core Wordle logic
- `handleWin()` - Win game flow
- `handleLoss()` - Loss game flow
- `switchMode(isDailyMode)` - Change game mode
- `resetGame()` - Start new practice game
- `updateModeButtons()` - Update UI state
- `shareResults()` - Share game results

**Features:**
- Clean separation of concerns
- Delegates to specialized modules
- Minimal direct DOM manipulation
- Easy to extend and modify

## Key Improvements

### 1. Modularity
- Each module has a single responsibility
- Clear interfaces between modules
- Easy to test individual components

### 2. Error Handling
- All localStorage operations wrapped with try-catch
- Graceful degradation when storage unavailable
- Proper error logging for debugging

### 3. Code Organization
- Constants centralized in one file
- No magic numbers scattered throughout code
- Consistent naming conventions

### 4. Performance
- Tile caching eliminates repeated DOM queries
- Efficient lock indicator updates
- Minimal unnecessary re-renders

### 5. Maintainability
- Smaller files are easier to understand
- Clear module boundaries
- Comprehensive comments and documentation

### 6. Testability
- Pure functions for easy unit testing
- State encapsulation makes testing easier
- Mock-friendly architecture

### 7. Bug Fixes
- Service worker path now works in subdirectories
- Proper tile cache clearing on reset
- Daily completion check on mode switch
- Consistent state management

## ES6 Modules

The refactored code uses ES6 modules (`import`/`export`). This requires:

1. Setting `type="module"` on the main script tag in `index.html`
2. Using relative paths for imports (`./ ` or `../`)
3. Serving from a web server (modules don't work with `file://` protocol)

## Testing Recommendations

### Unit Tests
- `utils.js` - seededRandom, date functions
- `game-state.js` - state transitions, guess building
- `stats.js` - statistics calculations
- Main game logic - calculateGuessResult

### Integration Tests
- Full game flow (start to win/loss)
- Mode switching
- State persistence and restoration
- Share functionality

### Browser Compatibility
- Test on modern browsers (Chrome, Firefox, Safari, Edge)
- Test service worker functionality
- Test localStorage in private browsing mode
- Test on mobile devices

## Future Enhancements

### Easy Additions
- Daily word archive/history
- Hard mode (revealed hints must be used)
- Colorblind mode with patterns
- Animation enhancements
- Sound effects
- Practice mode difficulty settings

### Architecture Improvements
- Add TypeScript for type safety
- Implement event bus for module communication
- Add state management library (Redux/Zustand)
- Create component-based architecture
- Add automated testing

## Migration Notes

The original `game.js` has been backed up as `game.js.backup`. The functionality remains exactly the same - this is a refactoring, not a rewrite. All features work identically:

- Daily and practice modes
- Statistics tracking
- Share functionality
- Theme switching
- Game state persistence
- PWA functionality

If you need to revert to the original code:
1. Remove the `js/` directory
2. Rename `game.js.backup` to `game.js`
3. Update `index.html` to use `<script src="game.js"></script>` instead of the module version
