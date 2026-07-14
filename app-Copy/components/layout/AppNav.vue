<!--app/components/layout/AppNav.vue-->
<template>
  <nav :class="['app-nav', { scrolled: isScrolled }]">
    <div class="nav-inner">
      <NuxtLink to="/" class="nav-logo">Summit<span>Trail</span></NuxtLink>

      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="nav-link"
            :class="{ active: route.path.startsWith(link.to) }"
          >{{ link.label }}</NuxtLink>
        </li>
      </ul>

      <div class="nav-actions">
        <ThemeToggle />
        <template v-if="profile.isLoggedIn">
          <NuxtLink to="/dashboard" class="nav-avatar-btn">
            <img :src="profile.user.avatar" :alt="profile.displayName" class="nav-avatar" />
            <span class="nav-points">{{ profile.summitPoints.toLocaleString() }} pts</span>
          </NuxtLink>
        </template>
        <template v-else>
          <button class="btn btn-ghost btn-sm" @click="showLogin = true">Sign In</button>
        </template>
        <NuxtLink to="/booking" class="btn btn-primary btn-sm">Book Now</NuxtLink>
      </div>

      <button
        class="nav-hamburger"
        :class="{ open: mobileOpen }"
        @click="mobileOpen = !mobileOpen"
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </div>
  </nav>

  <!-- Mobile menu -->
  <Transition name="mob">
    <div v-if="mobileOpen" class="mob-menu">
      <div class="mob-inner">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="mob-link"
          @click="mobileOpen = false"
        >{{ link.label }}</NuxtLink>
        <div class="mob-actions">
          <ThemeToggle />
          <template v-if="profile.isLoggedIn">
            <NuxtLink to="/dashboard" class="btn btn-outline btn-full" @click="mobileOpen = false">
              My Dashboard
            </NuxtLink>
          </template>
          <template v-else>
            <button class="btn btn-outline btn-full" @click="showLogin = true; mobileOpen = false">
              Sign In
            </button>
          </template>
          <NuxtLink to="/booking" class="btn btn-primary btn-full" @click="mobileOpen = false">
            Book Now
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>

  <LoginModal v-if="showLogin" @close="showLogin = false" />
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'

const profile = useProfileStore()
const route   = useRoute()

const mobileOpen = ref(false)
const showLogin  = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { to: '/adventures', label: 'Adventures' },
  { to: '/calendar',   label: 'Calendar'   },
  { to: '/stories',    label: 'Stories'    },
  { to: '/tracking',   label: 'Live'       },
  { to: '/dashboard',  label: 'Dashboard'  },
]

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 40
  }, { passive: true })
})

watch(() => route.path, () => { mobileOpen.value = false })
watch(mobileOpen, val  => { document.body.style.overflow = val ? 'hidden' : '' })
</script>

<style scoped>
.app-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: var(--nav-h);
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(232,98,42,0.15);
  transition: background 0.3s, border-color 0.3s;
}
.app-nav.scrolled {
  background: var(--nav-bg-solid);
  border-bottom-color: rgba(232,98,42,0.35);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding-left:  var(--px);
  padding-right: var(--px);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 30px;           /* was 26px */
  letter-spacing: 3px;
  color: var(--text);
  flex-shrink: 0;
}
.nav-logo span { color: var(--orange); }

.nav-links {
  display: flex; gap: 36px; list-style: none;
  position: absolute; left: 50%; transform: translateX(-50%);
}
.nav-link {
  font-family: var(--font-condensed);
  font-size: 15px;           /* was 12px */
  font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--light); transition: color 0.2s;
}
.nav-link:hover, .nav-link.active { color: var(--orange); }

.nav-actions { display: flex; gap: 12px; align-items: center; flex-shrink: 0; }

.nav-avatar-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 14px 5px 5px;
  border: 1px solid var(--border); transition: border-color 0.2s;
}
.nav-avatar-btn:hover { border-color: var(--orange); }
.nav-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.nav-points {
  font-family: var(--font-condensed);
  font-size: 13px;           /* was 12px */
  font-weight: 700; color: var(--gold);
}

/* Hamburger */
.nav-hamburger {
  display: none; flex-direction: column; gap: 5px;
  padding: 6px; background: none; border: none; cursor: pointer;
}
.nav-hamburger span {
  display: block; width: 24px; height: 2px;
  background: var(--text); transition: all 0.3s;
}
.nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mob-menu {
  position: fixed; top: var(--nav-h); left: 0; right: 0; bottom: 0;
  z-index: 999; background: var(--nav-bg-solid);
  backdrop-filter: blur(20px); overflow-y: auto;
}
.mob-inner {
  display: flex; flex-direction: column;
  padding: 28px var(--px) 48px;
  border-top: 1px solid var(--border);
}
.mob-link {
  font-family: var(--font-condensed);
  font-size: 32px;           /* was 28px */
  font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  color: var(--light); padding: 18px 0;
  border-bottom: 1px solid var(--border); transition: color 0.2s;
}
.mob-link:hover { color: var(--orange); }
.mob-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }

/* Transitions */
.mob-enter-active, .mob-leave-active { transition: opacity 0.25s, transform 0.25s; }
.mob-enter-from { opacity: 0; transform: translateY(-10px); }
.mob-leave-to   { opacity: 0; transform: translateY(-10px); }

/* Responsive */
@media (max-width: 1000px) {
  .nav-links { gap: 24px; }
  .nav-link { font-size: 13px; }
}
@media (max-width: 900px) {
  .nav-links { display: none; }
  .nav-actions .btn-ghost, .nav-actions .nav-avatar-btn { display: none; }
  .nav-hamburger { display: flex; }
}
@media (max-width: 480px) {
  .app-nav { height: 64px; }
  .nav-logo { font-size: 24px; }
}
</style>
