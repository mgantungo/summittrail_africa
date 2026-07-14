<!--app/components/home/HomeWhySummitTrail.vue-->
<template>
  <section class="why-section section">
    <div class="section-label">Why Summit Trail</div>
    <div class="why-grid">
      <div class="why-card" v-for="w in cards" :key="w.title">
        <div class="why-icon">{{ w.icon }}</div>
        <div class="why-title">{{ w.title }}</div>
        <div class="why-desc">{{ w.desc }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
const cards = [
  {
    icon: '🛡️',
    title: 'Certified Safety',
    desc: "Every guide holds Wilderness First Responder or higher. We've never had a serious incident in 340+ expeditions.",
  },
  {
    icon: '🧭',
    title: 'Expert Guides',
    desc: '4 specialist guides with 12–15 years each in the field. They\'ve been where you\'re going – many times.',
  },
  {
    icon: '🛤️',
    title: 'Unique Routes',
    desc: "We go where others don't. Our overland tracks, summit routes, and survival zones are exclusive to Summit Trail.",
  },
  {
    icon: '📲',
    title: 'Full Digital Support',
    desc: 'Book, prepare, track, and relive your adventure – all through our integrated platform. Before, during, and after.',
  },
]
</script>

<style scoped>
.why-section { background: var(--deep); }

.why-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 2px; margin-top: 40px;
}
.why-card {
  background: var(--panel); border: 1px solid var(--border);
  padding: 36px 28px;
  transition: border-color 0.2s;
}
.why-card:hover { border-color: var(--orange); }
.why-icon  { font-size: 36px; margin-bottom: 16px; }
.why-title {
  font-family: var(--font-condensed); font-size: 20px; font-weight: 700;
  color: var(--text); margin-bottom: 10px;
}
.why-desc  { font-size: 15px; font-weight: 300; color: var(--light); line-height: 1.7; }

@media (max-width: 1100px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .why-grid { grid-template-columns: 1fr; } }
</style>
