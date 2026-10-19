<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'
import Ctrl from '../Ctrl.vue'

// FreeRTOS 抢占式调度：谁优先级高谁先跑；以及优先级反转是怎么发生的
const scene = ref<'preempt' | 'inversion'>('preempt')

const MAX_T = 16
const hWork = ref(3)
const mWork = ref(5)
const lWork = ref(4)
const hStart = ref(2)

interface Task {
  name: string
  key: string
  prio: number
  work: number
  start: number
}
const tasks = computed<Task[]>(() => [
  { name: '高优先级任务', key: 'H', prio: 3, work: hWork.value, start: hStart.value },
  { name: '中优先级任务', key: 'M', prio: 2, work: mWork.value, start: 0 },
  { name: '低优先级任务', key: 'L', prio: 1, work: lWork.value, start: 0 }
])

interface Seg {
  from: number
  to: number
  key: string
}
// 抢占式优先级调度：每 tick 选「已就绪且优先级最高」的任务；同优先级按时间片轮转
const segments = computed<Seg[]>(() => {
  const ts = tasks.value
  const remaining = ts.map((t) => t.work)
  const out: Seg[] = []
  let t = 0
  while (t < MAX_T) {
    const ready = ts
      .map((tk, i) => ({ tk, i }))
      .filter((x) => x.tk.start <= t && remaining[x.i] > 0)
    if (ready.length === 0) {
      out.push({ from: t, to: t + 1, key: 'IDLE' })
      t++
      continue
    }
    ready.sort((a, b) => b.tk.prio - a.tk.prio || a.i - b.i)
    const pick = ready[0]
    const last = out[out.length - 1]
    if (last && last.key === pick.tk.key && last.to === t) last.to = t + 1
    else out.push({ from: t, to: t + 1, key: pick.tk.key })
    remaining[pick.i]--
    t++
  }
  return out
})

const preemptNote = computed(() => {
  const first = segments.value.find((s) => s.key === 'H')
  if (!first) return '高优先级任务当前没有执行。'
  return `高优先级任务在第 ${hStart.value} tick 变为就绪，**立刻抢占**了正在运行的任务——RTOS 的抢占式调度保证：只要更高优先级任务就绪，它就马上得到 CPU，不用等当前任务跑完。这正是裸机 super-loop 做不到的。`
})

// 优先级反转：低优先级持锁 → 高优先级等锁 → 中优先级趁机插队
const inversionSegs = computed<Seg[]>(() => [
  { from: 0, to: 2, key: 'L' },
  { from: 2, to: 3, key: 'LOCK' },
  { from: 3, to: 5, key: 'HB' },
  { from: 5, to: 9, key: 'M' },
  { from: 9, to: 11, key: 'L' },
  { from: 11, to: 14, key: 'H' },
  { from: 14, to: 16, key: 'IDLE' }
])
const inheritSegs = computed<Seg[]>(() => [
  { from: 0, to: 2, key: 'L' },
  { from: 2, to: 3, key: 'LOCK' },
  { from: 3, to: 5, key: 'HB' },
  { from: 5, to: 7, key: 'LI' },
  { from: 7, to: 10, key: 'H' },
  { from: 10, to: 16, key: 'IDLE' }
])

const LABEL: Record<string, string> = {
  H: '高',
  M: '中',
  L: '低',
  HB: '高·等锁',
  LOCK: '低·持锁',
  LI: '低·继承高优先级',
  IDLE: '空闲'
}
const legend = computed(() =>
  scene.value === 'preempt'
    ? [
        { key: 'H', text: '高优先级任务' },
        { key: 'M', text: '中优先级任务' },
        { key: 'L', text: '低优先级任务' },
        { key: 'IDLE', text: '空闲任务' }
      ]
    : [
        { key: 'L', text: '低优先级（持锁）' },
        { key: 'HB', text: '高优先级（阻塞等锁）' },
        { key: 'M', text: '中优先级（插队）' },
        { key: 'LI', text: '低优先级（优先级继承）' },
        { key: 'IDLE', text: '空闲' }
      ]
)
const activeSegs = computed(() => (scene.value === 'preempt' ? segments.value : inversionSegs.value))
</script>

