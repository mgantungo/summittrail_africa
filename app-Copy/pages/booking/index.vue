<!--app/pages/booking/index.vue-->
<template>
  <div class="booking-page" style="padding-top:72px;">
    <div class="booking-header section">
      <div class="section-label">Reservations</div>
      <h1 class="section-title">Book Your<br><span>Expedition</span></h1>
    </div>

    <div class="booking-layout section" style="padding-top:0;">
      <!-- Steps sidebar -->
      <div class="flow-steps">
        <div
          v-for="(step, i) in steps" :key="step.label"
          class="flow-step"
          :class="{ active: currentStep === i, done: currentStep > i }"
        >
          <div class="step-num">
            <span v-if="currentStep <= i">{{ i + 1 }}</span>
            <span v-else>✓</span>
          </div>
          <div class="step-info">
            <div class="step-title">{{ step.label }}</div>
            <div class="step-desc">{{ step.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Step content -->
      <div class="flow-main">

        <!-- Step 0: Select Adventure -->
        <div v-if="currentStep === 0">
          <div class="flow-title">Choose Your Adventure</div>
          <div class="adv-pick-grid">
            <div
              v-for="adv in adventures"
              :key="adv.id"
              class="adv-pick-card"
              :class="{ selected: form.adventure === adv.id }"
              @click="form.adventure = adv.id; form.adventureSlug = adv.slug"
            >
              <img :src="adv.image" :alt="adv.title" class="adv-pick-img" loading="lazy" />
              <div class="adv-pick-overlay" />
              <div class="adv-pick-content">
                <span class="badge" :class="`badge-${adv.difficulty}`">{{ adv.difficulty }}</span>
                <div class="adv-pick-title">{{ adv.title }}</div>
                <div class="adv-pick-price">From ${{ adv.basePrice.toLocaleString() }}</div>
              </div>
              <div v-if="form.adventure === adv.id" class="adv-pick-selected">✓ Selected</div>
            </div>
          </div>
        </div>

        <!-- Step 1: Date & Package -->
        <div v-if="currentStep === 1">
          <div class="flow-title">Select Date & Package</div>
          <div class="step1-layout">
            <div>
              <label class="input-label">Departure Date</label>
              <div class="calendar-grid">
                <div class="cal-day-header" v-for="d in ['MON','TUE','WED','THU','FRI','SAT','SUN']" :key="d">{{ d }}</div>
                <div
                  v-for="day in calDays" :key="day.num"
                  class="cal-day"
                  :class="{
                    available: day.available,
                    'has-trip': day.hasTrip,
                    selected: form.date === day.dateStr,
                    empty: !day.num
                  }"
                  @click="day.available && (form.date = day.dateStr)"
                >
                  {{ day.num }}
                </div>
              </div>
              <div class="cal-legend">
                <span><span class="cal-dot" style="background:var(--orange);" />Scheduled Trip</span>
                <span><span class="cal-dot" style="background:var(--muted);" />Available</span>
                <span><span class="cal-dot" style="background:rgba(255,255,255,0.1);" />Unavailable</span>
              </div>
            </div>
            <div>
              <label class="input-label">Package</label>
              <div class="package-opts" style="margin-bottom:24px;">
                <div
                  v-for="pkg in selectedPackages"
                  :key="pkg.id"
                  class="package-opt"
                  :class="{ selected: form.package === pkg.id }"
                  @click="form.package = pkg.id"
                >
                  <div>
                    <div class="pkg-name">{{ pkg.label }}</div>
                    <div style="font-size:12px; color:var(--gray); margin-top:4px;">{{ pkg.desc }}</div>
                  </div>
                  <div class="pkg-price">${{ pkg.price.toLocaleString() }}</div>
                </div>
              </div>
              <label class="input-label">Add-ons</label>
              <div class="addons">
                <div
                  v-for="addon in selectedAddons"
                  :key="addon.id"
                  class="addon"
                  @click="toggleAddon(addon.id)"
                >
                  <div class="addon-check" :class="{ checked: form.addons.includes(addon.id) }" />
                  <span class="addon-label">{{ addon.label }}</span>
                  <span class="addon-price">+${{ addon.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Participant details -->
        <div v-if="currentStep === 2">
          <div class="flow-title">Participant Details</div>
          <div class="form-grid">
            <div class="form-field">
              <label class="input-label">First Name</label>
              <input class="input" v-model="form.firstName" placeholder="Alex" />
            </div>
            <div class="form-field">
              <label class="input-label">Last Name</label>
              <input class="input" v-model="form.lastName" placeholder="Mwangi" />
            </div>
            <div class="form-field">
              <label class="input-label">Email Address</label>
              <input class="input" v-model="form.email" type="email" placeholder="you@email.com" />
            </div>
            <div class="form-field">
              <label class="input-label">Phone Number</label>
              <input class="input" v-model="form.phone" placeholder="+256 700 000000" />
            </div>
            <div class="form-field">
              <label class="input-label">Country</label>
              <input class="input" v-model="form.country" placeholder="Uganda" />
            </div>
            <div class="form-field">
              <label class="input-label">Number of Participants</label>
              <select class="input" v-model.number="form.participants">
                <option v-for="n in 8" :key="n" :value="n">{{ n }} person{{ n > 1 ? 's' : '' }}</option>
              </select>
            </div>
            <div class="form-field form-field--full">
              <label class="input-label">Special Requirements / Medical Notes</label>
              <textarea class="input" v-model="form.notes" rows="3" placeholder="Any dietary requirements, medical conditions, or special requests..." style="resize:vertical;" />
            </div>
            <div class="form-field form-field--full">
              <label class="input-label">Upload ID Document (optional)</label>
              <div class="upload-box" @dragover.prevent @drop.prevent="handleDrop">
                <div class="upload-icon">📁</div>
                <div class="upload-text">Drag & drop or <span style="color:var(--orange); cursor:pointer;" @click="$refs.fileInput.click()">browse files</span></div>
                <div class="upload-hint">Passport or National ID · PDF, JPG, PNG · Max 5MB</div>
                <input ref="fileInput" type="file" style="display:none;" accept=".pdf,.jpg,.jpeg,.png" @change="handleFile" />
                <div v-if="form.document" class="upload-done">✅ {{ form.document }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment -->
        <div v-if="currentStep === 3">
          <div class="flow-title">Payment</div>
          <div class="payment-layout">
            <div>
              <label class="input-label">Payment Method</label>
              <div class="payment-methods">
                <div
                  v-for="pm in paymentMethods"
                  :key="pm.id"
                  class="pay-method"
                  :class="{ selected: form.paymentMethod === pm.id }"
                  @click="form.paymentMethod = pm.id"
                >
                  <div class="pay-icon">{{ pm.icon }}</div>
                  <div class="pay-name">{{ pm.label }}</div>
                  <div class="pay-desc">{{ pm.desc }}</div>
                </div>
              </div>

              <!-- Mobile Money fields -->
              <div v-if="form.paymentMethod === 'mtn' || form.paymentMethod === 'airtel'" class="pm-fields">
                <label class="input-label">Mobile Money Number</label>
                <input class="input" v-model="form.momoNumber" :placeholder="form.paymentMethod === 'mtn' ? '077XXXXXXX' : '075XXXXXXX'" />
                <div style="font-size:13px; color:var(--gray); margin-top:8px;">You will receive a prompt on your phone to confirm the payment.</div>
              </div>

              <!-- Card fields -->
              <div v-if="form.paymentMethod === 'card'" class="pm-fields">
                <label class="input-label">Card Number</label>
                <input class="input" v-model="form.cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" />
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
                  <div>
                    <label class="input-label">Expiry</label>
                    <input class="input" v-model="form.cardExpiry" placeholder="MM/YY" maxlength="5" />
                  </div>
                  <div>
                    <label class="input-label">CVV</label>
                    <input class="input" v-model="form.cardCvv" placeholder="123" maxlength="3" />
                  </div>
                </div>
              </div>

              <!-- Installment -->
              <div v-if="form.paymentMethod === 'installment'" class="pm-fields">
                <div class="installment-plan">
                  <div class="inst-item" v-for="inst in installmentPlan" :key="inst.label">
                    <div class="inst-label">{{ inst.label }}</div>
                    <div class="inst-amount">${{ inst.amount }}</div>
                    <div class="inst-due">Due: {{ inst.due }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="order-summary">
              <div class="os-title">Order Summary</div>
              <div class="os-row" v-if="selectedAdv">
                <span>{{ selectedAdv.title.split('–')[0] }}</span>
                <span>${{ selectedPkg?.price?.toLocaleString() }}</span>
              </div>
              <div class="os-row" v-for="addon in selectedAddonItems" :key="addon.id">
                <span>{{ addon.label }}</span>
                <span>+${{ addon.price }}</span>
              </div>
              <div class="os-divider" />
              <div class="os-total">
                <span>Total</span>
                <span>${{ grandTotal.toLocaleString() }}</span>
              </div>
              <div v-if="form.participants > 1" class="os-note">× {{ form.participants }} participants</div>
              <div class="os-security">🔒 Secured with SSL · Payments processed safely</div>
            </div>
          </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div v-if="currentStep === 4" class="confirmation">
          <div class="conf-icon">🏔️</div>
          <h2 class="conf-title">You're Booked!</h2>
          <div class="conf-id">Booking ID: <strong>STL-{{ bookingId }}</strong></div>
          <p class="conf-text">
            A confirmation has been sent to <strong>{{ form.email }}</strong>.
            Your digital itinerary and preparation checklist are ready in your
            <NuxtLink to="/dashboard" style="color:var(--orange);">Dashboard</NuxtLink>.
          </p>
          <div class="conf-details">
            <div class="conf-row"><span>Adventure</span><span>{{ selectedAdv?.title }}</span></div>
            <div class="conf-row"><span>Departure</span><span>{{ formatDate(form.date) }}</span></div>
            <div class="conf-row"><span>Participants</span><span>{{ form.participants }}</span></div>
            <div class="conf-row"><span>Total Paid</span><span style="color:var(--orange);">${{ grandTotal.toLocaleString() }}</span></div>
          </div>
          <div class="conf-actions">
            <NuxtLink to="/dashboard" class="btn btn-primary btn-lg">Go to Dashboard →</NuxtLink>
            <NuxtLink to="/adventures" class="btn btn-outline btn-lg">Book Another</NuxtLink>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flow-nav" v-if="currentStep < 4">
          <button v-if="currentStep > 0" class="btn btn-ghost" @click="currentStep--">← Back</button>
          <div style="flex:1;" />
          <button
            v-if="currentStep < 3"
            class="btn btn-primary btn-lg"
            :disabled="!canProceed"
            @click="next"
          >Continue →</button>
          <button
            v-if="currentStep === 3"
            class="btn btn-primary btn-lg"
            :disabled="!form.paymentMethod || submitting"
            @click="submit"
          >{{ submitting ? 'Processing...' : `Pay $${grandTotal.toLocaleString()} Now` }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { adventures } from '~~/data/demo.js'
import { useProfileStore } from '~/stores/profile'
import { useAnalyticsStore } from '~/stores/analytics'

const profile = useProfileStore()
const analytics = useAnalyticsStore()
const route = useRoute()

useHead({ title: 'Book an Expedition – Summit Trail' })

const currentStep = ref(0)
const submitting = ref(false)
const bookingId = ref('')

const form = reactive({
  adventure: route.query.adventure || '',
  adventureSlug: '',
  date: '',
  package: 'essential',
  addons: [],
  participants: 1,
  firstName: profile.user?.name?.split(' ')[0] || '',
  lastName: profile.user?.name?.split(' ')[1] || '',
  email: profile.user?.email || '',
  phone: profile.user?.phone || '',
  country: profile.user?.country || '',
  notes: '',
  document: '',
  paymentMethod: '',
  momoNumber: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
})

const steps = [
  { label: 'Select Adventure', desc: 'Choose your expedition' },
  { label: 'Date & Package', desc: 'Pick departure + package' },
  { label: 'Participant Details', desc: 'Names, contacts, docs' },
  { label: 'Payment', desc: 'Secure checkout' },
]

const selectedAdv = computed(() => adventures.find(a => a.id === form.adventure))

const selectedPackages = computed(() => {
  if (!selectedAdv.value) return []
  return [
    { id: 'essential', label: 'Essential', price: selectedAdv.value.basePrice, desc: 'Core experience, bring your own gear' },
    { id: 'premium', label: 'Premium + Gear', price: selectedAdv.value.premiumPrice, desc: 'Includes full gear rental kit' },
    { id: 'vip', label: 'VIP Private', price: selectedAdv.value.vipPrice, desc: 'Private group, dedicated vehicle, priority support' },
  ]
})

const selectedPkg = computed(() => selectedPackages.value.find(p => p.id === form.package))
const selectedAddons = computed(() => selectedAdv.value?.addons || [])
const selectedAddonItems = computed(() => selectedAddons.value.filter(a => form.addons.includes(a.id)))

const grandTotal = computed(() => {
  const base = selectedPkg.value?.price || 0
  const addonsTotal = selectedAddonItems.value.reduce((s, a) => s + a.price, 0)
  return (base + addonsTotal) * form.participants
})

const installmentPlan = computed(() => {
  const total = grandTotal.value
  return [
    { label: '1st Payment (30%)', amount: Math.round(total * 0.3), due: 'Today' },
    { label: '2nd Payment (40%)', amount: Math.round(total * 0.4), due: '30 days before trip' },
    { label: 'Final Payment (30%)', amount: Math.round(total * 0.3), due: '7 days before trip' },
  ]
})

const paymentMethods = [
  { id: 'mtn', icon: '📱', label: 'MTN MoMo', desc: 'Mobile Money prompt' },
  { id: 'airtel', icon: '📱', label: 'Airtel Money', desc: 'Mobile Money prompt' },
  { id: 'card', icon: '💳', label: 'Visa / Mastercard', desc: 'Secure card payment' },
  { id: 'paypal', icon: '🌐', label: 'PayPal', desc: 'International transfer' },
  { id: 'stripe', icon: '💙', label: 'Stripe', desc: 'Global card gateway' },
  { id: 'installment', icon: '📅', label: 'Installments', desc: 'Pay in 3 parts' },
]

// Calendar logic – generate April 2025
const calDays = computed(() => {
  const tripDates = selectedAdv.value?.departures.map(d => d.date) || []
  const days = []
  // Offset for Monday start
  const firstDay = new Date(2025, 3, 1).getDay() // April 2025 starts Tuesday (2), but adjust for Mon=0
  const offset = firstDay === 0 ? 6 : firstDay - 1
  for (let i = 0; i < offset; i++) days.push({ num: '', available: false, hasTrip: false, dateStr: '' })
  for (let d = 1; d <= 30; d++) {
    const dateStr = `2025-04-${String(d).padStart(2, '0')}`
    const hasTrip = tripDates.includes(dateStr)
    days.push({ num: d, available: d >= 10, hasTrip, dateStr })
  }
  return days
})

const canProceed = computed(() => {
  if (currentStep.value === 0) return !!form.adventure
  if (currentStep.value === 1) return !!form.date
  if (currentStep.value === 2) return form.firstName && form.email && form.phone
  return true
})

function toggleAddon(id) {
  const idx = form.addons.indexOf(id)
  if (idx === -1) form.addons.push(id)
  else form.addons.splice(idx, 1)
}

function next() {
  if (canProceed.value) currentStep.value++
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function handleFile(e) {
  const f = e.target.files[0]
  if (f) form.document = f.name
}

function handleDrop(e) {
  const f = e.dataTransfer.files[0]
  if (f) form.document = f.name
}

async function submit() {
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 1500))
    bookingId.value = Math.floor(1000 + Math.random() * 9000).toString()
    profile.logAction({ type: 'booking', label: `Booked: ${selectedAdv.value?.title}`, route: '/dashboard' })
    analytics.trackEvent('booking', 'complete', form.adventure, grandTotal.value)
    currentStep.value = 4
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-page { background: var(--deep); min-height: 100vh; }
.booking-header { background: var(--deep); border-bottom: 1px solid var(--border); }

.booking-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; }

/* Steps */
.flow-steps { position: sticky; top: 90px; align-self: start; }
.flow-step { display: flex; align-items: flex-start; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--border); }
.step-num { width: 36px; height: 36px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--gray); transition: all .2s; }
.flow-step.active .step-num { border-color: var(--orange); color: var(--orange); background: rgba(232,98,42,0.1); }
.flow-step.done .step-num { border-color: var(--green-light); background: var(--green-light); color: #fff; }
.step-title { font-family: var(--font-condensed); font-size: 16px; font-weight: 700; color: var(--gray); margin-bottom: 4px; }
.flow-step.active .step-title { color: var(--orange); }
.flow-step.done .step-title { color: var(--text); }
.step-desc { font-size: 13px; color: var(--muted); }

/* Main */
.flow-main { background: var(--charcoal); border: 1px solid var(--border); padding: 48px; }
.flow-title { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 32px; }
.flow-nav { display: flex; align-items: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); gap: 12px; }

/* Adventure picker */
.adv-pick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.adv-pick-card { position: relative; height: 180px; overflow: hidden; cursor: pointer; border: 2px solid var(--border); transition: border-color .2s; }
.adv-pick-card.selected { border-color: var(--orange); }
.adv-pick-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.adv-pick-card:hover .adv-pick-img { transform: scale(1.05); }
.adv-pick-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,8,0.85), transparent 50%); }
.adv-pick-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px; }
.adv-pick-title { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--white); margin: 6px 0 4px; line-height: 1.2; }
.adv-pick-price { font-family: var(--font-condensed); font-size: 14px; color: var(--orange); font-weight: 700; }
.adv-pick-selected { position: absolute; top: 0; right: 0; background: var(--orange); color: var(--black); font-family: var(--font-condensed); font-size: 13px; font-weight: 700; padding: 5px 10px; }

