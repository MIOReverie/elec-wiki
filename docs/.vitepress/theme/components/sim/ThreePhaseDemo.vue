<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label, arrow } from '../../lib/plot'

const view = ref<'phasor' | 'wave' | 'neutral'>('phasor')
const showLine = ref(true)
const Up = ref(220)

const Ra = ref(10)
const Rb = ref(10)
const Rc = ref(10)
const neutral = ref(true)

type Cx = [number, number]
const cAdd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: Cx, k: number): Cx => [a[0] * k, a[1] * k]
const cDiv = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cAbs = (a: Cx) => Math.hypot(a[0], a[1])
const polar = (m: number, deg: number): Cx => [m * Math.cos((deg * Math.PI) / 180), m * Math.sin((deg * Math.PI) / 180)]

const loadV = computed(() => {
  const UA = polar(Up.value, 0)
  const UB = polar(Up.value, -120)
  const UC = polar(Up.value, 120)
  if (neutral.value) {
    return { N: [0, 0] as Cx, VA: UA, VB: UB, VC: UC, msg: '中性线完好：中性点位移为 0，每相都是 220V' }
  }
  const ga = 1 / Math.max(Ra.value, 0.01)
  const gb = 1 / Math.max(Rb.value, 0.01)
  const gc = 1 / Math.max(Rc.value, 0.01)
  const num = cAdd(cAdd(cMul(UA, ga), cMul(UB, gb)), cMul(UC, gc))
  const den: Cx = [ga + gb + gc, 0]
  const N = cDiv(num, den)
  return {
    N,
    VA: cSub(UA, N),
    VB: cSub(UB, N),
    VC: cSub(UC, N),
    msg: `中性线断开：位移电压 |U_NN'| = ${cAbs(N).toFixed(1)} V`
  }
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    if (view.value === 'phasor') {
      const cx = w * 0.5
      const cy = h * 0.54
      const k = (Math.min(h * 0.36, w * 0.3)) / Up.value
      ctx.strokeStyle = TC.grid
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - w * 0.36, cy); ctx.lineTo(cx + w * 0.36, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.4); ctx.lineTo(cx, cy + h * 0.4); ctx.stroke()

      const cols = ['#f59e0b', '#38bdf8', '#a78bfa']
      const P = [polar(Up.value, 90), polar(Up.value, -30), polar(Up.value, 210)]
      const names = ['U_A', 'U_B', 'U_C']
      for (let i = 0; i < 3; i++) {
        const x = cx + P[i][0] * k
        const y = cy - P[i][1] * k
        arrow(ctx, cx, cy, x, y, cols[i], 2.4, 9)
        dot(ctx, x, y, 4, cols[i])
        label(ctx, names[i], x + 12 * Math.cos((Math.atan2(-P[i][1], P[i][0]))), y - 12, cols[i], 'center', 11.5, true)
      }

      if (showLine.value) {
        const L: Cx[] = [cSub(P[0], P[1]), cSub(P[1], P[2]), cSub(P[2], P[0])]
        const ln = ['U_AB', 'U_BC', 'U_CA']
        for (let i = 0; i < 3; i++) {
          const x = cx + L[i][0] * k
          const y = cy - L[i][1] * k
          arrow(ctx, cx, cy, x, y, SIG.p, 1.8, 8)
          label(ctx, ln[i], x + 10, y + 10, SIG.p, 'center', 10.5, true)
        }
        label(ctx, `|U_AB| = √3·U_A = ${(Math.sqrt(3) * Up.value).toFixed(1)} V，且超前 U_A 30°`, w / 2, 20, SIG.p, 'center', 12, true)
      }
      label(ctx, `相电压 U_p = ${Up.value} V`, 12, 18, TC.text3, 'left', 11)
      label(ctx, `线电压 U_l = ${(Math.sqrt(3) * Up.value).toFixed(1)} V`, 12, 34, TC.text3, 'left', 11)
    } else if (view.value === 'wave') {
      const cy = h * 0.5
      const x0 = 40
      const pw = w - 70
      const amp = h * 0.36
      const om = 2 * Math.PI * 0.5
      ctx.strokeStyle = TC.grid
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + pw, cy); ctx.stroke()
      const cols = ['#f59e0b', '#38bdf8', '#a78bfa']
      const names = ['u_A', 'u_B', 'u_C']
      for (let i = 0; i < 3; i++) {
        const pts: [number, number][] = []
        for (let j = 0; j <= 400; j++) {
          const tt = (6 * j) / 400
          pts.push([x0 + (pw * j) / 400, cy - amp * Math.sin(om * tt - (i * 2 * Math.PI) / 3)])
        }
        poly(ctx, pts, cols[i], 2.2)
        label(ctx, names[i], x0 + pw + 4, cy - amp * Math.sin(om * t * 0 - (i * 2 * Math.PI) / 3), cols[i], 'left', 11, true)
      }
      label(ctx, '三相互差 120°（1/3 周期）', w / 2, 20, TC.text2, 'center', 12, true)
      label(ctx, '对称三相的瞬时值之和恒为 0 → 中性线电流为 0', w / 2, h - 14, SIG.p, 'center', 11.5)
    } else {
      // 中性点位移：柱状图
      const v = loadV.value
      const mags = [cAbs(v.VA), cAbs(v.VB), cAbs(v.VC)]
      const maxV = Math.max(...mags, Up.value) * 1.15
      const bw = 56
      const gap = (w - 3 * bw) / 4
      const base = h - 46
      const names = ['A 相', 'B 相', 'C 相']
      const cols = ['#f59e0b', '#38bdf8', '#a78bfa']
      ctx.strokeStyle = TC.grid
      ctx.beginPath(); ctx.moveTo(20, base); ctx.lineTo(w - 20, base); ctx.stroke()
      // 参考线 220V
      ctx.setLineDash([4, 4])
      const y220 = base - (Up.value / maxV) * (base - 50)
      ctx.beginPath(); ctx.moveTo(20, y220); ctx.lineTo(w - 20, y220); ctx.stroke()
      ctx.setLineDash([])
      label(ctx, '220V 参考', w - 24, y220 - 10, TC.text3, 'right', 10.5)

      for (let i = 0; i < 3; i++) {
        const x = gap + i * (bw + gap)
        const hh = (mags[i] / maxV) * (base - 50)
        ctx.fillStyle = cols[i]
        ctx.globalAlpha = 0.85
        ctx.fillRect(x, base - hh, bw, hh)
        ctx.globalAlpha = 1
        label(ctx, `${mags[i].toFixed(1)}V`, x + bw / 2, base - hh - 12, cols[i], 'center', 11.5, true)
        label(ctx, names[i], x + bw / 2, base + 16, TC.text2, 'center', 11)
        label(ctx, `${[Ra.value, Rb.value, Rc.value][i]}Ω`, x + bw / 2, base + 32, TC.text3, 'center', 10.5)
      }
      label(ctx, v.msg, w / 2, 22, neutral.value ? SIG.p : SIG.warn, 'center', 12, true)
    }
  },
  { animate: view.value === 'wave' }
)
</script>

