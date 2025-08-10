// --- Force-refresh SW & cache ---
const CACHE = 'getcute-v7'; // העלי מספר בכל עדכון

const ASSETS = [
  './',
  './index.html',
  './style.css?v=6',
  './app.js?v=6',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/avatar_parts.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // תתקין ותיקח שליטה מיד
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // תחליף את הגרסה הישנה בכל הטאבים
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
