<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Ctrl from '../Ctrl.vue'
import { ensureThemeWatch, themeRev } from '../../lib/canvas'

/**
 * 舵机控制演示：50 Hz PWM + 脉宽滑块 ↔ 角度联动
 *
 * 三块画布：
 *  1. 脉冲波形：固定 20 ms 周期，脉宽 0.5~2.5 ms 横向放大 50 倍画出来（否则只占 2.5%~12.5% 宽度，看不见）
 *  2. 到位时间轴：脉宽阶跃后，舵机从当前角度按最大转速逼近目标，直到进入死区
 *  3. 角度刻度盘：−90…+90，直观看到 1.5 ms = 中位
 *
 * 约定：角度 = (脉宽 − 1500 µs) / 10 µs，即全程 2000 µs 对应 180°。
 * SSR 安全：所有 window / canvas / rAF 访问都在 onMounted 之后。
 */
const pulseUs = ref(1500) // 脉宽 µs，0.5~2.5 ms
const angle = computed(() => (pulseUs.value - 1500) / 10) // −90…+90
const duty = computed(() => (pulseUs.value / 20000) * 100) // %

const periodMs = 20 // 50 Hz
const PULSE_MAX = 2500

// 脉宽占空比在整周期的比例（用于「小横条」示意），以及波形区的放大倍数说明
const zoomPct = computed(() => (pulseUs.value / 20000) * 100)
const ZOOM_X = 8 // 下方波形把前 2.5 ms 单独放大画：20 ms / 2.5 ms = 8 倍

function setAngle(a: number) {
  pulseUs.value = Math.round(1500 + a * 10)
}
function setPulse(us: number) {
  pulseUs.value = Math.min(2500, Math.max(500, Math.round(us)))
}

/* ---------- 画布 1：脉冲波形 ---------- */
const waveEl = ref<HTMLCanvasElement | null>(null)
/* ---------- 画布 2：到位时间轴 ---------- */
const slewEl = ref<HTMLCanvasElement | null>(null)
/* ---------- 画布 3：角度盘 ---------- */
const dialEl = ref<HTMLCanvasElement | null>(null)

// 动画状态：显示角度（向目标逼近）、累加的脉宽伪时间（轨迹淡出）
const shownAngle = ref(-90)
const targetAngle = computed(() => angle.value)
const paceTrail = ref(0) // 0…1，当前这次阶跃走完的比例
const startAngle = ref(-90)

let raf = 0
let lastT = 0
let reduceMotion = false
let ro: ResizeObserver | null = null

/** 取色缓存（--vp-c-* 的值只在主题切换时失效） */
const varCache = new Map<string, string>()

function cssVar(name: string, fallback: string): string {
  // 取色缓存：主题切换前不必每帧都做 getComputedStyle（原来每帧 13~15 次强制样式重算）
  const hit = varCache.get(name)
  if (hit !== undefined) return hit
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  varCache.set(name, v)
  return v
}

interface Ctx {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
}

function setupCanvas(el: HTMLCanvasElement | null): Ctx | null {
  if (!el) return null
  // 宽度为 0 说明布局还没稳定（隐藏 / 折叠的容器）：直接跳过，等 ResizeObserver 再来
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h) return null
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
    el.width = Math.round(w * dpr)
    el.height = Math.round(h * dpr)
  }
  const ctx = el.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return { ctx, w, h }
}

function drawAll() {
  drawWave()
  drawSlew()
  drawDial()
}

