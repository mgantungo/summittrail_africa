// server/api/push/subscribe.post.js
// Stores push subscription server-side

// In-memory store (replace with DB in production)
const subscribers = globalThis.__pushSubscribers ?? (globalThis.__pushSubscribers = [])

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { subscription } = body

    if (!subscription?.endpoint) {
      throw createError({ statusCode: 400, message: 'Invalid subscription object' })
    }

    // Avoid duplicate subscriptions
    const exists = subscribers.some(s => s.endpoint === subscription.endpoint)
    if (!exists) {
      subscribers.push({
        ...subscription,
        createdAt: Date.now(),
        country: getHeader(event, 'cf-ipcountry') || null,
      })
    }

    return {
      success: true,
      subscriberCount: subscribers.length,
      message: 'Subscription stored',
    }
  } catch (err) {
    console.error('[Push Subscribe]', err)
    throw createError({ statusCode: 500, message: 'Failed to store subscription' })
  }
})
