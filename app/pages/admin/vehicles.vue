<!--app/pages/admin/vehicles.vue-->
<template>
  <AdminVehicles />
</template>

<script setup>
import AdminVehicles from '~/components/admin/sections/AdminVehicles.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Vehicles – Admin – Summit Trail' })
</script>
