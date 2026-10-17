<template>
  <div class="am-backdrop" @click.self="close">
    <form class="am-modal" @submit.prevent="save">
      <div class="am-head">
        <div>
          <div class="section-label">Departures</div>
          <h3 class="am-title">{{ adventure.title }}</h3>
        </div>
        <button type="button" class="am-x" :disabled="busy" @click="close">✕</button>
      </div>

      <p class="am-note">Add, re-date or remove departures. A live departure's date is locked. Re-dating an upcoming departure also moves its expedition.</p>

      <div class="dp-list">
        <div class="dp-row dp-hdr"><span>Date</span><span>Spots left</span><span>Status</span><span></span></div>
        <div v-for="(r, i) in rows" :key="r.key" class="dp-row">
          <input v-model="r.date" type="date" class="input" required :disabled="r.locked" :title="r.locked ? 'Live — end the expedition before changing the date' : ''" />
          <input v-model.number="r.spotsLeft" type="number" min="0" class="input" required />
          <select v-model="r.status" class="input">
            <option value="open">open</option>
            <option value="almost-full">almost-full</option>
            <option value="full">full</option>
            <option value="closed">closed</option>
          </select>
          <button type="button" class="dp-del" :disabled="r.locked" :title="r.locked ? 'Live departures cannot be removed' : 'Remove'" @click="rows.splice(i, 1)">✕</button>
        </div>
        <div v-if="!rows.length" class="am-note">No departures yet.</div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" @click="addRow">+ Add departure</button>

      <div v-if="error" class="am-err">{{ error }}</div>
      <div class="am-actions">
        <button type="button" class="btn btn-ghost btn-sm" :disabled="busy" @click="close">Cancel</button>
        <button class="btn btn-primary btn-sm" :disabled="busy">{{ busy ? 'Saving…' : 'Save departures' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
// app/components/admin/DeparturesModal.vue
//
// Edits an adventure's departures (repeatable component) and keeps
// nextDeparture in step. If an upcoming (not live) expedition exists for a
// departure whose date changes, the expedition is moved to the new date.

const props = defineProps({
  adventure: { type: Object, required: true },
  expeditions: { type: Array, default: () => [] }, // this adventure's expeditions
  addNew: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved'])

const day = (d) => String(d || '').slice(0, 10)
const expFor = (date, statuses) => props.expeditions.find(e => day(e.departureDate) === day(date) && statuses.includes(e.status))

let seq = 0
const rows = ref([...(props.adventure.departures || [])]
  .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  .map(d => ({
    key: ++seq, id: d.id, date: day(d.date), originalDate: day(d.date),
    spotsLeft: d.spotsLeft ?? 0, status: d.status || 'open',
    locked: !!expFor(d.date, ['active']),
  })))

function addRow() {
  rows.value.push({ key: ++seq, id: undefined, date: '', originalDate: '', spotsLeft: props.adventure.maxGroup ?? 10, status: 'open', locked: false })
}
if (props.addNew) addRow()

const busy = ref(false)
const error = ref('')
function close() { if (!busy.value) emit('close') }

async function save() {
  error.value = ''
  const dates = rows.value.map(r => r.date)
  if (dates.some(d => !d)) { error.value = 'Every departure needs a date.'; return }
  if (new Set(dates).size !== dates.length) { error.value = 'Two departures have the same date.'; return }

  busy.value = true
  const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10) // Kampala
  const sorted = [...rows.value].sort((a, b) => a.date.localeCompare(b.date))
  const next = sorted.find(r => r.date >= today)?.date || null
  const departures = sorted.map(r => ({
    ...(r.id ? { id: r.id } : {}),
    date: r.date, spotsLeft: Number(r.spotsLeft) || 0, status: r.status,
  }))

  try {
    await $fetch(`/api/cms/adventures/${props.adventure.documentId}`, {
      method: 'PUT',
      body: { data: { departures, nextDeparture: next } },
    })
    // Move upcoming expeditions whose departure was re-dated
    for (const r of rows.value) {
      if (!r.originalDate || r.originalDate === r.date) continue
      const exp = expFor(r.originalDate, ['upcoming'])
      if (exp) {
        await $fetch(`/api/cms/live-expeditions/${exp.documentId}`, { method: 'PUT', body: { data: { departureDate: r.date } } })
      }
    }
    emit('saved')
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Could not save the departures.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.am-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:flex-start; justify-content:center; padding:40px 16px; z-index:300; overflow-y:auto; }
.am-modal { background:var(--charcoal); border:1px solid var(--border); padding:28px; width:100%; max-width:600px; }
.am-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.am-title { font-family:var(--font-display); font-size:30px; color:var(--text); line-height:1.05; }
.am-x { background:none; border:none; color:var(--gray); font-size:18px; cursor:pointer; }
.am-note { font-size:13px; color:var(--gray); margin:6px 0 14px; }
.dp-list { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.dp-row { display:grid; grid-template-columns:1.4fr 1fr 1.2fr 32px; gap:8px; align-items:center; }
.dp-hdr span { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.dp-del { background:none; border:1px solid var(--border); color:var(--gray); height:38px; cursor:pointer; }
.dp-del:hover:not(:disabled) { color:var(--red); border-color:var(--red); }
.dp-del:disabled { opacity:.35; cursor:not-allowed; }
.am-err { color:var(--red); font-size:14px; margin-top:12px; }
.am-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
@media (max-width:520px) { .dp-row { grid-template-columns:1fr 1fr; } }
</style>
