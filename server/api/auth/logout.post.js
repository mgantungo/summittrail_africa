// server/api/auth/logout.post.js
//
// Clears the customer session cookie set by login/register.

export default defineEventHandler((event) => {
  clearCustomerSession(event)
  return { ok: true }
})
