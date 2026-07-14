<!--app/components/dashboard/DashReviews.vue-->
<template>
  <div>
    <div class="section-label">Your Feedback</div>
    <h2 class="sec-title">My Reviews</h2>

    <!-- Submitted reviews -->
    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Submitted Reviews ({{ submitted.length }})</div>
      <div v-if="submitted.length" class="review-list">
        <div class="review-row" v-for="r in submitted" :key="r.id">
          <img :src="r.adventure?.image" :alt="r.adventure?.title" class="rv-img" loading="lazy" />
          <div class="rv-body">
            <div class="rv-title">{{ r.adventure?.title }}</div>
            <div class="rv-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5-r.rating) }}</div>
            <div class="rv-heading">{{ r.title }}</div>
            <p class="rv-text">{{ r.content }}</p>
            <div class="rv-meta">{{ fmt(r.date) }} · <span class="rv-verified">✓ Verified participant</span></div>
          </div>
          <div class="rv-actions">
            <button class="btn btn-ghost btn-sm">Edit</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-sm">No reviews submitted yet.</div>
    </div>

    <!-- Pending reviews -->
    <div class="dash-card">
      <div class="section-label">Awaiting Your Review</div>
      <div v-if="pending.length" class="pending-list">
        <div class="pending-row" v-for="p in pending" :key="p.id">
          <img :src="p.adventure?.image" :alt="p.adventure?.title" class="rv-img" loading="lazy" />
          <div class="pend-body">
            <div class="pend-title">{{ p.adventure?.title }}</div>
            <div class="pend-date">Departed: {{ fmt(p.departureDate) }}</div>
            <div class="pend-pts">📌 Earn <strong>50 Summit Points</strong> for your review</div>
          </div>
          <div class="pend-right">
            <button class="btn btn-primary btn-sm" @click="openReview(p)">Write Review →</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-sm">No trips pending review.</div>
    </div>

    <!-- Write review modal -->
    <Transition name="fade">
      <div v-if="writing" class="review-modal" @click.self="writing = null">
        <div class="modal-card">
          <div class="modal-title">Review: {{ writing.adventure?.title }}</div>
          <div class="rating-picker">
            <button v-for="n in 5" :key="n" class="star-btn" @click="draft.rating=n" :class="{ active: n <= draft.rating }">★</button>
          </div>
          <input class="input" v-model="draft.heading" placeholder="Review headline…" style="margin-bottom:10px;" />
          <textarea class="input" v-model="draft.text" rows="4" placeholder="Describe your experience…" style="resize:vertical;margin-bottom:14px;"></textarea>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary btn-full" @click="handleSubmitReview">Submit Review (+50 pts)</button>
            <button class="btn btn-ghost btn-sm" @click="writing = null">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'

const profile = useProfileStore()
const customerEmail = computed(() => profile.user?.email)
const { data: demoBookings } = await useCustomerBookings(customerEmail)
const { data: submitted, refresh: refreshSubmitted } = await useCustomerReviews(customerEmail)

const pending = computed(() => demoBookings.value.filter(b => b.status === 'confirmed').slice(0,2))
const writing = ref(null)
const draft = reactive({ rating:5, heading:'', text:'' })
const submitting = ref(false)
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : ''
function openReview(b) { writing.value = b; draft.rating=5; draft.heading=''; draft.text='' }

async function handleSubmitReview() {
  if (!writing.value || !draft.text || submitting.value) return
  submitting.value = true
  try {
    await submitReview({
      customerId: profile.user?.documentId || profile.user?.id,
      adventureId: writing.value.adventure?.documentId || writing.value.adventure?.id,
      rating: draft.rating,
      title: draft.heading || 'Great experience',
      content: draft.text,
      author: { name: profile.user?.name, location: profile.user?.country, avatar: profile.user?.avatar },
    })
    await refreshSubmitted()
    writing.value = null
    alert('Review submitted! +50 Summit Points added.')
  } catch (e) {
    alert('Could not submit your review. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:16px; }
.review-list { display:flex; flex-direction:column; gap:12px; }
.review-row { display:flex; gap:16px; padding:16px; background:var(--charcoal); border:1px solid var(--border); align-items:flex-start; flex-wrap:wrap; }
.rv-img { width:80px; height:80px; object-fit:cover; flex-shrink:0; }
.rv-body { flex:1; }
.rv-title  { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px; }
.rv-stars  { color:var(--gold); font-size:16px; letter-spacing:2px; margin-bottom:4px; }
.rv-heading { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--orange); margin-bottom:6px; }
.rv-text   { font-size:14px; color:var(--light); line-height:1.6; margin-bottom:8px; font-style:italic; }
.rv-meta   { font-family:var(--font-condensed); font-size:12px; color:var(--gray); }
.rv-verified { color:var(--green-light); }
.rv-actions { flex-shrink:0; }
.pending-list { display:flex; flex-direction:column; gap:10px; }
.pending-row  { display:flex; gap:16px; align-items:center; padding:16px; background:var(--charcoal); border:1px solid var(--border); flex-wrap:wrap; }
.pend-body { flex:1; }
.pend-title { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px; }
.pend-date  { font-family:var(--font-condensed); font-size:13px; color:var(--gray); margin-bottom:6px; }
.pend-pts   { font-family:var(--font-condensed); font-size:13px; color:var(--light); }
.pend-pts strong { color:var(--gold); }
.pend-right { flex-shrink:0; }
.empty-sm { font-family:var(--font-condensed); font-size:14px; color:var(--gray); padding:24px 0; text-align:center; }
.review-modal { position:fixed; inset:0; background:rgba(10,10,8,0.85); z-index:9999; display:flex; align-items:center; justify-content:center; padding:24px; }
.modal-card { background:var(--panel); border:1px solid var(--border); padding:32px; width:100%; max-width:520px; }
.modal-title { font-family:var(--font-condensed); font-size:18px; font-weight:700; color:var(--text); margin-bottom:20px; }
.rating-picker { display:flex; gap:8px; margin-bottom:16px; }
.star-btn { font-size:28px; background:none; border:none; cursor:pointer; color:var(--muted); transition:color .15s; }
.star-btn.active { color:var(--gold); }
.fade-enter-active,.fade-leave-active { transition:opacity .2s; }
.fade-enter-from,.fade-leave-to { opacity:0; }
</style>
