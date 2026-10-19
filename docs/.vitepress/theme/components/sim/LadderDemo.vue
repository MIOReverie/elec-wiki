<script setup lang="ts">
/**
 * PLC 梯形图交互演示
 *
 *   latch  —— 启保停：Q0.0 = (I0.0 ∨ Q0.0) ∧ I0.1
 *   reverse—— 正反转互锁：两条支路互相串入对方常闭触点
 *
 * 关键设计：**按扫描周期推进**，不是即时响应。
 *   ① 输入采样 → ② 执行程序（算出下一态）→ ③ 输出刷新（此刻输出才变）
 * 点一下输入触点，要等下一个周期的采样才被"看见"——响应延迟就是这么来的。
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { wire, dot, txt, svg } from '../../lib/schematic'

const props = defineProps<{ mode?: 'latch' | 'reverse' }>()
const mode = ref<'latch' | 'reverse'>(props.mode ?? 'latch')

/* ---------------- 位状态 ---------------- */
// 输入位（点击切换）；I0.1 是常闭停止输入，true = 未按下
const I = ref({ i0: false, i1: true, i2: false, i3: false })
const sampled = ref({ ...I.value }) // 输入映像寄存器（采样结果）
const Q = ref({ q0: false, q1: false }) // 输出映像（已刷新的值）
const next = ref({ q0: false, q1: false }) // 本周期执行结果（未刷新）

/* ---------------- 扫描周期 ---------------- */
const phase = ref(0) // 0 采样 / 1 执行 / 2 刷新
const running = ref(true)
let timer: number | undefined

function step() {
  if (phase.value === 0) {
    sampled.value = { ...I.value } // ① 输入采样
    phase.value = 1
  } else if (phase.value === 1) {
    // ② 执行程序：按梯形图逻辑算下一态（先不输出）
    const s = sampled.value
    const q = Q.value
    if (mode.value === 'latch') {
      next.value.q0 = (s.i0 || q.q0) && s.i1
    } else {
      next.value.q0 = (s.i2 || q.q0) && s.i1 && !q.q1
      next.value.q1 = (s.i3 || q.q1) && s.i1 && !q.q0
    }
    phase.value = 2
  } else {
    Q.value = { ...next.value } // ③ 输出刷新
    phase.value = 0
  }
}
function start() {
  stop()
  running.value = true
  timer = window.setInterval(step, 260)
}
function stop() {
  running.value = false
  if (timer) window.clearInterval(timer)
  timer = undefined
}
function toggleBit(k: 'i0' | 'i1' | 'i2' | 'i3') {
  I.value[k] = !I.value[k]
}
function reset() {
  I.value = { i0: false, i1: true, i2: false, i3: false }
  Q.value = { q0: false, q1: false }
  next.value = { q0: false, q1: false }
  sampled.value = { ...I.value }
}
function onHit(e: MouseEvent) {
  const k = (e.target as HTMLElement).dataset?.bit
  if (k === 'i0' || k === 'i1' || k === 'i2' || k === 'i3') toggleBit(k)
}

onMounted(start)
onUnmounted(stop)

const phaseName = computed(() => ['① 输入采样', '② 执行程序', '③ 输出刷新'][phase.value])
const statusText = computed(() => {
  if (mode.value === 'latch') {
    return Q.value.q0 ? 'Q0.0 = 1 → 接通（I0.0 松手后仍保持，靠 Q0.0 自己的常开触点）' : 'Q0.0 = 0 → 断开'
  }
  if (Q.value.q1) return 'Q0.1 = 1 → 反转运行（互锁触点已把正转支路切断）'
  if (Q.value.q0) return 'Q0.0 = 1 → 正转运行'
  return '停机 —— 点 I0.2 或 I0.3'
})

/* ---------------- 画梯形图 ---------------- */
const LB = 60 // 左母线
const RB = 580 // 右母线

