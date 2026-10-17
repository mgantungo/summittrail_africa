// server/api/auth/me.get.js
//
// 200 when the customer session cookie is valid, else 401. The app uses it
// to sign out browsers whose saved login has no server session behind it.

export default defineEventHandler((event) => {
  const { documentId } = requireCustomer(event)
  return { documentId }
})
