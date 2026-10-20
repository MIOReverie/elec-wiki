<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label, arrow } from '../../lib/plot'

const P = ref(10) // kW
const U = ref(220)
const f = ref(50)
const cos1 = ref(0.6)
const cos2 = ref(0.95)

const calc = computed(() => {
  const p1 = Math.acos(cos1.value)
  const p2 = Math.acos(cos2.value)
  const Pa = P.value * 1000
  const I1 = Pa / (U.value * cos1.value)
  const I2 = Pa / (U.value * cos2.value)
  const Ia = Pa / U.value
  const Q1 = Pa * Math.tan(p1)
  const Qc = Pa * (Math.tan(p1) - Math.tan(p2))
  const om = 2 * Math.PI * f.value
  const Cfar = Qc / (om * U.value * U.value)
  return {
    p1, p2,
    I1, I2, Ia,
    Q1, Qc,
    C: Cfar * 1e6,
    Ic: om * Cfar * U.value,
    cut: ((I1 - I2) / I1) * 100,
    S1: U.value * I1,
    S2: U.value * I2
  }
})

const cvLabel = computed(() => {
  const c = calc.value
  return `无功补偿相量图：有功功率 ${P.value} kW、电压 ${U.value} V、频率 ${f.value} Hz，` +
    `补偿前 cosφ₁=${cos1.value}（${((c.p1 * 180) / Math.PI).toFixed(1)}°），目标 cosφ₂=${cos2.value}（${((c.p2 * 180) / Math.PI).toFixed(1)}°）。` +
    `线路电流由 ${c.I1.toFixed(2)} A 降到 ${c.I2.toFixed(2)} A，需并联电容 ${c.C.toFixed(2)} µF、电容电流 ${c.Ic.toFixed(2)} A。`
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  const c = calc.value
  const ox = 54
  const oy = h * 0.72
  const umax = Math.max(c.Ia, c.I1) * 1.15
  const k = (h * 0.5) / umax
  const kx = (w - ox - 40) / umax
  const kk = Math.min(k, kx)

  ctx.strokeStyle = TC.grid
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(ox - 14, oy); ctx.lineTo(w - 20, oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox, 18); ctx.lineTo(ox, oy + 14); ctx.stroke()
  label(ctx, '有功分量 →', w - 20, oy + 14, TC.text3, 'right', 10.5)
  label(ctx, '↑ 无功分量', ox - 4, 18, TC.text3, 'right', 10.5)

  // 补偿前 I1
  const x1 = ox + c.Ia * kk
  const y1 = oy - Math.sqrt(Math.max(c.I1 * c.I1 - c.Ia * c.Ia, 0)) * kk
  arrow(ctx, ox, oy, x1, y1, SIG.warn, 2.6, 9)
  label(ctx, `İ₁=${c.I1.toFixed(1)}A`, x1 + 8, y1 - 6, SIG.warn, 'left', 11.5, true)

  // 补偿后 I2
  const y2 = oy - Math.sqrt(Math.max(c.I2 * c.I2 - c.Ia * c.Ia, 0)) * kk
  arrow(ctx, ox, oy, x1, y2, SIG.p, 2.6, 9)
  label(ctx, `İ₂=${c.I2.toFixed(1)}A`, x1 + 8, y2 + 12, SIG.p, 'left', 11.5, true)

  // 电容电流 Ic（向上）
  arrow(ctx, x1, y1, x1, y2, SIG.i, 2.4, 8)
  label(ctx, `İ_C=${c.Ic.toFixed(1)}A`, x1 - 10, (y1 + y2) / 2, SIG.i, 'right', 11.5, true)

  // 有功分量
  arrow(ctx, ox, oy, x1, oy, TC.text2, 2, 8)
  label(ctx, `I_a=${c.Ia.toFixed(1)}A`, (ox + x1) / 2, oy + 16, TC.text2, 'center', 10.5)

  // 角度弧
  ctx.strokeStyle = TC.text3
  ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.arc(ox, oy, 34, -c.p1, 0); ctx.stroke()
  label(ctx, `φ₁=${((c.p1 * 180) / Math.PI).toFixed(1)}°`, ox + 40, oy - 16, SIG.warn, 'left', 10.5)
  ctx.beginPath(); ctx.arc(ox, oy, 24, -c.p2, 0); ctx.stroke()
  label(ctx, `φ₂=${((c.p2 * 180) / Math.PI).toFixed(1)}°`, ox + 28, oy - 34, SIG.p, 'left', 10.5)

  dot(ctx, ox, oy, 3, TC.text)
  label(ctx, 'İ₁ = İ₂ + İ_C  （有功分量不变，只砍掉无功）', w / 2, 16, TC.text2, 'center', 11.5, true)
})
</script>

<template>
  <div class="pf">
    <div class="pf-ctrls">
      <Ctrl label="有功功率 P" v-model="P" :min="1" :max="100" :step="1" unit="kW" :fixed="0" />
      <Ctrl label="电压 U" v-model="U" :min="36" :max="380" :step="1" unit="V" :fixed="0" />
      <Ctrl label="频率 f" v-model="f" :min="50" :max="50" :step="1" unit="Hz" :fixed="0" />
      <Ctrl label="补偿前 cosφ₁" v-model="cos1" :min="0.4" :max="0.95" :step="0.01" />
      <Ctrl label="目标 cosφ₂" v-model="cos2" :min="0.8" :max="1" :step="0.01" />
    </div>
    <canvas ref="cv" class="pf-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <div class="pf-out">
      <span>I₁ = <b>{{ calc.I1.toFixed(2) }}</b> A</span>
      <span>I₂ = <b>{{ calc.I2.toFixed(2) }}</b> A</span>
      <span>线路电流下降 <b>{{ calc.cut.toFixed(1) }}</b> %</span>
      <span>Q_C = <b>{{ (calc.Qc / 1000).toFixed(2) }}</b> kvar</span>
      <span>需并联 C = <b>{{ calc.C.toFixed(2) }}</b> µF</span>
      <span>S: <b>{{ (calc.S1 / 1000).toFixed(1) }}</b> → <b>{{ (calc.S2 / 1000).toFixed(1) }}</b> kVA</span>
    </div>
    <p class="pf-formula">
      C = P(tanφ₁ − tanφ₂) / (ωU²)　·　补偿的是<b>无功功率</b>，有功功率 P 和负载本身的工作状态<b>完全不变</b>。
    </p>
  </div>
</template>

<style scoped>
.pf { display: flex; flex-direction: column; gap: 8px; }
.pf-ctrls { display: flex; flex-direction: column; gap: 1px; }
.pf-cv { width: 100%; height: 260px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.pf-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.pf-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.pf-formula { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.pf-formula b { color: var(--vp-c-text-2); }
</style>
