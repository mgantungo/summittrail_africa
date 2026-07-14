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
          <div class="ph-next-label">{{ nextTier.minPoints - profile.summitPoints }} pts to <strong>{{ nextTier.name }}</strong></div>
          <div class="ph-bar"><div class="ph-fill" :style="{ width: tierPct + '%' }" /></div>
        </div>
      </div>
      <div class="ph-right">
        <div class="tier-card" v-for="t in tiers" :key="t.name" :class="{ 'tier-active': profile.level === t.name }">
          <div class="tier-icon">{{ t.icon }}</div>
          <div class="tier-name">{{ t.name }}</div>
          <div class="tier-pts">{{ t.minPoints.toLocaleString() }}+ pts</div>
          <div class="tier-perk">{{ t.perk }}</div>
        </div>
      </div>
    </div>

    <!-- Point history -->
    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Points History</div>
      <div class="history-list">
        <div class="history-row" v-for="h in history" :key="h.id">
          <div class="h-icon">{{ historyIcon(h.type) }}</div>
          <div class="h-body">
            <div class="h-title">{{ h.reason }}</div>
            <div class="h-date">{{ fmt(h.transactionDate) }}</div>
          </div>
          <div class="h-pts" :class="h.points > 0 ? 'h-earn' : 'h-spend'">
            {{ h.points > 0 ? '+' : '' }}{{ h.points.toLocaleString() }} pts
          </div>
        </div>
        <div v-if="!history.length" class="empty-sm">No point activity yet.</div>
      </div>
    </div>

    <!-- Redeem section -->
    <div class="dash-card">
      <div class="section-label">Redeem Points</div>
      <div class="redeem-grid">
        <div class="redeem-card" v-for="r in redeemOptions" :key="r.name">
          <div class="re-icon">{{ r.icon }}</div>
          <div class="re-name">{{ r.name }}</div>
          <div class="re-pts">{{ r.pointsCost.toLocaleString() }} pts</div>
          <button class="btn btn-sm" :class="profile.summitPoints >= r.pointsCost ? 'btn-primary' : 'btn-ghost'" :disabled="profile.summitPoints < r.pointsCost">
            {{ profile.summitPoints >= r.pointsCost ? 'Redeem' : 'Not enough points' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()

const customerEmail = computed(() => profile.user?.email)
const { data: tiers }         = await useLoyaltyTiers()
const { data: redeemOptions } = await useRedeemOptions()
const { data: history }       = await useSummitPointTransactions(customerEmail)

const nextTier = computed(() => tiers.value.find(t => t.minPoints > profile.summitPoints))
const tierPct  = computed(() => {
  const curr = tiers.value.slice().reverse().find(t => t.minPoints <= profile.summitPoints)
  if (!curr || !nextTier.value) return 100
  return Math.round((profile.summitPoints - curr.minPoints) / (nextTier.value.minPoints - curr.minPoints) * 100)
})

const TYPE_ICONS = { earned: '🗺️', bonus: '📱', redeemed: '🎁', expired: '⌛' }
const historyIcon = (type) => TYPE_ICONS[type] || '⭐'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
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
