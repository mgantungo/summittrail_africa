// server/utils/customer-session.js — auto-imported by Nitro.
//
// Signed, httpOnly session cookie for customers (website accounts), set by
// /api/auth/login and /api/auth/register. Server routes that act on behalf
// of a customer (e.g. /api/live/*) read the customer's documentId from here
// and never trust an id sent by the browser.
//
// Signing key: NUXT_CUSTOMER_SESSION_SECRET if you add `customerSessionSecret`
// to runtimeConfig; otherwise derived from the server-only STRAPI_API_TOKEN
// (rotating that token signs everyone out, which is fine).

import { createHmac, timingSafeEqual } from 'node:crypto'

export const CUSTOMER_COOKIE = 'st_customer'
const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days

function sessionKey(event) {
  const cfg = useRuntimeConfig(event)
  const base = cfg.customerSessionSecret || cfg.strapiApiToken
  if (!base) throw createError({ statusCode: 500, statusMessage: 'Session signing is not configured' })
  return createHmac('sha256', String(base)).update('summit-trail/customer-session/v1').digest()
}

const b64url = (buf) => Buffer.from(buf).toString('base64url')

function sign(event, payload) {
  const body = b64url(JSON.stringify(payload))
  const mac = createHmac('sha256', sessionKey(event)).update(body).digest('base64url')
  return `${body}.${mac}`
}

function verify(event, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null
  const [body, mac] = token.split('.')
  const expected = createHmac('sha256', sessionKey(event)).update(body).digest('base64url')
  const a = Buffer.from(mac || '')
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!data?.d || !data?.exp || Date.now() > data.exp) return null
    return data
  } catch {
    return null
  }
}

// Call after a successful login/register with the CMS customer record
export function setCustomerSession(event, customer) {
  if (!customer?.documentId) return
  const exp = Date.now() + MAX_AGE_S * 1000
  setCookie(event, CUSTOMER_COOKIE, sign(event, { d: customer.documentId, exp }), {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_S,
  })
}

export function clearCustomerSession(event) {
  deleteCookie(event, CUSTOMER_COOKIE, { path: '/' })
}

// → { documentId } or throws 401
export function requireCustomer(event) {
  const s = verify(event, getCookie(event, CUSTOMER_COOKIE))
  if (!s) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in to continue' })
  }
  return { documentId: s.d }
}
