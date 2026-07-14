<!--app/components/shared/LoginModal.vue-->
<template>
  <div class="login-backdrop" @click.self="$emit('close')">
    <div class="login-modal">
      <button class="login-close" @click="$emit('close')">✕</button>

      <div class="login-header">
        <div class="login-logo">Summit<span>Trail</span></div>
        <div class="login-title">{{ isRegister ? 'Create Account' : 'Welcome Back' }}</div>
        <div class="login-sub">{{ isRegister ? 'Join the community of 4,000+ adventurers' : 'Sign in to access your dashboard' }}</div>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <template v-if="isRegister">
          <div>
            <label class="input-label">Full Name</label>
            <input class="input" v-model="form.name" type="text" placeholder="Alex Mwangi" required />
          </div>
        </template>
        <div>
          <label class="input-label">Email Address</label>
          <input class="input" v-model="form.email" type="email" placeholder="you@email.com" required />
        </div>
        <div>
          <label class="input-label">Password</label>
          <input class="input" v-model="form.password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
          {{ loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In') }}
        </button>
      </form>

      <div class="login-divider"><span>or continue with</span></div>

      <div class="login-social">
        <button class="social-btn" @click="demoLogin">
          <span>⚡</span> Demo Login
        </button>
      </div>

      <div class="login-toggle">
        <span>{{ isRegister ? 'Already have an account?' : "Don't have an account?" }}</span>
        <button @click="isRegister = !isRegister">{{ isRegister ? 'Sign In' : 'Register Free' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
import { demoUser } from '~~/data/demo.js'

const emit = defineEmits(['close'])
const profile = useProfileStore()
const router = useRouter()

const isRegister = ref(false)
const loading = ref(false)
const error = ref(null)
const form = reactive({ name: '', email: '', password: '' })

async function submit() {
  loading.value = true
  error.value = null
  try {
    // Demo: accept any credentials
    await new Promise(r => setTimeout(r, 600))
    const user = {
      ...demoUser,
      name: form.name || demoUser.name,
      email: form.email || demoUser.email,
    }
    profile.login(user)
    emit('close')
    router.push('/dashboard')
  } catch {
    error.value = 'Invalid credentials. Try the demo login.'
  } finally {
    loading.value = false
  }
}

function demoLogin() {
  profile.login(demoUser)
  emit('close')
  router.push('/dashboard')
}
</script>

<style scoped>
.login-backdrop {
  position: fixed; inset: 0; z-index: 9500;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.login-modal {
  background: var(--charcoal); border: 1px solid var(--border);
  padding: 48px 40px; width: 100%; max-width: 440px; position: relative;
}
.login-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: var(--gray); font-size: 18px; cursor: pointer;
  transition: color 0.2s;
}
.login-close:hover { color: var(--orange); }
.login-logo {
  font-family: var(--font-display); font-size: 22px; letter-spacing: 3px; color: var(--text); margin-bottom: 20px;
}
.login-logo span { color: var(--orange); }
.login-title { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 8px; }
.login-sub { font-size: 14px; color: var(--light); margin-bottom: 32px; }
.login-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.login-error { font-size: 13px; color: var(--red); }
.login-divider {
  text-align: center; position: relative; margin: 20px 0;
  font-family: var(--font-condensed); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--gray);
}
.login-divider::before, .login-divider::after {
  content: ''; position: absolute; top: 50%; width: calc(50% - 60px); height: 1px; background: var(--border);
}
.login-divider::before { left: 0; }
.login-divider::after { right: 0; }
.login-social { display: flex; gap: 10px; margin-bottom: 24px; }
.social-btn {
  flex: 1; padding: 12px; border: 1px solid var(--border); background: transparent;
  color: var(--light); font-family: var(--font-condensed); font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.social-btn:hover { border-color: var(--orange); color: var(--orange); }
.login-toggle {
  text-align: center; font-size: 13px; color: var(--gray);
  display: flex; gap: 6px; justify-content: center; align-items: center;
}
.login-toggle button {
  background: none; border: none; color: var(--orange); font-size: 13px;
  font-weight: 700; cursor: pointer; font-family: inherit;
}
@media (max-width: 480px) {
  .login-modal { padding: 32px 24px; }
}
</style>
