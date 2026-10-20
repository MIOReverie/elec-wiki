<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../data/catalog.data'

const courses = computed(() => data.courses.filter((c) => c.chapters.length > 0))

const guides = [
  { title: '怎么用这个站', route: '/guide/start' },
  { title: '关于与版权', route: '/guide/about' },
  { title: '内容状态与成熟度', route: '/guide/status' },
  { title: '写作与贡献指南', route: '/guide/contributing' },
  { title: '更新日志', route: '/guide/changelog' },
  { title: '隐私与免责', route: '/guide/privacy' },
  { title: '术语与前置知识索引', route: '/guide/glossary' },
  { title: '公式速查表', route: '/shared/cheatsheet' },
  { title: '知识依赖图谱', route: '/ee/graph' }
]

const total = computed(
  () =>
    courses.value.reduce((s, c) => s + c.chapters.length, 0) +
    courses.value.length +
    guides.length
)
</script>

<template>
  <div class="all-pages">
    <p class="ap-summary">共 {{ total }} 个页面。按课程分组，顺序即建议阅读顺序。</p>

    <section v-for="course in courses" :key="course.slug" class="ap-course">
      <h2 class="ap-course-title">
        <a :href="withBase(course.route)">{{ course.name }}</a>
        <span>{{ course.chapters.length }} 节</span>
      </h2>
      <div v-for="section in course.sections" :key="section.title" class="ap-section">
        <div class="ap-section-title">{{ section.title }}</div>
        <ul class="ap-list">
          <li v-for="c in section.chapters" :key="c.route">
            <a :href="withBase(c.route)">{{ c.title }}</a>
            <span class="ap-time">{{ c.minutes ? c.minutes + ' 分' : '' }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="ap-course">
      <h2 class="ap-course-title">站点与工具<span>{{ guides.length }} 页</span></h2>
      <ul class="ap-list">
        <li v-for="g in guides" :key="g.route">
          <a :href="withBase(g.route)">{{ g.title }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.all-pages { margin: 16px 0; }
.ap-summary { font-size: 13.5px; color: var(--vp-c-text-2); }
.ap-course { margin: 26px 0; }
.ap-course-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 17px;
}
.ap-course-title span { font-size: 12px; font-weight: 400; color: var(--vp-c-text-3); }
.ap-section { margin: 12px 0; }
.ap-section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
}
.ap-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2px 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ap-list li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13.5px;
}
.ap-list li:hover { background: var(--vp-c-bg-alt); }
.ap-list a { text-decoration: none; color: var(--vp-c-text-1); }
.ap-list a:hover { color: var(--vp-c-brand-1); }
.ap-time { flex: none; font-size: 11.5px; color: var(--vp-c-text-3); }
</style>
