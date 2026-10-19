<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../../data/catalog.data'

const props = defineProps<{ course?: string }>()

const list = computed(() =>
  props.course ? data.courses.filter((c) => c.slug === props.course) : data.courses
)

function verdict(c: { chars: number; examples: number }) {
  if (c.chars >= 3000 && c.examples >= 4) return { label: '完整', cls: 'v-ok' }
  if (c.chars >= 1800 && c.examples >= 2) return { label: '够用', cls: 'v-mid' }
  return { label: '偏薄', cls: 'v-thin' }
}

const totals = computed(() => {
  const chapters = list.value.flatMap((c) => c.chapters)
  return {
    n: chapters.length,
    chars: chapters.reduce((s, c) => s + c.chars, 0),
    examples: chapters.reduce((s, c) => s + c.examples, 0),
    demos: chapters.reduce((s, c) => s + c.demos, 0),
    full: chapters.filter((c) => verdict(c).label === '完整').length
  }
})
</script>

<template>
  <div class="status">
    <p class="st-summary">
      全站已建 <strong>{{ totals.n }}</strong> 节正文，约
      <strong>{{ (totals.chars / 10000).toFixed(1) }} 万字</strong>、<strong>{{ totals.examples }}</strong>
      道例题、<strong>{{ totals.demos }}</strong> 个交互演示；其中
      <strong>{{ totals.full }}</strong> 节达到「完整」标准。下表由构建脚本扫描正文自动生成，不靠手工维护。
    </p>

    <div v-for="course in list" :key="course.slug" class="st-course">
      <h3 class="st-course-title">
        <a :href="withBase(course.route)">{{ course.name }}</a>
        <span>{{ course.chapters.length }} 节</span>
      </h3>
      <div class="st-scroll">
        <table>
          <thead>
            <tr>
              <th>章节</th>
              <th class="c-n">字数</th>
              <th class="c-n">例题</th>
              <th class="c-n">演示</th>
              <th class="c-n">图</th>
              <th class="c-flags">结论 / 易错 / 工程</th>
              <th class="c-v">成熟度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in course.chapters" :key="c.route">
              <td class="c-title"><a :href="withBase(c.route)">{{ c.title }}</a></td>
              <td class="c-n">{{ c.chars }}</td>
              <td class="c-n">{{ c.examples || '—' }}</td>
              <td class="c-n">{{ c.demos || '—' }}</td>
              <td class="c-n">{{ c.figs || '—' }}</td>
              <td class="c-flags">
                <span :class="c.has.conclusion ? 'f-on' : 'f-off'">结</span>
                <span :class="c.has.mistakes ? 'f-on' : 'f-off'">错</span>
                <span :class="c.has.engineering ? 'f-on' : 'f-off'">工</span>
              </td>
              <td class="c-v"><span class="v" :class="verdict(c).cls">{{ verdict(c).label }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status { margin: 18px 0; }
.st-summary {
  margin: 0 0 18px;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}
.st-course { margin-bottom: 26px; }
.st-course-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 15px;
}
.st-course-title a { font-weight: 700; }
.st-course-title span { font-size: 12px; font-weight: 400; color: var(--vp-c-text-3); }
.st-scroll { overflow-x: auto; border: 1px solid var(--vp-c-divider); border-radius: 10px; }
table {
  width: 100%;
  min-width: 620px;
  margin: 0;
  border-collapse: collapse;
  font-size: 13px;
}
th, td {
  padding: 7px 10px;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  white-space: nowrap;
}
thead th { background: var(--vp-c-bg-alt); font-size: 11.5px; color: var(--vp-c-text-2); font-weight: 600; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--vp-c-bg-alt); }
.c-title { white-space: normal; min-width: 220px; }
.c-n { width: 58px; text-align: right; font-variant-numeric: tabular-nums; color: var(--vp-c-text-2); }
.c-flags { width: 108px; }
.f-on, .f-off {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  border-radius: 5px;
  font-size: 11px;
  line-height: 20px;
  text-align: center;
}
.f-on { color: #1c7a56; background: rgb(42 157 111 / 0.14); font-weight: 700; }
.f-off { color: var(--vp-c-text-3); background: var(--vp-c-bg-alt); opacity: 0.6; }
.c-v { width: 74px; }
.v {
  display: inline-block;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11.5px;
  line-height: 1.7;
  font-weight: 600;
}
.v-ok { color: #1c7a56; background: rgb(42 157 111 / 0.14); }
.v-mid { color: #92620a; background: rgb(201 138 23 / 0.15); }
.v-thin { color: #b42318; background: rgb(220 85 69 / 0.13); }
.dark .v-ok, .dark .f-on { color: #6fd3a8; }
.dark .v-mid { color: #f2c06a; }
.dark .v-thin { color: #ff9a8f; }
</style>