function drawWave() {
  const c = setupCanvas(waveEl.value)
  if (!c) return
  const { ctx, w, h } = c
  const cBrand = cssVar('--vp-c-brand-1', '#2563eb')
  const cDivider = cssVar('--vp-c-divider', '#e2e2e3')
  const cText = cssVar('--vp-c-text-3', '#5f6368')
  const cText1 = cssVar('--vp-c-text-1', '#1f2328')
  const mono = cssVar('--vp-font-family-mono', 'monospace')

  const padL = 44
  const padR = 14
  const top = 34
  const bot = h - 26
  const plotW = w - padL - padR
  // 放大视图：横轴只画 0–2.5 ms，真实周期还剩 17.5 ms 未画（下方文字说明）
  const WIN_US = PULSE_MAX
  const usToX = (us: number) => padL + (us / WIN_US) * plotW

  // 网格：每 0.5 ms 一条
  ctx.strokeStyle = cDivider
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  for (const us of [0, 500, 1000, 1500, 2000, 2500]) {
    const x = usToX(us)
    ctx.beginPath()
    ctx.moveTo(x, top - 8)
    ctx.lineTo(x, bot + 6)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // 波形：0 → 高 → 低，之后一直低到 2.5 ms 窗口右端（真实周期还剩 17.5 ms 未画）
  const tHigh = Math.min(pulseUs.value, WIN_US)
  ctx.fillStyle = cssVar('--vp-c-brand-soft', 'rgb(37 99 235 / 0.1)')
  ctx.fillRect(padL, top, usToX(tHigh) - padL, bot - top)
  ctx.strokeStyle = cBrand
  ctx.lineWidth = 2.4
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(padL, bot)
  ctx.lineTo(padL, top)
  ctx.lineTo(usToX(tHigh), top)
  ctx.lineTo(usToX(tHigh), bot)
  ctx.lineTo(usToX(WIN_US), bot)
  ctx.stroke()

  // 高电平段填充
  // 图例（顶部）：放大视图 / 脉宽
  ctx.textAlign = 'left'
  ctx.fillStyle = cText1
  ctx.font = `600 12px ${mono}`
  ctx.fillText(`高电平 ${pulseUs.value} µs`, padL, 14)
  ctx.fillStyle = cText
  ctx.font = `11px ${mono}`
  const legend = `50 Hz · 周期 20 ms · 横轴只画前 2.5 ms（放大 ${ZOOM_X} 倍）`
  ctx.fillText(legend, padL, 28)

  // 坐标轴
  ctx.strokeStyle = cText
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padL, top)
  ctx.lineTo(padL, bot)
  ctx.lineTo(w - padR, bot)
  ctx.stroke()
  ctx.fillStyle = cText
  ctx.textAlign = 'right'
  ctx.font = `11px ${mono}`
  ctx.fillText('3.3 V', padL - 6, top + 4)
  ctx.fillText('0 V', padL - 6, bot + 4)
  ctx.textAlign = 'center'
  ctx.fillText('0 ms', padL - 6, bot + 18)
  ctx.fillText('1.5 ms 中位', usToX(1500), bot + 18)
  ctx.fillText('2.5 ms', usToX(WIN_US) - 14, bot + 18)
  ctx.fillText('之后 17.5 ms 保持低电平 →', (usToX(WIN_US) + w - padR) / 2, bot + 18)
}

function drawSlew() {
  const c = setupCanvas(slewEl.value)
  if (!c) return
  const { ctx, w, h } = c
  const cBrand = cssVar('--vp-c-brand-1', '#2563eb')
  const cDivider = cssVar('--vp-c-divider', '#e2e2e3')
  const cText = cssVar('--vp-c-text-3', '#5f6368')
  const mono = cssVar('--vp-font-family-mono', 'monospace')

  const padL = 40
  const padR = 16
  const top = 18
  const bot = h - 26
  const spanMs = 400 // 横轴 0…400 ms
  const plotW = w - padL - padR
  const yOf = (a: number) => top + ((90 - a) / 180) * (bot - top)

  // 横轴基线
  ctx.strokeStyle = cDivider
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padL, yOf(0))
  ctx.lineTo(w - padR, yOf(0))
  ctx.stroke()
  ctx.setLineDash([3, 3])
  for (const a of [-90, 90]) {
    ctx.beginPath()
    ctx.moveTo(padL, yOf(a))
    ctx.lineTo(w - padR, yOf(a))
    ctx.stroke()
  }
  ctx.setLineDash([])

  // 阶跃时刻
  const t0x = padL + plotW * 0.08
  ctx.strokeStyle = cText
  ctx.beginPath()
  ctx.moveTo(t0x, top)
  ctx.lineTo(t0x, bot)
  ctx.stroke()

  // 已走过的轨迹
  const walked = paceTrail.value * plotW
  if (walked > 1) {
    ctx.strokeStyle = cBrand
    ctx.lineWidth = 2.4
    ctx.beginPath()
    ctx.moveTo(t0x, yOf(startAngle.value))
    ctx.lineTo(t0x + walked, yOf(shownAngle.value))
    ctx.stroke()
    ctx.fillStyle = cBrand
    ctx.beginPath()
    ctx.arc(t0x + walked, yOf(shownAngle.value), 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 目标水平线
  ctx.strokeStyle = cBrand
  ctx.globalAlpha = 0.45
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(t0x, yOf(targetAngle.value))
  ctx.lineTo(w - padR, yOf(targetAngle.value))
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  // 轴说明
  ctx.fillStyle = cText
  ctx.font = `11px ${mono}`
  ctx.textAlign = 'right'
  ctx.fillText('+90°', padL - 6, yOf(90) + 4)
  ctx.fillText('0°', padL - 6, yOf(0) + 4)
  ctx.fillText('−90°', padL - 6, yOf(-90) + 4)
  ctx.textAlign = 'center'
  ctx.fillText('阶跃', t0x, bot + 18)
  ctx.fillText(`${spanMs} ms`, w - padR, bot + 18)
}

function drawDial() {
  const c = setupCanvas(dialEl.value)
  if (!c) return
  const { ctx, w, h } = c
  const cBrand = cssVar('--vp-c-brand-1', '#2563eb')
  const cDivider = cssVar('--vp-c-divider', '#e2e2e3')
  const cText = cssVar('--vp-c-text-3', '#5f6368')
  const cText1 = cssVar('--vp-c-text-1', '#1f2328')
  const mono = cssVar('--vp-font-family-mono', 'monospace')

  const cx = w / 2
  const cy = h - 16
  const r = Math.min(w / 2 - 30, h - 40)

  // 刻度：−90…+90，屏幕上 −90 在左
  for (let a = -90; a <= 90; a += 30) {
    const rad = ((a - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(rad)
    const y1 = cy + r * Math.sin(rad)
    const x2 = cx + (r - 9) * Math.cos(rad)
    const y2 = cy + (r - 9) * Math.sin(rad)
    ctx.strokeStyle = cDivider
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.fillStyle = cText
    ctx.font = `11px ${mono}`
    ctx.textAlign = 'center'
    ctx.fillText(`${a}`, cx + (r + 14) * Math.cos(rad), cy + (r + 14) * Math.sin(rad) + 4)
  }

  // 中位 0°：红色虚线
  const zeroRad = -Math.PI / 2
  ctx.strokeStyle = '#d5303e'
  ctx.setLineDash([4, 3])
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + r * Math.cos(zeroRad), cy + r * Math.sin(zeroRad))
  ctx.stroke()
  ctx.setLineDash([])

  // 当前角度指针
  const rad = ((shownAngle.value - 90) * Math.PI) / 180
  ctx.strokeStyle = cBrand
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad))
  ctx.stroke()
  ctx.fillStyle = cBrand
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = cText1
  ctx.font = `600 13px ${mono}`
  ctx.textAlign = 'left'
  ctx.fillText(`${shownAngle.value.toFixed(1)}°`, 8, 18)
}

