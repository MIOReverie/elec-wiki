<script setup lang="ts">
/**
 * 继电接触器控制电路交互演示
 *
 *   start   —— 起保停（自锁）：SB2 点一下就够，靠 KM 常开辅助触点把线圈回路锁住
 *   reverse —— 正反转（互锁）：KM1 / KM2 两组主触点并联，KM2 组把 L1、L2 换接；
 *              两个线圈回路互相串入对方常闭触点，从原理上杜绝相间短路
 *
 * 交互：直接点图里的按钮（透明热区 + 事件委托），或用上方控制面板。
 * 状态机按真实回路推：线圈得电 ⇔ 所在回路闭合；松开 SB2 靠自锁触点保持；
 * SB1（停止）与 FR（过载）优先级最高，一动作立即切断全部线圈。
 */
import { computed, onUnmounted, ref } from 'vue'
import { wire, dot, node, txt, rect, sw, fuse, svg } from '../../lib/schematic'

const props = defineProps<{ mode?: 'start' | 'reverse' }>()
const mode = ref<'start' | 'reverse'>(props.mode ?? 'start')

/* ---------------- 状态 ---------------- */
const sb2 = ref(false) // 起动 / 正转（常开，点按）
const sb3 = ref(false) // 反转（常开，点按）
const sb1 = ref(false) // 停止（常闭，按下 = 断开）
const tripped = ref(false) // FR 过载动作
const km1 = ref(false)
const km2 = ref(false)

// 按钮回弹定时器：组件卸载时统一清理，避免销毁后仍写 ref
const timers: number[] = []
onUnmounted(() => {
  for (const id of timers) clearTimeout(id)
  timers.length = 0
})

function hit(e: MouseEvent) {
  const t = (e.target as HTMLElement).dataset?.act
  if (t === 'sb2') press('sb2')
  else if (t === 'sb3') press('sb3')
  else if (t === 'sb1') press('sb1')
}
function press(which: 'sb1' | 'sb2' | 'sb3') {
  if (which === 'sb1') sb1.value = true
  if (which === 'sb2') sb2.value = true
  if (which === 'sb3') sb3.value = true
  settle()
  timers.push(
    window.setTimeout(() => {
      if (which === 'sb1') sb1.value = false
      if (which === 'sb2') sb2.value = false
      if (which === 'sb3') sb3.value = false
    }, 380)
  )
}
function trip() {
  if (!running.value) return
  tripped.value = true
  settle()
}
function reset() {
  tripped.value = false
  settle()
}
function clear() {
  km1.value = km2.value = false
  sb2.value = sb3.value = sb1.value = false
  tripped.value = false
}

/** 按真实回路逻辑重算两个线圈（互锁在状态机里保证，图上体现为对方常闭触点） */
function settle() {
  if (tripped.value || sb1.value) {
    km1.value = false
    km2.value = false
    return
  }
  if (mode.value === 'start') {
    if (sb2.value) km1.value = true
  } else {
    if (sb2.value) {
      km1.value = true
      km2.value = false
    }
    if (sb3.value) {
      km2.value = true
      km1.value = false
    }
  }
}

const running = computed(() => (km1.value || km2.value) && !tripped.value)
const status = computed(() => {
  if (tripped.value) return 'FR 已动作（过载保护）—— 回路被切断，须手动复位才能再起动'
  if (km2.value) return 'KM2 得电 → L1、L2 已换接 → 电机反转'
  if (km1.value) return mode.value === 'start' ? 'KM 得电并自锁 → 电机连续运行（SB2 早就松开了）' : 'KM1 得电 → 电机正转'
  return '停机 —— 点一下 SB2 起动'
})

/* ---------------- 画图基元 ---------------- */
const W = 640
const PH = [150, 300, 450] // 三相火线 x
const MOTOR = { x: 300, y: 318, r: 28 }

