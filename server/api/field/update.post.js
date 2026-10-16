// server/api/field/update.post.js
//
// Posts a guide's field update to the CMS (expedition documentId in the
// BODY), then notifies the expedition's followers by push / email.
// Notification failures never fail the update itself.

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  if (!body.expedition || typeof body.expedition !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'expedition is required' })
  }

  let res
  try {
    res = await strapiAsGuide(event, '/api/live-expeditions/field-update', { method: 'POST', body })
  } catch (err) {
    if (err?.statusCode === 401) throw err
    if (err?.response?.status === 401) {
      deleteCookie(event, FIELD_COOKIE, { path: '/' })
      throw createError({ statusCode: 401, statusMessage: 'Your session has expired — sign in again' })
    }
    rethrowStrapi(err, 'Could not save the update')
  }

  const summary = res.meta?.summary || {}
  if (summary.posted || summary.advancedTo) {
    // Don't make the guide wait on notification fan-out
    const job = notifyFollowers(event, body.expedition, summary).catch((e) =>
      console.error('[field/update] notify failed:', e?.message || e))
    if (typeof event.waitUntil === 'function') event.waitUntil(job)
  }

  return { data: res.data, summary }
})
