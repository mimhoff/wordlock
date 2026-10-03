# Backlog (after playtesting)

Parked until testers have played for a while. Decide with their feedback, not before.

## Open questions for playtesting

- **Typing over the lock.** Today the cursor runs through the locked tile: typing the locked letter
  as you reach it is absorbed into the lock, and backspace steps back onto it first. Testers find
  this confusing. The alternative is to **skip the lock** (the cursor jumps over it), which raises
  the question of what happens when the lock pick opens that tile mid-word: the cursor would need
  to come back to it, or the letters would need to shift. Watch which one testers expect.
- **Expert difficulty.** Is the given first word (a yellow letter under the row-2 lock) too easy or
  too hard? The simulator can measure win rates once there's a sense of what feels right.

## Features

- **Plus discoverability:** tapping the locked Expert option opens the Plus offer; a "Remove ads"
  link near the banner; Plus mentioned in the stats window after a game.
- Word ladder and custom modes (needs curated word lists for other lengths).
- Themes (Heist / Dig / Frozen) as a Plus extra; a puzzle archive.
- Puzzle sharing beyond practice links.
- iOS: `codemagic.yaml`, then TestFlight (see [IOS.md](IOS.md)).
- A contact email in the privacy policy; a privacy index page on the site.
