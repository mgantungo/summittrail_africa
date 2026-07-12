<!--app/pages/dashboard/loyalty.vue-->
<template>
  <div class="loyalty-page" style="padding-top:72px;">
    <div class="dash-layout">
      <aside class="dash-sidebar">
        <div class="dash-user">
          <img :src="profile.user?.avatar" :alt="profile.displayName" class="dash-avatar" />
          <div class="dash-name">{{ profile.displayName }}</div>
          <div class="dash-level">{{ profile.level }}</div>
        </div>
        <ul class="dash-nav">
          <li><NuxtLink to="/dashboard" class="dash-nav-link">📋 My Trips</NuxtLink></li>
          <li><NuxtLink to="/dashboard/loyalty" class="dash-nav-link active">🏆 Summit Points</NuxtLink></li>
          <li><NuxtLink to="/dashboard/profile" class="dash-nav-link">👤 Profile</NuxtLink></li>
        </ul>
      </aside>
      <main class="dash-main">
        <div class="section-label">Summit Points</div>
        <h1 class="section-title" style="font-size:40px; margin-bottom:32px;">The More You <span>Explore</span>,<br>The More You Earn.</h1>

        <!-- Points ring + card -->
        <div class="loyalty-layout">
          <div class="loyalty-tiers">
            <div class="tier-card" v-for="tier in tiers" :key="tier.name" :class="{ current: tier.name === profile.level }">
              <div class="tier-icon">{{ tier.icon }}</div>
              <div>
                <div class="tier-name">{{ tier.name }}{{ tier.name === profile.level ? ' ← You' : '' }}</div>
                <div class="tier-desc">{{ tier.desc }}</div>
              </div>
              <div class="tier-pts">{{ tier.pts }}+ pts</div>
            </div>
          </div>
          <div class="loyalty-card">
            <div class="section-label">Your Balance</div>
            <div class="points-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--muted)" stroke-width="8"/>
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--gold)" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="377" :stroke-dashoffset="377 - (progress / 100 * 377)"
                  style="transform:rotate(-90deg); transform-origin:center; transition:stroke-dashoffset 1s;"
                />
              </svg>
              <div class="points-center">
                <div class="points-val">{{ profile.summitPoints.toLocaleString() }}</div>
                <div class="points-sub">Summit Points</div>
              </div>
            </div>
            <div style="font-family:var(--font-condensed); font-size:13px; color:var(--gray); text-align:center; margin-bottom:16px;">
              {{ pointsToNext.toLocaleString() }} pts to unlock {{ nextLevel }}
            </div>
            <div class="progress-bar"><div class="progress-fill" :style="{ width: progress + '%' }" /></div>

            <div class="section-label" style="margin-top:28px; margin-bottom:12px;">Redeem Points</div>
            <ul class="rewards-list">
              <li v-for="r in rewards" :key="r.label" class="reward-item">
                <span>{{ r.icon }} {{ r.label }}</span>
                <span class="reward-pts">{{ r.pts }} pts</span>
              </li>
            </ul>
            <button class="btn btn-primary btn-full" style="margin-top:16px;" @click="redeem">Redeem Points</button>
          </div>
        </div>

        <!-- Points history -->
        <div style="margin-top:40px;">
          <div class="section-label" style="margin-bottom:16px;">Points History</div>
          <div class="history-table">
            <div class="ht-header">
              <span>Activity</span><span>Date</span><span>Points</span>
            </div>
            <div class="ht-row" v-for="h in history" :key="h.id">
              <span class="ht-label">{{ h.label }}</span>
              <span class="ht-date">{{ h.date }}</span>
              <span class="ht-pts" :class="h.type">{{ h.type === 'earn' ? '+' : '-' }}{{ h.pts }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'

const profile = useProfileStore()
useHead({ title: 'Summit Points – Dashboard' })

const tiers = [
  { icon: '🥉', name: 'Trail Starter', pts: 0, desc: 'First adventure unlocked.' },
  { icon: '🥈', name: 'Peak Seeker', pts: 500, desc: '5% discount + priority booking.' },
  { icon: '🥇', name: 'Elite Explorer', pts: 2000, desc: '10% off + free gear rental on $600+ trips.' },
  { icon: '👑', name: 'Summit Legend', pts: 5000, desc: '15% off + private discounts + ambassador.' },
]

const rewards = [
  { icon: '🎒', label: 'Free Gear Rental', pts: 500 },
  { icon: '✈️', label: 'Airport Transfer Credit', pts: 300 },
  { icon: '💰', label: '$50 Trip Discount', pts: 800 },
  { icon: '📸', label: 'Photography Package', pts: 1200 },
  { icon: '🏆', label: 'VIP Private Upgrade', pts: 2500 },
]

const history = [
  { id: 1, label: 'Completed: Rwenzori Survival', date: 'Mar 2025', pts: 890, type: 'earn' },
  { id: 2, label: 'Left a review', date: 'Mar 2025', pts: 50, type: 'earn' },
  { id: 3, label: 'Referred a friend', date: 'Feb 2025', pts: 200, type: 'earn' },
  { id: 4, label: 'Redeemed: Free gear rental', date: 'Feb 2025', pts: 500, type: 'redeem' },
  { id: 5, label: 'Completed: Nile Overland', date: 'Jan 2025', pts: 420, type: 'earn' },
]

const progress = computed(() => {
  const pts = profile.summitPoints
  if (pts >= 5000) return 100
  if (pts >= 2000) return 40 + ((pts - 2000) / 3000) * 60
  if (pts >= 500) return 10 + ((pts - 500) / 1500) * 30
  return (pts / 500) * 10
})

const nextLevel = computed(() => {
  const pts = profile.summitPoints
  if (pts >= 5000) return 'Max Level'
  if (pts >= 2000) return 'Summit Legend'
  if (pts >= 500) return 'Elite Explorer'
  return 'Peak Seeker'
})

const pointsToNext = computed(() => {
  const pts = profile.summitPoints
  if (pts >= 5000) return 0
  if (pts >= 2000) return 5000 - pts
  if (pts >= 500) return 2000 - pts
  return 500 - pts
})

function redeem() {
  alert('Redemption portal coming soon!')
}
</script>

<style scoped>
.loyalty-page { background: var(--charcoal); min-height: 100vh; }
.dash-layout { display: grid; grid-template-columns: 240px 1fr; }
.dash-sidebar { background: var(--panel); border-right: 1px solid var(--border); }
.dash-user { padding: 28px 20px; border-bottom: 1px solid var(--border); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.dash-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 3px solid var(--orange); }
.dash-name { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--text); }
.dash-level { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); }
.dash-nav { list-style: none; }
.dash-nav-link { display: flex; align-items: center; gap: 10px; padding: 14px 20px; font-family: var(--font-condensed); font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); border: none; background: none; cursor: pointer; border-left: 3px solid transparent; transition: all .2s; text-decoration: none; width: 100%; }
.dash-nav-link:hover { color: var(--text); }
.dash-nav-link.active { color: var(--orange); border-left-color: var(--orange); background: rgba(232,98,42,0.06); }
.dash-main { padding: 40px; }

