<template>
  <Transition name="fade-modal">
    <div v-if="showModal" class="newsletter-backdrop" @click.self="close">
      <div class="newsletter-modal">
        <button class="newsletter-close" @click="close">✕</button>

        <div class="newsletter-visual">
          <img src="https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80" alt="" />
          <div class="newsletter-visual-overlay" />
          <div class="newsletter-visual-text">
            <div class="section-label">Adventure Intel</div>
            <div style="font-family:var(--font-display); font-size:36px; color:var(--white); line-height:1;">
              First to Know.<br><span style="color:var(--orange);">First to Book.</span>
            </div>
          </div>
        </div>

        <div class="newsletter-body">
          <template v-if="!submitted">
            <div class="newsletter-icon">📬</div>
            <h2 class="newsletter-title">Join 4,000+ Adventurers</h2>
            <p class="newsletter-sub">
              New expedition drops, exclusive early-bird pricing, survival tips from our guides, and stories from the trail. Every Thursday.
            </p>

            <div class="newsletter-perks">
              <div class="perk" v-for="p in perks" :key="p">
                <span class="perk-check">✓</span>
                <span>{{ p }}</span>
              </div>
            </div>

            <form class="newsletter-form" @submit.prevent="subscribe">
              <div class="form-row">
                <input class="input" v-model="form.name" type="text" placeholder="Your first name" required />
              </div>
              <div class="form-row">
                <input class="input" v-model="form.email" type="email" placeholder="Your email address" required />
              </div>
              <div class="form-row">
                <label class="input-label" style="margin-bottom:6px;">I'm interested in:</label>
                <div class="pref-chips">
                  <button
                    v-for="cat in categories" :key="cat.value" type="button"
                    class="chip" :class="{ active: form.interests.includes(cat.value) }"
                    @click="toggleInterest(cat.value)"
                  >{{ cat.label }}</button>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
                {{ loading ? 'Subscribing...' : '🏔️ Subscribe Free' }}
              </button>
              <p v-if="error" class="newsletter-error">{{ error }}</p>
              <p class="newsletter-disclaimer">No spam. Unsubscribe anytime. We respect your inbox.</p>
            </form>
          </template>

          <template v-else>
            <div class="newsletter-success">
              <div class="success-icon">🏔️</div>
              <h2>You're In!</h2>
              <p>Welcome to the Summit Trail community, <strong>{{ form.name }}</strong>. Check your inbox for a welcome message and your first expedition briefing.</p>
              <button class="btn btn-outline btn-full" @click="close" style="margin-top:24px;">Let's Explore →</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { useAnalyticsStore } from '~/stores/analytics'

const profile = useProfileStore()
const analytics = useAnalyticsStore()

const showModal = ref(false)
const submitted = ref(false)
const loading = ref(false)
const error = ref(null)

const form = reactive({
  name: '',
  email: '',
  interests: ['survival'],
})

const categories = [
  { value: 'survival', label: '🏕️ Survival' },
  { value: 'convoy', label: '🚙 Convoy' },
  { value: 'mountain', label: '⛰️ Mountain' },
  { value: 'overland', label: '🗺️ Overland' },
]

const perks = [
  'New expedition alerts before public release',
  'Exclusive 10% subscriber-only discount',
  'Gear guides and survival tips from Samuel K.',
  'Stories from the field – unfiltered',
]

// Show modal after 45 seconds if not subscribed/dismissed
onMounted(() => {
  setTimeout(() => {
    if (!profile.newsletterSubscribed && !profile.newsletterDismissed) {
      showModal.value = true
    }
  }, 45000)
})

// Expose open function for other components
function open() { showModal.value = true }
function close() {
  showModal.value = false
  profile.setNewsletterDismissed()
}

function toggleInterest(val) {
  const idx = form.interests.indexOf(val)
  if (idx === -1) form.interests.push(val)
  else form.interests.splice(idx, 1)
}

async function subscribe() {
  if (!form.email) return
  loading.value = true
  error.value = null
  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { name: form.name, email: form.email, interests: form.interests }
    })
    submitted.value = true
    profile.setNewsletterSubscribed(true)
    analytics.trackEvent('newsletter', 'subscribe', form.interests.join(','))
  } catch (e) {
    error.value = 'Could not subscribe. Please try again.'
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.newsletter-backdrop {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}

.newsletter-modal {
  display: grid; grid-template-columns: 260px 1fr;
  max-width: 720px; width: 100%;
  background: var(--charcoal); border: 1px solid var(--border);
  position: relative; overflow: hidden;
  max-height: 90vh; overflow-y: auto;
}

.newsletter-close {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  background: rgba(10,10,8,0.7); border: 1px solid var(--border);
  color: var(--light); font-size: 14px; padding: 6px 10px; cursor: pointer;
  transition: all 0.2s;
}
.newsletter-close:hover { border-color: var(--orange); color: var(--orange); }

.newsletter-visual {
  position: relative; overflow: hidden;
}
.newsletter-visual img { width: 100%; height: 100%; object-fit: cover; }
.newsletter-visual-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,10,8,0.9), rgba(10,10,8,0.3));
}
.newsletter-visual-text {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
}

.newsletter-body { padding: 36px 32px; }

.newsletter-icon { font-size: 32px; margin-bottom: 12px; }
.newsletter-title {
  font-family: var(--font-display); font-size: 36px; color: var(--text);
  margin-bottom: 12px; line-height: 1;
}
.newsletter-sub {
  font-size: 14px; font-weight: 300; color: var(--light); line-height: 1.7; margin-bottom: 20px;
}

.newsletter-perks { margin-bottom: 24px; }
.perk {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; color: var(--light); margin-bottom: 8px;
}
.perk-check { color: var(--green-light); font-weight: 700; flex-shrink: 0; }

.newsletter-form { display: flex; flex-direction: column; gap: 14px; }

.form-row { display: flex; flex-direction: column; }

.pref-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.newsletter-error { font-size: 12px; color: var(--red); }
.newsletter-disclaimer { font-size: 11px; color: var(--gray); text-align: center; margin-top: 4px; }

.newsletter-success { text-align: center; padding: 20px 0; }
.success-icon { font-size: 56px; margin-bottom: 16px; }
.newsletter-success h2 { font-family: var(--font-display); font-size: 40px; margin-bottom: 12px; }
.newsletter-success p { font-size: 15px; color: var(--light); line-height: 1.7; }

/* Transition */
.fade-modal-enter-active, .fade-modal-leave-active { transition: opacity 0.3s; }
.fade-modal-enter-from, .fade-modal-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .newsletter-modal { grid-template-columns: 1fr; }
  .newsletter-visual { display: none; }
  .newsletter-body { padding: 24px 20px; }
}
</style>
