<!--app/components/home/HomeStoriesPreview.vue-->
<template>
  <section class="stories-preview-section section">
    <div class="stories-header">
      <div>
        <div class="section-label">Adventure Journal</div>
        <h2 class="section-title">Every Trip.<br><span>A Story.</span></h2>
      </div>
      <NuxtLink to="/stories" class="btn btn-outline">All Stories →</NuxtLink>
    </div>

    <div class="stories-preview-grid">
      <NuxtLink
        v-for="story in featured"
        :key="story.id"
        :to="`/stories/${story.slug}`"
        class="story-preview-card"
      >
        <img :src="story.image" :alt="story.title" class="story-preview-img" loading="lazy" />
        <div class="story-preview-overlay" />
        <div class="story-preview-content">
          <div class="story-preview-cat">{{ story.category }}</div>
          <div class="story-preview-title">{{ story.title }}</div>
          <div class="story-preview-meta">{{ story.author.name }} · {{ story.readTime }} min read</div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { stories } from '~~/data/demo.js'

const featured = computed(() => stories.slice(0, 3))
</script>

<style scoped>
.stories-preview-section {
  background: var(--charcoal);
  padding-top: 80px;
  padding-bottom: 80px;
}

.stories-header {
  display: flex; justify-content: space-between;
  align-items: flex-end; margin-bottom: 40px;
  flex-wrap: wrap; gap: 16px;
}

.stories-preview-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
}
.story-preview-card {
  position: relative; height: 340px; overflow: hidden;
  cursor: pointer; display: block;
}
.story-preview-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s;
}
.story-preview-card:hover .story-preview-img { transform: scale(1.04); }
.story-preview-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,10,8,.9), transparent 50%);
}
.story-preview-content {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
}
.story-preview-cat {
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px;
}
.story-preview-title {
  font-family: var(--font-condensed); font-size: 18px; font-weight: 700;
  color: var(--white); line-height: 1.25; margin-bottom: 8px;
}
.story-preview-meta {
  font-family: var(--font-condensed); font-size: 13px; color: var(--gray);
}

@media (max-width: 768px) { .stories-preview-grid { grid-template-columns: 1fr; } }
</style>
