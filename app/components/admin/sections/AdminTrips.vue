<!--app/components/admin/sections/AdminTrips.vue-->
<template>
  <div>
    <div class="section-label">Expedition Management</div>
    <h2 class="as-title">Trips & Departures</h2>

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
import { adventures } from '~~/data/demo.js'
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
@media (max-width:800px) { .trips-grid { grid-template-columns:1fr; } }
</style>
