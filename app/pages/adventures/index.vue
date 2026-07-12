<!--app/pages/adventures/index.vue-->
<template>
  <div class="adventures-page" style="padding-top:72px;">
    <div class="adv-hero">
      <div class="adv-hero-content section">
        <div class="section-label">All Expeditions</div>
        <h1 class="section-title">Choose Your<br><span>Challenge</span></h1>
        <p class="section-sub">{{ filteredList.length }} expeditions available. Every one designed to push you past your comfort zone.</p>
      </div>
    </div>

    <div class="adv-layout section" style="padding-top:48px;">
      <!-- Filters sidebar -->
      <aside class="adv-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">Difficulty</div>
          <div class="sidebar-opts">
            <label v-for="d in difficultyOpts" :key="d.value" class="sidebar-opt">
              <input type="radio" v-model="filters.difficulty" :value="d.value" />
              <span class="opt-badge badge" :class="`badge-${d.value || 'beginner'}`" v-if="d.value">{{ d.label }}</span>
              <span v-else>{{ d.label }}</span>
            </label>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Category</div>
          <div class="sidebar-opts">
            <label v-for="c in categoryOpts" :key="c.value" class="sidebar-opt">
              <input type="radio" v-model="filters.category" :value="c.value" />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Duration</div>
          <div class="sidebar-opts">
            <label v-for="d in durationOpts" :key="d.value" class="sidebar-opt">
              <input type="radio" v-model="filters.duration" :value="d.value" />
              <span>{{ d.label }}</span>
            </label>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Max Price</div>
          <input type="range" v-model.number="filters.maxPrice" min="200" max="3000" step="50" class="price-slider" />
          <div class="price-val">Up to ${{ filters.maxPrice.toLocaleString() }}</div>
        </div>
        <button class="btn btn-ghost btn-full" @click="resetFilters" style="margin-top:8px;">Clear Filters</button>
      </aside>

      <!-- Results -->
      <div class="adv-results">
        <div class="results-bar">
          <span class="results-count">{{ filteredList.length }} expeditions</span>
          <div style="display:flex; gap:10px; align-items:center;">
            <label class="sidebar-label" style="margin:0;">Sort:</label>
            <select class="filter-select" v-model="sort" style="border:1px solid var(--border); padding:8px 12px; background:var(--panel); color:var(--text);">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div class="results-grid" v-if="filteredList.length">
          <NuxtLink
            v-for="adv in filteredList"
            :key="adv.id"
            :to="`/adventures/${adv.slug}`"
            class="result-card"
          >
            <div class="result-img-wrap">
              <img :src="adv.image" :alt="adv.title" class="result-img" loading="lazy" />
              <span class="badge result-badge" :class="`badge-${adv.difficulty}`">{{ adv.difficulty }}</span>
              <div v-if="adv.spotsLeft <= 3" class="result-hot">🔥 {{ adv.spotsLeft }} spots left</div>
            </div>
            <div class="result-body">
              <div class="result-cat">{{ adv.category }}</div>
              <div class="result-title">{{ adv.title }}</div>
              <div class="result-meta">
                <span>⏱ {{ adv.duration }} {{ adv.durationUnit }}</span>
                <span>👥 Max {{ adv.maxGroup }}</span>
                <span>⛰ {{ adv.altitude }}</span>
              </div>
              <div class="result-footer">
                <div>
                  <div class="result-price">From ${{ adv.basePrice.toLocaleString() }}</div>
                  <div class="result-rating">★ {{ adv.rating }} ({{ adv.reviewCount }} reviews)</div>
                </div>
                <div class="btn btn-primary btn-sm">View →</div>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="no-results">
          <div style="font-size:48px; margin-bottom:16px;">🏔️</div>
          <div style="font-family:var(--font-display); font-size:28px; margin-bottom:10px;">No Matches</div>
          <p style="color:var(--gray);">Try adjusting your filters.</p>
          <button class="btn btn-outline" style="margin-top:20px;" @click="resetFilters">Clear All Filters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { adventures } from '~~/data/demo.js'

useHead({ title: 'Adventures – Summit Trail Limited' })

