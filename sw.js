const PFA_CACHE = 'pfa-arena-shell-v1';
const PFA_CORE = [
  './arena.html',
  './daily-prediction.html',
  './missions.html',
  './bracket.html',
  './leaderboard.html',
  './referral.html',
  './login.html',
  './register.html',
  './css/arena.css',
  './js/arena-game.js',
  './js/bracket-game.js',
  './js/supabase-config.js',
  './js/world-cup-fixtures.js',
  './js/arena-pwa.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PFA_CACHE)
      .then((cache) => cache.addAll(PFA_CORE).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== PFA_CACHE ? caches.delete(key) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(PFA_CACHE).then((cache) => cache.put(req, copy)).catch(() => null);
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./arena.html')))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './arena.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
      return null;
    })
  );
});
