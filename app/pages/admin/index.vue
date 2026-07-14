<!--app/pages/admin/index.vue-->
<template>
  <div class="admin-overview">
    <div class="admin-topbar">
      <div>
        <div class="section-label">Operations Command</div>
        <h1 style="font-family:var(--font-display); font-size:28px; color:var(--text);">
          Good {{ greeting }} ☀️
        </h1>
        <div style="font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-top:4px;">
          {{ today }} · {{ activeTripCount }} trips active today
        </div>
      </div>
      <div class="admin-actions">
        <ThemeToggle />
        <NuxtLink to="/admin/notifications" class="btn btn-primary btn-sm">📣 Send Push Alert</NuxtLink>
      </div>
    </div>

    <!-- Metrics -->
    <div class="admin-metrics">
      <div class="admin-metric orange">
        <div class="am-val">{{ bookingsThisMonth.length }}</div>
        <div class="am-label">Bookings This Month</div>
      </div>
      <div class="admin-metric gold">
        <div class="am-val">${{ revenueThisMonth.toLocaleString() }}</div>
        <div class="am-label">Revenue This Month</div>
      </div>
      <div class="admin-metric green">
        <div class="am-val">{{ activeTripCount }}</div>
        <div class="am-label">Confirmed Trips</div>
      </div>
      <div class="admin-metric red">
        <div class="am-trend trend-down" v-if="incompleteCount">⚠ Needs follow-up</div>
        <div class="am-val">{{ incompleteCount }}</div>
        <div class="am-label">Incomplete Bookings</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Bar chart -->
      <div class="chart-card">
        <div class="chart-title">Monthly Bookings — 2025</div>
        <div class="bar-chart">
          <div class="bar-wrap" v-for="m in monthlyBookingsLive" :key="m.month">
            <div class="bar-val">{{ m.bookings }}</div>
            <div class="bar" :style="{ height: (m.bookings / maxMonthlyBookings * 100) + '%' }" />
            <div class="bar-label">{{ m.month }}</div>
          </div>
        </div>
      </div>

      <!-- Funnel -->
      <div class="chart-card">
        <div class="chart-title">Booking Materialization Funnel</div>
        <div class="funnel">
          <div class="funnel-row" v-for="(f, i) in liveFunnel" :key="f.stage">
            <div class="funnel-label">{{ f.stage }}</div>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar" :style="{ width: (f.count / (liveFunnel[0]?.count || 1) * 100) + '%', opacity: 1 - i * 0.15, background: i === liveFunnel.length - 1 ? 'var(--green-light)' : 'var(--orange)' }">
                <span class="funnel-count">{{ f.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Traffic by country -->
    <div class="chart-card" style="margin-bottom:24px;">
      <div class="chart-title-row">
        <div class="chart-title">Traffic by Country</div>
        <div class="current-visitor" v-if="analytics.visitorCountry">
          📍 Current visitor: <strong>{{ analytics.visitorCountry }}</strong>
        </div>
      </div>
      <div class="country-table">
        <div class="ct-header">
          <span>Country</span><span>Visitors</span><span>Bookings</span><span>Share</span>
        </div>
        <div class="ct-row" v-for="c in analyticsData.topCountries" :key="c.code">
          <span class="ct-country">{{ c.country }}</span>
          <span class="ct-visitors">{{ c.visitors.toLocaleString() }}</span>
          <span class="ct-bookings">{{ c.bookings }}</span>
          <span class="ct-bar-cell">
            <div class="ct-bar">
              <div class="ct-bar-fill" :style="{ width: (c.visitors / 3420 * 100) + '%' }" />
            </div>
          </span>
        </div>
      </div>
    </div>

    <!-- Bookings table -->
    <div class="chart-card">
      <div class="chart-title-row">
        <div class="chart-title">Recent Bookings</div>
        <NuxtLink to="/admin/bookings" class="btn btn-ghost btn-sm">View All →</NuxtLink>
      </div>
      <div class="bookings-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Trip</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in demoBookings" :key="b.id">
              <td class="td-id">{{ b.reference }}</td>
              <td class="td-name">{{ b.customer?.name }}</td>
              <td class="td-trip">{{ getAdventureName(b.adventure) }}</td>
              <td>{{ formatDate(b.departureDate) }}</td>
              <td class="td-amount">${{ Number(b.total).toLocaleString() }}</td>
              <td><span class="badge" :class="`badge-${b.status === 'confirmed' ? 'confirmed' : b.status === 'pending-payment' ? 'pending' : 'cancelled'}`">{{ b.status }}</span></td>
              <td><button class="btn btn-ghost btn-sm">View →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

import { useAnalyticsStore } from '~/stores/analytics'

// analyticsData.topCountries (Traffic by Country table below) is real
// web-traffic data (visitor counts) that this app has no tracking
// pipeline for, so it stays sourced from the seeded snapshot. Everything
// else derivable from actual bookings — this month's totals, the monthly
// bookings chart, and the funnel — is computed live below.
const { data: analyticsData } = await useAnalyticsSnapshot()
const { data: allBookings }   = await useBookings()
const { data: contactMessages } = await useContactMessages()
const demoBookings = computed(() => allBookings.value.slice(0, 10))

const analytics = useAnalyticsStore()

useHead({ title: 'Admin Dashboard – Summit Trail' })

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const now = new Date()
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const bookingsThisMonth = computed(() => allBookings.value.filter(b => {
  if (!b.bookedAt) return false
  const d = new Date(b.bookedAt)
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}))
const revenueThisMonth = computed(() => bookingsThisMonth.value.reduce((s, b) => s + Number(b.paid || 0), 0))
const activeTripCount = computed(() => allBookings.value.filter(b => b.status === 'confirmed').length)
const incompleteCount = computed(() => allBookings.value.filter(b => b.status === 'pending-payment').length)

const monthlyBookingsLive = computed(() => {
  const byMonth = {}
  for (const b of allBookings.value) {
    if (!b.bookedAt) continue
    const d = new Date(b.bookedAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!byMonth[key]) byMonth[key] = { month: MONTHS[d.getMonth()], bookings: 0, sortKey: key }
    byMonth[key].bookings += 1
  }
  return Object.values(byMonth).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-6)
})
const maxMonthlyBookings = computed(() => Math.max(1, ...monthlyBookingsLive.value.map(m => m.bookings)))

const liveFunnel = computed(() => [
  { stage: 'Inquiries', count: contactMessages.value.length },
  { stage: 'Bookings',  count: allBookings.value.length },
  { stage: 'Confirmed', count: allBookings.value.filter(b => b.status === 'confirmed' || b.status === 'completed').length },
  { stage: 'Paid',      count: allBookings.value.filter(b => Number(b.paid || 0) > 0).length },
  { stage: 'Completed', count: allBookings.value.filter(b => b.status === 'completed').length },
])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

function getAdventureName(adv) {
  return shortTitle(adv?.title)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.admin-overview { }
.admin-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.admin-actions { display: flex; gap: 10px; align-items: center; }

.admin-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.admin-metric { background: var(--panel); border: 1px solid var(--border); padding: 24px; position: relative; overflow: hidden; }
.admin-metric::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
.admin-metric.orange::after { background: var(--orange); }
.admin-metric.gold::after { background: var(--gold); }
.admin-metric.green::after { background: var(--green-light); }
.admin-metric.red::after { background: var(--red); }
.am-val { font-family: var(--font-display); font-size: 52px; line-height: 1; color: var(--text); }
.am-label { font-family: var(--font-condensed); font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-top: 4px; }
.am-trend { font-family: var(--font-condensed); font-size: 13px; margin-bottom: 6px; }
.trend-up { color: var(--green-light); }
.trend-down { color: var(--red); }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.chart-card { background: var(--panel); border: 1px solid var(--border); padding: 28px; }
.chart-title { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 24px; }
.chart-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }

.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
.bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.bar { width: 100%; background: var(--orange); opacity: 0.75; transition: opacity 0.2s; min-height: 4px; }
.bar:hover { opacity: 1; }
.bar-val { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); }
.bar-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); }

