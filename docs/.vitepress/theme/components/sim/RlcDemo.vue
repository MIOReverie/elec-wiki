<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label, arrow } from '../../lib/plot'

const U = ref(220)
const f = ref(50)
const R = ref(30)
const L = ref(100) // mH
const C = ref(20) // µF

const calc = computed(() => {
  const om = 2 * Math.PI * f.value
  const Xl = om * (L.value / 1000)
  const Xc = 1 / (om * (C.value * 1e-6))
  const X = Xl - Xc
  const Zm = Math.hypot(R.value, X)
  const phi = Math.atan2(X, R.value)
  const I = U.value / Zm
  return {
    om,
    Xl,
    Xc,
    X,
    Zm,
    phi,
    I,
    UR: I * R.value,
    UL: I * Xl,
    UC: I * Xc,
    P: U.value * I * Math.cos(phi),
    Q: U.value * I * Math.sin(phi),
    S: U.value * I,
    cos: Math.cos(phi)
  }
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const c = calc.value
    const cy = h * 0.5
    const halfW = Math.min(w * 0.42, 250)
    const cx = halfW * 0.52
    const wx0 = halfW + 40
    const pw = Math.max(60, w - wx0 - 24)

    /* 左：电压相量图（以 İ 为参考） */
    const maxV = Math.max(c.UR, c.UL, c.UC, c.Zm * c.I, 1)
    const k = (Math.min(h * 0.38, halfW * 0.42)) / maxV
    ctx.strokeStyle = TC.grid
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx - halfW * 0.46, cy); ctx.lineTo(cx + halfW * 0.46, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.42); ctx.lineTo(cx, cy + h * 0.42); ctx.stroke()

    // 电流参考
    const iLen = halfW * 0.3
    arrow(ctx, cx, cy, cx + iLen, cy, SIG.i, 2, 8)
    label(ctx, 'İ', cx + iLen + 10, cy, SIG.i, 'left', 12, true)

    // U_R
    const urx = cx + c.UR * k
    arrow(ctx, cx, cy, urx, cy, SIG.p, 2.4, 9)
    label(ctx, `U_R=${c.UR.toFixed(1)}V`, urx / 2 + cx / 2, cy + 16, SIG.p, 'center', 10.5)
    // U_L（上）
    arrow(ctx, urx, cy, urx, cy - c.UL * k, SIG.v, 2.2, 8)
    label(ctx, `U_L=${c.UL.toFixed(1)}V`, urx + 8, cy - (c.UL * k) / 2, SIG.v, 'left', 10.5)
    // U_C（下）
    arrow(ctx, urx, cy - c.UL * k, urx, cy - c.UL * k + c.UC * k, SIG.q, 2.2, 8)
    label(ctx, `U_C=${c.UC.toFixed(1)}V`, urx + 8, cy - c.UL * k + (c.UC * k) / 2, SIG.q, 'left', 10.5)
    // 总电压 U
    const ux = cx + c.UR * k
    const uy = cy - (c.UL - c.UC) * k
    arrow(ctx, cx, cy, ux, uy, '#f97316', 2.8, 10)
    label(ctx, `U̇=${U.value}V`, ux + 10, uy - 12, '#f97316', 'left', 12, true)

    // 阻抗角
    ctx.strokeStyle = TC.text3
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(cx, cy, 30, 0, -c.phi, c.phi > 0)
    ctx.stroke()
    label(ctx, `φ=${((c.phi * 180) / Math.PI).toFixed(1)}°`, cx + 34, cy - (c.phi > 0 ? 14 : -14), TC.text2, 'left', 11, true)

    /* 右：波形 */
    const T = 1 / f.value
    const span = 2 * T
    const ku = (h * 0.34) / (Math.SQRT2 * U.value)
    const ki = (h * 0.34) / (Math.SQRT2 * Math.max(c.I, 1e-6))
    ctx.strokeStyle = TC.grid
    ctx.beginPath(); ctx.moveTo(wx0, cy); ctx.lineTo(wx0 + pw, cy); ctx.stroke()
    const uP: [number, number][] = []
    const iP: [number, number][] = []
    for (let i = 0; i <= 360; i++) {
      const tt = (span * i) / 360
      const x = wx0 + (pw * i) / 360
      uP.push([x, cy - Math.SQRT2 * U.value * Math.sin(c.om * tt + c.phi) * ku])
      iP.push([x, cy - Math.SQRT2 * c.I * Math.sin(c.om * tt) * ki])
    }
    poly(ctx, iP, SIG.i, 1.8)
    poly(ctx, uP, SIG.v, 2.2)
    const tN = t % span
    const px = wx0 + (pw * tN) / span
    ctx.setLineDash([3, 4]); ctx.strokeStyle = TC.text3
    ctx.beginPath(); ctx.moveTo(px, 16); ctx.lineTo(px, h - 16); ctx.stroke()
    ctx.setLineDash([])
    dot(ctx, px, cy - Math.SQRT2 * U.value * Math.sin(c.om * tN + c.phi) * ku, 4, SIG.v)
    dot(ctx, px, cy - Math.SQRT2 * c.I * Math.sin(c.om * tN) * ki, 3.5, SIG.i)
    label(ctx, c.phi > 0 ? '感性：U 超前 I' : c.phi < 0 ? '容性：U 滞后 I' : '阻性：同相', wx0 + pw / 2, 20, SIG.q, 'center', 11.5, true)
  },
  { animate: true }
)
</script>

<template>
  <div class="rl">
    <div class="rl-ctrls">
      <Ctrl label="电源电压 U" v-model="U" :min="1" :max="380" :step="1" unit="V" :fixed="0" />
      <Ctrl label="频率 f" v-model="f" :min="10" :max="1000" :step="5" unit="Hz" :fixed="0" />
      <Ctrl label="电阻 R" v-model="R" :min="1" :max="500" :step="1" unit="Ω" :fixed="0" />
      <Ctrl label="电感 L" v-model="L" :min="1" :max="500" :step="1" unit="mH" :fixed="0" />
      <Ctrl label="电容 C" v-model="C" :min="1" :max="500" :step="1" unit="µF" :fixed="0" />
    </div>
    <canvas ref="cv" class="rl-cv" />
    <div class="rl-out">
      <span>X_L = <b>{{ calc.Xl.toFixed(1) }}</b> Ω</span>
      <span>X_C = <b>{{ calc.Xc.toFixed(1) }}</b> Ω</span>
      <span>|Z| = <b>{{ calc.Zm.toFixed(1) }}</b> Ω</span>
      <span>φ = <b>{{ ((calc.phi * 180) / Math.PI).toFixed(1) }}</b>°</span>
      <span>I = <b>{{ calc.I.toFixed(3) }}</b> A</span>
      <span>P = <b>{{ calc.P.toFixed(1) }}</b> W</span>
      <span>Q = <b>{{ calc.Q.toFixed(1) }}</b> var</span>
      <span>S = <b>{{ calc.S.toFixed(1) }}</b> VA</span>
      <span>cosφ = <b>{{ calc.cos.toFixed(3) }}</b></span>
    </div>
    <p class="rl-note">
      注意 U_L 与 U_C 可能<b>远大于</b>电源电压 U（它们反相，互相抵消）——这不是错误，是谐振电路里"电压放大"的来源。
    </p>
  </div>
</template>

<style scoped>
.rl { display: flex; flex-direction: column; gap: 8px; }
.rl-ctrls { display: flex; flex-direction: column; gap: 1px; }
.rl-cv { width: 100%; height: 330px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.rl-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.rl-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.rl-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.rl-note b { color: var(--vp-c-text-2); }
</style>
