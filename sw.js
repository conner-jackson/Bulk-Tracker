// Bump CACHE version whenever the app files change to force an update.
const CACHE = 'macroflow-v12';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.png',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for the HTML so edits show up on reload; cache fallback for offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    e.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