.funnel { display: flex; flex-direction: column; gap: 10px; }
.funnel-row { display: flex; align-items: center; gap: 14px; }
.funnel-label { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); width: 80px; flex-shrink: 0; }
.funnel-bar-wrap { flex: 1; }
.funnel-bar { height: 28px; display: flex; align-items: center; padding: 0 10px; min-width: 40px; transition: width 0.5s; }
.funnel-count { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; color: var(--black); }

.current-visitor { font-family: var(--font-condensed); font-size: 13px; color: var(--light); }
.current-visitor strong { color: var(--orange); }

.country-table { }
.ct-header { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }
.ct-row { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); align-items: center; }
.ct-country { font-family: var(--font-condensed); font-size: 14px; font-weight: 600; color: var(--text); }
.ct-visitors { font-family: var(--font-condensed); font-size: 14px; color: var(--orange); font-weight: 700; }
.ct-bookings { font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.ct-bar { background: var(--muted); height: 8px; width: 100%; }
.ct-bar-fill { height: 100%; background: var(--orange); }

.bookings-table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--border); background: var(--black); white-space: nowrap; }
.data-table td { padding: 14px 14px; border-bottom: 1px solid var(--border); font-family: var(--font-condensed); font-size: 14px; color: var(--light); }
.td-id { color: var(--muted); }
.td-name { color: var(--text); font-weight: 700; }
.td-amount { color: var(--orange); font-weight: 700; }

/* Push notification composer now lives at /admin/notifications */

@media (max-width: 1000px) {
  .admin-metrics { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
  .ct-header, .ct-row { grid-template-columns: 2fr 1fr 1fr; }
  .ct-bar-cell { display: none; }
}
@media (max-width: 600px) {
  .admin-metrics { grid-template-columns: 1fr 1fr; gap: 8px; }
  .data-table th:nth-child(3), .data-table td:nth-child(3),
  .data-table th:nth-child(4), .data-table td:nth-child(4) { display: none; }
}
</style>