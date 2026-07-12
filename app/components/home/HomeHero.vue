<!--app/components/home/HomeHero.vue-->
<template>
  <section class="hero">
    <!-- hero-visual: the ONLY layer that clips. Background/overlay
         live here so they can never cut off text content. -->
    <div class="hero-visual">
      <div class="hero-bg" />
      <div class="hero-overlay" />
    </div>

    <!-- hero-zone: centred, capped at var(--max-w), sizes itself to
         its own content (with a nav-aware floor) so nothing gets clipped. -->
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
          <NuxtLink to="/adventures" class="btn btn-primary">Explore Expeditions</NuxtLink>
          <NuxtLink to="/stories"    class="btn btn-outline">Watch Stories</NuxtLink>
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
/* Hero sits below the fixed AppNav and sizes itself from its content,
   with a floor of ~65vh (minus the nav) so it never balloons on tall
   screens or gets clipped on short ones. */
.hero {
  position: relative;
  margin-top: var(--nav-h);
  display: flex; align-items: flex-end;
}

/* Clipping layer — background/overlay only. Never wraps text content,
   so copy can never be cut off no matter how the box resizes. */
.hero-visual {
  position: absolute; inset: 0;
  overflow: hidden;
  z-index: 0;
}
.hero-bg {
  position: absolute; top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-w);
  background: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80') center/cover no-repeat;
}
.hero-overlay {
  position: absolute; top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-w);
  background: linear-gradient(to top, rgba(10,10,8,1) 0%, rgba(10,10,8,0.5) 50%, rgba(10,10,8,0.1) 100%);
}

/* Zone constrains content to --max-w and drives the hero's actual
   height — content-first, with a floor so short copy never leaves
   the hero looking cramped. */
.hero-zone {
  position: relative;
  z-index: 2;
  width: 100%; max-width: var(--max-w); margin: 0 auto;
  min-height: clamp(420px, calc(65vh - var(--nav-h)), 720px);
  display: flex; align-items: flex-end;
}

.hero-content {
  position: relative;
  padding: 0 var(--gutter-base) 56px;
  max-width: 720px;
}
.hero-eyebrow {
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--orange);
  margin-bottom: 14px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(52px, 7.5vw, 108px);
  line-height: 0.92; letter-spacing: -1px; color: var(--white);
  margin-bottom: 18px;
}
.hero-title span { color: var(--orange); }
.hero-sub {
  font-size: 15px; font-weight: 300; color: var(--light);
  line-height: 1.6; max-width: 420px; margin-bottom: 24px;
}
.hero-ctas { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.hero-ctas .btn { padding: 12px 26px; font-size: 13px; }

.hero-stats {
  position: absolute; right: var(--gutter-base); bottom: 56px;
  display: flex; flex-direction: column; gap: 14px;
  align-items: flex-end; opacity: 0;
  animation: fadeUp 0.7s ease 0.7s both;
}
.hero-stat { text-align: right; }
.hero-stat-num {
  font-family: var(--font-display); font-size: 28px;
  color: var(--orange); line-height: 1;
}
.hero-stat-label {
  font-family: var(--font-condensed); font-size: 11px;
  font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--gray);
}

.hero-scroll {
  position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.scroll-line {
  width: 1px; height: 28px; background: var(--orange);
  animation: scrollPulse 2s ease infinite;
}
.scroll-text {
  font-family: var(--font-condensed); font-size: 10px; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; color: var(--gray);
}

@media (max-width: 1000px) {
  .hero-title { font-size: clamp(44px, 8vw, 88px); }
}
@media (max-width: 768px) {
  .hero-zone { min-height: clamp(380px, calc(60vh - var(--nav-h)), 640px); }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .hero-ctas .btn { width: 100%; justify-content: center; }
  .hero-stats { display: none; }
}
@media (max-width: 480px) {
  .hero-title { font-size: 40px; }
  .hero-content { padding-bottom: 40px; }
  .hero-scroll { display: none; }
}
</style>