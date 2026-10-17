// app/plugins/session-sync.client.js
//
// Customer logins now have a server-side session cookie. A browser that
// still has a saved login from before (localStorage only) is signed out
// quietly, so the dashboard asks them to sign in again instead of showing
// empty data. Admin sessions are checked by layouts/admin.vue.
import { useProfileStore } from '~/stores/profile'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', async () => {
    const profile = useProfileStore()
    if (!profile.user || profile.isAdmin) return
    try {
      await $fetch('/api/auth/me')
    } catch (e) {
      if ((e?.response?.status || e?.statusCode) === 401) profile.logout()
    }
  })
})
