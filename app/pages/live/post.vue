<template>
  <div class="lp-page">
    <div class="lp-wrap">
      <div class="section-label">Live Tracking</div>
      <h1 class="lp-title">Post From The Trail</h1>

      <!-- Loading -->
      <div v-if="state === 'loading'" class="lp-card lp-muted">Loading…</div>

      <!-- Sign in -->
      <form v-else-if="state === 'login'" class="lp-card" @submit.prevent="login">
        <p class="lp-muted lp-top0">Sign in with your Summit Trail account to post a live update from your expedition.</p>
        <label class="input-label" for="lp-email">Email</label>
        <input id="lp-email" v-model="cred.email" class="input" type="email" autocomplete="username" required />
        <label class="input-label" for="lp-pass">Password</label>
        <input id="lp-pass" v-model="cred.password" class="input" type="password" autocomplete="current-password" required />
        <button class="btn btn-primary btn-full" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
        <div v-if="error" class="lp-error">{{ error }}</div>
      </form>

      <!-- Signed in, nothing live -->
      <div v-else-if="state === 'none'" class="lp-card">
        <p class="lp-top0">You don't have an expedition in progress right now.</p>
        <p class="lp-muted">Live posting opens once an adventure you're <strong>confirmed</strong> on has started.</p>
        <div class="lp-row">
          <NuxtLink to="/tracking" class="btn btn-ghost btn-sm">📍 Watch live expeditions</NuxtLink>
          <button type="button" class="btn btn-ghost btn-sm" @click="loadEligible">↻ Check again</button>
        </div>
      </div>

      <!-- Ready -->
      <template v-else>
        <!-- Just posted -->
        <div v-if="posted" class="lp-card lp-done">
          <img :src="posted.image" alt="Your live post" class="lp-done-img" />
          <div>
            <strong>Posted to the live feed ✓</strong>
            <p class="lp-muted">{{ posted.text }}</p>
            <div class="lp-row">
              <NuxtLink :to="{ path: '/tracking', query: { expedition: selectedId } }" class="btn btn-primary btn-sm">View live feed</NuxtLink>
              <button type="button" class="btn btn-ghost btn-sm" @click="posted = null">Post another</button>
            </div>
          </div>
        </div>

        <form v-else class="lp-card" @submit.prevent="submit">
          <!-- Expedition -->
          <template v-if="expeditions.length > 1">
            <label class="input-label" for="lp-exp">Expedition</label>
            <select id="lp-exp" v-model="selectedId" class="input">
              <option v-for="e in expeditions" :key="e.documentId" :value="e.documentId">
                {{ e.title }}{{ e.batchLabel ? ` — ${e.batchLabel}` : '' }}
              </option>
            </select>
          </template>
          <div v-else class="lp-exp">
            <span class="badge badge-live">LIVE</span>
            <strong>{{ selected?.title }}</strong>
            <span v-if="selected?.currentDay && selected?.totalDays" class="lp-muted">Day {{ selected.currentDay }} of {{ selected.totalDays }}</span>
          </div>

          <!-- Photo -->
          <label class="input-label">Photo</label>

          <div v-if="camera.on" class="lp-camera">
            <video ref="videoEl" class="lp-video" autoplay playsinline muted />
            <div class="lp-row">
              <button type="button" class="btn btn-primary btn-sm" :disabled="!camera.ready" @click="capture">📸 Capture</button>
              <button v-if="camera.canFlip" type="button" class="btn btn-ghost btn-sm" @click="flipCamera">🔄 Flip</button>
              <button type="button" class="btn btn-ghost btn-sm" @click="stopCamera">Cancel</button>
            </div>
          </div>

          <div v-else-if="photo" class="lp-preview">
            <img :src="photo.preview" alt="Selected photo preview" />
            <div class="lp-preview-meta">
              <span class="lp-muted">{{ photo.label }}</span>
              <span class="lp-muted">Max 700 KB (larger photos are compressed on your phone). Posted as 700×700 with the Summit Trail watermark.</span>
              <button type="button" class="lp-link" @click="clearPhoto">Remove photo</button>
            </div>
          </div>

          <div v-else class="lp-row">
            <button type="button" class="btn btn-primary btn-sm" @click="startCamera">📷 Open camera</button>
            <button type="button" class="btn btn-ghost btn-sm" @click="fileEl?.click()">🖼️ Upload a photo</button>
            <input
              ref="fileEl"
              type="file"
              class="lp-hidden"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              @change="onFile"
            />
          </div>
          <div v-if="cameraError" class="lp-hint">{{ cameraError }}</div>

          <!-- Comment -->
          <label class="input-label" for="lp-comment">Comment</label>
          <textarea
            id="lp-comment"
            v-model="comment"
            class="input lp-textarea"
            maxlength="500"
            rows="3"
            placeholder="What's happening on the trail?"
            required
          />
          <div class="lp-count">{{ comment.length }}/500</div>

          <!-- GPS -->
          <div class="lp-gps" :class="gps.status">
            <span v-if="gps.status === 'ok'">📍 {{ gps.lat.toFixed(5) }}, {{ gps.lng.toFixed(5) }} <span class="lp-muted">(±{{ Math.round(gps.accuracy) }} m)</span></span>
            <span v-else-if="gps.status === 'locating'">📍 Getting your location…</span>
            <span v-else>📍 {{ gps.message || 'Location needed to post' }}</span>
            <button type="button" class="lp-link" :disabled="gps.status === 'locating'" @click="locate">
              {{ gps.status === 'ok' ? 'Refresh' : 'Retry' }}
            </button>
          </div>

          <button class="btn btn-primary btn-full" :disabled="!canSubmit">
            {{ busy ? 'Posting…' : 'Post live update' }}
          </button>
          <div v-if="error" class="lp-error">{{ error }}</div>
        </form>

        <div class="lp-bar">
          <span class="lp-muted">Signed in as <strong>{{ profile.displayName }}</strong></span>
          <button type="button" class="lp-link" @click="signOut">Sign out</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
