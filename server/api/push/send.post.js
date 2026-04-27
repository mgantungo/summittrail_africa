// server/api/push/send.post.js
// Sends a Web Push notification to all stored subscribers

import webpush from 'web-push'

const subscribers = globalThis.__pushSubscribers ?? (globalThis.__pushSubscribers = [])

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Validate VAPID keys are present
  if (!config.vapidPrivateKey || !config.public.vapidPublicKey) {
    throw createError({ statusCode: 500, message: 'VAPID keys not configured' })
  }

  webpush.setVapidDetails(
    'mailto:admin@summittrail.ug',
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  )

  const body = await readBody(event)
  const payload = {
    title: body.title || 'Summit Trail Limited',
    body: body.body || body.summary || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    image: body.image || null,
    url: body.url || '/',
    tag: body.tag || 'stl-' + Date.now(),
  }

  const payloadStr = JSON.stringify(payload)

  let sent = 0
  let failed = 0
  const toRemove = []

  // Send to all subscribers in parallel (batch of 10)
  const batchSize = 10
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    await Promise.all(batch.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payloadStr)
        sent++
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired – mark for removal
          toRemove.push(sub.endpoint)
        }
        failed++
      }
    }))
  }

  // Clean up expired subscriptions
  toRemove.forEach(ep => {
    const idx = subscribers.findIndex(s => s.endpoint === ep)
    if (idx !== -1) subscribers.splice(idx, 1)
  })

  return {
    success: true,
    sent,
    failed,
    total: subscribers.length,
    message: `Notification sent to ${sent} subscribers`,
  }
})
