<!--app/pages/admin/customers.vue-->
<template>
  <AdminCustomers />
</template>

<script setup>
import AdminCustomers from '~/components/admin/sections/AdminCustomers.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Customers – Admin – Summit Trail' })
</script>