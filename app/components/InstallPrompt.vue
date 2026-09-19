<!--app/components/InstallPrompt.vue-->
<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="install-prompt">
      <button class="install-prompt-close" @click="dismiss" aria-label="Close">✕</button>

      <div class="install-prompt-icon">📲</div>

      <template v-if="canInstall">
        <div class="install-prompt-title">Install Summit Trail</div>
        <div class="install-prompt-text">
          Add the app to your home screen for quick access, offline browsing, and expedition alerts — no app store needed.
        </div>
        <div class="install-prompt-actions">
          <button class="btn btn-primary btn-sm" :disabled="installing" @click="install">
            {{ installing ? 'Installing…' : '📲 Install App' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="dismiss">Maybe Later</button>
        </div>
      </template>

      <template v-else-if="isIOS">
        <div class="install-prompt-title">Install Summit Trail</div>
        <div class="install-prompt-text">
          Tap <strong>Share</strong> <span class="ios-share-icon" aria-hidden="true">⎋</span> below, then
          <strong>"Add to Home Screen"</strong> — for quick access and expedition alerts, no app store needed.
        </div>
        <div class="install-prompt-actions">
          <button class="btn btn-ghost btn-sm" @click="dismiss">Got It</button>
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { usePwaInstall } from '~/composables/usePwaInstall'

const profile = useProfileStore()
const { canInstall, isInstalled, isIOS, promptInstall } = usePwaInstall()

const installing = ref(false)
const visible = ref(false)
const isMobile = ref(false)

let timer = null

onMounted(() => {
  // Mobile only — this is about adding a home-screen icon, which isn't
  // a meaningful action on desktop. Matches the same UA check style
  // already used in the analytics store's device detection.
  isMobile.value = /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent)

  // Give the beforeinstallprompt event (and iOS detection) a moment to
  // resolve, and don't interrupt the very first few seconds on the site.
  timer = setTimeout(() => { visible.value = true }, 15000)
})

onUnmounted(() => clearTimeout(timer))

const showPrompt = computed(() =>
  visible.value &&
  isMobile.value &&
  !isInstalled.value &&
  !profile.installPromptDismissed &&
  (canInstall.value || isIOS.value)
)

async function install() {
  installing.value = true
  try {
    const choice = await promptInstall()
    // Whatever the outcome — accepted, dismissed, or the browser's own
    // prompt simply closing — don't keep re-showing our banner this
    // session; if they wanted it, the OS-level prompt already ran.
    dismiss()
  } finally {
    installing.value = false
  }
}

function dismiss() {
  visible.value = false
  profile.dismissInstallPrompt()
}
</script>

<style scoped>
.install-prompt {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  max-width: 340px; width: calc(100% - 48px);
  background: var(--charcoal); border: 1px solid var(--orange);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  padding: 20px 18px; text-align: left;
}

.install-prompt-icon { font-size: 22px; margin-bottom: 8px; }

.install-prompt-title {
  font-family: var(--font-condensed);
  font-size: 16px; font-weight: 700; color: var(--text);
  margin-bottom: 8px; line-height: 1.2;
}

.install-prompt-text {
  font-size: 12px; font-weight: 300; color: var(--light);
  line-height: 1.6; margin-bottom: 14px;
}
.ios-share-icon { color: var(--orange); font-weight: 700; }

.install-prompt-actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.install-prompt-close {
  position: absolute; top: 10px; right: 10px;
  background: none; border: none; color: var(--gray);
  font-size: 14px; cursor: pointer; padding: 4px;
  transition: color 0.2s;
}
.install-prompt-close:hover { color: var(--orange); }

/* Same transition pattern as NotificationPrompt.vue */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s ease, opacity 0.4s ease; }
.slide-up-enter-from { transform: translateY(40px); opacity: 0; }
.slide-up-leave-to { transform: translateY(40px); opacity: 0; }

@media (max-width: 480px) {
  /* Anchored to the top here, not the bottom — NotificationPrompt.vue
     uses the same bottom-left position at this same breakpoint, and both
     could plausibly be eligible to show at once on a first mobile visit.
     Rather than guess a stacking offset based on the other banner's
     height, keeping this one at the top avoids the collision outright. */
  .install-prompt { top: 16px; bottom: auto; right: 16px; left: 16px; width: auto; max-width: 100%; }
}
</style>