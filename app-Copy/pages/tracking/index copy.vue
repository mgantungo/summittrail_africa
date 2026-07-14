<template>
  <div class="tracking-page" style="padding-top:72px;">

    <!-- ── PAGE HEADER ───────────────────────────── -->
    <div class="tp-header section">
      <div class="tph-left">
        <div class="section-label">Live Now</div>
        <h1 class="section-title">Active<br><span>Expeditions</span></h1>
        <p class="section-sub">Real-time tracking of all expeditions currently in the field. Follow checkpoints, view live updates, and share the journey.</p>
      </div>
      <div class="tph-stats">
        <div class="tph-stat" v-for="s in headerStats" :key="s.label">
          <div class="tph-stat-indicator" v-if="s.live">
            <div class="live-pulse" />
          </div>
          <div class="tph-stat-val" :style="s.color ? `color:${s.color}` : ''">{{ s.val }}</div>
          <div class="tph-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── EXPEDITION TABS ───────────────────────── -->
    <div class="exp-tabs-wrap">
      <div class="exp-tabs section" style="padding-top:0; padding-bottom:0; display:flex; gap:0; border-bottom:1px solid var(--border);">
        <button
          v-for="exp in liveExpeditions"
          :key="exp.id"
          class="exp-tab"
          :class="{ active: activeId === exp.id }"
          @click="activeId = exp.id"
        >
          <div class="exp-tab-live"><div class="tab-dot" />LIVE</div>
          <div class="exp-tab-name">{{ exp.adventureTitle }}</div>
          <div class="exp-tab-sub">Day {{ exp.currentDay }}/{{ exp.totalDays }} · {{ exp.participants }} people</div>
        </button>
      </div>
    </div>

    <!-- ── ACTIVE EXPEDITION ─────────────────────── -->
    <div v-if="active" class="exp-body section" style="padding-top:32px;">

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-item" v-for="s in activeStats" :key="s.label">
          <div class="stat-val">{{ s.val }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="tracking-grid">

        <!-- ── LEFT COLUMN ─────────────────────── -->
        <div class="tracking-left">

          <!-- Map -->
          <div class="map-box">
            <img :src="active.mapImage" alt="terrain" class="map-bg" />
            <div class="map-tint" />

            <!-- SVG route -->
            <svg class="map-svg" viewBox="0 0 800 500" preserveAspectRatio="none">
              <!-- completed path -->
              <polyline :points="completedPts" stroke="#e8622a" stroke-width="4" fill="none" opacity="0.95" />
              <!-- upcoming dashed -->
              <polyline :points="upcomingPts" stroke="#6b6c62" stroke-width="3" fill="none" stroke-dasharray="10,6" opacity="0.7" />
              <!-- dots -->
              <g v-for="(pt, i) in active.route" :key="i">
                <circle v-if="pt.status === 'current'"
                  :cx="pt.x" :cy="pt.y" r="20" fill="#e8622a" opacity="0.25" class="pulse-anim" />
                <circle
                  :cx="pt.x" :cy="pt.y"
                  :r="pt.status === 'current' ? 12 : 8"
                  :fill="pt.status === 'done' ? '#4d8c4d' : pt.status === 'current' ? '#e8622a' : '#3a3b34'"
                  stroke="rgba(10,10,8,0.8)" stroke-width="2"
                />
              </g>
            </svg>

            <!-- LIVE badge -->
            <div class="map-live-badge"><div class="live-dot-sm" />LIVE — Day {{ active.currentDay }} of {{ active.totalDays }}</div>

            <!-- Guide card -->
            <div class="map-guide-card">
              <img :src="active.guide.avatar" :alt="active.guide.name" class="guide-ava" />
              <div>
                <div class="guide-name">{{ active.guide.name }}</div>
                <div class="guide-role">Lead Guide</div>
              </div>
            </div>

            <!-- Position card -->
            <div class="map-pos-card">
              <div class="pos-location">📍 {{ active.currentLocation }}</div>
              <div class="pos-elevation">⛰ {{ active.currentElevation.toLocaleString() }}m</div>
              <div class="pos-weather">🌤 {{ active.weather.temp }} · {{ active.weather.condition }}</div>
            </div>

            <!-- Progress strip -->
            <div class="map-progress">
              <div class="mp-labels">
                <span>{{ active.distanceCovered }}km covered</span>
                <span>{{ active.totalDistance - active.distanceCovered }}km remaining</span>
              </div>
              <div class="mp-track"><div class="mp-fill" :style="{ width: pct + '%' }" /></div>
            </div>
          </div>

          <!-- Participant grid -->
          <div class="team-section">
            <div class="team-header">
              <div class="section-label" style="margin-bottom:0;">Expedition Team</div>
              <div class="team-count">{{ active.participants }}/{{ active.maxParticipants }} active</div>
            </div>
            <div class="team-grid">
              <div v-for="p in active.team" :key="p.name" class="team-card">
                <img :src="p.avatar" :alt="p.name" class="team-ava" />
                <div class="team-flag">{{ p.flag }}</div>
                <div class="team-name">{{ p.name }}</div>
                <div class="team-status" :class="p.status">
                  {{ p.status === 'strong' ? '💪 Strong' : '😮‍💨 Resting' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Live feed -->
          <div class="feed-section">
            <div class="feed-header">
              <div class="section-label" style="margin-bottom:0;">Field Updates</div>
              <div class="feed-meta-tag">{{ active.feed.length }} updates · refreshes every 5 min</div>
            </div>
            <div class="feed-grid">
              <div v-for="item in active.feed" :key="item.id" class="feed-card">
                <div class="feed-img-wrap">
                  <img :src="item.image" :alt="item.text" class="feed-img" loading="lazy" />
                </div>
                <div class="feed-body">
                  <p class="feed-text">{{ item.text }}</p>
                  <div class="feed-foot">
                    <span class="feed-author">{{ item.author }}</span>
                    <span class="feed-time">{{ formatAgo(item.minutesAgo) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT COLUMN ────────────────────── -->
        <div class="tracking-right">

          <!-- Weather -->
          <div class="weather-card">
            <div class="wc-label">{{ active.currentLocation }}</div>
            <div class="wc-row">
              <div class="wc-temp">{{ active.weather.temp }}</div>
              <div class="wc-cond">{{ active.weather.condition }}</div>
            </div>
            <div class="wc-details">
              <span>💨 {{ active.weather.wind }}</span>
              <span>💧 {{ active.weather.humidity }}</span>
            </div>
          </div>

          <!-- Checkpoints -->
          <div class="checkpoints-card">
            <div class="section-label" style="margin-bottom:18px;">Route Progress</div>
            <div class="cp-list">
              <div
                v-for="(cp, i) in active.checkpoints"
                :key="cp.name"
                class="cp-item"
              >
                <div class="cp-track">
                  <div class="cp-dot" :class="`dot-${cp.status}`" />
                  <div v-if="i < active.checkpoints.length - 1" class="cp-line" :class="`line-${cp.status}`" />
                </div>
                <div class="cp-content">
                  <div class="cp-name">
                    {{ cp.name }}
                    <span v-if="cp.status === 'current'" class="cp-live-tag">← LIVE</span>
                  </div>
                  <div class="cp-meta">{{ cp.time }} · {{ cp.elevation }}</div>
                  <div v-if="cp.note" class="cp-note" :class="{ 'cp-note-live': cp.status === 'current' }">
                    {{ cp.note }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Follow -->
          <div class="follow-card">
            <div class="fc-title">Follow This Expedition</div>
            <div class="fc-sub">Get notified at each checkpoint and when updates are posted.</div>
            <button
              class="btn btn-full"
              :class="following ? 'btn-outline' : 'btn-primary'"
              @click="toggleFollow"
              style="margin-bottom:8px;"
            >
              {{ following
                ? `❤️ Following — ${active.followers + 1} followers`
                : `🔔 Follow Live · ${active.followers} following` }}
            </button>
            <button class="btn btn-ghost btn-full btn-sm" @click="copyLink">
              📤 {{ copied ? 'Link Copied!' : 'Share This Expedition' }}
            </button>
          </div>

          <!-- Other live -->
          <div v-if="others.length">
            <div class="section-label" style="margin-bottom:12px;">Also Live Now</div>
            <div
              v-for="exp in others"
              :key="exp.id"
              class="other-card"
              @click="activeId = exp.id"
            >
              <img :src="exp.image" :alt="exp.adventureTitle" class="other-img" />
              <div class="other-body">
                <div class="other-live-tag"><div class="live-dot-xs" />LIVE</div>
                <div class="other-title">{{ exp.adventureTitle }}</div>
                <div class="other-meta">Day {{ exp.currentDay }}/{{ exp.totalDays }} · {{ exp.participants }} people</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <Transition name="snack">
      <div v-if="copied" class="snackbar">✅ Link copied to clipboard</div>
    </Transition>

  </div>
</template>

<script setup>
import { liveExpeditions } from '~~/data/demo.js'
import { useAnalyticsStore } from '~/stores/analytics'

const analytics = useAnalyticsStore()
useHead({ title: 'Live Expedition Tracking – Summit Trail' })

const activeId  = ref(liveExpeditions[0]?.id)
const following = ref(false)
const copied    = ref(false)

const active = computed(() => liveExpeditions.find(e => e.id === activeId.value))
const others = computed(() => liveExpeditions.filter(e => e.id !== activeId.value))

const pct = computed(() => {
  if (!active.value) return 0
  return Math.min(100, Math.round((active.value.distanceCovered / active.value.totalDistance) * 100))
})

// Build polyline point strings split at current position
const completedPts = computed(() => {
  if (!active.value) return ''
  const pts = active.value.route
  const idx = pts.findIndex(p => p.status === 'current')
  return pts.slice(0, idx + 1).map(p => `${p.x},${p.y}`).join(' ')
})
const upcomingPts = computed(() => {
  if (!active.value) return ''
  const pts = active.value.route
  const idx = pts.findIndex(p => p.status === 'current')
  return pts.slice(idx).map(p => `${p.x},${p.y}`).join(' ')
})

const headerStats = computed(() => [
  { val: liveExpeditions.length, label: 'Expeditions Live', live: true, color: 'var(--orange)' },
  { val: liveExpeditions.reduce((s, e) => s + e.participants, 0), label: 'People In Field', color: 'var(--white)' },
  { val: liveExpeditions.reduce((s, e) => s + e.followers, 0).toLocaleString(), label: 'People Following', color: 'var(--gold)' },
])

const activeStats = computed(() => active.value ? [
  { val: active.value.currentLocation,                  label: 'Current Location' },
  { val: `${active.value.currentElevation.toLocaleString()}m`, label: 'Elevation' },
  { val: `${active.value.distanceCovered}km`,           label: 'Distance Covered' },
  { val: `${pct.value}%`,                               label: 'Route Complete' },
  { val: `${active.value.elapsedHours}h`,               label: 'Time Elapsed' },
  { val: active.value.weather.temp,                     label: active.value.weather.condition },
] : [])

function formatAgo(mins) {
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

function toggleFollow() {
  following.value = !following.value
  if (following.value) analytics.trackEvent('expedition', 'follow', activeId.value)
}

function copyLink() {
  if (!process.client) return
  navigator.clipboard?.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}
</script>

<style scoped>
.tracking-page { background: var(--black); min-height: 100vh; }

/* Header */
.tp-header { background: var(--deep); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 32px; }
.tph-stats  { display: flex; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
.tph-stat   { background: var(--panel); border: 1px solid var(--border); padding: 20px 24px; min-width: 120px; position: relative; }
.tph-stat-indicator { position: absolute; top: 12px; right: 12px; }
.live-pulse { width: 8px; height: 8px; background: var(--red); border-radius: 50%; animation: pulse 1.2s infinite; }
.tph-stat-val   { font-family: var(--font-display); font-size: 36px; color: var(--orange); line-height: 1; }
.tph-stat-label { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-top: 4px; }

/* Tabs */
.exp-tabs-wrap { background: var(--charcoal); border-bottom: 1px solid var(--border); overflow-x: auto; }
.exp-tab {
  padding: 20px 28px; border: none; background: transparent; cursor: pointer;
  border-bottom: 3px solid transparent; text-align: left; white-space: nowrap; transition: all .2s;
}
.exp-tab:hover  { background: rgba(255,255,255,0.03); }
.exp-tab.active { border-bottom-color: var(--orange); background: rgba(232,98,42,0.05); }
.exp-tab-live  { display: flex; align-items: center; gap: 6px; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--red); margin-bottom: 6px; }
.tab-dot       { width: 6px; height: 6px; background: var(--red); border-radius: 50%; animation: pulse 1s infinite; }
.exp-tab-name  { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.exp-tab-sub   { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }

/* Stats bar */
.stats-bar { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; margin-bottom: 24px; }
.stat-item { background: var(--panel); border: 1px solid var(--border); padding: 16px 18px; }
.stat-val   { font-family: var(--font-condensed); font-size: 18px; font-weight: 700; color: var(--orange); margin-bottom: 3px; }
.stat-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }

/* Two-col layout */
.tracking-grid  { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
.tracking-left  { display: flex; flex-direction: column; gap: 20px; }
.tracking-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 90px; }

/* Map */
.map-box  { height: 480px; position: relative; overflow: hidden; border: 1px solid var(--border); }
.map-bg   { width: 100%; height: 100%; object-fit: cover; opacity: 0.4; }
.map-tint { position: absolute; inset: 0; background: rgba(10,10,8,0.25); }
.map-svg  { position: absolute; inset: 0; width: 100%; height: 100%; }
.pulse-anim { animation: pulseRing 2s ease-out infinite; }

.map-live-badge {
  position: absolute; top: 16px; left: 16px;
  background: var(--red); color: #fff; padding: 8px 16px;
  font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
}
.live-dot-sm { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: pulse 1s infinite; }
.live-dot-xs { width: 6px; height: 6px; background: var(--red); border-radius: 50%; animation: pulse 1s infinite; }

.map-guide-card {
  position: absolute; top: 16px; right: 16px;
  background: rgba(10,10,8,0.9); border: 1px solid var(--border); padding: 14px 16px;
  display: flex; align-items: center; gap: 10px;
}
.guide-ava  { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange); }
.guide-name { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--white); }
.guide-role { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }

.map-pos-card {
  position: absolute; bottom: 56px; right: 16px;
  background: rgba(10,10,8,0.9); border: 1px solid var(--border); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 4px;
}
.pos-location  { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--white); }
.pos-elevation { font-family: var(--font-condensed); font-size: 13px; color: var(--orange); }
.pos-weather   { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }

.map-progress { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px 18px; background: rgba(10,10,8,0.85); }
.mp-labels { display: flex; justify-content: space-between; font-family: var(--font-condensed); font-size: 13px; color: var(--gray); margin-bottom: 6px; }
.mp-track  { height: 4px; background: var(--muted); }
.mp-fill   { height: 100%; background: var(--orange); transition: width .8s ease; }

/* Team */
.team-section { background: var(--panel); border: 1px solid var(--border); padding: 20px; }
.team-header  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.team-count   { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.team-grid    { display: flex; gap: 10px; flex-wrap: wrap; }
.team-card    { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 68px; text-align: center; }
.team-ava     { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.team-flag    { font-size: 14px; }
.team-name    { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.2; }
.team-status  { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }
.team-status.strong  { color: var(--green-light); }
.team-status.resting { color: var(--gold); }

/* Feed */
.feed-section { }
.feed-header  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.feed-meta-tag { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }
.feed-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.feed-card { background: var(--panel); border: 1px solid var(--border); overflow: hidden; }
.feed-img-wrap { height: 150px; overflow: hidden; }
.feed-img  { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.feed-card:hover .feed-img { transform: scale(1.04); }
.feed-body { padding: 12px; }
.feed-text { font-size: 12px; font-weight: 300; color: var(--light); line-height: 1.6; margin-bottom: 10px; }
.feed-foot { display: flex; justify-content: space-between; }
.feed-author { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--orange); }
.feed-time   { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }

/* Weather */
.weather-card { background: var(--panel); border: 1px solid var(--border); padding: 18px 20px; }
.wc-label   { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 10px; }
.wc-row     { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 8px; }
.wc-temp    { font-family: var(--font-display); font-size: 36px; color: var(--white); line-height: 1; }
.wc-cond    { font-family: var(--font-condensed); font-size: 14px; color: var(--light); padding-bottom: 4px; }
.wc-details { display: flex; gap: 14px; font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }

/* Checkpoints */
.checkpoints-card { background: var(--panel); border: 1px solid var(--border); padding: 20px; }
.cp-list  { display: flex; flex-direction: column; }
.cp-item  { display: grid; grid-template-columns: 26px 1fr; gap: 10px; }
.cp-track { display: flex; flex-direction: column; align-items: center; }
.cp-dot   { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.dot-completed { background: var(--green-light); }
.dot-current   { background: var(--orange); animation: pulse 1.5s infinite; }
.dot-upcoming  { background: var(--muted); }
.cp-line  { flex: 1; width: 2px; background: var(--border); min-height: 16px; margin: 3px 0; }
.cp-line.line-completed { background: var(--green-light); opacity: 0.4; }
.cp-line.line-current   { background: var(--orange); opacity: 0.4; }
.cp-content { padding-bottom: 14px; }
.cp-name    { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.cp-live-tag { font-size: 12px; color: var(--orange); margin-left: 6px; font-weight: 700; letter-spacing: 1px; }
.cp-meta    { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); margin-bottom: 6px; }
.cp-note    { font-size: 12px; color: var(--light); font-style: italic; line-height: 1.5; }
.cp-note-live { color: var(--orange); }

/* Follow */
.follow-card { background: var(--charcoal); border: 1px solid var(--border); padding: 18px 20px; }
.fc-title { font-family: var(--font-condensed); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.fc-sub   { font-size: 12px; color: var(--gray); line-height: 1.6; margin-bottom: 14px; }

/* Other expeditions */
.other-card {
  display: grid; grid-template-columns: 72px 1fr; gap: 0;
  background: var(--panel); border: 1px solid var(--border);
  overflow: hidden; cursor: pointer; transition: border-color .2s; margin-bottom: 8px;
}
.other-card:hover { border-color: var(--orange); }
.other-img   { width: 72px; height: 72px; object-fit: cover; }
.other-body  { padding: 10px 12px; }
.other-live-tag { display: flex; align-items: center; gap: 5px; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--red); margin-bottom: 4px; }
.other-title { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 3px; line-height: 1.2; }
.other-meta  { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }

/* Snackbar */
.snackbar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--green-light); color: #fff;
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 1px;
  padding: 12px 24px; z-index: 9999;
}
.snack-enter-active, .snack-leave-active { transition: all .3s ease; }
.snack-enter-from, .snack-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

@keyframes pulseRing { 0% { opacity:0.5; r:14; } 100% { opacity:0; r:26; } }

/* Responsive */
@media (max-width: 1000px) {
  .tracking-grid { grid-template-columns: 1fr; }
  .tracking-right { position: static; }
  .stats-bar { grid-template-columns: repeat(3, 1fr); }
  .tph-stats { display: grid; grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .feed-grid { grid-template-columns: 1fr; }
  .map-box { height: 320px; }
  .map-guide-card { display: none; }
}
</style>
