const CACHE_NAME = 'event-finder-v1';
const OFFLINE_URL = '/offline.html';

// Assets die beim Install gecached werden sollen
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  OFFLINE_URL
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      }),
      // Force waiting SW to become active
      self.skipWaiting(),
    ])
  );
});

// Aktivierung und Cache-Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Take control of all pages immediately
      self.clients.claim(),
    ])
  );
});

// Fetch-Handler mit Network-First-Strategie für API-Calls und Cache-First für Assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Network-first strategy for API calls
      if (event.request.url.includes('/api/')) {
        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || await cache.match(OFFLINE_URL);
        }
      }

      // Cache-first strategy for static assets
      try {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const networkResponse = await fetch(event.request);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        return await cache.match(OFFLINE_URL);
      }
    })()
  );
});

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
}); 