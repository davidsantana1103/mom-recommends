/* Mom Recommends service worker (D16): asset caching for offline use.
 * Installable PWA (manifest + install prompt) is post-MVP; this file only
 * caches the built assets so a returning visitor gets the app shell and
 * static files even without a connection. */
'use strict'

const VERSION = 'mom-recommends-v2'

// App root derived from the service worker's own URL, so the cache works both
// at the domain root (Cloudflare Pages) and under a subpath (GitHub Pages
// project site at /<repo>/). `./` resolves to the directory the SW is served
// from, which is the Vite `base` used to build it.
const APP_ROOT = new URL('./', self.location).pathname

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll([APP_ROOT]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  // Network-first for navigation: always try fresh HTML, fall back to the
  // cached app shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(VERSION).then((cache) => cache.put(APP_ROOT, copy))
          return response
        })
        .catch(() => caches.match(APP_ROOT)),
    )
    return
  }

  // Cache-first for hashed static assets (scripts, styles, images).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone()
          void caches.open(VERSION).then((cache) => cache.put(request, copy))
          return response
        }),
    ),
  )
})