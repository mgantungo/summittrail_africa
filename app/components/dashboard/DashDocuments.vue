<template>
  <div>
    <div class="section-label">Trip Documentation</div>
    <h2 class="sec-title">Documents</h2>

    <div class="doc-status-row">
      <div class="doc-status-card">
        <div class="dsc-icon">✅</div>
        <div class="dsc-val">{{ submitted }}</div>
        <div class="dsc-label">Submitted</div>
      </div>
      <div class="doc-status-card">
        <div class="dsc-icon">⏳</div>
        <div class="dsc-val" style="color:var(--gold);">{{ pending }}</div>
        <div class="dsc-label">Pending</div>
      </div>
      <div class="doc-status-card">
        <div class="dsc-icon">❌</div>
        <div class="dsc-val" style="color:var(--red);">{{ missing }}</div>
        <div class="dsc-label">Missing</div>
      </div>
    </div>

    <div class="dash-card" style="margin-bottom:16px;">
      <div class="section-label">Required Documents</div>
      <div class="doc-list">
        <div class="doc-row" v-for="d in requiredDocs" :key="d.id">
          <div class="doc-icon-wrap" :class="`doc-${d.status}`">{{ d.icon }}</div>
          <div class="doc-body">
            <div class="doc-name">{{ d.name }}</div>
            <div class="doc-desc">{{ d.desc }}</div>
          </div>
          <div class="doc-right">
            <span class="doc-badge" :class="`doc-badge-${d.status}`">
              {{ d.status === 'done' ? '✓ Submitted' : d.status === 'pending' ? '⏳ Under Review' : '⚠ Required' }}
            </span>
            <button v-if="d.status !== 'done'" class="btn btn-primary btn-sm">Upload</button>
            <button v-else class="btn btn-ghost btn-sm">View</button>
          </div>
        </div>
      </div>
    </div>

    <div class="dash-card">
      <div class="section-label">Downloadable Resources</div>
      <div class="dl-list">
        <div class="dl-row" v-for="r in downloads" :key="r.name">
          <div class="dl-icon">{{ r.icon }}</div>
          <div class="dl-body">
            <div class="dl-name">{{ r.name }}</div>
            <div class="dl-meta">{{ r.meta }}</div>
          </div>
          <button class="btn btn-ghost btn-sm">⬇ Download</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const requiredDocs = [
  { id:1, name:'Passport / National ID', desc:'Valid government-issued photo ID', icon:'🪪', status:'done' },
  { id:2, name:'Digital Waiver',         desc:'Liability and risk acknowledgement form', icon:'✍️', status:'done' },
  { id:3, name:'Medical Clearance',      desc:'Fitness declaration signed by your doctor', icon:'🏥', status:'pending' },
  { id:4, name:'Emergency Contact Form', desc:'Next-of-kin details for field communications', icon:'📞', status:'pending' },
  { id:5, name:'Travel Insurance',       desc:'Policy covering evacuation and medical emergency', icon:'🛡️', status:'missing' },
  { id:6, name:'Vaccination Record',     desc:'Yellow fever certificate (required for Bwindi)', icon:'💉', status:'missing' },
]
const submitted = requiredDocs.filter(d=>d.status==='done').length
const pending   = requiredDocs.filter(d=>d.status==='pending').length
const missing   = requiredDocs.filter(d=>d.status==='missing').length
const downloads = [
  { icon:'🗺️', name:'Offline Trail Maps',   meta:'Rwenzori · Kidepo · Elgon · Bwindi — 48 MB' },
  { icon:'🎒', name:'Gear Packing List',     meta:'PDF · Essential + Premium kit lists' },
  { icon:'📋', name:'Safety Briefing Pack', meta:'Emergency procedures, contacts, protocols' },
  { icon:'🧭', name:'Field Guide Handbook', meta:'Flora, fauna, altitude management tips' },
  { icon:'📷', name:'Photo Release Form',   meta:'Permission for Summit Trail to use your photos' },
]
</script>

<style scoped>
.sec-title { font-family:var(--font-display); font-size:36px; color:var(--text); margin-bottom:24px; }
.doc-status-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
.doc-status-card { background:var(--panel); border:1px solid var(--border); padding:20px; text-align:center; }
.dsc-icon { font-size:28px; margin-bottom:8px; }
.dsc-val  { font-family:var(--font-display); font-size:40px; color:var(--green-light); line-height:1; }
.dsc-label { font-family:var(--font-condensed); font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gray); margin-top:4px; }
.dash-card { background:var(--panel); border:1px solid var(--border); padding:24px; margin-bottom:16px; }
.doc-list { display:flex; flex-direction:column; gap:2px; }
.doc-row  { display:flex; align-items:center; gap:16px; padding:16px; background:var(--charcoal); border:1px solid var(--border); flex-wrap:wrap; }
.doc-icon-wrap { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.doc-done    { background:rgba(77,140,77,0.15); border:1px solid var(--green-light); }
.doc-pending { background:rgba(212,168,67,0.15); border:1px solid var(--gold); }
.doc-missing { background:rgba(192,57,43,0.15); border:1px solid var(--red); }
.doc-body { flex:1; }
.doc-name { font-family:var(--font-condensed); font-size:15px; font-weight:700; color:var(--text); margin-bottom:3px; }
.doc-desc { font-size:13px; color:var(--gray); }
.doc-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.doc-badge { font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:1px; padding:4px 10px; }
.doc-badge-done    { background:rgba(77,140,77,0.15); color:var(--green-light); }
.doc-badge-pending { background:rgba(212,168,67,0.15); color:var(--gold); }
.doc-badge-missing { background:rgba(192,57,43,0.15); color:var(--red); }
.dl-list { display:flex; flex-direction:column; gap:2px; }
.dl-row  { display:flex; align-items:center; gap:14px; padding:14px; background:var(--charcoal); border:1px solid var(--border); }
.dl-icon { font-size:24px; flex-shrink:0; }
.dl-body { flex:1; }
.dl-name { font-family:var(--font-condensed); font-size:14px; font-weight:700; color:var(--text); margin-bottom:3px; }
.dl-meta { font-size:13px; color:var(--gray); }
</style>
