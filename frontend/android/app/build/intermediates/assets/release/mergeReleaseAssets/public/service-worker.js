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

// Installation des Service Workers
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
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
