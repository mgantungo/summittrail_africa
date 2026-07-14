<!--app/components/home/HomeLiveTracking.vue-->
<template>
  <section class="home-tracking section" v-if="liveExpeditions.length">

    <!-- Header + stat counters (unchanged) -->
    <div class="ht-header">
      <div>
        <div class="section-label">Live Now</div>
        <h2 class="section-title">Active<br><span>Expeditions</span></h2>
        <p class="section-sub" style="margin-top:10px;">
          {{ liveExpeditions.length }} expedition{{ liveExpeditions.length > 1 ? 's' : '' }} in the field.
          Follow in real-time.
        </p>
      </div>
      <div class="ht-live-counts">
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
          <div class="ht-count-val" style="color:var(--gold);">{{ totalFollowers }}</div>
          <div class="ht-count-label">Following</div>
        </div>
      </div>
    </div>

    <!-- Expedition switcher tabs (unchanged) -->
    <div class="ht-tabs" v-if="liveExpeditions.length > 1">
      <button
        v-for="exp in liveExpeditions" :key="exp.id"
        class="ht-tab" :class="{ active: activeTrackId === exp.id }"
        @click="switchExpedition(exp.id)"
      >
        <div class="ht-tab-live"><div class="ht-tab-dot" />LIVE</div>
        <div class="ht-tab-name">{{ exp.adventureTitle }}</div>
        <div class="ht-tab-meta">Day {{ exp.currentDay }}/{{ exp.totalDays }} · {{ exp.participants }} people</div>
      </button>
    </div>

    <!-- Main body -->
    <div v-if="active" class="ht-body">

      <!-- LEFT: map + feed -->
      <div class="ht-left">

        <!-- ── GOOGLE MAP SECTION ───────────────────── -->
        <div class="ht-map">

          <!-- View toggle -->
          <div class="map-toggle">
            <button
              v-for="v in viewOptions" :key="v.id"
              class="map-toggle-btn"
              :class="{ active: mapView === v.id }"
              @click="setView(v.id)"
            >{{ v.icon }} {{ v.label }}</button>
          </div>

          <!-- Google Maps container — filled by JS -->
          <div ref="mapEl" class="gmap-canvas"></div>

          <!-- No-API-key fallback -->
          <div v-if="!mapsReady && !mapsLoading" class="map-fallback">
            <div class="mf-icon">🗺️</div>
            <div class="mf-text">Google Maps API key required</div>
            <div class="mf-sub">Set <code>NUXT_PUBLIC_GOOGLE_MAPS_KEY</code> in your .env file</div>
          </div>

          <!-- Loading state -->
          <div v-if="mapsLoading" class="map-loading">
            <div class="map-spinner"></div>
            <div class="map-loading-text">Loading map…</div>
          </div>

          <!-- Overlays — sit on top of Google Maps via z-index -->
          <div class="ht-live-badge" v-if="mapsReady">
            <div class="ht-live-dot" />
            LIVE — Day {{ active.currentDay }} of {{ active.totalDays }}
          </div>

          <div class="ht-guide-card" v-if="mapsReady && active?.guide">
            <img :src="active.guide.avatar" :alt="active.guide.name" class="ht-guide-ava" />
            <div>
              <div class="ht-guide-name">{{ active.guide.name }}</div>
              <div class="ht-guide-role">Lead Guide</div>
            </div>
          </div>

          <div class="ht-pos-card" v-if="mapsReady">
            <div class="ht-pos-loc">📍 {{ active.currentLocation }}</div>
            <div class="ht-pos-elev">⛰ {{ active.currentElevation.toLocaleString() }}m</div>
            <div class="ht-pos-wx">🌤 {{ active.weather.temp }} · {{ active.weather.condition }}</div>
          </div>

          <div class="ht-progress">
            <div class="ht-prog-labels">
              <span>{{ active.distanceCovered }}km covered</span>
              <span>{{ pct }}% complete</span>
            </div>
            <div class="ht-prog-track"><div class="ht-prog-fill" :style="{ width: pct + '%' }" /></div>
          </div>
        </div>

        <!-- Feed: latest 3 updates (unchanged) -->
        <div class="ht-feed">
          <div class="ht-feed-header">
            <div class="section-label" style="margin-bottom:0;">Latest Field Updates</div>
            <span class="ht-feed-count">{{ active.feed.length }} updates</span>
          </div>
          <div class="ht-feed-grid">
            <div v-for="item in active.feed.slice(0, 3)" :key="item.id" class="ht-feed-card">
              <div class="ht-feed-img-wrap">
                <img :src="item.image" :alt="item.text" class="ht-feed-img" loading="lazy" />
              </div>
              <div class="ht-feed-body">
                <p class="ht-feed-text">{{ item.text }}</p>
                <div class="ht-feed-foot">
                  <span class="ht-feed-author">{{ item.author }}</span>
                  <span class="ht-feed-time">{{ ago(item.minutesAgo) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: stats + checkpoints + follow (unchanged) -->
      <div class="ht-right">
        <div class="ht-stats">
          <div class="ht-stat" v-for="s in activeStats" :key="s.label">
            <div class="ht-stat-val">{{ s.val }}</div>
            <div class="ht-stat-label">{{ s.label }}</div>
          </div>
        </div>

        <div class="ht-checkpoints">
          <div class="section-label" style="margin-bottom:16px;">Route Progress</div>
          <div class="ht-cp-list">
            <div v-for="(cp, i) in active.checkpoints" :key="cp.name" class="ht-cp-item">
              <div class="ht-cp-track">
                <div class="ht-cp-dot" :class="`ht-dot-${cp.status}`" />
                <div v-if="i < active.checkpoints.length - 1" class="ht-cp-line" :class="`ht-line-${cp.status}`" />
              </div>
              <div class="ht-cp-body">
                <div class="ht-cp-name">
                  {{ cp.name }}
                  <span v-if="cp.status === 'current'" class="ht-cp-tag">← LIVE</span>
                </div>
                <div class="ht-cp-meta">{{ cp.time }} · {{ cp.elevation }}</div>
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
            :class="following ? 'btn-outline' : 'btn-primary'"
            @click="following = !following"
            style="margin-bottom:10px;"
          >
            {{ following
              ? `❤️ Following — ${active.followers + 1} followers`
              : `🔔 Follow Live · ${active.followers} following` }}
          </button>
          <NuxtLink to="/tracking" class="btn btn-ghost btn-full btn-sm">
            Open Full Tracking Page →
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { data: liveExpeditions } = await useLiveExpeditions()

// ── State ──────────────────────────────────────────────────────────────────
const activeTrackId = ref(liveExpeditions.value[0]?.id)
const following     = ref(false)
const mapView       = ref('satellite') // 'map' | 'satellite' | 'street'
const mapEl         = ref(null)
const mapsReady     = ref(false)
const mapsLoading   = ref(false)

let gmap       = null   // google.maps.Map instance
let panorama   = null   // google.maps.StreetViewPanorama
let routeLines = []     // drawn Polylines
let markers    = []     // checkpoint Markers
let svChecker  = null   // StreetViewService

const viewOptions = [
  { id: 'map',       icon: '🗺️',  label: 'Map'        },
  { id: 'satellite', icon: '🛰️',  label: 'Satellite'  },
  { id: 'street',    icon: '👁️',  label: 'Street View' },
]

// ── Computed ───────────────────────────────────────────────────────────────
const active = computed(() => liveExpeditions.value.find(e => e.id === activeTrackId.value))

const totalParticipants = computed(() => liveExpeditions.value.reduce((s, e) => s + e.participants, 0))
const totalFollowers    = computed(() => liveExpeditions.value.reduce((s, e) => s + e.followers,    0))

const pct = computed(() => {
  if (!active.value) return 0
  return Math.min(100, Math.round((active.value.distanceCovered / active.value.totalDistance) * 100))
})

const activeStats = computed(() => active.value ? [
  { val: `${active.value.currentElevation.toLocaleString()}m`, label: 'Elevation' },
  { val: `${active.value.distanceCovered}km`,                  label: 'Covered'   },
  { val: active.value.participants,                            label: 'Active'    },
  { val: active.value.weather.temp,                           label: active.value.weather.condition },
] : [])

// The current expedition's geo waypoints (falls back gracefully if missing)
const geoRoute = computed(() => active.value?.geoRoute || [])

const currentGeoPoint = computed(() =>
  geoRoute.value.find(p => p.status === 'current') || geoRoute.value[0]
)

function ago(mins) {
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

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

// ── Dark map style matching Summit Trail theme ─────────────────────────────
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
function initMap() {
  if (!mapEl.value || !window.google?.maps || !geoRoute.value.length) return

  const center = currentGeoPoint.value
    ? { lat: currentGeoPoint.value.lat, lng: currentGeoPoint.value.lng }
    : { lat: 0.38, lng: 29.9 }

  gmap = new google.maps.Map(mapEl.value, {
    center,
    zoom: 11,
    mapTypeId: 'terrain',
    disableDefaultUI: true,
    gestureHandling: 'cooperative',
    styles: darkMapStyle,
  })

  // Street view panorama — linked to the same map div
  panorama = gmap.getStreetView()
  panorama.addListener('visible_changed', () => {
    if (!panorama.getVisible()) mapView.value = 'satellite'
  })

  // StreetViewService used to check coverage before entering street view
  svChecker = new google.maps.StreetViewService()

  drawRoute()
  mapsReady.value = true
}

// ── Route drawing ──────────────────────────────────────────────────────────
function clearMapObjects() {
  routeLines.forEach(l => l.setMap(null))
  routeLines = []
  markers.forEach(m => m.setMap(null))
  markers = []
}

function drawRoute() {
  if (!gmap || !geoRoute.value.length) return
  clearMapObjects()

  const pts          = geoRoute.value
  const currentIdx   = pts.findIndex(p => p.status === 'current')

  // Completed segment — orange solid
  const completedCoords = pts
    .slice(0, currentIdx + 1)
    .map(p => ({ lat: p.lat, lng: p.lng }))

  if (completedCoords.length > 1) {
    const completed = new google.maps.Polyline({
      path:         completedCoords,
      geodesic:     true,
      strokeColor:  '#e8622a',
      strokeOpacity: 0.95,
      strokeWeight: 4,
    })
    completed.setMap(gmap)
    routeLines.push(completed)
  }

  // Upcoming segment — grey dashed
  const upcomingCoords = pts
    .slice(currentIdx)
    .map(p => ({ lat: p.lat, lng: p.lng }))

  if (upcomingCoords.length > 1) {
    const upcomingLine = new google.maps.Polyline({
      path: upcomingCoords,
      geodesic: true,
      strokeColor:  '#6b6c62',
      strokeOpacity: 0,
      strokeWeight: 0,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 0.7,
          strokeColor: '#6b6c62',
          scale: 3,
        },
        offset: '0',
        repeat: '16px',
      }],
    })
    upcomingLine.setMap(gmap)
    routeLines.push(upcomingLine)
  }

  // Checkpoint markers
  pts.forEach((pt, i) => {
    const isCurrent  = pt.status === 'current'
    const isCompleted = pt.status === 'done'

    const marker = new google.maps.Marker({
      position: { lat: pt.lat, lng: pt.lng },
      map: gmap,
      title: pt.label || '',
      icon: {
        path:         google.maps.SymbolPath.CIRCLE,
        scale:        isCurrent ? 12 : 8,
        fillColor:    isCurrent ? '#e8622a' : isCompleted ? '#4d8c4d' : '#3a3b34',
        fillOpacity:  1,
        strokeColor:  isCurrent ? '#f5f3ec' : '#0a0a08',
        strokeWeight: isCurrent ? 3 : 2,
      },
    })

    // Label tooltip on hover
    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-family:sans-serif;font-size:13px;color:#0a0a08;padding:4px 8px;">
        <strong>${pt.label || ''}</strong><br>
        <span style="color:${isCurrent ? '#e8622a' : '#555'}">${pt.status === 'current' ? '← LIVE NOW' : pt.status}</span>
      </div>`,
    })

    marker.addListener('click', () => {
      infoWindow.open(gmap, marker)
    })

    markers.push(marker)
  })

  // Fit map bounds to show entire route
  const bounds = new google.maps.LatLngBounds()
  pts.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
  gmap.fitBounds(bounds, { top: 60, right: 60, bottom: 80, left: 60 })
}

// ── View switching ─────────────────────────────────────────────────────────
function setView(view) {
  mapView.value = view

  if (!gmap) return

  if (view === 'map') {
    panorama.setVisible(false)
    gmap.setMapTypeId('terrain')
    gmap.setOptions({ styles: darkMapStyle })
  }

  else if (view === 'satellite') {
    panorama.setVisible(false)
    gmap.setMapTypeId('hybrid')   // satellite + labels
    gmap.setOptions({ styles: [] })
  }

  else if (view === 'street') {
    const pos = currentGeoPoint.value
    if (!pos) return

    const latLng = new google.maps.LatLng(pos.lat, pos.lng)

    // Check for street view coverage within 50km radius
    // (remote Uganda areas may not have coverage — we fall back gracefully)
    svChecker.getPanorama(
      { location: latLng, radius: 50000 },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
          panorama.setPosition(data.location.latLng)
          panorama.setPov({ heading: 0, pitch: 0 })
          panorama.setVisible(true)
        } else {
          // No street view — fall back to close satellite zoom
          mapView.value = 'satellite'
          gmap.setMapTypeId('hybrid')
          gmap.setOptions({ styles: [] })
          gmap.setCenter(latLng)
          gmap.setZoom(15)
          alert('Street View is not available at this remote location. Showing close satellite view.')
        }
      }
    )
  }
}

// ── Expedition switching ───────────────────────────────────────────────────
function switchExpedition(id) {
  activeTrackId.value = id
  nextTick(() => {
    if (gmap) drawRoute()
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!MAPS_KEY) return   // No key — show fallback
  const ok = await loadMapsApi()
  if (ok) {
    await nextTick()
    initMap()
  }
})

// Re-draw whenever active expedition changes
watch(active, async () => {
  if (!gmap || !mapsReady.value) return
  await nextTick()
  drawRoute()
  // Re-centre on the new expedition's current position
  const pt = currentGeoPoint.value
  if (pt) gmap.panTo({ lat: pt.lat, lng: pt.lng })
})

onUnmounted(() => {
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
</style>