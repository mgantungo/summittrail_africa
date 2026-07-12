<!--app/components/shared/ThemeToggle.vue-->
<template>
  <div class="theme-toggle" @click="cycleTheme" :title="`Theme: ${profile.theme}`">
    <span class="theme-icon">{{ icon }}</span>
    <span class="theme-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()

const themes = ['dark', 'light', 'auto']

const icon = computed(() => ({ dark: '🌑', light: '☀️', auto: '⚡' }[profile.theme]))
const label = computed(() => ({ dark: 'Dark', light: 'Light', auto: 'Auto' }[profile.theme]))

function cycleTheme() {
  const idx = themes.indexOf(profile.theme)
  profile.setTheme(themes[(idx + 1) % themes.length])
}
</script>

<style scoped>
.theme-toggle {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px; border: 1px solid var(--border);
  cursor: pointer; transition: all 0.2s; user-select: none;
}
.theme-toggle:hover { border-color: var(--orange); }
.theme-icon { font-size: 14px; }
.theme-label {
  font-family: var(--font-condensed);
  font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: var(--light);
}
@media (max-width: 900px) { .theme-label { display: none; } }
</style>
