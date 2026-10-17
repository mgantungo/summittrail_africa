// server/api/live/post.post.js
//
// A confirmed participant posts ONE photo + ONE comment + GPS to the live
// feed of an expedition that has started.
//
// multipart/form-data:
//   photo       the image (exactly one; .jpg .jpeg .png .webp)
//   comment     2–500 chars
//   expedition  live-expedition documentId
//   lat, lng    device GPS at posting time (required)
//
// Flow: session cookie → eligibility check in the CMS → resample to
// 700×700 + watermark (server/utils/live-image.js) → Strapi Media Library
// → appended to the expedition feed by the CMS (which re-checks the
// booking and enforces a per-person cool-down) → followers notified.

// Upload cap for the photo. The page compresses photos to fit before
// sending; Apache enforces the same limit (deploy/apache-live-post.conf).
const MAX_BYTES = 700 * 1024
const FORM_OVERHEAD = 16 * 1024 // multipart boundaries + comment/GPS fields

export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  rateLimit(event, 'live-post', { max: 10, windowMs: 10 * 60_000 })

  const declared = Number(getRequestHeader(event, 'content-length') || 0)
  if (declared > MAX_BYTES + FORM_OVERHEAD) {
    throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 700 KB)' })
  }

  const parts = (await readMultipartFormData(event)) || []
  const files = parts.filter((p) => p.filename)
  if (files.length !== 1 || files[0].name !== 'photo') {
    throw createError({ statusCode: 400, statusMessage: 'Upload exactly one photo per post' })
  }
  const photo = files[0]
  if (!photo.data?.length) throw createError({ statusCode: 400, statusMessage: 'The photo is empty' })
  if (photo.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 700 KB)' })

  const ext = (String(photo.filename).toLowerCase().match(/\.[a-z0-9]+$/) || [''])[0]
  if (!LIVE_EXTENSIONS.includes(ext)) {
    throw createError({ statusCode: 400, statusMessage: 'Only .jpg, .jpeg, .png or .webp photos' })
  }

  const field = (name) => {
    const p = parts.find((x) => x.name === name && !x.filename)
    return p ? p.data.toString('utf8').trim() : ''
  }
  const expedition = field('expedition')
  const comment = field('comment').replace(/\s+/g, ' ')
  const lat = Number(field('lat'))
  const lng = Number(field('lng'))

  if (!expedition) throw createError({ statusCode: 400, statusMessage: 'Choose the expedition you are on' })
  if (comment.length < 2) throw createError({ statusCode: 400, statusMessage: 'Add a comment to your photo' })
  if (comment.length > 500) throw createError({ statusCode: 400, statusMessage: 'Comment is too long (max 500 characters)' })
  if (!field('lat') || !field('lng') || !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) {
    throw createError({ statusCode: 400, statusMessage: 'GPS location is required — allow location access and try again' })
  }

  // Cheap eligibility check before spending CPU and storage on the photo
  let eligible
  try {
    eligible = await strapiToken(event, '/api/live-expeditions/participant-expeditions', {
      query: { customer: customer.documentId },
    })
  } catch (err) {
    rethrowStrapi(err, 'Could not check your booking')
  }
  if (!(eligible?.data || []).some((e) => e.documentId === expedition)) {
    throw createError({ statusCode: 403, statusMessage: 'Only confirmed participants can post, once the expedition has started' })
  }

  const jpeg = await processLivePhoto(photo.data, { lat, lng, when: new Date() })

  // Upload to the Strapi Media Library
  const form = new FormData()
  const name = `live-${expedition.slice(0, 12)}-${Date.now()}.jpg`
  form.append('files', new Blob([jpeg], { type: 'image/jpeg' }), name)
  form.append('fileInfo', JSON.stringify({ name, alternativeText: comment.slice(0, 120) }))

  let uploaded
  try {
    const result = await strapiToken(event, '/api/upload', { method: 'POST', body: form })
    uploaded = Array.isArray(result) ? result[0] : result
  } catch (err) {
    rethrowStrapi(err, 'Photo upload failed')
  }
  const publicBase = useRuntimeConfig(event).public.strapiUrl
  const imageUrl = uploaded?.url?.startsWith('http') ? uploaded.url : `${publicBase}${uploaded?.url || ''}`

  // Append to the feed (CMS re-checks booking + status + cool-down)
  let summary
  try {
    const res = await strapiToken(event, '/api/live-expeditions/participant-post', {
      method: 'POST',
      body: { expedition, customer: customer.documentId, text: comment, image: imageUrl, lat, lng },
    })
    summary = res?.data || {}
  } catch (err) {
    // Don't leave an orphaned photo in the Media Library
    if (uploaded?.id) {
      strapiToken(event, `/api/upload/files/${uploaded.id}`, { method: 'DELETE' })
        .catch((e) => console.error('[live/post] orphan cleanup failed:', e?.message || e))
    }
    rethrowStrapi(err, 'Could not publish your post')
  }

  // Followers: don't make the participant wait on the fan-out
  const job = notifyFollowers(event, expedition, summary).catch((e) =>
    console.error('[live/post] notify failed:', e?.message || e))
  if (typeof event.waitUntil === 'function') event.waitUntil(job)

  return { ok: true, post: { image: imageUrl, text: comment, author: summary.author, lat, lng } }
})
