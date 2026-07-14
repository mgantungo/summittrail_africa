<!--app/components/admin/sections/AdminVehicles.vue-->
<template>
  <div>
    <div class="section-label">Fleet Management</div>
    <h2 class="as-title">Vehicles</h2>
    <div class="vehicles-grid">
      <div class="vehicle-card" v-for="v in vehicles" :key="v.id">
        <div class="v-img-wrap">
          <img :src="v.image" :alt="v.name" class="v-img" loading="lazy" />
          <div class="v-status-badge" :class="`v-${v.status}`">{{ v.status }}</div>
        </div>
        <div class="v-body">
          <div class="v-id">{{ v.id }}</div>
          <div class="v-name">{{ v.name }}</div>
          <div class="v-type">{{ v.type }}</div>
          <div class="v-features">
            <span v-for="f in v.features.slice(0,3)" :key="f" class="v-tag">{{ f }}</span>
            <span v-if="v.features.length > 3" class="v-tag v-tag-more">+{{ v.features.length - 3 }}</span>
          </div>
          <div class="v-meta">
            <span>👥 Cap: {{ v.capacity }}</span>
            <span>🔧 Last service: {{ v.lastMaintenance }}</span>
          </div>
          <div class="v-actions">
            <button class="btn btn-primary btn-sm" v-if="v.status === 'available'">Assign to Trip</button>
            <button class="btn btn-ghost btn-sm">Edit</button>
            <button class="btn btn-ghost btn-sm">Log Service</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: vehicles } = await useVehicles()
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.vehicles-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.vehicle-card { background:var(--panel); border:1px solid var(--border); overflow:hidden; }
.v-img-wrap { height:200px; position:relative; overflow:hidden; }
.v-img { width:100%; height:100%; object-fit:cover; }
.v-status-badge { position:absolute; top:12px; right:12px; font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:5px 12px; }
.v-available { background:rgba(77,140,77,0.9); color:#fff; }
.v-on-trip   { background:rgba(232,98,42,0.9); color:var(--black); }
.v-maintenance { background:rgba(212,168,67,0.9); color:var(--black); }
.v-body { padding:20px; }
.v-id   { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--gray); margin-bottom:4px; }
.v-name { font-family:var(--font-display); font-size:26px; color:var(--text); }
.v-type { font-family:var(--font-condensed); font-size:14px; color:var(--light); margin-bottom:12px; }
.v-features { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
.v-tag { font-family:var(--font-condensed); font-size:11px; color:var(--light); background:var(--charcoal); border:1px solid var(--border); padding:3px 8px; }
.v-tag-more { color:var(--gray); }
.v-meta { display:flex; gap:16px; font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:14px; flex-wrap:wrap; }
.v-actions { display:flex; gap:8px; flex-wrap:wrap; }
@media (max-width:700px) { .vehicles-grid { grid-template-columns:1fr; } }
</style>
