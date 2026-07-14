// app/stores/analytics.js
import { defineStore } from 'pinia'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    sessionId: null,
    visitorCountry: null,
    visitorCity: null,
    visitorIp: null,
    pageViews: [],
    events: [],
    newsletterSubscribers: [],
    pushSubscribers: [],
  }),

  actions: {
    async initSession() {
      if (!process.client) return
      this.sessionId = this._generateId()

      // Geo lookup — routed through our own server (see
      // server/api/analytics/geo.get.js) instead of calling
      // http://ip-api.com directly from the browser. Calling that
      // insecure endpoint straight from an HTTPS page gets blocked by
      // browsers as mixed content; a server-to-server call has no such
      // restriction, and the client only ever talks to our own HTTPS origin.
      try {
        const geo = await $fetch('/api/analytics/geo')
        if (geo.status !== 'fail') {
          this.visitorCountry = geo.country
          this.visitorCity = geo.city
          this.visitorIp = geo.query
        }
      } catch { /* non-blocking */ }

      this._reportSession()
    },

    trackPageView(route, title) {
      const view = {
        route,
        title,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        country: this.visitorCountry,
        city: this.visitorCity,
        device: this._getDevice(),
        referrer: process.client ? document.referrer : '',
      }
      this.pageViews.push(view)
      this._reportEvent('pageview', view)
    },

    trackEvent(category, action, label = null, value = null) {
      const event = {
        category, action, label, value,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        country: this.visitorCountry,
      }
      this.events.push(event)
      this._reportEvent('event', event)
    },

    async _reportEvent(type, data) {
      try {
        await $fetch('/api/analytics/track', {
          method: 'POST',
          body: { type, data }
        })
      } catch { /* non-blocking */ }
    },

    async _reportSession() {
      try {
        await $fetch('/api/analytics/session', {
          method: 'POST',
          body: {
            sessionId: this.sessionId,
            country: this.visitorCountry,
            city: this.visitorCity,
            device: this._getDevice(),
            userAgent: process.client ? navigator.userAgent : '',
            timestamp: Date.now(),
          }
        })
      } catch { /* non-blocking */ }
    },

    _getDevice() {
      if (!process.client) return 'unknown'
      const ua = navigator.userAgent
      if (/mobile/i.test(ua)) return 'mobile'
      if (/tablet|ipad/i.test(ua)) return 'tablet'
      return 'desktop'
    },

    _generateId() {
      return 'sess_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now()
    },
  },
})