/** 常开触点 | | —— live = 该位为 1（导通） */
function no(x: number, y: number, live: boolean, label: string): string {
  const c = live ? ' stroke="var(--vp-c-brand-1)" stroke-width="2.6"' : ''
  return (
    wire(x - 22, y, x - 5, y) +
    `<line x1="${x - 5}" y1="${y - 10}" x2="${x - 5}" y2="${y + 10}"${c}/>` +
    `<line x1="${x + 5}" y1="${y - 10}" x2="${x + 5}" y2="${y + 10}"${c}/>` +
    wire(x + 5, y, x + 22, y) +
    txt(x, y - 18, label, { size: 11, color: live ? 'var(--vp-c-brand-1)' : undefined })
  )
}
/** 常闭触点 |/| —— live = 该位为 0（导通） */
function nc(x: number, y: number, live: boolean, label: string): string {
  const c = live ? ' stroke="var(--vp-c-brand-1)" stroke-width="2.6"' : ''
  return (
    wire(x - 22, y, x - 5, y) +
    `<line x1="${x - 5}" y1="${y - 10}" x2="${x - 5}" y2="${y + 10}"${c}/>` +
    `<line x1="${x + 5}" y1="${y - 10}" x2="${x + 5}" y2="${y + 10}"${c}/>` +
    `<line x1="${x - 8}" y1="${y + 9}" x2="${x + 8}" y2="${y - 9}"${live ? ' stroke="var(--vp-c-brand-1)" stroke-width="2.2"' : ''}/>` +
    wire(x + 5, y, x + 22, y) +
    txt(x, y - 18, label, { size: 11, color: live ? 'var(--vp-c-brand-1)' : undefined })
  )
}
/** 线圈 ( ) —— live = 该输出为 1 */
function coilSym(x: number, y: number, live: boolean, label: string): string {
  const c = live ? ' stroke="var(--vp-c-brand-1)" stroke-width="2.6"' : ''
  return (
    wire(x - 24, y, x - 11, y) +
    `<path d="M${x - 11} ${y - 11} a11 11 0 0 1 0 22" fill="none"${c}/>` +
    `<path d="M${x + 11} ${y - 11} a11 11 0 0 0 0 22" fill="none"${c}/>` +
    wire(x + 11, y, x + 24, y) +
    txt(x, y + 26, label, { size: 11.5, weight: 600, color: live ? 'var(--vp-c-brand-1)' : undefined })
  )
}
/** 可点击热区 */
function hot(x: number, y: number, k: string): string {
  return `<rect data-bit="${k}" x="${x - 24}" y="${y - 22}" width="48" height="44" fill="transparent" style="cursor:pointer"/>`
}
/** 线段（通电时叠加流动虚线） */
function flow(x1: number, y1: number, x2: number, y2: number, on: boolean): string {
  return wire(x1, y1, x2, y2) + (on ? `<line class="ld-flow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` : '')
}

type Seg =
  | { t: 'no'; bit: 'i0' | 'i2' | 'i3'; label: string; live: boolean }
  | { t: 'nc'; bit: 'i1' | 'q0' | 'q1'; label: string; live: boolean }
  | { t: 'coil'; label: string; live: boolean }

/**
 * 一条支路：左母线 → [起动按钮 ∥ 自锁触点] → 其余元件 → 线圈 → 右母线
 * 自锁触点画在上方的并联支路里，**只跨接起动按钮两端**（不能把停止触点也绕过去）。
 */
function rung(y: number, segs: Seg[], aux: { label: string; live: boolean } | null): string {
  let s = ''
  const on = segs.some(g => g.t === 'coil' && g.live)
  let cx = LB + 16
  s += dot(LB, y)

  // 第一段：起动按钮 + 自锁并联支路
  const first = segs[0]
  if (first.t === 'no') {
    const bx = cx + 27
    s += flow(cx, y, bx - 22, y, on)
    s += no(bx, y, first.live, first.label)
    s += hot(bx, y, first.bit)
    if (aux) {
      const ay = y - 38
      s += wire(cx, y, cx, ay) + wire(cx, ay, cx + 54, ay)
      s += no(bx, ay, aux.live, aux.label)
      s += wire(cx + 54, ay, cx + 54, y)
    }
    cx += 54
  }

  // 其余段
  for (const g of segs.slice(1)) {
    if (g.t === 'no') {
      s += flow(cx, y, cx + 22, y, on)
      s += no(cx + 27, y, g.live, g.label)
      s += hot(cx + 27, y, g.bit)
      cx += 54
    } else if (g.t === 'nc') {
      s += flow(cx, y, cx + 22, y, on)
      s += nc(cx + 27, y, g.live, g.label)
      if (g.bit === 'i1') s += hot(cx + 27, y, g.bit)
      cx += 54
    } else {
      s += flow(cx, y, cx + 24, y, on)
      s += coilSym(cx + 35, y, g.live, g.label)
      cx += 59
    }
  }
  s += flow(cx, y, RB, y, on)
  s += dot(RB, y)
  return s
}

