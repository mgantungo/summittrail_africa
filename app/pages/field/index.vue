<template>
  <div class="field-page">
    <div class="fp-wrap">
      <div class="section-label">Field Updates</div>
      <h1 class="fp-title">Post From The Trail</h1>

      <!-- Loading -->
      <div v-if="state === 'loading'" class="fp-card fp-muted">Loading…</div>

      <!-- Sign in -->
      <form v-else-if="state === 'login'" class="fp-card" @submit.prevent="login">
        <p class="fp-muted" style="margin-top:0;">Sign in with the field guide account the office set up for you.</p>
        <label class="input-label">Email</label>
        <input v-model="cred.identifier" class="input" type="email" autocomplete="username" required />
        <label class="input-label">Password</label>
        <input v-model="cred.password" class="input" type="password" autocomplete="current-password" required />
        <button class="btn btn-primary btn-full" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
        <div v-if="error" class="fp-error">{{ error }}</div>
      </form>

      <!-- Signed in -->
      <template v-else>
        <div class="fp-bar">
          <span>Signed in as <strong>{{ guideName }}</strong></span>
          <button type="button" class="fp-link" @click="logout">Sign out</button>
        </div>

        <!-- Queued (offline) updates -->
        <div v-if="queue.length" class="fp-card fp-queue">
          <strong>{{ queue.length }} update{{ queue.length > 1 ? 's' : '' }} waiting to send</strong>
          <span class="fp-muted">They send automatically when you have signal.</span>
          <button type="button" class="btn btn-ghost btn-sm" :disabled="busy || !online" @click="flushQueue">Send now</button>
        </div>

        <div v-if="!expeditions.length" class="fp-card fp-muted">
          You have no upcoming or active expeditions assigned. Ask the office to set you as the guide on the expedition.
        </div>

        <template v-else>
          <!-- Expedition picker -->
          <div v-if="expeditions.length > 1" class="fp-tabs">
            <button
              v-for="e in expeditions" :key="e.documentId" type="button"
              class="fp-tab" :class="{ active: e.documentId === selectedId }"
              @click="selectedId = e.documentId"
            >
              {{ e.adventure?.title || e.batchLabel || 'Expedition' }}
              <small>{{ e.status === 'active' ? `Day ${e.currentDay ?? '—'}/${e.totalDays ?? '—'}` : `Departs ${e.departureDate || '—'}` }}</small>
            </button>
          </div>

          <div v-if="exp" class="fp-card fp-summary">
            <div class="fp-sum-title">{{ exp.adventure?.title || 'Expedition' }}<span v-if="exp.batchLabel"> · {{ exp.batchLabel }}</span></div>
            <div class="fp-muted">
              <template v-if="exp.status === 'active'">Day {{ exp.currentDay ?? '—' }} of {{ exp.totalDays ?? '—' }}</template>
              <template v-else>Upcoming — departs {{ exp.departureDate || '—' }}</template>
              <template v-if="exp.lastFieldUpdateAt"> · last update {{ ago(exp.lastFieldUpdateAt) }}</template>
            </div>
            <div v-if="currentCp" class="fp-cp">📍 Now at: <strong>{{ currentCp.name }}</strong></div>
          </div>

          <form v-if="exp" class="fp-card" @submit.prevent="submit">
            <!-- Checkpoint -->
            <label v-if="nextCp" class="fp-check">
              <input v-model="form.advanceCheckpoint" type="checkbox" />
              <span>We've reached <strong>{{ nextCp.name }}</strong></span>
            </label>
            <label class="input-label">Checkpoint note</label>
            <input v-model="form.checkpointNote" class="input" maxlength="1000" placeholder="e.g. All strong, pushing for the summit at 0400" />

            <!-- GPS -->
            <div class="fp-gps">
              <button type="button" class="btn btn-ghost btn-sm" :disabled="gpsBusy" @click="getGps">
                {{ gpsBusy ? 'Getting GPS…' : form.lat != null ? '📡 Update GPS' : '📡 Add my GPS position' }}
              </button>
              <span v-if="form.lat != null" class="fp-muted">{{ form.lat.toFixed(5) }}, {{ form.lng.toFixed(5) }}<template v-if="gpsAccuracy"> (±{{ gpsAccuracy }}m)</template></span>
              <span v-if="gpsError" class="fp-error">{{ gpsError }}</span>
            </div>

            <!-- Position -->
            <div class="fp-grid">
              <div class="fp-span2">
                <label class="input-label">Current location</label>
                <input v-model="form.currentLocation" class="input" maxlength="200" :placeholder="exp.currentLocation || 'e.g. Bujuku Valley'" />
              </div>
              <div>
                <label class="input-label">Elevation (m)</label>
                <input v-model.number="form.currentElevation" class="input" type="number" inputmode="numeric" :placeholder="exp.currentElevation ?? ''" />
              </div>
              <div>
                <label class="input-label">Distance covered (km)</label>
                <input v-model.number="form.distanceCovered" class="input" type="number" step="0.1" inputmode="decimal" :placeholder="exp.distanceCovered ?? ''" />
              </div>
            </div>

            <!-- Weather -->
            <details class="fp-details">
              <summary>Weather</summary>
              <div class="fp-grid">
                <div><label class="input-label">Condition</label><input v-model="form.weather.condition" class="input" :placeholder="exp.weather?.condition || 'Partly cloudy'" /></div>
                <div><label class="input-label">Temp</label><input v-model="form.weather.temp" class="input" :placeholder="exp.weather?.temp || '8°C'" /></div>
                <div><label class="input-label">Wind</label><input v-model="form.weather.wind" class="input" :placeholder="exp.weather?.wind || '12 km/h'" /></div>
                <div><label class="input-label">Humidity</label><input v-model="form.weather.humidity" class="input" :placeholder="exp.weather?.humidity || '78%'" /></div>
              </div>
            </details>

            <!-- Team -->
            <details v-if="exp.team?.length" class="fp-details">
              <summary>Team status</summary>
              <div v-for="m in exp.team" :key="m.id ?? m.name" class="fp-team">
                <span>{{ m.flag }} {{ m.name }}</span>
                <select v-model="form.team[m.name]" class="input">
                  <option value="strong">Strong</option>
                  <option value="resting">Resting</option>
                  <option value="injured">Injured</option>
                </select>
              </div>
            </details>

            <!-- Post -->
            <label class="input-label">Update for followers</label>
            <textarea v-model="form.text" class="input" rows="3" maxlength="2000" placeholder="What's happening? This appears on the live tracking page." />
            <div class="fp-photo">
              <label class="btn btn-ghost btn-sm">
                📷 {{ photo ? 'Change photo' : 'Add photo' }}
                <input type="file" accept="image/*" capture="environment" hidden @change="onPhoto" />
              </label>
              <img v-if="photo" :src="photo" alt="Selected photo" class="fp-preview" />
              <button v-if="photo" type="button" class="fp-link" @click="photo = null">Remove</button>
            </div>

            <button class="btn btn-primary btn-full" :disabled="busy || !hasChanges">
              {{ busy ? 'Sending…' : 'Post update' }}
            </button>
            <div v-if="error" class="fp-error">{{ error }}</div>
            <div v-if="notice" class="fp-ok">{{ notice }}</div>
          </form>

          <!-- Recent posts -->
          <div v-if="exp?.feed?.length" class="fp-card">
            <div class="section-label" style="margin-bottom:10px;">Recent posts</div>
            <div v-for="(p, i) in recentFeed" :key="p.id ?? i" class="fp-post">
              <div>{{ p.text }}</div>
              <div class="fp-muted">{{ p.author }} · {{ p.postedAt ? ago(p.postedAt) : '' }}</div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
