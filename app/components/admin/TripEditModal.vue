<template>
  <div class="am-backdrop" @click.self="close">
    <form class="am-modal" @submit.prevent="save">
      <div class="am-head">
        <div>
          <div class="section-label">Edit Trip</div>
          <h3 class="am-title">{{ form.title || 'Untitled' }}</h3>
        </div>
        <button type="button" class="am-x" :disabled="busy" @click="close">✕</button>
      </div>

      <div class="am-grid">
        <div class="am-field am-span2"><label class="input-label">Title</label><input v-model="form.title" class="input" required maxlength="200" /></div>
        <div class="am-field am-span2"><label class="input-label">Tagline</label><input v-model="form.tagline" class="input" maxlength="300" /></div>

        <div class="am-field"><label class="input-label">Category</label>
          <select v-model="form.category" class="input">
            <option value="">—</option>
            <option v-for="c in ['survival','convoy','mountain','overland','custom']" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="am-field"><label class="input-label">Difficulty</label>
          <select v-model="form.difficulty" class="input">
            <option value="">—</option>
            <option v-for="d in ['beginner','moderate','extreme']" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <div class="am-field"><label class="input-label">Duration</label><input v-model.number="form.duration" class="input" type="number" min="1" /></div>
        <div class="am-field"><label class="input-label">Unit</label>
          <select v-model="form.durationUnit" class="input"><option value="days">days</option><option value="hours">hours</option></select>
        </div>

        <div class="am-field"><label class="input-label">Max group</label><input v-model.number="form.maxGroup" class="input" type="number" min="1" /></div>
        <div class="am-field"><label class="input-label">Total spots</label><input v-model.number="form.spotsTotal" class="input" type="number" min="0" /></div>

        <div class="am-field"><label class="input-label">Altitude</label><input v-model="form.altitude" class="input" placeholder="e.g. 5,109 m" /></div>
        <div class="am-field"><label class="input-label">Terrain</label><input v-model="form.terrain" class="input" /></div>
        <div class="am-field am-span2"><label class="input-label">Location</label><input v-model="form.location" class="input" /></div>

        <div class="am-field"><label class="input-label">Currency</label>
          <select v-model="form.currency" class="input" required>
            <option v-for="c in ['UGX','USD','KES']" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="am-field"><label class="input-label">Essential price</label><input v-model.number="form.basePrice" class="input" type="number" min="0" step="0.01" /></div>
        <div class="am-field"><label class="input-label">Premium price</label><input v-model.number="form.premiumPrice" class="input" type="number" min="0" step="0.01" /></div>
        <div class="am-field"><label class="input-label">VIP price</label><input v-model.number="form.vipPrice" class="input" type="number" min="0" step="0.01" /></div>

        <div class="am-field am-span2"><label class="input-label">Cover image</label><ImageUploadInput v-model="form.image" /></div>
        <label class="am-check am-span2"><input v-model="form.featured" type="checkbox" /> Featured on the home page</label>
      </div>

      <div v-if="error" class="am-err">{{ error }}</div>
      <div class="am-actions">
        <button type="button" class="btn btn-ghost btn-sm" :disabled="busy" @click="close">Cancel</button>
        <button class="btn btn-primary btn-sm" :disabled="busy">{{ busy ? 'Saving…' : 'Save & publish' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
// app/components/admin/TripEditModal.vue
//
// Edits an adventure's main fields. Saved through the admin-only /api/cms
// proxy; a REST PUT publishes the change straight away.
import ImageUploadInput from '~/components/shared/ImageUploadInput.vue'

const props = defineProps({ adventure: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])

const FIELDS = ['title', 'tagline', 'category', 'difficulty', 'duration', 'durationUnit', 'maxGroup', 'spotsTotal',
  'altitude', 'terrain', 'location', 'currency', 'basePrice', 'premiumPrice', 'vipPrice', 'image', 'featured']

const form = reactive(Object.fromEntries(FIELDS.map(f => [f, props.adventure[f] ?? (f === 'featured' ? false : '')])))
if (!form.durationUnit) form.durationUnit = 'days'
if (!form.currency) form.currency = 'USD'

const busy = ref(false)
const error = ref('')

function close() { if (!busy.value) emit('close') }

async function save() {
  busy.value = true; error.value = ''
  const data = {}
  for (const f of FIELDS) {
    const v = form[f]
    data[f] = v === '' ? null : v
  }
  data.title = String(form.title).trim()
  try {
    await $fetch(`/api/cms/adventures/${props.adventure.documentId}`, { method: 'PUT', body: { data } })
    emit('saved')
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Could not save the trip.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.am-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:flex-start; justify-content:center; padding:40px 16px; z-index:300; overflow-y:auto; }
.am-modal { background:var(--charcoal); border:1px solid var(--border); padding:28px; width:100%; max-width:640px; }
.am-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
.am-title { font-family:var(--font-display); font-size:30px; color:var(--text); line-height:1.05; }
.am-x { background:none; border:none; color:var(--gray); font-size:18px; cursor:pointer; }
.am-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 14px; }
.am-field { display:flex; flex-direction:column; gap:6px; }
.am-span2 { grid-column:span 2; }
.am-check { display:flex; gap:8px; align-items:center; font-family:var(--font-condensed); color:var(--light); font-size:14px; }
.am-err { color:var(--red); font-size:14px; margin-top:12px; }
.am-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
@media (max-width:560px) { .am-grid { grid-template-columns:1fr; } .am-span2 { grid-column:span 1; } }
</style>
