<template>
  <aside class="admin-sidebar">
    <div class="admin-logo">
      <NuxtLink to="/">⛰ Summit Trail</NuxtLink>
    </div>

    <div class="admin-user" v-if="profile.isLoggedIn">
      <img :src="profile.user.avatar" :alt="profile.displayName" class="admin-user-ava" />
      <div class="admin-user-info">
        <div class="admin-user-name">{{ profile.displayName }}</div>
        <div class="admin-user-role">Administrator</div>
      </div>
    </div>

    <nav class="admin-nav">
      <ul>
        <li v-for="item in navItems" :key="item.key">
          <button
            class="admin-nav-link"
            :class="{ active: active === item.key }"
            @click="$emit('select', item.key)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </button>
        </li>
      </ul>

      <div class="admin-nav-divider" />

      <ul>
        <li>
          <NuxtLink to="/" class="admin-nav-link">
            <span class="nav-icon">🌐</span><span>View Site</span>
          </NuxtLink>
        </li>
        <li>
          <button class="admin-nav-link admin-logout" @click="logout">
            <span class="nav-icon">🚪</span><span>Sign Out</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()
const router  = useRouter()

defineProps({ active: { type: String, default: 'overview' } })
defineEmits(['select'])

const navItems = [
  { key: 'overview',       label: 'Overview',       icon: '📊', badge: null  },
  { key: 'bookings',       label: 'Bookings',        icon: '📋', badge: '142' },
  { key: 'trips',          label: 'Trips',           icon: '🗺️', badge: null  },
  { key: 'customers',      label: 'Customers',       icon: '👥', badge: null  },
  { key: 'vehicles',       label: 'Vehicles',        icon: '🚙', badge: null  },
  { key: 'guides',         label: 'Guides',          icon: '🧭', badge: null  },
  { key: 'analytics',      label: 'Analytics',       icon: '📈', badge: null  },
  { key: 'newsletter',     label: 'Newsletter',      icon: '📧', badge: null  },
  { key: 'notifications',  label: 'Push Alerts',     icon: '🔔', badge: null  },
  { key: 'content',        label: 'Content',         icon: '✍️', badge: null  },
]

function logout() {
  profile.logout()
  router.replace('/admin/login')
}
</script>

<style scoped>
.admin-sidebar {
  background: var(--black); border-right: 1px solid var(--border);
  height: 100vh; overflow-y: auto; position: sticky; top: 0;
  display: flex; flex-direction: column;
}
.admin-logo {
  padding: 20px 24px; border-bottom: 1px solid var(--border);
  font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; color: var(--orange);
  flex-shrink: 0;
}
.admin-logo a { color: inherit; }
.admin-user {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 24px; border-bottom: 1px solid var(--border);
  background: rgba(232,98,42,0.05); flex-shrink: 0;
}
.admin-user-ava { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange); flex-shrink: 0; }
.admin-user-name { font-family: var(--font-condensed); font-size: 14px; font-weight: 700; color: var(--text); }
.admin-user-role { font-family: var(--font-condensed); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--orange); margin-top: 2px; }
.admin-nav { padding: 12px 0; flex: 1; }
.admin-nav ul { list-style: none; }
.admin-nav-link {
  display: flex; align-items: center; gap: 12px; padding: 13px 24px; width: 100%;
  font-family: var(--font-condensed); font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  color: var(--gray); background: none; border: none; cursor: pointer; text-decoration: none; transition: all 0.2s;
}
.admin-nav-link:hover { color: var(--text); background: rgba(255,255,255,0.02); }
.admin-nav-link.active { color: var(--orange); background: rgba(232,98,42,0.08); border-left: 3px solid var(--orange); padding-left: 21px; }
.admin-logout { color: var(--red) !important; }
.admin-logout:hover { background: rgba(192,57,43,0.08) !important; }
.nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.nav-badge { margin-left: auto; background: var(--orange); color: var(--black); font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.admin-nav-divider { height: 1px; background: var(--border); margin: 12px 0; }
</style>
