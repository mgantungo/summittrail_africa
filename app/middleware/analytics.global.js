// app/middleware/analytics.global.js
// Runs on every route navigation to track page views

import { useAnalyticsStore } from '~/stores/analytics'
import { useProfileStore } from '~/stores/profile'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only runs client-side
  if (!process.client) return

  const analytics = useAnalyticsStore()
  const profile = useProfileStore()

  // Track page view
  analytics.trackPageView(to.fullPath, to.meta?.title || document?.title || to.fullPath)

  // Save last visited page
  profile.setLastPage(to.fullPath)

  // Log as action if meaningful navigation (not same page)
  if (from.fullPath !== to.fullPath && to.fullPath !== '/') {
    const labels = {
      '/adventures': 'Browsed Adventures',
      '/stories': 'Visited Stories',
      '/tracking': 'Opened Live Tracking',
      '/dashboard': 'Opened Dashboard',
      '/calendar': 'Checked Calendar',
    }
    const label = labels[to.path]
    if (label) {
      profile.logAction({ type: 'navigation', label, route: to.fullPath })
    }
  }
})
