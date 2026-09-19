<!--app/components/shared/ShareMenu.vue-->
<template>
  <div class="share-menu" v-click-outside="close">
    <button
      class="share-toggle"
      :class="{ active: open, 'share-toggle--compact': compact }"
      @click="toggle"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-label="Share"
    >
      <span v-if="compact && !open" class="share-pulse-ring" aria-hidden="true" />
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
        <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      </svg>
      <span v-if="!compact">Share</span>
    </button>

    <Transition name="share-pop">
      <div v-if="open" class="share-panel" :class="{ 'share-panel--compact': compact }">
        <button class="share-item" @click.stop="copyLink">
          <span class="share-icon share-icon--link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
            </svg>
          </span>
          <span>{{ copied ? 'Link copied!' : 'Copy link' }}</span>
        </button>

        <a class="share-item" :href="whatsappUrl" target="_blank" rel="noopener noreferrer" @click.stop="close">
          <span class="share-icon" style="color:#25D366;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.15-.2.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.5-.65-.5-.17-.01-.36-.01-.56-.01a1.07 1.07 0 0 0-.78.36c-.27.29-1.02 1-1.02 2.45s1.05 2.84 1.2 3.04c.15.19 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.35.19 1.85.12.56-.08 1.7-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z"/>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.14.82.84-3.06-.19-.31a8.19 8.19 0 0 1-1.26-4.34c0-4.53 3.69-8.22 8.24-8.22 2.2 0 4.27.86 5.82 2.42a8.16 8.16 0 0 1 2.41 5.81c0 4.53-3.69 8.21-8.23 8.21z"/>
            </svg>
          </span>
          <span>WhatsApp</span>
        </a>

        <a class="share-item" :href="facebookUrl" target="_blank" rel="noopener noreferrer" @click.stop="close">
          <span class="share-icon" style="color:#1877F2;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/>
            </svg>
          </span>
          <span>Facebook</span>
        </a>

        <a class="share-item" :href="xUrl" target="_blank" rel="noopener noreferrer" @click.stop="close">
          <span class="share-icon" style="color:var(--text);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.24 2.5h3.34l-7.3 8.34 8.59 10.66h-6.73l-5.27-6.65-6.03 6.65H1.5l7.8-8.9L1.06 2.5h6.9l4.77 6.1L18.24 2.5zm-1.17 17h1.85L7.03 4.4H5.04l12.03 15.1z"/>
            </svg>
          </span>
          <span>X</span>
        </a>

        <a class="share-item" :href="emailUrl" @click.stop="close">
          <span class="share-icon" style="color:var(--gold);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 6-10 7L2 6" />
            </svg>
          </span>
          <span>Email</span>
        </a>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// Reusable share menu — pass the title/text to share. The URL defaults to
// the current page (via useRequestURL, works during SSR and on the
// client) unless a specific `url` prop is given.
const props = defineProps({
  title: { type: String, default: 'Summit Trail Limited' },
  text: { type: String, default: '' },
  url: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

const requestURL = useRequestURL()
const shareUrl = computed(() => props.url || requestURL.href)

const open = ref(false)
const copied = ref(false)

// A plain function (not inline `open = !open`) so it can stop the click
// from bubbling up to whatever this component is nested inside — matters
// when it's placed on a card that's itself wrapped in a link, so opening
// the share menu doesn't also trigger navigation.
function toggle(e) {
  e?.stopPropagation()
  e?.preventDefault()
  open.value = !open.value
}

function close() {
  open.value = false
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false; open.value = false }, 1400)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const shareMessage = computed(() => props.text ? `${props.title} — ${props.text}` : props.title)

const whatsappUrl = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(`${shareMessage.value} ${shareUrl.value}`)}`
)
const facebookUrl = computed(() =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
)
const xUrl = computed(() =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage.value)}&url=${encodeURIComponent(shareUrl.value)}`
)
const emailUrl = computed(() =>
  `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(`${shareMessage.value}\n\n${shareUrl.value}`)}`
)

// Minimal click-outside directive, local to this component — closes the
// panel when clicking anywhere outside it.
const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      if (!(el === e.target || el.contains(e.target))) binding.value(e)
    }
    document.addEventListener('click', el.__clickOutside__, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside__, true)
  },
}
</script>

<style scoped>
.share-menu { position: relative; display: inline-block; }

.share-toggle {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  background: none; border: 1px solid var(--border); color: var(--light);
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  padding: 10px 16px; cursor: pointer; transition: all 0.15s;
}
.share-toggle:hover, .share-toggle.active { border-color: var(--orange); color: var(--orange); }

.share-toggle--compact {
  padding: 8px; gap: 0;
  background: rgba(10,10,8,0.6); border-color: rgba(255,255,255,0.2); color: var(--white);
  border-radius: 50%;
}
.share-toggle--compact:hover, .share-toggle--compact.active {
  background: rgba(10,10,8,0.85); border-color: var(--orange); color: var(--orange);
}

/* Draws the eye to the compact icon-only button — reuses the site's
   existing @keyframes pulseRing (main.css), the same expanding-ring
   pattern already used elsewhere for urgency cues, rather than a new
   animation. Stops once the menu is opened (nothing left to draw
   attention to at that point). */
.share-pulse-ring {
  position: absolute; inset: -1px;
  border-radius: 50%;
  border: 2px solid var(--orange);
  animation: pulseRing 1.8s ease-out infinite;
  pointer-events: none;
}

.share-panel {
  position: absolute; top: calc(100% + 8px); left: 0; z-index: 50;
  background: var(--charcoal); border: 1px solid var(--border);
  min-width: 190px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.share-panel--compact { left: auto; right: 0; }
.share-item {
  display: flex; align-items: center; gap: 12px; width: 100%;
  background: none; border: none; color: var(--light); text-decoration: none;
  font-family: var(--font-condensed); font-size: 14px; font-weight: 600;
  padding: 10px 12px; cursor: pointer; transition: background 0.15s; text-align: left;
}
.share-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.share-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.share-icon--link { color: var(--orange); }

.share-pop-enter-active, .share-pop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.share-pop-enter-from, .share-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>