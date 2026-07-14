<!--app/components/NotificationPrompt.vue-->
<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="notif-prompt">
      <div class="notif-prompt-img">
        <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80" alt="" />
      </div>
      <div class="notif-prompt-body">
        <div class="notif-prompt-icon">🔔</div>
        <div class="notif-prompt-title">Stay Ahead of Every Expedition</div>
        <div class="notif-prompt-text">
          Get notified the moment new adventures drop, spots open up, or a live expedition begins. Direct to your browser, even when the site is closed.
        </div>
        <div class="notif-prompt-actions">
          <button class="btn btn-primary btn-sm" :disabled="loading" @click="allow">
            {{ loading ? 'Connecting...' : '🔔 Allow Notifications' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="dismiss">Maybe Later</button>
        </div>
        <div v-if="error" class="notif-prompt-error">{{ error }}</div>
      </div>
      <button class="notif-prompt-close" @click="dismiss" aria-label="Close">✕</button>
    </div>
  </Transition>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { usePushNotifications } from '~/composables/usePushNotifications'

const profile = useProfileStore()
const { isSupported, permission, requestPermission } = usePushNotifications()

const loading = ref(false)
const error = ref(null)
const dismissed = ref(false)

// Show after 15s if: supported, permission not yet set, not dismissed
const showPrompt = computed(() =>
  isSupported.value &&
  permission.value === 'default' &&
  !dismissed.value &&
  !profile.notificationsEnabled
)

let timer = null

onMounted(() => {
  // Auto-show after delay (only once per session)
  timer = setTimeout(() => {
    if (showPrompt.value) dismissed.value = false
  }, 15000)
})

onUnmounted(() => clearTimeout(timer))

async function allow() {
  loading.value = true
  error.value = null
  try {
    const result = await requestPermission()
    if (!result.success && result.reason === 'denied') {
      error.value = 'Notifications blocked. Please enable them in your browser settings.'
    }
    dismissed.value = true
  } catch (e) {
    error.value = 'Something went wrong. Try again later.'
  } finally {
    loading.value = false
  }
}

function dismiss() {
  dismissed.value = true
  profile.setNotificationPermission('dismissed')
}
</script>

<style scoped>
.notif-prompt {
  position: fixed; bottom: 24px; left: 24px; z-index: 9000;
  display: flex; gap: 0; max-width: 420px; width: calc(100% - 48px);
  background: var(--charcoal); border: 1px solid var(--orange);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  overflow: hidden;
}

.notif-prompt-img {
  width: 90px; flex-shrink: 0;
}
.notif-prompt-img img {
  width: 100%; height: 100%; object-fit: cover;
}

.notif-prompt-body {
  padding: 20px 16px; flex: 1;
}

.notif-prompt-icon { font-size: 20px; margin-bottom: 8px; }

.notif-prompt-title {
  font-family: var(--font-condensed);
  font-size: 16px; font-weight: 700; color: var(--text);
  margin-bottom: 8px; line-height: 1.2;
}

.notif-prompt-text {
  font-size: 12px; font-weight: 300; color: var(--light);
  line-height: 1.6; margin-bottom: 14px;
}

.notif-prompt-actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.notif-prompt-error {
  font-size: 11px; color: var(--red); margin-top: 8px;
}

.notif-prompt-close {
  position: absolute; top: 10px; right: 10px;
  background: none; border: none; color: var(--gray);
  font-size: 14px; cursor: pointer; padding: 4px;
  transition: color 0.2s;
}
.notif-prompt-close:hover { color: var(--orange); }

/* Transition */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s ease, opacity 0.4s ease; }
.slide-up-enter-from { transform: translateY(40px); opacity: 0; }
.slide-up-leave-to { transform: translateY(40px); opacity: 0; }

@media (max-width: 480px) {
  .notif-prompt { bottom: 16px; left: 16px; width: calc(100% - 32px); max-width: 100%; }
  .notif-prompt-img { display: none; }
}
</style>