// app/pages/field/index.vue
//
// Field guides post live updates here. Sign-in is a Strapi users-permissions
// account with the "Field Guide" role, linked to the guide's Guide entry.
// All calls go through /api/field/* (JWT in an httpOnly cookie).
// Updates that fail for lack of signal are queued on the phone and resent.

useHead({ title: 'Field Updates – Summit Trail', meta: [{ name: 'robots', content: 'noindex' }] })

const state = ref('loading')        // 'loading' | 'login' | 'ready'
const busy = ref(false)
const error = ref('')
const notice = ref('')
const cred = reactive({ identifier: '', password: '' })
const guideName = ref('')
const expeditions = ref([])
const selectedId = ref(null)

const exp = computed(() => expeditions.value.find(e => e.documentId === selectedId.value) || null)
const cps = computed(() => exp.value?.checkpoints || [])
const currentIdx = computed(() => cps.value.findIndex(c => c.status === 'current'))
const currentCp = computed(() => cps.value[currentIdx.value] || null)
const nextCp = computed(() => cps.value.find((c, i) => i > currentIdx.value && c.status === 'upcoming') || null)
const recentFeed = computed(() =>
  [...(exp.value?.feed || [])].sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0)).slice(0, 3)
)

function blankForm() {
  return {
    advanceCheckpoint: false, checkpointNote: '',
    lat: null, lng: null,
    currentLocation: '', currentElevation: '', distanceCovered: '',
    weather: { condition: '', temp: '', wind: '', humidity: '' },
    team: {}, text: '',
  }
}
const form = reactive(blankForm())
const photo = ref(null)             // downscaled JPEG data URL