// app/pages/live/post.vue
//
// Live posting for confirmed participants of an expedition that has started.
// One photo (camera or upload: .jpg .jpeg .png .webp) + one comment + GPS
// per post. The server (server/api/live/post.post.js) resamples to 700×700,
// watermarks, stores it and appends it to the expedition's live feed.
//
// Deep link: /live/post?expedition=<documentId>
import { useProfileStore } from '~/stores/profile'

useHead({ title: 'Post a Live Update – Summit Trail', meta: [{ name: 'robots', content: 'noindex' }] })

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_UPLOAD_BYTES = 700 * 1024                 // must match server/api/live/post.post.js
const FIT_SIDES = [1600, 1400, 1200, 1000, 800]      // longest side tried, largest first
const FIT_QUALITIES = [0.88, 0.8, 0.72, 0.64, 0.56]

const route = useRoute()
const profile = useProfileStore()

const state = ref('loading')         // 'loading' | 'login' | 'none' | 'ready'
const busy = ref(false)
const error = ref('')
const cred = reactive({ email: '', password: '' })
const expeditions = ref([])
const selectedId = ref(null)
const selected = computed(() => expeditions.value.find(e => e.documentId === selectedId.value) || null)

const comment = ref('')
const photo = ref(null)               // { blob, name, preview, label }
const posted = ref(null)

const fileEl = ref(null)
const videoEl = ref(null)
const camera = reactive({ on: false, ready: false, facing: 'environment', canFlip: false })
const cameraError = ref('')
let stream = null

const gps = reactive({ status: 'idle', lat: 0, lng: 0, accuracy: 0, message: '' })

const canSubmit = computed(() =>
  !busy.value && !!selectedId.value && !!photo.value && comment.value.trim().length >= 2 && gps.status === 'ok')

// ── Session / eligibility ────────────────────────────────────────────────
async function loadEligible() {
  error.value = ''
  try {
    const res = await $fetch('/api/live/eligible')
    expeditions.value = res.data || []
    const wanted = String(route.query.expedition || '')
    selectedId.value = expeditions.value.find(e => e.documentId === wanted)?.documentId
      || expeditions.value[0]?.documentId || null
    state.value = expeditions.value.length ? 'ready' : 'none'
    if (state.value === 'ready' && gps.status === 'idle') locate()
  } catch (e) {
    if ((e?.response?.status || e?.statusCode) === 401) { state.value = 'login'; return }
    state.value = 'login'
    error.value = e?.data?.statusMessage || 'Could not reach the server.'
  }
}

async function login() {
  busy.value = true; error.value = ''
  try {
    const { customer } = await $fetch('/api/auth/login', { method: 'POST', body: { ...cred } })
    profile.login(customer)
    cred.password = ''
    await loadEligible()
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Sign-in failed.'
  } finally {
    busy.value = false
  }
}

