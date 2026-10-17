// server/api/auth/admin-login.post.js
//
// Verifies the admin email + password on the server (server-only
// runtimeConfig.adminPassword — never sent to the browser). Rate-limited
// per IP; constant-time comparison.

import { createHash, timingSafeEqual } from 'node:crypto'

// Hash first so both buffers are the same length for timingSafeEqual
const digest = (v) => createHash('sha256').update(String(v ?? '')).digest()
const same = (a, b) => timingSafeEqual(digest(a), digest(b))

export default defineEventHandler(async (event) => {
  rateLimit(event, 'admin-login', { max: 5, windowMs: 10 * 60_000 })

  const cfg = useRuntimeConfig(event)
  const { email, password } = (await readBody(event)) || {}
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const adminEmail = String(cfg.public.adminEmail || '').trim().toLowerCase()
  const adminPassword = String(cfg.adminPassword || '')
  if (!adminEmail || !adminPassword) {
    throw createError({ statusCode: 503, statusMessage: 'Admin sign-in is not configured' })
  }

  const ok = same(String(email).trim().toLowerCase(), adminEmail) & same(password, adminPassword)
  if (!ok) {
    await new Promise((r) => setTimeout(r, 400)) // slow down guessing a little
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password. Check your credentials and try again.' })
  }

  return {
    user: {
      id: 'admin-001',
      name: 'Admin',
      email: adminEmail,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      level: 'Administrator',
      summitPoints: 0,
      totalTrips: 0,
      upcomingTrips: 0,
    },
  }
})
