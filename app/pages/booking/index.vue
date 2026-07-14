<!--app/pages/booking/index.vue-->
<template>
  <div style="padding-top:72px;">
    <div class="booking-wizard">
      <!-- Step sidebar -->
      <aside class="wiz-sidebar">
        <div class="wiz-step" v-for="s in steps" :key="s.num" :class="{ done: step > s.num, active: step === s.num }">
          <div class="wiz-step-badge">
            <span v-if="step > s.num">✓</span>
            <span v-else>{{ s.num }}</span>
          </div>
          <div class="wiz-step-body">
            <div class="wiz-step-title">{{ s.title }}</div>
            <div class="wiz-step-sub">{{ s.sub }}</div>
          </div>
        </div>
      </aside>

      <!-- Step content -->
      <main class="wiz-main">
        <!-- STEP 1: Select Adventure -->
        <div v-if="step === 1">
          <h1 class="wiz-h1">Select Adventure</h1>
          <div class="adv-pick-grid">
            <div
              v-for="a in adventures" :key="a.id"
              class="adv-pick-card" :class="{ selected: selectedAdventure?.id === a.id }"
              @click="selectAdventure(a)"
            >
              <div class="adv-pick-img" :style="{ backgroundImage: `url(${a.image})` }" />
              <div class="adv-pick-body">
                <div class="adv-pick-title">{{ a.title }}</div>
                <div class="adv-pick-meta">{{ a.difficulty }} · {{ a.duration }} {{ a.durationUnit }} · from ${{ a.basePrice }}</div>
              </div>
            </div>
          </div>
          <div class="wiz-actions">
            <button class="btn btn-primary" :disabled="!selectedAdventure" @click="step = 2">Continue →</button>
          </div>
        </div>

        <!-- STEP 2: Date & Package -->
        <div v-else-if="step === 2 && selectedAdventure">
          <h1 class="wiz-h1">Select Date &amp; Package</h1>

          <div class="date-package-layout">
            <div class="cal-col">
              <div class="cal-label">Departure Date</div>
              <div class="cal-nav-row">
                <button class="btn btn-ghost btn-sm" @click="prevMonth">← Prev</button>
                <div class="cal-month-title">{{ monthTitle }}</div>
                <button class="btn btn-ghost btn-sm" @click="nextMonth">Next →</button>
              </div>

              <div class="month-grid">
                <div class="cal-head" v-for="d in dayHeaders" :key="d">{{ d }}</div>
                <div
                  v-for="day in calDays" :key="day.key"
                  class="cal-cell"
                  :class="{
                    'cal-cell--empty': !day.date,
                    'cal-cell--scheduled': day.departure,
                    'cal-cell--unavailable': day.date && !day.departure && day.isPast,
                    'cal-cell--selected': day.date === form.departureDate,
                  }"
                  @click="day.departure && !day.departure.disabled && (form.departureDate = day.date)"
                >
                  <span v-if="day.date">{{ day.num }}</span>
                </div>
              </div>

              <div class="cal-legend">
                <span><i class="dot dot-scheduled" /> Scheduled Trip</span>
                <span><i class="dot dot-available" /> Available</span>
                <span><i class="dot dot-unavailable" /> Unavailable</span>
              </div>
            </div>

            <div class="package-col">
              <div class="cal-label">Package</div>
              <div
                v-for="pkg in packages" :key="pkg.id"
                class="package-opt" :class="{ selected: form.package === pkg.id }"
                @click="form.package = pkg.id"
              >
                <div class="package-opt-name">{{ pkg.label }}</div>
                <div class="package-opt-desc">{{ pkg.desc }}</div>
                <div class="package-opt-price">${{ pkg.price?.toLocaleString() }}</div>
              </div>

              <div class="cal-label" style="margin-top:24px;" v-if="selectedAdventure.addons?.length">Add-ons</div>
              <label class="addon-row" v-for="addon in selectedAdventure.addons" :key="addon.key">
                <input type="checkbox" :value="addon.key" v-model="form.addons" />
                <span>{{ addon.label }}</span>
                <span class="addon-row-price">+${{ addon.price }}</span>
              </label>
            </div>
          </div>

          <div class="wiz-actions">
            <button class="btn btn-ghost" @click="step = 1">← Back</button>
            <button class="btn btn-primary" :disabled="!form.departureDate" @click="step = 3">Continue →</button>
          </div>
        </div>

        <!-- STEP 3: Participant Details -->
        <div v-else-if="step === 3">
          <h1 class="wiz-h1">Participant Details</h1>
          <div class="form-grid">
            <div class="field"><label class="input-label">Your Name *</label><input class="input" v-model="form.name" /></div>
            <div class="field"><label class="input-label">Email *</label><input class="input" type="email" v-model="form.email" /></div>
            <div class="field"><label class="input-label">Phone</label><input class="input" v-model="form.phone" /></div>
            <div class="field"><label class="input-label">Country</label><input class="input" v-model="form.country" /></div>
            <div class="field"><label class="input-label">Participants</label><input class="input" type="number" min="1" v-model.number="form.participants" /></div>
          </div>
          <div class="field-block">
            <label class="input-label">Anything we should know?</label>
            <textarea class="input" v-model="form.notes" rows="3" placeholder="Dietary needs, medical conditions, special requests…" />
          </div>
          <div class="wiz-actions">
            <button class="btn btn-ghost" @click="step = 2">← Back</button>
            <button class="btn btn-primary" :disabled="!form.name || !form.email" @click="step = 4">Continue →</button>
          </div>
        </div>

        <!-- STEP 4: Payment / Review -->
        <div v-else-if="step === 4">
          <div v-if="!submitted">
            <h1 class="wiz-h1">Review &amp; Confirm</h1>
            <div class="review-card">
              <div class="review-row"><span>Adventure</span><strong>{{ selectedAdventure.title }}</strong></div>
              <div class="review-row"><span>Departure</span><strong>{{ fmt(form.departureDate) }}</strong></div>
              <div class="review-row"><span>Package</span><strong>{{ selectedPackageLabel }}</strong></div>
              <div class="review-row"><span>Participants</span><strong>{{ form.participants }}</strong></div>
              <div class="review-row"><span>Name</span><strong>{{ form.name }}</strong></div>
              <div class="review-row"><span>Email</span><strong>{{ form.email }}</strong></div>
              <div class="review-total"><span>Total</span><strong>${{ total.toLocaleString() }}</strong></div>
            </div>
            <p class="summary-note">No payment is taken on this page — you'll receive a confirmation email with payment instructions.</p>
            <div v-if="error" class="error-msg">{{ error }}</div>
            <div class="wiz-actions">
              <button class="btn btn-ghost" @click="step = 3">← Back</button>
              <button class="btn btn-primary" :disabled="submitting" @click="submitBooking">
                {{ submitting ? 'Submitting…' : 'Confirm Booking' }}
              </button>
            </div>
          </div>
          <div v-else class="booking-success">
            <div class="success-icon">✅</div>
            <h2>Booking Request Received</h2>
            <p>Reference: <strong>{{ bookingReference }}</strong></p>
            <p>We've logged your request for <strong>{{ selectedAdventure.title }}</strong>. Our team will reach out at {{ form.email }} to confirm details and arrange payment.</p>
            <div style="display:flex; gap:14px; justify-content:center; margin-top:24px;">
              <NuxtLink to="/" class="btn btn-primary">Back to Home</NuxtLink>
              <NuxtLink to="/adventures" class="btn btn-outline">Browse More Adventures</NuxtLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Book Your Adventure – Summit Trail' })

