<!--app/components/admin/sections/AdminCustomers.vue-->
<template>
  <div>
    <div class="section-label">Customer Management</div>
    <h2 class="as-title">Customers</h2>

    <div class="summary-row">
      <div class="sum-card" v-for="s in summary" :key="s.label">
        <div class="sum-val" :style="`color:${s.color}`">{{ s.val }}</div>
        <div class="sum-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="filters-bar">
      <input class="input filter-input" v-model="search" placeholder="Search customer name or email…" />
      <select class="input filter-select" v-model="countryFilter">
        <option value="">All Countries</option>
        <option v-for="c in countries" :key="c">{{ c }}</option>
      </select>
    </div>

    <div class="table-card">
      <table class="dtable">
        <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Country</th><th>Bookings</th><th>Total Spent</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td>
              <div class="cust-name-cell">
                <div class="cust-avatar-placeholder">{{ c.customer.name.charAt(0) }}</div>
                <span style="font-weight:700;color:var(--text);">{{ c.customer.name }}</span>
              </div>
            </td>
            <td>{{ c.customer.email }}</td>
            <td>{{ c.customer.phone }}</td>
            <td>{{ c.customer.country }}</td>
            <td style="text-align:center;">1</td>
            <td style="color:var(--orange);font-weight:700;">${{ c.total.toLocaleString() }}</td>
            <td><span class="badge" :class="`badge-${statusCls(c.status)}`">{{ c.status }}</span></td>
            <td><button class="btn btn-ghost btn-sm">View →</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { demoBookings } from '~~/data/demo.js'
const search = ref(''), countryFilter = ref('')
const countries = [...new Set(demoBookings.map(b=>b.customer.country))]
const filtered = computed(() => demoBookings.filter(b => {
  const q = search.value.toLowerCase()
  const matchQ = !q || b.customer.name.toLowerCase().includes(q) || b.customer.email.toLowerCase().includes(q)
  const matchC = !countryFilter.value || b.customer.country === countryFilter.value
  return matchQ && matchC
}))
const summary = [
  { val: demoBookings.length,  label:'Total Customers',  color:'var(--white)' },
  { val: demoBookings.filter(b=>b.status==='confirmed').length, label:'Active', color:'var(--green-light)' },
  { val: demoBookings.filter(b=>b.status==='cancelled').length, label:'Churned', color:'var(--red)' },
  { val: '$'+demoBookings.reduce((s,b)=>s+b.paid,0).toLocaleString(), label:'Lifetime Revenue', color:'var(--orange)' },
]
const statusCls = (s) => s==='confirmed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.summary-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.sum-card { background:var(--panel); border:1px solid var(--border); padding:20px 24px; }
.sum-val   { font-family:var(--font-display); font-size:40px; line-height:1; margin-bottom:4px; }
.sum-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.filters-bar { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
.filter-input { max-width:300px; } .filter-select { max-width:180px; }
.table-card { background:var(--panel); border:1px solid var(--border); overflow-x:auto; }
.dtable { width:100%; border-collapse:collapse; }
.dtable th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--black); white-space:nowrap; }
.dtable td { padding:14px 16px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); }
.cust-name-cell { display:flex; align-items:center; gap:10px; }
.cust-avatar-placeholder { width:32px; height:32px; border-radius:50%; background:var(--orange); color:var(--black); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
@media (max-width:700px) { .summary-row { grid-template-columns:repeat(2,1fr); } }
</style>