/** 带电线段：底线 + 流动虚线覆盖层 */
function seg2(x1: number, y1: number, x2: number, y2: number, on: boolean): string {
  return wire(x1, y1, x2, y2) + (on ? `<line class="rc-flow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` : '')
}
const vseg = (x: number, y1: number, y2: number, on: boolean) => seg2(x, y1, x, y2, on)
/** 带跳线弧的水平线（跨越不通的竖直走线时用） */
function hopWire(x1: number, y: number, x2: number, hops: number[]): string {
  const r = 5
  let d = `M${x1} ${y}`
  for (const hx of [...hops].sort((a, b) => a - b)) d += ` L${hx - r} ${y} A${r} ${r} 0 0 1 ${hx + r} ${y}`
  return `<path d="${d} L${x2} ${y}" fill="none"/>`
}
function hot(x: number, y: number, act: string, w = 46, h = 48): string {
  return `<rect data-act="${act}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="transparent" style="cursor:pointer"/>`
}
/** 按钮：closed = 当前是否导通；nc = 常闭型；帽形 flat/mush */
function pushBtn(x: number, y: number, closed: boolean, nc: boolean, cap: 'flat' | 'mush'): string {
  const blade = closed ? wire(-8, 0, 8, 0) : nc ? wire(-8, 0, 0, 12) + wire(0, 12, 8, 0) : wire(-8, 0, 0, -12) + wire(0, -12, 8, 0)
  const apex = closed ? 0 : nc ? 12 : -12
  const cw = cap === 'mush' ? 9 : 6
  return (
    `<g transform="translate(${x} ${y})">${node(-8, 0)}${node(8, 0)}${blade}` +
    wire(0, apex, 0, -22) +
    `<line x1="${-cw}" y1="-22" x2="${cw}" y2="-22" stroke-width="2.4"/></g>`
  )
}
/** 接触器常开触点 */
function cont(x: number, y: number, closed: boolean): string {
  return `<g transform="translate(${x} ${y})">${node(-8, 0)}${node(8, 0)}${closed ? wire(-8, 0, 8, 0) : wire(-8, 0, 8, -13)}</g>`
}
/** 热继电器常闭触点（开关 + 左下热元件小方块） */
function frContact(x: number, y: number, closed: boolean): string {
  return (
    `<g transform="translate(${x} ${y})">${node(-8, 0)}${node(8, 0)}` +
    (closed ? wire(-8, 0, 8, 0) : wire(-8, 0, 8, -13)) +
    rect(-16, 6, 9, 9, 1.5) + '</g>'
  )
}
/** 线圈（矩形框，得电时填充） */
function coil(x: number, y: number, name: string, on: boolean): string {
  return (
    `<rect x="${x - 20}" y="${y - 12}" width="40" height="24" rx="2" fill="${on ? 'var(--vp-c-brand-1)' : 'none'}" ` +
    `fill-opacity="${on ? 0.18 : 0}" stroke-width="2"/>` +
    txt(x, y + 1, name, { size: 13, weight: 600 })
  )
}

