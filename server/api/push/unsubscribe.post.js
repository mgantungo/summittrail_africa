// server/api/push/unsubscribe.post.js
const subscribers = globalThis.__pushSubscribers ?? (globalThis.__pushSubscribers = [])

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { endpoint } = body
  const idx = subscribers.findIndex(s => s.endpoint === endpoint)
  if (idx !== -1) subscribers.splice(idx, 1)
  return { success: true, remaining: subscribers.length }
})
