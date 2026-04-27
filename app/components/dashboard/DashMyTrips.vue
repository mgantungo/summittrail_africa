<template>
  <div>
    <div class="section-label">Your Expeditions</div>
    <h2 class="sec-title">My Trips</h2>

    <!-- Upcoming trip hero -->
    <div class="upcoming-card" v-if="upcomingBooking">
      <img :src="upcomingAdventure?.image" :alt="upcomingAdventure?.title" class="upcoming-img" loading="lazy" />
      <div class="upcoming-body">
        <span class="badge badge-confirmed">✓ Confirmed</span>
        <h3 class="upcoming-title">{{ upcomingAdventure?.title }}</h3>
        <div class="upcoming-meta">
          <span>📅 {{ fmt(upcomingBooking.departure) }}</span>
          <span>👥 {{ upcomingBooking.participants }} participants</span>
          <span>🧭 Guide: Samuel K.</span>
        </div>
        <div class="countdown">
          <div class="cd-unit"><div class="cd-num">{{ cd.days }}</div><div class="cd-label">Days</div></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><div class="cd-num">{{ cd.hours }}</div><div class="cd-label">Hours</div></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><div class="cd-num">{{ cd.mins }}</div><div class="cd-label">Mins</div></div>
        </div>
        <div class="upcoming-actions">
          <NuxtLink to="/tracking" class="btn btn-primary btn-sm">📍 Live Tracking</NuxtLink>
          <button class="btn btn-ghost btn-sm" @click="$emit('go','documents')">📄 Documents</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-card">
      <div class="empty-icon">🏔️</div>
      <p class="empty-text">No upcoming trips yet.</p>
      <NuxtLink to="/adventures" class="btn btn-primary btn-sm">Browse Adventures</NuxtLink>
    </div>

    <!-- Prep checklist -->
    <div class="two-col" v-if="upcomingBooking">
      <div class="dash-card">
        <div class="section-label">Preparation Checklist</div>
        <div class="checklist-progress">
          <div class="cl-bar"><div class="cl-fill" :style="{ width: checkPct + '%' }" /></div>
          <span class="cl-pct">{{ doneCount }}/{{ checklist.length }} complete</span>
        </div>
        <ul class="checklist">
          <li v-for="item in checklist" :key="item.id" class="cl-item" :class="{ done: item.done }" @click="item.done = !item.done">
            <div class="cl-box" :class="{ checked: item.done }">{{ item.done ? '✓' : '' }}</div>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>

      <div class="dash-card">
        <div class="section-label">Smart Reminders</div>
        <div class="reminder" v-for="r in reminders" :key="r.id" :class="`reminder-${r.type}`">
          <div class="reminder-icon">{{ r.icon }}</div>
          <div>
            <div class="reminder-title">{{ r.title }}</div>
            <div class="reminder-text">{{ r.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- All bookings -->
    <div class="dash-card" style="margin-top:0;">
      <div class="section-label">All Bookings</div>
      <div class="bookings-list">
        <div class="booking-row" v-for="b in userBookings" :key="b.id">
          <img :src="getAdv(b.adventure)?.image" :alt="b.adventure" class="bk-img" loading="lazy" />
          <div class="bk-body">
            <div class="bk-title">{{ getAdv(b.adventure)?.title || b.adventure }}</div>
            <div class="bk-meta">{{ fmt(b.departure) }} · {{ b.participants }} people · {{ b.package }} package</div>
          </div>
          <div class="bk-right">
            <div class="bk-total">${{ b.total.toLocaleString() }}</div>
            <span class="badge" :class="`badge-${statusCls(b.status)}`">{{ b.status }}</span>
          </div>
        </div>
        <div v-if="!userBookings.length" class="empty-sm">No booking history found.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { adventures, demoBookings } from '~~/data/demo.js'
import { useProfileStore } from '~/stores/profile'

defineEmits(['go'])
const profile = useProfileStore()

const upcomingBooking  = demoBookings.find(b => b.status === 'confirmed') || demoBookings[0]
const upcomingAdventure = adventures.find(a => a.id === upcomingBooking?.adventure)
const userBookings = demoBookings

const cd = reactive({ days: '00', hours: '00', mins: '00' })
function tick() {
  if (!upcomingBooking) return
  const diff = new Date(upcomingBooking.departure) - new Date()
  if (diff <= 0) return
  cd.days  = String(Math.floor(diff / 86400000)).padStart(2,'0')
  cd.hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0')
  cd.mins  = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0')
}
onMounted(() => { tick(); setInterval(tick, 60000) })

const checklist = reactive([
  { id:1, label:'Upload Passport / National ID', done:true },
  { id:2, label:'Sign Digital Waiver', done:true },
  { id:3, label:'Complete Payment', done:true },
  { id:4, label:'Download Offline Maps', done:false },
  { id:5, label:'Confirm Fitness Level', done:false },
  { id:6, label:'Pack Approved Gear List', done:false },
])
const doneCount = computed(() => checklist.filter(i => i.done).length)
const checkPct  = computed(() => Math.round(doneCount.value / checklist.length * 100))

const reminders = [
  { id:1, type:'orange', icon:'🎒', title:'Gear Reminder', text:'Download the packing list and confirm your gear is ready.' },
  { id:2, type:'gold',   icon:'🌤️', title:'Weather Update', text:'Clear skies expected for your departure. Peak: 95% clear.' },
  { id:3, type:'green',  icon:'👥', title:'Group Update',   text:'6 of 8 spots confirmed. Your team is forming.' },
]

const getAdv = (id) => adventures.find(a => a.id === id)
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : ''
const statusCls = (s) => s==='confirmed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.upcoming-card { display:grid; grid-template-columns:360px 1fr; gap:0; background:var(--panel); border:1px solid var(--border); overflow:hidden; margin-bottom:20px; }
.upcoming-img  { width:100%; height:100%; object-fit:cover; min-height:260px; }
.upcoming-body { padding:28px; display:flex; flex-direction:column; gap:14px; }
.upcoming-title { font-family:var(--font-display); font-size:28px; color:var(--text); line-height:1.1; }
.upcoming-meta  { display:flex; gap:16px; flex-wrap:wrap; font-family:var(--font-condensed); font-size:14px; color:var(--light); }
.countdown { display:flex; align-items:center; gap:8px; }
.cd-unit   { text-align:center; background:var(--charcoal); border:1px solid var(--border); padding:10px 16px; }
.cd-num    { font-family:var(--font-display); font-size:32px; color:var(--orange); line-height:1; }
.cd-label  { font-family:var(--font-condensed); font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-top:2px; }
.cd-sep    { font-family:var(--font-display); font-size:28px; color:var(--muted); }
.upcoming-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:auto; }
.empty-card { text-align:center; padding:60px 24px; background:var(--panel); border:1px solid var(--border); margin-bottom:20px; }
.empty-icon { font-size:48px; margin-bottom:12px; }
.empty-text { color:var(--gray); margin-bottom:16px; font-size:15px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; }
.checklist-progress { margin-bottom:16px; }
.cl-bar  { height:4px; background:var(--muted); margin-bottom:8px; }
.cl-fill { height:100%; background:var(--orange); transition:width .6s; }
.cl-pct  { font-family:var(--font-condensed); font-size:12px; color:var(--gray); }
.checklist { list-style:none; display:flex; flex-direction:column; gap:2px; }
.cl-item  { display:flex; align-items:center; gap:12px; padding:10px 12px; cursor:pointer; border:1px solid transparent; transition:all .15s; font-family:var(--font-condensed); font-size:14px; color:var(--light); }
.cl-item:hover { background:rgba(255,255,255,0.02); border-color:var(--border); }
.cl-item.done { color:var(--gray); text-decoration:line-through; }
.cl-box { width:18px; height:18px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
.cl-box.checked { background:var(--green-light); border-color:var(--green-light); color:#fff; font-weight:700; }
.reminder { display:flex; gap:14px; padding:14px; border-left:3px solid transparent; margin-bottom:10px; background:rgba(255,255,255,0.02); }
.reminder-orange { border-left-color:var(--orange); }
.reminder-gold   { border-left-color:var(--gold); }
.reminder-green  { border-left-color:var(--green-light); }
.reminder-icon  { font-size:22px; flex-shrink:0; }
.reminder-title { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:3px; }
.reminder-text  { font-size:13px; color:var(--gray); line-height:1.5; }
.bookings-list { display:flex; flex-direction:column; gap:10px; }
.booking-row { display:flex; align-items:center; gap:14px; padding:14px; background:var(--charcoal); border:1px solid var(--border); }
.bk-img   { width:64px; height:64px; object-fit:cover; flex-shrink:0; }
.bk-body  { flex:1; }
.bk-title { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px; }
.bk-meta  { font-family:var(--font-condensed); font-size:13px; color:var(--gray); }
.bk-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
.bk-total { font-family:var(--font-condensed); font-size:16px; font-weight:700; color:var(--orange); }
.empty-sm { font-family:var(--font-condensed); font-size:14px; color:var(--gray); padding:24px 0; text-align:center; }
@media (max-width:800px) {
  .upcoming-card { grid-template-columns:1fr; }
  .upcoming-img { height:200px; min-height:unset; }
  .two-col { grid-template-columns:1fr; }
}
</style>