/* Step 1 layout */
.step1-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 12px; }
.cal-day-header { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); text-align: center; padding: 6px; }
.cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-family: var(--font-condensed); font-size: 13px; font-weight: 600; color: var(--muted); }
.cal-day.available { color: var(--text); background: rgba(255,255,255,0.04); cursor: pointer; transition: all .15s; }
.cal-day.available:hover { background: rgba(232,98,42,0.15); color: var(--orange); }
.cal-day.has-trip::after { content: '●'; display: block; font-size: 5px; color: var(--orange); margin-top: 1px; }
.cal-day.selected { background: var(--orange); color: var(--black); }
.cal-legend { display: flex; gap: 16px; font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.cal-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.package-opts { display: flex; flex-direction: column; gap: 8px; }
.package-opt { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: 1px solid var(--border); cursor: pointer; transition: all .15s; }
.package-opt.selected { border-color: var(--orange); background: rgba(232,98,42,0.06); }
.pkg-name { font-family: var(--font-condensed); font-size: 15px; font-weight: 700; color: var(--text); }
.pkg-price { font-family: var(--font-condensed); font-size: 18px; font-weight: 700; color: var(--orange); }
.addons { }
.addon { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.addon-check { width: 18px; height: 18px; border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.addon-check.checked { background: var(--orange); border-color: var(--orange); }
.addon-check.checked::after { content: '✓'; color: var(--black); font-size: 13px; font-weight: 700; }
.addon-label { flex: 1; font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.addon-price { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }

/* Step 2 */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { }
.form-field--full { grid-column: span 2; }
.upload-box { border: 2px dashed var(--border); padding: 32px 24px; text-align: center; cursor: pointer; transition: border-color .2s; }
.upload-box:hover { border-color: var(--orange); }
.upload-icon { font-size: 32px; margin-bottom: 10px; }
.upload-text { font-family: var(--font-condensed); font-size: 15px; color: var(--light); margin-bottom: 6px; }
.upload-hint { font-size: 12px; color: var(--gray); }
.upload-done { margin-top: 12px; font-family: var(--font-condensed); font-size: 14px; color: var(--green-light); }

/* Step 3 */
.payment-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; }
.payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.pay-method { padding: 16px 12px; border: 2px solid var(--border); cursor: pointer; transition: all .2s; text-align: center; }
.pay-method.selected { border-color: var(--orange); background: rgba(232,98,42,0.06); }
.pay-icon { font-size: 26px; margin-bottom: 8px; }
.pay-name { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; color: var(--text); }
.pay-desc { font-size: 13px; color: var(--gray); margin-top: 3px; }
.pm-fields { background: var(--panel); border: 1px solid var(--border); padding: 20px; margin-top: 0; }
.installment-plan { display: flex; flex-direction: column; gap: 0; }
.inst-item { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); align-items: center; }
.inst-label { font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.inst-amount { font-family: var(--font-condensed); font-size: 18px; font-weight: 700; color: var(--orange); }
.inst-due { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }
.order-summary { background: var(--panel); border: 1px solid var(--border); padding: 24px; position: sticky; top: 90px; }
.os-title { font-family: var(--font-display); font-size: 22px; color: var(--text); margin-bottom: 16px; }
.os-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.os-divider { height: 1px; background: var(--border); margin: 8px 0; }
.os-total { display: flex; justify-content: space-between; font-family: var(--font-condensed); font-size: 20px; font-weight: 700; color: var(--text); padding: 12px 0; }
.os-note { font-size: 12px; color: var(--gray); margin-bottom: 16px; }
.os-security { font-size: 12px; color: var(--gray); text-align: center; margin-top: 16px; }

/* Confirmation */
.confirmation { text-align: center; padding: 40px 0; }
.conf-icon { font-size: 72px; margin-bottom: 20px; }
.conf-title { font-family: var(--font-display); font-size: 56px; color: var(--text); margin-bottom: 8px; }
.conf-id { font-family: var(--font-condensed); font-size: 16px; color: var(--gray); margin-bottom: 20px; }
.conf-id strong { color: var(--orange); }
.conf-text { font-size: 15px; color: var(--light); line-height: 1.7; max-width: 480px; margin: 0 auto 32px; }
.conf-details { border: 1px solid var(--border); max-width: 480px; margin: 0 auto 32px; text-align: left; }
.conf-row { display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border); font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.conf-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 900px) {
  .booking-layout { grid-template-columns: 1fr; }
  .flow-steps { position: static; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .flow-step { border: 1px solid var(--border); padding: 14px; border-bottom: unset; }
  .step-desc { display: none; }
  .adv-pick-grid { grid-template-columns: repeat(2, 1fr); }
  .step1-layout { grid-template-columns: 1fr; }
  .payment-layout { grid-template-columns: 1fr; }
  .order-summary { position: static; }
  .flow-main { padding: 28px 20px; }
}
@media (max-width: 600px) {
  .adv-pick-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .form-field--full { grid-column: span 1; }
  .payment-methods { grid-template-columns: repeat(2, 1fr); }
  .flow-steps { grid-template-columns: repeat(2, 1fr); }
}
</style>
