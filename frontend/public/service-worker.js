const CACHE_NAME = "eventscanner-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Installation des Service Workers
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // Aktiviert den Service Worker sofort 🎉
});

// Aktivierung des Service Workers (alte Caches löschen)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Stellt sicher, dass der neue Service Worker sofort aktiv wird 🚀
});

// Netzwerkanfragen abfangen
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return; // Ignoriere 'chrome-extension' und andere unübliche Protokolle

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          // Nur GET-Requests cachen und nur gültige Antworten speichern
          if (
            event.request.method !== "GET" ||
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Klone die Antwort und speichere sie im Cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
      );
    })
  );
});

// Push-Benachrichtigungen (optional)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "Nachricht erhalten!";
  event.waitUntil(
    self.registration.showNotification("Event Scanner", {
      body: data,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon.ico",
    })
  );
});

// Hintergrund-Synchronisation (optional)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncDataWithServer()); // Dummy-Funktion für Hintergrund-Sync
  }
});

async function syncDataWithServer() {
  console.log("Hintergrund-Synchronisation wird ausgeführt...");
}