const { data: adventures } = await useAdventures()

const steps = [
  { num: 1, title: 'Select Adventure',    sub: 'Choose your expedition' },
  { num: 2, title: 'Date & Package',      sub: 'Pick departure + package' },
  { num: 3, title: 'Participant Details', sub: 'Names, contacts, docs' },
  { num: 4, title: 'Payment',             sub: 'Secure checkout' },
]
const step = ref(1)
const selectedAdventure = ref(null)

function selectAdventure(a) {
  selectedAdventure.value = a
  form.departureDate = ''
  form.package = 'essential'
  form.addons = []
}

const form = reactive({
  name: '', email: '', phone: '', country: '',
  departureDate: '', package: 'essential', participants: 1, addons: [], notes: '',
})

// ── Calendar (month + year header was the missing piece) ────────────────
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())
const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthTitle = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)
function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- } else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ } else viewMonth.value++
}

const calDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)
  const departures = selectedAdventure.value?.departures || []

  const days = []
  for (let i = 0; i < offset; i++) days.push({ key: `empty-${i}`, date: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dep = departures.find(x => x.date === dateStr)
    const cellDate = new Date(year, month, d)
    days.push({
      key: dateStr, date: dateStr, num: d,
      departure: dep ? { ...dep, disabled: dep.status === 'full' || dep.status === 'closed' } : null,
      isPast: cellDate < today,
    })
  }
  return days
})

// ── Packages & totals ────────────────────────────────────────────────────
const packages = computed(() => selectedAdventure.value ? [
  { id: 'essential', label: 'Essential',      desc: 'Core experience, bring your own gear', price: selectedAdventure.value.basePrice },
  { id: 'premium',   label: 'Premium + Gear',  desc: 'Includes full gear rental kit',        price: selectedAdventure.value.premiumPrice },
  { id: 'vip',       label: 'VIP Private',     desc: 'Private group, dedicated vehicle, priority support', price: selectedAdventure.value.vipPrice },
] : [])

const selectedPackageLabel = computed(() => packages.value.find(p => p.id === form.package)?.label || '—')

const total = computed(() => {
  if (!selectedAdventure.value) return 0
  const pkg = packages.value.find(p => p.id === form.package)
  const base = (pkg?.price || selectedAdventure.value.basePrice || 0) * (form.participants || 1)
  const addonsTotal = form.addons.reduce((sum, key) => {
    const a = (selectedAdventure.value.addons || []).find(a => a.key === key)
    return sum + (a?.price || 0)
  }, 0)
  return base + addonsTotal
})

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

// ── Submit ────────────────────────────────────────────────────────────────
const submitting = ref(false)
const submitted = ref(false)
const bookingReference = ref('')
const error = ref(null)

