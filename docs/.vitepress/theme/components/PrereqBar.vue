<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { PAGE_PREREQ, PREREQ } from '../data/prereq'
import Prereq from './Prereq.vue'

const { page } = useData()
const path = computed(() => '/' + page.value.relativePath.replace(/\.md$/, '').replace(/\/index$/, ''))
const before = computed(() => PAGE_PREREQ[path.value] || [])
const own = computed(() => Object.values(PREREQ).filter((i) => i.full === path.value).map((i) => i.id))
</script>

<template>
  <div v-if="before.length || own.length" class="pbar">
    <div v-if="before.length" class="pbar-row">
      <span class="pbar-label">前置</span>
      <Prereq v-for="id in before" :key="id" :id="id" />
    </div>
    <div v-if="own.length" class="pbar-row">
      <span class="pbar-label pbar-own">本页要点</span>
      <Prereq v-for="id in own" :key="id" :id="id" />
    </div>
  </div>
</template>

<style scoped>
.pbar {
  margin: 0 0 22px;
  padding: 10px 14px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: var(--r-md);
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pbar-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.pbar-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  margin-right: 2px;
}
.pbar-own { color: var(--vp-c-tip-1, var(--vp-c-text-3)); }
</style>
