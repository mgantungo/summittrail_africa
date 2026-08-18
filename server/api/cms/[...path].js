// server/api/cms/[...path].js
//
// Server-side proxy to the Strapi CMS for collections that are locked
// down (bookings, customers, payments, documents, notifications,
// summit-point-transactions). Keeps the Strapi API token out of the
// browser — the Nuxt server attaches it, the client just calls
// `/api/cms/<collection>` like any other Nitro endpoint.
//
// Requires in your Nuxt .env:
   //NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
   //NUXT_PUBLIC_STRAPI_URL="https://cms.summittrail.visiongroup.co.ug";
//   STRAPI_API_TOKEN=<a Strapi API token with the right permissions>

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = event.context.params.path // e.g. "bookings" or "bookings/abc123"
  const query = getQuery(event)
  const method = event.method

  const url = `${config.public.strapiUrl}/api/${path}`

  const fetchOpts = {
    method,
    query,
    headers: {
      Authorization: `Bearer ${config.strapiApiToken}`,
    },
  }

  if (method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = await readBody(event)
  }

  try {
    return await $fetch(url, fetchOpts)
  } catch (err) {
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?._data?.error?.message || 'CMS request failed',
    })
  }
})
