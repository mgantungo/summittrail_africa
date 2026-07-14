<!--app/components/admin/sections/AdminAnalytics.vue-->
<template>
  <div>
    <div class="section-label">Performance Intelligence</div>
    <h2 class="as-title">Analytics</h2>

    <div class="kpi-row">
      <div class="kpi" v-for="k in kpis" :key="k.label">
        <div class="kpi-val" :style="`color:${k.color}`">{{ k.val }}</div>
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-trend" :class="k.trendUp ? 'up' : 'down'">{{ k.trend }}</div>
      </div>
    </div>

    <div class="an-grid">
      <!-- Monthly revenue -->
      <div class="an-card">
        <div class="an-title">Monthly Revenue (UGX approx.)</div>
        <div class="rev-chart">
          <div class="rev-bar-wrap" v-for="m in analyticsData.monthlyBookings" :key="m.month">
            <div class="rev-bar" :style="{ height: (m.revenue / 90000 * 100) + '%' }" />
            <div class="rev-label">{{ m.month }}</div>
          </div>
        </div>
      </div>

      <!-- Device split -->
      <div class="an-card">
        <div class="an-title">Device Split</div>
        <div class="device-bars">
          <div class="device-row" v-for="d in deviceSplit" :key="d.label">
            <div class="dev-label">{{ d.icon }} {{ d.label }}</div>
            <div class="dev-track"><div class="dev-fill" :style="{ width: d.pct+'%', background: d.color }" /></div>
            <div class="dev-pct">{{ d.pct }}%</div>
          </div>
        </div>
      </div>

      <!-- Top countries -->
      <div class="an-card">
        <div class="an-title">Top Markets</div>
        <div class="market-list">
          <div class="market-row" v-for="(c, i) in analyticsData.topCountries.slice(0,6)" :key="c.code">
            <div class="market-rank">#{{ i+1 }}</div>
            <div class="market-country">{{ c.country }}</div>
            <div class="market-bar"><div class="market-fill" :style="{ width: (c.visitors/3420*100)+'%' }" /></div>
            <div class="market-num">{{ c.visitors.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Funnel -->
      <div class="an-card">
        <div class="an-title">Conversion Funnel</div>
        <div class="funnel-list">
          <div class="funnel-item" v-for="(f, i) in analyticsData.funnel" :key="f.stage">
            <div class="fi-label">{{ f.stage }}</div>
            <div class="fi-track">
              <div class="fi-fill" :style="{ width: (f.count/320*100)+'%', opacity: 1 - i*0.12,
                background: i===analyticsData.funnel.length-1?'var(--green-light)':'var(--orange)' }" />
            </div>
            <div class="fi-num">{{ f.count }}</div>
            <div class="fi-pct" v-if="i>0" style="color:var(--gray);font-size:12px;">
              ({{ Math.round(f.count/analyticsData.funnel[i-1].count*100) }}%)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page views summary -->
    <div class="an-card" style="margin-top:0;">
      <div class="an-title">Traffic Summary</div>
      <div class="traffic-row">
        <div class="tr-item" v-for="t in trafficSummary" :key="t.label">
          <div class="tr-val">{{ t.val }}</div>
          <div class="tr-label">{{ t.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { analyticsData } from '~~/data/demo.js'
const kpis = [
  { val:'34.8K', label:'Page Views / Month', color:'var(--orange)', trend:'↑ +12%', trendUp:true },
  { val:'8.4K',  label:'Weekly Sessions',    color:'var(--white)',  trend:'↑ +9%',  trendUp:true },
  { val:'4.2%',  label:'Conversion Rate',    color:'var(--gold)',   trend:'↑ +0.4%',trendUp:true },
  { val:'3m 24s',label:'Avg. Session Time',  color:'var(--green-light)', trend:'↑ +18s',trendUp:true },
]
const deviceSplit = [
  { icon:'📱', label:'Mobile',  pct: analyticsData.deviceSplit.mobile,  color:'var(--orange)' },
  { icon:'🖥️', label:'Desktop', pct: analyticsData.deviceSplit.desktop, color:'var(--gold)' },
  { icon:'📲', label:'Tablet',  pct: analyticsData.deviceSplit.tablet,  color:'var(--green-light)' },
]
const trafficSummary = [
  { val:'1,240', label:'Today' },
  { val:'8,420', label:'This Week' },
  { val:'34,820',label:'This Month' },
  { val:'127',   label:'Newsletter Subs' },
  { val:'38',    label:'Push Subscribers' },
]
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.kpi { background:var(--panel); border:1px solid var(--border); padding:20px 24px; }
.kpi-val   { font-family:var(--font-display); font-size:36px; line-height:1; margin-bottom:4px; }
.kpi-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:6px; }
.kpi-trend { font-family:var(--font-condensed); font-size:13px; }
.up { color:var(--green-light); } .down { color:var(--red); }
.an-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:16px; }
.an-card { background:var(--panel); border:1px solid var(--border); padding:24px; }
.an-title { font-family:var(--font-condensed); font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:20px; }
.rev-chart { display:flex; align-items:flex-end; gap:8px; height:100px; }
.rev-bar-wrap { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.rev-bar { width:100%; background:var(--gold); opacity:.8; min-height:4px; }
.rev-label { font-family:var(--font-condensed); font-size:11px; color:var(--gray); }
.device-bars { display:flex; flex-direction:column; gap:14px; }
.device-row { display:flex; align-items:center; gap:12px; }
.dev-label { font-family:var(--font-condensed); font-size:13px; color:var(--light); width:80px; flex-shrink:0; }
.dev-track { flex:1; height:8px; background:var(--muted); }
.dev-fill  { height:100%; }
.dev-pct   { font-family:var(--font-condensed); font-size:13px; color:var(--gray); width:36px; text-align:right; }
.market-list { display:flex; flex-direction:column; gap:10px; }
.market-row  { display:flex; align-items:center; gap:10px; }
.market-rank { font-family:var(--font-condensed); font-size:13px; color:var(--orange); font-weight:700; width:24px; flex-shrink:0; }
.market-country { font-family:var(--font-condensed); font-size:14px; color:var(--text); width:120px; flex-shrink:0; }
.market-bar  { flex:1; height:6px; background:var(--muted); }
.market-fill { height:100%; background:var(--orange); }
.market-num  { font-family:var(--font-condensed); font-size:13px; color:var(--gray); width:50px; text-align:right; }
.funnel-list { display:flex; flex-direction:column; gap:10px; }
.funnel-item { display:flex; align-items:center; gap:10px; }
.fi-label { font-family:var(--font-condensed); font-size:13px; color:var(--gray); width:80px; flex-shrink:0; }
.fi-track { flex:1; }
.fi-fill  { height:26px; display:flex; align-items:center; padding:0 8px; }
.fi-num   { font-family:var(--font-condensed); font-size:14px; color:var(--text); font-weight:700; width:32px; }
.traffic-row { display:flex; gap:0; }
.tr-item  { flex:1; text-align:center; padding:16px; border-right:1px solid var(--border); }
.tr-item:last-child { border-right:none; }
.tr-val   { font-family:var(--font-display); font-size:32px; color:var(--orange); }
.tr-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-top:4px; }
@media (max-width:900px) { .kpi-row { grid-template-columns:repeat(2,1fr); } .an-grid { grid-template-columns:1fr; } }
</style>
