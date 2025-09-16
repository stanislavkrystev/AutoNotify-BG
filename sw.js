// sw.js
const CACHE = 'autonotify-servicebook-mvp-v16';
const ASSETS = [
  './',
  './index.html', './manifest.json',
  './bg-portrait-1080x1920.webp', './bg-landscape-1920x1080.webp',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // важно: новият SW влиза веднага
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // важно: поема контрол над всички табове
  );
});

// Network-first за HTML; за другото — cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req))
    );
  }
});
