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

// nuxt.config.js sets the site-wide default title/description/og:image —
// those are static and can't know the current route. og:url (and the
// canonical link) genuinely differ per page, so they're set here instead,
// globally, so every page gets a correct canonical link when shared —
// not just the ones (like the adventure detail page) that override the
// rest of the OG tags too.
const requestURL = useRequestURL()
useHead(() => ({
  link: [{ rel: 'canonical', href: requestURL.href }],
}))
useSeoMeta({
  ogUrl: () => requestURL.href,
})

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