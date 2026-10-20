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
  border-radius: var(--r-md);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.mb-lvl {
  flex: none;
  padding: 1px 9px;
  border-radius: var(--r-pill);
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}
.is-core {
  color: var(--lv-core-fg);
  background: var(--lv-core-bg);
  border-color: var(--lv-core-fg);
}
.is-key {
  color: var(--lv-know-fg);
  background: var(--lv-know-bg);
  border-color: var(--lv-know-fg);
}
.is-know {
  color: var(--lv-guide-fg);
  background: var(--lv-guide-bg);
  border-color: var(--lv-guide-fg);
}
.is-skip {
  color: var(--lv-skip-fg);
  background: var(--lv-skip-bg);
  border-color: var(--lv-skip-fg);
}
.is-guide {
  color: var(--lv-guide-fg);
  background: var(--lv-guide-bg);
  border-color: var(--lv-guide-fg);
}
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
