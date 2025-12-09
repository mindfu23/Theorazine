/**
 * Service Worker for Theorazine
 * Provides basic caching for improved performance
 */

const CACHE_NAME = 'theorazine-v1.0.0';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/calculator.js',
    '/js/charts.js',
    '/js/presets.js',
    '/js/perplexity.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app resources');
                return cache.addAll(CACHE_URLS);
            })
            .catch(err => {
                console.warn('Cache installation failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    // Skip cross-origin requests and non-GET requests
    if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        // Cache static resources only
                        if (event.request.url.match(/\.(js|css|html|png|jpg|jpeg|gif|svg|ico)$/)) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML pages
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Handle cache errors gracefully
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});