async function submitBooking() {
  submitting.value = true
  error.value = null
  try {
    const result = await $fetch('/api/bookings/create', {
      method: 'POST',
      body: {
        customer: { name: form.name, email: form.email, phone: form.phone, country: form.country },
        adventureId: selectedAdventure.value.documentId || selectedAdventure.value.id,
        adventureSlug: selectedAdventure.value.slug,
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
.booking-wizard { display: grid; grid-template-columns: 300px 1fr; max-width: 1200px; margin: 0 auto; gap: 0; padding-bottom: 80px; }
.wiz-sidebar { border-right: 1px solid var(--border); padding: 40px 24px; }
.wiz-step { display: flex; gap: 14px; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
.wiz-step:last-child { border-bottom: none; }
.wiz-step-badge {
  width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-family: var(--font-condensed); font-weight: 700; color: var(--gray);
}
.wiz-step.done .wiz-step-badge { background: var(--green-light); border-color: var(--green-light); color: var(--black); }
.wiz-step.active .wiz-step-badge { border-color: var(--orange); color: var(--orange); }
.wiz-step-title { font-family: var(--font-condensed); font-weight: 700; color: var(--gray); font-size: 15px; }
.wiz-step.active .wiz-step-title { color: var(--orange); }
.wiz-step-sub { font-size: 12px; color: var(--gray); margin-top: 2px; }
.wiz-main { padding: 40px; }
.wiz-h1 { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 28px; }
.wiz-actions { display: flex; gap: 14px; margin-top: 28px; }

.adv-pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.adv-pick-card { border: 1px solid var(--border); cursor: pointer; border-radius: 4px; overflow: hidden; transition: border-color 0.2s; }
.adv-pick-card.selected { border-color: var(--orange); box-shadow: 0 0 0 1px var(--orange); }
.adv-pick-img { height: 120px; background-size: cover; background-position: center; }
.adv-pick-body { padding: 14px; }
.adv-pick-title { font-family: var(--font-condensed); font-weight: 700; color: var(--text); font-size: 14px; margin-bottom: 4px; }
.adv-pick-meta { font-size: 12px; color: var(--gray); }

.date-package-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; }
.cal-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 14px; }
.cal-nav-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-month-title { font-family: var(--font-display); font-size: 20px; color: var(--text); }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cal-head { font-family: var(--font-condensed); font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--gray); text-align: center; padding-bottom: 6px; }
.cal-cell {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  background: var(--panel); border: 1px solid transparent; font-family: var(--font-condensed); font-weight: 600; color: var(--light);
  border-radius: 3px; cursor: default;
}
.cal-cell--empty { background: none; }
.cal-cell--scheduled { background: rgba(232,98,42,0.15); color: var(--orange); cursor: pointer; font-weight: 700; }
.cal-cell--scheduled:hover { background: rgba(232,98,42,0.3); }
.cal-cell--unavailable { color: var(--gray); opacity: 0.4; }
.cal-cell--selected { background: var(--orange) !important; color: var(--black) !important; }
.cal-legend { display: flex; gap: 18px; margin-top: 16px; font-size: 12px; color: var(--gray); }
.cal-legend .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; }
.dot-scheduled { background: var(--orange); }
.dot-available { background: var(--gray); opacity: 0.5; }
.dot-unavailable { background: var(--gray); opacity: 0.25; }

.package-col .package-opt { border: 1px solid var(--border); padding: 16px; border-radius: 4px; margin-bottom: 10px; cursor: pointer; }
.package-opt.selected { border-color: var(--orange); background: rgba(232,98,42,0.08); }
.package-opt-name { font-family: var(--font-condensed); font-weight: 700; color: var(--text); font-size: 15px; }
.package-opt-desc { font-size: 12px; color: var(--gray); margin: 4px 0 8px; }
.package-opt-price { color: var(--orange); font-family: var(--font-display); font-size: 22px; }
.addon-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--light); cursor: pointer; padding: 6px 0; }
.addon-row-price { margin-left: auto; color: var(--orange); }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
.input-label { display: block; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }

.review-card { background: var(--panel); border: 1px solid var(--border); padding: 24px; margin-bottom: 16px; }
.review-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--light); }
.review-total { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-top: 8px; font-family: var(--font-display); font-size: 26px; color: var(--orange); }
.summary-note { font-size: 12px; color: var(--gray); margin-bottom: 16px; }
.error-msg { color: var(--red); font-size: 13px; margin-bottom: 10px; }

.booking-success { text-align: center; padding: 40px 20px; max-width: 560px; margin: 0 auto; }
.success-icon { font-size: 56px; margin-bottom: 16px; }
.booking-success h2 { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 16px; }
.booking-success p { color: var(--light); line-height: 1.6; margin-bottom: 8px; }

@media (max-width: 900px) {
  .booking-wizard { grid-template-columns: 1fr; }
  .wiz-sidebar { display: flex; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 20px; gap: 20px; }
  .wiz-step { border-bottom: none; margin-bottom: 0; padding-bottom: 0; min-width: 180px; }
  .date-package-layout { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>