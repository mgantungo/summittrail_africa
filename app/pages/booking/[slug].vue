<!--app/pages/booking/[slug].vue-->
<template>
  <div style="padding-top:72px;" v-if="adv">
    <section class="section booking-page">
      <NuxtLink :to="`/adventures/${adv.slug}`" class="back-link">← Back to {{ adv.title }}</NuxtLink>

      <div v-if="!submitted" class="booking-layout">
        <div class="booking-form-col">
          <div class="section-label">Confirm Your Booking</div>
          <h1 class="booking-h1">{{ adv.title }}</h1>

          <div class="form-block">
            <label class="input-label">Your Name *</label>
            <input class="input" v-model="form.name" placeholder="Full name" />
          </div>
          <div class="form-block">
            <label class="input-label">Email *</label>
            <input class="input" type="email" v-model="form.email" placeholder="you@email.com" />
          </div>
          <div class="form-block">
            <label class="input-label">Phone</label>
            <input class="input" v-model="form.phone" placeholder="+256 700 000000" />
          </div>
          <div class="form-block">
            <label class="input-label">Country</label>
            <input class="input" v-model="form.country" placeholder="Uganda" />
          </div>

          <div class="form-row">
            <div class="form-block">
              <label class="input-label">Departure Date *</label>
              <select class="input" v-model="form.departureDate">
                <option value="">— Select a date —</option>
                <option v-for="d in adv.departures" :key="d.date" :value="d.date" :disabled="d.status==='full' || d.status==='closed'">
                  {{ fmt(d.date) }} — {{ d.status === 'full' ? 'Full' : d.status === 'closed' ? 'Closed' : `${d.spotsLeft} spots left` }}
                </option>
              </select>
            </div>
            <div class="form-block">
              <label class="input-label">Participants</label>
              <input class="input" type="number" min="1" v-model.number="form.participants" />
            </div>
          </div>

          <div class="form-block">
            <label class="input-label">Package</label>
            <div class="package-opts">
              <div v-for="pkg in packages" :key="pkg.id" class="package-opt" :class="{ selected: form.package === pkg.id }" @click="form.package = pkg.id">
                <div class="package-opt-name">{{ pkg.label }}</div>
                <div class="package-opt-price">{{ formatMoney(pkg.price, adv.currency) }}</div>
              </div>
            </div>
          </div>

          <div class="form-block" v-if="adv.addons?.length">
            <label class="input-label">Add-ons</label>
            <div class="addon-list">
              <label class="addon-row" v-for="addon in adv.addons" :key="addon.key">
                <input type="checkbox" :value="addon.key" v-model="form.addons" />
                <span>{{ addon.label }}</span>
                <span class="addon-row-price">+{{ formatMoney(addon.price, adv.currency) }}</span>
              </label>
            </div>
          </div>

          <div class="form-block">
            <label class="input-label">Anything we should know?</label>
            <textarea class="input" v-model="form.notes" rows="3" placeholder="Dietary needs, medical conditions, special requests…" />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>

        <div class="booking-summary-col">
          <div class="summary-card">
            <img :src="adv.image" :alt="adv.title" class="summary-img" />
            <div class="summary-body">
              <div class="summary-line"><span>Package</span><strong>{{ selectedPackageLabel }}</strong></div>
              <div class="summary-line"><span>Participants</span><strong>{{ form.participants }}</strong></div>
              <div class="summary-line"><span>Departure</span><strong>{{ form.departureDate ? fmt(form.departureDate) : '—' }}</strong></div>
              <div class="summary-total"><span>Total</span><strong>{{ formatMoney(total, adv.currency) }}</strong></div>
              <button class="btn btn-primary btn-full" :disabled="!canSubmit || submitting" @click="submitBooking">
                {{ submitting ? 'Submitting…' : 'Confirm Booking' }}
              </button>
              <p class="summary-note">You'll receive a confirmation email with payment instructions. No payment is taken on this page yet.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="booking-success">
        <div class="success-icon">✅</div>
        <h2>Booking Request Received</h2>
        <p>Reference: <strong>{{ bookingReference }}</strong></p>
        <p>We've logged your request for <strong>{{ adv.title }}</strong>. Our team will reach out at {{ form.email }} to confirm details and arrange payment.</p>
        <div style="display:flex; gap:14px; justify-content:center; margin-top:24px;">
          <NuxtLink to="/" class="btn btn-primary">Back to Home</NuxtLink>
          <NuxtLink to="/adventures" class="btn btn-outline">Browse More Adventures</NuxtLink>
        </div>
      </div>
    </section>
  </div>
  <div v-else style="padding-top:120px;text-align:center;">
    <p style="color:var(--gray);font-size:18px;">Adventure not found.</p>
    <NuxtLink to="/adventures" class="btn btn-ghost" style="margin-top:16px;">← Browse Adventures</NuxtLink>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: adv } = await useAdventure(computed(() => route.params.slug))

