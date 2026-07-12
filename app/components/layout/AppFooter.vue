<!--app/components/layout/AppFooter.vue-->
<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">Summit<span>Trail</span> Limited</div>
          <p class="footer-tagline">
            Uganda's gateway to extreme, life-defining adventure experiences.
            From survival challenges to convoy expeditions — we push limits.
          </p>
          <div class="social-links">
            <a class="social-link" href="#" aria-label="Instagram">ig</a>
            <a class="social-link" href="#" aria-label="YouTube">yt</a>
            <a class="social-link" href="#" aria-label="Facebook">fb</a>
            <a class="social-link" href="#" aria-label="Twitter">tw</a>
          </div>
          <div class="footer-nl">
            <div class="footer-nl-label">// Get expedition alerts</div>
            <div class="footer-nl-row">
              <input class="input" v-model="email" type="email" placeholder="your@email.com" />
              <button class="btn btn-primary btn-sm" @click="subscribe" :disabled="done">
                {{ done ? '✓ Subscribed' : 'Subscribe' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="footer-col">
          <h4>Adventures</h4>
          <ul>
            <li><NuxtLink to="/adventures?category=overland">Overland Expeditions</NuxtLink></li>
            <li><NuxtLink to="/adventures?category=survival">Survival Challenges</NuxtLink></li>
            <li><NuxtLink to="/adventures?category=convoy">Convoy Adventures</NuxtLink></li>
            <li><NuxtLink to="/adventures?category=mountain">Mountain Climbing</NuxtLink></li>
            <li><NuxtLink to="/adventures?category=custom">Custom Expeditions</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><NuxtLink to="/booking">Book a Trip</NuxtLink></li>
            <li><NuxtLink to="/calendar">Adventure Calendar</NuxtLink></li>
            <li><NuxtLink to="/tracking">Live Tracking</NuxtLink></li>
            <li><NuxtLink to="/dashboard">Customer Dashboard</NuxtLink></li>
            <li><NuxtLink to="/dashboard/loyalty">Summit Points</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><NuxtLink to="/about">About Summit Trail</NuxtLink></li>
            <li><NuxtLink to="/about#guides">Our Guides</NuxtLink></li>
            <li><NuxtLink to="/about#safety">Safety Standards</NuxtLink></li>
            <li><NuxtLink to="/stories">Adventure Journal</NuxtLink></li>
            <li><NuxtLink to="/contact">Contact & Support</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-copy">© {{ year }} Summit Trail Limited · Kampala, Uganda</div>
        <div class="footer-legal">
          <NuxtLink to="/privacy">Privacy</NuxtLink>
          <NuxtLink to="/terms">Terms</NuxtLink>
          <NuxtLink to="/sitemap">Sitemap</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'

const profile = useProfileStore()
const year  = new Date().getFullYear()
const email = ref('')
const done  = ref(false)

async function subscribe() {
  if (!email.value) return
  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value, source: 'footer' }
    })
    profile.setNewsletterSubscribed(true)
  } catch { /* best-effort */ }
  done.value = true
}
</script>

<style scoped>
/* Footer fills full browser width — inner uses --px for content gutter */
.app-footer {
  background: var(--black);
  border-top: 1px solid var(--border-color);
}

.footer-inner {
  padding-top:    72px;
  padding-bottom: 40px;
  padding-left:   var(--px);
  padding-right:  var(--px);
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 56px;
}

.footer-logo {
  font-family: var(--font-display); font-size: 34px; letter-spacing: 3px;
  color: var(--text); margin-bottom: 14px;
}
.footer-logo span { color: var(--orange); }

.footer-tagline {
  font-size: 14px; font-weight: 300; color: var(--gray);
  line-height: 1.7; max-width: 280px; margin-bottom: 20px;
}

.social-links { display: flex; gap: 10px; margin-bottom: 24px; }
.social-link {
  width: 36px; height: 36px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); font-size: 13px; font-weight: 700;
  font-family: var(--font-condensed); letter-spacing: 1px; text-transform: uppercase;
  transition: all 0.2s;
}
.social-link:hover { border-color: var(--orange); color: var(--orange); }

.footer-nl-label {
  font-family: var(--font-condensed); font-size: 13px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--orange); margin-bottom: 10px;
}
.footer-nl-row { display: flex; }
.footer-nl-row .input { flex: 1; }

.footer-col h4 {
  font-family: var(--font-condensed); font-size: 12px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: var(--text); margin-bottom: 18px;
}
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-col ul li a { font-size: 15px; font-weight: 300; color: var(--gray); transition: color 0.2s; }
.footer-col ul li a:hover { color: var(--orange); }

.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid var(--border); padding-top: 28px; flex-wrap: wrap; gap: 12px;
}
.footer-copy { font-size: 14px; color: var(--muted); }
.footer-legal { display: flex; gap: 20px; }
.footer-legal a {
  font-family: var(--font-condensed); font-size: 13px; font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase; color: var(--gray); transition: color 0.2s;
}
.footer-legal a:hover { color: var(--orange); }

@media (max-width: 1100px) {
  .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
}
@media (max-width: 600px) {
  .footer-top { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; text-align: center; }
}
</style>
