<script setup lang="ts">
defineProps<{ title?: string; hint?: string; tag?: string }>()
</script>

<template>
  <figure class="demo-box">
    <div class="demo-head">
      <span class="demo-tag">{{ tag || '交互演示' }}</span>
      <span v-if="title" class="demo-title">{{ title }}</span>
    </div>
    <p v-if="hint" class="demo-hint">{{ hint }}</p>
    <div class="demo-body"><slot /></div>
  </figure>
</template>

<style scoped>
.demo-box {
  margin: 26px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: var(--shadow-1);
}
.demo-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}
.demo-tag {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: var(--r-sm);
  color: #fff;
  /* 原 #2f7de1 对白字仅 4.08:1，加深到 brand-3（#1d4ed8）达 6.70:1 */
  background: var(--vp-c-brand-3);
  flex: none;
}
.demo-title { font-size: var(--text-sm); font-weight: 600; color: var(--vp-c-text-1); }
.demo-hint {
  margin: 10px 14px 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
  line-height: 1.6;
}
.demo-body { padding: 14px; }
.demo-body :deep(canvas) { display: block; width: 100%; border-radius: var(--r-md); }
</style>
