<!--app/pages/stories/[slug].vue-->
<template>
  <div style="padding-top:72px;" v-if="story">
    <article class="story-detail section">
      <NuxtLink to="/stories" class="back-link">← All Stories</NuxtLink>
      <div class="section-label">{{ story.category }}</div>
      <h1 class="story-h1">{{ story.title }}</h1>

      <div class="story-author-row">
        <img v-if="story.author?.avatar" :src="story.author.avatar" :alt="story.author?.name" class="story-author-ava" />
        <div>
          <div class="story-author-name">{{ story.author?.name || 'Summit Trail' }}</div>
          <div class="story-author-meta">{{ story.author?.location }} · {{ fmt(story.publishDate) }} · {{ story.readTime }} min read</div>
        </div>
      </div>

      <img v-if="story.image" :src="story.image" :alt="story.title" class="story-cover" loading="lazy" />

      <div class="story-content" v-html="formattedContent" />

      <div class="story-tags" v-if="story.tags?.length">
        <span class="tag-chip" v-for="t in story.tags" :key="t">#{{ t }}</span>
      </div>

      <div class="story-cta">
        <NuxtLink v-if="story.adventure?.slug" :to="`/adventures/${story.adventure.slug}`" class="btn btn-primary">
          View {{ story.adventure.title }} →
        </NuxtLink>
        <NuxtLink to="/share-your-story" class="btn btn-outline">Share Your Own Story</NuxtLink>
      </div>
    </article>
  </div>
  <div v-else style="padding-top:120px;text-align:center;">
    <p style="color:var(--gray);font-size:18px;">Story not found.</p>
    <NuxtLink to="/stories" class="btn btn-ghost" style="margin-top:16px;">← Back to Stories</NuxtLink>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: story } = await useStory(computed(() => route.params.slug))

useHead(() => ({ title: story.value ? `${story.value.title} – Summit Trail` : 'Story Not Found' }))

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : ''

// Plain textarea content stored as paragraphs — split on blank lines
const formattedContent = computed(() => {
  if (!story.value?.content) return ''
  return story.value.content
    .split(/\n\s*\n/)
    .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('')
})
</script>

<style scoped>
.story-detail { max-width: 760px; margin: 0 auto; }
.back-link { display: inline-block; color: var(--gray); font-family: var(--font-condensed); font-size: 13px; text-decoration: none; margin-bottom: 20px; }
.back-link:hover { color: var(--orange); }
.story-h1 { font-family: var(--font-display); font-size: clamp(32px, 5vw, 52px); color: var(--text); line-height: 1.05; margin-bottom: 20px; }
.story-author-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.story-author-ava { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.story-author-name { font-weight: 700; color: var(--text); font-size: 14px; }
.story-author-meta { font-size: 13px; color: var(--gray); }
.story-cover { width: 100%; aspect-ratio: 16/9; object-fit: cover; margin-bottom: 32px; }
.story-content { font-size: 16px; line-height: 1.8; color: var(--light); }
.story-content :deep(p) { margin-bottom: 20px; }
.story-tags { display: flex; gap: 8px; flex-wrap: wrap; margin: 32px 0; }
.tag-chip { background: var(--panel); border: 1px solid var(--border); color: var(--orange); font-size: 12px; padding: 4px 12px; border-radius: 12px; }
.story-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
</style>
