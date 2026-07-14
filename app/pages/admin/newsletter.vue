<!--app/pages/admin/newsletter.vue-->
<template>
  <div>
    <div class="section-label">Email Marketing</div>
    <h2 class="as-title">Newsletter Subscribers</h2>

    <div class="summary-row">
      <div class="sum-card">
        <div class="sum-val" style="color:var(--white);">{{ subscribers.length }}</div>
        <div class="sum-label">Active Subscribers</div>
      </div>
      <div class="sum-card">
        <div class="sum-val" style="color:var(--orange);">{{ recentCount }}</div>
        <div class="sum-label">New This Month</div>
      </div>
    </div>

    <div class="table-card">
      <table class="dtable">
        <thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Subscribed</th></tr></thead>
        <tbody>
          <tr v-for="s in subscribers" :key="s.id">
            <td style="color:var(--text);font-weight:700;">{{ s.email }}</td>
            <td>{{ s.name || '—' }}</td>
            <td>{{ s.source || '—' }}</td>
            <td>{{ fmt(s.subscribedAt) }}</td>
          </tr>
          <tr v-if="!subscribers.length">
            <td colspan="4" style="text-align:center;padding:40px;color:var(--gray);">No subscribers yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'Newsletter – Admin – Summit Trail' })

const { data: subscribers } = await useNewsletterSubscribers()

const recentCount = computed(() => {
  const now = new Date()
  return subscribers.value.filter(s => {
    if (!s.subscribedAt) return false
    const d = new Date(s.subscribedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.summary-row { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:20px; max-width:500px; }
.sum-card { background:var(--panel); border:1px solid var(--border); padding:20px 24px; }
.sum-val   { font-family:var(--font-display); font-size:40px; line-height:1; margin-bottom:4px; }
.sum-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); }
.table-card { background:var(--panel); border:1px solid var(--border); overflow-x:auto; }
.dtable { width:100%; border-collapse:collapse; }
.dtable th { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); text-align:left; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--black); white-space:nowrap; }
.dtable td { padding:14px 16px; border-bottom:1px solid var(--border); font-family:var(--font-condensed); font-size:14px; color:var(--light); }
</style>
