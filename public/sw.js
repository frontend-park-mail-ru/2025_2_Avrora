const CACHE_NAME = 'homa-offline-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL).catch((err) => {
        console.warn('[SW] Failed to cache index.html:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/@fs')) {
    return;
  }

  if (request.method !== 'GET' || url.pathname.startsWith('/api')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(OFFLINE_URL).then(r => r || fetch(request))
      )
    );
    return;
  }

  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});