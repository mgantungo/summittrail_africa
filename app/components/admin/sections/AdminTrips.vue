<template>
  <div>
    <div class="section-label">Expedition Management</div>
    <h2 class="as-title">Trips & Departures</h2>

    <!-- Live expeditions: start (go live) / end -->
    <div class="lx-card">
      <div class="lx-hdr">
        <div>
          <div class="td-label">Live Expeditions</div>
          <div class="lx-sub">Starting an expedition opens live tracking and lets confirmed participants post from the trail.</div>
        </div>
        <button class="btn btn-ghost btn-sm" :disabled="expPending" @click="refreshExp()">↻ Refresh</button>
      </div>

      <div v-if="lxMsg" class="lx-msg" :class="lxMsg.type">{{ lxMsg.text }}</div>

      <div v-if="expPending && !expeditions.length" class="lx-empty">Loading…</div>
      <div v-else-if="!expeditions.length" class="lx-empty">No upcoming or live expeditions. Create one in Data Intake.</div>
      <table v-else class="lx-table">
        <thead>
          <tr><th>Expedition</th><th>Departure</th><th>Guide</th><th>Participants</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="e in expeditions" :key="e.documentId">
            <td>
              <strong>{{ e.adventure?.title || e.batchLabel || 'Expedition' }}</strong>
              <div v-if="e.batchLabel && e.adventure?.title" class="lx-muted">{{ e.batchLabel }}</div>
            </td>
            <td>
              {{ e.departureDate ? fmt(e.departureDate) : '—' }}
              <div v-if="e.status === 'active' && e.currentDay" class="lx-muted">Day {{ e.currentDay }}{{ e.totalDays ? ` of ${e.totalDays}` : '' }}</div>
            </td>
            <td>{{ e.guide?.name || '—' }}</td>
            <td style="text-align:center;">{{ e.participants ?? 0 }}{{ e.maxParticipants ? ` / ${e.maxParticipants}` : '' }}</td>
            <td>
              <span class="badge" :class="e.status === 'active' ? 'badge-live' : 'badge-pending'">{{ e.status === 'active' ? 'LIVE' : 'upcoming' }}</span>
            </td>
            <td class="lx-actions">
              <template v-if="e.status === 'upcoming'">
                <button class="btn btn-primary btn-sm" :disabled="busyId === e.documentId" @click="setStatus(e, 'active')">
                  {{ busyId === e.documentId ? 'Starting…' : '▶ Start / Go Live' }}
                </button>
              </template>
              <template v-else>
                <NuxtLink :to="{ path: '/tracking', query: { expedition: e.documentId } }" class="btn btn-ghost btn-sm" target="_blank">View</NuxtLink>
                <button class="btn btn-ghost btn-sm" :disabled="busyId === e.documentId" @click="setStatus(e, 'completed')">
                  {{ busyId === e.documentId ? 'Ending…' : '■ End' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="trips-grid">
      <div class="trip-card" v-for="adv in adventures" :key="adv.id">
        <div class="trip-img-wrap">
          <img :src="adv.image" :alt="adv.title" class="trip-img" loading="lazy" />
          <span class="badge" :class="`badge-${adv.difficulty}`" style="position:absolute;top:12px;left:12px;">{{ adv.difficulty }}</span>
          <div class="trip-completion">{{ adv.completionRate }}% completion</div>
        </div>
        <div class="trip-body">
          <div class="trip-title">{{ adv.title }}</div>
          <div class="trip-meta">
            <span>⏱ {{ adv.duration }} {{ adv.durationUnit }}</span>
            <span>👥 Max {{ adv.maxGroup }}</span>
            <span>⛰ {{ adv.altitude }}</span>
          </div>
          <div class="trip-departures">
            <div class="td-label">Upcoming Departures</div>
            <div class="dep-row" v-for="d in adv.departures.slice(0,3)" :key="d.date">
              <span>{{ fmt(d.date) }}</span>
              <span :class="{ 'spots-low': d.spotsLeft <= 3 }">{{ d.spotsLeft }} spots</span>
              <span class="badge" :class="d.spotsLeft <= 3 ? 'badge-extreme' : 'badge-confirmed'">
                {{ d.status }}
              </span>
            </div>
          </div>
          <div class="trip-pricing">
            <div class="price-row"><span>Essential</span><span>${{ adv.basePrice }}</span></div>
            <div class="price-row"><span>Premium</span><span>${{ adv.premiumPrice }}</span></div>
            <div class="price-row"><span>VIP</span><span>${{ adv.vipPrice }}</span></div>
          </div>
          <div class="trip-actions">
            <button class="btn btn-primary btn-sm">Edit Trip</button>
            <button class="btn btn-ghost btn-sm">Add Departure</button>
            <button class="btn btn-ghost btn-sm">View Reviews</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// app/components/admin/sections/AdminTrips.vue
const { data: adventures } = await useAdventures()

// ── Live expeditions (via the admin-only /api/cms proxy) ──────────────────
const { data: expeditions, pending: expPending, refresh: refreshExp } = await useFetch('/api/cms/live-expeditions', {
  key: 'admin-live-expeditions',
  query: {
    'filters[status][$in][0]': 'upcoming',
    'filters[status][$in][1]': 'active',
    'populate[adventure][fields][0]': 'title',
    'populate[guide][fields][0]': 'name',
    sort: 'departureDate:asc',
    'pagination[pageSize]': 100,
  },
  transform: (res) => (res?.data || []).sort((a, b) => (a.status === 'active' ? -1 : 0) - (b.status === 'active' ? -1 : 0)),
  default: () => [],
})

const busyId = ref(null)
const lxMsg = ref(null)

async function setStatus(e, status) {
  const name = e.adventure?.title || e.batchLabel || 'this expedition'
  const ask = status === 'active'
    ? `Start "${name}" now? Live tracking opens to the public and confirmed participants can post updates.`
    : `End "${name}"? Live tracking and participant posting will close.`
  if (!window.confirm(ask)) return
  busyId.value = e.documentId
  lxMsg.value = null
  try {
    await $fetch('/api/cms/live-expeditions/admin-status', {
      method: 'POST',
      body: { expedition: e.documentId, status },
    })
    lxMsg.value = { type: 'ok', text: status === 'active' ? `"${name}" is now live.` : `"${name}" has ended.` }
    await refreshExp()
  } catch (err) {
    lxMsg.value = { type: 'err', text: err?.data?.statusMessage || 'Could not update the expedition.' }
  } finally {
    busyId.value = null
  }
}
const fmt = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.trips-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.trip-card { background:var(--panel); border:1px solid var(--border); overflow:hidden; }
.trip-img-wrap { height:180px; position:relative; overflow:hidden; }
.trip-img { width:100%; height:100%; object-fit:cover; }
.trip-completion { position:absolute; bottom:10px; right:10px; background:rgba(10,10,8,0.85); font-family:var(--font-condensed); font-size:12px; color:var(--green-light); padding:4px 10px; }
.trip-body { padding:20px; }
.trip-title { font-family:var(--font-condensed); font-size:17px; font-weight:700; color:var(--text); margin-bottom:8px; }
.trip-meta { display:flex; gap:14px; flex-wrap:wrap; font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:14px; }
.td-label { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:8px; }
.dep-row { display:flex; gap:12px; align-items:center; padding:6px 0; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:13px; color:var(--light); }
.dep-row span:first-child { flex:1; }
.spots-low { color:var(--red)!important; font-weight:700; }
.trip-pricing { margin-top:12px; background:var(--charcoal); padding:12px; }
.price-row { display:flex; justify-content:space-between; font-family:var(--font-condensed); font-size:13px; color:var(--light); padding:4px 0; }
.price-row span:last-child { color:var(--orange); font-weight:700; }
.trip-actions { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }

.lx-card { background:var(--panel); border:1px solid var(--border); padding:20px; margin-bottom:24px; overflow-x:auto; }
.lx-hdr { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; }
.lx-sub { font-size:13px; color:var(--gray); }
.lx-empty { padding:20px 0; color:var(--gray); font-family:var(--font-condensed); }
.lx-msg { padding:10px 14px; margin-bottom:12px; font-family:var(--font-condensed); font-size:14px; border:1px solid; }
.lx-msg.ok { color:var(--green-light); border-color:var(--green-light); }
.lx-msg.err { color:var(--red); border-color:var(--red); }
.lx-table { width:100%; border-collapse:collapse; }
.lx-table th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:10px 12px; border-bottom:1px solid var(--border); white-space:nowrap; }
.lx-table td { padding:12px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); vertical-align:top; }
.lx-table td strong { color:var(--text); }
.lx-muted { font-size:12px; color:var(--gray); }
.lx-actions { display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap; }
@media (max-width:800px) { .trips-grid { grid-template-columns:1fr; } }
</style>
