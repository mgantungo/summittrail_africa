<!--app/pages/stories/index.vue-->
<template>
  <div style="padding-top:72px;">
    <section class="section">
      <div class="section-label">Adventure Journal</div>
      <h1 class="section-title">Stories From<br><span>The Trail</span></h1>

      <div v-if="pending" class="empty-state">Loading stories…</div>
      <div v-else-if="!stories.length" class="empty-state">No stories published yet — check back soon.</div>
      <div v-else class="story-grid">
        <NuxtLink v-for="s in stories" :key="s.id" :to="`/stories/${s.slug}`" class="story-card">
          <div class="story-card-img" :style="{ backgroundImage: `url(${s.image})` }" />
          <div class="story-card-body">
            <div class="story-card-cat">{{ s.category }}</div>
            <h3 class="story-card-title">{{ s.title }}</h3>
            <p class="story-card-excerpt">{{ s.excerpt }}</p>
            <div class="story-card-meta">{{ s.author?.name || 'Summit Trail' }} · {{ s.readTime }} min read</div>
          </div>
        </NuxtLink>
      </div>

      <div class="journal-cta">
        <NuxtLink to="/share-your-story" class="btn btn-outline">✍️ Share Your Own Story</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({ title: 'Adventure Journal – Summit Trail' })
const { data: stories, pending } = await useStories()
</script>

<style scoped>
.empty-state { padding: 60px 0; text-align: center; color: var(--gray); font-family: var(--font-condensed); }
.story-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; padding-bottom: 40px; margin-top: 24px; }
.story-card { display: block; background: var(--panel); border: 1px solid var(--border); text-decoration: none; transition: border-color 0.2s, transform 0.2s; }
.story-card:hover { border-color: var(--orange); transform: translateY(-4px); }
.story-card-img { height: 200px; background-size: cover; background-position: center; }
.story-card-body { padding: 22px; }
.story-card-cat { font-family: var(--font-condensed); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px; }
.story-card-title { font-family: var(--font-display); font-size: 22px; color: var(--text); line-height: 1.15; margin-bottom: 10px; }
.story-card-excerpt { font-size: 14px; color: var(--light); line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.story-card-meta { font-size: 12px; color: var(--gray); }
.journal-cta { text-align: center; padding: 20px 0 60px; }
</style>
