// server/utils/notify-followers.js — auto-imported by Nitro.
//
// Sends a field update to everyone following an expedition (rows in the
// CMS expedition-follow collection): Web Push for push followers, email
// through Summit Trail's own mailbox (server/utils/summit-trail-email.js)
// for email followers. Expired push subscriptions are
// unfollowed. Each channel is skipped if it isn't configured.

import webpush from 'web-push'
import { summitTrailEmail } from './summit-trail-email'

export async function notifyFollowers(event, expedition, summary) {
  const cfg = useRuntimeConfig(event)

  const follows = []
  for (let page = 1; page <= 20; page++) {
    const res = await strapiToken(event, '/api/expedition-follows', {
      query: {
        'filters[expedition][documentId][$eq]': expedition,
        'fields[0]': 'channel', 'fields[1]': 'email', 'fields[2]': 'pushSubscription',
        'pagination[page]': page, 'pagination[pageSize]': 100,
      },
    })
    follows.push(...(res.data || []))
    if (page >= (res.meta?.pagination?.pageCount || 1)) break
  }
  if (!follows.length) return { sent: 0 }

  const title = summary.advancedTo
    ? `${summary.adventureTitle}: reached ${summary.advancedTo}`
    : `${summary.adventureTitle}: new field update`
  const text = summary.text || (summary.advancedTo ? `The team has reached ${summary.advancedTo}.` : 'New update from the field.')
  const appUrl = (cfg.public.appUrl || '').replace(/\/$/, '')
  const link = `${appUrl}/tracking?expedition=${encodeURIComponent(expedition)}`

  let sent = 0

  // ── Push ────────────────────────────────────────────────────────────────
  const pushFollows = follows.filter((f) => f.channel === 'push' && f.pushSubscription?.endpoint)
  if (pushFollows.length && !(cfg.vapidPrivateKey && cfg.public.vapidPublicKey)) {
    console.warn('[notify] push followers skipped: VAPID keys not configured')
  }
  if (pushFollows.length && cfg.vapidPrivateKey && cfg.public.vapidPublicKey) {
    webpush.setVapidDetails(`mailto:${cfg.public.adminEmail || 'admin@summittrail.ug'}`, cfg.public.vapidPublicKey, cfg.vapidPrivateKey)
    const payload = JSON.stringify({
      title,
      body: text.slice(0, 180),
      image: summary.image || null,
      url: `/tracking?expedition=${encodeURIComponent(expedition)}`,
      tag: `exp-${expedition}`,
    })
    for (let i = 0; i < pushFollows.length; i += 10) {
      await Promise.all(pushFollows.slice(i, i + 10).map(async (f) => {
        try {
          await webpush.sendNotification(f.pushSubscription, payload)
          sent++
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription expired — stop following
            await strapiToken(event, '/api/live-expeditions/unfollow', {
              method: 'POST', body: { expedition, endpoint: f.pushSubscription.endpoint },
            }).catch(() => {})
          } else {
            console.warn('[notify] push failed:', err.statusCode || '', err.body || err.message)
          }
        }
      }))
    }
  }

  // ── Email (Summit Trail SMTP) ────────────────────────────────────────────
  const emailFollows = follows.filter((f) => f.channel === 'email' && f.email)
  if (emailFollows.length && !summitTrailEmail.configured) {
    console.warn('[notify] email followers skipped: SUMMIT_SMTP_PASS not set')
  } else {
    for (const f of emailFollows) {
      try {
        const r = await summitTrailEmail.sendExpeditionUpdate(f.email, {
          adventureTitle: summary.adventureTitle,
          advancedTo: summary.advancedTo,
          text: summary.text,
          image: summary.image,
          link,
        })
        if (r.success) sent++
      } catch {
        // already logged by the email service; carry on with the rest
      }
    }
  }

  return { sent }
}
