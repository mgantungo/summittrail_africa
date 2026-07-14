<!--app/pages/calendar.vue-->
<template>
  <div style="padding-top:72px;">
    <div class="section cal-hero">
      <div class="section-label">Adventure Calendar</div>
      <h1 class="section-title">Plan Your<br><span>Departure</span></h1>
      <p class="section-sub">All scheduled expeditions. Live availability. Book directly from the calendar.</p>
    </div>

    <div class="section" style="padding-top:24px;">
      <!-- Controls -->
      <div class="cal-controls">
        <div class="cal-nav">
          <button class="btn btn-ghost btn-sm" @click="prevMonth">← Prev</button>
          <div class="cal-month-title">{{ monthTitle }}</div>
          <button class="btn btn-ghost btn-sm" @click="nextMonth">Next →</button>
        </div>
        <div class="cal-filters">
          <button v-for="c in categories" :key="c.value" class="chip" :class="{ active: activeCategory === c.value }" @click="activeCategory = c.value">{{ c.label }}</button>
        </div>
      </div>

      <div class="calendar-layout">
        <!-- Calendar grid -->
        <div class="month-grid">
          <div class="cal-header" v-for="d in dayHeaders" :key="d">{{ d }}</div>
          <div
            v-for="day in calDays"
            :key="day.key"
            class="cal-cell"
            :class="{
              'cal-cell--empty': !day.date,
              'cal-cell--today': day.isToday,
              'cal-cell--active': day.date && selectedDay?.key === day.key
            }"
            @click="day.date && selectDay(day)"
          >
            <span v-if="day.date" class="cal-cell-num" :class="{ today: day.isToday }">{{ day.num }}</span>
            <div class="cal-trips" v-if="day.trips?.length">
              <div
                v-for="trip in day.trips.slice(0, 2)"
                :key="trip.id"
                class="cal-trip-dot"
                :class="`dot-${trip.difficulty}`"
                :title="trip.title"
              />
              <div v-if="day.trips.length > 2" class="cal-more">+{{ day.trips.length - 2 }}</div>
            </div>
          </div>
        </div>

        <!-- Side panel -->
        <div class="cal-side">
          <div v-if="selectedDay && selectedDay.trips?.length">
            <div class="side-date">{{ formatFullDate(selectedDay.date) }}</div>
            <div class="side-trips">
              <NuxtLink
                v-for="trip in selectedDay.trips"
                :key="trip.id"
                :to="`/adventures/${trip.slug}`"
                class="side-trip-card"
              >
                <img :src="trip.image" :alt="trip.title" class="side-trip-img" loading="lazy" />
                <div class="side-trip-body">
                  <span class="badge" :class="`badge-${trip.difficulty}`">{{ trip.difficulty }}</span>
                  <div class="side-trip-title">{{ trip.title }}</div>
                  <div class="side-trip-meta">
                    <span>⏱ {{ trip.duration }} {{ trip.durationUnit }}</span>
                    <span>👥 {{ trip.spotsLeft }} spots left</span>
                  </div>
                  <div class="side-trip-price">From ${{ trip.basePrice.toLocaleString() }} → Book</div>
                </div>
              </NuxtLink>
            </div>
          </div>
          <div v-else class="side-empty">
            <div style="font-size:36px; margin-bottom:12px;">📅</div>
            <div style="font-family:var(--font-condensed); font-size:14px; color:var(--gray);">
              {{ selectedDay ? 'No departures on this date.' : 'Select a date to see departures.' }}
            </div>
          </div>

          <!-- All upcoming -->
          <div class="upcoming-block">
            <div class="section-label" style="margin-bottom:16px;">All Upcoming</div>
            <div class="upcoming-list">
              <NuxtLink
                v-for="dep in allUpcoming.slice(0, 8)"
                :key="dep.id + dep.date"
                :to="`/adventures/${dep.slug}`"
                class="upc-item"
              >
                <div class="upc-date">{{ shortDate(dep.date) }}</div>
                <div class="upc-info">
                  <div class="upc-title">{{ dep.title.split(' ').slice(0, 3).join(' ') }}…</div>
                  <div class="upc-spots" :class="{ 'spots-low': dep.spotsLeft <= 3 }">
                    {{ dep.spotsLeft }} spots{{ dep.spotsLeft <= 3 ? ' 🔥' : '' }}
                  </div>
                </div>
                <div class="upc-price">${{ dep.basePrice }}</div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="cal-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--red);" />Extreme</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--gold);" />Moderate</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--green-light);" />Beginner</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: adventures } = await useAdventures()

