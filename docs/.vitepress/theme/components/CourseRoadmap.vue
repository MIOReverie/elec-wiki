<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../data/catalog.data'

const props = defineProps<{ course: string; showNumbers?: boolean }>()

const course = computed(() => data.courses.find((c) => c.slug === props.course))
const total = computed(() => course.value?.chapters.reduce((s, c) => s + (c.minutes || 0), 0) || 0)
const hours = computed(() => Math.round((total.value / 60) * 10) / 10)

function levelClass(level: string) {
  if (level.includes('核心') || level.includes('重点')) return 'lv-core'
  if (level.includes('跳过')) return 'lv-skip'
  if (level.includes('指南') || level.includes('工具')) return 'lv-guide'
  return 'lv-know'
}
</script>

<template>
  <div v-if="course" class="roadmap">
    <p class="rm-summary">
      共 <strong>{{ course.chapters.length }}</strong> 节，按每节标注的阅读时间合计约
      <strong>{{ hours }} 小时</strong>。档位是给「时间不够」准备的：核心必读，了解看结论，可跳过留到考前。
    </p>
    <div class="rm-scroll">
      <table>
        <thead>
          <tr>
            <th class="c-num">#</th>
            <th>章节</th>
            <th class="c-lv">档位</th>
            <th class="c-time">耗时</th>
            <th class="c-n">例题</th>
            <th class="c-n">演示</th>
          </tr>
        </thead>
        <tbody v-for="section in course.sections" :key="section.title">
          <tr class="rm-section">
            <td colspan="6">{{ section.title }}</td>
          </tr>
          <tr v-for="c in section.chapters" :key="c.route">
            <td class="c-num">{{ c.num || '—' }}</td>
            <td class="c-title">
              <a :href="withBase(c.route)">{{ c.title.replace(/^\d+\s*·\s*/, '') }}</a>
            </td>
            <td class="c-lv">
              <span class="lv" :class="levelClass(c.level)">{{ c.level }}</span>
            </td>
            <td class="c-time">{{ c.minutes ? c.minutes + ' 分' : '—' }}</td>
            <td class="c-n">{{ c.examples || '—' }}</td>
            <td class="c-n">{{ c.demos || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.roadmap { margin: 20px 0 8px; }
.rm-summary {
  margin: 0 0 12px;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}
.rm-scroll {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}
table {
  width: 100%;
  min-width: 560px;
  margin: 0;
  border-collapse: collapse;
  font-size: 13.5px;
}
th,
td {
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  white-space: nowrap;
}
thead th {
  background: var(--vp-c-bg-alt);
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--vp-c-bg-alt); }
.rm-section td {
  padding: 6px 12px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
}
.c-num { width: 46px; color: var(--vp-c-text-3); font-variant-numeric: tabular-nums; }
.c-title { white-space: normal; min-width: 240px; }
.c-title a { font-weight: 500; }
.c-lv { width: 78px; }
.c-time { width: 72px; color: var(--vp-c-text-2); }
.c-n { width: 58px; color: var(--vp-c-text-3); text-align: center; font-variant-numeric: tabular-nums; }
.lv {
  display: inline-block;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11.5px;
  line-height: 1.7;
  font-weight: 600;
}
.lv-core { color: #b42318; background: rgb(220 85 69 / 0.12); }
.lv-know { color: #92620a; background: rgb(201 138 23 / 0.14); }
.lv-skip { color: #1c7a56; background: rgb(42 157 111 / 0.13); }
.lv-guide { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.dark .lv-core { color: #ff9a8f; background: rgb(220 85 69 / 0.18); }
.dark .lv-know { color: #f2c06a; background: rgb(201 138 23 / 0.18); }
.dark .lv-skip { color: #6fd3a8; background: rgb(42 157 111 / 0.18); }
</style>
