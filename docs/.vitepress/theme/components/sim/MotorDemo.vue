<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { drawFrame, mapper, poly, dot, label, type Box, type Range } from '../../lib/plot'

const U1 = ref(220)
const f = ref(50)
const pole = ref(2) // 极对数 p
const R2 = ref(0.2) // 转子电阻（标度）
const n = ref(1440) // 当前转速

const calc = computed(() => {
  const n0 = (60 * f.value) / pole.value
  const sN = Math.max(0, Math.min(1, (n0 - n.value) / n0))
  const sm = R2.value / 1.0 // 临界转差率（漏电抗归一化为 1）
  const Tmax = 60 * Math.pow(U1.value / 220, 2)
  const T = (s: number) => (s <= 0 ? 0 : (2 * Tmax) / (s / sm + sm / s))
  return {
    n0,
    sN,
    sm,
    Tmax,
    Tst: T(1),
    T: T(sN),
    Tfn: T,
    rated: T(0.04),
    slipPct: sN * 100
  }
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  const c = calc.value
  const b: Box = { x: 54, y: 24, w: w - 92, h: h - 68 }
  const r: Range = { xmin: 0, xmax: c.n0, ymin: 0, ymax: c.Tmax * 1.15 }
  drawFrame(
    ctx, b, r,
    { xLabel: '转速 n / (r/min)', yLabel: 'T / (N·m)' },
    { grid: TC.grid, text3: TC.text3, text2: TC.text2 }
  )
  const m = mapper(b, r)

  // T-n 特性
  const pts: [number, number][] = []
  for (let i = 0; i <= 300; i++) {
    const s = 1 - i / 300
    const nn = c.n0 * (1 - s)
    if (s < 0.004) continue
    pts.push(m(nn, c.Tfn(s)))
  }
  poly(ctx, pts, SIG.v, 2.4)

  // 同步转速线
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = TC.text3
  ctx.beginPath()
  ctx.moveTo(m(c.n0, 0)[0], b.y)
  ctx.lineTo(m(c.n0, 0)[0], b.y + b.h)
  ctx.stroke()
  ctx.setLineDash([])
  label(ctx, `n₀=${c.n0.toFixed(0)}`, m(c.n0, 0)[0] - 6, b.y + 10, TC.text3, 'right', 10.5)

  // 最大转矩点
  const nm = c.n0 * (1 - c.sm)
  if (c.sm < 1) {
    dot(ctx, m(nm, c.Tmax)[0], m(nm, c.Tmax)[1], 4.5, SIG.p)
    label(ctx, `T_max=${c.Tmax.toFixed(1)}`, m(nm, c.Tmax)[0] + 8, m(nm, c.Tmax)[1] - 10, SIG.p, 'left', 10.5, true)
  }
  // 起动点
  dot(ctx, m(0, c.Tst)[0], m(0, c.Tst)[1], 4.5, SIG.warn)
  label(ctx, `T_st=${c.Tst.toFixed(1)}`, m(0, c.Tst)[0] + 8, m(0, c.Tst)[1] + 12, SIG.warn, 'left', 10.5, true)

  // 工作点
  const px = m(Math.min(n.value, c.n0), c.T)
  dot(ctx, px[0], px[1], 6, SIG.i)
  label(ctx, `工作点 n=${n.value}`, px[0], px[1] - 14, SIG.i, 'center', 11, true)

  // 负载转矩线（恒转矩负载示意）
  poly(ctx, [m(0, c.T), m(c.n0, c.T)], SIG.i, 1.4, [5, 4])
  label(ctx, `T_L`, m(c.n0 * 0.86, c.T)[0], m(c.n0 * 0.86, c.T)[1] - 12, SIG.i, 'center', 10.5)

  label(ctx, `s = ${c.slipPct.toFixed(2)}%`, b.x + 6, b.y + 10, TC.text2, 'left', 11.5, true)
  label(ctx, `s_m = ${c.sm.toFixed(3)}`, b.x + 6, b.y + 26, TC.text3, 'left', 10.5)
})
</script>

<template>
  <div class="mt">
    <div class="mt-ctrls">
      <Ctrl label="定子相电压 U₁" v-model="U1" :min="110" :max="380" :step="5" unit="V" :fixed="0" />
      <Ctrl label="电源频率 f" v-model="f" :min="10" :max="80" :step="1" unit="Hz" :fixed="0" />
      <Ctrl label="极对数 p" v-model="pole" :min="1" :max="6" :step="1" :fixed="0" />
      <Ctrl label="转子电阻 R₂" v-model="R2" :min="0.05" :max="1" :step="0.01" :log="true" />
      <Ctrl label="转速 n" v-model="n" :min="0" :max="3000" :step="5" unit="r/min" :fixed="0" />
    </div>
    <canvas ref="cv" class="mt-cv" />
    <div class="mt-out">
      <span>n₀ = <b>{{ calc.n0.toFixed(0) }}</b> r/min</span>
      <span>s = <b>{{ calc.slipPct.toFixed(2) }}</b> %</span>
      <span>T = <b>{{ calc.T.toFixed(2) }}</b> N·m</span>
      <span>T_st = <b>{{ calc.Tst.toFixed(2) }}</b> N·m</span>
      <span>T_max = <b>{{ calc.Tmax.toFixed(2) }}</b> N·m</span>
      <span>T_st/T_N ≈ <b>{{ (calc.Tst / Math.max(calc.rated, 1e-6)).toFixed(2) }}</b></span>
    </div>
    <p class="mt-note">
      拖动 R₂ 滑块看两个结论：① <b>R₂ 增大 → s_m 增大 → 起动转矩变大</b>（绕线式电机转子串电阻启动的原理）；
      ② <b>降低 U₁ → T ∝ U₁² 急剧下降</b>——所以星三角降压启动只能空载/轻载用。
    </p>
  </div>
</template>

<style scoped>
.mt { display: flex; flex-direction: column; gap: 8px; }
.mt-ctrls { display: flex; flex-direction: column; gap: 1px; }
.mt-cv { width: 100%; height: 300px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.mt-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.mt-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.mt-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.mt-note b { color: var(--vp-c-text-2); }
</style>
