<!--app/components/home/HomeReviews.vue-->
<template>
  <section class="section reviews-section">
    <div class="section-label">Verified Reviews</div>
    <h2 class="section-title" style="margin-bottom:40px;">What They<br><span>Say</span></h2>

    <div class="reviews-grid">
      <div class="review-card" v-for="r in reviews" :key="r.id">
        <div class="stars">★★★★★</div>
        <div class="review-title">{{ r.title }}</div>
        <p class="review-text">"{{ r.content }}"</p>
        <div class="reviewer">
          <img :src="r.author.avatar" :alt="r.author.name" class="reviewer-img" />
          <div>
            <div class="reviewer-name">{{ r.author.name }}</div>
            <div class="reviewer-loc">{{ r.author.location }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reviews as demoReviews } from '~~/data/demo.js'

const reviews = demoReviews
</script>

<style scoped>
.reviews-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
.review-card {
  background: var(--panel); border: 1px solid var(--border); padding: 28px;
  transition: border-color 0.2s;
}
.review-card:hover { border-color: var(--orange); }
.stars        { color: var(--gold); letter-spacing: 2px; font-size: 18px; }
.review-title {
  font-family: var(--font-condensed); font-size: 17px;
  font-weight: 700; color: var(--text); margin: 8px 0;
}
.review-text  {
  font-size: 15px; font-weight: 300; color: var(--light);
  line-height: 1.7; margin-bottom: 20px; font-style: italic;
}
.reviewer { display: flex; align-items: center; gap: 10px; }
.reviewer-img  { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.reviewer-name { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--text); }
.reviewer-loc  { font-size: 13px; color: var(--gray); }

@media (max-width: 768px) { .reviews-grid { grid-template-columns: 1fr; } }
</style>