const out = computed(() => {
  const s = sampled.value
  const q = Q.value
  const yTop = 36
  const yBot = mode.value === 'latch' ? 150 : 210
  let body = wire(LB, yTop, LB, yBot) + wire(RB, yTop, RB, yBot)

  if (mode.value === 'latch') {
    body += rung(
      100,
      [
        { t: 'no', bit: 'i0', label: 'I0.0 起动', live: s.i0 },
        { t: 'nc', bit: 'i1', label: 'I0.1 停止', live: !s.i1 },
        { t: 'coil', label: 'Q0.0', live: q.q0 }
      ],
      { label: 'Q0.0 自锁', live: q.q0 }
    )
  } else {
    body += rung(
      100,
      [
        { t: 'no', bit: 'i2', label: 'I0.2 正转', live: s.i2 },
        { t: 'nc', bit: 'i1', label: 'I0.1 停止', live: !s.i1 },
        { t: 'nc', bit: 'q1', label: 'Q0.1 互锁', live: !q.q1 },
        { t: 'coil', label: 'Q0.0 正转', live: q.q0 }
      ],
      { label: 'Q0.0 自锁', live: q.q0 }
    )
    body += rung(
      180,
      [
        { t: 'no', bit: 'i3', label: 'I0.3 反转', live: s.i3 },
        { t: 'nc', bit: 'i1', label: 'I0.1 停止', live: !s.i1 },
        { t: 'nc', bit: 'q0', label: 'Q0.0 互锁', live: !q.q0 },
        { t: 'coil', label: 'Q0.1 反转', live: q.q1 }
      ],
      { label: 'Q0.1 自锁', live: q.q1 }
    )
  }

  // 扫描周期指示条
  const sy = mode.value === 'latch' ? 196 : 256
  const names = ['① 输入采样', '② 执行程序', '③ 输出刷新']
  names.forEach((n, i) => {
    const bx = 120 + i * 130
    const act = phase.value === i
    body +=
      `<rect x="${bx}" y="${sy - 15}" width="110" height="30" rx="5" ` +
      `fill="${act ? 'var(--vp-c-brand-1)' : 'var(--vp-c-bg-soft)'}" fill-opacity="${act ? 0.18 : 1}" ` +
      `stroke="${act ? 'var(--vp-c-brand-1)' : 'var(--vp-c-divider)'}"/>` +
      txt(bx + 55, sy, n, { size: 11, color: act ? 'var(--vp-c-brand-1)' : 'var(--vp-c-text-3)' })
    if (i < 2) body += txt(bx + 120, sy, '→', { size: 12, color: 'var(--vp-c-text-3)' })
  })
  return svg(640, sy + 40, body, 'ld')
})
</script>

<template>
  <div class="ld">
    <div class="ld-toolbar">
      <button :class="{ on: mode === 'latch' }" @click="mode = 'latch'; reset()">启保停</button>
      <button :class="{ on: mode === 'reverse' }" @click="mode = 'reverse'; reset()">正反转互锁</button>
      <span class="ld-phase">当前阶段：{{ phaseName }}</span>
      <span class="ld-acts">
        <button v-if="!running" @click="start">继续扫描</button>
        <button v-else @click="stop">暂停扫描</button>
        <button @click="reset">全清</button>
      </span>
    </div>
    <div class="ld-svg" v-html="out" @click="onHit" />
    <p class="ld-hint">
      点击梯形图里的输入触点（I0.0 / I0.1 / I0.2 / I0.3）切换通断 —— 它不会立刻生效：要等下一个扫描周期的「输入采样」才被读入，输出更要等到「输出刷新」才改变。
      当前：{{ statusText }}
    </p>
  </div>
</template>

<style scoped>
.ld-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12.5px;
}
.ld-toolbar button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  padding: 3px 10px;
  cursor: pointer;
  font-size: 12.5px;
}
.ld-toolbar button.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.ld-phase {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.ld-acts {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.ld-svg {
  line-height: 0;
}
.ld-svg :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}
.ld-hint {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}
.ld-svg :deep(.ld-flow) {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.6;
  stroke-dasharray: 7 6;
  animation: ld-dash 0.5s linear infinite;
}
@keyframes ld-dash {
  to {
    stroke-dashoffset: -13;
  }
}
</style>
