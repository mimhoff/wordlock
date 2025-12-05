# WordLock Animations Guide

This document describes all animations added to WordLock for enhanced user experience.

## Overview

The animations system provides smooth, polished visual feedback throughout the game. All animations respect the user's `prefers-reduced-motion` setting for accessibility.

## Animation Module

**Location:** `js/animations.js`

The `AnimationManager` class provides static methods for all game animations. Each animation returns a Promise that resolves when the animation completes, allowing for proper sequencing.

## Animation Types

### 1. Tile Flip (Guess Result Reveal)

**Animation:** `flip`
**Duration:** 600ms
**Trigger:** After submitting a valid guess

The classic Wordle-style tile flip that reveals the color (green/yellow/gray) for each letter. Each tile flips sequentially with a 200ms stagger for a cascading effect.

```javascript
AnimationManager.flipTile(tile, 'correct', delay)
```

**Visual Effect:**
- Tile rotates 90° (flips up)
- Color changes at midpoint
- Tile rotates back to 0° (flips down)
- Lock icons animate with their respective colors

### 2. Shake (Invalid Input)

**Animation:** `shake`
**Duration:** 500ms
**Trigger:** Invalid word or not enough letters

Horizontal shake that indicates an error without being jarring.

```javascript
AnimationManager.shakeRow(rowIndex, tileCache)
```

**Visual Effect:**
- Row shakes left and right
- Multiple oscillations with decreasing amplitude
- No color change (indicates temporary error)

**Triggers:**
- Word not in dictionary
- Not enough letters entered

### 3. Bounce (Victory!)

**Animation:** `bounce`
**Duration:** 600ms per tile (staggered)
**Trigger:** Winning the game

Celebratory bounce animation for the winning row.

```javascript
AnimationManager.bounceRow(rowIndex, tileCache)
```

**Visual Effect:**
- Each tile bounces up and down
- 100ms stagger between tiles creates wave effect
- Smooth easing for natural feel

### 4. Pop (Letter Entry)

**Animation:** `pop`
**Duration:** 100ms
**Trigger:** Adding a letter to a tile

Quick scale animation providing tactile feedback when typing.

```javascript
AnimationManager.popTile(tile)
```

**Visual Effect:**
- Tile briefly scales to 110%
- Returns to normal size
- Subtle but responsive

### 5. Locked Letter Reveal

**Animation:** `lockedReveal`
**Duration:** 400ms
**Trigger:** New row starts with locked letter

Emphasizes the locked letter mechanic that makes WordLock unique.

```javascript
AnimationManager.revealLockedLetter(tile)
```

**Visual Effect:**
- Starts small and transparent (scale 0.8, opacity 0)
- Briefly overshoots to 110% scale
- Settles at normal size with full opacity
- Followed by lock icon pulse

### 6. Lock Icon Pulse

**Animation:** `pulse`
**Duration:** 600ms
**Trigger:** Lock icon appears on locked tile

Draws attention to the lock constraint.

```javascript
AnimationManager.pulseLockIcon(lockIcon)
```

**Visual Effect:**
- Lock icon scales to 115%
- Slight opacity change
- Smooth easing

### 7. Fade In/Out (Modals)

**Animation:** `fadeIn` / `fadeOut`
**Duration:** 300ms
**Trigger:** Opening/closing modal dialogs

Smooth transitions for modal appearances.

```javascript
AnimationManager.fadeIn(modal)
AnimationManager.fadeOut(modal)
```

**Visual Effect:**
- Opacity transitions from 0 to 1 (or reverse)
- Feels professional and polished

### 8. Slide In/Out (Messages)

**Animation:** `slideIn` / `slideOut`
**Duration:** 300ms
**Trigger:** Displaying error/success messages

Messages slide down from above for visibility.

```javascript
AnimationManager.slideIn(element)
AnimationManager.slideOut(element)
```

**Visual Effect:**
- Slides down 20px while fading in
- Reverses when dismissing
- Non-intrusive but noticeable

### 9. Success Pulse (Share Button)

**Animation:** `successPulse`
**Duration:** 400ms
**Trigger:** Successfully copying share text

Confirms the action was successful.

```javascript
AnimationManager.successPulse(button)
```

**Visual Effect:**
- Button scales down slightly (95%)
- Bounces up to 105%
- Settles back to 100%
- Creates satisfying "click" feel

## Animation Flow Examples

### Complete Guess Submission

1. User presses Enter
2. **Validation:**
   - If invalid → Shake animation + error message slide in
   - If valid → Continue
3. **Tile Flip:** Each tile flips sequentially (0ms, 200ms, 400ms, 600ms, 800ms)
4. **Color Reveal:** Colors appear mid-flip
5. **Lock Icons:** Update and animate with tile colors
6. **Check Result:**
   - If won → Bounce entire row, show message
   - If not won → Continue to next row
7. **Next Row:** After 1000ms delay, locked letter reveals with scale animation
8. **Lock Icon:** Pulse animation on newly locked tile

### Invalid Word Entry

1. User presses Enter with invalid word
2. Message slides in from top: "Not in word list"
3. Current row shakes left-right
4. After 500ms, user can try again
5. After 2000ms, message slides out

### Winning Sequence

1. Final tile flips complete
2. 100ms pause
3. Winning row bounces (staggered 100ms per tile)
4. "You won!" message slides in
5. After 1500ms, stats modal fades in
6. If share button clicked → Success pulse + "Copied!" feedback

## Accessibility

