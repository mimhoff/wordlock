# Deploying the website

The site is live at https://mimhoff.com/wordlock and deployed from the separate site repo
(`~/projects/web/mimhoff-site`, via `./deploy.sh`).

## Every deployment

```bash
npm test
npm run build        # typecheck + production build into dist/
```

Then publish **the contents of `dist/`** as the `wordlock/` folder of the site, replacing what's
there. The site repo's `deploy.sh` does all of this (test, build, rsync `dist/` with `--delete`):

```bash
~/projects/web/mimhoff-site/deploy.sh wordlock             # add --dry-run to preview
```

Asset paths are relative, so the build works under any path, no configuration needed.

There's no service worker version to bump any more. `vite-plugin-pwa` generates `sw.js` with a
content hash of every file, so each build is picked up automatically: returning visitors get the new
version on their next visit, and it activates immediately.

### Server caching

For updates to land promptly, `index.html` and `sw.js` must not be cached long by the server/CDN
(browsers already revalidate `sw.js` at least every 24h). Everything under `assets/` has a hash
in its filename and can be cached forever.

## First deployment of v3 (replacing v2)

v2 was plain files (`index.html`, `styles.css`, `words.js`, `js/`, `sw.js`, `manifest.json`,
`icons/`). The v3 build replaces them. Things to check:

1. **`deploy.sh` copies `dist/`** with `--delete`, which removes v2's old `js/`, `words.js`,
   `styles.css` and `manifest.json`.
2. **Switch at local midnight** if you can. v3 picks a different daily word than v2, so a player who
   already played today's v2 puzzle would otherwise see a second, different daily. (Their stats are
   safe: a day is only ever counted once.)
3. **Verify** in a normal (not private) window that already had v2 cached:
   - The new version loads after one refresh, and the old `wordlock-*` cache is gone
     (DevTools → Application → Cache storage)
   - Your stats, streak and theme carried over (Statistics dialog)
   - Help doesn't pop up again for returning players

### What carries over from v2

On first load, v3 imports v2's saved data (`src/migration.ts`), leaving the original keys untouched
so a rollback to v2 still works:

| v2 key | v3 |
|---|---|
| `stats` | Daily stats, including the streak (kept only if the last v2 game was yesterday or today) |
| `theme` | Theme. v2 never saved this correctly (an un-awaited async call stored `"{}"`), so returning v2 players always saw dark mode; v3 keeps them on dark |
| `hasVisited` | Don't show the help again |

An in-progress v2 game isn't carried over, since v3's daily puzzle is different anyway.

### Rolling back

Redeploy v2's files from the `master` branch. v2's data is still in place. Stats from games played
on v3 in the meantime won't appear in v2.
