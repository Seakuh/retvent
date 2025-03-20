const CACHE_NAME = "eventscanner-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  // Fügen Sie hier weitere Assets hinzu, die gecacht werden sollen
];

const IMAGE_CACHE_NAME = "image-cache-v1";

// Installation des Service Workers
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      }),
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        console.log("Image Cache geöffnet");
      }),
    ])
  );
});

// Aktivierung des Service Workers
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
});

// // Netzwerkanfragen abfangen
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       // Cache-First Strategie
//       if (response) {
//         return response;
//       }

//       return fetch(event.request).then((response) => {
//         // Nur valide Responses cachen
//         if (!response || response.status !== 200 || response.type !== "basic") {
//           return response;
//         }

//         const responseToCache = response.clone();
//         caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, responseToCache);
//         });

//         return response;
//       });
//     })
//   );
// });

// Fetch Event Handler
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Erweiterte Prüfung für Bildformate
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
    console.log("Cache image:", url);
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Prüfe ob die Response valid ist
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          return caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
