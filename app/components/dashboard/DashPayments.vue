<!--app/components/dashboard/DashPayments.vue-->
<template>
  <div>
    <div class="section-label">Financial Overview</div>
    <h2 class="sec-title">Payments</h2>

    <div class="pay-summary">
      <div class="pay-sum-card" v-for="s in summary" :key="s.label">
        <div class="pay-sum-val" :style="`color:${s.color}`">{{ s.val }}</div>
        <div class="pay-sum-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Booking Payments</div>
      <table class="ptable">
        <thead>
          <tr><th>Booking</th><th>Adventure</th><th>Date</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Method</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr v-for="b in demoBookings" :key="b.id">
            <td class="td-id">{{ b.id }}</td>
            <td>{{ advName(b.adventure) }}</td>
            <td>{{ fmt(b.departure) }}</td>
            <td class="td-amount">${{ b.total.toLocaleString() }}</td>
            <td style="color:var(--green-light);font-weight:700;">${{ b.paid.toLocaleString() }}</td>
            <td :style="`color:${b.total-b.paid>0?'var(--red)':'var(--gray)'};font-weight:700;`">
              ${{ (b.total - b.paid).toLocaleString() }}
            </td>
            <td>{{ b.paymentMethod || '—' }}</td>
            <td><span class="badge" :class="`badge-${statusCls(b.status)}`">{{ b.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Outstanding payment CTA -->
    <div class="dash-card outstanding" v-if="outstanding > 0">
      <div class="out-left">
        <div class="out-icon">⚠️</div>
        <div>
          <div class="out-title">Outstanding Balance: ${{ outstanding.toLocaleString() }}</div>
          <div class="out-sub">Complete your payment to secure your expedition spot</div>
        </div>
      </div>
      <div class="out-actions">
        <button class="btn btn-primary">Pay Now — ${{ outstanding.toLocaleString() }}</button>
      </div>
    </div>

    <!-- Payment methods -->
    <div class="dash-card">
      <div class="section-label">Accepted Payment Methods</div>
      <div class="pay-methods">
        <div class="pay-method" v-for="m in methods" :key="m.name">
          <div class="pm-icon">{{ m.icon }}</div>
          <div class="pm-name">{{ m.name }}</div>
          <div class="pm-note">{{ m.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { demoBookings, adventures } from '~~/data/demo.js'
const totalPaid    = demoBookings.reduce((s,b)=>s+b.paid,0)
const totalOwed    = demoBookings.reduce((s,b)=>s+b.total,0)
const outstanding  = totalOwed - totalPaid
const summary = [
  { val: '$'+totalOwed.toLocaleString(),       label:'Total Booked',      color:'var(--white)' },
  { val: '$'+totalPaid.toLocaleString(),        label:'Total Paid',        color:'var(--green-light)' },
  { val: '$'+outstanding.toLocaleString(),      label:'Outstanding',       color: outstanding > 0 ? 'var(--red)' : 'var(--gray)' },
  { val: demoBookings.length,                   label:'Transactions',      color:'var(--orange)' },
]
const methods = [
  { icon:'💳', name:'Visa / Mastercard', note:'Credit & debit cards' },
  { icon:'📱', name:'MTN Mobile Money',  note:'Uganda & Rwanda' },
  { icon:'📱', name:'Airtel Money',      note:'Uganda' },
  { icon:'🏦', name:'Bank Transfer',     note:'USD / UGX accounts' },
  { icon:'⚡', name:'PayPal',           note:'International' },
]
const advName  = (id) => adventures.find(a=>a.id===id)?.title?.split(' ').slice(0,3).join(' ')+'…' || id
const fmt      = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
const statusCls = (s) => s==='confirmed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.pay-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.pay-sum-card { background:var(--panel); border:1px solid var(--border); padding:20px 24px; }
.pay-sum-val   { font-family:var(--font-display); font-size:36px; line-height:1; margin-bottom:4px; }
.pay-sum-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:16px; }
.ptable { width:100%; border-collapse:collapse; overflow-x:auto; display:block; }
.ptable th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--black); white-space:nowrap; }
.ptable td { padding:13px 14px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); }
.td-id { color:var(--orange); font-weight:700; } .td-amount { color:var(--text); font-weight:700; }
.outstanding { display:flex; justify-content:space-between; align-items:center; gap:20px; background:rgba(192,57,43,0.08); border-color:var(--red); flex-wrap:wrap; }
.out-left { display:flex; gap:14px; align-items:center; }
.out-icon  { font-size:28px; }
.out-title { font-family:var(--font-condensed); font-size:16px; font-weight:700; color:var(--red); }
.out-sub   { font-size:13px; color:var(--gray); margin-top:3px; }
.pay-methods { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
.pay-method { background:var(--charcoal); border:1px solid var(--border); padding:16px; text-align:center; }
.pm-icon { font-size:28px; margin-bottom:8px; }
.pm-name { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; }
.pm-note { font-family:var(--font-condensed); font-size:12px; color:var(--gray); }
@media (max-width:800px) { .pay-summary { grid-template-columns:repeat(2,1fr); } .pay-methods { grid-template-columns:repeat(2,1fr); } }
</style>
