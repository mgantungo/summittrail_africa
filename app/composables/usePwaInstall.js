// app/composables/usePwaInstall.js
//
// Wraps the real platform split for "install this as an app":
//   - Android/Chrome/Edge (Chromium-based) fire `beforeinstallprompt`,
//     which we intercept and hold onto, then trigger later from our own
//     UI via `promptInstall()`.
//   - iOS Safari never fires that event at all — Apple has no
//     programmatic install API. The only path there is the user manually
//     tapping Share → "Add to Home Screen". `isIOS` lets the UI show
//     instructions instead of a button that would do nothing.
//   - `isInstalled` covers both platforms' "already running as an
//     installed app" signal, so nothing prompts a user who's already
//     installed it.
export function usePwaInstall() {
  const deferredPrompt = ref(null)
  const canInstall = ref(false)
  const isInstalled = ref(false)
  const isIOS = ref(false)

  function checkStandalone() {
    if (!process.client) return false
    const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches
    const iosStandalone = window.navigator.standalone === true // iOS Safari-specific flag
    return !!(displayModeStandalone || iosStandalone)
  }

  let onBeforeInstall, onInstalled

  onMounted(() => {
    if (!process.client) return

    isInstalled.value = checkStandalone()
    isIOS.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

    onBeforeInstall = (e) => {
      e.preventDefault() // suppress the browser's own mini-infobar — we show our own UI instead
      deferredPrompt.value = e
      canInstall.value = true
    }
    onInstalled = () => {
      isInstalled.value = true
      canInstall.value = false
      deferredPrompt.value = null
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
  })

  onUnmounted(() => {
    if (!process.client) return
    window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    window.removeEventListener('appinstalled', onInstalled)
  })

  async function promptInstall() {
    if (!deferredPrompt.value) return { outcome: 'unavailable' }
    deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice // { outcome: 'accepted' | 'dismissed' }
    deferredPrompt.value = null
    canInstall.value = false
    return choice
  }

  return { canInstall, isInstalled, isIOS, promptInstall }
}