/* ---------------- 主电路 ---------------- */
function mainCircuit(): string {
  let s = ''
  const on = running.value
  PH.forEach((x, i) => {
    s += txt(x, 26, ['L1', 'L2', 'L3'][i], { size: 12, italic: true, color: 'var(--vp-c-text-2)' })
    s += vseg(x, 34, 56, on)
  })
  // 刀开关 QS（三极联动，虚线连接）
  PH.forEach(x => {
    s += vseg(x, 56, 90, on)
    s += sw(x, 73, { rot: 90, closed: true, half: 17 })
  })
  s += `<line x1="${PH[0]}" y1="62" x2="${PH[2]}" y2="62" stroke-dasharray="4 3" opacity=".6"/>`
  s += txt(PH[0] - 14, 73, 'QS', { size: 12, italic: true, anchor: 'end' })
  // 熔断器
  PH.forEach((x, i) => {
    s += vseg(x, 90, 106, on)
    s += fuse(x, 118, { rot: 90, half: 12 })
    s += vseg(x, 130, 150, on)
    if (i === 0) s += txt(x - 14, 118, 'FU', { size: 12, italic: true, anchor: 'end' })
  })

  if (mode.value === 'start') {
    // 单一路径：KM 主触点
    PH.forEach((x, i) => {
      s += vseg(x, 150, 166, on)
      s += cont(x, 180, km1.value)
      s += vseg(x, 194, 240, on)
      if (i === 0) s += txt(x - 14, 180, 'KM', { size: 12, italic: true, anchor: 'end' })
    })
    s += txt(PH[2] + 18, 180, '主触点', { size: 11, anchor: 'start', color: 'var(--vp-c-text-3)' })
  } else {
    // KM1 / KM2 两组主触点并联；KM2 组把 L1、L2 换接（跳线弧 = 不连接）
    const sub = PH.map(x => x - 30) // KM2 子走线
    // 分流：主火线降到 y=156
    PH.forEach(x => s += vseg(x, 150, 156, on))
    // KM1 支路：直通
    PH.forEach((x, i) => {
      s += vseg(x, 156, 166, on)
      s += cont(x, 180, km1.value)
      s += vseg(x, 194, 240, on)
      if (i === 0) s += txt(x - 14, 180, 'KM1', { size: 12, italic: true, anchor: 'end' })
    })
    // KM2 支路：L1↔L2 换接 + L3 直通
    //   喂给「接 L1 的触点」的是 L2 电源（x=300），喂给「接 L2 的触点」的是 L1 电源（x=150）
    s += hopWire(sub[0], 156, PH[1], [PH[0], sub[1]])
    s += vseg(sub[0], 156, 224, on && km2.value)
    s += vseg(PH[0], 156, 162, on && km2.value)
    s += hopWire(PH[0], 162, sub[1], [])
    s += vseg(sub[1], 162, 224, on && km2.value)
    s += hopWire(sub[2], 156, PH[2], [])
    s += vseg(sub[2], 156, 224, on && km2.value)
    sub.forEach((x, i) => {
      s += cont(x, 212, km2.value)
      if (i === 0) s += txt(x - 14, 212, 'KM2', { size: 12, italic: true, anchor: 'end' })
    })
    // 换相说明放在两组之间的空档（x=150~270 区间在 y=196 处无走线）
    s += txt(210, 196, 'L1 ↔ L2 换接', { size: 10.5, color: 'var(--vp-c-text-3)' })
    // 汇合到主火线
    sub.forEach((x, i) => {
      s += vseg(x, 224, 240, on && km2.value)
      if (x !== PH[i]) s += seg2(x, 240, PH[i], 240, on && km2.value)
      s += dot(PH[i], 240)
    })
  }

  // 热继电器热元件
  PH.forEach((x, i) => {
    s += vseg(x, 240, 246, on)
    s += rect(x - 9, 246, 18, 18, 2)
    s += vseg(x, 264, 276, on)
    if (i === 0) s += txt(x - 14, 255, 'FR', { size: 12, italic: true, anchor: 'end' })
  })
  s += txt(PH[2] + 18, 255, '热元件', { size: 11, anchor: 'start', color: 'var(--vp-c-text-3)' })

  // 电机
  const m = MOTOR
  s += seg2(PH[0], 276, m.x - 18, 276, on) + seg2(m.x - 18, 276, m.x - m.r * 0.72, m.y - m.r * 0.72, on)
  s += vseg(PH[1], 276, m.y - m.r, on)
  s += seg2(PH[2], 276, m.x + 18, 276, on) + seg2(m.x + 18, 276, m.x + m.r * 0.72, m.y - m.r * 0.72, on)
  s += `<circle cx="${m.x}" cy="${m.y}" r="${m.r}" fill="none" stroke-width="2.2"/>`
  s += txt(m.x, m.y - 4, 'M', { size: 17, weight: 600 })
  s += txt(m.x, m.y + 14, '3~', { size: 11, color: 'var(--vp-c-text-2)' })
  if (running.value) {
    s += `<g class="rc-spin"><path d="M${m.x + 12} ${m.y - 15} a16 16 0 0 1 11 4" stroke="var(--vp-c-brand-1)" stroke-width="2"/></g>`
  }
  return s
}

/* ---------------- 控制电路 ---------------- */
const RL = 110
const RR = 530
const Y1 = 402 // 第一条支路
const Y2 = 472 // 第二条支路（仅正反转）

function controlCircuit(): string {
  let s = ''
  const cOn = running.value
  const yBottom = mode.value === 'start' ? 425 : 512
  s += wire(RL, 366, RL, yBottom)
  s += wire(RR, 366, RR, yBottom)
  s += txt(RL, 358, 'L1', { size: 12, italic: true, color: 'var(--vp-c-text-2)' })
  s += txt(RR, 358, 'N', { size: 12, italic: true, color: 'var(--vp-c-text-2)' })
  s += txt(RL, 358, '控制电路（L1—N 220 V）', { size: 11, anchor: 'start', color: 'var(--vp-c-text-3)' })

  // 公共段：FU → FR 常闭 → SB1
  s += dot(RL, Y1)
  s += seg2(RL, Y1, 126, Y1, cOn)
  s += fuse(140, Y1, { half: 12 }) + txt(140, Y1 - 24, 'FU', { size: 11, italic: true })
  s += seg2(154, Y1, 174, Y1, cOn)
  s += frContact(190, Y1, !tripped.value) + txt(190, Y1 - 24, 'FR', { size: 11, italic: true })
  s += seg2(206, Y1, 222, Y1, cOn)
  s += pushBtn(248, Y1, !sb1.value, true, 'mush') + txt(248, Y1 - 30, 'SB1 停止', { size: 11 })
  s += hot(248, Y1, 'sb1')
  s += seg2(264, Y1, 290, Y1, cOn)

  if (mode.value === 'start') {
    s += rung(290, Y1, {
      start: 'sb2',
      startLabel: 'SB2 起动',
      aux: km1.value,
      auxLabel: 'KM 常开（自锁）',
      inter: null,
      coilName: 'KM',
      coilOn: km1.value
    })
  } else {
    s += wire(290, Y1, 290, Y2)
    s += rung(290, Y1, {
      start: 'sb2',
      startLabel: 'SB2 正转',
      aux: km1.value,
      auxLabel: 'KM1 常开',
      inter: { closed: !km2.value, label: 'KM2' },
      coilName: 'KM1',
      coilOn: km1.value
    })
    s += rung(290, Y2, {
      start: 'sb3',
      startLabel: 'SB3 反转',
      aux: km2.value,
      auxLabel: 'KM2 常开',
      inter: { closed: !km1.value, label: 'KM1' },
      coilName: 'KM2',
      coilOn: km2.value
    })
  }
  return s
}

