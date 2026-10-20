<script setup lang="ts">
defineProps<{
  title?: string
  hint?: string
  /** 图解类型标签：电路 / 波形 / 结构 / 时序 */
  kind?: string
  /** 脚注：图注、来源说明 */
  note?: string
}>()
</script>

<template>
  <figure class="fig-box">
    <div class="fig-head">
      <span class="fig-tag">{{ kind || '图解' }}</span>
      <span v-if="title" class="fig-title">{{ title }}</span>
    </div>
    <p v-if="hint" class="fig-hint">{{ hint }}</p>
    <div class="fig-body"><slot /></div>
    <figcaption v-if="note" class="fig-note">{{ note }}</figcaption>
  </figure>
</template>

<style scoped>
.fig-box {
  margin: 24px 0;
  padding: 14px 16px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.fig-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}
.fig-tag {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 5px;
  color: #fff;
  background: var(--wiki-fig-tag-bg);
  flex: none;
}
.fig-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.fig-hint {
  margin: 0 0 10px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--vp-c-text-3);
}
.fig-body :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
.fig-note {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 7px;
}
</style>
