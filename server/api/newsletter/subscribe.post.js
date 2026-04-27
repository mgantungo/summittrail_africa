// server/api/newsletter/subscribe.post.js
// Stores newsletter subscribers. 
// Replace the in-memory store with your CRM/Mailchimp/Brevo API in production.

const subscribers = globalThis.__nlSubscribers ?? (globalThis.__nlSubscribers = [])

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, name = '', interests = [], source = 'modal' } = body

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, message: 'Valid email required' })
  }

  // Prevent duplicates
  const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return { success: true, message: 'Already subscribed', duplicate: true }
  }

  const subscriber = {
    id: 'nl_' + Date.now(),
    email: email.toLowerCase(),
    name,
    interests,
    source,
    country: getHeader(event, 'cf-ipcountry') || null,
    subscribedAt: new Date().toISOString(),
    active: true,
  }

  subscribers.push(subscriber)

  // TODO: integrate with Brevo/Mailchimp API using config.smtpUser / config.smtpPass
  // Example for Brevo:
  // await $fetch('https://api.brevo.com/v3/contacts', {
  //   method: 'POST',
  //   headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, firstName: name, listIds: [1], updateEnabled: true })
  // })

  console.log(`[Newsletter] New subscriber: ${email} (${subscribers.length} total)`)

  return {
    success: true,
    message: 'Subscribed successfully',
    count: subscribers.length,
  }
})
