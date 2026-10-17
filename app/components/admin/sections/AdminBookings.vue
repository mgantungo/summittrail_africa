<template>
  <div>
    <div class="as-hdr">
      <div class="section-label">All Reservations</div>
      <h2 class="as-title">Bookings</h2>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input class="input filter-input" v-model="search" placeholder="Search customer or booking ID…" />
      <select class="input filter-select" v-model="statusFilter">
        <option value="">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending-payment">Pending Payment</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div class="filter-count">{{ filtered.length }} bookings</div>
    </div>

    <div v-if="msg" class="bk-msg" :class="msg.type">{{ msg.text }}</div>

    <!-- Summary cards -->
    <div class="bk-summary">
      <div class="bk-sum-card" v-for="s in summary" :key="s.label">
        <div class="bk-sum-val" :style="`color:${s.color}`">{{ s.val }}</div>
        <div class="bk-sum-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <table class="dtable">
        <thead>
          <tr>
            <th>Booking ID</th><th>Customer</th><th>Country</th>
            <th>Adventure</th><th>Departure</th><th>Participants</th>
            <th>Total</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id">
            <td style="color:var(--orange);font-weight:700;">{{ b.reference }}</td>
            <td style="color:var(--text);font-weight:700;">{{ b.customer?.name }}</td>
            <td>{{ b.customer?.country }}</td>
            <td>{{ advName(b.adventure) }}</td>
            <td>{{ fmt(b.departureDate) }}</td>
            <td style="text-align:center;">{{ b.participants }}</td>
            <td style="color:var(--orange);font-weight:700;">${{ Number(b.total).toLocaleString() }}</td>
            <td>
              <span class="badge" :class="`badge-${statusCls(b.status)}`">{{ b.status }}</span>
              <div v-if="balance(b) > 0 && b.status !== 'cancelled'" class="bk-due">Due ${{ balance(b).toLocaleString() }}</div>
              <div v-if="b.live_expedition?.status === 'active'" class="bk-live">● on a live expedition</div>
            </td>
            <td>
              <div class="row-actions">
                <button
                  v-if="b.status !== 'cancelled' && (b.status === 'pending-payment' || balance(b) > 0)"
                  class="btn btn-primary btn-sm"
                  @click="openPay(b)"
                >✓ Mark Paid</button>
                <span v-else-if="b.status !== 'cancelled'" class="bk-paid">Paid</span>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="9" style="text-align:center;padding:40px;color:var(--gray);">No bookings match your filters</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mark paid dialog -->
    <div v-if="pay.booking" class="bk-modal-backdrop" @click.self="closePay">
      <form class="bk-modal" @submit.prevent="confirmPaid">
        <div class="section-label">Confirm Payment</div>
        <h3 class="bk-modal-title">{{ pay.booking.reference }}</h3>
        <p class="bk-modal-sub">
          {{ pay.booking.customer?.name || 'Customer' }} · {{ advName(pay.booking.adventure) }} · {{ fmt(pay.booking.departureDate) }}
        </p>
        <div class="bk-modal-amount">
          <span>Amount received</span>
          <strong>${{ balance(pay.booking).toLocaleString() }}</strong>
        </div>
        <p class="bk-modal-note">Records the outstanding balance as paid, confirms the booking and links it to its expedition for live tracking.</p>

        <label class="input-label">Payment method</label>
        <select v-model="pay.method" class="input" required>
          <option value="mobile-money">Mobile Money (MTN / Airtel)</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="cash">Cash</option>
          <option value="stripe">Card (Stripe)</option>
          <option value="paypal">PayPal</option>
        </select>

        <label class="input-label">Transaction reference <span class="bk-opt">(optional)</span></label>
        <input v-model="pay.reference" class="input" maxlength="120" placeholder="e.g. MoMo transaction ID" />

        <label class="input-label">Note <span class="bk-opt">(optional)</span></label>
        <input v-model="pay.note" class="input" maxlength="500" placeholder="e.g. Paid at the office" />

        <div v-if="pay.error" class="bk-err">{{ pay.error }}</div>
        <div class="bk-modal-actions">
          <button type="button" class="btn btn-ghost btn-sm" :disabled="pay.busy" @click="closePay">Cancel</button>
          <button class="btn btn-primary btn-sm" :disabled="pay.busy">{{ pay.busy ? 'Saving…' : 'Confirm Paid' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// app/components/admin/sections/AdminBookings.vue
const { data: bookings, refresh } = await useBookings()

// ── Mark paid (via the admin-only /api/cms proxy) ─────────────────────────
const balance = (b) => Math.max(0, Math.round(((Number(b.total) || 0) - (Number(b.paid) || 0)) * 100) / 100)
const msg = ref(null)
const pay = reactive({ booking: null, method: 'mobile-money', reference: '', note: '', busy: false, error: '' })

function openPay(b) {
  Object.assign(pay, { booking: b, method: 'mobile-money', reference: '', note: '', busy: false, error: '' })
}
function closePay() {
  if (!pay.busy) pay.booking = null
}
async function confirmPaid() {
  pay.busy = true; pay.error = ''
  try {
    const res = await $fetch('/api/cms/bookings/mark-paid', {
      method: 'POST',
      body: { booking: pay.booking.documentId, method: pay.method, reference: pay.reference, note: pay.note },
    })
    const exp = res?.data?.expedition
    msg.value = {
      type: 'ok',
      text: `${pay.booking.reference} marked paid and confirmed.` + (exp
        ? (exp.status === 'active' ? ' Linked to its live expedition — the customer can post updates now.' : ' Linked to its expedition.')
        : ' No expedition exists yet for this adventure and date; it will link automatically once one is created.'),
    }
    pay.busy = false
    pay.booking = null
    await refresh()
  } catch (e) {
    pay.error = e?.data?.statusMessage || 'Could not record the payment.'
    pay.busy = false
  }
}
const search = ref(''), statusFilter = ref('')
const filtered = computed(() => bookings.value.filter(b => {
  const q = search.value.toLowerCase()
  const matchQ = !q || b.reference.toLowerCase().includes(q) || b.customer?.name?.toLowerCase().includes(q)
  const matchS = !statusFilter.value || b.status === statusFilter.value
  return matchQ && matchS
}))
const summary = computed(() => [
  { val: bookings.value.length,                                                        label:'Total Bookings',    color:'var(--white)' },
  { val: bookings.value.filter(b=>b.status==='confirmed').length,                       label:'Confirmed',         color:'var(--green-light)' },
  { val: bookings.value.filter(b=>b.status==='pending-payment').length,                  label:'Pending Payment',   color:'var(--gold)' },
  { val: '$'+bookings.value.reduce((s,b)=>s+Number(b.paid||0),0).toLocaleString(),       label:'Total Collected',   color:'var(--orange)' },
])
const advName = (adv) => shortTitle(adv?.title) || '—'
const fmt = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
const statusCls = (s) => s==='confirmed'||s==='completed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
</script>

<style scoped>
.as-hdr { margin-bottom:24px; }
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); }
.filters-bar { display:flex; gap:12px; align-items:center; margin-bottom:20px; flex-wrap:wrap; }
.filter-input { max-width:320px; }
.filter-select { max-width:200px; }
.filter-count { font-family:var(--font-condensed); font-size:14px; color:var(--gray); margin-left:auto; }
.bk-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.bk-sum-card { background:var(--panel); border:1px solid var(--border); padding:20px 24px; }
.bk-sum-val   { font-family:var(--font-display); font-size:40px; line-height:1; margin-bottom:4px; }
.bk-sum-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.table-card { background:var(--panel); border:1px solid var(--border); overflow-x:auto; }
.dtable { width:100%; border-collapse:collapse; }
.dtable th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--black); white-space:nowrap; }
.dtable td { padding:14px 16px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); }
.row-actions { display:flex; gap:6px; align-items:center; }
.bk-msg { padding:10px 14px; margin-bottom:16px; font-family:var(--font-condensed); font-size:14px; border:1px solid; }
.bk-msg.ok { color:var(--green-light); border-color:var(--green-light); }
.bk-msg.err { color:var(--red); border-color:var(--red); }
.bk-due { font-size:12px; color:var(--gold); margin-top:4px; }
.bk-live { font-size:12px; color:var(--red); margin-top:4px; }
.bk-paid { font-size:13px; color:var(--green-light); }
.bk-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; padding:16px; z-index:200; }
.bk-modal { background:var(--charcoal); border:1px solid var(--border); padding:28px; width:100%; max-width:440px; display:flex; flex-direction:column; gap:8px; }
.bk-modal-title { font-family:var(--font-display); font-size:30px; color:var(--orange); line-height:1; }
.bk-modal-sub { font-size:14px; color:var(--light); margin-bottom:6px; }
.bk-modal-amount { display:flex; justify-content:space-between; align-items:baseline; background:var(--panel); padding:12px 14px; font-family:var(--font-condensed); color:var(--light); }
.bk-modal-amount strong { font-size:22px; color:var(--text); }
.bk-modal-note { font-size:12px; color:var(--gray); margin-bottom:6px; }
.bk-opt { color:var(--gray); font-weight:400; text-transform:none; letter-spacing:0; }
.bk-err { color:var(--red); font-size:14px; }
.bk-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
@media (max-width:800px) { .bk-summary { grid-template-columns:repeat(2,1fr); } }
</style>
