<script setup lang="ts">
import { computed } from 'vue'
import { svg, txt, esc } from '../../lib/schematic'
import { toPath, type Pt } from '../../lib/wave'

interface Series {
  label?: string
  color?: string
  dash?: boolean
  width?: number
  points: Pt[]
  /** 填充到 x 轴 */
  fill?: boolean
}
interface Mark {
  x: number
  label?: string
  color?: string
  dash?: boolean
}
interface Dots {
  x: number
  y: number
  label?: string
  color?: string
  dx?: number
  dy?: number
}

const props = withDefaults(
  defineProps<{
    series: Series[]
    w?: number
    h?: number
    xMin?: number
    xMax?: number
    yMin?: number
    yMax?: number
    xTicks?: number[]
    yTicks?: number[]
    xTickFmt?: (v: number) => string
    yTickFmt?: (v: number) => string
    xLabel?: string
    yLabel?: string
    marks?: Mark[]
    dots?: Dots[]
    /** y=0 处画一条实线 */
    zeroLine?: boolean
    grid?: boolean
    /**
     * 横轴取对数刻度。开启后 series / marks / xTicks 里传入的都应该是**原始值**，
     * 组件内部统一做 log10 —— 这样标记线、曲线、刻度三者永远在同一坐标系里。
     */
    xLog?: boolean
    /** 纵轴取对数刻度（同上，传入原始值，内部统一转换） */
    yLog?: boolean
  }>(),
  {
    w: 640,
    h: 260,
    xMin: 0,
    xMax: 1,
    yMin: -1.2,
    yMax: 1.2,
    grid: true,
    zeroLine: true,
    xLog: false,
    yLog: false
  }
)

const PALETTE = ['#f59e0b', '#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#facc15', '#60a5fa', '#fb7185']

const PAD = { l: 46, r: 16, t: 14, b: 30 }

