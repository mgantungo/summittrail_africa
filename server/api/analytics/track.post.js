// server/api/analytics/track.post.js
// Stores page views and events. Replace with your analytics DB in production.

const events = globalThis.__analyticsEvents ?? (globalThis.__analyticsEvents = [])

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const entry = {
      ...body,
      ip: getRequestIP(event, { xForwardedFor: true }),
      userAgent: getHeader(event, 'user-agent'),
      receivedAt: Date.now(),
    }
    events.push(entry)
    // Keep last 10,000 events in memory
    if (events.length > 10000) events.shift()
    return { success: true }
  } catch {
    return { success: false }
  }
})
