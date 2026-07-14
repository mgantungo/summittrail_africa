<!--app/pages/dashboard/index.vue-->
<template>
  <div class="dashboard-page" style="padding-top:var(--nav-h);">

    <!-- Not logged in -->
    <div v-if="!profile.isLoggedIn" class="not-auth section">
      <div class="na-icon">🔒</div>
      <h2 class="section-title">Sign In Required</h2>
      <p class="section-sub" style="margin:16px auto;text-align:center;">Access your personal adventure dashboard</p>
      <NuxtLink to="/?login=1" class="btn btn-primary btn-lg" style="margin-top:16px;">Sign In / Register</NuxtLink>
    </div>

    <template v-else>
      <div class="dash-layout">

        <!-- ── SIDEBAR ──────────────────────────────── -->
        <aside class="dash-sidebar">
          <!-- User card -->
          <div class="dash-user">
            <img :src="profile.user.avatar" :alt="profile.displayName" class="dash-avatar" />
            <div class="dash-name">{{ profile.displayName }}</div>
            <div class="dash-level">{{ profile.level }}</div>
            <div class="dash-pts">
              <span class="pts-num">{{ profile.summitPoints.toLocaleString() }}</span>
              <span class="pts-label">Summit Points</span>
            </div>
          </div>

          <!-- Nav -->
          <nav class="dash-nav">
            <button
              v-for="item in navItems"
              :key="item.key"
              class="dash-nav-link"
              :class="{ active: activeSection === item.key }"
              @click="activeSection = item.key"
            >
              <span class="dnl-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
            <button class="dash-nav-link dash-logout" @click="logout">
              <span class="dnl-icon">🚪</span><span>Sign Out</span>
            </button>
          </nav>
        </aside>

        <!-- ── MAIN ─────────────────────────────────── -->
        <main class="dash-main">
          <!-- Page header -->
          <div class="dash-header">
            <div>
              <div class="section-label">My Dashboard</div>
              <h1 class="dash-greeting">Good {{ greeting }}, <span>{{ firstName }}</span> 👋</h1>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <ThemeToggle />
            </div>
          </div>

          <!-- Quick metric bar -->
          <div class="dash-metrics">
            <div class="dash-metric" v-for="m in metrics" :key="m.label">
              <div class="dm-val">{{ m.val }}</div>
              <div class="dm-label">{{ m.label }}</div>
            </div>
          </div>

          <!-- Conditional section content -->
          <Transition name="fade-up" mode="out-in">
            <DashMyTrips     v-if="activeSection==='trips'"   @go="activeSection = $event" />
            <DashPayments    v-else-if="activeSection==='payments'" />
            <DashDocuments   v-else-if="activeSection==='documents'" />
            <DashSummitPoints v-else-if="activeSection==='points'" />
            <DashReviews     v-else-if="activeSection==='reviews'" />
            <DashProfile     v-else-if="activeSection==='profile'" />
          </Transition>
        </main>

      </div>
    </template>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import DashMyTrips      from '~/components/dashboard/DashMyTrips.vue'
import DashPayments     from '~/components/dashboard/DashPayments.vue'
import DashDocuments    from '~/components/dashboard/DashDocuments.vue'
import DashSummitPoints from '~/components/dashboard/DashSummitPoints.vue'
import DashReviews      from '~/components/dashboard/DashReviews.vue'
import DashProfile      from '~/components/dashboard/DashProfile.vue'

useHead({ title: 'My Dashboard – Summit Trail' })

const profile = useProfileStore()
const router  = useRouter()

const activeSection = ref('trips')

const navItems = [
  { key:'trips',     label:'My Trips',      icon:'📋' },
  { key:'payments',  label:'Payments',      icon:'💰' },
  { key:'documents', label:'Documents',     icon:'📄' },
  { key:'points',    label:'Summit Points', icon:'🏆' },
  { key:'reviews',   label:'My Reviews',    icon:'⭐' },
  { key:'profile',   label:'Profile',       icon:'👤' },
]