const out = computed(() => {
  const { w, h } = props
  const pw = w - PAD.l - PAD.r
  const ph = h - PAD.t - PAD.b

  /** 横轴变换：线性或对数。xMin/xMax/series/marks/ticks 都先过这里。 */
  const tx = props.xLog ? (x: number) => Math.log10(Math.max(x, 1e-12)) : (x: number) => x
  const xLo = tx(props.xMin)
  const xHi = tx(props.xMax)

  /** 纵轴变换：线性或对数。yTicks 里给原始值，内部同样转换。 */
  const ty = props.yLog ? (y: number) => Math.log10(Math.max(y, 1e-12)) : (y: number) => y
  const yLo = ty(props.yMin)
  const yHi = ty(props.yMax)

  const sx = (x: number) => PAD.l + ((tx(x) - xLo) / (xHi - xLo)) * pw
  const sy = (y: number) => PAD.t + (1 - (ty(y) - yLo) / (yHi - yLo)) * ph
  const xf = (p: Pt): Pt => [sx(p[0]), sy(p[1])]

  let s = ''

  // 网格
  if (props.grid) {
    for (const t of props.xTicks ?? autoTicks(xLo, xHi, 6)) {
      s += `<line class="wf-grid" x1="${r(sx(t))}" y1="${PAD.t}" x2="${r(sx(t))}" y2="${PAD.t + ph}"/>`
    }
    for (const t of props.yTicks ?? autoTicks(yLo, yHi, 5)) {
      s += `<line class="wf-grid" x1="${PAD.l}" y1="${r(sy(t))}" x2="${PAD.l + pw}" y2="${r(sy(t))}"/>`
    }
  }

  // 坐标轴
  s += `<line class="wf-axis" x1="${PAD.l}" y1="${PAD.t + ph}" x2="${PAD.l + pw}" y2="${PAD.t + ph}"/>`
  s += `<line class="wf-axis" x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${PAD.t + ph}"/>`
  if (props.zeroLine && props.yMin < 0 && props.yMax > 0) {
    s += `<line class="wf-zero" x1="${PAD.l}" y1="${r(sy(0))}" x2="${PAD.l + pw}" y2="${r(sy(0))}"/>`
  }

  // 刻度
  const xf_ = props.xTickFmt ?? ((v: number) => String(Math.round(v * 100) / 100))
  const yf_ = props.yTickFmt ?? ((v: number) => String(Math.round(v * 100) / 100))
  for (const t of props.xTicks ?? autoTicks(props.xMin, props.xMax, 6)) {
    s += txt(sx(t), PAD.t + ph + 13, xf_(t), { size: 10, color: 'var(--vp-c-text-3)' })
  }
  for (const t of props.yTicks ?? autoTicks(yLo, yHi, 5)) {
    s += txt(PAD.l - 7, sy(t), yf_(t), { size: 10, anchor: 'end', color: 'var(--vp-c-text-3)' })
  }
  if (props.xLabel) s += txt(PAD.l + pw / 2, h - 4, props.xLabel, { size: 11, color: 'var(--vp-c-text-2)' })
  if (props.yLabel) s += txt(11, PAD.t + ph / 2, props.yLabel, { size: 11, color: 'var(--vp-c-text-2)', rot: -90 })

  // 竖直标注线
  for (const m of props.marks ?? []) {
    s += `<line x1="${r(sx(m.x))}" y1="${PAD.t}" x2="${r(sx(m.x))}" y2="${PAD.t + ph}" stroke="${m.color || 'var(--vp-c-text-3)'}" stroke-dasharray="4 3" opacity=".75"/>`
    if (m.label) s += txt(sx(m.x), PAD.t - 3, m.label, { size: 10, color: m.color || 'var(--vp-c-text-3)' })
  }

  // 曲线
  props.series.forEach((se, i) => {
    const color = se.color || PALETTE[i % PALETTE.length]
    if (se.fill) {
      const d = toPath(se.points, xf) + ` L${r(sx(se.points[se.points.length - 1][0]))} ${r(sy(Math.max(props.yMin, 0)))} L${r(sx(se.points[0][0]))} ${r(sy(Math.max(props.yMin, 0)))} Z`
      s += `<path d="${d}" fill="${color}" opacity=".14" stroke="none"/>`
    }
    s += `<path d="${toPath(se.points, xf)}" fill="none" stroke="${color}" stroke-width="${se.width || 2}" ${se.dash ? 'stroke-dasharray="5 4" opacity=".85"' : ''}/>`
    if (se.label) {
      const last = xf(se.points[se.points.length - 1])
      s += txt(last[0] + 5, last[1], se.label, { size: 10.5, anchor: 'start', color })
    }
  })

  // 数据点标注
  for (const d of props.dots ?? []) {
    const px = sx(d.x)
    const py = sy(d.y)
    const color = d.color || 'var(--vp-c-brand-1)'
    s += `<circle cx="${r(px)}" cy="${r(py)}" r="3.2" fill="${color}"/>`
    if (d.label) {
      s += txt(px + (d.dx ?? 8), py + (d.dy ?? -9), d.label, { size: 10.5, anchor: 'start', color })
    }
  }

  return svg(w, h, s, 'wave')
})

function r(n: number) {
  return Math.round(n * 100) / 100
}

function autoTicks(min: number, max: number, n: number): number[] {
  const step = niceStep((max - min) / n)
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    out.push(Math.round(v * 1e6) / 1e6)
  }
  return out
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)))
  const n = raw / p
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return m * p
}
</script>

<template>
  <div class="wave-chart" v-html="out" />
</template>

<style scoped>
.wave-chart { line-height: 0; }
.wave-chart :deep(.wf-grid) {
  stroke: var(--vp-c-divider);
  stroke-width: 1;
  opacity: 0.5;
}
.wave-chart :deep(.wf-axis) {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.2;
}
.wave-chart :deep(.wf-zero) {
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
  opacity: 0.55;
}
</style>
