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

      // Geo lookup
      try {
        const res = await fetch('http://ip-api.com/json?fields=country,city,regionName,countryCode,query')
        const geo = await res.json()
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
