<script setup lang="ts">
import { computed } from 'vue'
import { data } from '../../../data/catalog.data'

// 首页唯一的统计出口：数字由构建脚本扫描正文生成（catalog.data.ts），
// hero tagline 与卡片不再重复出现这些数字。
const stats = computed(() => [
  { value: String(data.totals.chapters), label: '节正文' },
  { value: String(data.totals.demos), label: '处可拖演示' },
  { value: (Math.round((data.totals.minutes / 60) * 10) / 10).toFixed(1), label: '小时预计耗时' }
])
</script>

<template>
  <div class="hs" role="list">
    <div v-for="s in stats" :key="s.label" class="hs-item" role="listitem">
      <span class="hs-value">{{ s.value }}</span>
      <span class="hs-label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.hs {
  display: flex;
  gap: 36px;
  margin: 26px 0 0;
  padding: 18px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--r-md);
  background: var(--vp-c-bg-soft);
  width: fit-content;
}
.hs-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hs-value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.hs-label {
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
@media (max-width: 767px) {
  .hs { gap: 22px; padding: 14px 16px; }
  .hs-value { font-size: 24px; }
}
</style>
