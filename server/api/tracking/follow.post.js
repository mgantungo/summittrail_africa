// server/api/tracking/follow.post.js
//
// Follow a live expedition — stored in the CMS `expedition-follow`
// collection; live-expedition.followers is the cached count.
// Body: { expedition: <documentId>, subscription?: PushSubscriptionJSON, email?: string }

export default defineEventHandler(async (event) => {
  rateLimit(event, 'follow', { max: 30, windowMs: 60 * 60_000 })

  const { expedition, subscription, email } = (await readBody(event)) || {}
  if (!expedition || typeof expedition !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'expedition is required' })
  }
  if (!subscription?.endpoint && !email) {
    throw createError({ statusCode: 400, statusMessage: 'Allow notifications or enter an email to follow' })
  }

  let data
  try {
    const res = await strapiToken(event, '/api/live-expeditions/follow', {
      method: 'POST',
      body: {
        expedition,
        ...(subscription?.endpoint
          ? { subscription: { endpoint: subscription.endpoint, keys: subscription.keys || {} } }
          : { email }),
      },
    })
    data = res.data
  } catch (err) {
    rethrowStrapi(err, 'Could not follow this expedition')
  }

  // New email follower → confirmation from Summit Trail's mailbox
  // (not awaited: the follow has already succeeded)
  if (!subscription?.endpoint && email && data?.created) {
    const appUrl = (useRuntimeConfig(event).public.appUrl || '').replace(/\/$/, '')
    const job = summitTrailEmail.sendFollowConfirmation(String(email).trim().toLowerCase(), {
      adventureTitle: data.adventureTitle,
      link: `${appUrl}/tracking?expedition=${encodeURIComponent(expedition)}`,
    }).catch(() => {})
    if (typeof event.waitUntil === 'function') event.waitUntil(job)
  }

  return { following: data.following, followers: data.followers }
})
