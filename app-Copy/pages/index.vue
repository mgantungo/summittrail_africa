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
useHead({ title: 'Summit Trail Limited – Push Beyond Limits' })
</script>

<style scoped>
/* Page shell — section styles live in each component */
.home { display: block; }
</style>
