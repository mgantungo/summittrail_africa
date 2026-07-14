// server/api/cms/[...path].js
//
// Server-side proxy to the Strapi CMS for collections that are locked
// down (bookings, customers, payments, documents, notifications,
// summit-point-transactions, contact-messages, newsletter-subscribers).
// Keeps the Strapi API token out of the browser — the Nuxt server
// attaches it, the client just calls `/api/cms/<collection>` like any
// other Nitro endpoint.
//
// CMS URL is hardcoded below as a guaranteed fallback (same fix applied
// to app/composables/useStrapi.js) so this can never silently build a
// broken "undefined/api/..." URL the way it did before. It still prefers
// NUXT_PUBLIC_STRAPI_URL from your .env if that's set correctly.
//
// Requires in your Nuxt .env:
//   NUXT_PUBLIC_STRAPI_URL=https://cms.summittrail.visiongroup.co.ug
//   STRAPI_API_TOKEN=<a Strapi API token with the right permissions>

const DEFAULT_STRAPI_URL = 'https://cms.summittrail.visiongroup.co.ug'

let warnedNoUrl = false
let warnedNoToken = false

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = event.context.params.path // e.g. "bookings" or "bookings/abc123"
  const query = getQuery(event)
  const method = event.method

  const strapiUrl = config.public.strapiUrl || DEFAULT_STRAPI_URL
  if (!config.public.strapiUrl && !warnedNoUrl) {
    console.warn(
      '[server/api/cms] runtimeConfig.public.strapiUrl is not set — ' +
      'falling back to', DEFAULT_STRAPI_URL,
      '. Check NUXT_PUBLIC_STRAPI_URL in your .env and restart the dev server.'
    )
    warnedNoUrl = true
  }

  if (!config.strapiApiToken && !warnedNoToken) {
    console.warn(
      '[server/api/cms] STRAPI_API_TOKEN is not set — requests to protected ' +
      'collections (bookings, customers, payments, etc.) will fail with 401/403. ' +
      'Generate one in the Strapi admin under Settings → API Tokens and add it ' +
      'to your Nuxt .env as STRAPI_API_TOKEN.'
    )
    warnedNoToken = true
  }

  const url = `${strapiUrl}/api/${path}`

  const fetchOpts = {
    method,
    query,
    headers: {
      Authorization: `Bearer ${config.strapiApiToken || ''}`,
    },
  }

  if (method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = await readBody(event)
  }

  try {
    return await $fetch(url, fetchOpts)
  } catch (err) {
    console.error(`[server/api/cms] ${method} ${url} failed:`, err.response?.status, err.response?._data || err.message)
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?._data?.error?.message || 'CMS request failed',
    })
  }
})