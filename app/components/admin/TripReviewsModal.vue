<template>
  <div class="am-backdrop" @click.self="$emit('close')">
    <div class="am-modal">
      <div class="am-head">
        <div>
          <div class="section-label">Reviews</div>
          <h3 class="am-title">{{ adventure.title }}</h3>
        </div>
        <button type="button" class="am-x" @click="$emit('close')">✕</button>
      </div>

      <div v-if="msg" class="am-msg" :class="msg.type">{{ msg.text }}</div>
      <div v-if="loading" class="am-note">Loading…</div>
      <div v-else-if="!reviews.length" class="am-note">No reviews for this trip yet.</div>

      <div v-else class="rv-list">
        <div class="rv-summary">
          <strong>{{ avg }}</strong> ★ average · {{ publishedCount }} published · {{ reviews.length - publishedCount }} draft
        </div>
        <div v-for="r in reviews" :key="r.documentId" class="rv-card">
          <div class="rv-top">
            <span class="rv-stars">{{ '★'.repeat(r.rating || 0) }}<span class="rv-dim">{{ '★'.repeat(5 - (r.rating || 0)) }}</span></span>
            <span class="badge" :class="r.published ? 'badge-confirmed' : 'badge-pending'">{{ r.published ? 'published' : 'draft' }}</span>
          </div>
          <div v-if="r.title" class="rv-title">{{ r.title }}</div>
          <p class="rv-text">{{ r.content }}</p>
          <div class="rv-foot">
            <span>{{ r.author?.name || r.customer?.name || 'Anonymous' }}{{ r.author?.location ? ` · ${r.author.location}` : '' }}{{ r.date ? ` · ${fmt(r.date)}` : '' }}{{ r.verified ? ' · ✓ verified' : '' }}</span>
            <span class="rv-actions">
              <button v-if="!r.published" class="btn btn-primary btn-sm" :disabled="busyId === r.documentId" @click="publish(r)">Publish</button>
              <button class="btn btn-ghost btn-sm" :disabled="busyId === r.documentId" @click="remove(r)">Delete</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// app/components/admin/TripReviewsModal.vue
//
// Lists an adventure's reviews (published + drafts) through the admin-only
// /api/cms proxy. Drafts (e.g. from Data Intake) can be published here.

const props = defineProps({ adventure: { type: Object, required: true } })
const emit = defineEmits(['close', 'changed'])

const loading = ref(true)
const reviews = ref([])
const busyId = ref(null)
const msg = ref(null)

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const publishedCount = computed(() => reviews.value.filter(r => r.published).length)
const avg = computed(() => {
  const p = reviews.value.filter(r => r.published && r.rating)
  return p.length ? (p.reduce((s, r) => s + r.rating, 0) / p.length).toFixed(1) : '—'
})

function query(status) {
  return {
    'filters[adventure][documentId][$eq]': props.adventure.documentId,
    'populate[author]': 'true',
    'populate[customer][fields][0]': 'name',
    sort: 'date:desc',
    'pagination[pageSize]': 100,
    ...(status ? { status } : {}),
  }
}

async function load() {
  loading.value = true
  try {
    const [pub, draft] = await Promise.all([
      $fetch('/api/cms/reviews', { query: query() }),
      $fetch('/api/cms/reviews', { query: query('draft') }),
    ])
    const published = new Set((pub?.data || []).map(r => r.documentId))
    const byId = new Map()
    for (const r of pub?.data || []) byId.set(r.documentId, { ...r, published: true })
    for (const r of draft?.data || []) if (!byId.has(r.documentId)) byId.set(r.documentId, { ...r, published: published.has(r.documentId) })
    reviews.value = [...byId.values()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  } catch (e) {
    msg.value = { type: 'err', text: e?.data?.statusMessage || 'Could not load reviews.' }
  } finally {
    loading.value = false
  }
}

async function publish(r) {
  busyId.value = r.documentId; msg.value = null
  try {
    // A REST PUT without ?status=draft publishes the current draft
    await $fetch(`/api/cms/reviews/${r.documentId}`, { method: 'PUT', body: { data: { verified: !!r.verified } } })
    msg.value = { type: 'ok', text: 'Review published.' }
    await load(); emit('changed')
  } catch (e) {
    msg.value = { type: 'err', text: e?.data?.statusMessage || 'Could not publish.' }
  } finally { busyId.value = null }
}

async function remove(r) {
  if (!window.confirm('Delete this review permanently?')) return
  busyId.value = r.documentId; msg.value = null
  try {
    await $fetch(`/api/cms/reviews/${r.documentId}`, { method: 'DELETE' })
    msg.value = { type: 'ok', text: 'Review deleted.' }
    await load(); emit('changed')
  } catch (e) {
    msg.value = { type: 'err', text: e?.data?.statusMessage || 'Could not delete.' }
  } finally { busyId.value = null }
}

onMounted(load)
</script>

<style scoped>
.am-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:flex-start; justify-content:center; padding:40px 16px; z-index:300; overflow-y:auto; }
.am-modal { background:var(--charcoal); border:1px solid var(--border); padding:28px; width:100%; max-width:680px; }
.am-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.am-title { font-family:var(--font-display); font-size:30px; color:var(--text); line-height:1.05; }
.am-x { background:none; border:none; color:var(--gray); font-size:18px; cursor:pointer; }
.am-note { font-size:14px; color:var(--gray); padding:12px 0; }
.am-msg { padding:10px 14px; margin-bottom:12px; font-family:var(--font-condensed); font-size:14px; border:1px solid; }
.am-msg.ok { color:var(--green-light); border-color:var(--green-light); }
.am-msg.err { color:var(--red); border-color:var(--red); }
.rv-summary { font-family:var(--font-condensed); color:var(--light); margin-bottom:12px; }
.rv-summary strong { color:var(--orange); font-size:18px; }
.rv-list { display:flex; flex-direction:column; gap:10px; }
.rv-card { background:var(--panel); border:1px solid var(--border); padding:14px 16px; }
.rv-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.rv-stars { color:var(--gold); letter-spacing:2px; }
.rv-dim { color:var(--muted); }
.rv-title { font-family:var(--font-condensed); font-weight:700; color:var(--text); margin-bottom:4px; }
.rv-text { font-size:14px; color:var(--light); line-height:1.5; margin-bottom:10px; white-space:pre-line; }
.rv-foot { display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; font-family:var(--font-condensed); font-size:13px; color:var(--gray); }
.rv-actions { display:flex; gap:6px; }
</style>
