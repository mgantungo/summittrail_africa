// server/api/auth/admin-me.get.js
//
// The signed-in back-office admin, or 401. Used by layouts/admin.vue to
// gate every /admin page.

export default defineEventHandler(async (event) => {
  return { user: await requireAdmin(event) }
})
