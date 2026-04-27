<template>
  <div class="error-page">
    <div class="error-bg" />
    <div class="error-overlay" />
    <div class="error-content">
      <div class="error-code">{{ error?.statusCode || '404' }}</div>
      <h1 class="error-title">
        <span v-if="error?.statusCode === 404">Trail Not Found</span>
        <span v-else>Something Went Wrong</span>
      </h1>
      <p class="error-sub">
        <span v-if="error?.statusCode === 404">
          The expedition you're looking for doesn't exist – or you've wandered off the trail.
        </span>
        <span v-else>
          Even the best guides hit unexpected terrain. Try again or head back to base camp.
        </span>
      </p>
      <div class="error-actions">
        <button class="btn btn-primary btn-lg" @click="handleError">← Back to Safety</button>
        <NuxtLink to="/adventures" class="btn btn-outline btn-lg">Explore Adventures</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ error: Object })
const router = useRouter()

function handleError() {
  clearError()
  router.push('/')
}
</script>

<style scoped>
.error-page {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; justify-content: center; padding: 40px;
}
.error-bg {
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80') center/cover no-repeat;
}
.error-overlay {
  position: absolute; inset: 0;
  background: rgba(10,10,8,0.82);
}
.error-content { position: relative; z-index: 2; text-align: center; max-width: 600px; }
.error-code { font-family: var(--font-display); font-size: 180px; color: var(--orange); opacity: 0.3; line-height: 1; margin-bottom: -20px; }
.error-title { font-family: var(--font-display); font-size: 52px; color: var(--white); margin-bottom: 16px; }
.error-sub { font-size: 16px; font-weight: 300; color: var(--light); line-height: 1.7; max-width: 420px; margin: 0 auto 40px; }
.error-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
</style>
