const CACHE_NAME = 'sardor-mission-90-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/index.css',
    './manifest.json',
    './data/curriculum.json',
    
    // Core
    './js/core/app.js',
    './js/core/router.js',
    './js/core/state.js',
    
    // Engines
    './js/engines/curriculum.js',
    './js/engines/level.js',
    './js/engines/progress.js',
    './js/engines/streak.js',
    './js/engines/xp.js',
    
    // Views
    './js/views/ai.js',
    './js/views/analytics.js',
    './js/views/backend.js',
    './js/views/dashboard.js',
    './js/views/english.js',
    './js/views/journal.js',
    './js/views/portfolio.js',
    './js/views/settings.js',
    
    // Utils
    './js/utils/dom.js',
    
    // Components
    './js/components/nav.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(
                (response) => {
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }
            );
        }).catch(() => {
            // Offline fallback
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
