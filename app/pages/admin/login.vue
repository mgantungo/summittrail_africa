<template>
  <div class="admin-login-page">
    <div class="al-card">
      <!-- Logo -->
      <div class="al-logo">
        <NuxtLink to="/">Summit<span>Trail</span></NuxtLink>
      </div>

      <div class="al-title">Admin Portal</div>
      <div class="al-sub">Sign in to access the operations dashboard</div>

      <form class="al-form" @submit.prevent="submit">
        <div class="al-field">
          <label class="input-label">Email or username</label>
          <input
            class="input"
            v-model="form.email"
            type="text"
            placeholder="you@summittrail.africa"
            autocomplete="username"
            required
          />
        </div>

        <div class="al-field">
          <label class="input-label">Password</label>
          <div class="al-pw-wrap">
            <input
              class="input"
              v-model="form.password"
              :type="showPw ? 'text' : 'password'"
              placeholder="••••••••••"
              autocomplete="current-password"
              required
            />
            <button type="button" class="al-pw-toggle" @click="showPw = !showPw">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <Transition name="shake">
          <div v-if="error" class="al-error">
            <span>⚠️</span> {{ error }}
          </div>
        </Transition>

        <button type="submit" class="btn btn-primary btn-full al-submit" :disabled="loading">
          <span v-if="loading" class="al-spinner" />
          {{ loading ? 'Authenticating…' : 'Sign In to Admin →' }}
        </button>
      </form>

      <div class="al-hint">
        <span>Not an admin?</span>
        <NuxtLink to="/">Back to site</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// app/pages/admin/login.vue
//
// Admin sign-in. Admins are CMS users with the "Admin Portal" role
// (Content Manager → User). Verified server-side by /api/auth/admin-login;
// the session is an httpOnly cookie.
import { useProfileStore } from '~/stores/profile'

definePageMeta({ layout: false })  // no nav/footer on login page

useHead({ title: 'Admin Login – Summit Trail' })

const profile = useProfileStore()
const router  = useRouter()

// Already signed in (server-side session)? Go straight to the dashboard
onMounted(async () => {
  try {
    await $fetch('/api/auth/admin-me')
    router.replace('/admin')
  } catch { /* not signed in */ }
})

const form   = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPw  = ref(false)

async function submit() {
  error.value   = ''
  loading.value = true

  try {
    const { user } = await $fetch('/api/auth/admin-login', {
      method: 'POST',
      body: { email: form.email.trim(), password: form.password },
    })
    form.password = ''
    profile.login(user)
    profile.logAction({ type: 'auth', label: 'Admin login', route: '/admin' })
    router.replace('/admin')
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Invalid email or password. Check your credentials and try again.'
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

/* subtle background texture */
.admin-login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 40%, rgba(232,98,42,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 70%, rgba(212,168,67,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.al-card {
  width: 100%;
  max-width: 460px;
  background: var(--charcoal);
  border: 1px solid var(--border);
  padding: 48px 44px;
  position: relative;
  z-index: 1;
}

.al-logo {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 3px;
  margin-bottom: 32px;
}
.al-logo a { color: var(--text); }
.al-logo span { color: var(--orange); }

.al-title {
  font-family: var(--font-display);
  font-size: 38px;
  color: var(--text);
  line-height: 1;
  margin-bottom: 8px;
}
.al-sub {
  font-size: 15px;
  color: var(--gray);
  margin-bottom: 36px;
  line-height: 1.5;
}

.al-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
.al-field { display: flex; flex-direction: column; gap: 8px; }

.al-pw-wrap { position: relative; }
.al-pw-wrap .input { padding-right: 48px; }
.al-pw-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px;
  line-height: 1; opacity: 0.6; transition: opacity .2s;
}
.al-pw-toggle:hover { opacity: 1; }

.al-error {
  background: rgba(192,57,43,0.12);
  border: 1px solid var(--red);
  color: var(--red);
  padding: 13px 16px;
  font-family: var(--font-condensed);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 0;
}

.al-submit {
  padding: 16px;
  font-size: 15px;
  margin-top: 4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.al-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(10,10,8,0.3);
  border-top-color: var(--black);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.al-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 28px;
}
.al-hint a {
  color: var(--orange);
  font-weight: 600;
  transition: opacity .2s;
}
.al-hint a:hover { opacity: 0.8; }

/* Error shake animation */
.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%,60%  { transform: translateX(-6px); }
  40%,80%  { transform: translateX(6px); }
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 500px) {
  .al-card { padding: 36px 24px; }
}
</style>
