<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { drawFrame, mapper, poly, dot, label, type Box, type Range } from '../../lib/plot'
import { resistor, battery, wire, tag } from '../../lib/parts'

const E = ref(24)
const R1 = ref(6)
const R2 = ref(12)
const R3 = ref(4)
const RL = ref(10)
const view = ref<'origin' | 'thevenin'>('origin')

// 精确解（结点法：结点 A、B）
const exact = computed(() => {
  const g1 = 1 / R1.value, g2 = 1 / R2.value, g3 = 1 / R3.value, gl = 1 / Math.max(RL.value, 1e-6)
  const a11 = g1 + g2 + g3, a12 = -g3, a21 = -g3, a22 = g3 + gl
  const b1 = (E.value / R1.value), b2 = 0
  const det = a11 * a22 - a12 * a21
  const Va = (b1 * a22 - a12 * b2) / det
  const Vb = (a11 * b2 - b1 * a21) / det
  return { Va, Vb, IL: Vb * gl }
})

// 戴维南等效
const th = computed(() => {
  const Uoc = (E.value * R2.value) / (R1.value + R2.value)
  const Req = R3.value + (R1.value * R2.value) / (R1.value + R2.value)
  const IL = Uoc / (Req + Math.max(RL.value, 1e-6))
  return { Uoc, Req, IL, UL: IL * Math.max(RL.value, 1e-6) }
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  const ch = h * 0.62
  const cy0 = ch * 0.5
  const L = 34, Rr = Math.min(w * 0.62, 330), T = 40, B = ch - 26

  if (view.value === 'origin') {
    wire(ctx, L, T, L, cy0 - 16, TC.text2)
    wire(ctx, L, cy0 + 16, L, B, TC.text2)
    battery(ctx, L, cy0, false, TC.text)
    tag(ctx, `E=${E.value}V`, L - 14, cy0, TC.text, 'right', true)

    wire(ctx, L, T, Rr, T, TC.text2)
    wire(ctx, L, B, Rr, B, TC.text2)
    const ax = L + (Rr - L) * 0.52
    const bx = L + (Rr - L) * 0.85
    resistor(ctx, (L + ax) / 2, T, true, TC.text2)
    tag(ctx, `R₁=${R1.value}Ω`, (L + ax) / 2, T - 17, TC.text3)

    wire(ctx, ax, T, ax, cy0 - 16, TC.text2)
    wire(ctx, ax, cy0 + 16, ax, B, TC.text2)
    resistor(ctx, ax, cy0, false, TC.text2)
    tag(ctx, `R₂=${R2.value}Ω`, ax - 14, cy0, TC.text3, 'right')
    dot(ctx, ax, T, 3.5, TC.text)
    label(ctx, 'A', ax, T - 30, TC.text, 'center', 11, true)

    resistor(ctx, (ax + bx) / 2, T, true, TC.text2)
    tag(ctx, `R₃=${R3.value}Ω`, (ax + bx) / 2, T - 17, TC.text3)
    wire(ctx, ax, T, (ax + bx) / 2 - 17, T, TC.text2)
    wire(ctx, (ax + bx) / 2 + 17, T, bx, T, TC.text2)

    wire(ctx, bx, T, bx, cy0 - 16, TC.text2)
    wire(ctx, bx, cy0 + 16, bx, B, TC.text2)
    resistor(ctx, bx, cy0, false, TC.text2)
    tag(ctx, `R_L=${RL.value}Ω`, bx + 14, cy0, TC.brand, 'left', true)
    dot(ctx, bx, T, 3.5, TC.text)
    label(ctx, 'B', bx, T - 30, TC.text, 'center', 11, true)
    label(ctx, `V_A=${exact.value.Va.toFixed(2)}V  V_B=${exact.value.Vb.toFixed(2)}V`, w - 8, 16, TC.text3, 'right', 11)
  } else {
    // 戴维南等效：Uoc 串 Req 再接 RL
    wire(ctx, L, T, L, cy0 - 16, TC.text2)
    wire(ctx, L, cy0 + 16, L, B, TC.text2)
    battery(ctx, L, cy0, false, TC.text)
    tag(ctx, `U_oc=${th.value.Uoc.toFixed(2)}V`, L - 14, cy0, TC.text, 'right', true)
    wire(ctx, L, T, Rr, T, TC.text2)
    wire(ctx, L, B, Rr, B, TC.text2)
    resistor(ctx, (L + Rr) / 2 - 40, T, true, TC.text2)
    tag(ctx, `R_eq=${th.value.Req.toFixed(2)}Ω`, (L + Rr) / 2 - 40, T - 17, TC.text3)
    resistor(ctx, Rr, cy0, false, TC.text2)
    tag(ctx, `R_L=${RL.value}Ω`, Rr + 14, cy0, TC.brand, 'left', true)
    wire(ctx, Rr, T, Rr, cy0 - 16, TC.text2)
    wire(ctx, Rr, cy0 + 16, Rr, B, TC.text2)
    label(ctx, '← 从 R_L 两端看进去的全部', (L + Rr) / 2, B + 30, TC.text3, 'center', 11)
  }

  // U_L – R_L 曲线（两种算法完全重合）
  const b: Box = { x: 52, y: ch + 22, w: w - 92, h: h - ch - 58 }
  const r: Range = { xmin: 0, xmax: 40, ymin: 0, ymax: th.value.Uoc * 1.15 }
  drawFrame(ctx, b, r, { xLabel: 'R_L / Ω', yLabel: 'U_L / V' }, { grid: TC.grid, text3: TC.text3, text2: TC.text2 })
  const m = mapper(b, r)
  const pts: [number, number][] = []
  for (let i = 0; i <= 200; i++) {
    const rl = 0.5 + (40 * i) / 200
    const u = (th.value.Uoc * rl) / (th.value.Req + rl)
    pts.push(m(rl, u))
  }
  poly(ctx, pts, TC.brand, 2.4)
  const cur = m(Math.min(RL.value, 40), (th.value.Uoc * RL.value) / (th.value.Req + RL.value))
  dot(ctx, cur[0], cur[1], 5, SIG.p)
  label(ctx, `${(th.value.Uoc * RL.value / (th.value.Req + RL.value)).toFixed(2)}V`, cur[0], cur[1] - 13, SIG.p, 'center', 11, true)
})
</script>

