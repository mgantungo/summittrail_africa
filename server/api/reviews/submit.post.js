// server/api/reviews/submit.post.js
//
// Public review/testimonial submission. Creates a draft `review` entry
// (Strapi's default for draft-and-publish content types is 'draft' on
// create) so nothing submitted here appears on the site until someone
// reviews and publishes it in the Strapi admin.

const DEFAULT_STRAPI_URL = 'https://cms.summittrail.visiongroup.co.ug'
let warned = false

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { name, location, adventureId, rating, title, content } = body || {}

  if (!name || !rating || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Name, rating, and your experience are required' })
  }

  const base = config.public.strapiUrl || DEFAULT_STRAPI_URL
  if ((!config.public.strapiUrl || !config.strapiApiToken) && !warned) {
    console.warn(
      '[reviews/submit] Missing config — strapiUrl:', config.public.strapiUrl || '(using fallback)',
      'strapiApiToken set:', !!config.strapiApiToken
    )
    warned = true
  }

  try {
    await $fetch(`${base}/api/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.strapiApiToken || ''}` },
      body: {
        data: {
          adventure: adventureId || null,
          author: { name, location: location || '', avatar: '' },
          rating: Math.min(5, Math.max(1, Number(rating))),
          title: title || '',
          content,
          date: new Date().toISOString().slice(0, 10),
          verified: false,
        },
      },
    })
  } catch (err) {
    console.error('[reviews/submit] Strapi rejected the review:', err.response?.status, err.response?._data || err.message)
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?._data?.error?.message || 'Could not save your review. Please try again.',
    })
  }

  return { success: true }
})