function resetForm() {
  Object.assign(form, blankForm())
  form.team = Object.fromEntries((exp.value?.team || []).map(m => [m.name, m.status || 'strong']))
  photo.value = null
}
watch(selectedId, resetForm)

const teamChanged = computed(() => (exp.value?.team || []).some(m => form.team[m.name] && form.team[m.name] !== (m.status || 'strong')))
const hasChanges = computed(() =>
  form.advanceCheckpoint || form.checkpointNote.trim() || form.lat != null ||
  form.currentLocation.trim() || form.currentElevation !== '' || form.distanceCovered !== '' ||
  Object.values(form.weather).some(v => v.trim()) || teamChanged.value || form.text.trim() || !!photo.value
)

function ago(iso) {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

// ── Session ────────────────────────────────────────────────────────────────
async function loadAssigned() {
  try {
    const res = await $fetch('/api/field/assigned')
    guideName.value = res.meta?.guide?.name || guideName.value
    expeditions.value = res.data || []
    if (!expeditions.value.find(e => e.documentId === selectedId.value)) {
      selectedId.value = (expeditions.value.find(e => e.status === 'active') || expeditions.value[0])?.documentId || null
    }
    state.value = 'ready'
    return true
  } catch (e) {
    if (e?.response?.status === 401 || e?.statusCode === 401) { state.value = 'login'; return false }
    if (state.value === 'loading') state.value = 'login'
    error.value = e?.data?.statusMessage || 'Could not reach the server.'
    return false
  }
}

async function login() {
  busy.value = true; error.value = ''
  try {
    const res = await $fetch('/api/field/login', { method: 'POST', body: { ...cred } })
    guideName.value = res.guide?.name || ''
    cred.password = ''
    await loadAssigned()
    flushQueue()
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Could not sign in.'
  } finally {
    busy.value = false
  }
}

async function logout() {
  await $fetch('/api/field/logout', { method: 'POST' }).catch(() => {})
  expeditions.value = []
  state.value = 'login'
}

// ── GPS ────────────────────────────────────────────────────────────────────
const gpsBusy = ref(false)
const gpsError = ref('')
const gpsAccuracy = ref(null)
function getGps() {
  gpsError.value = ''
  if (!('geolocation' in navigator)) { gpsError.value = 'GPS not available on this device'; return }
  gpsBusy.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.lat = pos.coords.latitude
      form.lng = pos.coords.longitude
      gpsAccuracy.value = Math.round(pos.coords.accuracy)
      gpsBusy.value = false
    },
    (err) => {
      gpsError.value = err.code === 1 ? 'Location permission denied' : 'Could not get a GPS fix — try again in the open'
      gpsBusy.value = false
    },
    { enableHighAccuracy: true, timeout: 30_000, maximumAge: 60_000 }
  )
}

