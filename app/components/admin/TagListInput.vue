<!--app/components/admin/TagListInput.vue-->
<template>
  <div class="tag-list-input">
    <div class="tag-row" v-for="(item, i) in modelValue" :key="i">
      <input class="input" :value="item" :placeholder="placeholder" @input="update(i, $event.target.value)" />
      <button type="button" class="tag-remove" @click="remove(i)" title="Remove">✕</button>
    </div>
    <button type="button" class="tag-add" @click="add">+ Add {{ itemLabel }}</button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  itemLabel: { type: String, default: 'item' },
})
const emit = defineEmits(['update:modelValue'])

function update(i, value) {
  const next = [...props.modelValue]
  next[i] = value
  emit('update:modelValue', next)
}
function add() {
  emit('update:modelValue', [...props.modelValue, ''])
}
function remove(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}
</script>

<style scoped>
.tag-list-input { display: flex; flex-direction: column; gap: 8px; }
.tag-row { display: flex; gap: 8px; align-items: center; }
.tag-row .input { flex: 1; }
.tag-remove {
  background: none; border: 1px solid var(--border); color: var(--red);
  width: 32px; height: 32px; flex-shrink: 0; cursor: pointer; border-radius: 4px;
}
.tag-remove:hover { background: rgba(192,57,43,0.1); }
.tag-add {
  align-self: flex-start; background: none; border: 1px dashed var(--border); color: var(--orange);
  font-family: var(--font-condensed); font-size: 13px; font-weight: 600; padding: 8px 14px; cursor: pointer; border-radius: 4px;
}
.tag-add:hover { border-color: var(--orange); background: rgba(232,98,42,0.05); }
</style>
