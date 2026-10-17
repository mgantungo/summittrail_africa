// server/api/cms/[...path].js
//
// Server-side proxy to the Strapi CMS for collections that are locked
// down (bookings, customers, payments, documents, notifications,
// summit-point-transactions). Keeps the Strapi API token out of the
// browser — the Nuxt server attaches it, the client just calls
// `/api/cms/<collection>` like any other Nitro endpoint.
//
// Access:
//   • Back-office admin (st_admin cookie, Admin Portal role) — full access.
//   • Signed-in customer (st_customer cookie) — only their own records:
//       GET  bookings | documents | notifications | summit-point-transactions | reviews
//            (the customer filter is forced to the session's customer)
//       PUT  customers/<their documentId>  (name, email, phone, country only)
//       POST reviews                       (customer forced to themselves)
//   • Anyone else — 401.
// passwordHash is stripped from every response.
//
// Requires in your Nuxt .env:
//   NUXT_PUBLIC_STRAPI_URL=https://cms.summittrail.visiongroup.co.ug
//   STRAPI_API_TOKEN=<a Strapi API token with the right permissions>

const CUSTOMER_READ = ['bookings', 'documents', 'notifications', 'summit-point-transactions', 'reviews']
const PROFILE_FIELDS = ['name', 'email', 'phone', 'country']

function stripSecrets(value) {
  if (Array.isArray(value)) return value.map(stripSecrets)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) if (k !== 'passwordHash') out[k] = stripSecrets(v)
    return out
  }
  return value
}

function forbidden() {
  throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
}

// Narrows a customer's request to their own data, or refuses it
async function scopeForCustomer(event, segments, method, query, customerId) {
  const [collection, id, ...rest] = segments
  if (rest.length) forbidden()

  if (method === 'GET' && !id && CUSTOMER_READ.includes(collection)) {
    for (const k of Object.keys(query)) if (k.startsWith('filters[customer]')) delete query[k]
    query['filters[customer][documentId][$eq]'] = customerId
    return undefined
  }

  if (method === 'PUT' && collection === 'customers' && id === customerId) {
    const data = (await readBody(event))?.data || {}
    const safe = {}
    for (const f of PROFILE_FIELDS) if (data[f] !== undefined) safe[f] = data[f]
    return { data: safe }
  }

  if (method === 'POST' && collection === 'reviews' && !id) {
    const data = (await readBody(event))?.data || {}
    return { data: { ...data, customer: customerId } }
  }

  forbidden()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = String(event.context.params.path || '') // e.g. "bookings" or "bookings/abc123"
  const segments = path.split('/').filter(Boolean)
  const query = { ...getQuery(event) }
  const method = event.method

  if (!segments.length || segments.some((s) => s === '..' || s === '.')) forbidden()

  let body
  const admin = await getAdmin(event)
  if (admin) {
    if (method !== 'GET' && method !== 'HEAD') body = await readBody(event)
  } else {
    const { documentId } = requireCustomer(event) // 401 when not signed in
    body = await scopeForCustomer(event, segments, method, query, documentId)
  }

  const fetchOpts = {
    method,
    query,
    headers: { Authorization: `Bearer ${config.strapiApiToken}` },
  }
  if (body !== undefined) fetchOpts.body = body

  try {
    return stripSecrets(await $fetch(`${strapiServerBase(event)}/api/${segments.join('/')}`, fetchOpts))
  } catch (err) {
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?._data?.error?.message || 'CMS request failed',
    })
  }
})
