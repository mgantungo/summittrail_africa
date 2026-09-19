// app/stores/profile.js
import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    user: null,
    theme: 'dark',      // 'dark' | 'light' | 'auto'
    lastPage: '/',
    recentActions: [],   // [{ type, label, route, timestamp }]
    recentlyViewed: [],  // adventure slugs
    notificationsEnabled: false,
    notificationPermission: 'default', // 'default' | 'granted' | 'denied'
    pushSubscription: null,
    newsletterDismissed: false,
    newsletterSubscribed: false,
    installPromptDismissed: false,
    cookiesAccepted: false,
    preferences: {
      categories: [],
      difficulty: 'any',
      groupType: 'any',
    },
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin:    (state) => state.user?.role === 'admin',
    displayName: (state) => state.user?.name || 'Guest',
    summitPoints: (state) => state.user?.summitPoints || 0,
    level: (state) => state.user?.level || 'Trail Starter',
    topActions: (state) => state.recentActions.slice(0, 5),
  },

  actions: {
    // ── Theme ──────────────────────────────────────
    setTheme(theme) {
      this.theme = theme
      this._applyTheme(theme)
      this._save()
    },

    _applyTheme(theme) {
      if (!process.client) return
      const resolved = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      document.documentElement.setAttribute('data-theme', resolved)
    },

    // ── Navigation tracking ─────────────────────────
    setLastPage(route) {
      this.lastPage = route
      this._save()
    },

    logAction(action) {
      // action: { type, label, route }
      const entry = { ...action, timestamp: Date.now() }
      this.recentActions.unshift(entry)
      if (this.recentActions.length > 20) this.recentActions.pop()
      this._save()
    },

    addRecentlyViewed(slug) {
      this.recentlyViewed = [slug, ...this.recentlyViewed.filter(s => s !== slug)].slice(0, 8)
      this._save()
    },

    // ── Auth ────────────────────────────────────────
    login(userData) {
      this.user = userData
      this.logAction({ type: 'auth', label: 'Signed in', route: '/dashboard' })
      this._save()
    },

    logout() {
      this.user = null
      this.logAction({ type: 'auth', label: 'Signed out', route: '/' })
      this._save()
    },

    // ── Preferences ─────────────────────────────────
    updatePreferences(prefs) {
      this.preferences = { ...this.preferences, ...prefs }
      this._save()
    },

    // ── Notifications ───────────────────────────────
    setNotificationPermission(permission) {
      this.notificationPermission = permission
      this.notificationsEnabled = permission === 'granted'
      this._save()
    },

    setPushSubscription(sub) {
      this.pushSubscription = sub
      this._save()
    },

    // ── Newsletter ──────────────────────────────────
    setNewsletterSubscribed(val) {
      this.newsletterSubscribed = val
      this._save()
    },

    setNewsletterDismissed() {
      this.newsletterDismissed = true
      this._save()
    },

    // ── PWA install prompt ──────────────────────────
    dismissInstallPrompt() {
      this.installPromptDismissed = true
      this._save()
    },

    // ── Cookies ─────────────────────────────────────
    acceptCookies() {
      this.cookiesAccepted = true
      this._save()
    },

    // ── Persistence ─────────────────────────────────
    _save() {
      if (!process.client) return
      try {
        localStorage.setItem('stl_profile', JSON.stringify({
          user: this.user,
          theme: this.theme,
          lastPage: this.lastPage,
          recentActions: this.recentActions,
          recentlyViewed: this.recentlyViewed,
          notificationsEnabled: this.notificationsEnabled,
          notificationPermission: this.notificationPermission,
          pushSubscription: this.pushSubscription,
          newsletterDismissed: this.newsletterDismissed,
          newsletterSubscribed: this.newsletterSubscribed,
          installPromptDismissed: this.installPromptDismissed,
          cookiesAccepted: this.cookiesAccepted,
          preferences: this.preferences,
        }))
      } catch (e) { console.warn('Profile save failed:', e) }
    },

    hydrate() {
      if (!process.client) return
      try {
        const raw = localStorage.getItem('stl_profile')
        if (!raw) return
        const data = JSON.parse(raw)
        Object.assign(this, data)
        this._applyTheme(this.theme)
      } catch (e) { console.warn('Profile hydration failed:', e) }
    },
  },
})