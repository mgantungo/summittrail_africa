<!--app/components/dashboard/DashProfile.vue-->
<template>
  <div>
    <div class="section-label">Account Settings</div>
    <h2 class="sec-title">My Profile</h2>

    <div class="profile-grid">
      <!-- Avatar & identity -->
      <div class="dash-card">
        <div class="prof-avatar-area">
          <img :src="profile.user?.avatar" :alt="profile.displayName" class="prof-avatar" />
          <button class="btn btn-ghost btn-sm" style="margin-top:10px;">Change Photo</button>
        </div>
        <div class="prof-identity">
          <div class="prof-name">{{ profile.displayName }}</div>
          <div class="prof-email">{{ profile.user?.email }}</div>
          <div class="prof-level-badge">{{ profile.level }}</div>
          <div class="prof-since">Member since {{ memberSince }}</div>
        </div>
      </div>

      <!-- Personal details -->
      <div class="dash-card">
        <div class="section-label">Personal Details</div>
        <div class="field-group">
          <div class="field">
            <label class="input-label">Full Name</label>
            <input class="input" v-model="form.name" />
          </div>
          <div class="field">
            <label class="input-label">Email</label>
            <input class="input" type="email" v-model="form.email" />
          </div>
          <div class="field">
            <label class="input-label">Phone</label>
            <input class="input" v-model="form.phone" />
          </div>
          <div class="field">
            <label class="input-label">Country</label>
            <input class="input" v-model="form.country" />
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top:16px;" :disabled="saving" @click="saveProfile">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="save-success">Saved ✓</p>
      </div>
    </div>

    <!-- Preferences -->
    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Adventure Preferences</div>
      <div class="prefs-grid">
        <div class="pref-item">
          <label class="input-label">Preferred Theme</label>
          <div style="display:flex;gap:8px;">
            <button v-for="t in ['dark','light','auto']" :key="t" class="chip" :class="{ active: profile.theme===t }" @click="profile.setTheme(t)">{{ t }}</button>
          </div>
        </div>
        <div class="pref-item">
          <label class="input-label">Difficulty Preference</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button v-for="d in ['any','beginner','moderate','extreme']" :key="d" class="chip" :class="{ active: profile.preferences.difficulty===d }" @click="profile.preferences.difficulty=d">{{ d }}</button>
          </div>
        </div>
        <div class="pref-item">
          <label class="input-label">Categories of Interest</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button v-for="c in ['survival','convoy','mountain','overland']" :key="c" class="chip" :class="{ active: profile.preferences.categories.includes(c) }" @click="toggleCat(c)">{{ c }}</button>
          </div>
        </div>
        <div class="pref-item">
          <label class="input-label">Group Preference</label>
          <div style="display:flex;gap:8px;">
            <button v-for="g in ['any','solo','small','large']" :key="g" class="chip" :class="{ active: profile.preferences.groupType===g }" @click="profile.preferences.groupType=g">{{ g }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Notifications</div>
      <div class="notif-row">
        <div class="notif-info">
          <div class="notif-icon">{{ profile.notificationsEnabled ? '🔔' : '🔕' }}</div>
          <div>
            <div class="notif-title">{{ profile.notificationsEnabled ? 'Push Notifications Active' : 'Push Notifications Off' }}</div>
            <div class="notif-sub">{{ profile.notificationsEnabled ? 'You will receive alerts for departures and updates.' : 'Enable to get first access to new expeditions.' }}</div>
          </div>
        </div>
        <button v-if="!profile.notificationsEnabled" class="btn btn-primary btn-sm">Enable</button>
        <button v-else class="btn btn-ghost btn-sm">Disable</button>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="dash-card danger-zone">
      <div class="section-label" style="color:var(--red);">Danger Zone</div>
      <div class="danger-row">
        <div>
          <div class="danger-title">Delete Account</div>
          <div class="danger-sub">Permanently remove your account and all data. This cannot be undone.</div>
        </div>
        <button class="btn btn-danger btn-sm">Delete Account</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfileStore } from '~/stores/profile'
const profile = useProfileStore()
const memberSince = profile.user?.memberSince ? new Date(profile.user.memberSince).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : 'N/A'
const form = reactive({
  name:    profile.user?.name || '',
  email:   profile.user?.email || '',
  phone:   profile.user?.phone || '',
  country: profile.user?.country || '',
})
function toggleCat(c) {
  const arr = profile.preferences.categories
  const idx = arr.indexOf(c)
  if (idx === -1) arr.push(c)
  else arr.splice(idx, 1)
}

const saving = ref(false)
const saveError = ref(null)
const saveSuccess = ref(false)

async function saveProfile() {
  const documentId = profile.user?.documentId || profile.user?.id
  if (!documentId) { saveError.value = 'Not signed in.'; return }
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    const { data: updated } = await updateCustomerProfile(documentId, {
      name: form.name, email: form.email, phone: form.phone, country: form.country,
    })
    profile.login({ ...profile.user, ...updated })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    saveError.value = 'Could not save changes. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.profile-grid { display:grid; grid-template-columns:260px 1fr; gap:16px; margin-bottom:16px; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:16px; }
.prof-avatar-area { text-align:center; margin-bottom:16px; }
.prof-avatar { width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--orange); }
.prof-identity { text-align:center; }
.prof-name  { font-family:var(--font-condensed); font-size:18px; font-weight:700; color:var(--text); margin-bottom:4px; }
.prof-email { font-size:13px; color:var(--gray); margin-bottom:10px; }
.prof-level-badge { display:inline-block; font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--gold); background:rgba(212,168,67,0.1); border:1px solid var(--gold); padding:4px 14px; margin-bottom:8px; }
.prof-since { font-family:var(--font-condensed); font-size:12px; color:var(--gray); }
.field-group { display:flex; flex-direction:column; gap:12px; }
.field { display:flex; flex-direction:column; gap:6px; }
.prefs-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
.pref-item { display:flex; flex-direction:column; gap:8px; }
.notif-row  { display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; }
.notif-info { display:flex; gap:14px; align-items:center; }
.notif-icon { font-size:28px; flex-shrink:0; }
.notif-title { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:3px; }
.notif-sub  { font-size:13px; color:var(--gray); }
.danger-zone { border-color:rgba(192,57,43,0.4); background:rgba(192,57,43,0.04); margin-bottom:0; }
.danger-row { display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; }
.danger-title { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--red); margin-bottom:3px; }
.danger-sub  { font-size:13px; color:var(--gray); }
.save-error { color:var(--red); font-size:13px; margin-top:8px; }
.save-success { color:var(--green-light); font-size:13px; margin-top:8px; }
@media (max-width:700px) { .profile-grid { grid-template-columns:1fr; } .prefs-grid { grid-template-columns:1fr; } }
</style>
