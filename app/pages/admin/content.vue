<!--app/pages/admin/content.vue-->
<template>
  <div>
    <div class="section-label">Site Content</div>
    <h2 class="as-title">Content</h2>

    <p class="intro">
      Adventures, stories, guides, reviews, and everything else here is managed
      directly in the Strapi CMS admin — that's where rich text, images, and
      nested fields (itineraries, requirements, add-ons) actually get edited.
      This page is a quick jump-off point plus a live count of what's published.
    </p>

    <div class="content-grid">
      <a v-for="c in collections" :key="c.uid" :href="strapiAdminUrl(c.uid)" target="_blank" rel="noopener" class="content-card">
        <div class="cc-icon">{{ c.icon }}</div>
        <div class="cc-body">
          <div class="cc-name">{{ c.label }}</div>
          <div class="cc-count">{{ c.count.value }} published</div>
        </div>
        <div class="cc-arrow">↗</div>
      </a>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'Content – Admin – Summit Trail' })

const config = useRuntimeConfig()

const { data: adventures } = await useAdventures()
const { data: stories }    = await useStories()
const { data: guides }     = await useGuides()
const { data: reviews }    = await useReviews()

const collections = [
  { uid: 'api::adventure.adventure', icon: '🏔️', label: 'Adventures', count: computed(() => adventures.value.length) },
  { uid: 'api::story.story',         icon: '📖', label: 'Stories',    count: computed(() => stories.value.length) },
  { uid: 'api::guide.guide',         icon: '🧭', label: 'Guides',     count: computed(() => guides.value.length) },
  { uid: 'api::review.review',       icon: '⭐', label: 'Reviews',    count: computed(() => reviews.value.length) },
]

function strapiAdminUrl(uid) {
  return `${config.public.strapiUrl}/admin/content-manager/collection-types/${uid}`
}
</script>

<style scoped>
.as-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:16px; }
.intro { color:var(--gray); font-size:14px; line-height:1.6; max-width:640px; margin-bottom:28px; }
.content-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
.content-card {
  display:flex; align-items:center; gap:14px; background:var(--panel); border:1px solid var(--border);
  padding:20px; text-decoration:none; transition:border-color 0.2s;
}
.content-card:hover { border-color:var(--orange); }
.cc-icon { font-size:28px; flex-shrink:0; }
.cc-body { flex:1; }
.cc-name { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); }
.cc-count { font-size:13px; color:var(--gray); margin-top:2px; }
.cc-arrow { color:var(--orange); font-size:18px; flex-shrink:0; }
</style>