<template>
  <div class="th">
    <Seg
      v-model="view"
      label="视图"
      :options="[
        { value: 'origin', label: '原电路' },
        { value: 'thevenin', label: '戴维南等效' }
      ]"
    />
    <div class="th-ctrls">
      <Ctrl label="E" v-model="E" :min="1" :max="48" :step="1" unit="V" />
      <Ctrl label="R₁" v-model="R1" :min="1" :max="40" :step="1" unit="Ω" />
      <Ctrl label="R₂" v-model="R2" :min="1" :max="40" :step="1" unit="Ω" />
      <Ctrl label="R₃" v-model="R3" :min="1" :max="40" :step="1" unit="Ω" />
      <Ctrl label="R_L" v-model="RL" :min="1" :max="40" :step="0.5" unit="Ω" />
    </div>
    <canvas ref="cv" class="th-cv" />
    <div class="th-cmp">
      <div class="th-col">
        <span class="th-t">原电路（结点法精确解）</span>
        <span>I_L = <b>{{ exact.IL.toFixed(4) }}</b> A</span>
        <span>U_L = <b>{{ exact.Vb.toFixed(4) }}</b> V</span>
      </div>
      <div class="th-eq">＝</div>
      <div class="th-col">
        <span class="th-t">戴维南等效</span>
        <span>I_L = <b>{{ th.IL.toFixed(4) }}</b> A</span>
        <span>U_L = <b>{{ th.UL.toFixed(4) }}</b> V</span>
      </div>
    </div>
    <p class="th-formula">
      U_oc = E·R₂/(R₁+R₂) = <b>{{ th.Uoc.toFixed(3) }} V</b>，
      R_eq = R₃ + R₁∥R₂ = <b>{{ th.Req.toFixed(3) }} Ω</b>
      <br />（求 R_eq 时把独立电压源<b>短路</b>、电流源<b>开路</b>，受控源要保留）
    </p>
  </div>
</template>

<style scoped>
.th { display: flex; flex-direction: column; gap: 8px; }
.th-ctrls { display: flex; flex-direction: column; gap: 1px; }
.th-cv { width: 100%; height: 400px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.th-cmp { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.th-col { display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; color: var(--vp-c-text-2); flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 9px; background: var(--vp-c-bg-soft); }
.th-col b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.th-t { font-size: 11.5px; color: var(--vp-c-text-3); margin-bottom: 2px; }
.th-eq { font-size: 18px; color: var(--vp-c-brand-1); font-weight: 700; }
.th-formula { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.th-formula b { color: var(--vp-c-brand-1); }
</style>
