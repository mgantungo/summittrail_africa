// server/api/field/upload.post.js
//
// Photo upload for field posts. Only for a signed-in field guide (checked
// against Strapi before anything is uploaded), then stored in the Strapi
// Media Library with the server token. Returns { url }.

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export default defineEventHandler(async (event) => {
  try {
    await strapiAsGuide(event, '/api/live-expeditions/assigned')
  } catch (err) {
    if (err?.statusCode === 401) throw err
    throw createError({ statusCode: 401, statusMessage: 'Sign in again to upload photos' })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file') || parts?.[0]
  if (!file?.data) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 8MB)' })
  if (file.type && !ALLOWED.includes(file.type)) throw createError({ statusCode: 400, statusMessage: 'Only JPEG, PNG or WEBP photos' })

  const form = new FormData()
  form.append('files', new Blob([file.data], { type: file.type || 'image/jpeg' }), file.filename || 'field.jpg')

  const publicBase = useRuntimeConfig(event).public.strapiUrl
  try {
    const result = await strapiToken(event, '/api/upload', { method: 'POST', body: form })
    const up = Array.isArray(result) ? result[0] : result
    return { url: up.url?.startsWith('http') ? up.url : `${publicBase}${up.url}` }
  } catch (err) {
    rethrowStrapi(err, 'Upload failed')
  }
})
