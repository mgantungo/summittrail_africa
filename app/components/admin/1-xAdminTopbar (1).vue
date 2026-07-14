<!--app/components/admin/AdminTopbar.vue-->
<template>
  <div class="admin-topbar">
    <div class="breadcrumb">
      <span>Admin</span>
      <span class="bc-sep">/</span>
      <span class="bc-current">{{ pageTitle }}</span>
    </div>
    <div class="topbar-right">
      <ThemeToggle />
      <div class="topbar-live" v-if="liveCount > 0">
        <div class="topbar-live-dot" />
        {{ liveCount }} active trips
      </div>
      <div class="topbar-avatar">
        <span style="font-family:var(--font-condensed); font-size:13px; color:var(--gray);">Admin</span>
        <div style="width:32px; height:32px; background:var(--orange); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:var(--black);">A</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const pageTitle = computed(() => {
  const map = {
    '/admin': 'Overview',
    '/admin/bookings': 'Bookings',
    '/admin/analytics': 'Analytics',
    '/admin/newsletter': 'Newsletter',
  }
  return map[route.path] || route.path.split('/').pop()
})
const liveCount = 7
</script>

<style scoped>
.admin-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 32px; height: 60px; background: var(--panel); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.breadcrumb { font-family: var(--font-condensed); font-size: 13px; color: var(--gray); display: flex; gap: 8px; align-items: center; }
.bc-sep { color: var(--muted); }
.bc-current { color: var(--text); font-weight: 700; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.topbar-live { display: flex; align-items: center; gap: 8px; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--green-light); }
.topbar-live-dot { width: 8px; height: 8px; background: var(--green-light); border-radius: 50%; animation: pulse 1.5s infinite; }
.topbar-avatar { display: flex; align-items: center; gap: 10px; }
</style>