### Reduced Motion Support

The animations respect the user's operating system preference:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

When reduced motion is preferred:
- All animations are nearly instantaneous (0.01ms)
- Visual feedback still occurs (colors change, etc.)
- No smooth motion that might cause discomfort
- Maintains full functionality

### Checking Reduced Motion in JavaScript

```javascript
if (AnimationManager.shouldReduceMotion()) {
    // Use instant transitions
}
```

## CSS Keyframes

All animations are defined in `styles.css` using `@keyframes`. This allows for:
- Hardware acceleration
- Smooth 60fps animations
- Easy tweaking of timing and easing
- Minimal JavaScript overhead

## Performance Considerations

### Optimizations Applied

1. **Hardware Acceleration:** All animations use `transform` and `opacity` properties which are GPU-accelerated
2. **Promise-Based:** Animations return Promises for proper sequencing without blocking
3. **Staggered Animations:** Natural feel without overwhelming the user
4. **Minimal Reflows:** Animations avoid layout-triggering properties
5. **Cached References:** Tile cache prevents DOM queries during animations

### Browser Compatibility

Animations work in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Fallback: If animations aren't supported, game still works perfectly (just without smooth transitions).

## Customizing Animations

### Adjusting Timing

Edit constants in `constants.js`:

```javascript
export const TIMING = {
    TILE_FLIP_DURATION: 200,      // Time between tile flips
    MESSAGE_DISPLAY_DURATION: 2000,
    LOCKED_LETTER_REVEAL_DELAY: 1000,
    // ... etc
};
```

### Modifying Animation Styles

Edit keyframes in `styles.css`:

```css
@keyframes flip {
    0% { transform: rotateX(0); }
    50% { transform: rotateX(90deg); }
    100% { transform: rotateX(0); }
}
```

**Tips:**
- Keep durations under 1 second for responsiveness
- Use `ease-in-out` for most animations
- Test on mobile devices (animations feel different on touch screens)

### Adding New Animations

1. **Define CSS keyframe** in `styles.css`
2. **Add method** to `AnimationManager` in `js/animations.js`
3. **Call from appropriate module** (game.js, board.js, etc.)
4. **Test with reduced motion** enabled

Example:

```javascript
// animations.js
static wiggle(element) {
    return new Promise(resolve => {
        element.style.animation = 'wiggle 0.3s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
            resolve();
        }, 300);
    });
}
```

```css
/* styles.css */
@keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
}
```

## Animation Design Philosophy

The animations follow these principles:

1. **Purposeful:** Each animation serves a clear purpose (feedback, celebration, error indication)
2. **Subtle:** Animations enhance, not distract
3. **Quick:** No animation lasts longer than necessary
4. **Accessible:** Respects user preferences and disabilities
5. **Delightful:** Adds polish and personality to the game
6. **Consistent:** Similar actions have similar animations
7. **Performant:** No jank or frame drops

## Testing Animations

### Manual Testing Checklist

- [ ] Tile flips reveal colors correctly
- [ ] Shake animation triggers on invalid words
- [ ] Bounce animation plays on win
- [ ] Locked letter reveals smoothly
- [ ] Lock icon pulses when appearing
- [ ] Messages slide in and out
- [ ] Modals fade smoothly
- [ ] Share button pulses on success
- [ ] All animations work with reduced motion enabled
- [ ] Animations work on mobile devices
- [ ] No visual glitches or artifacts

### Browser Testing

Test in:
- Chrome/Edge (Windows, Mac, Linux)
- Firefox (Windows, Mac, Linux)
- Safari (Mac, iOS)
- Mobile browsers (iOS Safari, Android Chrome)

### Performance Testing

Use browser DevTools:
- Check FPS (should be 60fps)
- Monitor CPU usage
- Check for layout thrashing
- Verify GPU acceleration

## Future Animation Ideas

Potential enhancements:

1. **Confetti** - On win (especially winning streak)
2. **Particle Effects** - Letters flying into place
3. **Theme Transitions** - Smooth color changes when switching themes
4. **Keyboard Press** - Subtle key depress animation
5. **Streak Celebration** - Special animation for win streaks
6. **Achievement Animations** - Unlock animations for milestones
7. **Daily Word Reveal** - Special animation for new daily word
8. **Loading States** - Skeleton screens while loading

## Troubleshooting

### Animations Not Working

1. **Check browser compatibility** - Update to latest version
2. **Check CSS loading** - Verify styles.css is loaded
3. **Check JavaScript modules** - Open console for errors
4. **Verify animation files** - Ensure animations.js exists
5. **Check reduced motion** - Might be enabled in OS settings

### Animations Laggy

1. **Close other tabs** - Free up browser resources
2. **Update graphics drivers** - Especially on desktop
3. **Disable browser extensions** - Some interfere with animations
4. **Check device performance** - Old devices may struggle
5. **Reduce animation complexity** - Shorten durations in constants.js

### Animations Break Layout

1. **Check CSS specificity** - Animation styles might be overridden
2. **Verify tile cache** - Should be regenerated on board clear
3. **Check for conflicting animations** - Multiple animations on same element
4. **Clear browser cache** - Old styles might be cached

## Conclusion

The animation system makes WordLock feel polished and professional. Every interaction has feedback, making the game more engaging and enjoyable. The modular design makes animations easy to maintain, customize, and extend.

For questions or suggestions about animations, refer to the main `CODE_STRUCTURE.md` document or the inline JSDoc comments in the code.
