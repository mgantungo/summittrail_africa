<!--app/pages/index.vue-->
<template>
  <div class="home">
    <HomeHero />
    <HomeFilterBar />
    <HomeFeaturedAdventures />
    <HomeWhySummitTrail />
    <HomeLiveTracking />
    <HomeUpcomingDepartures />
    <HomeStoriesPreview />
    <HomeReviews />
  </div>
</template>

<script setup>
import HomeHero from '~/components/home/HomeHero.vue'
import HomeFilterBar from '~/components/home/HomeFilterBar.vue'
import HomeFeaturedAdventures from '~/components/home/HomeFeaturedAdventures.vue'
import HomeWhySummitTrail from '~/components/home/HomeWhySummitTrail.vue'
import HomeLiveTracking from '~/components/home/HomeLiveTracking.vue'
import HomeUpcomingDepartures from '~/components/home/HomeUpcomingDepartures.vue'
import HomeStoriesPreview from '~/components/home/HomeStoriesPreview.vue'
import HomeReviews from '~/components/home/HomeReviews.vue'

useHead({ title: 'Summit Trail Limited – Push Beyond Limits' })

// Nuxt caches useFetch/useAsyncData results by key for performance, so
// navigating back to "/" via the browser back button can show stale data
// instead of refetching. Since this page component unmounts when you
// navigate away and remounts when you come back, onMounted fires again
// every time you land here — refreshNuxtData() forces every composable
// on the page (adventures, stories, reviews, live expeditions, etc.) to
// refetch fresh data at that point.
onMounted(() => {
  refreshNuxtData()
})
</script>

<style scoped>
/* Page shell — section styles live in each component */
.home { display: block; }
</style>