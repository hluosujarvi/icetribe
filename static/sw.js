// Service Worker for header image caching
const CACHE_NAME = 'icetribe-images-v1';
const HEADER_IMAGES = [
  '/images/cover_index.jpg',
  '/images/cover_about.jpg',
  '/images/cover_soitossa.jpg',
  '/images/cover_posts.jpg',
  '/images/cover_yhteystiedot.jpg'
];

// Install event - cache header images immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching header images');
        return cache.addAll(HEADER_IMAGES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve images from cache with network fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Only handle image requests
  if (request.destination === 'image' || request.url.includes('/images/')) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then(networkResponse => {
              // Cache successful responses
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            });
        })
        .catch(() => {
          // Fallback for offline scenarios
          console.log('Image not available offline:', request.url);
        })
    );
  }
});