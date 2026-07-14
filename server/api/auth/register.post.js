// server/api/auth/register.post.js
//
// Real password-based registration against the CMS `customer` collection.
// Uses Node's built-in scrypt (matching the hashing approach already used
// for the admin login), so no extra dependency is needed.

import { randomBytes, scryptSync } from 'node:crypto'

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { name, email, password } = body || {}

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email and password are required' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const base = config.public.strapiUrl
  const authHeaders = { Authorization: `Bearer ${config.strapiApiToken}` }

  // Reject duplicate emails
  const existing = await $fetch(`${base}/api/customers`, {
    query: { 'filters[email][$eq]': email },
    headers: authHeaders,
  })
  if (existing?.data?.length) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  const created = await $fetch(`${base}/api/customers`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        country: '',
        level: 'Explorer',
        summitPoints: 0,
        totalTrips: 0,
        memberSince: new Date().toISOString().slice(0, 10),
        status: 'active',
      },
    },
  })

  // Strip the hash before ever sending anything back to the browser
  const { passwordHash, ...safeCustomer } = created?.data || {}
  return { customer: safeCustomer }
})