// 动画：让显示角度以有限转速追上目标（真实舵机约 0.1~0.2 s / 60°）
const SLEW_DEG_PER_S = 300 // 60° 约 0.2 s
let prevTarget = -90

function tick(t: number) {
  if (!lastT) lastT = t
  const dt = Math.min(64, t - lastT) // 切后台回来时不要跳一大步
  lastT = t

  const tg = targetAngle.value
  if (tg !== prevTarget) {
    prevTarget = tg
    startAngle.value = shownAngle.value
    paceTrail.value = 0
  }
  const diff = tg - shownAngle.value
  const step = (SLEW_DEG_PER_S * dt) / 1000
  if (Math.abs(diff) <= step) {
    shownAngle.value = tg
  } else {
    shownAngle.value += Math.sign(diff) * step
  }
  // 轨迹进度：按走过的角度占总差的比例，最多铺满
  const total = Math.abs(tg - startAngle.value)
  if (total < 0.01) {
    paceTrail.value = 1
  } else {
    const done = Math.abs(shownAngle.value - startAngle.value) / total
    paceTrail.value = Math.min(1, 0.08 + done * 0.92)
  }

  drawAll()
  raf = requestAnimationFrame(tick)
}

function start() {
  if (reduceMotion) {
    // 减少动态效果：不跑循环，目标变化时直接落到目标
    shownAngle.value = targetAngle.value
    prevTarget = targetAngle.value
    startAngle.value = targetAngle.value
    paceTrail.value = 1
    drawAll()
    return
  }
  stop()
  lastT = 0
  raf = requestAnimationFrame(tick)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

let mq: MediaQueryList | null = null
function onMotionChange(e: MediaQueryListEvent | MediaQueryList) {
  const was = reduceMotion
  reduceMotion = e.matches
  if (reduceMotion !== was) start()
}

onMounted(() => {
  // window 只在挂载后访问（SSR 期间没有 window）
  ensureThemeWatch()
  mq = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  reduceMotion = mq ? mq.matches : false
  mq?.addEventListener?.('change', onMotionChange as (e: MediaQueryListEvent) => void)
  shownAngle.value = targetAngle.value
  prevTarget = targetAngle.value
  startAngle.value = targetAngle.value
  paceTrail.value = 1
  start()
  // 窗口 / 侧边栏尺寸变化后按新尺寸重画（reduce-motion 下没有 rAF 循环，不重画就会被拉伸）
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => drawAll())
    for (const el of [waveEl.value, slewEl.value, dialEl.value]) if (el) ro.observe(el)
  }
})