// ── Photo (downscaled on the phone — uploads are slow in the field) ────────
async function onPhoto(ev) {
  const file = ev.target.files?.[0]
  ev.target.value = ''
  if (!file) return
  try {
    photo.value = await downscale(file, 1600, 0.8)
  } catch {
    error.value = 'Could not read that photo.'
  }
}
function downscale(file, maxSide, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}
async function uploadPhoto(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob()
  const fd = new FormData()
  fd.append('file', blob, `field-${Date.now()}.jpg`)
  const res = await $fetch('/api/field/upload', { method: 'POST', body: fd })
  return res.url
}

// ── Submit + offline queue ─────────────────────────────────────────────────
const QUEUE_KEY = 'st-field-queue'
const queue = ref([])
const online = ref(true)
function loadQueue() { try { queue.value = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { queue.value = [] } }
function saveQueue() {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.value)) }
  catch { error.value = 'Phone storage is full — the queued photo may not be kept.' }
}

function buildPayload() {
  const p = { expedition: selectedId.value }
  if (form.advanceCheckpoint) p.advanceCheckpoint = true
  if (form.checkpointNote.trim()) p.checkpointNote = form.checkpointNote.trim()
  if (form.lat != null) { p.lat = form.lat; p.lng = form.lng }
  if (form.currentLocation.trim()) p.currentLocation = form.currentLocation.trim()
  if (form.currentElevation !== '' && form.currentElevation != null) p.currentElevation = form.currentElevation
  if (form.distanceCovered !== '' && form.distanceCovered != null) p.distanceCovered = form.distanceCovered
  const w = Object.fromEntries(Object.entries(form.weather).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]))
  if (Object.keys(w).length) p.weather = w
  const team = (exp.value?.team || [])
    .filter(m => form.team[m.name] && form.team[m.name] !== (m.status || 'strong'))
    .map(m => ({ name: m.name, status: form.team[m.name] }))
  if (team.length) p.team = team
  if (form.text.trim()) p.post = { text: form.text.trim() }
  return p
}

const isOffline = (e) => !e?.response && !e?.statusCode

// Sends one update; the photo (if any) is uploaded first
async function send(item) {
  const body = { ...item.payload }
  if (item.photo) {
    const url = await uploadPhoto(item.photo)
    body.post = { ...(body.post || { text: '📷' }), image: url }
  }
  return $fetch('/api/field/update', { method: 'POST', body })
}

async function submit() {
  if (!hasChanges.value || !selectedId.value) return
  busy.value = true; error.value = ''; notice.value = ''
  const item = { payload: buildPayload(), photo: photo.value, queuedAt: new Date().toISOString() }
  try {
    const res = await send(item)
    applyResult(res)
    notice.value = res.summary?.advancedTo ? `Posted — now at ${res.summary.advancedTo}.` : 'Posted to the live tracking page.'
    resetForm()
  } catch (e) {
    if (isOffline(e)) {
      queue.value.push(item); saveQueue(); resetForm()
      notice.value = 'No signal — saved on this phone. It will send when you are back in range.'
    } else if (e?.response?.status === 401 || e?.statusCode === 401) {
      state.value = 'login'
      error.value = 'Your session expired — sign in again. Your update was not sent.'
    } else {
      error.value = e?.data?.statusMessage || 'Could not post the update.'
    }
  } finally {
    busy.value = false
  }
}

