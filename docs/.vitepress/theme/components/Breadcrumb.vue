<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../../data/catalog.data'

const { page } = useData()

const trail = computed(() => {
  const rel = page.value.relativePath.replace(/\.md$/, '')
  if (!rel || rel === 'index') return []
  const course = data.courses.find((c) => rel === c.slug || rel.startsWith(c.slug + '/'))
  if (!course) return []
  const chapter = course.chapters.find((c) => c.slug === rel)
  const section = course.sections.find((s) => s.chapters.some((c) => c.slug === rel))
  const items: { text: string; link?: string }[] = [{ text: course.name, link: course.route }]
  if (chapter && section) items.push({ text: section.title })
  if (chapter && chapter.slug !== course.slug) items.push({ text: chapter.title })
  else if (rel.endsWith('/index')) items.push({ text: '课程主页' })
  else {
    // 工具页（依赖图谱、内容状态）不在章节清单里，用页面标题补齐
    const title = page.value.title
    if (title) items.push({ text: title.replace(/\s+/g, ' ').trim() })
  }
  return items
})
</script>

<template>
  <nav v-if="trail.length" class="crumbs" aria-label="面包屑">
    <ol>
      <li><a :href="withBase('/')">首页</a></li>
      <li v-for="(t, i) in trail" :key="i">
        <span class="sep" aria-hidden="true">/</span>
        <a v-if="t.link && i < trail.length - 1" :href="withBase(t.link)">{{ t.text }}</a>
        <span v-else class="cur">{{ t.text }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs { margin: 0 0 14px; }
ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
li { display: flex; align-items: center; gap: 4px; }
.sep { color: var(--vp-c-divider); }
a { color: var(--vp-c-text-3); text-decoration: none; }
a:hover { color: var(--vp-c-brand-1); }
.cur { color: var(--vp-c-text-2); }
</style>
