// app/composables/usePushNotifications.js
import { useProfileStore } from '~/stores/profile'

export function usePushNotifications() {
  const config = useRuntimeConfig()
  const profile = useProfileStore()

  const isSupported = computed(() => {
    if (!process.client) return false
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  })

  const permission = computed(() => profile.notificationPermission)
  const isEnabled = computed(() => profile.notificationsEnabled)

  /**
   * Ask the user for permission, subscribe, and send subscription to server
   */
  async function requestPermission() {
    if (!isSupported.value) return { success: false, reason: 'unsupported' }

    try {
      const result = await Notification.requestPermission()
      profile.setNotificationPermission(result)

      if (result === 'granted') {
        await _subscribe()
        return { success: true }
      }
      return { success: false, reason: result }
    } catch (err) {
      console.error('Push permission error:', err)
      return { success: false, reason: 'error' }
    }
  }

  /**
   * Subscribe to push via service worker
   */
  async function _subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = config.public.vapidPublicKey

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(vapidKey),
      })

      profile.setPushSubscription(JSON.stringify(subscription))

      // Send subscription to server
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: { subscription: subscription.toJSON() }
      })

      return subscription
    } catch (err) {
      console.error('Push subscribe error:', err)
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await $fetch('/api/push/unsubscribe', {
          method: 'POST',
          body: { endpoint: sub.endpoint }
        })
      }
      profile.setNotificationPermission('default')
      profile.setPushSubscription(null)
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  /**
   * Send a test notification (admin use)
   */
  async function sendTest(payload) {
    await $fetch('/api/push/send', {
      method: 'POST',
      body: payload
    })
  }

  function _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
  }

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    unsubscribe,
    sendTest,
  }
}
