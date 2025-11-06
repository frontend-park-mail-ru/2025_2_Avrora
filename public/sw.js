const CACHE_NAME = 'homa-offline-v1';
const OFFLINE_URL = '/index.html';

const isDevelopment = self.location.hostname === 'localhost' ||
                     self.location.hostname === '127.0.0.1' ||
                     self.location.protocol === 'http:';

console.log('[SW] Starting in mode:', isDevelopment ? 'development' : 'production');

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  if (isDevelopment) {
    console.log('[SW] Development mode - skipping cache installation');
    return self.skipWaiting();
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching offline page');
      return cache.addAll([
        OFFLINE_URL,
        '/styles/index.css',
        '/images/logo.png'
      ]).catch((err) => {
        console.warn('[SW] Failed to cache resources:', err);
      });
    }).then(() => {
      console.log('[SW] Installation completed');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  if (isDevelopment) {
    console.log('[SW] Development mode - skipping cache cleanup');
    return self.clients.claim();
  }

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
    ).then(() => {
      console.log('[SW] Activation completed');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (isDevelopment) {
    return;
  }

  if (url.pathname.startsWith('/@vite') ||
      url.pathname.startsWith('/@fs') ||
      url.pathname.startsWith('/api') ||
      request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|eot|ttf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache).catch(err => {
              console.warn('[SW] Failed to cache resource:', request.url, err);
            });
          });

          return response;
        }).catch(error => {
          console.warn('[SW] Fetch failed:', request.url, error);
          return caches.match(request);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).catch(error => {
        console.warn('[SW] Fetch failed for:', request.url, error);
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_DYNAMIC_CACHE') {
    console.log('[SW] Clearing dynamic cache');
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    });
  }

  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});