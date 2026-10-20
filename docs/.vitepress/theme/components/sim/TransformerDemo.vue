<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label } from '../../lib/plot'
import { resistor, acSource, wire, tag, ground } from '../../lib/parts'

const N1 = ref(1000)
const N2 = ref(500)
const V1 = ref(220)
const RL = ref(20)

const calc = computed(() => {
  const k = N1.value / Math.max(N2.value, 1)
  const V2 = V1.value / k
  const I2 = V2 / Math.max(RL.value, 0.01)
  const I1 = I2 / k
  return { k, V2, I2, I1, Zin: k * k * RL.value, P: V2 * I2 }
})

const cvLabel = computed(() =>
  `理想变压器演示：原边 ${N1.value} 匝、副边 ${N2.value} 匝，原边电压 ${V1.value} V，负载 ${RL.value} Ω。` +
  `变比 k=${calc.value.k.toFixed(3)}，副边电压 ${calc.value.V2.toFixed(2)} V，` +
  `副边电流 ${calc.value.I2.toFixed(3)} A，原边电流 ${calc.value.I1.toFixed(3)} A，` +
  `折算到原边的阻抗 ${calc.value.Zin.toFixed(1)} Ω，输出功率 ${calc.value.P.toFixed(2)} W。`
)

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h, t }) => {
  const ch = h * 0.46
  const cy = ch * 0.5
  const Lp = 40
  const mid = Lp + 120
  const Rp = mid + 130

  // 铁芯
  ctx.strokeStyle = TC.text2
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(mid, cy - 34); ctx.lineTo(mid, cy + 34); ctx.stroke()
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(mid + 8 + i * 5, cy - 26); ctx.lineTo(mid + 8 + i * 5, cy + 26); ctx.stroke()
  }

  // 原边
  wire(ctx, Lp, cy - 60, Lp, cy - 40, TC.text2)
  wire(ctx, Lp, cy + 40, Lp, cy + 60, TC.text2)
  acSource(ctx, Lp, cy, TC.text)
  tag(ctx, `u₁=${V1.value}V`, Lp - 22, cy, TC.text, 'right', true)
  wire(ctx, Lp, cy - 60, mid - 26, cy - 60, TC.text2)
  wire(ctx, Lp, cy + 60, mid - 26, cy + 60, TC.text2)
  // 原边线圈
  ctx.strokeStyle = SIG.v
  ctx.lineWidth = 2.2
  for (let i = 0; i < 5; i++) {
    const yy = cy - 40 + i * 20
    ctx.beginPath(); ctx.arc(mid - 20, yy, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke()
  }
  wire(ctx, mid - 26, cy - 60, mid - 26, cy - 40, TC.text2)
  wire(ctx, mid - 26, cy + 40, mid - 26, cy + 60, TC.text2)
  tag(ctx, `N₁=${N1.value}`, mid - 40, cy - 52, SIG.v, 'right', true)

  // 副边
  wire(ctx, mid + 22, cy - 60, Rp, cy - 60, TC.text2)
  wire(ctx, mid + 22, cy + 60, Rp, cy + 60, TC.text2)
  ctx.strokeStyle = SIG.i
  ctx.lineWidth = 2.2
  for (let i = 0; i < 5; i++) {
    const yy = cy - 40 + i * 20
    ctx.beginPath(); ctx.arc(mid + 26, yy, 9, Math.PI / 2, -Math.PI / 2); ctx.stroke()
  }
  wire(ctx, mid + 22, cy - 60, mid + 22, cy - 40, TC.text2)
  wire(ctx, mid + 22, cy + 60, mid + 22, cy + 40, TC.text2)
  tag(ctx, `N₂=${N2.value}`, mid + 42, cy - 52, SIG.i, 'left', true)

  resistor(ctx, Rp, cy, false, TC.text2)
  wire(ctx, Rp, cy - 60, Rp, cy - 15, TC.text2)
  wire(ctx, Rp, cy + 15, Rp, cy + 60, TC.text2)
  tag(ctx, `R_L=${RL.value}Ω`, Rp + 16, cy, TC.brand, 'left', true)
  ground(ctx, Lp - 18, cy + 60, TC.text2)
  label(ctx, `变比 k = N₁/N₂ = ${calc.value.k.toFixed(2)}`, w / 2, 16, TC.text2, 'center', 12, true)

  // 波形
  const wy0 = ch + 16
  const wh = h - wy0 - 26
  const cyw = wy0 + wh * 0.5
  const x0 = 46
  const pw = w - 70
  const om = 2 * Math.PI * 0.6
  ctx.strokeStyle = TC.grid
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(x0, cyw); ctx.lineTo(x0 + pw, cyw); ctx.stroke()

  const a1 = wh * 0.34
  const a2 = a1 / Math.max(calc.value.k, 0.001)
  const p1: [number, number][] = []
  const p2: [number, number][] = []
  for (let i = 0; i <= 400; i++) {
    const tt = (6 * i) / 400
    const x = x0 + (pw * i) / 400
    p1.push([x, cyw - a1 * Math.sin(om * tt)])
    p2.push([x, cyw - a2 * Math.sin(om * tt)])
  }
  poly(ctx, p1, SIG.v, 2.2)
  poly(ctx, p2, SIG.i, 2.4)
  const tn = t % 6
  const pxn = x0 + (pw * tn) / 6
  dot(ctx, pxn, cyw - a1 * Math.sin(om * tn), 4, SIG.v)
  dot(ctx, pxn, cyw - a2 * Math.sin(om * tn), 4, SIG.i)
  label(ctx, `u₁ 峰值 ${V1.value}V`, x0 + pw + 2, cyw - a1, SIG.v, 'left', 10.5, true)
  label(ctx, `u₂ 峰值 ${calc.value.V2.toFixed(1)}V`, x0 + pw + 2, cyw - a2 + 12, SIG.i, 'left', 10.5, true)
  label(ctx, '变压器只"变"交流：直流磁通不变 → 副边感应不出电压', w / 2, h - 10, TC.text3, 'center', 11)
})
</script>

