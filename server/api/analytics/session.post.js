// server/api/analytics/session.post.js
const sessions = globalThis.__analyticsSessions ?? (globalThis.__analyticsSessions = [])

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    sessions.push({
      ...body,
      ip: getRequestIP(event, { xForwardedFor: true }),
      receivedAt: Date.now(),
    })
    if (sessions.length > 5000) sessions.shift()
    return { success: true }
  } catch {
    return { success: false }
  }
})
