const CACHE_NAME = 'homa-offline-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/',
        './',
      ]).catch((err) => {
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/@vite') ||
      url.pathname.startsWith('/@fs') ||
      url.pathname.startsWith('/api') ||
      request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL) ||
               caches.match('/') ||
               caches.match('./');
      })
    );
    return;
  }

  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|eot|ttf|webp)$/i.test(url.pathname)) {
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
            });
          });

          return response;
        }).catch(error => {
          return caches.match(request);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).catch(error => {
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_DYNAMIC_CACHE') {
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