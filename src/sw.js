const CACHE_NAME = 'homa-offline-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll([OFFLINE_URL]);
        await self.skipWaiting();
      } catch (err) {
        console.error('Cache add error:', err);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api') || request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (err) {
          const cached = await caches.match(OFFLINE_URL);
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|eot|ttf|webp)$/i.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);

          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, clone).catch((err) =>
              console.error('Cache put error:', err)
            );
          }

          return response;
        } catch (err) {
          const fallback = await caches.match(OFFLINE_URL);
          return fallback || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch (err) {
        const cached = await caches.match(request);

        return (
          cached ||
          new Response('Not found in cache', {
            status: 404,
            statusText: 'File not cached',
          })
        );
      }
    })()
  );
});