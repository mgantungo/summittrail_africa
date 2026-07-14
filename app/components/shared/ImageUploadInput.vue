<!--app/components/shared/ImageUploadInput.vue-->
<template>
  <div class="image-upload">
    <div class="preview-row" v-if="modelValue">
      <img :src="modelValue" class="preview-img" alt="Uploaded preview" />
      <button type="button" class="remove-btn" @click="clear">✕ Remove</button>
    </div>

    <div v-else class="upload-drop" :class="{ uploading }" @click="!uploading && trigger()">
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none" @change="onFileChange" />
      <span v-if="uploading">Uploading…</span>
      <span v-else>📷 Click to upload an image <small>(JPEG/PNG/WEBP, max 8MB)</small></span>
    </div>

    <div class="or-row" v-if="!modelValue && !uploading">
      <span>or paste a URL</span>
      <input class="input" placeholder="https://..." @change="e => emit('update:modelValue', e.target.value)" />
    </div>

    <p v-if="error" class="upload-error">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const error = ref(null)

function trigger() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = null
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch('/api/cms/upload', { method: 'POST', body: formData })
    emit('update:modelValue', result.url)
  } catch (err) {
    error.value = err?.data?.statusMessage || 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-upload { display: flex; flex-direction: column; gap: 8px; }
.upload-drop {
  border: 1px dashed var(--border); border-radius: 4px; padding: 28px; text-align: center;
  color: var(--gray); font-size: 14px; cursor: pointer; transition: border-color 0.2s;
}
.upload-drop:hover { border-color: var(--orange); color: var(--light); }
.upload-drop.uploading { cursor: wait; opacity: 0.7; }
.upload-drop small { display: block; margin-top: 4px; color: var(--gray); font-size: 11px; }
.preview-row { position: relative; display: inline-block; }
.preview-img { max-width: 240px; max-height: 160px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); display: block; }
.remove-btn {
  margin-top: 6px; background: none; border: 1px solid var(--border); color: var(--red);
  font-size: 12px; padding: 4px 10px; cursor: pointer; border-radius: 4px;
}
.remove-btn:hover { background: rgba(192,57,43,0.1); }
.or-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray); }
.or-row .input { flex: 1; }
.upload-error { color: var(--red); font-size: 12px; }
</style>
