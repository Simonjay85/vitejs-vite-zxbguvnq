const CACHE = 'pickleball-v37';

// Install: skip waiting immediately so new SW activates right away
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate: DELETE ALL caches (no version filter), then claim all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: never cache HTML — always get fresh from network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) return;

  const url = new URL(e.request.url);

  // HTML pages: always network, no cache
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  // CDN + other assets: cache-first for speed
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});
