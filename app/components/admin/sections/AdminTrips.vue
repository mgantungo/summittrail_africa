<template>
  <div>
    <div class="section-label">Expedition Management</div>
    <h2 class="as-title">Trips & Departures</h2>

    <div v-if="msg" class="lx-msg" :class="msg.type">{{ msg.text }}</div>

    <!-- Live now -->
    <div v-if="liveNow.length" class="lx-card">
      <div class="td-label">Live Now</div>
      <div v-for="e in liveNow" :key="e.documentId" class="lx-live-row">
        <span class="badge badge-live">● LIVE</span>
        <strong>{{ e.adventure?.title || e.batchLabel || 'Expedition' }}</strong>
        <span class="lx-muted">{{ fmt(e.departureDate) }} · Day {{ e.currentDay || 1 }}{{ e.totalDays ? ` of ${e.totalDays}` : '' }} · {{ e.participants ?? 0 }} participants</span>
        <span class="lx-actions">
          <NuxtLink :to="{ path: '/tracking', query: { expedition: e.documentId } }" class="btn btn-ghost btn-sm" target="_blank">View stream</NuxtLink>
          <button class="btn btn-ghost btn-sm" :disabled="busyKey === e.documentId" @click="endExpedition(e)">{{ busyKey === e.documentId ? 'Ending…' : '■ End' }}</button>
        </span>
      </div>
    </div>

    <div v-if="expError" class="lx-msg err">Couldn't load expeditions: {{ expError }}</div>

    <div class="trips-grid">
      <div class="trip-card" v-for="adv in adventures" :key="adv.documentId || adv.id">
        <div class="trip-img-wrap">
          <img v-if="adv.image" :src="adv.image" :alt="adv.title" class="trip-img" loading="lazy" />
          <span v-if="adv.difficulty" class="badge" :class="`badge-${adv.difficulty}`" style="position:absolute;top:12px;left:12px;">{{ adv.difficulty }}</span>
          <div v-if="adv.completionRate != null" class="trip-completion">{{ adv.completionRate }}% completion</div>
        </div>
        <div class="trip-body">
          <div class="trip-title">{{ adv.title }}</div>
          <div class="trip-meta">
            <span>⏱ {{ adv.duration }} {{ adv.durationUnit }}</span>
            <span>👥 Max {{ adv.maxGroup }}</span>
            <span v-if="adv.altitude">⛰ {{ adv.altitude }}</span>
          </div>

          <div class="trip-departures">
            <div class="td-label">Departures</div>
            <div v-if="!depsOf(adv).length" class="dep-empty">No departures — add one to go live.</div>
            <div class="dep-row" v-for="d in depsOf(adv).slice(0, showAll[adv.documentId] ? 50 : 4)" :key="d.date">
              <span class="dep-date">{{ fmt(d.date) }}</span>
              <span :class="{ 'spots-low': d.spotsLeft <= 3 }">{{ d.spotsLeft }} spots</span>
              <template v-if="d.exp?.status === 'active'">
                <span class="badge badge-live">● LIVE</span>
                <NuxtLink :to="{ path: '/tracking', query: { expedition: d.exp.documentId } }" class="btn btn-ghost btn-xs" target="_blank">View</NuxtLink>
                <button class="btn btn-ghost btn-xs" :disabled="busyKey === d.exp.documentId" @click="endExpedition(d.exp)">End</button>
              </template>
              <template v-else-if="d.exp?.status === 'completed'">
                <span class="badge badge-cancelled">ended</span>
              </template>
              <template v-else>
                <span class="badge" :class="d.isPast ? 'badge-cancelled' : 'badge-confirmed'">{{ d.isPast ? 'past' : (d.status || 'open') }}</span>
                <button
                  class="btn btn-primary btn-xs"
                  :disabled="busyKey === keyOf(adv, d)"
                  :title="d.isPast ? 'This date has passed — adjust it in Departures first' : 'Open live tracking for this departure'"
                  @click="goLive(adv, d)"
                >{{ busyKey === keyOf(adv, d) ? 'Starting…' : '▶ Go Live' }}</button>
              </template>
            </div>
            <button v-if="depsOf(adv).length > 4" class="dep-more" @click="showAll[adv.documentId] = !showAll[adv.documentId]">
              {{ showAll[adv.documentId] ? 'Show fewer' : `Show all ${depsOf(adv).length}` }}
            </button>
          </div>

          <div class="trip-pricing">
            <div class="price-row"><span>Essential</span><span>{{ money(adv.basePrice, adv.currency) }}</span></div>
            <div class="price-row"><span>Premium</span><span>{{ money(adv.premiumPrice, adv.currency) }}</span></div>
            <div class="price-row"><span>VIP</span><span>{{ money(adv.vipPrice, adv.currency) }}</span></div>
          </div>
          <div class="trip-actions">
            <button class="btn btn-primary btn-sm" @click="editing = adv">Edit Trip</button>
            <button class="btn btn-ghost btn-sm" @click="openDepartures(adv, true)">Add Departure</button>
            <button class="btn btn-ghost btn-sm" :disabled="!depsOf(adv).length" @click="openDepartures(adv, false)">Edit Dates</button>
            <button class="btn btn-ghost btn-sm" @click="reviewing = adv">View Reviews</button>
          </div>
        </div>
      </div>
    </div>

    <TripEditModal v-if="editing" :adventure="editing" @close="editing = null" @saved="onSaved('Trip saved and published.')" />
    <DeparturesModal
      v-if="departures.adv"
      :adventure="departures.adv"
      :expeditions="expsOf(departures.adv)"
      :add-new="departures.addNew"
      @close="departures.adv = null"
      @saved="onSaved('Departures saved.')"
    />
    <TripReviewsModal v-if="reviewing" :adventure="reviewing" @close="reviewing = null" @changed="refreshAdventures()" />
  </div>
