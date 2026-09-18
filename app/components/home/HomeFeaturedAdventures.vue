<!--app/components/home/HomeFeaturedAdventures.vue-->
<template>
  <section class="section featured-section">
    <div class="feat-header">
      <div>
        <div class="section-label">Experiences</div>
        <h2 class="section-title">Choose Your<br><span>Challenge</span></h2>
      </div>
      <div class="cat-chips">
        <button
          v-for="c in categories" :key="c.value"
          class="chip" :class="{ active: activeCategory === c.value }"
          @click="activeCategory = c.value"
        >{{ c.label }}</button>
      </div>
    </div>

    <div class="adventures-grid">
      <NuxtLink
        v-for="(adv, i) in filtered.slice(0, 4)"
        :key="adv.id"
        :to="`/adventures/${adv.slug}`"
        class="adv-card"
        :class="{ 'adv-card--large': i === 0 }"
        @click="trackView(adv)"
      >
        <img :src="adv.image" :alt="adv.title" class="adv-card-img" loading="lazy" />
        <div class="adv-card-overlay" />
        <div class="adv-card-content">
          <span class="badge" :class="`badge-${adv.difficulty}`">{{ adv.difficulty }}</span>
          <div class="adv-card-title">{{ adv.title }}</div>
          <div class="adv-meta">
            <span>⏱ {{ adv.duration }} {{ adv.durationUnit }}</span>
            <span>👥 Max {{ adv.maxGroup }}</span>
            <span>{{ adv.terrain }}</span>
          </div>
          <div class="adv-price">From {{ displayPrice(adv) }}</div>
        </div>
        <div class="adv-hover-cta">View Details →</div>
      </NuxtLink>
    </div>

    <div class="feat-cta">
      <NuxtLink to="/adventures" class="btn btn-outline btn-lg">View All Adventures</NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { useAnalyticsStore } from '~/stores/analytics'

// Ordered by nextDeparture — nearest-upcoming first — rather than the
// plain alphabetical useAdventures().
const { data: adventures } = await useAdventuresByDeparture()

const analytics     = useAnalyticsStore()
const activeCategory = ref('')

const categories = [
  { value: '',         label: 'All'      },
  { value: 'survival', label: 'Survival' },
  { value: 'convoy',   label: 'Convoy'   },
  { value: 'mountain', label: 'Mountain' },
  { value: 'overland', label: 'Overland' },
]

const filtered = computed(() =>
  activeCategory.value
    ? adventures.value.filter(a => a.category === activeCategory.value)
    : adventures.value
)

// Two pricing models coexist: package-tier (basePrice/currency — e.g.
// Turkana) and citizenship-tier (eacPrice/eacCurrency — the newer
// mountain expeditions). Prefer the citizenship EAC price when set.
function displayPrice(adv) {
  if (adv.eacPrice != null) return formatMoney(adv.eacPrice, adv.eacCurrency)
  return formatMoney(adv.basePrice, adv.currency)
}

function trackView(adv) {
  analytics.trackEvent('adventure', 'view', adv.id)
}
</script>

<style scoped>
.featured-section { padding-top: 60px; }

.feat-header {
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 16px;
  margin-bottom: 40px;
}
.cat-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.adventures-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 280px 280px;
  gap: 2px;
}
.adv-card {
  position: relative; overflow: hidden; display: block; cursor: pointer;
  grid-row: span 1;
}
.adv-card--large { grid-row: span 2; }
.adv-card-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.adv-card:hover .adv-card-img { transform: scale(1.05); }
.adv-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,10,8,0.92) 0%, rgba(10,10,8,0.2) 60%, transparent 100%);
}
.adv-card-content {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 24px; display: flex; flex-direction: column; gap: 8px;
}
.adv-card-title {
  font-family: var(--font-display); font-size: 24px;
  color: var(--white); line-height: 1.1;
}
.adv-card--large .adv-card-title { font-size: 36px; }
.adv-meta {
  display: flex; gap: 12px; flex-wrap: wrap;
  font-family: var(--font-condensed); font-size: 13px; color: var(--light);
}
.adv-price {
  font-family: var(--font-condensed); font-size: 16px;
  font-weight: 700; color: var(--orange);
}
.adv-hover-cta {
  position: absolute; top: 16px; right: 16px;
  background: var(--orange); color: var(--black);
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700;
  letter-spacing: 1px; padding: 8px 16px;
  opacity: 0; transition: opacity 0.2s;
}
.adv-card:hover .adv-hover-cta { opacity: 1; }

.feat-cta { text-align: center; margin-top: 40px; }

@media (max-width: 1100px) {
  .adventures-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 300px 300px 300px;
  }
  .adv-card--large { grid-row: span 1; grid-column: span 2; }
}
@media (max-width: 768px) {
  .adventures-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 260px);
  }
  .adv-card--large { grid-column: span 1; }
}
@media (max-width: 480px) {
  .cat-chips { flex-wrap: wrap; }
}
</style>