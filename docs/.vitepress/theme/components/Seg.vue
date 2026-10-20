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
    <div class="seg-group" role="group" :aria-label="label || '选项切换'">
      <button
        v-for="o in options"
        :key="String(o.value)"
        type="button"
        class="seg-btn"
        :class="{ on: o.value === props.modelValue }"
        :aria-pressed="o.value === props.modelValue"
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
  border-radius: var(--r-md);
  background: var(--vp-c-bg);
}
.seg-btn {
  padding: 4px 11px;
  font-size: 12.5px;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: inherit;
}
.seg-btn:hover { color: var(--vp-c-text-1); }
/* 选中底用 brand-3（深色阶梯）：白字浅色 6.70:1 / 暗色 5.17:1，均 ≥4.5 */
.seg-btn.on { background: var(--vp-c-brand-3); color: #fff; font-weight: 600; }
</style>
