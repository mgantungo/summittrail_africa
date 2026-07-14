<!--app/pages/admin/trips.vue-->
<template>
  <AdminTrips />
</template>

<script setup>
import AdminTrips from '~/components/admin/sections/AdminTrips.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Trips – Admin – Summit Trail' })
</script>