<template>
  <div class="tf">
    <div class="tf-ctrls">
      <Ctrl label="原边 N₁" v-model="N1" :min="100" :max="3000" :step="50" unit="匝" :fixed="0" />
      <Ctrl label="副边 N₂" v-model="N2" :min="50" :max="3000" :step="50" unit="匝" :fixed="0" />
      <Ctrl label="原边电压 U₁" v-model="V1" :min="5" :max="380" :step="1" unit="V" :fixed="0" />
      <Ctrl label="负载 R_L" v-model="RL" :min="1" :max="500" :step="1" unit="Ω" :log="true" :fixed="0" />
    </div>
    <canvas ref="cv" class="tf-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <div class="tf-out">
      <span>k = <b>{{ calc.k.toFixed(3) }}</b></span>
      <span>U₂ = <b>{{ calc.V2.toFixed(2) }}</b> V</span>
      <span>I₂ = <b>{{ calc.I2.toFixed(3) }}</b> A</span>
      <span>I₁ = <b>{{ calc.I1.toFixed(3) }}</b> A</span>
      <span>折算阻抗 Z_in = k²R_L = <b>{{ calc.Zin.toFixed(1) }}</b> Ω</span>
      <span>P₂ = <b>{{ calc.P.toFixed(2) }}</b> W</span>
    </div>
    <p class="tf-note">
      三条关系：<b>U₁/U₂ = N₁/N₂ = k</b>，<b>I₁/I₂ = 1/k</b>，<b>Z_in = k²·Z_L</b>。最后一条是"阻抗匹配"的核心——音响功放推动扬声器就靠它。
    </p>
  </div>
</template>

<style scoped>
.tf { display: flex; flex-direction: column; gap: 8px; }
.tf-ctrls { display: flex; flex-direction: column; gap: 1px; }
.tf-cv { width: 100%; height: 360px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.tf-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.tf-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.tf-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.tf-note b { color: var(--vp-c-text-2); }
</style>
