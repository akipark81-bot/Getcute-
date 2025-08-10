const CACHE = 'getcute-v3'; // אם קודם היה v2
const ASSETS = ['.', 'index.html', 'style.css', 'app.js', 'manifest.json',
  'assets/icon-192.png','assets/icon-512.png','assets/avatar.svg','assets/stars.svg'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(res=> res || fetch(e.request)));
});
