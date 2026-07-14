// server/api/newsletter/subscribe.post.js
//
// Writes newsletter subscribers into the CMS `newsletter-subscriber`
// collection (visible in the Strapi admin, and counted in
// AdminAnalytics) instead of an in-memory array that reset on every
// server restart.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { email, name = '', interests = [], source = 'modal' } = body || {}

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email required' })
  }

  const base = config.public.strapiUrl

  // Prevent duplicates
  const existing = await $fetch(`${base}/api/newsletter-subscribers`, {
    query: { 'filters[email][$eq]': email },
  })
  if (existing?.data?.length) {
    return { success: true, message: 'Already subscribed', duplicate: true }
  }

  await $fetch(`${base}/api/newsletter-subscribers`, {
    method: 'POST',
    body: {
      data: {
        email: email.toLowerCase(),
        name,
        source,
        status: 'subscribed',
        subscribedAt: new Date().toISOString(),
      },
    },
  })

  // TODO: also push to Brevo using config.smtpUser / config.smtpPass, e.g.:
  // await $fetch('https://api.brevo.com/v3/contacts', {
  //   method: 'POST',
  //   headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, firstName: name, listIds: [1], updateEnabled: true })
  // })

  return { success: true, message: 'Subscribed successfully' }
})
