// public/sw-register.js
// Registers the service worker on page load

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[SW] Registered:', reg.scope)
        // Check for updates
        reg.update()
      })
      .catch(err => console.warn('[SW] Registration failed:', err))
  })
}
