<!--app/pages/admin/bookings.vue-->
<template>
  <AdminBookings />
</template>

<script setup>
import AdminBookings from '~/components/admin/sections/AdminBookings.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Bookings – Admin – Summit Trail' })
</script>