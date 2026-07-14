<!--app/components/shared/MultiImageUploadInput.vue-->
<template>
  <div class="multi-image-upload">
    <div class="thumb-grid" v-if="modelValue.length">
      <div class="thumb" v-for="(url, i) in modelValue" :key="i">
        <img :src="url" :alt="`Image ${i+1}`" />
        <button type="button" class="thumb-remove" @click="remove(i)" title="Remove">✕</button>
      </div>
    </div>

    <div class="upload-drop" :class="{ uploading }" @click="!uploading && trigger()">
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="display:none" @change="onFileChange" />
      <span v-if="uploading">Uploading {{ uploadedCount }}/{{ totalCount }}…</span>
      <span v-else>📷 Click to upload images <small>(select multiple — JPEG/PNG/WEBP, max 8MB each)</small></span>
    </div>

    <p v-if="error" class="upload-error">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const uploadedCount = ref(0)
const totalCount = ref(0)
const error = ref(null)

function trigger() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  uploading.value = true
  error.value = null
  uploadedCount.value = 0
  totalCount.value = files.length

  const newUrls = []
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await $fetch('/api/cms/upload', { method: 'POST', body: formData })
      newUrls.push(result.url)
      uploadedCount.value++
    } catch (err) {
      error.value = `"${file.name}" failed to upload — the rest were still processed.`
    }
  }

  emit('update:modelValue', [...props.modelValue, ...newUrls])
  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
}

function remove(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}
</script>

<style scoped>
.multi-image-upload { display: flex; flex-direction: column; gap: 10px; }
.thumb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.thumb { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-remove {
  position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.75); color: var(--red);
  border: none; width: 22px; height: 22px; font-size: 11px; border-radius: 3px; cursor: pointer;
}
.thumb-remove:hover { background: rgba(0,0,0,0.9); }
.upload-drop {
  border: 1px dashed var(--border); border-radius: 4px; padding: 22px; text-align: center;
  color: var(--gray); font-size: 14px; cursor: pointer; transition: border-color 0.2s;
}
.upload-drop:hover { border-color: var(--orange); color: var(--light); }
.upload-drop.uploading { cursor: wait; opacity: 0.7; }
.upload-drop small { display: block; margin-top: 4px; color: var(--gray); font-size: 11px; }
.upload-error { color: var(--red); font-size: 12px; }
</style>