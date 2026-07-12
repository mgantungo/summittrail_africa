<!--app/components/dashboard/DashSummitPoints.vue-->
<template>
  <div>
    <div class="section-label">Loyalty Programme</div>
    <h2 class="sec-title">Summit Points</h2>

    <!-- Points hero -->
    <div class="points-hero">
      <div class="ph-left">
        <div class="ph-label">Your Balance</div>
        <div class="ph-points">{{ profile.summitPoints.toLocaleString() }}</div>
        <div class="ph-pts-label">SUMMIT POINTS</div>
        <div class="ph-level">{{ profile.level }}</div>
        <div class="ph-next" v-if="nextTier">
          <div class="ph-next-label">{{ nextTier.pts - profile.summitPoints }} pts to <strong>{{ nextTier.name }}</strong></div>
          <div class="ph-bar"><div class="ph-fill" :style="{ width: tierPct + '%' }" /></div>
        </div>
      </div>
      <div class="ph-right">
        <div class="tier-card" v-for="t in tiers" :key="t.name" :class="{ 'tier-active': profile.level === t.name }">
          <div class="tier-icon">{{ t.icon }}</div>
          <div class="tier-name">{{ t.name }}</div>
          <div class="tier-pts">{{ t.pts.toLocaleString() }}+ pts</div>
          <div class="tier-perk">{{ t.perk }}</div>
        </div>
      </div>
    </div>

    <!-- Point history -->
    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Points History</div>
      <div class="history-list">
        <div class="history-row" v-for="h in history" :key="h.id">
          <div class="h-icon">{{ h.icon }}</div>
          <div class="h-body">
            <div class="h-title">{{ h.title }}</div>
            <div class="h-date">{{ h.date }}</div>
          </div>
          <div class="h-pts" :class="h.pts > 0 ? 'h-earn' : 'h-spend'">
            {{ h.pts > 0 ? '+' : '' }}{{ h.pts.toLocaleString() }} pts
          </div>
        </div>
      </div>
    </div>

    <!-- Redeem section -->
    <div class="dash-card">
      <div class="section-label">Redeem Points</div>
      <div class="redeem-grid">
        <div class="redeem-card" v-for="r in redeemOptions" :key="r.name">
          <div class="re-icon">{{ r.icon }}</div>
          <div class="re-name">{{ r.name }}</div>
          <div class="re-pts">{{ r.pts.toLocaleString() }} pts</div>
          <button class="btn btn-sm" :class="profile.summitPoints >= r.pts ? 'btn-primary' : 'btn-ghost'" :disabled="profile.summitPoints < r.pts">
            {{ profile.summitPoints >= r.pts ? 'Redeem' : 'Not enough points' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()
const tiers = [
  { name:'Trail Starter',  icon:'🥾', pts:0,    perk:'5% early access' },
  { name:'Peak Climber',   icon:'⛰️',  pts:1000, perk:'10% discount + priority booking' },
  { name:'Elite Explorer', icon:'🏔️', pts:2500, perk:'15% off + free upgrade' },
  { name:'Summit Legend',  icon:'🦅', pts:5000, perk:'20% off + VIP concierge' },
]
const nextTier   = computed(() => tiers.find(t => t.pts > profile.summitPoints))
const tierPct    = computed(() => {
  const curr = tiers.slice().reverse().find(t => t.pts <= profile.summitPoints)
  if (!curr || !nextTier.value) return 100
  return Math.round((profile.summitPoints - curr.pts) / (nextTier.value.pts - curr.pts) * 100)
})
const history = [
  { id:1, icon:'🗺️', title:'Rwenzori 72-Hour Survival — Completed',   date:'Apr 2025', pts:800 },
  { id:2, icon:'⭐', title:'Left a verified review',                   date:'Apr 2025', pts:50  },
  { id:3, icon:'📱', title:'Referral bonus — James O.',                date:'Mar 2025', pts:200 },
  { id:4, icon:'🗺️', title:'Kidepo Valley Convoy — Completed',        date:'Jan 2025', pts:600 },
  { id:5, icon:'🎁', title:'Redeemed: $50 trip credit',               date:'Dec 2024', pts:-500 },
  { id:6, icon:'🗺️', title:'Nile Source Overland — Completed',        date:'Nov 2024', pts:400 },
  { id:7, icon:'📝', title:'Profile completion bonus',                 date:'Jun 2023', pts:100 },
]
const redeemOptions = [
  { icon:'💵', name:'$25 Trip Credit',    pts:500  },
  { icon:'💵', name:'$50 Trip Credit',    pts:1000 },
  { icon:'🎒', name:'Gear Kit Upgrade',   pts:1500 },
  { icon:'🆙', name:'Package Upgrade',    pts:2000 },
  { icon:'✈️', name:'Free Group Add-on',  pts:3000 },
  { icon:'🏆', name:'Full VIP Upgrade',   pts:5000 },
]
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.points-hero { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; background:var(--panel); border:1px solid var(--border); overflow:hidden; }
.ph-left { padding:32px; background:linear-gradient(135deg, rgba(232,98,42,0.12) 0%, transparent 100%); }
.ph-label  { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--gray); margin-bottom:8px; }
.ph-points { font-family:var(--font-display); font-size:72px; color:var(--orange); line-height:1; }
.ph-pts-label { font-family:var(--font-condensed); font-size:13px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--muted); margin-bottom:12px; }
.ph-level  { display:inline-block; font-family:var(--font-condensed); font-size:14px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gold); background:rgba(212,168,67,0.1); border:1px solid var(--gold); padding:6px 16px; margin-bottom:20px; }
.ph-next-label { font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:8px; }
.ph-bar  { height:4px; background:var(--muted); } .ph-fill { height:100%; background:var(--orange); transition:width .6s; }
.ph-right { display:grid; grid-template-columns:repeat(2,1fr); gap:0; }
.tier-card { padding:20px; border-left:1px solid var(--border); border-bottom:1px solid var(--border); }
.tier-card:nth-child(odd) { border-left:none; }
.tier-active { background:rgba(232,98,42,0.06); }
.tier-icon { font-size:24px; margin-bottom:6px; }
.tier-name { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:2px; }
.tier-pts  { font-family:var(--font-condensed); font-size:12px; color:var(--orange); margin-bottom:4px; }
.tier-perk { font-size:12px; color:var(--gray); line-height:1.4; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:16px; }
.history-list { display:flex; flex-direction:column; gap:2px; }
.history-row { display:flex; align-items:center; gap:14px; padding:13px; background:var(--charcoal); border:1px solid var(--border); }
.h-icon  { font-size:20px; width:32px; text-align:center; flex-shrink:0; }
.h-body  { flex:1; }
.h-title { font-family:var(--font-condensed); font-size:14px; font-weight:600; color:var(--text); }
.h-date  { font-family:var(--font-condensed); font-size:12px; color:var(--gray); margin-top:2px; }
.h-pts   { font-family:var(--font-display); font-size:20px; flex-shrink:0; }
.h-earn  { color:var(--green-light); } .h-spend { color:var(--red); }
.redeem-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.redeem-card { background:var(--charcoal); border:1px solid var(--border); padding:20px; text-align:center; }
.re-icon { font-size:28px; margin-bottom:8px; }
.re-name { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; }
.re-pts  { font-family:var(--font-condensed); font-size:13px; color:var(--orange); margin-bottom:12px; }
@media (max-width:800px) { .points-hero { grid-template-columns:1fr; } .redeem-grid { grid-template-columns:repeat(2,1fr); } }
</style>
