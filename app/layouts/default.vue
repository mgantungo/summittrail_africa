<!--app/layouts/default.vue-->
<template>
  <div class="site-shell">
    <AppNav />
    <main class="site-main">
      <slot />
    </main>
    <AppFooter />

    <!-- Global overlays — ClientOnly prevents SSR crashes -->
    <ClientOnly>
      <NotificationPrompt />
      <InstallPrompt />
      <NewsletterModal />
      <CookieBanner />
    </ClientOnly>
  </div>
</template>

<script setup>
import AppNav from '~/components/layout/AppNav.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
// Overlays live here so they inherit the layout context and are guarded
// from SSR via ClientOnly. NotificationPrompt/InstallPrompt/NewsletterModal/
// CookieBanner all live at components/ root and are picked up by Nuxt's
// auto-import, same as their existing siblings here — no import needed.
</script>

<style>
.site-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.site-main {
  flex: 1;
}
</style>