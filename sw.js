const CACHE_NAME = 'sovereign-engine-v3';
// Add any new files to this list to ensure they are cached for offline use.
const urlsToCache = [
  '.', // This caches the root, which should be your main html file.
  'index.html', // Renamed from sovereign-engine.html
  'engine.js',
  'mods/weapons/weapons.js',
  'controls/controls.js',
  'mods/rules/hardcore-spawner.js',
  'mods/rules/rules.js',
  'mods/player/player.js',
  'mods/health/life.js',
  'mods/enemies/boss-ai.js',
  'mods/power-ups/power-ups.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install the service worker and cache the game assets.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// This allows the new service worker to take over when prompted by the app.
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Intercept network requests and serve from cache if available.
// This uses a "stale-while-revalidate" strategy.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});

// Clean up old caches when a new service worker is activated.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});