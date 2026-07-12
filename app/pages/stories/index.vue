<!--app/pages/stories/index.vue-->
<template>
  <div style="padding-top:72px;">
    <div class="stories-hero section">
      <div class="section-label">Adventure Journal</div>
      <h1 class="section-title">Every Trip.<br><span>A Story</span> Worth Sharing.</h1>
      <p class="section-sub">Traveler stories, expedition reports, survival lessons. Real accounts from the field.</p>
      <div class="stories-filter" style="margin-top:24px;">
        <button v-for="c in cats" :key="c" class="chip" :class="{ active: activecat === c }" @click="activecat = c">{{ c }}</button>
      </div>
    </div>

    <!-- Row 1: Featured + 2 stacked -->
    <div class="section" style="padding-top:0;">
      <div class="stories-row1">
        <NuxtLink :to="`/stories/${featured.slug}`" class="story-featured">
          <img :src="featured.image" :alt="featured.title" class="story-img" />
          <div class="story-overlay" />
          <div class="story-content">
            <div class="story-cat">{{ featured.category }} · Featured Story</div>
            <div class="story-title">{{ featured.title }}</div>
            <div class="story-excerpt">{{ featured.excerpt }}</div>
            <div class="story-author">
              <img :src="featured.author.avatar" :alt="featured.author.name" class="author-avatar" />
              <div>
                <div class="author-name">{{ featured.author.name }} · {{ featured.author.location }}</div>
              </div>
              <div style="margin-left:auto; font-family:var(--font-condensed); font-size:12px; color:var(--gray);">{{ featured.readTime }} min read</div>
            </div>
          </div>
        </NuxtLink>
        <div class="stories-stacked">
          <NuxtLink v-for="s in sidePair" :key="s.id" :to="`/stories/${s.slug}`" class="story-medium">
            <img :src="s.image" :alt="s.title" />
            <div class="story-medium-overlay" />
            <div class="story-medium-content">
              <div class="story-medium-cat">{{ s.category }}</div>
              <div class="story-medium-title">{{ s.title }}</div>
              <div class="story-medium-meta"><span>{{ s.author.name }}</span><span>{{ s.readTime }} min read</span></div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stories-stats-bar">
        <div class="stories-stat"><div class="stories-stat-val">86</div><div class="stories-stat-label">Stories Published This Year</div></div>
        <div class="stories-stat"><div class="stories-stat-val">24K</div><div class="stories-stat-label">Monthly Story Readers</div></div>
        <div class="stories-stat"><div class="stories-stat-val">340+</div><div class="stories-stat-label">Verified Guest Contributors</div></div>
        <div class="stories-stat" style="cursor:pointer;">
          <div class="stories-stat-val" style="color:var(--white);">→</div>
          <div class="stories-stat-label" style="color:var(--orange);">Submit Your Story</div>
        </div>
      </div>

      <!-- Grid of remaining -->
      <div class="stories-row2">
        <NuxtLink v-for="s in gridStories" :key="s.id" :to="`/stories/${s.slug}`" class="story-card">
          <div class="story-card-img"><img :src="s.image" :alt="s.title" loading="lazy" /></div>
          <div class="story-card-body">
            <div class="story-card-cat">{{ s.category }}</div>
            <div class="story-card-title">{{ s.title }}</div>
            <div class="story-card-excerpt">{{ s.excerpt }}</div>
            <div class="story-card-footer">
              <div class="story-card-author">
                <img :src="s.author.avatar" :alt="s.author.name" />
                <span>{{ s.author.name }}</span>
              </div>
              <span>{{ s.readTime }} min</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { stories } from '~~/data/demo.js'

useHead({ title: 'Adventure Journal – Summit Trail' })

const activecat = ref('All Stories')
const cats = ['All Stories', 'Survival', 'Convoy', 'Mountain', 'Overland', 'Guides', 'Community']

const filtered = computed(() => {
  if (activecat.value === 'All Stories') return stories
  return stories.filter(s => s.category.toLowerCase() === activecat.value.toLowerCase())
})

