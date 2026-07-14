// server/api/public/submit-experience.post.js
//
// Public-facing endpoint for the "Share Your Experience" page. Reviews
// aren't publicly writable in Strapi (by design — we don't want the
// browser able to create arbitrary CMS content directly), so this route
// uses the server-side API token to create the entry on the visitor's
// behalf. Everything lands as a DRAFT review, invisible on the site
// until someone reviews and publishes it in the Strapi admin — this is
// the spam/moderation gate.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { adventureId, rating, title, content, name, location, avatar, story } = body || {}

  if (!content || !rating) {
    throw createError({ statusCode: 400, statusMessage: 'A rating and review text are required' })
  }
  if (rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 5' })
  }

  const base = config.public.strapiUrl
  const authHeaders = { Authorization: `Bearer ${config.strapiApiToken}` }

  const createdReview = await $fetch(`${base}/api/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      data: {
        adventure: adventureId || null,
        rating,
        title: title || '',
        content,
        date: new Date().toISOString().slice(0, 10),
        verified: false, // public submissions aren't auto-verified — reviewer checks this before publishing
        author: { name: name || 'Anonymous Traveler', location: location || '', avatar: avatar || '' },
      },
    },
  })

  let createdStory = null
  // Optional longer-form journal entry submitted alongside the review
  if (story?.content && story?.title) {
    createdStory = await $fetch(`${base}/api/stories`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        data: {
          title: story.title,
          category: story.category || '',
          adventure: adventureId || null,
          excerpt: story.excerpt || story.content.slice(0, 160),
          content: story.content,
          image: story.image || '',
          tags: story.tags || [],
          readTime: Math.max(1, Math.round(story.content.split(/\s+/).length / 200)),
          publishDate: new Date().toISOString().slice(0, 10),
          featured: false,
          author: { name: name || 'Anonymous Traveler', location: location || '', avatar: avatar || '' },
        },
      },
    })
  }

  return { success: true, reviewId: createdReview?.data?.id, storyId: createdStory?.data?.id }
})
