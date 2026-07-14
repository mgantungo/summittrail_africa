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
          <div class="rev-bar-wrap" v-for="m in monthlyRevenue" :key="m.month">
            <div class="rev-bar" :style="{ height: (m.revenue / maxRevenue * 100) + '%' }" />
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
          <div class="market-row" v-for="(c, i) in topMarkets" :key="c.country">
            <div class="market-rank">#{{ i+1 }}</div>
            <div class="market-country">{{ c.country }}</div>
            <div class="market-bar"><div class="market-fill" :style="{ width: (c.bookings/maxMarketBookings*100)+'%' }" /></div>
            <div class="market-num">{{ c.bookings.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Funnel -->
      <div class="an-card">
        <div class="an-title">Conversion Funnel</div>
        <div class="funnel-list">
          <div class="funnel-item" v-for="(f, i) in liveFunnel" :key="f.stage">
            <div class="fi-label">{{ f.stage }}</div>
            <div class="fi-track">
              <div class="fi-fill" :style="{ width: (f.count / (liveFunnel[0]?.count || 1) * 100)+'%', opacity: 1 - i*0.12,
                background: i===liveFunnel.length-1?'var(--green-light)':'var(--orange)' }" />
            </div>
            <div class="fi-num">{{ f.count }}</div>
            <div class="fi-pct" v-if="i>0" style="color:var(--gray);font-size:12px;">
              ({{ liveFunnel[i-1].count ? Math.round(f.count/liveFunnel[i-1].count*100) : 0 }}%)
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
// deviceSplit / pageViews / KPIs below are genuine web-traffic analytics
// (device type, session counts) that this app has no tracking pipeline
// for — they stay sourced from the seeded analytics-snapshot until a
// real tracking integration exists. Everything derivable from actual
// booking records (revenue, top markets, funnel) is computed live below.
const { data: analyticsData }    = await useAnalyticsSnapshot()
const { data: bookings }         = await useBookings()
const { data: contactMessages }  = await useContactMessages()
const { data: newsletterSubs }   = await useNewsletterSubscribers()

const kpis = computed(() => [
  { val: analyticsData.value?.kpis?.pageViewsPerMonth || '—', label:'Page Views / Month', color:'var(--orange)', trend:'↑ +12%', trendUp:true },
  { val: analyticsData.value?.kpis?.weeklySessions   || '—', label:'Weekly Sessions',    color:'var(--white)',  trend:'↑ +9%',  trendUp:true },
  { val: analyticsData.value?.kpis?.conversionRate   || '—', label:'Conversion Rate',    color:'var(--gold)',   trend:'↑ +0.4%',trendUp:true },
  { val: analyticsData.value?.kpis?.avgSessionTime   || '—', label:'Avg. Session Time',  color:'var(--green-light)', trend:'↑ +18s',trendUp:true },
])
const deviceSplit = computed(() => [
  { icon:'📱', label:'Mobile',  pct: analyticsData.value?.deviceSplit?.mobile  || 0, color:'var(--orange)' },
  { icon:'🖥️', label:'Desktop', pct: analyticsData.value?.deviceSplit?.desktop || 0, color:'var(--gold)' },
  { icon:'📲', label:'Tablet',  pct: analyticsData.value?.deviceSplit?.tablet  || 0, color:'var(--green-light)' },
])
const trafficSummary = computed(() => [
  { val: (analyticsData.value?.pageViews?.today || 0).toLocaleString(),  label:'Today' },
  { val: (analyticsData.value?.pageViews?.week  || 0).toLocaleString(),  label:'This Week' },
  { val: (analyticsData.value?.pageViews?.month || 0).toLocaleString(),  label:'This Month' },
  { val: String(newsletterSubs.value.length), label:'Newsletter Subs' },
  { val:'38',    label:'Push Subscribers' },
])

// ── Live: monthly revenue from real bookings ─────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const monthlyRevenue = computed(() => {
  const byMonth = {}
  for (const b of bookings.value) {
    if (!b.bookedAt) continue
    const d = new Date(b.bookedAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!byMonth[key]) byMonth[key] = { month: MONTHS[d.getMonth()], revenue: 0, sortKey: key }
    byMonth[key].revenue += Number(b.paid || 0)
  }
  return Object.values(byMonth).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-6)
})
const maxRevenue = computed(() => Math.max(1, ...monthlyRevenue.value.map(m => m.revenue)))

// ── Live: top markets by real booking count per customer country ────────
const topMarkets = computed(() => {
  const byCountry = {}
  for (const b of bookings.value) {
    const country = b.customer?.country || 'Unknown'
    byCountry[country] = (byCountry[country] || 0) + 1
  }
  return Object.entries(byCountry)
    .map(([country, count]) => ({ country, bookings: count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6)
})
const maxMarketBookings = computed(() => Math.max(1, ...topMarkets.value.map(c => c.bookings)))

// ── Live: conversion funnel from real records ────────────────────────────
const liveFunnel = computed(() => {
  const total = bookings.value.length
  const confirmed = bookings.value.filter(b => b.status === 'confirmed' || b.status === 'completed').length
  const paid = bookings.value.filter(b => Number(b.paid || 0) > 0).length
  const completed = bookings.value.filter(b => b.status === 'completed').length
  return [
    { stage: 'Inquiries',  count: contactMessages.value.length },
    { stage: 'Bookings',   count: total },
    { stage: 'Confirmed',  count: confirmed },
    { stage: 'Paid',       count: paid },
    { stage: 'Completed',  count: completed },
  ]
})

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