useHead({ title: 'Adventure Calendar – Summit Trail' })

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())
const selectedDay = ref(null)
const activeCategory = ref('')

const categories = [
  { value: '', label: 'All' },
  { value: 'survival', label: 'Survival' },
  { value: 'convoy', label: 'Convoy' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'overland', label: 'Overland' },
]

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthTitle = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)

// Build all departures with adventure details
const allDepartures = computed(() => {
  const deps = []
  adventures.value.forEach(adv => {
    if (activeCategory.value && adv.category !== activeCategory.value) return
    adv.departures.forEach(dep => {
      deps.push({ ...adv, date: dep.date, spotsLeft: dep.spotsLeft })
    })
  })
  return deps
})

const allUpcoming = computed(() =>
  allDepartures.value.sort((a, b) => new Date(a.date) - new Date(b.date))
)

// Build calendar days for current view month
const calDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < offset; i++) {
    days.push({ key: `empty-${i}`, date: null, num: null, trips: [] })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const trips = allDepartures.value.filter(dep => dep.date === dateStr)
    const isToday = dateStr === now.toISOString().split('T')[0]
    days.push({ key: dateStr, date: dateStr, num: d, trips, isToday })
  }

  return days
})

function selectDay(day) {
  selectedDay.value = selectedDay.value?.key === day.key ? null : day
}

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function formatFullDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function shortDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.cal-hero { background: var(--deep); border-bottom: 1px solid var(--border); }
.cal-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.cal-nav { display: flex; align-items: center; gap: 16px; }
.cal-month-title { font-family: var(--font-display); font-size: 24px; color: var(--text); min-width: 200px; text-align: center; }
.cal-filters { display: flex; gap: 8px; flex-wrap: wrap; }

.calendar-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }

.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-header { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); text-align: center; padding: 10px; }
.cal-cell { min-height: 80px; background: var(--panel); border: 1px solid var(--border); padding: 8px; cursor: pointer; transition: border-color .15s; position: relative; }
.cal-cell:hover { border-color: var(--orange); }
.cal-cell--empty { background: transparent; border-color: transparent; cursor: default; }
.cal-cell--today { border-color: var(--orange); background: rgba(232,98,42,0.05); }
.cal-cell--active { border-color: var(--orange); background: rgba(232,98,42,0.1); }
.cal-cell-num { font-family: var(--font-condensed); font-size: 15px; font-weight: 700; color: var(--text); display: block; margin-bottom: 4px; }
.cal-cell-num.today { color: var(--orange); }
.cal-trips { display: flex; gap: 3px; flex-wrap: wrap; }
.cal-trip-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-extreme { background: var(--red); }
.dot-moderate { background: var(--gold); }
.dot-beginner { background: var(--green-light); }
.cal-more { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }

/* Side panel */
.cal-side { }
.side-date { font-family: var(--font-display); font-size: 22px; color: var(--text); margin-bottom: 16px; }
.side-trips { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.side-trip-card { display: grid; grid-template-columns: 80px 1fr; background: var(--panel); border: 1px solid var(--border); overflow: hidden; transition: border-color .2s; }
.side-trip-card:hover { border-color: var(--orange); }
.side-trip-img { width: 80px; height: 80px; object-fit: cover; }
.side-trip-body { padding: 10px 12px; }
.side-trip-title { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--text); margin: 5px 0; line-height: 1.2; }
.side-trip-meta { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); display: flex; gap: 10px; margin-bottom: 4px; }
.side-trip-price { font-family: var(--font-condensed); font-size: 13px; color: var(--orange); font-weight: 700; }
.side-empty { background: var(--panel); border: 1px solid var(--border); padding: 32px; text-align: center; margin-bottom: 24px; }

.upcoming-block { background: var(--panel); border: 1px solid var(--border); padding: 20px; }
.upcoming-list { display: flex; flex-direction: column; gap: 0; }
.upc-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); transition: background .15s; }
.upc-item:last-child { border-bottom: none; }
.upc-date { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; color: var(--orange); width: 50px; flex-shrink: 0; }
.upc-info { flex: 1; }
.upc-title { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--text); }
.upc-spots { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.spots-low { color: var(--red); font-weight: 700; }
.upc-price { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--orange); flex-shrink: 0; }

.cal-legend { display: flex; gap: 20px; margin-top: 20px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }

@media (max-width: 900px) {
  .calendar-layout { grid-template-columns: 1fr; }
  .cal-side { order: -1; }
}
@media (max-width: 600px) {
  .cal-cell { min-height: 56px; padding: 5px; }
  .cal-trip-dot { width: 6px; height: 6px; }
}
</style>