.loyalty-layout { display: grid; grid-template-columns: 1fr 360px; gap: 40px; }
.loyalty-tiers { display: flex; flex-direction: column; gap: 12px; }
.tier-card { display: grid; grid-template-columns: 60px 1fr auto; gap: 16px; align-items: center; padding: 20px; border: 1px solid var(--border); background: var(--panel); transition: all .2s; }
.tier-card.current { border-color: var(--gold); background: rgba(212,168,67,0.05); }
.tier-icon { font-size: 36px; text-align: center; }
.tier-name { font-family: var(--font-display); font-size: 24px; color: var(--text); }
.tier-card.current .tier-name { color: var(--gold); }
.tier-desc { font-size: 13px; color: var(--gray); margin-top: 4px; }
.tier-pts { font-family: var(--font-display); font-size: 20px; color: var(--gray); white-space: nowrap; }
.tier-card.current .tier-pts { color: var(--gold); }

.loyalty-card { background: var(--panel); border: 1px solid var(--border); padding: 32px; position: sticky; top: 90px; }
.points-ring { width: 140px; height: 140px; position: relative; margin: 0 auto 16px; }
.points-ring svg { width: 100%; height: 100%; }
.points-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.points-val { font-family: var(--font-display); font-size: 38px; color: var(--gold); line-height: 1; }
.points-sub { font-family: var(--font-condensed); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }
.progress-bar { height: 6px; background: var(--muted); }
.progress-fill { height: 100%; background: var(--gold); transition: width 1s; }
.rewards-list { list-style: none; }
.reward-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.reward-pts { font-weight: 700; color: var(--gold); }

.history-table { border: 1px solid var(--border); }
.ht-header { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; padding: 12px 20px; background: var(--black); font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }
.ht-row { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; padding: 14px 20px; border-top: 1px solid var(--border); align-items: center; }
.ht-label { font-family: var(--font-condensed); font-size: 14px; color: var(--text); }
.ht-date { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.ht-pts { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; min-width: 70px; text-align: right; }
.ht-pts.earn { color: var(--green-light); }
.ht-pts.redeem { color: var(--red); }

@media (max-width: 900px) {
  .dash-layout { grid-template-columns: 1fr; }
  .loyalty-layout { grid-template-columns: 1fr; }
  .loyalty-card { position: static; }
  .tier-card { grid-template-columns: 48px 1fr auto; }
}
</style>
