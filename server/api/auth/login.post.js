// server/api/auth/login.post.js
//
// Verifies email + password against the CMS `customer` collection using
// Node's built-in scrypt (timing-safe compare). The passwordHash field is
// readable here (server-side, with the API token) but is always stripped
// before the response leaves this route.

import { scryptSync, timingSafeEqual } from 'node:crypto'

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const check = scryptSync(password, salt, 64)
  const original = Buffer.from(hash, 'hex')
  if (check.length !== original.length) return false
  return timingSafeEqual(check, original)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { email, password } = body || {}

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const base = config.public.strapiUrl
  const authHeaders = { Authorization: `Bearer ${config.strapiApiToken}` }

  // passwordHash is no longer marked `private` in the schema, so it comes
  // back on this server-side, token-authenticated request.
  const result = await $fetch(`${base}/api/customers`, {
    query: { 'filters[email][$eq]': email },
    headers: authHeaders,
  })

  const customer = result?.data?.[0]
  if (!customer || !verifyPassword(password, customer.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const { passwordHash, ...safeCustomer } = customer
  // Server-side session (httpOnly) for routes that act as this customer
  setCustomerSession(event, safeCustomer)
  return { customer: safeCustomer }
})
