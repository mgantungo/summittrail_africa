<!--app/components/admin/sections/AdminBookings.vue-->
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
        <option value="cancelled">Cancelled</option>
      </select>
      <div class="filter-count">{{ filtered.length }} bookings</div>
    </div>

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
            <td style="color:var(--orange);font-weight:700;">{{ b.id }}</td>
            <td style="color:var(--text);font-weight:700;">{{ b.customer.name }}</td>
            <td>{{ b.customer.country }}</td>
            <td>{{ advName(b.adventure) }}</td>
            <td>{{ fmt(b.departure) }}</td>
            <td style="text-align:center;">{{ b.participants }}</td>
            <td style="color:var(--orange);font-weight:700;">${{ b.total.toLocaleString() }}</td>
            <td><span class="badge" :class="`badge-${statusCls(b.status)}`">{{ b.status }}</span></td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm">View</button>
                <button v-if="b.status==='pending-payment'" class="btn btn-primary btn-sm">Follow Up</button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="9" style="text-align:center;padding:40px;color:var(--gray);">No bookings match your filters</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { demoBookings, adventures } from '~~/data/demo.js'
const search = ref(''), statusFilter = ref('')
const filtered = computed(() => demoBookings.filter(b => {
  const q = search.value.toLowerCase()
  const matchQ = !q || b.id.toLowerCase().includes(q) || b.customer.name.toLowerCase().includes(q)
  const matchS = !statusFilter.value || b.status === statusFilter.value
  return matchQ && matchS
}))
const summary = [
  { val: demoBookings.length,                                                   label:'Total Bookings',    color:'var(--white)' },
  { val: demoBookings.filter(b=>b.status==='confirmed').length,                 label:'Confirmed',         color:'var(--green-light)' },
  { val: demoBookings.filter(b=>b.status==='pending-payment').length,           label:'Pending Payment',   color:'var(--gold)' },
  { val: '$'+demoBookings.reduce((s,b)=>s+b.paid,0).toLocaleString(),           label:'Total Collected',   color:'var(--orange)' },
]
const advName = (id) => adventures.find(a=>a.id===id)?.title?.split(' ').slice(0,3).join(' ')+'…' || id
const fmt = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
const statusCls = (s) => s==='confirmed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
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
.row-actions { display:flex; gap:6px; }
@media (max-width:800px) { .bk-summary { grid-template-columns:repeat(2,1fr); } }
</style>
