// public/sw.js — Summit Trail Service Worker

const CACHE_NAME = 'summit-trail-v1'
const STATIC_ASSETS = ['/', '/adventures', '/stories', '/offline.html']

// ─── INSTALL ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

// ─── ACTIVATE ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── FETCH (cache-first for static, network for API) ──
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() =>
      caches.match('/offline.html')
    ))
  )
})

// ─── PUSH NOTIFICATION ────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = {
      title: 'Summit Trail Limited',
      body: event.data.text(),
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      image: '/images/og-cover.jpg',
      url: '/',
    }
  }

  const options = {
    body: payload.body || payload.summary || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-72.png',
    image: payload.image || null,
    data: { url: payload.url || '/' },
    actions: [
      { action: 'view', title: 'View Expedition' },
      { action: 'close', title: 'Dismiss' },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: payload.tag || 'stl-notification',
    renotify: true,
    timestamp: Date.now(),
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Summit Trail', options)
  )
})

// ─── NOTIFICATION CLICK ───────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// ─── NOTIFICATION CLOSE ───────────────────────────
self.addEventListener('notificationclose', (event) => {
  // Track dismissals if needed
  console.log('Notification dismissed:', event.notification.tag)
})
