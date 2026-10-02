# WordLock

Wordle with a strategic twist, live at **https://mimhoff.com/wordlock**.

Guess the five-letter word in 8 rows. On every row except the first and last, one tile is **locked**:
it's pre-filled (in red) with the letter from the same position in your previous guess, and can't be
changed. Locks never fall in the same position on two consecutive rows.

- **Daily** mode: the date (`YYYY-MM-DD`, local time) is hashed to seed the answer and lock positions, so
  everyone gets the same puzzle. Puzzle #1 is 2026-10-01, the v3 launch day (`DAILY_EPOCH` in `src/game/constants.ts`; never change it after launch, since saved streaks store puzzle numbers).
- **Practice** mode: unlimited random puzzles. Each has a short code (e.g. `C3Y6KB`), and shared results
  include a `?practice=CODE` link that opens the same puzzle.
- **Difficulties**: Standard (locks visible ahead of time) and Hidden Locks (a lock only appears when its row
  becomes active). Difficulty can only change before the first guess of a game.
- **Statistics** (played, win %, streaks, guess distribution) are kept separately for daily and practice.
  Results share as an emoji grid (🔒 marks locked tiles) via the share sheet on phones or the clipboard
  on desktop.
- **Monetisation**: AdSense on the website, an AdMob banner (with Google's consent form) in the apps,
  and a Ko-fi link. See [docs/ADMOB_SETUP.md](docs/ADMOB_SETUP.md).

## Stack

Vite + React + TypeScript, packaged as a PWA for the web and as native Android/iOS apps with
[Capacitor](https://capacitorjs.com). The same `dist/` build runs in both.

```
src/game/          Pure game logic (no React): puzzles, rules, stats, share text. Unit tested.
src/game/words/    Generated word lists: answers.ts (2,221 solutions), allowed.ts (6,564 extra guesses).
src/components/    React UI.
src/platform/      Web/native seams: storage, sharing, ads, haptics, Android back button.
src/config.ts      Share URL, Ko-fi, AdSense and AdMob IDs (overridable with VITE_* env variables).
src/migration.ts   One-time import of data saved by v2.
public/icons/      App icons; regenerate from icon-source.svg with scripts/icons/generate-icons.sh.
scripts/           Word list and icon generators.
play-store-assets/ Store listing, feature graphic, privacy policy.
```

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # typecheck + production build into dist/
```

## Deploying

- **Website**: `npm run build`, then publish `dist/`. See [DEPLOYMENT.md](DEPLOYMENT.md), which also covers
  the one-time switch from v2.
- **Android**: `npx cap add android` once, then `npm run cap:android`. See [docs/ANDROID.md](docs/ANDROID.md)
  for device testing, signing and Play Store releases.
- **iOS**: `npx cap add ios` once, then `npm run cap:ios` (needs a Mac with Xcode). See the iOS section of
  [docs/ADMOB_SETUP.md](docs/ADMOB_SETUP.md).

## Word lists

Built from openly licensed sources: the ENABLE dictionary (public domain), SCOWL (common-word levels,
which also filter out proper nouns) and OpenSubtitles word frequencies for ranking. Answers exclude plurals,
past tenses, and offensive or unsuitable words. Slurs and explicit words are blocked outright; words with an
ordinary meaning plus a slur, crude or loaded second meaning stay valid guesses but are never answers. Both lists
are in [`scripts/wordlist-blocklist.json`](scripts/wordlist-blocklist.json) and enforced by a unit test.
Regenerate with `node scripts/build-wordlists.mjs`.

**Any change to `answers.ts` changes every daily puzzle**, including adding words at the end: the date
hash picks a word by scaling across the whole list's length. Treat the list as frozen once players are on it.
