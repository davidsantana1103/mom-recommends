/* Mom Recommends service worker (D16): asset caching for offline use.
 * Installable PWA (manifest + install prompt) is post-MVP; this file only
 * caches the built assets so a returning visitor gets the app shell and
 * static files even without a connection. */
'use strict'

const VERSION = 'mom-recommends-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(['/']))
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
          void caches.open(VERSION).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/')),
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