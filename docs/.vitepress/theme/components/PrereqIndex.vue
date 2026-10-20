<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { PREREQ } from '../data/prereq'
import { openPrereq } from '../composables/usePrereq'

const ORDER = [
  '基础',
  '分析方法',
  '暂态',
  '交流',
  '三相',
  '磁路与电机',
  '电子技术',
  '数字电路',
  '模拟电子',
  '嵌入式'
]

const groups = computed(() => {
  const map = new Map<string, typeof PREREQ[string][]>()
  for (const item of Object.values(PREREQ)) {
    if (!map.has(item.group)) map.set(item.group, [])
    map.get(item.group)!.push(item)
  }
  return [...map.entries()]
    .sort((a, b) => {
      const ia = ORDER.indexOf(a[0])
      const ib = ORDER.indexOf(b[0])
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
    }))
})

const total = computed(() => Object.keys(PREREQ).length)
</script>

<template>
  <div class="pi">
    <p class="pi-summary">
      共 {{ total }} 张卡片。点标题就地展开（抽屉），点「章节」跳到正文；也可以直接用页面链接分享某一张。
    </p>

    <section v-for="g in groups" :key="g.name" class="pi-group">
      <h3 class="pi-group-title">{{ g.name }}</h3>
      <ul class="pi-list">
        <li v-for="item in g.items" :key="item.id" class="pi-item">
          <a
            class="pi-title"
            :href="withBase(item.page || '#')"
            @click.prevent="openPrereq(item.id)"
          >{{ item.title }}</a>
          <span class="pi-brief">{{ item.brief }}</span>
          <a v-if="item.full" class="pi-full" :href="withBase(item.full)">{{ item.fullTitle || '章节' }} →</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.pi { margin: 18px 0; }
.pi-summary { font-size: 13.5px; color: var(--vp-c-text-2); }
.pi-group { margin: 24px 0; }
.pi-group-title {
  margin: 0 0 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.pi-list { margin: 0; padding: 0; list-style: none; }
.pi-item {
  display: grid;
  grid-template-columns: minmax(140px, 200px) 1fr auto;
  gap: 4px 14px;
  align-items: baseline;
  padding: 8px 6px;
  border-radius: 8px;
  font-size: 13.5px;
}
.pi-item:hover { background: var(--vp-c-bg-alt); }
.pi-title { font-weight: 600; color: var(--vp-c-text-1); }
.pi-title:hover { color: var(--vp-c-brand-1); }
.pi-brief { color: var(--vp-c-text-3); font-size: 12.5px; line-height: 1.65; }
.pi-full { font-size: 12px; color: var(--vp-c-brand-1); white-space: nowrap; }
@media (max-width: 640px) {
  .pi-item { grid-template-columns: 1fr; gap: 2px; }
  .pi-full { justify-self: start; }
}
</style>
