<!--app/components/admin/sections/AdminGuides.vue-->
<template>
  <div>
    <div class="section-label">Guide Management</div>
    <h2 class="as-title">Our Guides</h2>
    <div class="guides-grid">
      <div class="guide-card" v-for="g in guides" :key="g.id">
        <div class="g-header">
          <img :src="g.avatar" :alt="g.name" class="g-avatar" />
          <div>
            <div class="g-name">{{ g.name }}</div>
            <div class="g-role">{{ g.role }}</div>
            <div class="g-rating">★ {{ g.rating }} · {{ g.expeditions }} expeditions</div>
          </div>
        </div>
        <p class="g-bio">{{ g.bio }}</p>
        <div class="g-section-label">Specialties</div>
        <div class="g-tags">
          <span class="g-tag" v-for="s in g.specialties" :key="s">{{ s }}</span>
        </div>
        <div class="g-section-label">Certifications</div>
        <div class="g-certs">
          <div class="g-cert" v-for="c in g.certifications" :key="c">✓ {{ c }}</div>
        </div>
        <div class="g-section-label">Languages</div>
        <div class="g-tags">
          <span class="g-tag" v-for="l in g.languages" :key="l">🌍 {{ l }}</span>
        </div>
        <div class="g-meta">Experience: <strong>{{ g.experience }} years</strong></div>
        <div class="g-actions">
          <button class="btn btn-ghost btn-sm">Edit Profile</button>
          <button class="btn btn-ghost btn-sm">Assign to Trip</button>
          <button class="btn btn-primary btn-sm">View Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: guides } = await useGuides()
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.guides-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.guide-card { background:var(--panel); border:1px solid var(--border); padding:24px; }
.g-header { display:flex; gap:16px; align-items:flex-start; margin-bottom:16px; }
.g-avatar { width:64px; height:64px; border-radius:50%; object-fit:cover; border:3px solid var(--orange); flex-shrink:0; }
.g-name   { font-family:var(--font-condensed); font-size:18px; font-weight:700; color:var(--text); }
.g-role   { font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-top:3px; }
.g-rating { font-family:var(--font-condensed); font-size:13px; color:var(--gold); margin-top:3px; }
.g-bio    { font-size:14px; color:var(--light); line-height:1.7; margin-bottom:16px; }
.g-section-label { font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-bottom:8px; margin-top:14px; }
.g-tags { display:flex; gap:6px; flex-wrap:wrap; }
.g-tag  { font-family:var(--font-condensed); font-size:12px; background:var(--charcoal); border:1px solid var(--border); color:var(--light); padding:4px 10px; }
.g-certs { display:flex; flex-direction:column; gap:5px; }
.g-cert  { font-family:var(--font-condensed); font-size:13px; color:var(--green-light); }
.g-meta  { font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-top:14px; }
.g-meta strong { color:var(--orange); }
.g-actions { display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; }
@media (max-width:800px) { .guides-grid { grid-template-columns:1fr; } }
</style>
