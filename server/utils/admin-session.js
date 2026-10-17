// server/utils/admin-session.js — auto-imported by Nitro.
//
// Back-office (summittrail.africa/admin) sessions. Admins are Strapi
// users-permissions users with the "Admin Portal" role (created on CMS boot
// in src/index.js). Their Strapi JWT lives in an httpOnly cookie; every
// admin request re-checks the user is still confirmed, not blocked and still
// has the role (cached for 60s per token, per process).

export const ADMIN_COOKIE = 'st_admin'
export const ADMIN_ROLE_TYPE = 'admin-portal'
const SESSION_S = 60 * 60 * 12 // 12 hours
const CACHE_MS = 60_000

const cache = globalThis.__stAdminCache ?? (globalThis.__stAdminCache = new Map())

// Looks up the Strapi user behind a JWT and returns the admin profile, or
// null if the token is invalid or the user isn't an active Admin Portal user.
export async function resolveAdmin(event, jwt) {
  if (!jwt) return null
  const hit = cache.get(jwt)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.admin

  let admin = null
  try {
    // 1) who is this token? (needs users/me on the role)
    const me = await $fetch(`${strapiServerBase(event)}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    // 2) their role, read with the server token (role isn't exposed on /me)
    const user = await strapiToken(event, `/api/users/${me.id}`, { query: { populate: 'role' } })
    if (user && !user.blocked && user.confirmed && user.role?.type === ADMIN_ROLE_TYPE) {
      admin = {
        id: `admin-${user.id}`,
        strapiUserId: user.id,
        name: user.username,
        email: user.email,
        role: 'admin',
        avatar: '',
        level: 'Administrator',
        summitPoints: 0,
        totalTrips: 0,
        upcomingTrips: 0,
      }
    }
  } catch {
    admin = null
  }
  cache.set(jwt, { at: Date.now(), admin })
  if (cache.size > 500) cache.delete(cache.keys().next().value)
  return admin
}

export function getAdmin(event) {
  return resolveAdmin(event, getCookie(event, ADMIN_COOKIE))
}

export async function requireAdmin(event) {
  const admin = await getAdmin(event)
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Admin sign-in required' })
  return admin
}

export function setAdminSession(event, jwt) {
  setCookie(event, ADMIN_COOKIE, jwt, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_S,
  })
}

export function clearAdminSession(event) {
  const jwt = getCookie(event, ADMIN_COOKIE)
  if (jwt) cache.delete(jwt)
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}
