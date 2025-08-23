const CACHE_NAME = 'sovereign-engine-v2';
// Add any new files to this list to ensure they are cached for offline use.
const urlsToCache = [
  '.', // This caches the root, which should be your main html file.
  'sovereign-engine.html',
  'engine.js',
  'mods/weapons/weapons.js',
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

// Intercept network requests and serve from cache if available.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
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