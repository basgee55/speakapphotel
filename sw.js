const CACHE = 'lumiere-v17';
const STATIC = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
const BYPASS = ['api.anthropic.com', 'api.elevenlabs.io', 'fonts.googleapis.com', 'fonts.gstatic.com', 'workers.dev'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (BYPASS.some(h => e.request.url.includes(h))) return;

  // HTML: always network-first so updates are picked up immediately
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