onUnmounted(() => {
  stop()
  ro?.disconnect()
  ro = null
  mq?.removeEventListener?.('change', onMotionChange as (e: MediaQueryListEvent) => void)
  mq = null
})

const yank = computed(() => pulseUs.value - 1500)

// 减少动态效果时，滑块一动就重画（不依赖 rAF 循环）
watch(pulseUs, () => {
  if (reduceMotion) start()
})

// 深浅色切换：取色缓存失效后整组重画一遍
watch(themeRev, () => {
  varCache.clear()
  drawAll()
})
</script>

<template>
  <div class="sv">
    <div class="sv-ctrl">
      <Ctrl v-model="pulseUs" label="脉宽" unit="µs" :min="500" :max="2500" :step="10" :fixed="0" />
      <div class="sv-quick">
        <button type="button" @click="setPulse(500)">0.5 ms</button>
        <button type="button" @click="setPulse(1000)">1.0 ms</button>
        <button type="button" class="sv-mid" @click="setPulse(1500)">1.5 ms 中位</button>
        <button type="button" @click="setPulse(2000)">2.0 ms</button>
        <button type="button" @click="setPulse(2500)">2.5 ms</button>
      </div>
      <Ctrl
        :model-value="Math.round(angle)"
        @update:model-value="setAngle"
        label="角度"
        unit="°"
        :min="-90"
        :max="90"
        :step="1"
        :fixed="0"
      />
    </div>

    <div class="sv-read">
      <span>脉宽 <b>{{ pulseUs }} µs</b></span>
      <span>角度 <b>{{ angle.toFixed(1) }}°</b></span>
      <span>占空比 <b>{{ duty.toFixed(2) }}%</b></span>
      <span class="sv-dim">偏差 {{ yank > 0 ? '+' : '' }}{{ yank }} µs（相对 1.5 ms）</span>
    </div>

    <div class="sv-zoom">
      <div class="sv-zoom-b">
        <span class="sv-bar" :style="{ width: zoomPct + '%' }"></span>
      </div>
      <span class="sv-zoom-t"
        >脉宽只占 20 ms 周期的 {{ duty.toFixed(1) }}%（上面这条小横条）。下面波形把 0–2.5 ms 单独画出来，横向放大约
        {{ ZOOM_X }} 倍，才看得清脉宽在变。</span
      >
    </div>

    <canvas
      ref="waveEl"
      class="sv-canvas sv-canvas-wave"
      role="img"
      aria-label="50 Hz 舵机 PWM 波形：20 ms 周期内的高电平脉冲，宽度由滑块决定，1.5 ms 为中位"
    ></canvas>

    <canvas
      ref="slewEl"
      class="sv-canvas sv-canvas-slew"
      role="img"
      aria-label="舵机到位时间轴：脉宽阶跃后，转角从起点以有限转速逼近目标角度"
    ></canvas>

    <canvas
      ref="dialEl"
      class="sv-canvas sv-canvas-dial"
      role="img"
      aria-label="舵机角度指示盘：−90 到 +90 度，红色虚线为中位 0 度"
    ></canvas>

    <p class="sv-note">
      角度 = (脉宽 − 1500 µs) ÷ 10 µs。1.5 ms 是中位，多 10 µs 走 1°，全程 0.5–2.5 ms 对应 −90…+90°。
      拖动时注意：<b>占空比只有个位数百分比</b>，舵机读的是脉宽的<b>绝对长度</b>，不是高低电平的比例。
    </p>
  </div>
</template>

<style scoped>
.sv {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sv-ctrl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 4px 14px;
  align-items: center;
}
.sv-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  grid-column: 1 / -1;
  margin: 2px 0 4px;
}
.sv-quick button {
  padding: 3px 9px;
  font-size: 11.5px;
  font-family: inherit;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.sv-quick button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.sv-quick .sv-mid {
  border-color: #d5303e;
  color: #d5303e;
}
.sv-read {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}
.sv-read b {
  color: var(--vp-c-text-1);
}
.sv-dim {
  color: var(--vp-c-text-3);
}
.sv-zoom {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sv-zoom-b {
  height: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}
.sv-bar {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.08s linear;
}
.sv-zoom-t {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.sv-canvas {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.sv-canvas-wave {
  height: 132px;
}
.sv-canvas-slew {
  height: 108px;
}
.sv-canvas-dial {
  height: 150px;
}
.sv-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.sv-note b {
  color: var(--vp-c-text-2);
}
@media (max-width: 560px) {
  .sv-ctrl {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sv-bar {
    transition: none;
  }
}
</style>
