// server/api/field/logout.post.js
export default defineEventHandler((event) => {
  deleteCookie(event, FIELD_COOKIE, { path: '/' })
  return { ok: true }
})