/** 一条支路：节点 → [起动按钮 ∥ 自锁触点] → 互锁常闭 → 线圈 → 右母线 */
function rung(
  x0: number,
  y: number,
  o: {
    start: string
    startLabel: string
    aux: boolean
    auxLabel: string
    inter: { closed: boolean; label: string } | null
    coilName: string
    coilOn: boolean
  }
): string {
  const on = o.coilOn
  const auxY = y === Y1 ? Y1 - 26 : Y2 + 26 // 自锁触点画在支路的另一侧
  const xBtn = 345 // 起动按钮（主干）
  const xAux = 350 // 自锁触点（并联支路上，与按钮上下对齐）
  const xNode = 400 // 按钮之后的节点
  const xInter = 436
  const xCoil = 478
  let s = ''
  s += dot(x0, y)
  // 并联支路：自锁触点跨接在按钮两端
  s += seg2(x0, y, xBtn - 8, y, on)
  s += wire(x0, y, x0, auxY) + wire(x0, auxY, xNode, auxY)
  s += cont(xAux, auxY, o.aux)
  s += txt(xAux, auxY + (auxY < y ? -15 : 16), o.auxLabel, { size: 10.5 })
  s += wire(xNode, auxY, xNode, y)
  // 起动按钮（主干）
  s += pushBtn(xBtn, y, false, false, 'flat')
  s += txt(xBtn, y + (auxY < y ? 26 : -30), o.startLabel, { size: 11 })
  s += hot(xBtn, y, o.start)
  s += seg2(xBtn + 8, y, xNode, y, on)
  s += dot(xNode, y)
  // 互锁常闭触点
  if (o.inter) {
    s += seg2(xNode, y, xInter - 10, y, on)
    s += cont(xInter, y, o.inter.closed)
    s += txt(xInter, y + 24, `${o.inter.label} 常闭`, { size: 10.5, color: 'var(--vp-c-text-3)' })
    s += seg2(xInter + 10, y, xCoil - 20, y, on)
  } else {
    s += seg2(xNode, y, xCoil - 20, y, on)
  }
  // 线圈 → 右母线
  s += coil(xCoil, y, o.coilName, o.coilOn)
  s += seg2(xCoil + 20, y, RR, y, on)
  s += dot(RR, y)
  return s
}

const out = computed(() => svg(W, mode.value === 'start' ? 445 : 530, mainCircuit() + controlCircuit(), 'rc'))
</script>

<template>
  <div class="rc">
    <div class="rc-toolbar">
      <button :class="{ on: mode === 'start' }" @click="mode = 'start'; clear()">起保停（自锁）</button>
      <button :class="{ on: mode === 'reverse' }" @click="mode = 'reverse'; clear()">正反转（互锁）</button>
      <span class="rc-status" :class="{ live: running }">{{ status }}</span>
      <span class="rc-acts">
        <button :disabled="!running || tripped" @click="trip">模拟过载（FR 动作）</button>
        <button :disabled="!tripped" @click="reset">FR 复位</button>
      </span>
    </div>
    <div class="rc-svg" v-html="out" @click="hit" />
    <p class="rc-hint">直接点图里的 SB1 / SB2 / SB3 —— 按钮、触点、线圈、电流流向全部联动。SB2 松开后电路仍导通，那就是自锁。</p>
  </div>
</template>

<style scoped>
.rc-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12.5px;
}
.rc-toolbar button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  padding: 3px 10px;
  cursor: pointer;
  font-size: 12.5px;
}
.rc-toolbar button.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.rc-toolbar button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.rc-status {
  color: var(--vp-c-text-3);
}
.rc-status.live {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.rc-acts {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.rc-svg {
  line-height: 0;
}
.rc-svg :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}
.rc-hint {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
/* 电流流动 */
.rc-svg :deep(.rc-flow) {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.4;
  stroke-dasharray: 8 7;
  animation: rc-dash 0.55s linear infinite;
}
@keyframes rc-dash {
  to {
    stroke-dashoffset: -15;
  }
}
/* 电机旋转标记 */
.rc-svg :deep(.rc-spin) {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: rc-spin 1.1s linear infinite;
}
@keyframes rc-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