<template>
  <div class="rs">
    <Seg
      v-model="scene"
      :options="[
        { value: 'preempt', label: '抢占式调度' },
        { value: 'inversion', label: '优先级反转' }
      ]"
      label="场景"
    />

    <template v-if="scene === 'preempt'">
      <div class="rs-cfg">
        <Ctrl v-model="hStart" label="高优先级就绪时刻" unit="tick" :min="0" :max="8" :step="1" />
        <Ctrl v-model="hWork" label="高优先级工作量" unit="tick" :min="1" :max="6" :step="1" />
        <Ctrl v-model="mWork" label="中优先级工作量" unit="tick" :min="0" :max="6" :step="1" />
        <Ctrl v-model="lWork" label="低优先级工作量" unit="tick" :min="0" :max="6" :step="1" />
      </div>
      <p class="rs-note">{{ preemptNote }}</p>
    </template>

    <template v-else>
      <p class="rs-note">
        <b>优先级反转</b>：低优先级任务 L 先拿到互斥锁；高优先级任务 H 随后就绪并抢占，但它也需要那把锁，
        于是<b>阻塞等待</b>；这时中优先级任务 M 就绪——它的优先级高于正在持锁的 L，于是 M 抢占 L 开始运行。
        结果：<b>高优先级的 H 反而被中优先级的 M 间接挡住了</b>，而且挡多久取决于 M 跑多久，实时性完全失控。
      </p>
    </template>

    <div class="rs-block">
      <span class="rs-bk">{{ scene === 'preempt' ? '抢占式调度时间线' : '优先级反转：未使用优先级继承' }}</span>
      <div class="rs-tl">
        <div
          v-for="(s, i) in activeSegs"
          :key="i"
          class="rs-seg"
          :class="'rs-' + s.key"
          :style="{ flexGrow: s.to - s.from }"
        >
          {{ LABEL[s.key] }}
        </div>
      </div>
      <div class="rs-axis">
        <span v-for="t in MAX_T + 1" :key="t">{{ t - 1 }}</span>
      </div>
    </div>

    <div v-if="scene === 'inversion'" class="rs-block rs-fix">
      <span class="rs-bk">修复后：互斥量启用优先级继承</span>
      <div class="rs-tl">
        <div
          v-for="(s, i) in inheritSegs"
          :key="i"
          class="rs-seg"
          :class="'rs-' + s.key"
          :style="{ flexGrow: s.to - s.from }"
        >
          {{ LABEL[s.key] }}
        </div>
      </div>
      <div class="rs-axis">
        <span v-for="t in MAX_T + 1" :key="t">{{ t - 1 }}</span>
      </div>
      <p class="rs-fixnote">
        FreeRTOS 的<b>互斥量（mutex）自带优先级继承</b>：高优先级任务等锁时，持锁的低优先级任务会
        <b>临时提升到等待者的优先级</b>，于是中优先级任务无法再插队，L 能尽快跑完并释放锁，H 随即拿到锁运行。
        <b>注意</b>：二值信号量（binary semaphore）<b>没有</b>优先级继承，保护共享资源时应当用互斥量而不是二值信号量。
      </p>
    </div>

    <div class="rs-legend">
      <span v-for="l in legend" :key="l.key" class="rs-lg">
        <i :class="'rs-sw rs-' + l.key"></i>{{ l.text }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.rs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rs-cfg {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.rs-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rs-bk {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.rs-tl {
  display: flex;
  gap: 2px;
  height: 34px;
}
.rs-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  font-size: 11px;
  border-radius: 4px;
  color: #fff;
  background: var(--vp-c-text-3);
  overflow: hidden;
  white-space: nowrap;
}
.rs-H {
  background: var(--vp-c-danger-1, #dc2626);
}
.rs-M {
  background: #f59e0b;
}
.rs-L {
  background: var(--vp-c-brand-1);
}
.rs-HB {
  background: repeating-linear-gradient(45deg, #dc2626, #dc2626 6px, rgba(220, 38, 38, 0.55) 6px, rgba(220, 38, 38, 0.55) 12px);
}
.rs-LOCK {
  background: #1d4ed8;
}
.rs-LI {
  background: #7c3aed;
}
.rs-IDLE {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border: 1px dashed var(--vp-c-divider);
}
.rs-axis {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}
.rs-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 6px;
  padding: 8px 10px;
}
.rs-note b {
  color: var(--vp-c-text-2);
}
.rs-fix {
  padding-top: 4px;
  border-top: 1px dashed var(--vp-c-divider);
}
.rs-fixnote {
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.rs-fixnote b {
  color: var(--vp-c-text-2);
}
.rs-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.rs-lg {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.rs-sw {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}
</style>