function signOut() {
  stopCamera()
  profile.logout()
  state.value = 'login'
}

// ── GPS ──────────────────────────────────────────────────────────────────
function locate() {
  if (!process.client) return
  if (!('geolocation' in navigator)) {
    Object.assign(gps, { status: 'error', message: 'This device has no location support' })
    return
  }
  gps.status = 'locating'
  navigator.geolocation.getCurrentPosition(
    (pos) => Object.assign(gps, {
      status: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy || 0, message: '',
    }),
    (err) => Object.assign(gps, {
      status: 'error',
      message: err.code === 1 ? 'Location blocked — allow location for this site and retry'
        : err.code === 3 ? 'No GPS fix yet — move to open sky and retry'
        : 'Could not get your location — retry',
    }),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
  )
}

// ── Photo helpers ────────────────────────────────────────────────────────
function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('unreadable'))
    img.src = src
  })
}
function canvasToJpeg(canvas, quality = 0.92) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}
const sizeLabel = (b) => b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`

async function setPhoto(blob, name) {
  const dataUrl = await readAsDataUrl(blob)
  const img = await loadImage(dataUrl)
  const w = img.naturalWidth, h = img.naturalHeight
  if (Math.min(w, h) < 300) throw new Error('Photo is too small — at least 300×300 px')

  // Uploads are capped at 700 KB. Phone photos are usually 2–8 MB, so they
  // are re-encoded here first: shrink, then step quality down until it
  // fits. The shorter side is kept ≥ 700 px where possible so the server's
  // 700×700 crop stays sharp.
  let out = blob, outName = name
  if (blob.size > MAX_UPLOAD_BYTES) {
    out = await fitUnderLimit(img, w, h)
    if (!out) throw new Error('Could not make this photo small enough (700 KB) — try another photo')
    outName = name.replace(/\.[a-z0-9]+$/i, '') + '.jpg'
  }

  photo.value = {
    blob: out,
    name: outName,
    preview: out === blob ? dataUrl : await readAsDataUrl(out),
    label: `${outName} · ${sizeLabel(out.size)}`,
  }
  if (gps.status !== 'ok' && gps.status !== 'locating') locate()
}

async function fitUnderLimit(img, w, h) {
  const longest = Math.max(w, h), shortest = Math.min(w, h)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  for (const side of FIT_SIDES) {
    // never upscale; don't let the short side drop under 700 px unless
    // nothing larger fits (last rung of the ladder)
    let k = Math.min(1, side / longest)
    if (shortest * k < 700 && side !== FIT_SIDES[FIT_SIDES.length - 1]) k = Math.min(1, 700 / shortest)
    canvas.width = Math.round(w * k)
    canvas.height = Math.round(h * k)
    ctx.fillStyle = '#0a0a08'
    ctx.fillRect(0, 0, canvas.width, canvas.height) // transparent PNG/WEBP → brand black
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    for (const q of FIT_QUALITIES) {
      const jpeg = await canvasToJpeg(canvas, q)
      if (jpeg && jpeg.size <= MAX_UPLOAD_BYTES) return jpeg
    }
  }
  return null
}

async function onFile(ev) {
  error.value = ''
  const files = ev.target.files
  const file = files?.[0]
  ev.target.value = ''
  if (!file) return
  if (files.length > 1) { error.value = 'Choose one photo at a time.'; return }
  const ext = (file.name.toLowerCase().match(/\.[a-z0-9]+$/) || [''])[0]
  if (!ALLOWED_EXT.includes(ext) || (file.type && !ALLOWED_TYPES.includes(file.type))) {
    error.value = 'Only .jpg, .jpeg, .png or .webp photos.'
    return
  }
  try {
    await setPhoto(file, file.name)
  } catch (e) {
    error.value = e?.message === 'unreadable' ? 'That photo could not be opened.' : (e?.message || 'That photo could not be opened.')
  }
}

function clearPhoto() { photo.value = null }

// ── Camera session ───────────────────────────────────────────────────────
async function startCamera() {
  cameraError.value = ''; error.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Camera isn\'t available in this browser — use "Upload a photo" instead.'
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: camera.facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
      audio: false,
    })
    camera.on = true
    camera.ready = false
    await nextTick()
    videoEl.value.srcObject = stream
    videoEl.value.onloadedmetadata = () => { camera.ready = true }
    const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
    camera.canFlip = devices.filter(d => d.kind === 'videoinput').length > 1
    if (gps.status !== 'ok' && gps.status !== 'locating') locate()
  } catch (e) {
    stopCamera()
    cameraError.value = e?.name === 'NotAllowedError'
      ? 'Camera permission was denied — allow it in your browser settings, or upload a photo.'
      : 'Could not start the camera — use "Upload a photo" instead.'
  }
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop())
  stream = null
  camera.on = false
  camera.ready = false
}

async function flipCamera() {
  camera.facing = camera.facing === 'environment' ? 'user' : 'environment'
  stopCamera()
  await startCamera()
}

async function capture() {
  const v = videoEl.value
  if (!v?.videoWidth) return
  const c = document.createElement('canvas')
  c.width = v.videoWidth
  c.height = v.videoHeight
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
  const blob = await canvasToJpeg(c, 0.92)
  stopCamera()
  if (!blob) { error.value = 'Could not capture the photo — try again.'; return }
  try {
    await setPhoto(blob, `camera-${Date.now()}.jpg`)
  } catch (e) {
    error.value = e?.message || 'Could not capture the photo — try again.'
  }
}

// ── Submit (one photo + one comment per post) ────────────────────────────
async function submit() {
  if (!canSubmit.value) return
  busy.value = true; error.value = ''
  try {
    const fd = new FormData()
    fd.append('expedition', selectedId.value)
    fd.append('comment', comment.value.trim())
    fd.append('lat', String(gps.lat))
    fd.append('lng', String(gps.lng))
    fd.append('photo', photo.value.blob, photo.value.name)
    const res = await $fetch('/api/live/post', { method: 'POST', body: fd })
    posted.value = res.post
    comment.value = ''
    photo.value = null
  } catch (e) {
    const status = e?.response?.status || e?.statusCode
    if (status === 401) { state.value = 'login'; error.value = 'Your session expired — sign in again.'; return }
    error.value = e?.data?.statusMessage || 'Could not post — check your signal and try again.'
  } finally {
    busy.value = false
  }
}

onMounted(loadEligible)
onBeforeUnmount(stopCamera)
</script>

<style scoped>
.lp-page { padding: calc(var(--nav-h, 76px) + 32px) 16px 64px; }
.lp-wrap { max-width: 560px; margin: 0 auto; }
.lp-title { font-family: var(--font-display); font-size: 44px; color: var(--text); margin: 4px 0 20px; letter-spacing: 1px; }
.lp-card { background: var(--panel); border: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.lp-muted { color: var(--light); font-size: 14px; }
.lp-top0 { margin-top: 0; }
.lp-error { color: var(--red); font-size: 14px; }
.lp-hint { color: var(--gold); font-size: 13px; }
.lp-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.lp-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
.lp-link { background: none; border: none; padding: 0; color: var(--orange); cursor: pointer; font: inherit; font-size: 14px; }
.lp-link:disabled { opacity: .5; cursor: default; }
.lp-hidden { display: none; }
.lp-exp { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; color: var(--text); }

.lp-camera { display: flex; flex-direction: column; gap: 10px; }
.lp-video { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; background: #000; border: 1px solid var(--border-color); }

.lp-preview { display: grid; grid-template-columns: 140px 1fr; gap: 14px; align-items: start; }
.lp-preview img { width: 140px; height: 140px; object-fit: cover; border: 1px solid var(--border-color); }
.lp-preview-meta { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }

.lp-textarea { resize: vertical; min-height: 84px; font-family: var(--font-body); }
.lp-count { align-self: flex-end; font-size: 12px; color: var(--gray); margin-top: -6px; }

.lp-gps { display: flex; justify-content: space-between; gap: 10px; align-items: center; font-size: 14px; padding: 10px 12px; border: 1px solid var(--border-color); color: var(--text); }
.lp-gps.ok { border-color: var(--green-light); }
.lp-gps.error { border-color: var(--red); }

.lp-done { flex-direction: row; gap: 16px; align-items: flex-start; }
.lp-done-img { width: 120px; height: 120px; object-fit: cover; flex-shrink: 0; }

@media (max-width: 480px) {
  .lp-title { font-size: 36px; }
  .lp-preview { grid-template-columns: 1fr; }
  .lp-preview img { width: 100%; height: auto; aspect-ratio: 1 / 1; }
  .lp-done { flex-direction: column; }
  .lp-done-img { width: 100%; height: auto; aspect-ratio: 1 / 1; }
}
</style>
