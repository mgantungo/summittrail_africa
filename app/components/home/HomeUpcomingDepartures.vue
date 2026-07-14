<!--app/components/home/HomeUpcomingDepartures.vue-->
<template>
  <section class="section departures-section" style="padding-top:0;">
    <div class="section-label">Upcoming Departures</div>
    <h2 class="section-title" style="margin-bottom:40px;">
      Book Your<br><span>Next</span> Departure
    </h2>

    <div class="departures-table">
      <div class="dep-header">
        <span>Trip</span>
        <span>Date</span>
        <span>Difficulty</span>
        <span>Price</span>
        <span>Spots</span>
        <span></span>
      </div>
      <div class="dep-row" v-for="dep in departures" :key="`${dep.id}-${dep.date}`">
        <span class="dep-name">{{ dep.title }}</span>
        <span class="dep-date">{{ fmt(dep.date) }}</span>
        <span><span class="badge" :class="`badge-${dep.difficulty}`">{{ dep.difficulty }}</span></span>
        <span class="dep-price">${{ dep.basePrice.toLocaleString() }}</span>
        <span class="dep-spots" :class="{ 'spots-low': dep.spots <= 3 }">
          {{ dep.spots }} left{{ dep.spots <= 3 ? ' 🔥' : '' }}
        </span>
        <span>
          <NuxtLink :to="`/adventures/${dep.slug}`" class="btn btn-primary btn-sm">Book</NuxtLink>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
const { data: adventures } = await useAdventures()

const departures = computed(() => {
  const deps = []
  ;(adventures.value || []).forEach(adv => {
    ;(adv.departures || []).forEach(dep => {
      deps.push({ ...adv, date: dep.date, spots: dep.spotsLeft, status: dep.status })
    })
  })
  return deps.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6)
})

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<style scoped>
.departures-table { border: 1px solid var(--border); }
.dep-header {
  display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr 100px;
  padding: 12px 24px; background: var(--black); gap: 16px;
  font-family: var(--font-condensed); font-size: 13px;
  font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray);
}
.dep-row {
  display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr 100px;
  padding: 16px 24px; border-top: 1px solid var(--border); gap: 16px;
  align-items: center; transition: background 0.15s;
}
.dep-row:hover { background: rgba(255,255,255,0.02); }
.dep-name  { font-family: var(--font-condensed); font-size: 15px; font-weight: 700; color: var(--text); }
.dep-date  { font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.dep-price { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--orange); }
.dep-spots { font-family: var(--font-condensed); font-size: 14px; color: var(--gray); }
.spots-low { color: var(--red); font-weight: 700; }

@media (max-width: 1100px) {
  .dep-header,.dep-row { grid-template-columns: 2fr 1fr 1fr 1fr 80px; }
  .dep-header span:nth-child(4),.dep-row span:nth-child(4) { display: none; }
}
@media (max-width: 768px) {
  .dep-header,.dep-row { grid-template-columns: 2fr 1fr 80px; }
  .dep-header span:nth-child(2),.dep-row span:nth-child(2),
  .dep-header span:nth-child(3),.dep-row span:nth-child(3),
  .dep-header span:nth-child(5),.dep-row span:nth-child(5) { display: none; }
}
</style>
