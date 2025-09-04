const CACHE='autonotify-servicebook-mvp-v1';
const ASSETS=[
  './','./index.html','./manifest.json',
  './bg-portrait-1080x1920.webp','./bg-landscape-1920x1080.webp',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
