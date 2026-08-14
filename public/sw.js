const CACHE = 'house-of-wisdom-v03';
const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/assets/v03/opening-comic.png',
  '/assets/v03/house-ruin.png',
  '/assets/v03/house-desk-restored.png',
  '/assets/v03/researcher.png',
  '/assets/v03/al-jahiz-ghost.png',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
