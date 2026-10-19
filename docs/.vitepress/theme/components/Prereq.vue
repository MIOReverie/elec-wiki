<script setup lang="ts">
import { computed } from 'vue'
import { PREREQ } from '../data/prereq'
import { openPrereq } from '../composables/usePrereq'

const props = defineProps<{ id: string; text?: string }>()
const item = computed(() => PREREQ[props.id])
const label = computed(() => props.text || item.value?.title || props.id)
</script>

<template>
  <button
    class="prereq-chip"
    type="button"
    :title="item?.brief || label"
    @click="openPrereq(id)"
  >
    <span class="pc-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    </span>
    <span class="pc-text">{{ label }}</span>
    <span class="pc-arrow" aria-hidden="true">↗</span>
  </button>
</template>

<style scoped>
.prereq-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 2px;
  padding: 1px 8px 1px 5px;
  font-size: 0.86em;
  line-height: 1.7;
  vertical-align: baseline;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  font-family: inherit;
}
.prereq-chip:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.16);
}
.prereq-chip:hover .pc-arrow { opacity: 1; transform: translate(1px, -1px); }
.pc-icon { display: inline-flex; opacity: 0.85; }
.pc-text { white-space: nowrap; }
.pc-arrow { font-size: 0.75em; opacity: 0.5; transition: 0.18s; }
@media (max-width: 640px) {
  .pc-text { white-space: normal; }
}
</style>
