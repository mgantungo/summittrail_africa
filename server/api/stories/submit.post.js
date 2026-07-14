// server/api/stories/submit.post.js
//
// Public Adventure Journal story submission. Creates a draft `story`
// entry — invisible on /stories until published in the Strapi admin.

const DEFAULT_STRAPI_URL = 'https://cms.summittrail.visiongroup.co.ug'
let warned = false

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { name, location, adventureId, title, excerpt, content, image } = body || {}

  if (!name || !title || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Name, title, and your story are required' })
  }

  const base = config.public.strapiUrl || DEFAULT_STRAPI_URL
  if ((!config.public.strapiUrl || !config.strapiApiToken) && !warned) {
    console.warn(
      '[stories/submit] Missing config — strapiUrl:', config.public.strapiUrl || '(using fallback)',
      'strapiApiToken set:', !!config.strapiApiToken
    )
    warned = true
  }

  const slug = title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) + '-' + Date.now().toString().slice(-5)

  try {
    await $fetch(`${base}/api/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.strapiApiToken || ''}` },
      body: {
        data: {
          title,
          slug,
          category: 'community',
          adventure: adventureId || null,
          author: { name, location: location || '', avatar: '' },
          readTime: Math.max(1, Math.round((content?.length || 0) / 1000)),
          featured: false,
          publishDate: new Date().toISOString().slice(0, 10),
          excerpt: excerpt || content.slice(0, 160) + '…',
          content,
          image: image || '',
          tags: ['community', 'reader-submitted'],
          views: 0,
        },
      },
    })
  } catch (err) {
    console.error('[stories/submit] Strapi rejected the story:', err.response?.status, err.response?._data || err.message)
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?._data?.error?.message || 'Could not save your story. Please try again.',
    })
  }

  return { success: true }
})