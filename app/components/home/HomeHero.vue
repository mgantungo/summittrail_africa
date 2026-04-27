<template>
  <section class="hero">
    <div class="hero-bg" />
    <div class="hero-overlay" />

    <!-- hero-zone: centred, capped at var(--max-w).
         All content is positioned inside this zone so nothing
         shifts once the viewport exceeds 1920px. -->
    <div class="hero-zone">
      <div class="hero-content">
        <div class="hero-eyebrow fade-up fade-up-1">Uganda's Premier Expedition Company</div>
        <h1 class="hero-title fade-up fade-up-2">
          Push<br><span>Beyond</span><br>Limits
        </h1>
        <p class="hero-sub fade-up fade-up-3">
          Overland expeditions. Survival challenges. Mountain ascents.
          Convoy adventures. Life-defining journeys into the extreme.
        </p>
        <div class="hero-ctas fade-up fade-up-4">
          <NuxtLink to="/adventures" class="btn btn-primary btn-lg">Explore Expeditions</NuxtLink>
          <NuxtLink to="/stories"    class="btn btn-outline btn-lg">Watch Stories</NuxtLink>
        </div>
      </div>

      <div class="hero-stats fade-up fade-up-5">
        <div class="hero-stat" v-for="s in stats" :key="s.label">
          <div class="hero-stat-num">{{ s.num }}</div>
          <div class="hero-stat-label">{{ s.label }}</div>
        </div>
      </div>

      <div class="hero-scroll">
        <div class="scroll-line" />
        <div class="scroll-text">Scroll</div>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { num: '340+', label: 'Expeditions Completed' },
  { num: '92%',  label: 'Completion Rate'       },
  { num: '18',   label: 'Countries Reached'     },
]
</script>

<style scoped>
.hero {
  position: relative; height: 100vh; min-height: 700px;
  display: flex; align-items: flex-end; overflow: hidden;
}

/* Background image — centred, capped at --max-w.
   Theme colour fills the browser edges on ultrawide screens. */
.hero-bg {
  position: absolute; top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-w);
  background: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80') center/cover no-repeat;
}

/* Gradient overlay — same bounds as the image */
.hero-overlay {
  position: absolute; top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-w);
  background: linear-gradient(to top, rgba(10,10,8,1) 0%, rgba(10,10,8,0.5) 50%, rgba(10,10,8,0.1) 100%);
}

/* Zone constrains all content to --max-w so text never drifts
   beyond the image at ultrawide resolutions. */
.hero-zone {
  position: absolute; inset: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-w);
  display: flex; align-items: flex-end;
  z-index: 2;
}

.hero-content {
  position: relative;
  padding: 0 var(--gutter-base) 80px;
  max-width: 900px;
}
.hero-eyebrow {
  font-family: var(--font-condensed); font-size: 14px; font-weight: 700;
  letter-spacing: 4px; text-transform: uppercase; color: var(--orange);
  margin-bottom: 20px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(80px, 11vw, 160px);
  line-height: 0.9; letter-spacing: -1px; color: var(--white);
  margin-bottom: 24px;
}
.hero-title span { color: var(--orange); }
.hero-sub {
  font-size: 17px; font-weight: 300; color: var(--light);
  line-height: 1.7; max-width: 480px; margin-bottom: 36px;
}
.hero-ctas { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }

.hero-stats {
  position: absolute; right: var(--gutter-base); bottom: 80px;
  display: flex; flex-direction: column; gap: 20px;
  align-items: flex-end; opacity: 0;
  animation: fadeUp 0.7s ease 0.7s both;
}
.hero-stat { text-align: right; }
.hero-stat-num {
  font-family: var(--font-display); font-size: 40px;
  color: var(--orange); line-height: 1;
}
.hero-stat-label {
  font-family: var(--font-condensed); font-size: 12px;
  font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  color: var(--gray);
}

.hero-scroll {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.scroll-line {
  width: 1px; height: 40px; background: var(--orange);
  animation: scrollPulse 2s ease infinite;
}
.scroll-text {
  font-family: var(--font-condensed); font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--gray);
}

@media (max-width: 768px) {
  .hero-ctas { flex-direction: column; }
  .hero-ctas .btn { width: 100%; justify-content: center; }
  .hero-stats { display: none; }
}
@media (max-width: 480px) {
  .hero-title { font-size: 56px; }
}
</style>
