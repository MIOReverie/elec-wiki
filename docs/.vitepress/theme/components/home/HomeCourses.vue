<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../../data/catalog.data'

const courses = computed(() =>
  data.courses
    .filter((c) => c.chapters.length > 0)
    .map((c) => ({
      ...c,
      hours: Math.round((c.minutes / 60) * 10) / 10,
      first: c.chapters[0]
    }))
)

const totals = computed(() => ({
  courses: courses.value.length,
  chapters: data.totals.chapters,
  hours: Math.round((data.totals.minutes / 60) * 10) / 10,
  demos: data.totals.demos
}))
</script>

<template>
  <p class="cc-totals">
    {{ totals.courses }} 门课 · {{ totals.chapters }} 节 · 约 {{ totals.hours }} 小时 ·
    {{ totals.demos }} 个可以拖参数的交互演示
  </p>
  <div class="course-cards">
    <a
      v-for="c in courses"
      :key="c.slug"
      class="course-card"
      :href="withBase(c.route)"
    >
      <div class="cc-head">
        <span class="cc-name">{{ c.name }}</span>
        <span class="cc-count">{{ c.chapters.length }} 讲</span>
      </div>
      <p class="cc-tagline">{{ c.tagline }}</p>
      <div class="cc-foot">
        <span v-if="c.hours">≈ {{ c.hours }} 小时</span>
        <span v-if="c.first">从「{{ c.first.title }}」开始</span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.cc-totals {
  margin: 26px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
  margin: 24px 0 8px;
}
.course-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 18px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none !important;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.course-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}
.cc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.cc-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: 0.01em;
}
.cc-count {
  flex: none;
  font-size: 12px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 999px;
  padding: 1px 8px;
}
.cc-tagline {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}
.cc-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
