<template>
  <div class="filter-bar">
    <div class="filter-inner">
      <div class="filter-label">Find My Adventure</div>

      <div class="filter-group">
        <div class="filter-group-label">Adrenaline</div>
        <select class="filter-select" v-model="filters.difficulty">
          <option value="">Any Level</option>
          <option value="beginner">Beginner</option>
          <option value="moderate">Moderate</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>

      <div class="filter-group">
        <div class="filter-group-label">Duration</div>
        <select class="filter-select" v-model="filters.duration">
          <option value="">Any Length</option>
          <option value="1">1 Day</option>
          <option value="2-3">2–3 Days</option>
          <option value="4+">4+ Days</option>
        </select>
      </div>

      <div class="filter-chips-wrap">
        <button
          v-for="t in filterTags" :key="t"
          class="chip" :class="{ active: filters.tags.includes(t) }"
          @click="toggleTag(t)"
        >{{ t }}</button>
      </div>

      <button class="filter-search-btn" @click="search">Search</button>
    </div>
  </div>
</template>

<script setup>
import { useAnalyticsStore } from '~/stores/analytics'

const router    = useRouter()
const analytics = useAnalyticsStore()

const filterTags = ['Solo', 'Group', 'Weekend', 'Overnight', 'International']
const filters    = reactive({ difficulty: '', duration: '', tags: [] })

function toggleTag(t) {
  const idx = filters.tags.indexOf(t)
  if (idx === -1) filters.tags.push(t)
  else filters.tags.splice(idx, 1)
}

function search() {
  const query = {}
  if (filters.difficulty) query.difficulty = filters.difficulty
  if (filters.duration)   query.duration   = filters.duration
  router.push({ path: '/adventures', query })
  analytics.trackEvent('filter', 'search', JSON.stringify(filters))
}
</script>

<style scoped>
.filter-bar {
  background: var(--charcoal);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.filter-inner {
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
  padding: 18px var(--px);
}
.filter-label {
  font-family: var(--font-condensed); font-size: 14px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--orange);
  flex-shrink: 0;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 140px; }
.filter-group-label {
  font-family: var(--font-condensed); font-size: 11px; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; color: var(--gray);
}
.filter-select {
  background: var(--panel); border: 1px solid var(--border); color: var(--text);
  padding: 8px 12px; font-family: var(--font-condensed); font-size: 14px;
  outline: none; cursor: pointer;
}
.filter-select:focus { border-color: var(--orange); }
.filter-chips-wrap { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.filter-search-btn {
  background: var(--orange); color: var(--black); border: 2px solid var(--orange);
  padding: 12px 28px; font-family: var(--font-condensed);
  font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s; margin-left: auto; flex-shrink: 0;
}
.filter-search-btn:hover { background: transparent; color: var(--orange); }

@media (max-width: 480px) {
  .filter-chips-wrap  { display: none; }
  .filter-search-btn  { width: 100%; text-align: center; padding: 18px; }
  .filter-group       { min-width: 120px; }
}
</style>