const route = useRoute()

const filters = reactive({
  difficulty: route.query.difficulty || '',
  category: route.query.category || '',
  duration: '',
  maxPrice: 3000,
})

const sort = ref('featured')

const difficultyOpts = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'extreme', label: 'Extreme' },
]
const categoryOpts = [
  { value: '', label: 'All Categories' },
  { value: 'survival', label: '🏕️ Survival' },
  { value: 'convoy', label: '🚙 Convoy' },
  { value: 'mountain', label: '⛰️ Mountain' },
  { value: 'overland', label: '🗺️ Overland' },
]
const durationOpts = [
  { value: '', label: 'Any Duration' },
  { value: '1', label: '1 Day' },
  { value: '2-3', label: '2–3 Days' },
  { value: '4+', label: '4+ Days' },
]

const filteredList = computed(() => {
  let list = [...adventures]
  if (filters.difficulty) list = list.filter(a => a.difficulty === filters.difficulty)
  if (filters.category) list = list.filter(a => a.category === filters.category)
  if (filters.duration) {
    if (filters.duration === '1') list = list.filter(a => a.duration === 1)
    if (filters.duration === '2-3') list = list.filter(a => a.duration >= 2 && a.duration <= 3)
    if (filters.duration === '4+') list = list.filter(a => a.duration >= 4)
  }
  list = list.filter(a => a.basePrice <= filters.maxPrice)
  if (sort.value === 'price-asc') list.sort((a, b) => a.basePrice - b.basePrice)
  if (sort.value === 'price-desc') list.sort((a, b) => b.basePrice - a.basePrice)
  if (sort.value === 'rating') list.sort((a, b) => b.rating - a.rating)
  return list
})

function resetFilters() {
  filters.difficulty = ''
  filters.category = ''
  filters.duration = ''
  filters.maxPrice = 3000
}
</script>

<style scoped>
.adv-hero {
  background: var(--deep); border-bottom: 1px solid var(--border);
  padding-top: 0;
}
.adv-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; }
.adv-sidebar { position: sticky; top: 90px; align-self: start; }
.sidebar-section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
.sidebar-label {
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
  color: var(--gray); margin-bottom: 14px; display: block;
}
.sidebar-opts { display: flex; flex-direction: column; gap: 10px; }
.sidebar-opt {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  font-family: var(--font-condensed); font-size: 14px; color: var(--light);
}
.sidebar-opt input { accent-color: var(--orange); }
.price-slider { width: 100%; accent-color: var(--orange); margin-bottom: 8px; }
.price-val { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--orange); }
.results-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
}
.results-count { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--gray); }
.results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.result-card { display: block; background: var(--panel); border: 1px solid var(--border); overflow: hidden; transition: border-color 0.2s; }
.result-card:hover { border-color: var(--orange); }
.result-img-wrap { position: relative; height: 200px; overflow: hidden; }
.result-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.result-card:hover .result-img { transform: scale(1.04); }
.result-badge { position: absolute; top: 12px; left: 12px; }
.result-hot {
  position: absolute; top: 12px; right: 12px;
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 1px;
  padding: 4px 10px; background: rgba(192,57,43,0.9); color: #fff;
}
.result-body { padding: 20px; }
.result-cat { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px; }
.result-title { font-family: var(--font-condensed); font-size: 19px; font-weight: 700; color: var(--text); margin-bottom: 10px; line-height: 1.2; }
.result-meta { display: flex; gap: 12px; flex-wrap: wrap; font-family: var(--font-condensed); font-size: 12px; color: var(--gray); margin-bottom: 16px; }
.result-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--border); padding-top: 14px; }
.result-price { font-family: var(--font-condensed); font-size: 20px; font-weight: 700; color: var(--orange); }
.result-rating { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); margin-top: 2px; }
.no-results { text-align: center; padding: 80px 20px; }
@media (max-width: 900px) {
  .adv-layout { grid-template-columns: 1fr; }
  .adv-sidebar { position: static; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (max-width: 600px) {
  .results-grid { grid-template-columns: 1fr; }
  .adv-sidebar { grid-template-columns: 1fr; }
}
</style>
