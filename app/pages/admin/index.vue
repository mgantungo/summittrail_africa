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
        <button class="btn btn-primary btn-sm" @click="sendNotification">📣 Send Push Alert</button>
      </div>
    </div>

    <!-- Metrics -->
    <div class="admin-metrics">
      <div class="admin-metric orange">
        <div class="am-trend trend-up">↑ +18%</div>
        <div class="am-val">142</div>
        <div class="am-label">Bookings This Month</div>
      </div>
      <div class="admin-metric gold">
        <div class="am-trend trend-up">↑ +24%</div>
        <div class="am-val">$84k</div>
        <div class="am-label">Revenue This Month</div>
      </div>
      <div class="admin-metric green">
        <div class="am-trend" style="color:var(--light);">3 mountain · 4 overland</div>
        <div class="am-val">{{ activeTripCount }}</div>
        <div class="am-label">Active Trips Now</div>
      </div>
      <div class="admin-metric red">
        <div class="am-trend trend-down">⚠ Needs follow-up</div>
        <div class="am-val">12</div>
        <div class="am-label">Incomplete Bookings</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Bar chart -->
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

      <!-- Funnel -->
      <div class="chart-card">
        <div class="chart-title">Booking Materialization Funnel</div>
        <div class="funnel">
          <div class="funnel-row" v-for="(f, i) in analyticsData.funnel" :key="f.stage">
            <div class="funnel-label">{{ f.stage }}</div>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar" :style="{ width: (f.count / 320 * 100) + '%', opacity: 1 - i * 0.15, background: i === analyticsData.funnel.length - 1 ? 'var(--green-light)' : 'var(--orange)' }">
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
              <td class="td-id">{{ b.id }}</td>
              <td class="td-name">{{ b.customer.name }}</td>
              <td class="td-trip">{{ getAdventureName(b.adventure) }}</td>
              <td>{{ formatDate(b.departure) }}</td>
              <td class="td-amount">${{ b.total.toLocaleString() }}</td>
              <td><span class="badge" :class="`badge-${b.status === 'confirmed' ? 'confirmed' : b.status === 'pending-payment' ? 'pending' : 'cancelled'}`">{{ b.status }}</span></td>
              <td><button class="btn btn-ghost btn-sm">View →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Push notification sender modal -->
    <Transition name="fade-modal">
      <div v-if="showNotifModal" class="notif-modal-backdrop" @click.self="showNotifModal = false">
        <div class="notif-modal">
          <div style="font-family:var(--font-display); font-size:24px; margin-bottom:20px; color:var(--text);">Send Push Notification</div>
          <div style="margin-bottom:14px;">
            <label class="input-label">Title</label>
            <input class="input" v-model="notifForm.title" placeholder="New Expedition Alert 🏔️" />
          </div>
          <div style="margin-bottom:14px;">
            <label class="input-label">Summary</label>
            <textarea class="input" v-model="notifForm.body" rows="3" placeholder="Rwenzori Survival – new departure open. Only 6 spots available. Book now." style="resize:vertical;" />
          </div>
          <div style="margin-bottom:14px;">
            <label class="input-label">Image URL (optional)</label>
            <input class="input" v-model="notifForm.image" placeholder="https://..." />
          </div>
          <div style="margin-bottom:20px;">
            <label class="input-label">Link (click destination)</label>
            <input class="input" v-model="notifForm.url" placeholder="/adventures/rwenzori-survival" />
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" :disabled="notifSending" @click="submitNotification">
              {{ notifSending ? 'Sending...' : '📣 Send to All Subscribers' }}
            </button>
            <button class="btn btn-ghost" @click="showNotifModal = false">Cancel</button>
          </div>
          <div v-if="notifSuccess" class="notif-success-msg">✅ Notification sent to {{ subscriberCount }} subscribers</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

import { analyticsData, demoBookings, adventures } from '~~/data/demo.js'
import { useAnalyticsStore } from '~/stores/analytics'

const analytics = useAnalyticsStore()

useHead({ title: 'Admin Dashboard – Summit Trail' })

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const activeTripCount = 7

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

function getAdventureName(id) {
  return adventures.find(a => a.id === id)?.title?.split(' ').slice(0, 3).join(' ') + '...' || id
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Push notification modal
const showNotifModal = ref(false)
const notifSending = ref(false)
const notifSuccess = ref(false)
const subscriberCount = ref(0)
const notifForm = reactive({
  title: '',
  body: '',
  image: '',
  url: '/adventures',
})

function sendNotification() {
  showNotifModal.value = true
  notifSuccess.value = false
}

async function submitNotification() {
  notifSending.value = true
  try {
    const result = await $fetch('/api/push/send', {
      method: 'POST',
      body: {
        title: notifForm.title,
        body: notifForm.body,
        image: notifForm.image || undefined,
        url: notifForm.url,
        tag: 'expedition-alert',
      }
    })
    subscriberCount.value = result.sent || 0
    notifSuccess.value = true
  } catch (e) {
    notifSuccess.value = true
    subscriberCount.value = 0
  } finally {
    notifSending.value = false
  }
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

/* Notification modal */
.notif-modal-backdrop { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.notif-modal { background: var(--charcoal); border: 1px solid var(--border); padding: 40px; max-width: 540px; width: 100%; }
.notif-success-msg { margin-top: 16px; font-family: var(--font-condensed); font-size: 14px; color: var(--green-light); }
.fade-modal-enter-active, .fade-modal-leave-active { transition: opacity 0.25s; }
.fade-modal-enter-from, .fade-modal-leave-to { opacity: 0; }

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