const firstName = computed(() => profile.displayName.split(' ')[0])
const greeting  = computed(() => { const h = new Date().getHours(); return h<12?'morning':h<17?'afternoon':'evening' })
const metrics   = computed(() => [
  { val: profile.user?.upcomingTrips || 1, label:'Upcoming Trips'  },
  { val: profile.user?.totalTrips    || 7, label:'Trips Completed' },
  { val: profile.summitPoints.toLocaleString(), label:'Summit Points' },
])

function logout() {
  profile.logout()
  router.replace('/')
}
</script>

<style scoped>
.dashboard-page { background: var(--black); min-height: 100vh; }

.not-auth { text-align:center; padding-top:120px; }
.na-icon  { font-size:56px; margin-bottom:20px; }

/* Layout */
.dash-layout { display:grid; grid-template-columns:260px 1fr; min-height:calc(100vh - var(--nav-h)); }

/* Sidebar */
.dash-sidebar {
  background: var(--deep); border-right: 1px solid var(--border);
  position: sticky; top: var(--nav-h); height: calc(100vh - var(--nav-h));
  overflow-y: auto; display: flex; flex-direction: column;
}
.dash-user {
  padding: 28px 24px; border-bottom: 1px solid var(--border);
  text-align: center; background: linear-gradient(to bottom, rgba(232,98,42,0.08), transparent);
}
.dash-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--orange); margin-bottom: 12px; }
.dash-name   { font-family: var(--font-condensed); font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.dash-level  { font-family: var(--font-condensed); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
.dash-pts    { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pts-num     { font-family: var(--font-display); font-size: 28px; color: var(--orange); line-height: 1; }
.pts-label   { font-family: var(--font-condensed); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }

.dash-nav { padding: 12px 0; flex: 1; display: flex; flex-direction: column; }
.dash-nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 24px; width: 100%;
  font-family: var(--font-condensed); font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  color: var(--gray); background: none; border: none; cursor: pointer; text-align: left;
  transition: all 0.18s;
}
.dash-nav-link:hover  { color: var(--text); background: rgba(255,255,255,0.02); }
.dash-nav-link.active { color: var(--orange); background: rgba(232,98,42,0.08); border-left: 3px solid var(--orange); padding-left: 21px; }
.dash-logout { color: var(--red) !important; margin-top: auto; }
.dash-logout:hover { background: rgba(192,57,43,0.06) !important; }
.dnl-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }

/* Main */
.dash-main { padding: 32px 40px; background: var(--black); overflow-y: auto; }
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.dash-greeting { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-top: 4px; }
.dash-greeting span { color: var(--orange); }

.dash-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.dash-metric { background: var(--panel); border: 1px solid var(--border); padding: 18px 22px; }
.dm-val   { font-family: var(--font-display); font-size: 36px; color: var(--orange); line-height: 1; margin-bottom: 4px; }
.dm-label { font-family: var(--font-condensed); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); }

/* Section transitions */
.fade-up-enter-active { transition: all 0.25s ease; }
.fade-up-leave-active { transition: all 0.15s ease; }
.fade-up-enter-from { opacity: 0; transform: translateY(10px); }
.fade-up-leave-to   { opacity: 0; transform: translateY(-6px); }

/* Responsive */
@media (max-width: 900px) {
  .dash-layout { grid-template-columns: 1fr; }
  .dash-sidebar { position: static; height: auto; flex-direction: row; flex-wrap: wrap; }
  .dash-user { flex: 1; text-align: left; display: flex; align-items: center; gap: 14px; }
  .dash-avatar { width: 48px; height: 48px; margin-bottom: 0; }
  .dash-pts { flex-direction: row; gap: 6px; }
  .dash-nav { flex-direction: row; padding: 0; flex-wrap: wrap; flex: 100%; }
  .dash-nav-link { padding: 10px 14px; font-size: 12px; }
  .dash-main { padding: 20px; }
  .dash-metrics { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 500px) {
  .dash-metrics { grid-template-columns: 1fr 1fr; }
}
</style>
