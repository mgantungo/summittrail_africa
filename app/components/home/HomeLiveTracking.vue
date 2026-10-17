<template>
  <section class="home-tracking section" v-if="liveExpeditions.length || isPage">

    <!-- Header + stat counters -->
    <div class="ht-header">
      <div>
        <div class="section-label">Live Now</div>
        <component :is="isPage ? 'h1' : 'h2'" class="section-title">Active<br><span>Expeditions</span></component>
        <p class="section-sub" style="margin-top:10px;">
          <template v-if="liveExpeditions.length">
            {{ liveExpeditions.length }} expedition{{ liveExpeditions.length > 1 ? 's' : '' }} in the field.
            Follow in real-time.
          </template>
          <template v-else>No expeditions are in the field right now.</template>
        </p>
      </div>
      <div class="ht-live-counts" v-if="liveExpeditions.length">
        <div class="ht-count-card">
          <div class="ht-live-pulse"><div class="live-dot" /></div>
          <div class="ht-count-val">{{ liveExpeditions.length }}</div>
          <div class="ht-count-label">Live Now</div>
        </div>
        <div class="ht-count-card">
          <div class="ht-count-val" style="color:var(--white);">{{ totalParticipants }}</div>
          <div class="ht-count-label">In The Field</div>
        </div>
        <div class="ht-count-card">
          <div class="ht-count-val" style="color:var(--gold);">{{ totalFollowers.toLocaleString() }}</div>
          <div class="ht-count-label">Following</div>
        </div>
      </div>
    </div>

    <!-- Requested trail / expedition isn't live -->
    <div v-if="requestMissed" class="ht-notice">
      <template v-if="liveExpeditions.length">
        That trail has no expedition in the field right now — showing the other live expeditions instead.
      </template>
      <template v-else>
        That trail has no expedition in the field right now.
      </template>
    </div>

    <!-- Empty state (full page only) -->
    <div v-if="!liveExpeditions.length && isPage" class="ht-empty">
      <div class="ht-empty-icon">🏔️</div>
      <p>When a team sets off, their route, checkpoints and field updates appear here live.</p>
      <NuxtLink to="/adventures" class="btn btn-primary btn-sm">Browse Adventures</NuxtLink>
    </div>

    <!-- Expedition switcher tabs -->
    <div class="ht-tabs" v-if="liveExpeditions.length > 1">
      <button
        v-for="exp in liveExpeditions" :key="exp.key"
        class="ht-tab" :class="{ active: activeTrackId === exp.key }"
        @click="switchExpedition(exp.key)"
      >
        <div class="ht-tab-live"><div class="ht-tab-dot" />LIVE</div>
        <div class="ht-tab-name">{{ exp.adventureTitle }}<span v-if="exp.batchLabel" class="ht-tab-batch"> · {{ exp.batchLabel }}</span></div>
        <div class="ht-tab-meta">Day {{ exp.currentDay ?? '—' }}/{{ exp.totalDays ?? '—' }} · {{ exp.participants }} people</div>
      </button>
    </div>

    <!-- Main body -->
    <div v-if="active" class="ht-body">

      <!-- LEFT: map + feed -->
      <div class="ht-left">

        <div class="ht-map">

          <div class="map-toggle">
            <button
              v-for="v in viewOptions" :key="v.id"
              class="map-toggle-btn"
              :class="{ active: mapView === v.id }"
              @click="setView(v.id)"
            >{{ v.icon }} {{ v.label }}</button>
          </div>

          <div ref="mapEl" class="gmap-canvas"></div>

          <!-- No-API-key fallback -->
          <div v-if="!MAPS_KEY" class="map-fallback">
            <div class="mf-icon">🗺️</div>
            <div class="mf-text">Google Maps API key required</div>
            <div class="mf-sub">Set <code>NUXT_PUBLIC_GOOGLE_MAPS_KEY</code> in your .env file</div>
          </div>

          <!-- Key present but this expedition has no GPS points in the CMS -->
          <div v-else-if="mapsReady && !geoRoute.length && !lastFix" class="map-fallback map-fallback-soft">
            <div class="mf-icon">📡</div>
            <div class="mf-text">No GPS route posted yet</div>
            <div class="mf-sub">Waypoints appear once the field team adds them to this expedition.</div>
          </div>

          <div v-if="mapsLoading" class="map-loading">
            <div class="map-spinner"></div>
            <div class="map-loading-text">Loading map…</div>
          </div>

          <div class="ht-live-badge">
            <div class="ht-live-dot" />
            LIVE — Day {{ active.currentDay ?? '—' }} of {{ active.totalDays ?? '—' }}
          </div>

          <div class="ht-guide-card" v-if="active.guide">
            <img v-if="active.guide.avatar" :src="active.guide.avatar" :alt="active.guide.name" class="ht-guide-ava" />
            <div>
              <div class="ht-guide-name">{{ active.guide.name }}</div>
              <div class="ht-guide-role">{{ active.guide.role || 'Guide' }}</div>
            </div>
          </div>

          <div class="ht-pos-card">
            <div class="ht-pos-loc" v-if="active.currentLocation">📍 {{ active.currentLocation }}</div>
            <div class="ht-pos-elev" v-if="active.currentElevation != null">⛰ {{ active.currentElevation.toLocaleString() }}m</div>
            <div class="ht-pos-wx" v-if="active.weather.temp || active.weather.condition">
              🌤 {{ [active.weather.temp, active.weather.condition].filter(Boolean).join(' · ') }}
            </div>
          </div>

          <div class="ht-progress">
            <div class="ht-prog-labels">
              <span>{{ active.distanceCovered }}km covered<template v-if="active.totalDistance"> of {{ active.totalDistance }}km</template></span>
              <span>{{ pct }}% complete</span>
            </div>
            <div class="ht-prog-track"><div class="ht-prog-fill" :style="{ width: pct + '%' }" /></div>
          </div>
        </div>

        <!-- Field updates -->
        <div class="ht-feed">
          <div class="ht-feed-header">
            <div class="section-label" style="margin-bottom:0;">Latest Field Updates</div>
            <span class="ht-feed-count">
              {{ active.feed.length }} update{{ active.feed.length === 1 ? '' : 's' }}
              <template v-if="active.lastFieldUpdateAt"> · last from the field {{ ago(active.lastFieldUpdateAt) }}</template>
              <template v-else-if="lastSynced"> · synced {{ lastSynced }}</template>
            </span>
          </div>
          <div v-if="!active.feed.length" class="ht-feed-empty">No field updates posted yet.</div>
          <div v-else class="ht-feed-grid">
            <div v-for="(item, i) in visibleFeed" :key="item.id ?? i" class="ht-feed-card">
              <div class="ht-feed-img-wrap" v-if="item.image">
                <img :src="item.image" :alt="item.text" class="ht-feed-img" loading="lazy" />
              </div>
              <div class="ht-feed-body">
                <p class="ht-feed-text">{{ item.text }}</p>
                <div class="ht-feed-foot">
                  <span class="ht-feed-author">{{ item.author }}<span v-if="item.authorType === 'participant'" class="ht-feed-tag">Participant</span></span>
                  <span class="ht-feed-time" v-if="item.postedAt" :title="new Date(item.postedAt).toLocaleString()">{{ ago(item.postedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: stats + team + checkpoints + follow -->
      <div class="ht-right">
        <div class="ht-stats">
          <div class="ht-stat" v-for="s in activeStats" :key="s.label">
            <div class="ht-stat-val">{{ s.val }}</div>
            <div class="ht-stat-label">{{ s.label }}</div>
          </div>
        </div>

        <div class="ht-team" v-if="isPage && active.team.length">
          <div class="section-label" style="margin-bottom:12px;">Team In The Field</div>
          <div class="ht-team-list">
            <div v-for="(m, i) in active.team" :key="m.id ?? i" class="ht-team-item">
              <img v-if="m.avatar" :src="m.avatar" :alt="m.name" class="ht-team-ava" loading="lazy" />
              <div v-else class="ht-team-ava ht-team-initial">{{ (m.name || '?').charAt(0) }}</div>
              <div class="ht-team-name">{{ m.flag }} {{ m.name }}</div>
              <span class="ht-team-status" :class="`ht-team-${m.status}`">{{ m.status }}</span>
            </div>
          </div>
        </div>

        <div class="ht-checkpoints" v-if="active.checkpoints.length">
          <div class="section-label" style="margin-bottom:16px;">Route Progress</div>
          <div class="ht-cp-list">
            <div v-for="(cp, i) in active.checkpoints" :key="cp.id ?? cp.name" class="ht-cp-item">
              <div class="ht-cp-track">
                <div class="ht-cp-dot" :class="`ht-dot-${cp.status}`" />
                <div v-if="i < active.checkpoints.length - 1" class="ht-cp-line" :class="`ht-line-${cp.status}`" />
              </div>
              <div class="ht-cp-body">
                <div class="ht-cp-name">
                  {{ cp.name }}
                  <span v-if="cp.status === 'current'" class="ht-cp-tag">← LIVE</span>
                </div>
                <div class="ht-cp-meta">{{ [cp.time, cp.elevation].filter(Boolean).join(' · ') }}</div>
                <div v-if="cp.note" class="ht-cp-note" :class="{ 'ht-cp-note-live': cp.status === 'current' }">
                  {{ cp.note }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ht-follow">
          <div class="ht-follow-title">Follow This Expedition</div>
          <div class="ht-follow-sub">Get notified at each checkpoint and when updates are posted.</div>
          <button
            class="btn btn-full"
            :class="isFollowing ? 'btn-outline' : 'btn-primary'"
            :disabled="followBusy"
            @click="toggleFollow"
            style="margin-bottom:10px;"
          >
            {{ followBusy ? 'Please wait…'
              : isFollowing
                ? `❤️ Following · ${active.followers} following`
                : `🔔 Follow Live · ${active.followers} following` }}
          </button>
          <form v-if="showEmailFollow && !isFollowing" class="ht-follow-email" @submit.prevent="followByEmail">
            <input v-model="followEmail" type="email" required class="input" placeholder="Your email for updates" autocomplete="email" />
            <button type="submit" class="btn btn-primary btn-sm" :disabled="followBusy">Follow</button>
          </form>
          <div v-if="followMsg" class="ht-follow-msg">{{ followMsg }}</div>
          <NuxtLink v-if="active.adventureSlug" :to="`/adventures/${active.adventureSlug}`" class="btn btn-ghost btn-full btn-sm" style="margin-bottom:8px;">
            View This Trail →
          </NuxtLink>
          <NuxtLink v-if="!isPage" :to="{ path: '/tracking', query: { expedition: active.key } }" class="btn btn-ghost btn-full btn-sm">
            Open Full Tracking Page →
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// app/components/home/HomeLiveTracking.vue
//
// Used on the home page (variant="home") and as the body of /tracking
// (variant="page"). All data comes from the Strapi `live-expedition`
// collection via useLiveExpeditions() — status=active only.
//
// /tracking deep links:
//   /tracking?expedition=<documentId>  → that exact expedition
//   /tracking?trail=<adventure slug>   → the live expedition on that trail
const props = defineProps({
  variant:      { type: String, default: 'home' },   // 'home' | 'page'
  expeditionId: { type: String, default: '' },
  trailSlug:    { type: String, default: '' },
})
const emit = defineEmits(['select'])
const isPage = computed(() => props.variant === 'page')

const { data: liveExpeditions, refresh } = await useLiveExpeditions()

// ── Selection ─────────────────────────────────────────────────────────────
function resolveRequested() {
  const list = liveExpeditions.value
  if (props.expeditionId) {
    const m = list.find(e => e.key === props.expeditionId || String(e.id) === props.expeditionId)
    if (m) return m.key
  }
  if (props.trailSlug) {
    const m = list.find(e => e.adventureSlug === props.trailSlug)
    if (m) return m.key
  }
  return null
}

const activeTrackId = ref(resolveRequested() || liveExpeditions.value[0]?.key)
const requestMissed = computed(() =>
  !!(props.expeditionId || props.trailSlug) && !resolveRequested()
)

watch(() => [props.expeditionId, props.trailSlug], () => {
  const k = resolveRequested()
  if (k) activeTrackId.value = k
})

// After a poll, if the selected expedition is no longer active (completed
// or unpublished), fall back to the first live one.
watch(liveExpeditions, (list) => {
  if (!list.find(e => e.key === activeTrackId.value)) {
    activeTrackId.value = resolveRequested() || list[0]?.key
  }
})

const mapView       = ref('satellite') // 'map' | 'satellite' | 'street'
const mapEl         = ref(null)
const mapsReady     = ref(false)
const mapsLoading   = ref(false)

let gmap       = null
let panorama   = null
let routeLines = []
let markers    = []
let svChecker  = null

const viewOptions = [
  { id: 'map',       icon: '🗺️',  label: 'Map'        },
  { id: 'satellite', icon: '🛰️',  label: 'Satellite'  },
  { id: 'street',    icon: '👁️',  label: 'Street View' },
]

// ── Computed ───────────────────────────────────────────────────────────────
const active = computed(() => liveExpeditions.value.find(e => e.key === activeTrackId.value))

const totalParticipants = computed(() => liveExpeditions.value.reduce((s, e) => s + e.participants, 0))
const totalFollowers    = computed(() => liveExpeditions.value.reduce((s, e) => s + e.followers,    0))

const pct = computed(() => {
  const a = active.value
  if (!a || !a.totalDistance) return 0
  return Math.min(100, Math.round((a.distanceCovered / a.totalDistance) * 100))
})

const activeStats = computed(() => {
  const a = active.value
  if (!a) return []
  const stats = [
    { val: a.currentElevation != null ? `${a.currentElevation.toLocaleString()}m` : '—', label: 'Elevation' },
    { val: `${a.distanceCovered}km`, label: 'Covered' },
    { val: a.maxParticipants ? `${a.participants}/${a.maxParticipants}` : a.participants, label: 'Active' },
    { val: a.weather.temp || '—', label: a.weather.condition || 'Weather' },
  ]
  if (isPage.value) {
    if (a.elapsedHours != null)  stats.push({ val: `${a.elapsedHours}h`, label: 'Elapsed' })
    if (a.elevationGain != null) stats.push({ val: `${a.elevationGain.toLocaleString()}m`, label: 'Elev. Gain' })
    if (a.weather.wind)          stats.push({ val: a.weather.wind, label: 'Wind' })
    if (a.weather.humidity)      stats.push({ val: a.weather.humidity, label: 'Humidity' })
  }
  return stats
})

const visibleFeed = computed(() => isPage.value ? active.value.feed : active.value.feed.slice(0, 3))

// Route = checkpoints with coordinates (see normalizeExpedition)
const geoRoute = computed(() => active.value?.route || [])
const lastFix  = computed(() => active.value?.lastFix || null)
// Where the team is: the guide's latest GPS fix, else the current checkpoint
const currentGeoPoint = computed(() =>
  lastFix.value ||
  geoRoute.value.find(p => p.status === 'current') ||
  geoRoute.value.filter(p => p.status === 'done').pop() ||
  geoRoute.value[0]
)

// Relative time from the CMS postedAt timestamp. `now` ticks every minute
// so labels stay correct between polls.
const now = useState('ht-now', () => Date.now())
function ago(iso) {
  const mins = Math.max(0, Math.floor((now.value - new Date(iso).getTime()) / 60000))
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

const lastSyncedAt = ref(null)
const lastSynced = computed(() => lastSyncedAt.value ? ago(lastSyncedAt.value) : '')

// ── Google Maps API loader ─────────────────────────────────────────────────
const config  = useRuntimeConfig()
const MAPS_KEY = config.public?.googleMapsKey || ''

async function loadMapsApi() {
  if (window.google?.maps) return true
  if (!MAPS_KEY) return false

  mapsLoading.value = true
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry&loading=async`
    s.async = true
    s.onload  = () => { mapsLoading.value = false; resolve(true) }
    s.onerror = () => { mapsLoading.value = false; resolve(false) }
    document.head.appendChild(s)
  })
}

const darkMapStyle = [
  { elementType: 'geometry',   stylers: [{ color: '#1c1c18' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a08' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#a8a99e' }] },
  { featureType: 'road',       elementType: 'geometry',           stylers: [{ color: '#2e2f28' }] },
  { featureType: 'road',       elementType: 'geometry.stroke',    stylers: [{ color: '#1e1f1a' }] },
  { featureType: 'road',       elementType: 'labels.text.fill',   stylers: [{ color: '#6b6c62' }] },
  { featureType: 'water',      elementType: 'geometry',           stylers: [{ color: '#111209' }] },
  { featureType: 'water',      elementType: 'labels.text.fill',   stylers: [{ color: '#3a3b34' }] },
  { featureType: 'poi',        elementType: 'geometry',           stylers: [{ color: '#1e1f1a' }] },
  { featureType: 'poi.park',   elementType: 'geometry',           stylers: [{ color: '#111209' }] },
  { featureType: 'poi.park',   elementType: 'labels.text.fill',   stylers: [{ color: '#4d8c4d' }] },
  { featureType: 'landscape',  elementType: 'geometry',           stylers: [{ color: '#1c1c18' }] },
  { featureType: 'transit',    elementType: 'geometry',           stylers: [{ color: '#1e1f1a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3a3b34' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#6b6c62' }] },
]

// ── Map initialisation ─────────────────────────────────────────────────────
// Initialises even when the expedition has no geoRoute yet (previously the
// map stayed blank behind a misleading "API key required" message).
function initMap() {
  if (gmap || !mapEl.value || !window.google?.maps) return

  const pt = currentGeoPoint.value
  gmap = new google.maps.Map(mapEl.value, {
    center: pt ? { lat: pt.lat, lng: pt.lng } : { lat: 1.37, lng: 32.29 }, // Uganda
    zoom: pt ? 11 : 7,
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    gestureHandling: 'cooperative',
  })

  panorama = gmap.getStreetView()
  panorama.addListener('visible_changed', () => {
    if (!panorama.getVisible() && mapView.value === 'street') mapView.value = 'satellite'
  })
  svChecker = new google.maps.StreetViewService()

  drawRoute({ fit: true })
  mapsReady.value = true
}

function clearMapObjects() {
  routeLines.forEach(l => l.setMap(null))
  routeLines = []
  markers.forEach(m => m.setMap(null))
  markers = []
}

// "Last reported position" from the guide's phone GPS
function drawLastFix() {
  const fix = lastFix.value
  if (!gmap || !fix) return
  const m = new google.maps.Marker({
    position: { lat: fix.lat, lng: fix.lng },
    map: gmap,
    zIndex: 20,
    title: 'Last reported position',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: '#f5f3ec',
      fillOpacity: 1,
      strokeColor: '#e8622a',
      strokeWeight: 4,
    },
  })
  const box = document.createElement('div')
  box.style.cssText = 'font-family:sans-serif;font-size:13px;color:#0a0a08;padding:4px 8px;'
  box.textContent = `Last reported position${fix.postedAt ? ' · ' + ago(fix.postedAt) : ''}`
  const iw = new google.maps.InfoWindow({ content: box })
  m.addListener('click', () => iw.open(gmap, m))
  markers.push(m)
}

// Geotagged feed photos (guide and participant posts) as small pins;
// clicking one shows the photo, comment and author.
function drawPhotoPins() {
  const pins = active.value?.photoPins || []
  if (!gmap || !pins.length) return
  pins.forEach((p) => {
    const isParticipant = p.authorType === 'participant'
    const m = new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      map: gmap,
      zIndex: 5,
      title: p.author || 'Photo',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: isParticipant ? '#d4a843' : '#e8622a',
        fillOpacity: 1,
        strokeColor: '#0a0a08',
        strokeWeight: 2,
      },
    })
    // DOM nodes, not an HTML string — text comes from users
    const box = document.createElement('div')
    box.style.cssText = 'font-family:sans-serif;font-size:13px;color:#0a0a08;max-width:220px;'
    const img = document.createElement('img')
    img.src = p.image
    img.alt = p.text || ''
    img.loading = 'lazy'
    img.style.cssText = 'width:220px;height:220px;object-fit:cover;display:block;margin-bottom:6px;'
    const txt = document.createElement('div')
    txt.textContent = p.text || ''
    const by = document.createElement('div')
    by.style.cssText = 'color:#555;margin-top:4px;font-size:12px;'
    by.textContent = `${p.author || ''}${isParticipant ? ' · Participant' : ''}${p.postedAt ? ' · ' + ago(p.postedAt) : ''}`
    box.append(img, txt, by)
    const iw = new google.maps.InfoWindow({ content: box })
    m.addListener('click', () => iw.open(gmap, m))
    markers.push(m)
  })
}

function drawRoute({ fit = false } = {}) {
  if (!gmap) return
  clearMapObjects()
  const pts = geoRoute.value
  drawPhotoPins()
  drawLastFix()
  if (!pts.length) {
    if (fit && lastFix.value) { gmap.setCenter(lastFix.value); gmap.setZoom(12) }
    return
  }

  let currentIdx = pts.findIndex(p => p.status === 'current')
  if (currentIdx < 0) currentIdx = pts.map(p => p.status).lastIndexOf('done')

  const completedCoords = pts.slice(0, currentIdx + 1).map(p => ({ lat: p.lat, lng: p.lng }))
  if (completedCoords.length > 1) {
    const completed = new google.maps.Polyline({
      path: completedCoords, geodesic: true,
      strokeColor: '#e8622a', strokeOpacity: 0.95, strokeWeight: 4,
    })
    completed.setMap(gmap)
    routeLines.push(completed)
  }

  const upcomingCoords = pts.slice(Math.max(currentIdx, 0)).map(p => ({ lat: p.lat, lng: p.lng }))
  if (upcomingCoords.length > 1) {
    const upcomingLine = new google.maps.Polyline({
      path: upcomingCoords, geodesic: true,
      strokeColor: '#6b6c62', strokeOpacity: 0, strokeWeight: 0,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, strokeColor: '#6b6c62', scale: 3 },
        offset: '0', repeat: '16px',
      }],
    })
    upcomingLine.setMap(gmap)
    routeLines.push(upcomingLine)
  }

  pts.forEach((pt) => {
    const isCurrent   = pt.status === 'current'
    const isCompleted = pt.status === 'done'
    const marker = new google.maps.Marker({
      position: { lat: pt.lat, lng: pt.lng },
      map: gmap,
      title: pt.label || '',
      zIndex: isCurrent ? 10 : 1,
      icon: {
        path:         google.maps.SymbolPath.CIRCLE,
        scale:        isCurrent ? 12 : 8,
        fillColor:    isCurrent ? '#e8622a' : isCompleted ? '#4d8c4d' : '#3a3b34',
        fillOpacity:  1,
        strokeColor:  isCurrent ? '#f5f3ec' : '#0a0a08',
        strokeWeight: isCurrent ? 3 : 2,
      },
    })

    // Built with DOM nodes, not an HTML string — the label is CMS text
    const box = document.createElement('div')
    box.style.cssText = 'font-family:sans-serif;font-size:13px;color:#0a0a08;padding:4px 8px;'
    const strong = document.createElement('strong')
    strong.textContent = pt.label || ''
    const status = document.createElement('div')
    status.style.color = isCurrent ? '#e8622a' : '#555'
    status.textContent = isCurrent ? '← LIVE NOW' : (pt.status || '')
    box.append(strong, status)
    const infoWindow = new google.maps.InfoWindow({ content: box })
    marker.addListener('click', () => infoWindow.open(gmap, marker))
    markers.push(marker)
  })

  if (fit) {
    if (pts.length === 1) {
      gmap.setCenter({ lat: pts[0].lat, lng: pts[0].lng })
      gmap.setZoom(12)
    } else {
      const bounds = new google.maps.LatLngBounds()
      pts.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
      gmap.fitBounds(bounds, { top: 60, right: 60, bottom: 80, left: 60 })
    }
  }
}

// ── View switching ─────────────────────────────────────────────────────────
function setView(view) {
  mapView.value = view
  if (!gmap) return

  if (view === 'map') {
    panorama.setVisible(false)
    gmap.setMapTypeId('terrain')
    gmap.setOptions({ styles: darkMapStyle })
  } else if (view === 'satellite') {
    panorama.setVisible(false)
    gmap.setMapTypeId('hybrid')
    gmap.setOptions({ styles: [] })
  } else if (view === 'street') {
    const pos = currentGeoPoint.value
    if (!pos) { mapView.value = 'satellite'; return }
    const latLng = new google.maps.LatLng(pos.lat, pos.lng)
    svChecker.getPanorama({ location: latLng, radius: 50000 }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK) {
        panorama.setPosition(data.location.latLng)
        panorama.setPov({ heading: 0, pitch: 0 })
        panorama.setVisible(true)
      } else {
        mapView.value = 'satellite'
        gmap.setMapTypeId('hybrid')
        gmap.setOptions({ styles: [] })
        gmap.setCenter(latLng)
        gmap.setZoom(15)
        alert('Street View is not available at this remote location. Showing close satellite view.')
      }
    })
  }
}

// ── Expedition switching ───────────────────────────────────────────────────
function switchExpedition(key) {
  activeTrackId.value = key
  emit('select', key)
}

// New expedition selected → redraw and fit the whole route
watch(activeTrackId, async () => {
  if (!gmap) return
  await nextTick()
  drawRoute({ fit: true })
})

// Same expedition, new field data from a poll → redraw without moving the
// viewer's camera
watch(() => JSON.stringify([geoRoute.value, lastFix.value]), (next, prev) => {
  if (!gmap || next === prev) return
  drawRoute({ fit: !prev || prev === '[[],null]' })
})

// New geotagged photo posts → redraw pins, keep the viewer's camera
watch(() => (active.value?.photoPins || []).map(p => p.postedAt).join('|'), (next, prev) => {
  if (!gmap || next === prev) return
  drawRoute()
})

// The map div only exists while an expedition is shown — if expeditions
// appear after mount (e.g. on a poll), initialise then.
watch(mapEl, (el) => { if (el && window.google?.maps) initMap() })

// ── Follow ────────────────────────────────────────────────────────────────
// Stored in the CMS (expedition-follow) via /api/tracking/follow. Push when
// the browser supports it and VAPID is configured, otherwise email. This
// browser remembers what it follows so the button can unfollow.
const FOLLOW_KEY = 'st-follows'
const followed = ref({})            // { [expeditionKey]: { endpoint } | { email } }
const followBusy = ref(false)
const followMsg = ref('')
const showEmailFollow = ref(false)
const followEmail = ref('')
const isFollowing = computed(() => !!(active.value && followed.value[active.value.key]))

function loadFollowed() {
  try { followed.value = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '{}') || {} } catch { followed.value = {} }
}
function saveFollowed() {
  try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(followed.value)) } catch {}
}
function setCount(n) {
  if (active.value && Number.isFinite(n)) active.value.followers = n
}

async function pushSubscription() {
  const vapid = config.public?.vapidPublicKey
  if (!vapid || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return null
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return null
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing.toJSON()
  const pad = '='.repeat((4 - (vapid.length % 4)) % 4)
  const raw = atob((vapid + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: Uint8Array.from([...raw].map(c => c.charCodeAt(0))),
  })
  return sub.toJSON()
}

async function toggleFollow() {
  if (!active.value || followBusy.value) return
  followMsg.value = ''
  const key = active.value.key
  followBusy.value = true
  try {
    if (followed.value[key]) {
      const res = await $fetch('/api/tracking/unfollow', { method: 'POST', body: { expedition: key, ...followed.value[key] } })
      delete followed.value[key]; saveFollowed(); setCount(res.followers)
      return
    }
    let subscription = null
    try { subscription = await pushSubscription() } catch { subscription = null }
    if (!subscription) {
      showEmailFollow.value = true
      followMsg.value = 'Notifications are off on this device — follow by email instead.'
      return
    }
    const res = await $fetch('/api/tracking/follow', { method: 'POST', body: { expedition: key, subscription } })
    followed.value[key] = { endpoint: subscription.endpoint }; saveFollowed(); setCount(res.followers)
    followMsg.value = 'You’ll get a notification at each checkpoint and field update.'
  } catch (e) {
    followMsg.value = e?.data?.statusMessage || 'Could not update follow — please try again.'
  } finally {
    followBusy.value = false
  }
}

async function followByEmail() {
  if (!active.value || followBusy.value) return
  const key = active.value.key
  followBusy.value = true
  followMsg.value = ''
  try {
    const email = followEmail.value.trim().toLowerCase()
    const res = await $fetch('/api/tracking/follow', { method: 'POST', body: { expedition: key, email } })
    followed.value[key] = { email }; saveFollowed(); setCount(res.followers)
    showEmailFollow.value = false
    followMsg.value = `We’ll email ${email} at each checkpoint and field update.`
  } catch (e) {
    followMsg.value = e?.data?.statusMessage || 'Could not follow — check the email and try again.'
  } finally {
    followBusy.value = false
  }
}

watch(activeTrackId, () => { followMsg.value = ''; showEmailFollow.value = false })

// ── Live polling ───────────────────────────────────────────────────────────
// Field updates are entered in the CMS while the team is out; poll so
// viewers see them without reloading. Pauses while the tab is hidden.
const POLL_MS = 60_000
let pollTimer = null
let clockTimer = null

async function poll() {
  if (document.visibilityState === 'hidden') return
  await refresh()
  lastSyncedAt.value = new Date().toISOString()
}
function onVisible() { if (document.visibilityState === 'visible') poll() }

onMounted(async () => {
  loadFollowed()
  lastSyncedAt.value = new Date().toISOString()
  pollTimer  = setInterval(poll, POLL_MS)
  clockTimer = setInterval(() => { now.value = Date.now() }, 30_000)
  document.addEventListener('visibilitychange', onVisible)

  if (!MAPS_KEY) return
  const ok = await loadMapsApi()
  if (ok) {
    await nextTick()
    initMap()
  }
})

onUnmounted(() => {
  clearInterval(pollTimer)
  clearInterval(clockTimer)
  document.removeEventListener('visibilitychange', onVisible)
  clearMapObjects()
  gmap = null
  panorama = null
})
</script>

<style scoped>
.home-tracking { background: var(--deep); }

/* Header */
.ht-header { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:24px; margin-bottom:28px; }
.ht-live-counts { display:flex; gap:12px; flex-shrink:0; flex-wrap:wrap; }
.ht-count-card { background:var(--panel); border:1px solid var(--border); padding:16px 22px; min-width:90px; }
.ht-live-pulse { margin-bottom:6px; }
.live-dot { width:8px; height:8px; background:var(--red); border-radius:50%; animation:pulse 1.2s infinite; }
.ht-count-val   { font-family:var(--font-display); font-size:32px; color:var(--orange); line-height:1; }
.ht-count-label { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-top:4px; }

/* Tabs */
.ht-tabs { display:flex; border:1px solid var(--border); border-bottom:none; overflow-x:auto; margin-bottom:0; }
.ht-tab  { padding:16px 24px; background:transparent; border:none; cursor:pointer; border-right:1px solid var(--border); border-bottom:3px solid transparent; text-align:left; white-space:nowrap; transition:all .2s; }
.ht-tab:last-child { border-right:none; }
.ht-tab:hover  { background:rgba(255,255,255,0.03); }
.ht-tab.active { border-bottom-color:var(--orange); background:rgba(232,98,42,0.05); }
.ht-tab-live   { display:flex; align-items:center; gap:5px; font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--red); margin-bottom:4px; }
.ht-tab-dot    { width:5px; height:5px; background:var(--red); border-radius:50%; animation:pulse 1s infinite; }
.ht-tab-name   { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:2px; }
.ht-tab-meta   { font-family:var(--font-condensed); font-size:13px; color:var(--gray); }

/* Body */
.ht-body { display:grid; grid-template-columns:1fr 320px; gap:20px; border:1px solid var(--border); padding:20px; background:var(--charcoal); }
.ht-left { display:flex; flex-direction:column; gap:16px; }
.ht-right { display:flex; flex-direction:column; gap:14px; position:sticky; top:90px; align-self:start; }

/* Map container */
.ht-map { height:400px; position:relative; overflow:hidden; border:1px solid var(--border); background:var(--black); }

/* Google Maps canvas fills the full container */
.gmap-canvas { position:absolute; inset:0; width:100%; height:100%; }

/* View toggle — floats in the top-left above the map */
.map-toggle {
  position: absolute; top: 14px; left: 14px; z-index: 10;
  display: flex; gap: 2px;
}
.map-toggle-btn {
  background: rgba(10,10,8,0.88); border: 1px solid var(--border);
  color: var(--light); padding: 7px 13px;
  font-family: var(--font-condensed); font-size: 12px; font-weight: 700;
  letter-spacing: 1px; cursor: pointer; backdrop-filter: blur(8px);
  transition: all .18s;
}
.map-toggle-btn:hover  { color: var(--text); border-color: var(--muted); }
.map-toggle-btn.active { background: var(--orange); color: var(--black); border-color: var(--orange); }

/* Fallback and loading states */
.map-fallback {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  background: var(--panel);
}
.mf-icon  { font-size: 48px; }
.mf-text  { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--text); }
.mf-sub   { font-size: 13px; color: var(--gray); text-align: center; }
.mf-sub code { color: var(--orange); background: var(--charcoal); padding: 2px 6px; }

.map-loading {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px;
  background: var(--panel);
}
.map-spinner {
  width: 36px; height: 36px; border: 3px solid var(--border);
  border-top-color: var(--orange); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.map-loading-text { font-family: var(--font-condensed); font-size: 14px; color: var(--gray); }

/* Overlays — z-index above gmap-canvas (which is 0) */
.ht-live-badge {
  position: absolute; top: 46px; left: 14px; z-index: 10;
  background: var(--red); color: #fff; padding: 7px 14px;
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
  display: flex; align-items: center; gap: 7px;
}
.ht-live-dot { width: 7px; height: 7px; background: #fff; border-radius: 50%; animation: pulse 1s infinite; }

.ht-guide-card {
  position: absolute; top: 14px; right: 14px; z-index: 10;
  background: rgba(10,10,8,0.9); border: 1px solid var(--border); padding: 12px 14px;
  display: flex; align-items: center; gap: 8px;
}
.ht-guide-ava  { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange); }
.ht-guide-name { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--white); }
.ht-guide-role { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }

.ht-pos-card {
  position: absolute; bottom: 46px; right: 14px; z-index: 10;
  background: rgba(10,10,8,0.9); border: 1px solid var(--border); padding: 12px 14px;
  display: flex; flex-direction: column; gap: 3px;
}
.ht-pos-loc  { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--white); }
.ht-pos-elev { font-family: var(--font-condensed); font-size: 12px; color: var(--orange); }
.ht-pos-wx   { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }

.ht-progress { position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; padding: 12px 16px; background: rgba(10,10,8,0.85); }
.ht-prog-labels { display: flex; justify-content: space-between; font-family: var(--font-condensed); font-size: 13px; color: var(--gray); margin-bottom: 5px; }
.ht-prog-track { height: 3px; background: var(--muted); }
.ht-prog-fill  { height: 100%; background: var(--orange); transition: width .8s; }

/* Feed */
.ht-feed-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.ht-feed-count  { font-family:var(--font-condensed); font-size:14px; color:var(--gray); }
.ht-feed-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.ht-feed-card   { background:var(--panel); border:1px solid var(--border); overflow:hidden; }
.ht-feed-img-wrap { height:110px; overflow:hidden; }
.ht-feed-img    { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.ht-feed-card:hover .ht-feed-img { transform:scale(1.05); }
.ht-feed-body   { padding:10px; }
.ht-feed-text   { font-size:13px; font-weight:300; color:var(--light); line-height:1.5; margin-bottom:8px; }
.ht-feed-foot   { display:flex; justify-content:space-between; }
.ht-feed-author { font-family:var(--font-condensed); font-size:13px; font-weight:700; color:var(--orange); }
.ht-feed-tag    { margin-left:6px; padding:1px 5px; font-size:11px; letter-spacing:.5px; text-transform:uppercase; color:var(--gold); border:1px solid var(--gold); }
.ht-feed-time   { font-family:var(--font-condensed); font-size:13px; color:var(--gray); }

/* Right column */
.ht-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; }
.ht-stat  { background:var(--panel); border:1px solid var(--border); padding:14px 16px; }
.ht-stat-val   { font-family:var(--font-condensed); font-size:18px; font-weight:700; color:var(--orange); margin-bottom:3px; }
.ht-stat-label { font-family:var(--font-condensed); font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }

.ht-checkpoints { background:var(--panel); border:1px solid var(--border); padding:18px; }
.ht-cp-list { display:flex; flex-direction:column; }
.ht-cp-item { display:grid; grid-template-columns:22px 1fr; gap:10px; }
.ht-cp-track { display:flex; flex-direction:column; align-items:center; }
.ht-cp-dot  { width:18px; height:18px; border-radius:50%; flex-shrink:0; margin-top:2px; }
.ht-dot-completed { background:var(--green-light); }
.ht-dot-current   { background:var(--orange); animation:pulse 1.5s infinite; }
.ht-dot-upcoming  { background:var(--muted); }
.ht-cp-line { flex:1; width:2px; background:var(--border); min-height:14px; margin:3px 0; }
.ht-line-completed { background:var(--green-light); opacity:0.4; }
.ht-line-current   { background:var(--orange); opacity:0.4; }
.ht-cp-body { padding-bottom:12px; }
.ht-cp-name { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:2px; }
.ht-cp-tag  { font-size:13px; color:var(--orange); margin-left:5px; font-weight:700; }
.ht-cp-meta { font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:4px; }
.ht-cp-note { font-size:13px; color:var(--light); font-style:italic; line-height:1.5; }
.ht-cp-note-live { color:var(--orange); }

.ht-follow { background:var(--charcoal); border:1px solid var(--border); padding:18px; }
.ht-follow-title { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:5px; }
.ht-follow-sub   { font-size:14px; color:var(--gray); line-height:1.6; margin-bottom:14px; }

/* Responsive */
@media (max-width:1100px) { .ht-body { grid-template-columns:1fr 280px; } }
@media (max-width:900px) {
  .ht-body { grid-template-columns:1fr; }
  .ht-right { position:static; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .ht-checkpoints,.ht-follow { grid-column:span 2; }
  .ht-feed-grid { grid-template-columns:repeat(3,1fr); }
}
@media (max-width:768px) {
  .ht-map { height:300px; }
  .ht-guide-card { display:none; }
  .ht-feed-grid { grid-template-columns:1fr 1fr; }
  .ht-right { grid-template-columns:1fr; }
  .ht-checkpoints,.ht-follow { grid-column:span 1; }
}
@media (max-width:480px) {
  .ht-feed-grid { grid-template-columns:1fr; }
  .ht-live-counts { display:grid; grid-template-columns:repeat(3,1fr); width:100%; }
}

/* Follow */
.ht-follow-email { display:flex; gap:8px; margin-bottom:10px; }
.ht-follow-email .input { flex:1; min-width:0; }
.ht-follow-msg { font-size:13px; color:var(--gray); line-height:1.5; margin-bottom:10px; }

/* ── Added: CMS-driven states ─────────────────────────────── */
.map-fallback-soft { background: rgba(10,10,8,0.55); pointer-events: none; }
.ht-notice { border:1px solid var(--border); border-left:3px solid var(--orange); background:var(--panel); padding:12px 16px; margin-bottom:16px; font-size:14px; color:var(--text); }
.ht-empty { border:1px solid var(--border); background:var(--charcoal); padding:48px 20px; display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center; color:var(--gray); }
.ht-empty-icon { font-size:44px; }
.ht-feed-empty { font-size:14px; color:var(--gray); padding:14px 0; }
.ht-tab-batch { color:var(--gray); font-weight:400; }

.ht-team { background:var(--panel); border:1px solid var(--border); padding:18px; }
.ht-team-list { display:flex; flex-direction:column; gap:10px; }
.ht-team-item { display:flex; align-items:center; gap:10px; }
.ht-team-ava { width:32px; height:32px; border-radius:50%; object-fit:cover; flex-shrink:0; }
.ht-team-initial { display:flex; align-items:center; justify-content:center; background:var(--charcoal); color:var(--orange); font-family:var(--font-condensed); font-weight:700; }
.ht-team-name { flex:1; font-family:var(--font-condensed); font-size:14px; color:var(--text); }
.ht-team-status { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:2px 8px; border:1px solid var(--border); color:var(--gray); }
.ht-team-strong  { color:#4d8c4d; border-color:#4d8c4d; }
.ht-team-resting { color:var(--gold); border-color:var(--gold); }
.ht-team-injured { color:var(--red); border-color:var(--red); }

@media (max-width:900px) {
  .ht-team { grid-column:span 2; }
}
@media (max-width:768px) {
  .ht-team { grid-column:span 1; }
}
</style>
