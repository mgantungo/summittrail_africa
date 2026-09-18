<!--app/pages/adventures/index.vue-->
<template>
  <div style="padding-top:72px;">
    <section class="section">
      <div class="section-label">All Expeditions</div>
      <h1 class="section-title">Choose Your<br><span>Adventure</span></h1>

      <div class="filter-bar">
        <button
          v-for="cat in categories" :key="cat.value"
          class="filter-chip" :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >{{ cat.label }}</button>
      </div>

      <div v-if="pending" class="empty-state">Loading adventures…</div>
      <div v-else-if="!filtered.length" class="empty-state">No adventures match this filter yet.</div>
      <div v-else class="adv-grid">
        <NuxtLink
          v-for="adv in filtered" :key="adv.id"
          :to="`/adventures/${adv.slug}`"
          class="adv-card"
        >
          <div class="adv-card-img" :style="{ backgroundImage: `url(${adv.image})` }">
            <span class="adv-card-badge">{{ adv.difficulty }}</span>
          </div>
          <div class="adv-card-body">
            <div class="adv-card-cat">{{ adv.category }}</div>
            <h3 class="adv-card-title">{{ adv.title }}</h3>
            <p class="adv-card-tagline">{{ adv.tagline }}</p>
            <div class="adv-card-meta">
              <span>📍 {{ adv.location || adv.terrain }}</span>
              <span>{{ adv.duration }} {{ adv.durationUnit }}</span>
            </div>
            <div class="adv-card-price">From {{ displayPrice(adv) }}</div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({ title: 'All Adventures – Summit Trail' })

// Ordered by nextDeparture — nearest-upcoming first, past ones last —
// via the custom /api/adventures/by-departure endpoint, rather than the
// plain alphabetical useAdventures().
const { data: adventures, pending } = await useAdventuresByDeparture()

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

// useAdventuresByDeparture() shares its cache key with HomeFeaturedAdventures
// on the home page — Nuxt's useFetch caches by key for the whole SPA
// session, so without this, landing here after the home page (or after any
// earlier visit) would keep showing whatever was cached then, not what's
// actually in the CMS now. Matches the same refreshNuxtData() pattern
// already used on pages/index.vue for the same reason.
onMounted(() => {
  refreshNuxtData()
})

// Two pricing models currently coexist: package-tier (basePrice/currency
// — e.g. Turkana) and citizenship-tier (eacPrice/eacCurrency, etc. — the
// newer mountain expeditions). Prefer the citizenship EAC price when set,
// otherwise fall back to the package-tier basePrice.
function displayPrice(adv) {
  if (adv.eacPrice != null) return formatMoney(adv.eacPrice, adv.eacCurrency)
  return formatMoney(adv.basePrice, adv.currency)
}
</script>

<style scoped>
.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; margin: 24px 0 36px; }
.filter-chip {
  background: none; border: 1px solid var(--border); color: var(--gray);
  font-family: var(--font-condensed); font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  padding: 9px 18px; cursor: pointer; border-radius: 20px; transition: all 0.2s;
}
.filter-chip:hover { color: var(--text); border-color: var(--gray); }
.filter-chip.active { background: var(--orange); border-color: var(--orange); color: var(--black); }
.empty-state { padding: 60px 0; text-align: center; color: var(--gray); font-family: var(--font-condensed); }
.adv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; padding-bottom: 60px; }
.adv-card { display: block; background: var(--panel); border: 1px solid var(--border); text-decoration: none; transition: border-color 0.2s, transform 0.2s; }
.adv-card:hover { border-color: var(--orange); transform: translateY(-4px); }
.adv-card-img { height: 200px; background-size: cover; background-position: center; position: relative; }
.adv-card-badge {
  position: absolute; top: 12px; right: 12px; background: rgba(10,10,8,0.85); color: var(--orange);
  font-family: var(--font-condensed); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 5px 12px; border-radius: 12px;
}
.adv-card-body { padding: 22px; }
.adv-card-cat { font-family: var(--font-condensed); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px; }
.adv-card-title { font-family: var(--font-display); font-size: 24px; color: var(--text); line-height: 1.1; margin-bottom: 10px; }
.adv-card-tagline { font-size: 14px; color: var(--light); line-height: 1.5; margin-bottom: 14px; }
.adv-card-meta { display: flex; justify-content: space-between; font-size: 13px; color: var(--gray); margin-bottom: 14px; }
.adv-card-price { font-family: var(--font-display); font-size: 22px; color: var(--orange); }
</style>