function applyResult(res) {
  if (!res?.data) return
  const i = expeditions.value.findIndex(e => e.documentId === res.data.documentId)
  if (i >= 0) expeditions.value[i] = { ...expeditions.value[i], ...res.data }
}

async function flushQueue() {
  if (!queue.value.length || busy.value || state.value !== 'ready') return
  busy.value = true
  try {
    while (queue.value.length) {
      try {
        const res = await send(queue.value[0])
        applyResult(res)
        queue.value.shift(); saveQueue()
      } catch (e) {
        if (isOffline(e)) break
        if (e?.response?.status === 401 || e?.statusCode === 401) { state.value = 'login'; break }
        // Rejected by the server (e.g. expedition completed) — drop it so the queue can't jam
        error.value = `A queued update was rejected: ${e?.data?.statusMessage || 'unknown error'}`
        queue.value.shift(); saveQueue()
      }
    }
    if (!queue.value.length) notice.value = 'All queued updates sent.'
  } finally {
    busy.value = false
  }
}

function onOnline() { online.value = true; flushQueue() }
function onOffline() { online.value = false }

onMounted(async () => {
  online.value = navigator.onLine
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  loadQueue()
  if (await loadAssigned()) { resetForm(); flushQueue() }
})
onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
})
</script>

<style scoped>
.field-page { padding-top: var(--nav-h, 76px); background: var(--deep); min-height: 100vh; }
.fp-wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 64px; }
.fp-title { font-family: var(--font-display); font-size: 34px; color: var(--text); margin: 4px 0 18px; line-height: 1.05; }
.fp-card { background: var(--charcoal); border: 1px solid var(--border); padding: 16px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px; }
.fp-card .input { width: 100%; box-sizing: border-box; }
.fp-muted { color: var(--gray); font-size: 13px; }
.fp-error { color: var(--red); font-size: 14px; }
.fp-ok { color: #4d8c4d; font-size: 14px; }
.fp-bar { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--gray); margin-bottom: 12px; }
.fp-bar strong { color: var(--text); }
.fp-link { background: none; border: none; color: var(--orange); cursor: pointer; font-size: 14px; padding: 0; }
.fp-queue { border-left: 3px solid var(--gold); }
.fp-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; }
.fp-tab { flex-shrink: 0; background: var(--panel); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; text-align: left; cursor: pointer; font-family: var(--font-condensed); font-weight: 700; display: flex; flex-direction: column; gap: 2px; }
.fp-tab small { color: var(--gray); font-weight: 400; }
.fp-tab.active { border-color: var(--orange); }
.fp-sum-title { font-family: var(--font-condensed); font-size: 18px; font-weight: 700; color: var(--text); }
.fp-cp { font-size: 14px; color: var(--text); }
.fp-check { display: flex; gap: 10px; align-items: center; font-size: 15px; color: var(--text); padding: 12px; background: rgba(232,98,42,0.08); border: 1px solid var(--orange); cursor: pointer; }
.fp-check input { width: 20px; height: 20px; accent-color: var(--orange); }
.fp-gps { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 4px 0; }
.fp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 10px; }
.fp-span2 { grid-column: span 2; }
.fp-details { border: 1px solid var(--border); padding: 8px 12px; }
.fp-details summary { cursor: pointer; font-family: var(--font-condensed); font-weight: 700; color: var(--text); padding: 4px 0; }
.fp-details[open] summary { margin-bottom: 8px; }
.fp-team { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; color: var(--text); font-size: 14px; }
.fp-team .input { width: 130px; }
.fp-photo { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.fp-preview { width: 72px; height: 72px; object-fit: cover; border: 1px solid var(--border); }
.fp-post { padding: 8px 0; border-top: 1px solid var(--border); font-size: 14px; color: var(--text); display: flex; flex-direction: column; gap: 3px; }
.fp-post:first-of-type { border-top: none; }
@media (max-width: 420px) { .fp-grid { grid-template-columns: 1fr; } .fp-span2 { grid-column: span 1; } }
</style>
