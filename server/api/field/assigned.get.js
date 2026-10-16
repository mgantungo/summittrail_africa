// server/api/field/assigned.get.js — the signed-in guide's upcoming/active expeditions
export default defineEventHandler(async (event) => {
  try {
    return await strapiAsGuide(event, '/api/live-expeditions/assigned')
  } catch (err) {
    if (err?.statusCode === 401) throw err
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      deleteCookie(event, FIELD_COOKIE, { path: '/' })
      throw createError({ statusCode: 401, statusMessage: 'Your session has expired — sign in again' })
    }
    rethrowStrapi(err, 'Could not load your expeditions')
  }
})
