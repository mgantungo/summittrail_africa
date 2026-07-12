<!--app/components/CookieBanner.vue-->
<template>
  <Transition name="slide-up">
    <div v-if="!profile.cookiesAccepted" class="cookie-banner">
      <div class="cookie-content">
        <span class="cookie-icon">🍪</span>
        <p class="cookie-text">
          We use cookies to improve your experience, track site analytics, and remember your preferences.
          <NuxtLink to="/privacy" class="cookie-link">Privacy Policy</NuxtLink>
        </p>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-ghost btn-sm" @click="decline">Decline</button>
        <button class="btn btn-primary btn-sm" @click="accept">Accept All</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { useAnalyticsStore } from '~/stores/analytics'

const profile = useProfileStore()
const analytics = useAnalyticsStore()

function accept() {
  profile.acceptCookies()
  analytics.trackEvent('cookies', 'accepted')
}

function decline() {
  profile.acceptCookies() // still dismiss banner
  analytics.trackEvent('cookies', 'declined')
}
</script>

<style scoped>
.cookie-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 7500;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  padding: 16px 40px;
  background: var(--deep); border-top: 1px solid var(--border);
  backdrop-filter: blur(12px);
  flex-wrap: wrap;
}
.cookie-content { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
.cookie-icon { font-size: 20px; flex-shrink: 0; }
.cookie-text { font-size: 13px; color: var(--light); line-height: 1.6; }
.cookie-link { color: var(--orange); text-decoration: underline; }
.cookie-actions { display: flex; gap: 10px; flex-shrink: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
@media (max-width: 600px) {
  .cookie-banner { padding: 16px 20px; }
  .cookie-actions { width: 100%; }
  .cookie-actions .btn { flex: 1; }
}
</style>
