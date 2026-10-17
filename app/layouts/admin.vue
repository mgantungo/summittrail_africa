<!--app/layouts/admin.vue-->
<template>
  <div class="admin-shell">
    <AdminSidebar />
    <div class="admin-body">
      <AdminTopbar />
      <main class="admin-content">
        <slot v-if="verified" />
        <div v-else class="admin-checking">Checking access…</div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()
const router  = useRouter()

// Access is decided by the server (Admin Portal role in the CMS), not by
// what the browser has saved — see server/api/auth/admin-me.get.js.
const verified = ref(false)

onMounted(async () => {
  try {
    const { user } = await $fetch('/api/auth/admin-me')
    if (!profile.isAdmin || profile.user?.email !== user.email) profile.login(user)
    verified.value = true
  } catch {
    if (profile.isAdmin) profile.logout()
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
.admin-checking { padding: 48px; color: var(--gray); font-family: var(--font-condensed); }
</style>
