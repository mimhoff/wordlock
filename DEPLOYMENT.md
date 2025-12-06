# WordLock Deployment Checklist

## Before Every Deployment

**IMPORTANT**: Update the service worker version to force cache invalidation!

### 1. Update Service Worker Version

Edit `sw.js` line 2 and change the VERSION:

```javascript
// Old
const VERSION = '2025-12-06-v1';

// New (use current date and increment)
const VERSION = '2025-12-07-v1';  // or v2, v3, etc. on same day
```

### 2. Test Locally

Open browser console and check for:
- Service worker installing with new version
- Old caches being deleted
- Network requests for HTML/JS/CSS (not served from cache)

### 3. Deploy

From the `/home/mimhoff/site` directory:
```bash
cd /home/mimhoff/site
./deploy.sh
```

### 4. Verify Deployment

1. Visit https://mimhoff.com/wordlock in **incognito/private mode**
2. Open DevTools Console
3. Look for: `Service Worker 2025-12-XX-vX: Installing...`
4. Verify new version is active
5. Check that the site works correctly

### 5. Clear Old User Caches (if needed)

If users report issues, ask them to:
1. Go to https://mimhoff.com/wordlock
2. Open DevTools (F12)
3. Go to Application → Storage → Clear site data
4. Refresh the page

## Caching Strategy

### Network-First (Always Fresh)
- HTML files (`index.html`)
- JavaScript files (`/js/*.js`)
- CSS files (`styles.css`)

These files are **always fetched from the network** to ensure users get updates immediately.
Cache is only used as offline backup.

### Cache-First (Rarely Change)
- Icons and images (`/icons/*`)
- Manifest (`manifest.json`)
- Word list (`words.js`)
- Favicon (`favicon.svg`)

These files are served from cache for speed, only fetched if not cached.

## Troubleshooting

### Users see old version after deployment
- Did you update the VERSION in sw.js?
- Check browser console for service worker version
- Ask users to hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Mixed old/new files
- This should no longer happen with network-first strategy
- If it does, clear cache and redeploy with updated VERSION

### Service worker not updating
- Ensure `skipWaiting()` is called in install event (it is)
- Ensure `clients.claim()` is called in activate event (it is)
- Close all tabs of the site and reopen
