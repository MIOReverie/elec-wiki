<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { drawFrame, mapper, poly, dot, label, type Box, type Range } from '../../lib/plot'

const U = ref(10)
const R = ref(10)
const L = ref(100) // mH
const C = ref(10) // µF
const f = ref(159)

const calc = computed(() => {
  const Lh = L.value / 1000
  const Cf = C.value * 1e-6
  const f0 = 1 / (2 * Math.PI * Math.sqrt(Lh * Cf))
  const w0 = 2 * Math.PI * f0
  const Q = (w0 * Lh) / R.value
  const BW = f0 / Q
  return { f0, w0, Q, BW, f1: f0 - BW / 2, f2: f0 + BW / 2 }
})

const cvLabel = computed(() => {
  const c = calc.value
  const Lh = L.value / 1000, Cf = C.value * 1e-6
  const ff = Math.min(Math.max(f.value, 1), 2000)
  const X = 2 * Math.PI * ff * Lh - 1 / (2 * Math.PI * ff * Cf)
  const Ic = U.value / Math.hypot(R.value, X)
  return `串联谐振曲线：U=${U.value} V、R=${R.value} Ω、L=${L.value} mH、C=${C.value} µF。` +
    `谐振频率 ${c.f0.toFixed(2)} Hz，品质因数 Q=${c.Q.toFixed(2)}，通频带 ${c.BW.toFixed(2)} Hz。` +
    `当前游标 ${ff.toFixed(0)} Hz 处电流 ${Ic.toFixed(2)} A。`
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  const b: Box = { x: 52, y: 24, w: w - 86, h: h - 66 }
  const f0 = calc.value.f0
  const xmin = Math.max(1, f0 / 6)
  const xmax = f0 * 6
  const Imax = U.value / R.value
  const r: Range = { xmin, xmax, ymin: 0, ymax: Imax * 1.12 }
  drawFrame(
    ctx, b, r,
    { xLabel: '频率 f / Hz', yLabel: 'I / A' },
    { grid: TC.grid, text3: TC.text3, text2: TC.text2 }
  )
  const m = mapper(b, r)

  const Lh = L.value / 1000
  const Cf = C.value * 1e-6
  const cur: [number, number][] = []
  const imp: [number, number][] = []
  let zmax = 0
  for (let i = 0; i <= 400; i++) {
    const ff = xmin * Math.pow(xmax / xmin, i / 400)
    const om = 2 * Math.PI * ff
    const X = om * Lh - 1 / (om * Cf)
    const Z = Math.hypot(R.value, X)
    zmax = Math.max(zmax, Z)
    cur.push([ff, U.value / Z])
    imp.push([ff, Z])
  }
  // |Z| 用右轴归一化后叠加
  poly(
    ctx,
    imp.map(([ff, z]) => m(ff, (z / zmax) * Imax * 1.05)),
    TC.text3,
    1.4,
    [5, 4]
  )
  poly(ctx, cur.map(([ff, i]) => m(ff, i)), SIG.i, 2.4)

  // 谐振点
  const p0 = m(f0, Imax)
  dot(ctx, p0[0], p0[1], 5, SIG.p)
  label(ctx, `f₀=${f0.toFixed(1)}Hz  I_max=${Imax.toFixed(2)}A`, p0[0], p0[1] - 14, SIG.p, 'center', 11, true)

  // 半功率点
  const half = Imax / Math.SQRT2
  poly(ctx, [m(xmin, half), m(xmax, half)], SIG.q, 1.2, [3, 4])
  for (const ff of [calc.value.f1, calc.value.f2]) {
    if (ff > xmin && ff < xmax) {
      const p = m(ff, half)
      dot(ctx, p[0], p[1], 3.5, SIG.q)
    }
  }
  label(ctx, `BW = f₂−f₁ = ${calc.value.BW.toFixed(1)} Hz`, b.x + b.w - 4, m(0, half)[1] - 10, SIG.q, 'right', 10.5)

  // 当前频率游标
  const ff = Math.min(Math.max(f.value, xmin), xmax)
  const om = 2 * Math.PI * ff
  const X = om * Lh - 1 / (om * Cf)
  const Ic = U.value / Math.hypot(R.value, X)
  const pc = m(ff, Ic)
  ctx.setLineDash([4, 3])
  ctx.strokeStyle = TC.text2
  ctx.beginPath(); ctx.moveTo(pc[0], b.y); ctx.lineTo(pc[0], b.y + b.h); ctx.stroke()
  ctx.setLineDash([])
  dot(ctx, pc[0], pc[1], 4.5, SIG.v)
  label(ctx, `${ff.toFixed(0)}Hz`, pc[0] + 6, b.y + 10, SIG.v, 'left', 10.5, true)

  label(ctx, `Q = ${calc.value.Q.toFixed(2)}`, b.x + 6, b.y + 10, TC.text2, 'left', 11.5, true)
  label(ctx, '虚线：|Z|(f) 归一化', b.x + 6, b.y + 26, TC.text3, 'left', 10.5)
})
</script>

<template>
  <div class="rs">
    <div class="rs-ctrls">
      <Ctrl label="电源电压 U" v-model="U" :min="1" :max="50" :step="1" unit="V" :fixed="0" />
      <Ctrl label="电阻 R" v-model="R" :min="1" :max="100" :step="1" unit="Ω" :fixed="0" />
      <Ctrl label="电感 L" v-model="L" :min="1" :max="500" :step="1" unit="mH" :fixed="0" />
      <Ctrl label="电容 C" v-model="C" :min="1" :max="500" :step="1" unit="µF" :fixed="0" />
      <Ctrl label="当前 f" v-model="f" :min="1" :max="2000" :step="1" unit="Hz" :fixed="0" />
    </div>
    <canvas ref="cv" class="rs-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <div class="rs-out">
      <span>f₀ = <b>{{ calc.f0.toFixed(2) }}</b> Hz</span>
      <span>Q = <b>{{ calc.Q.toFixed(2) }}</b></span>
      <span>通频带 BW = <b>{{ calc.BW.toFixed(2) }}</b> Hz</span>
      <span>谐振时 U_L = U_C = <b>{{ (calc.Q * U).toFixed(1) }}</b> V</span>
    </div>
    <p class="rs-note">
      R 越小 → Q 越大 → 曲线越尖、选择性越好，但通频带越窄。谐振时 U_L = U_C = Q·U，<b>可能击穿元件</b>，电力系统中要避免串联谐振。
    </p>
  </div>
</template>

<style scoped>
.rs { display: flex; flex-direction: column; gap: 8px; }
.rs-ctrls { display: flex; flex-direction: column; gap: 1px; }
.rs-cv { width: 100%; height: 300px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.rs-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.rs-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.rs-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.rs-note b { color: var(--vp-c-text-2); }
</style>