const featured = computed(() => filtered.value.find(s => s.featured) || filtered.value[0])
const sidePair = computed(() => filtered.value.filter(s => s.id !== featured.value?.id).slice(0, 2))
const gridStories = computed(() => filtered.value.filter(s => s.id !== featured.value?.id).slice(2))
</script>

<style scoped>
.stories-hero { background: var(--deep); border-bottom: 1px solid var(--border); }
/* Row 1 */
.stories-row1 { display: grid; grid-template-columns: 3fr 2fr; gap: 2px; margin-bottom: 2px; }
.story-featured { position: relative; height: 520px; overflow: hidden; cursor: pointer; display: block; }
.story-img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s; }
.story-featured:hover .story-img { transform: scale(1.04); }
.story-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,8,.95) 0%, rgba(10,10,8,0.2) 55%, transparent); }
.story-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 36px; }
.story-cat { font-family: var(--font-condensed); font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 12px; }
.story-title { font-family: var(--font-display); font-size: 40px; color: var(--white); line-height: 1.0; margin-bottom: 14px; }
.story-excerpt { font-size: 14px; font-weight: 300; color: var(--off); line-height: 1.7; margin-bottom: 20px; }
.story-author { display: flex; align-items: center; gap: 10px; }
.author-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.author-name { font-family: var(--font-condensed); font-size: 13px; font-weight: 600; color: var(--light); }

.stories-stacked { display: flex; flex-direction: column; gap: 2px; }
.story-medium { position: relative; flex: 1; overflow: hidden; cursor: pointer; min-height: 259px; display: block; }
.story-medium img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: transform .5s; }
.story-medium:hover img { transform: scale(1.05); }
.story-medium-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,8,.92), rgba(10,10,8,0.1) 60%); }
.story-medium-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; }
.story-medium-cat { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px; }
.story-medium-title { font-family: var(--font-display); font-size: 24px; color: var(--white); line-height: 1.05; margin-bottom: 10px; }
.story-medium-meta { font-family: var(--font-condensed); font-size: 12px; color: var(--gray); display: flex; gap: 12px; }

/* Stats bar */
.stories-stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 2px; }
.stories-stat { background: var(--black); border: 1px solid var(--border); padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
.stories-stat-val { font-family: var(--font-display); font-size: 36px; color: var(--orange); line-height: 1; }
.stories-stat-label { font-family: var(--font-condensed); font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); line-height: 1.4; }

/* Row 2 */
.stories-row2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.story-card { background: var(--panel); border: 1px solid var(--border); cursor: pointer; transition: border-color .2s; overflow: hidden; display: block; }
.story-card:hover { border-color: var(--orange); }
.story-card-img { height: 160px; overflow: hidden; }
.story-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
.story-card:hover .story-card-img img { transform: scale(1.06); }
.story-card-body { padding: 20px; }
.story-card-cat { font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 8px; }
.story-card-title { font-family: var(--font-condensed); font-size: 17px; font-weight: 700; color: var(--text); line-height: 1.25; margin-bottom: 10px; }
.story-card-excerpt { font-size: 13px; font-weight: 300; color: var(--gray); line-height: 1.6; margin-bottom: 14px; }
.story-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; font-family: var(--font-condensed); font-size: 12px; color: var(--gray); }
.story-card-author { display: flex; align-items: center; gap: 8px; }
.story-card-author img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }

@media (max-width: 1000px) {
  .stories-row2 { grid-template-columns: repeat(2, 1fr); }
  .stories-stats-bar { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stories-row1 { grid-template-columns: 1fr; }
  .story-featured { height: 400px; }
  .stories-stacked { flex-direction: row; gap: 2px; }
  .story-medium { min-height: 200px; }
}
@media (max-width: 600px) {
  .stories-row2 { grid-template-columns: 1fr; }
  .stories-stacked { flex-direction: column; }
}
</style>
