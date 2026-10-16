// server/api/field/login.post.js
//
// Field guide sign-in. Guides are Strapi users-permissions users with the
// "Field Guide" role, linked to their Guide entry (guide.user). The JWT is
// kept in an httpOnly cookie — the browser never sees it.

export default defineEventHandler(async (event) => {
  rateLimit(event, 'field-login', { max: 10, windowMs: 15 * 60_000 })

  const { identifier, password } = (await readBody(event)) || {}
  if (!identifier || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  let jwt
  try {
    const res = await $fetch(`${strapiServerBase(event)}/api/auth/local`, {
      method: 'POST',
      body: { identifier, password },
    })
    jwt = res.jwt
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // Confirm this user is actually a linked field guide before keeping the session
  let assigned
  try {
    assigned = await $fetch(`${strapiServerBase(event)}/api/live-expeditions/assigned`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
  } catch {
    throw createError({
      statusCode: 403,
      statusMessage: 'This account is not set up as a field guide. Ask the office to link it to your Guide profile.',
    })
  }

  setCookie(event, FIELD_COOKIE, jwt, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 days — guides may be offline for days
  })

  return { guide: assigned.meta?.guide || null }
})
