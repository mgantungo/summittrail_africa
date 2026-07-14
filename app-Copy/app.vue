<!--app/app.vue-->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { useAnalyticsStore } from '~/stores/analytics'

const profile = useProfileStore()
const analytics = useAnalyticsStore()
const route = useRoute()

onMounted(async () => {
  profile.hydrate()
  await analytics.initSession()
})

watch(() => route.fullPath, (path) => {
  if (!process.client) return
  profile.setLastPage(path)
  analytics.trackPageView(path, document?.title || path)
}, { immediate: true })
</script>
