// sw-v17.js — надежден SW с автоматичен ъпдейт и правилно кеширане
const CACHE = 'autonotify-v20'
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './bg-portrait-1080x1920.webp',
  './bg-landscape-1920x1080.webp'
];

// Инсталиране: кеширане на основните файлове и незабавно активиране
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  );
});

// Активиране: чисти старите кешове и поема контрол над всички клиенти
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch стратегия:
// - За HTML/navigation: network-first (винаги се опитва да вземе най-новото)
// - За останалото: cache-first (бързина + офлайн), с бекъп към мрежата
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const isNav =
    req.mode === 'navigate' ||
    (req.method === 'GET' && accept.includes('text/html'));

  if (isNav) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // assets: cache-first + revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached || Promise.reject('offline'));
      return cached || fetchPromise;
    })
  );
});