useHead(() => ({ title: adv.value ? `Book ${adv.value.title} – Summit Trail` : 'Book Your Adventure' }))

const form = reactive({
  name: '', email: '', phone: '', country: '',
  departureDate: route.query.date || '',
  package: route.query.pkg || 'essential',
  participants: 1,
  addons: [],
  notes: '',
})

const packages = computed(() => adv.value ? [
  { id: 'essential', label: 'Essential', price: adv.value.basePrice },
  { id: 'premium',   label: 'Premium + Gear', price: adv.value.premiumPrice },
  { id: 'vip',       label: 'VIP Private', price: adv.value.vipPrice },
] : [])

const selectedPackageLabel = computed(() => packages.value.find(p => p.id === form.package)?.label || '—')

const total = computed(() => {
  if (!adv.value) return 0
  const pkg = packages.value.find(p => p.id === form.package)
  const base = (pkg?.price || adv.value.basePrice || 0) * (form.participants || 1)
  const addonsTotal = form.addons.reduce((sum, key) => {
    const a = (adv.value.addons || []).find(a => a.key === key)
    return sum + (a?.price || 0)
  }, 0)
  return base + addonsTotal
})

const canSubmit = computed(() => form.name && form.email && form.departureDate && form.participants > 0)

const submitting = ref(false)
const submitted = ref(false)
const bookingReference = ref('')
const error = ref(null)

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

async function submitBooking() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = null
  try {
    const result = await $fetch('/api/bookings/create', {
      method: 'POST',
      body: {
        customer: { name: form.name, email: form.email, phone: form.phone, country: form.country },
        adventureId: adv.value.documentId || adv.value.id,
        adventureSlug: adv.value.slug,
        departureDate: form.departureDate,
        package: form.package,
        participants: form.participants,
        addons: form.addons,
        total: total.value,
        notes: form.notes,
      },
    })
    bookingReference.value = result.reference
    submitted.value = true
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Could not submit your booking. Please try again or contact us directly.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-page { max-width: 1100px; margin: 0 auto; }
.back-link { display: inline-block; color: var(--gray); font-family: var(--font-condensed); font-size: 13px; text-decoration: none; margin-bottom: 20px; }
.back-link:hover { color: var(--orange); }
.booking-h1 { font-family: var(--font-display); font-size: clamp(32px, 5vw, 48px); color: var(--text); margin-bottom: 28px; }
.booking-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; padding-bottom: 80px; }
.form-block { margin-bottom: 18px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.input-label { display: block; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }
.package-opts { display: flex; gap: 10px; flex-wrap: wrap; }
.package-opt { flex: 1; min-width: 140px; border: 1px solid var(--border); padding: 14px; text-align: center; cursor: pointer; border-radius: 4px; }
.package-opt.selected { border-color: var(--orange); background: rgba(232,98,42,0.08); }
.package-opt-name { font-family: var(--font-condensed); font-weight: 700; color: var(--text); font-size: 14px; }
.package-opt-price { color: var(--orange); font-family: var(--font-display); font-size: 20px; margin-top: 4px; }
.addon-list { display: flex; flex-direction: column; gap: 8px; }
.addon-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--light); cursor: pointer; }
.addon-row-price { margin-left: auto; color: var(--orange); }
.error-msg { color: var(--red); font-size: 13px; margin-top: 10px; }
.summary-card { background: var(--panel); border: 1px solid var(--border); position: sticky; top: 90px; }
.summary-img { width: 100%; height: 160px; object-fit: cover; }
.summary-body { padding: 22px; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; color: var(--light); margin-bottom: 10px; }
.summary-total { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-top: 1px solid var(--border); margin: 10px 0 18px; font-family: var(--font-display); font-size: 24px; color: var(--orange); }
.summary-note { font-size: 12px; color: var(--gray); margin-top: 12px; line-height: 1.5; }
.booking-success { text-align: center; padding: 60px 20px 100px; max-width: 560px; margin: 0 auto; }
.success-icon { font-size: 56px; margin-bottom: 16px; }
.booking-success h2 { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 16px; }
.booking-success p { color: var(--light); line-height: 1.6; margin-bottom: 8px; }
@media (max-width: 800px) {
  .booking-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>