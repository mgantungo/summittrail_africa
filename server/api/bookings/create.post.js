// server/api/bookings/create.post.js
//
// Public-facing booking submission. Finds or creates a customer record,
// generates a human-readable reference, and creates the booking. No
// payment is processed here — status starts as 'pending-payment' and
// staff follow up per the confirmation message shown to the customer.
//
// Uses the internal CMS URL server-side (hairpin NAT) and reports which
// CMS step failed and why, instead of a bare 500.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { customer, adventureId, departureDate, package: pkg, participants, addons, total, notes } = body || {}

  if (!customer?.name || !customer?.email || !adventureId || !departureDate) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, adventure, and departure date are required' })
  }

  const base = config.strapiUrlInternal || config.public.strapiUrl
  const authHeaders = { Authorization: `Bearer ${config.strapiApiToken}` }

  // Runs one CMS call; on failure logs the real Strapi error and returns a
  // clear message to the browser.
  async function cms(step, path, opts = {}) {
    try {
      return await $fetch(`${base}${path}`, { ...opts, headers: authHeaders })
    } catch (err) {
      const status = err?.response?.status
      const detail = err?.response?._data?.error
      console.error(`[bookings/create] ${step} failed:`, status || 'no response', detail?.message || err?.message, detail?.details ? JSON.stringify(detail.details) : '')
      if (!status) {
        throw createError({ statusCode: 502, statusMessage: `Booking failed: cannot reach the CMS (${step})` })
      }
      if (status === 401 || status === 403) {
        throw createError({ statusCode: 500, statusMessage: `Booking failed: CMS refused the server token (${step})` })
      }
      throw createError({ statusCode: status >= 500 ? 502 : 400, statusMessage: `Booking failed (${step}): ${detail?.message || 'CMS error'}` })
    }
  }

  // Find or create the customer
  const email = String(customer.email).trim().toLowerCase()
  let customerId
  const existing = await cms('find customer', '/api/customers', {
    query: { 'filters[email][$eqi]': email },
  })
  if (existing?.data?.length) {
    customerId = existing.data[0].documentId
  } else {
    const created = await cms('create customer', '/api/customers', {
      method: 'POST',
      body: {
        data: {
          name: customer.name,
          email,
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

  const reference = `STL-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10 + Math.random() * 90)}`

  await cms('create booking', '/api/bookings', {
    method: 'POST',
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

  return { success: true, reference }
})