</template>

<script setup>
// app/components/admin/sections/AdminTrips.vue
//
// Trips & departures. "Go Live" on a departure creates its live expedition
// if needed and starts it (opens public tracking and participant posting).
// All writes go through the admin-only /api/cms proxy.
import TripEditModal from '~/components/admin/TripEditModal.vue'
import DeparturesModal from '~/components/admin/DeparturesModal.vue'
import TripReviewsModal from '~/components/admin/TripReviewsModal.vue'

const { data: adventures, refresh: refreshAdventures } = await useAdventures()

// Every expedition (to show each departure's live state)
const { data: expeditions, error: expErr, refresh: refreshExp } = await useFetch('/api/cms/live-expeditions', {
  key: 'admin-live-expeditions-all',
  query: {
    'populate[adventure][fields][0]': 'title',
    sort: 'departureDate:desc',
    'pagination[pageSize]': 200,
  },
  transform: (res) => res?.data || [],
  default: () => [],
})
const expError = computed(() => expErr.value ? (expErr.value.data?.statusMessage || expErr.value.statusMessage || 'request failed') : '')

const day = (d) => String(d || '').slice(0, 10)
const todayKampala = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10)

const liveNow = computed(() => expeditions.value.filter(e => e.status === 'active'))
const expsOf = (adv) => expeditions.value.filter(e => e.adventure?.documentId === adv.documentId)

function depsOf(adv) {
  const today = todayKampala()
  const exps = expsOf(adv)
  return [...(adv.departures || [])]
    .map(d => {
      const sameDay = exps.filter(e => day(e.departureDate) === day(d.date))
      const exp = sameDay.find(e => e.status === 'active') || sameDay.find(e => e.status === 'upcoming') || sameDay[0] || null
      return { ...d, exp, isPast: day(d.date) < today }
    })
    // live first, then upcoming dates soonest-first, then past dates latest-first
    .sort((a, b) => {
      const rank = (x) => (x.exp?.status === 'active' ? 0 : x.isPast ? 2 : 1)
      if (rank(a) !== rank(b)) return rank(a) - rank(b)
      return rank(a) === 2 ? day(b.date).localeCompare(day(a.date)) : day(a.date).localeCompare(day(b.date))
    })
}

const showAll = reactive({})
const busyKey = ref(null)
const msg = ref(null)
const editing = ref(null)
const reviewing = ref(null)
const departures = reactive({ adv: null, addNew: false })

const keyOf = (adv, d) => `${adv.documentId}:${day(d.date)}`
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const money = (v, cur) => (v == null || v === '') ? '—' : `${cur || 'USD'} ${Number(v).toLocaleString()}`

