<!--app/pages/admin/analytics.vue-->
<template>
  <AdminAnalytics />
</template>

<script setup>
import AdminAnalytics from '~/components/admin/sections/AdminAnalytics.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Analytics – Admin – Summit Trail' })
</script>