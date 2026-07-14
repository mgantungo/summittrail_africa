// server/api/bookings/create.post.js
//
// Public-facing booking submission. Finds or creates a customer record,
// generates a human-readable reference, and creates the booking. No
// payment is processed here — status starts as 'pending-payment' and
// staff follow up per the confirmation message shown to the customer.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { customer, adventureId, departureDate, package: pkg, participants, addons, total, notes } = body || {}

  if (!customer?.name || !customer?.email || !adventureId || !departureDate) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, adventure, and departure date are required' })
  }

  const base = config.public.strapiUrl
  const authHeaders = { Authorization: `Bearer ${config.strapiApiToken}` }

  // Find or create the customer
  let customerId
  const existing = await $fetch(`${base}/api/customers`, {
    query: { 'filters[email][$eq]': customer.email },
    headers: authHeaders,
  })
  if (existing?.data?.length) {
    customerId = existing.data[0].documentId
  } else {
    const created = await $fetch(`${base}/api/customers`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          country: customer.country || '',
          level: 'Explorer',
          summitPoints: 0,
          totalTrips: 0,
          memberSince: new Date().toISOString().slice(0, 10),
          status: 'active',
        },
      },
    })
    customerId = created?.data?.documentId
  }

  const reference = `STL-${Math.floor(1000 + Math.random() * 9000)}`

  await $fetch(`${base}/api/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      data: {
        reference,
        customer: customerId,
        adventure: adventureId,
        departureDate,
        package: pkg || 'essential',
        participants: participants || 1,
        addons: addons || [],
        total: total || 0,
        paid: 0,
        status: 'pending-payment',
        paymentMethod: null,
        bookedAt: new Date().toISOString().slice(0, 10),
        checklistCompleted: 0,
        checklistTotal: 6,
        notes: notes || '',
      },
    },
  })

  // TODO: send confirmation email via Brevo/SMTP here using
  // config.smtpUser / config.smtpPass, and/or a notification record.

  return { success: true, reference }
})
