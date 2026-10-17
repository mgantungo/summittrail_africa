// server/api/live/eligible.get.js
//
// Active expeditions the signed-in customer can post live updates to
// (a confirmed booking on an expedition that has started). 401 when the
// customer session cookie is missing/expired → the page asks them to sign in.

export default defineEventHandler(async (event) => {
  const customer = requireCustomer(event)
  try {
    const res = await strapiToken(event, '/api/live-expeditions/participant-expeditions', {
      query: { customer: customer.documentId },
    })
    return { data: res?.data || [] }
  } catch (err) {
    rethrowStrapi(err, 'Could not load your expeditions')
  }
})
