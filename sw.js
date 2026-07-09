const CACHE = 'sassifit-v1';
const ASSETS = [
  '/',
  '/SassiFit/',
  '/SassiFit/index.html',
  '/SassiFit/css/style.css',
  '/SassiFit/js/app.js',
  '/SassiFit/manifest.webmanifest',
  '/SassiFit/icons/icon.svg',
  '/SassiFit/icons/icon-192.png',
  '/SassiFit/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
