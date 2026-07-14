<!--app/pages/share-your-story.vue-->
<template>
  <div style="padding-top:72px;">
    <section class="section share-page">
      <div class="section-label">Adventure Journal</div>
      <h1 class="section-title">Share Your<br><span>Experience</span></h1>
      <p class="share-intro">
        Whether it's a quick verified review or a full trail story, we'd love
        to hear it. Everything submitted here is reviewed by our team before
        it appears on the site.
      </p>

      <div class="tab-row">
        <button class="tab-btn" :class="{ active: mode === 'review' }" @click="mode = 'review'">⭐ Quick Review</button>
        <button class="tab-btn" :class="{ active: mode === 'story' }" @click="mode = 'story'">📖 Full Story</button>
      </div>

      <!-- QUICK REVIEW -->
      <div v-if="mode === 'review'" class="share-card">
        <div v-if="reviewSubmitted" class="success-block">
          <div class="success-icon">✅</div>
          <h3>Thank you!</h3>
          <p>Your review has been submitted and will appear once our team reviews it.</p>
        </div>
        <form v-else class="form-grid" @submit.prevent="submitReview">
          <div class="field"><label class="input-label">Your Name *</label><input class="input" v-model="reviewForm.name" required /></div>
          <div class="field"><label class="input-label">Location</label><input class="input" v-model="reviewForm.location" placeholder="City, Country" /></div>
          <div class="field span-2">
            <label class="input-label">Which adventure did you do?</label>
            <select class="input" v-model="reviewForm.adventureId">
              <option value="">— Not sure / general feedback —</option>
              <option v-for="a in adventures" :key="a.id" :value="a.documentId || a.id">{{ a.title }}</option>
            </select>
          </div>
          <div class="field span-2">
            <label class="input-label">Rating *</label>
            <div class="star-picker">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= reviewForm.rating }" @click="reviewForm.rating = n">★</span>
            </div>
          </div>
          <div class="field span-2"><label class="input-label">Headline</label><input class="input" v-model="reviewForm.title" placeholder="Summarize your experience in a few words" /></div>
          <div class="field span-2">
            <label class="input-label">Your Experience *</label>
            <textarea class="input" v-model="reviewForm.content" rows="5" required placeholder="Tell us what stood out — the guides, the challenge, the moment you'll never forget…" />
          </div>
          <div class="field span-2" v-if="reviewError"><span class="error-msg">{{ reviewError }}</span></div>
          <div class="field span-2">
            <button class="btn btn-primary" type="submit" :disabled="reviewSaving">{{ reviewSaving ? 'Submitting…' : 'Submit Review' }}</button>
          </div>
        </form>
      </div>

      <!-- FULL STORY -->
      <div v-if="mode === 'story'" class="share-card">
        <div v-if="storySubmitted" class="success-block">
          <div class="success-icon">✅</div>
          <h3>Thank you for sharing!</h3>
          <p>Your story has been submitted and will appear on the Adventure Journal once reviewed.</p>
        </div>
        <form v-else class="form-grid" @submit.prevent="submitStory">
          <div class="field"><label class="input-label">Your Name *</label><input class="input" v-model="storyForm.name" required /></div>
          <div class="field"><label class="input-label">Location</label><input class="input" v-model="storyForm.location" placeholder="City, Country" /></div>
          <div class="field span-2">
            <label class="input-label">Which adventure was this about?</label>
            <select class="input" v-model="storyForm.adventureId">
              <option value="">— General / not trip-specific —</option>
              <option v-for="a in adventures" :key="a.id" :value="a.documentId || a.id">{{ a.title }}</option>
            </select>
          </div>
          <div class="field span-2"><label class="input-label">Story Title *</label><input class="input" v-model="storyForm.title" required placeholder="Give your story a title" /></div>
          <div class="field span-2">
            <label class="input-label">Cover Image (optional)</label>
            <ImageUploadInput v-model="storyForm.image" />
          </div>
          <div class="field span-2">
            <label class="input-label">Short Summary</label>
            <textarea class="input" v-model="storyForm.excerpt" rows="2" placeholder="One or two sentences — shown on the story card" />
          </div>
          <div class="field span-2">
            <label class="input-label">Your Story *</label>
            <textarea class="input" v-model="storyForm.content" rows="10" required placeholder="Tell the full story — as long or short as you like." />
          </div>
          <div class="field span-2" v-if="storyError"><span class="error-msg">{{ storyError }}</span></div>
          <div class="field span-2">
            <button class="btn btn-primary" type="submit" :disabled="storySaving">{{ storySaving ? 'Submitting…' : 'Submit Story' }}</button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({ title: 'Share Your Experience – Summit Trail' })

const { data: adventures } = await useAdventures()
const mode = ref('review')

// ── Quick review ──────────────────────────────────────────────────────
const reviewForm = reactive({ name: '', location: '', adventureId: '', rating: 5, title: '', content: '' })
const reviewSaving = ref(false)
const reviewSubmitted = ref(false)
const reviewError = ref(null)

async function submitReview() {
  reviewSaving.value = true
  reviewError.value = null
  try {
    await $fetch('/api/reviews/submit', { method: 'POST', body: { ...reviewForm } })
    reviewSubmitted.value = true
  } catch (e) {
    reviewError.value = e?.data?.statusMessage || 'Could not submit. Please try again.'
  } finally {
    reviewSaving.value = false
  }
}

// ── Full story ────────────────────────────────────────────────────────
const storyForm = reactive({ name: '', location: '', adventureId: '', title: '', image: '', excerpt: '', content: '' })
const storySaving = ref(false)
const storySubmitted = ref(false)
const storyError = ref(null)

async function submitStory() {
  storySaving.value = true
  storyError.value = null
  try {
    await $fetch('/api/stories/submit', { method: 'POST', body: { ...storyForm } })
    storySubmitted.value = true
  } catch (e) {
    storyError.value = e?.data?.statusMessage || 'Could not submit. Please try again.'
  } finally {
    storySaving.value = false
  }
}
</script>

<style scoped>
.share-page { max-width: 760px; margin: 0 auto; padding-bottom: 80px; }
.share-intro { color: var(--light); font-size: 15px; line-height: 1.6; margin: 16px 0 28px; }
.tab-row { display: flex; gap: 10px; margin-bottom: 24px; }
.tab-btn {
  flex: 1; background: var(--panel); border: 1px solid var(--border); color: var(--gray);
  font-family: var(--font-condensed); font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  padding: 14px; cursor: pointer; border-radius: 4px;
}
.tab-btn.active { border-color: var(--orange); color: var(--orange); background: rgba(232,98,42,0.06); }
.share-card { background: var(--panel); border: 1px solid var(--border); padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field.span-2 { grid-column: span 2; }
.input-label { display: block; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }
.star-picker { display: flex; gap: 6px; }
.star { font-size: 28px; color: var(--border); cursor: pointer; transition: color 0.15s; }
.star.filled { color: var(--gold); }
.error-msg { color: var(--red); font-size: 13px; }
.success-block { text-align: center; padding: 40px 0; }
.success-icon { font-size: 48px; margin-bottom: 12px; }
.success-block h3 { font-family: var(--font-display); font-size: 26px; color: var(--text); margin-bottom: 10px; }
.success-block p { color: var(--light); }
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .field.span-2 { grid-column: span 1; }
}
</style>
