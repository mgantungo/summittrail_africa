// server/api/tracking/unfollow.post.js
// Body: { expedition: <documentId>, endpoint?: string, email?: string }

export default defineEventHandler(async (event) => {
  rateLimit(event, 'unfollow', { max: 30, windowMs: 60 * 60_000 })

  const { expedition, endpoint, email } = (await readBody(event)) || {}
  if (!expedition || (!endpoint && !email)) {
    throw createError({ statusCode: 400, statusMessage: 'expedition and endpoint or email are required' })
  }
  try {
    const res = await strapiToken(event, '/api/live-expeditions/unfollow', {
      method: 'POST',
      body: { expedition, ...(endpoint ? { endpoint } : { email }) },
    })
    return res.data
  } catch (err) {
    rethrowStrapi(err, 'Could not unfollow')
  }
})
