const CACHE_NAME = 'study-weekly-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './每周学习计划表1.xlsx'
].filter(Boolean);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((resp) => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()));
          }
        }).catch(()=>{});
        return cached;
      }
      return fetch(event.request).then((resp) => {
        if (resp && resp.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()));
        }
        return resp;
      }).catch(() => new Response('离线且无缓存资源', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    })
  );
});