function openDepartures(adv, addNew) {
  departures.adv = adv
  departures.addNew = addNew
}

async function onSaved(text) {
  editing.value = null
  departures.adv = null
  msg.value = { type: 'ok', text }
  await Promise.all([refreshAdventures(), refreshExp()])
}

async function goLive(adv, d) {
  const when = fmt(d.date)
  if (!window.confirm(`Go live with "${adv.title}" (${when}) now?\n\nPublic live tracking opens and confirmed participants can post from the trail.`)) return
  busyKey.value = keyOf(adv, d); msg.value = null
  try {
    await $fetch('/api/cms/live-expeditions/admin-start-departure', {
      method: 'POST',
      body: { adventure: adv.documentId, departureDate: day(d.date) },
    })
    msg.value = { type: 'ok', text: `"${adv.title}" (${when}) is now live.` }
    await refreshExp()
  } catch (e) {
    msg.value = { type: 'err', text: e?.data?.statusMessage || 'Could not go live.' }
  } finally {
    busyKey.value = null
  }
}

async function endExpedition(e) {
  const name = e.adventure?.title || e.batchLabel || 'this expedition'
  if (!window.confirm(`End "${name}"? Live tracking and participant posting will close.`)) return
  busyKey.value = e.documentId; msg.value = null
  try {
    await $fetch('/api/cms/live-expeditions/admin-status', { method: 'POST', body: { expedition: e.documentId, status: 'completed' } })
    msg.value = { type: 'ok', text: `"${name}" has ended.` }
    await refreshExp()
  } catch (err) {
    msg.value = { type: 'err', text: err?.data?.statusMessage || 'Could not end the expedition.' }
  } finally {
    busyKey.value = null
  }
}
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.trips-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.trip-card { background:var(--panel); border:1px solid var(--border); overflow:hidden; }
.trip-img-wrap { height:180px; position:relative; overflow:hidden; background:var(--charcoal); }
.trip-img { width:100%; height:100%; object-fit:cover; }
.trip-completion { position:absolute; bottom:10px; right:10px; background:rgba(10,10,8,0.85); font-family:var(--font-condensed); font-size:12px; color:var(--green-light); padding:4px 10px; }
.trip-body { padding:20px; }
.trip-title { font-family:var(--font-condensed); font-size:17px; font-weight:700; color:var(--text); margin-bottom:8px; }
.trip-meta { display:flex; gap:14px; flex-wrap:wrap; font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:14px; }
.td-label { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:8px; }
.dep-row { display:flex; gap:10px; align-items:center; padding:7px 0; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:13px; color:var(--light); flex-wrap:wrap; }
.dep-date { flex:1; min-width:96px; }
.dep-empty { font-family:var(--font-condensed); font-size:13px; color:var(--gray); padding:6px 0; }
.dep-more { background:none; border:none; color:var(--orange); font-family:var(--font-condensed); font-size:13px; cursor:pointer; padding:6px 0; }
.spots-low { color:var(--red)!important; font-weight:700; }
.btn-xs { padding:5px 10px; font-size:12px; letter-spacing:1px; }
.trip-pricing { margin-top:12px; background:var(--charcoal); padding:12px; }
.price-row { display:flex; justify-content:space-between; font-family:var(--font-condensed); font-size:13px; color:var(--light); padding:4px 0; }
.price-row span:last-child { color:var(--orange); font-weight:700; }
.trip-actions { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }

.lx-card { background:var(--panel); border:1px solid var(--border); border-left:3px solid var(--red); padding:16px 20px; margin-bottom:20px; }
.lx-live-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; padding:8px 0; font-family:var(--font-condensed); color:var(--light); }
.lx-live-row strong { color:var(--text); }
.lx-muted { font-size:13px; color:var(--gray); }
.lx-actions { display:flex; gap:6px; margin-left:auto; }
.lx-msg { padding:10px 14px; margin-bottom:16px; font-family:var(--font-condensed); font-size:14px; border:1px solid; }
.lx-msg.ok { color:var(--green-light); border-color:var(--green-light); }
.lx-msg.err { color:var(--red); border-color:var(--red); }
@media (max-width:800px) { .trips-grid { grid-template-columns:1fr; } }
</style>
