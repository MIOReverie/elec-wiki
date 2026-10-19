<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  options: { value: string | number; label: string }[]
  label?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [any] }>()
</script>

<template>
  <div class="seg">
    <span v-if="label" class="seg-label">{{ label }}</span>
    <div class="seg-group">
      <button
        v-for="o in options"
        :key="String(o.value)"
        type="button"
        class="seg-btn"
        :class="{ on: o.value === props.modelValue }"
        @click="emit('update:modelValue', o.value)"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.seg { display: flex; align-items: center; gap: 8px; margin: 4px 0; flex-wrap: wrap; }
.seg-label { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.seg-group {
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}
.seg-btn {
  padding: 4px 11px;
  font-size: 12.5px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: inherit;
}
.seg-btn:hover { color: var(--vp-c-text-1); }
.seg-btn.on { background: var(--vp-c-brand-1); color: #fff; font-weight: 600; }
</style>
