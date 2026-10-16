// server/utils/strapi.js — auto-imported by Nitro in every server route.
//
// Server-side Strapi access for the live-tracking routes. Uses the internal
// URL (hairpin NAT) when set, and keeps the API token and guide JWTs off
// the browser.

export const FIELD_COOKIE = 'st_field'

export function strapiServerBase(event) {
  const cfg = useRuntimeConfig(event)
  return cfg.strapiUrlInternal || cfg.public.strapiUrl
}

// Calls Strapi with the server API token
export function strapiToken(event, path, opts = {}) {
  const cfg = useRuntimeConfig(event)
  return $fetch(`${strapiServerBase(event)}${path}`, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${cfg.strapiApiToken}` },
  })
}

// Calls Strapi as the signed-in field guide (JWT from the httpOnly cookie)
export function strapiAsGuide(event, path, opts = {}) {
  const jwt = getCookie(event, FIELD_COOKIE)
  if (!jwt) throw createError({ statusCode: 401, statusMessage: 'Sign in to post field updates' })
  return $fetch(`${strapiServerBase(event)}${path}`, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${jwt}` },
  })
}

// Re-throws a Strapi $fetch error with its status and message
export function rethrowStrapi(err, fallback = 'CMS request failed') {
  const status = err?.response?.status || err?.statusCode || 500
  if (status === 401 || status === 403) {
    throw createError({ statusCode: status, statusMessage: err?.response?._data?.error?.message || 'Not allowed' })
  }
  throw createError({ statusCode: status, statusMessage: err?.response?._data?.error?.message || fallback })
}

// Very small in-memory rate limiter (per process) for public endpoints
const buckets = globalThis.__stRate ?? (globalThis.__stRate = new Map())
export function rateLimit(event, key, { max, windowMs }) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const id = `${key}:${ip}`
  const now = Date.now()
  const b = buckets.get(id)
  if (!b || now - b.start > windowMs) {
    buckets.set(id, { start: now, count: 1 })
    return
  }
  b.count++
  if (b.count > max) throw createError({ statusCode: 429, statusMessage: 'Too many requests — try again later' })
}
