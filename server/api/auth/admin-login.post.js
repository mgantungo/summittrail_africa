// server/api/auth/admin-login.post.js
//
// Back-office sign-in for summittrail.africa/admin. Admins are Strapi
// users-permissions users with the "Admin Portal" role — add them in the
// CMS: Content Manager → User → Create new entry (confirmed = true,
// role = Admin Portal). The Strapi JWT is kept in an httpOnly cookie.

export default defineEventHandler(async (event) => {
  rateLimit(event, 'admin-login', { max: 5, windowMs: 10 * 60_000 })

  const { email, password } = (await readBody(event)) || {}
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  let jwt
  try {
    const res = await $fetch(`${strapiServerBase(event)}/api/auth/local`, {
      method: 'POST',
      body: { identifier: String(email).trim(), password: String(password) },
    })
    jwt = res?.jwt
  } catch {
    jwt = null
  }

  const admin = jwt ? await resolveAdmin(event, jwt) : null
  if (!admin) {
    await new Promise((r) => setTimeout(r, 400)) // slow down guessing a little
    // Same message whether the password is wrong or the account isn't an admin
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password, or this account has no admin access.' })
  }

  setAdminSession(event, jwt)
  return { user: admin }
})