<template>
  <div class="tp">
    <Seg
      v-model="view"
      label="视图"
      :options="[
        { value: 'phasor', label: '相量图 · 线/相电压' },
        { value: 'wave', label: '三相波形' },
        { value: 'neutral', label: '中性点位移' }
      ]"
    />
    <div v-if="view === 'phasor'" class="tp-row">
      <Ctrl label="相电压 U_p" v-model="Up" :min="36" :max="380" :step="1" unit="V" :fixed="0" />
      <label class="tp-chk"><input v-model="showLine" type="checkbox" /> 显示线电压 U_AB / U_BC / U_CA</label>
    </div>
    <div v-else-if="view === 'neutral'" class="tp-row2">
      <Ctrl label="A 相负载" v-model="Ra" :min="1" :max="100" :step="1" unit="Ω" :fixed="0" />
      <Ctrl label="B 相负载" v-model="Rb" :min="1" :max="100" :step="1" unit="Ω" :fixed="0" />
      <Ctrl label="C 相负载" v-model="Rc" :min="1" :max="100" :step="1" unit="Ω" :fixed="0" />
      <Seg
        v-model="neutral"
        label="中性线"
        :options="[
          { value: true, label: '完好' },
          { value: false, label: '断开' }
        ]"
      />
    </div>
    <canvas ref="cv" class="tp-cv" />
    <p v-if="view === 'neutral'" class="tp-note">
      中性线的作用就是<b>把中性点钉死在 0 电位</b>。一旦断开且三相负载不对称，中性点就会漂移，导致"某相电压飙升烧坏设备、某相电压不足"。所以<b>中性线上严禁装开关和熔断器</b>。
    </p>
  </div>
</template>

<style scoped>
.tp { display: flex; flex-direction: column; gap: 8px; }
.tp-row { display: flex; flex-direction: column; gap: 4px; }
.tp-row2 { display: flex; flex-direction: column; gap: 1px; }
.tp-chk { font-size: 12.5px; color: var(--vp-c-text-2); display: flex; align-items: center; gap: 6px; }
.tp-cv { width: 100%; height: 320px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.tp-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.tp-note b { color: var(--vp-c-text-2); }
</style>
