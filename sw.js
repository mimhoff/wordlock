// Version changes with each deployment to force cache update
const VERSION = '2025-12-06-v1';
const CACHE_NAME = `wordlock-${VERSION}`;

// Assets that rarely change - can use cache-first
const STATIC_ASSETS = [
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.svg',
    '/manifest.json',
    '/words.js'
];

// Dynamic assets that change frequently - use network-first
const DYNAMIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/game.js',
    '/js/game-state.js',
    '/js/board.js',
    '/js/keyboard.js',
    '/js/modals.js',
    '/js/stats.js',
    '/js/storage.js',
    '/js/theme.js',
    '/js/animations.js',
    '/js/constants.js',
    '/js/utils.js',
    '/js/admob.js'
];

// Install event - cache static assets only
self.addEventListener('install', (event) => {
    console.log(`Service Worker ${VERSION}: Installing...`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log(`Service Worker ${VERSION}: Caching static assets`);
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log(`Service Worker ${VERSION}: Installed, activating immediately`);
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('Service Worker: Cache failed', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log(`Service Worker ${VERSION}: Activating...`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log(`Service Worker ${VERSION}: Deleting old cache`, cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log(`Service Worker ${VERSION}: Activated, taking control of all pages`);
            return self.clients.claim();
        })
    );
});

// Helper: Check if URL is a static asset
function isStaticAsset(url) {
    const path = new URL(url).pathname;
    return STATIC_ASSETS.some(asset => path.endsWith(asset) || path === asset);
}

// Fetch event - use different strategies for different asset types
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Network-first for HTML/JS/CSS (always get latest, cache as backup)
    if (!isStaticAsset(request.url)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache the fresh response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cached) => {
                        if (cached) {
                            console.log('Service Worker: Serving from cache (offline):', request.url);
                            return cached;
                        }
                        console.log('Service Worker: No cached version available:', request.url);
                    });
                })
        );
    }
    // Cache-first for static assets (icons, images, etc.)
    else {
        event.respondWith(
            caches.match(request)
                .then((cached) => {
                    if (cached) {
                        return cached;
                    }
                    // Not in cache, fetch and cache it
                    return fetch(request).then((response) => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    });
                })
        );
    }
});
