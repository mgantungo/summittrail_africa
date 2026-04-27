<template>
  <div class="admin-shell">
    <AdminSidebar />
    <div class="admin-body">
      <AdminTopbar />
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()
const router  = useRouter()

onMounted(() => {
  if (!profile.isLoggedIn || !profile.isAdmin) {
    router.replace('/admin/login')
  }
})
</script>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.admin-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.admin-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: var(--deep);
}
@media (max-width: 900px) {
  .admin-shell { grid-template-columns: 1fr; }
}
</style>
