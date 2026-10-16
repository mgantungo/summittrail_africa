<template>
  <div class="tracking-page">
    <HomeLiveTracking
      variant="page"
      :expedition-id="expeditionId"
      :trail-slug="trailSlug"
      @select="onSelect"
    />
  </div>
</template>

<script setup>
// app/pages/tracking/index.vue
//
// Live expedition tracking — all data from the Strapi `live-expedition`
// collection (status = active). Deep links:
//   /tracking?expedition=<documentId>   a specific expedition
//   /tracking?trail=<adventure slug>    the live expedition on that trail
import HomeLiveTracking from '~/components/home/HomeLiveTracking.vue'

const route  = useRoute()
const router = useRouter()

const firstParam = (v) => (Array.isArray(v) ? v[0] : v) || ''
const expeditionId = computed(() => String(firstParam(route.query.expedition)))
const trailSlug    = computed(() => String(firstParam(route.query.trail)))

// Keep the URL shareable: switching tabs rewrites ?expedition=<id>
function onSelect(key) {
  router.replace({ query: { expedition: key } })
}

useHead({ title: 'Live Expedition Tracking – Summit Trail' })
</script>

<style scoped>
.tracking-page { padding-top: var(--nav-h, 76px); }
</style>
