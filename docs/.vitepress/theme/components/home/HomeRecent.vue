<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../../data/catalog.data'

const items = computed(() => data.recent.filter((r) => r.title))

function shortDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <section v-if="items.length" class="home-recent">
    <h2>最近更新</h2>
    <p class="recent-hint">按 git 提交时间排序；只保留最近 8 次内容改动。</p>
    <div class="recent">
      <a v-for="r in items" :key="r.route" class="recent-row" :href="withBase(r.route)">
        <span class="r-date">{{ shortDate(r.date) }}</span>
        <span class="r-title">{{ r.title }}</span>
        <span class="r-course">{{ r.course }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.recent-hint {
  margin: -6px 0 10px;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
.recent {
  margin: 18px 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
.recent-row {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 12px;
  align-items: baseline;
  padding: 10px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-decoration: none !important;
  color: var(--vp-c-text-1);
  transition: background 0.15s;
}
.recent-row:last-child { border-bottom: none; }
.recent-row:hover { background: var(--vp-c-bg-alt); }
.r-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
}
.r-title {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-course { font-size: 12px; color: var(--vp-c-text-3); }
@media (max-width: 520px) {
  .r-course { display: none; }
}
</style>
