<!--app/pages/adventures/[slug].vue-->
<template>
  <div v-if="adv" style="padding-top:72px;">
    <!-- HERO -->
    <div class="detail-hero">
      <img v-if="adv.image" :src="adv.image" :alt="adv.title" class="detail-hero-img" />
      <div v-else class="detail-hero-img detail-hero-img--placeholder" aria-hidden="true">🏔️</div>
      <div class="detail-hero-overlay" />
      <div class="detail-hero-content">
        <div class="detail-urgency">
          <span v-if="adv.spotsLeft <= 3" class="urgency-tag hot">🔥 Only {{ adv.spotsLeft }} Spots Left</span>
          <span class="urgency-tag timer" v-if="adv.departures?.[0]?.date">⏰ Next Departure: {{ formatDate(adv.departures[0].date) }}</span>
          <span class="urgency-tag rate">✅ {{ adv.completionRate }}% Completion Rate</span>
        </div>
        <h1 class="detail-title">{{ adv.title }}</h1>
        <div class="detail-tagline">{{ adv.tagline }}</div>
        <div class="detail-quick-stats">
          <div class="qs-item"><div class="qs-value">{{ adv.duration }}{{ (adv.durationUnit || 'days').charAt(0).toUpperCase() }}</div><div class="qs-label">Duration</div></div>
          <div class="qs-item"><div class="qs-value">{{ '★'.repeat(adv.difficultyLevel) }}</div><div class="qs-label">Difficulty</div></div>
          <div class="qs-item"><div class="qs-value">{{ adv.altitude }}</div><div class="qs-label">Max Altitude</div></div>
          <div class="qs-item"><div class="qs-value">{{ adv.maxGroup }}</div><div class="qs-label">Max Group</div></div>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="detail-body section" style="padding-top:0;">
      <!-- Main content -->
      <div class="detail-main">
        <!-- Tabs -->
        <div class="tab-nav">
          <button v-for="t in tabs" :key="t" class="tab-btn" :class="{ active: activeTab === t }" @click="activeTab = t">{{ t }}</button>
        </div>

        <div class="tab-content">
          <!-- Overview -->
          <div v-if="activeTab === 'Overview'">
            <div class="highlights">
              <div class="section-label">Highlights</div>
              <ul class="highlights-list">
                <li v-for="h in adv.highlights" :key="h">{{ h }}</li>
              </ul>
            </div>
          </div>

          <!-- Itinerary -->
          <div v-if="activeTab === 'Itinerary'">
            <div v-if="!adv.itinerary?.length" class="tab-empty-state">
              No day-by-day itinerary has been added for this adventure yet.
            </div>
            <div v-else class="itinerary">
              <div class="itin-day" v-for="day in adv.itinerary" :key="day.day">
                <div class="itin-num">{{ String(day.day).padStart(2, '0') }}</div>
                <div class="itin-body">
                  <div class="itin-title">{{ day.title }}</div>
                  <div class="itin-meta">
                    <span>⏱ {{ day.duration }}</span>
                    <span>📍 {{ day.elevation }}</span>
                    <span>🚶 {{ day.distance }}</span>
                  </div>
                  <div class="itin-desc">{{ day.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Requirements -->
          <div v-if="activeTab === 'Requirements'">
            <div v-if="!adv.requirements" class="tab-empty-state">
              Requirements haven't been added for this adventure yet.
            </div>
            <template v-else>
              <div class="req-grid">
                <div class="req-item"><div class="req-label">Fitness Level</div><div class="req-val">{{ adv.requirements.fitness || '—' }}</div></div>
                <div class="req-item"><div class="req-label">Experience</div><div class="req-val">{{ adv.requirements.experience || '—' }}</div></div>
                <div class="req-item"><div class="req-label">Age Range</div><div class="req-val">{{ adv.requirements.age || '—' }}</div></div>
              </div>
              <template v-if="adv.requirements.gear?.length">
                <div class="section-label" style="margin-top:32px;">What to Bring</div>
                <ul class="gear-list">
                  <li v-for="g in adv.requirements.gear" :key="g">{{ g }}</li>
                </ul>
              </template>
            </template>
          </div>

          <!-- Reviews -->
          <div v-if="activeTab === 'Reviews'">
            <div class="reviews-summary">
              <div class="big-rating">{{ adv.rating }}</div>
              <div>
                <div class="stars">★★★★★</div>
                <div style="font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-top:4px;">Based on {{ adv.reviewCount }} verified reviews</div>
              </div>
            </div>
            <div class="review-cards">
              <div class="review-card" v-for="r in adventureReviews" :key="r.id">
                <div class="stars">★★★★★</div>
                <div class="review-title">{{ r.title }}</div>
                <p class="review-text">"{{ r.content }}"</p>
                <div class="reviewer">
                  <img :src="r.author?.avatar" :alt="r.author?.name || 'Reviewer'" class="reviewer-img" />
                  <div>
                    <div class="reviewer-name">{{ r.author?.name || 'Verified Traveler' }} · {{ r.author?.location }}</div>
                    <div class="reviewer-date">{{ formatDate(r.date) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gallery -->
          <div v-if="activeTab === 'Gallery'">
            <div class="gallery-grid">
              <img v-for="(img, i) in adv.gallery" :key="i" :src="img" :alt="`Gallery ${i+1}`" class="gallery-img" loading="lazy" />
              <img v-if="adv.image" :src="adv.image" alt="Main" class="gallery-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- Booking sidebar -->
      <div class="detail-sidebar">
        <div class="booking-card">
          <div class="booking-card-header">Book This Expedition</div>
          <div class="booking-card-body">
            <div class="booking-price">{{ formatMoney(selectedTotal, adv.currency) }}</div>
            <div class="booking-price-note">Per person · All inclusive</div>

            <!-- Date picker -->
            <label class="input-label">Departure Date</label>
            <select class="input" v-model="booking.date" style="margin-bottom:14px;">
              <option value="">Select a date</option>
              <option v-for="dep in adv.departures" :key="dep.date" :value="dep.date" :disabled="dep.status === 'full'">
                {{ formatDate(dep.date) }} · {{ dep.spotsLeft }} spots
              </option>
            </select>

            <!-- Package -->
            <label class="input-label">Package</label>
            <div class="package-opts">
              <div
                v-for="pkg in packages" :key="pkg.id"
                class="package-opt" :class="{ selected: booking.package === pkg.id }"
                @click="booking.package = pkg.id"
              >
                <div class="pkg-name">{{ pkg.label }}</div>
                <div class="pkg-price">{{ formatMoney(pkg.price, adv.currency) }}</div>
              </div>
            </div>

            <!-- Add-ons -->
            <label class="input-label" style="margin-top:16px;">Add-ons</label>
            <div class="addons">
              <div
                v-for="addon in adv.addons" :key="addon.key"
                class="addon" @click="toggleAddon(addon.key)"
              >
                <div class="addon-check" :class="{ checked: booking.addons.includes(addon.key) }" />
                <span class="addon-label">{{ addon.label }}</span>
                <span class="addon-price">+{{ formatMoney(addon.price ?? 0, adv.currency) }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="booking-total">
              <span class="booking-total-label">Total</span>
              <span class="booking-total-val">{{ formatMoney(selectedTotal, adv.currency) }}</span>
            </div>

            <NuxtLink
              :to="`/booking/${adv.slug}?date=${booking.date}&pkg=${booking.package}`"
              class="btn btn-primary btn-full btn-lg"
              style="margin-bottom:10px; justify-content:center;"
              @click="trackBook"
            >
              Book Now – Secure Slot
            </NuxtLink>
            <button class="btn btn-ghost btn-full" @click="trackBook">Reserve Now · Pay Later</button>

            <div v-if="adv.spotsLeft <= 3" class="spots-indicator">
              <div class="spots-dot" />
              Only {{ adv.spotsLeft }} spots remaining
            </div>
          </div>
        </div>

        <!-- Guides -->
        <div class="sidebar-guides">
          <div class="section-label">Your Guides</div>
          <div class="guide-card" v-for="g in advGuides" :key="g.id">
            <img :src="g.avatar" :alt="g.name" class="guide-avatar" />
            <div>
              <div class="guide-name">{{ g.name }}</div>
              <div class="guide-role">{{ g.role }}</div>
              <div class="guide-stat">★ {{ g.rating }} · {{ g.expeditions }} expeditions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found section" style="padding-top:120px; text-align:center;">
    <div style="font-size:56px; margin-bottom:20px;">🏔️</div>
    <h2 class="section-title">Adventure Not Found</h2>
    <NuxtLink to="/adventures" class="btn btn-primary" style="margin-top:24px;">Back to Adventures</NuxtLink>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { useAnalyticsStore } from '~/stores/analytics'

const route = useRoute()
const profile = useProfileStore()
const analytics = useAnalyticsStore()

const { data: adv } = await useAdventure(computed(() => route.params.slug))
const { data: adventureReviews } = await useReviews(computed(() => route.params.slug))

useHead(() => ({ title: adv.value ? `${adv.value.title} – Summit Trail` : 'Adventure' }))

const activeTab = ref('Overview')
const tabs = ['Overview', 'Itinerary', 'Requirements', 'Reviews', 'Gallery']

const booking = reactive({ date: '', package: 'essential', addons: [] })

// Prices default to 0 rather than null/undefined — a package field left
// blank in Strapi should render as $0, not throw and take down SSR
// (null.toLocaleString() is a fatal error during server rendering).
const packages = computed(() => adv.value ? [
  { id: 'essential', label: 'Essential', price: adv.value.basePrice ?? 0 },
  { id: 'premium', label: 'Premium + Gear', price: adv.value.premiumPrice ?? 0 },
  { id: 'vip', label: 'VIP Private', price: adv.value.vipPrice ?? 0 },
] : [])

const selectedTotal = computed(() => {
  if (!adv.value) return 0
  const pkg = packages.value.find(p => p.id === booking.package)
  const base = pkg?.price ?? adv.value.basePrice ?? 0
  const addonsTotal = booking.addons.reduce((sum, key) => {
    const a = (adv.value.addons || []).find(a => a.key === key)
    return sum + (a?.price ?? 0)
  }, 0)
  return base + addonsTotal
})

// Guides come pre-populated on the adventure relation (populate=*),
// so no separate lookup against a full guides list is needed.
const advGuides = computed(() => adv.value?.guides || [])

function toggleAddon(id) {
  const idx = booking.addons.indexOf(id)
  if (idx === -1) booking.addons.push(id)
  else booking.addons.splice(idx, 1)
}

// Currency comes from the CMS per-adventure (adv.currency — UGX/USD/KES),
// not hardcoded. UGX/KES conventionally show as a whole-number code prefix
// (no decimals — e.g. "UGX 150,000"); USD gets the $ symbol. Falls back to
// UGX if an adventure somehow has no currency set (shouldn't happen once
// every entry has been resaved against the new required field).
const CURRENCY_DISPLAY = {
  USD: { symbol: '$', position: 'prefix' },
  UGX: { symbol: 'UGX', position: 'prefix-spaced' },
  KES: { symbol: 'KES', position: 'prefix-spaced' },
}

function formatMoney(amount, currency) {
  const value = (amount ?? 0).toLocaleString()
  const cfg = CURRENCY_DISPLAY[currency] || CURRENCY_DISPLAY.UGX
  return cfg.position === 'prefix' ? `${cfg.symbol}${value}` : `${cfg.symbol} ${value}`
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function trackBook() {
  if (!adv.value) return
  profile.logAction({ type: 'booking', label: `Booking: ${adv.value.title}`, route: `/booking/${adv.value.slug}` })
  analytics.trackEvent('booking', 'initiate', adv.value.slug, selectedTotal.value)
}

onMounted(() => {
  if (adv.value) {
    profile.addRecentlyViewed(adv.value.slug)
    analytics.trackEvent('adventure', 'detail_view', adv.value.slug)
  }
})
</script>

<style scoped>
.detail-hero { height: 560px; position: relative; overflow: hidden; }
.detail-hero-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
.detail-hero-img--placeholder { display: flex; align-items: center; justify-content: center; font-size: 72px; background: linear-gradient(135deg, var(--panel), var(--charcoal)); }
.detail-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(10,10,8,0.92) 40%, transparent); }
.detail-hero-content { position: absolute; top: 0; left: var(--px); bottom: 0; display: flex; flex-direction: column; justify-content: center; width: min(720px, calc(100% - 2 * var(--px))); }
.detail-urgency { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.urgency-tag { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border: 1px solid; }
.hot { border-color: var(--red); color: var(--red); background: rgba(192,57,43,0.1); }
.timer { border-color: var(--gold); color: var(--gold); background: rgba(212,168,67,0.1); }
.rate { border-color: var(--green-light); color: var(--green-light); background: rgba(77,140,77,0.1); }
.detail-title { font-family: var(--font-display); font-size: 64px; line-height: 0.95; margin-bottom: 16px; }
.detail-tagline { font-size: 16px; font-style: italic; font-weight: 300; color: var(--off); border-left: 3px solid var(--orange); padding-left: 14px; margin-bottom: 28px; }
.detail-quick-stats { display: grid; grid-template-columns: repeat(4, auto); gap: 0; border: 1px solid var(--border); background: rgba(10,10,8,0.7); width: fit-content; }
.qs-item { padding: 14px 20px; border-right: 1px solid var(--border); text-align: center; }
.qs-item:last-child { border-right: none; }
.qs-value { font-family: var(--font-display); font-size: 24px; color: var(--orange); }
.qs-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-top: 2px; }

.detail-body { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
.tab-nav { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 0; overflow-x: auto; }
.tab-btn { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 16px 26px; color: var(--gray); background: none; border: none; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; white-space: nowrap; transition: all 0.2s; }
.tab-btn:hover { color: var(--light); background: rgba(255,255,255,0.03); }
.tab-btn.active { color: var(--orange); border-bottom-color: var(--orange); background: rgba(232,98,42,0.1); }
@media (max-width: 600px) {
  .tab-btn { font-size: 14px; padding: 14px 18px; }
}
.tab-content { padding: 36px 0; }

.highlights-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.highlights-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--off); line-height: 1.7; padding: 12px; border: 1px solid var(--border); }
.highlights-list li::before { content: '→'; color: var(--orange); font-weight: 700; flex-shrink: 0; }

.itinerary { display: flex; flex-direction: column; gap: 0; }
.tab-empty-state { color: var(--gray); font-size: 15px; padding: 30px 0; }
.itin-day { display: grid; grid-template-columns: 64px 1fr; gap: 0; border-bottom: 1px solid var(--border); padding: 24px 0; }
.itin-num { font-family: var(--font-display); font-size: 48px; color: var(--muted); line-height: 1; }
.itin-title { font-family: var(--font-condensed); font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.itin-meta { display: flex; gap: 16px; font-family: var(--font-condensed); font-size: 12px; color: var(--gray); margin-bottom: 10px; flex-wrap: wrap; }
.itin-desc { font-size: 15px; font-weight: 400; color: var(--off); line-height: 1.8; }

.req-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.req-item { background: var(--panel); border: 1px solid var(--border); padding: 20px; }
.req-label { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 8px; }
.req-val { font-size: 15px; color: var(--off); line-height: 1.7; }
.gear-list { list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
.gear-list li { font-size: 14px; color: var(--light); padding: 10px 14px; border: 1px solid var(--border); display: flex; gap: 8px; }
.gear-list li::before { content: '✓'; color: var(--green-light); font-weight: 700; flex-shrink: 0; }

.reviews-summary { display: flex; gap: 20px; align-items: center; margin-bottom: 28px; padding: 24px; background: var(--panel); border: 1px solid var(--border); }
.big-rating { font-family: var(--font-display); font-size: 64px; color: var(--orange); line-height: 1; }
.review-cards { display: flex; flex-direction: column; gap: 16px; }
.review-card { background: var(--panel); border: 1px solid var(--border); padding: 24px; }
.review-title { font-family: var(--font-condensed); font-size: 17px; font-weight: 700; color: var(--text); margin: 8px 0; }
.review-text { font-size: 15px; color: var(--off); line-height: 1.8; font-style: italic; font-weight: 300; margin-bottom: 16px; }
.reviewer { display: flex; align-items: center; gap: 10px; }
.reviewer-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.reviewer-name { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--text); }
.reviewer-date { font-size: 12px; color: var(--gray); }

.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.gallery-img { width: 100%; height: 180px; object-fit: cover; transition: transform 0.3s; cursor: zoom-in; }
.gallery-img:hover { transform: scale(1.02); }

/* Booking card */
.booking-card { background: var(--charcoal); border: 1px solid var(--border); margin-bottom: 24px; position: sticky; top: 90px; }
.booking-card-header { padding: 20px 24px; background: var(--orange); color: var(--black); font-family: var(--font-display); font-size: 24px; letter-spacing: 1px; }
.booking-card-body { padding: 24px; }
.booking-price { font-family: var(--font-display); font-size: 48px; color: var(--text); line-height: 1; }
.booking-price-note { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); margin-bottom: 20px; }
.package-opts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
.package-opt { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
.package-opt.selected { border-color: var(--orange); background: rgba(232,98,42,0.08); }
.pkg-name { font-family: var(--font-condensed); font-size: 14px; font-weight: 600; color: var(--text); }
.pkg-price { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--orange); }
.addons { margin-bottom: 4px; }
.addon { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.addon-check { width: 18px; height: 18px; border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.addon-check.checked { background: var(--orange); border-color: var(--orange); }
.addon-check.checked::after { content: '✓'; color: var(--black); font-size: 13px; font-weight: 700; }
.addon-label { flex: 1; font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.addon-price { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.booking-total { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid var(--border); margin: 16px 0 16px; }
.booking-total-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }
.booking-total-val { font-family: var(--font-display); font-size: 32px; color: var(--orange); }
.spots-indicator { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-family: var(--font-condensed); font-size: 13px; color: var(--red); }
.spots-dot { width: 8px; height: 8px; background: var(--red); border-radius: 50%; animation: pulse 1.5s infinite; flex-shrink: 0; }

.sidebar-guides { background: var(--panel); border: 1px solid var(--border); padding: 24px; }
.guide-card { display: flex; gap: 14px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border); }
.guide-card:last-child { border-bottom: none; padding-bottom: 0; }
.guide-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange); }
.guide-name { font-family: var(--font-condensed); font-size: 15px; font-weight: 700; color: var(--text); }
.guide-role { font-size: 12px; color: var(--gray); }
.guide-stat { font-family: var(--font-condensed); font-size: 12px; color: var(--gold); margin-top: 2px; }

@media (max-width: 900px) {
  .detail-body { grid-template-columns: 1fr; }
  .booking-card { position: static; }
  .detail-hero { height: 420px; }
  .detail-title { font-size: 44px; }
  .detail-quick-stats { grid-template-columns: repeat(2, auto); }
}
@media (max-width: 600px) {
  .req-grid { grid-template-columns: 1fr; }
  .gear-list { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-hero { height: 360px; }
  .detail-title { font-size: 36px; }
}
</style>