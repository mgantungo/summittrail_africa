// server/api/analytics/stats.get.js
// Returns aggregated analytics for the admin dashboard

const events = globalThis.__analyticsEvents ?? []
const sessions = globalThis.__analyticsSessions ?? []
const nlSubscribers = globalThis.__nlSubscribers ?? []
const pushSubscribers = globalThis.__pushSubscribers ?? []

export default defineEventHandler(async (event) => {
  await requireAdmin(event) // back-office only (Admin Portal role)
  // Country breakdown from sessions
  const countryMap = {}
  sessions.forEach(s => {
    if (s.country) {
      countryMap[s.country] = (countryMap[s.country] || 0) + 1
    }
  })

  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, sessions: count }))

  // Device split
  const devices = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 }
  sessions.forEach(s => { devices[s.device || 'unknown']++ })

  // Page views
  const pageViews = events.filter(e => e.type === 'pageview')
  const now = Date.now()
  const todayViews = pageViews.filter(e => now - e.receivedAt < 86400000).length
  const weekViews = pageViews.filter(e => now - e.receivedAt < 604800000).length

  return {
    sessions: {
      total: sessions.length,
      today: sessions.filter(s => now - s.receivedAt < 86400000).length,
    },
    pageViews: {
      total: pageViews.length,
      today: todayViews,
      week: weekViews,
    },
    topCountries,
    devices,
    newsletter: { subscribers: nlSubscribers.length },
    pushNotifications: { subscribers: pushSubscribers.length },
    events: {
      total: events.length,
      bookingInitiates: events.filter(e => e.data?.category === 'booking').length,
    },
  }
})
