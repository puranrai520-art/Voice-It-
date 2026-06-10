// VoiceIt Service Worker — enables PWA installability
// Simple cache-first strategy for static assets, network-first for API

const CACHE_NAME = 'voiceit-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, API routes, and Clerk/Supabase calls
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful HTML navigation responses
        if (res.ok && event.request.mode === 'navigate') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});
