<template>
  <div>
    <div class="as-header">
      <div>
        <div class="section-label">Operations Command</div>
        <h1 class="as-title">Good {{ greeting }} ☀️</h1>
        <div class="as-sub">{{ today }} · {{ activeTripCount }} trips active today</div>
      </div>
      <div class="as-actions">
        <ThemeToggle />
        <button class="btn btn-primary btn-sm" @click="$emit('send-push')">📣 Send Push Alert</button>
      </div>
    </div>

    <div class="metrics-grid">
      <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.color">
        <div class="metric-trend" :class="m.trendClass">{{ m.trend }}</div>
        <div class="metric-val">{{ m.val }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">Monthly Bookings — 2025</div>
        <div class="bar-chart">
          <div class="bar-wrap" v-for="m in analyticsData.monthlyBookings" :key="m.month">
            <div class="bar-val">{{ m.bookings }}</div>
            <div class="bar" :style="{ height: (m.bookings / 160 * 100) + '%' }" />
            <div class="bar-label">{{ m.month }}</div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Booking Funnel</div>
        <div class="funnel">
          <div class="funnel-row" v-for="(f, i) in analyticsData.funnel" :key="f.stage">
            <div class="funnel-label">{{ f.stage }}</div>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar"
                :style="{ width: (f.count / 320 * 100) + '%', opacity: 1 - i * 0.14,
                  background: i === analyticsData.funnel.length - 1 ? 'var(--green-light)' : 'var(--orange)' }">
                <span class="funnel-count">{{ f.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-card" style="margin-bottom:20px;">
      <div class="chart-title">Traffic by Country</div>
      <div class="ct-header"><span>Country</span><span>Visitors</span><span>Bookings</span><span>Share</span></div>
      <div class="ct-row" v-for="c in analyticsData.topCountries" :key="c.code">
        <span class="ct-country">{{ c.country }}</span>
        <span style="font-family:var(--font-condensed);color:var(--orange);font-weight:700;">{{ c.visitors.toLocaleString() }}</span>
        <span style="font-family:var(--font-condensed);color:var(--light);">{{ c.bookings }}</span>
        <span><div class="ct-bar"><div class="ct-fill" :style="{ width: (c.visitors/3420*100)+'%' }"/></div></span>
      </div>
    </div>

    <div class="chart-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div class="chart-title" style="margin-bottom:0;">Recent Bookings</div>
        <button class="btn btn-ghost btn-sm" @click="$emit('select','bookings')">View All →</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="dtable">
          <thead><tr><th>ID</th><th>Customer</th><th>Trip</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="b in demoBookings" :key="b.id">
              <td style="color:var(--muted)">{{ b.id }}</td>
              <td style="color:var(--text);font-weight:700">{{ b.customer.name }}</td>
              <td>{{ advName(b.adventure) }}</td>
              <td>{{ fmt(b.departure) }}</td>
              <td style="color:var(--orange);font-weight:700">${{ b.total.toLocaleString() }}</td>
              <td><span class="badge" :class="`badge-${statusCls(b.status)}`">{{ b.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { analyticsData, demoBookings, adventures } from '~~/data/demo.js'
defineEmits(['send-push','select'])
const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
const activeTripCount = 7
const greeting = computed(() => { const h = new Date().getHours(); return h<12?'morning':h<17?'afternoon':'evening' })
const metrics = [
  { val:'142', label:'Bookings This Month', color:'orange', trend:'↑ +18%', trendClass:'trend-up' },
  { val:'$84k', label:'Revenue This Month', color:'gold', trend:'↑ +24%', trendClass:'trend-up' },
  { val: activeTripCount, label:'Active Trips Now', color:'green', trend:'3 mountain · 4 overland', trendClass:'' },
  { val:'12', label:'Incomplete Bookings', color:'red', trend:'⚠ Needs follow-up', trendClass:'trend-down' },
]
const advName = (id) => { const a = adventures.find(x=>x.id===id); return a ? a.title.split(' ').slice(0,3).join(' ')+'…' : id }
const fmt = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})
const statusCls = (s) => s==='confirmed'?'confirmed':s==='pending-payment'?'pending':'cancelled'
</script>

<style scoped>
.as-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
.as-title  { font-family:var(--font-display); font-size:32px; color:var(--text); }
.as-sub    { font-family:var(--font-condensed); font-size:14px; color:var(--gray); margin-top:4px; }
.as-actions { display:flex; gap:10px; align-items:center; }
.metrics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
.metric-card { background:var(--panel); border:1px solid var(--border); padding:24px; position:relative; }
.metric-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; }
.orange::after { background:var(--orange); } .gold::after { background:var(--gold); }
.green::after  { background:var(--green-light); } .red::after { background:var(--red); }
.metric-trend { font-family:var(--font-condensed); font-size:13px; margin-bottom:8px; color:var(--gray); }
.trend-up { color:var(--green-light)!important; } .trend-down { color:var(--red)!important; }
.metric-val   { font-family:var(--font-display); font-size:52px; line-height:1; color:var(--text); }
.metric-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-top:4px; }
.charts-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
.chart-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:0; }
.chart-title { font-family:var(--font-condensed); font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:20px; }
.bar-chart { display:flex; align-items:flex-end; gap:8px; height:120px; }
.bar-wrap { display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; }
.bar { width:100%; background:var(--orange); opacity:.75; min-height:4px; }
.bar-val   { font-family:var(--font-condensed); font-size:12px; color:var(--gray); }
.bar-label { font-family:var(--font-condensed); font-size:11px; font-weight:600; text-transform:uppercase; color:var(--gray); }
.funnel { display:flex; flex-direction:column; gap:10px; }
.funnel-row { display:flex; align-items:center; gap:14px; }
.funnel-label { font-family:var(--font-condensed); font-size:13px; color:var(--gray); width:80px; flex-shrink:0; }
.funnel-bar-wrap { flex:1; }
.funnel-bar { height:28px; display:flex; align-items:center; padding:0 10px; min-width:40px; }
.funnel-count { font-family:var(--font-condensed); font-size:12px; font-weight:700; color:var(--black); }
.ct-header { display:grid; grid-template-columns:2fr 1fr 1fr 2fr; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.ct-row    { display:grid; grid-template-columns:2fr 1fr 1fr 2fr; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); align-items:center; }
.ct-country { font-family:var(--font-condensed); font-size:14px; font-weight:600; color:var(--text); }
.ct-bar { background:var(--muted); height:8px; } .ct-fill { height:100%; background:var(--orange); }
.dtable { width:100%; border-collapse:collapse; }
.dtable th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:12px 14px; border-bottom:1px solid var(--border); background:var(--black); }
.dtable td { padding:14px 14px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); }
@media (max-width:1000px) { .metrics-grid { grid-template-columns:repeat(2,1fr); } .charts-row { grid-template-columns:1fr; } }
</style>
