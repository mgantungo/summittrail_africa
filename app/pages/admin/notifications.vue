<!--app/pages/admin/notifications.vue-->
<template>
  <div>
    <div class="section-label">Engagement</div>
    <h2 class="as-title">Push Alerts</h2>

    <div class="dash-card" style="max-width:560px;">
      <div class="section-label">Compose Notification</div>
      <div style="margin-bottom:14px;">
        <label class="input-label">Title</label>
        <input class="input" v-model="form.title" placeholder="New Expedition Alert 🏔️" />
      </div>
      <div style="margin-bottom:14px;">
        <label class="input-label">Summary</label>
        <textarea class="input" v-model="form.body" rows="3" placeholder="Rwenzori Survival – new departure open. Only 6 spots available. Book now." style="resize:vertical;" />
      </div>
      <div style="margin-bottom:14px;">
        <label class="input-label">Image URL (optional)</label>
        <input class="input" v-model="form.image" placeholder="https://..." />
      </div>
      <div style="margin-bottom:20px;">
        <label class="input-label">Link (click destination)</label>
        <input class="input" v-model="form.url" placeholder="/adventures/rwenzori-survival" />
      </div>
      <button class="btn btn-primary" :disabled="sending || !form.title || !form.body" @click="submit">
        {{ sending ? 'Sending…' : '📣 Send to All Subscribers' }}
      </button>
      <div v-if="success" class="notif-success-msg">✅ Notification sent to {{ subscriberCount }} subscribers</div>
      <div v-if="error" class="notif-error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'Push Alerts – Admin – Summit Trail' })

const sending = ref(false)
const success = ref(false)
const error = ref(null)
const subscriberCount = ref(0)
const form = reactive({ title: '', body: '', image: '', url: '/adventures' })

async function submit() {
  sending.value = true
  success.value = false
  error.value = null
  try {
    const result = await $fetch('/api/push/send', {
      method: 'POST',
      body: {
        title: form.title,
        body: form.body,
        image: form.image || undefined,
        url: form.url,
        tag: 'expedition-alert',
      },
    })
    subscriberCount.value = result.sent || 0
    success.value = true
    form.title = ''
    form.body = ''
    form.image = ''
  } catch (e) {
    error.value = 'Could not send notification. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; }
.notif-success-msg { margin-top:16px; color:var(--green-light); font-family:var(--font-condensed); font-size:14px; }
.notif-error-msg { margin-top:16px; color:var(--red); font-family:var(--font-condensed); font-size:14px; }
</style>
