// server/api/cms/upload.post.js
//
// Proxies file uploads to Strapi's Media Library (/api/upload), using the
// server-side API token. Returns the uploaded file's public URL so it can
// be stored directly in string-type image fields (adventure.image,
// story.image, guide.avatar, etc.) — no schema changes needed since those
// fields just hold a URL.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const parts = await readMultipartFormData(event)

  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = parts.find(p => p.name === 'file') || parts[0]
  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file data found' })
  }

  const MAX_BYTES = 8 * 1024 * 1024 // 8MB
  if (filePart.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'File too large (max 8MB)' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (filePart.type && !allowedTypes.includes(filePart.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Only JPEG, PNG, WEBP, or GIF images are allowed' })
  }

  const form = new FormData()
  const blob = new Blob([filePart.data], { type: filePart.type || 'application/octet-stream' })
  form.append('files', blob, filePart.filename || 'upload.jpg')

  const base = config.public.strapiUrl
  try {
    const result = await $fetch(`${base}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.strapiApiToken}` },
      body: form,
    })
    const uploaded = Array.isArray(result) ? result[0] : result
    return {
      url: uploaded.url?.startsWith('http') ? uploaded.url : `${base}${uploaded.url}`,
      id: uploaded.id,
      name: uploaded.name,
    }
  } catch (err) {
    console.error('[upload] Strapi upload failed:', err.response?.status, err.response?._data || err.message)
    throw createError({ statusCode: err.response?.status || 500, statusMessage: 'Upload failed' })
  }
})
