const CACHE_NAME = "static-cache-v2";
const RUNTIME_CACHE = "runtime-cache";

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/styles.css',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0'
];

self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
    evt.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                // return array of cache names that are old to delete
                return cacheNames.filter(
                    cacheName => !currentCaches.includes(cacheName)
                );
            })
            .then(cachesToDelete => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// self.addEventListener('fetch', function (evt) {
//     // code to handle requests goes here
//     evt.respondWith(
//         caches.open(CACHE_NAME).then(cache => {
//             return cache.match(evt.request).then(response => {
//                 return response || fetch(evt.request);
//             });
//         })
//     );
// });

self.addEventListener('fetch', function (evt) {
    if (!(evt.request.url.includes('/api/transaction'))) {
        evt.respondWith(
            caches.match(evt.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(CACHE_NAME).then(cache => {
                    return fetch(evt.request).then(response => {
                        return cache.put(evt.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    } 
});