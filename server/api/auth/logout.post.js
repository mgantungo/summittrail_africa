// server/api/auth/logout.post.js
//
// Clears the customer session and the back-office admin session.

export default defineEventHandler((event) => {
  clearCustomerSession(event)
  clearAdminSession(event)
  return { ok: true }
})
