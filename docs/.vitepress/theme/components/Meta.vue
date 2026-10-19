<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ time?: string; level?: string; note?: string }>()

const lvl = computed(() => (props.level || '核心').trim())

const lvlClass = computed(() => {
  const l = lvl.value
  if (l.includes('跳过') || l.includes('已会')) return 'is-skip'
  if (l.includes('了解') || l.includes('选学')) return 'is-know'
  if (l.includes('指南') || l.includes('工具') || l.includes('导览')) return 'is-guide'
  if (l.includes('重点')) return 'is-key'
  return 'is-core'
})
</script>

<template>
  <div class="meta-bar">
    <span class="mb-lvl" :class="lvlClass">{{ lvl }}</span>
    <span v-if="time" class="mb-time">
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" stroke-linecap="round" />
      </svg>
      约 {{ time }}
    </span>
    <span v-if="note" class="mb-note">{{ note }}</span>
  </div>
</template>

<style scoped>
.meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin: 0 0 20px;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.mb-lvl {
  flex: none;
  padding: 1px 9px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}
.is-core {
  color: #b42318;
  background: rgb(220 85 69 / 0.1);
  border-color: rgb(220 85 69 / 0.25);
}
.is-key {
  color: #92620a;
  background: rgb(201 138 23 / 0.12);
  border-color: rgb(201 138 23 / 0.3);
}
.is-know {
  color: #1d4ed8;
  background: rgb(59 130 246 / 0.1);
  border-color: rgb(59 130 246 / 0.25);
}
.is-skip {
  color: #1c7a56;
  background: rgb(42 157 111 / 0.12);
  border-color: rgb(42 157 111 / 0.28);
}
.is-guide {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}
.dark .is-core { color: #ff9a8f; }
.dark .is-key { color: #f2c06a; }
.dark .is-know { color: #8ab4ff; }
.dark .is-skip { color: #6fd3a8; }
.mb-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
}
.mb-note { flex: 1; min-width: 160px; }
</style>
