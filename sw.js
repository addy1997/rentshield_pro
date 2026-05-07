const SHELL_CACHE = 'rentshield-shell-v2';
const CDN_CACHE = 'rentshield-cdn-v2';
const API_CACHE = 'rentshield-api-v2';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

const CDN_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn-icons-png.flaticon.com',
];

const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, CDN_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first: app shell
  if (request.mode === 'navigate' || SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Stale-while-revalidate: CDN assets (fonts, icons)
  if (CDN_ORIGINS.some((o) => url.origin === o || request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
    return;
  }

  // Network-first with offline fallback: Gemini API
  if (url.origin === GEMINI_ORIGIN) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Default: network only
  event.respondWith(fetch(request));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request.clone());
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-Cache-Date', cached.headers.get('date') || 'unknown');
      return new Response(cached.body, { status: cached.status, headers });
    }
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No cached response available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
