<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { drawFrame, mapper, poly, dot, label, fmtNum, type Box, type Range } from '../../lib/plot'
import { resistor, battery, ground, wire, tag } from '../../lib/parts'

const E = ref(12)
const R0 = ref(1)
const RL = ref(10)
const state = ref<'normal' | 'open' | 'short'>('normal')

const calc = computed(() => {
  const e = E.value
  const r0 = Math.max(R0.value, 0.001)
  if (state.value === 'open') return { I: 0, U: e, PL: 0, PE: 0, eta: 0, isc: e / r0 }
  const rl = state.value === 'short' ? 0 : Math.max(RL.value, 0.01)
  const I = e / (r0 + rl)
  return { I, U: I * rl, PL: I * I * rl, PE: e * I, eta: rl / (r0 + rl), isc: e / r0 }
})

const DEFAULT = { E: 12, R0: 1, RL: 10, state: 'normal' as const }
function reset() {
  E.value = DEFAULT.E
  R0.value = DEFAULT.R0
  RL.value = DEFAULT.RL
  state.value = DEFAULT.state
}

const cv = ref<HTMLCanvasElement | null>(null)

const cvLabel = computed(() => {
  const stateName = { normal: '有载', open: '开路', short: '短路' }[state.value]
  return `电源外特性演示：电动势 ${E.value} V、内阻 ${R0} Ω、负载 ${RL} Ω，状态${stateName}。` +
    `电流 ${calc.value.I.toFixed(3)} A，负载端电压 ${calc.value.U.toFixed(2)} V，` +
    `负载功率 ${calc.value.PL.toFixed(2)} W，效率 ${(calc.value.eta * 100).toFixed(1)} %。`
})

useCanvas(cv, ({ ctx, w, h }) => {
  // 左：电路图
  const cw = Math.min(300, w * 0.46)
  const cy0 = h * 0.5
  const L = 30, R = cw - 30, T = cy0 - 55, B = cy0 + 55
  // 电源在左边竖线，内阻在上边横线，负载在右边竖线
  wire(ctx, L, T, L, cy0 - 16, TC.text2)
  wire(ctx, L, cy0 + 16, L, B, TC.text2)
  battery(ctx, L, cy0, false, TC.text)
  tag(ctx, `E=${E.value}V`, L - 14, cy0, TC.text, 'right', true)

  const r0x = L + 62
  wire(ctx, L, T, r0x - 17, T, TC.text2)
  wire(ctx, r0x + 17, T, R, T, TC.text2)
  resistor(ctx, r0x, T, true, TC.text2)
  tag(ctx, `R₀=${R0.value}Ω`, r0x, T - 18, TC.text3)

  wire(ctx, L, B, R, B, TC.text2)
  wire(ctx, R, T, R, cy0 - 16, TC.text2)
  wire(ctx, R, cy0 + 16, R, B, TC.text2)
  // 负载
  if (state.value === 'open') {
    wire(ctx, R, T, R, T + 40, TC.text2)
    wire(ctx, R, B, R, B - 40, TC.text2)
    const gapY = cy0
    ctx.setLineDash([4, 3])
    wire(ctx, R, B - 40, R, gapY, TC.text3)
    ctx.setLineDash([])
    dot(ctx, R, T + 40, 3, TC.text3)
    dot(ctx, R, B - 40, 3, TC.text3)
    tag(ctx, '开路', R + 14, cy0, SIG.warn, 'left', true)
  } else if (state.value === 'short') {
    wire(ctx, R, T, R, B, TC.text2)
    tag(ctx, '短路！', R + 14, cy0, SIG.warn, 'left', true)
  } else {
    resistor(ctx, R, cy0, false, TC.text2)
    tag(ctx, `R_L=${RL.value}Ω`, R + 14, cy0, TC.text, 'left', true)
  }
  ground(ctx, (L + R) / 2, B, TC.text2)

  // 电流标注
  const I = calc.value.I
  tag(ctx, `I = ${I.toFixed(3)} A`, (L + R) / 2, T - 14, SIG.i, 'center', true)
  tag(ctx, `U端 = ${calc.value.U.toFixed(2)} V`, (L + R) / 2, B + 26, SIG.v, 'center', true)

  // 右：外特性 + 负载线
  const px0 = cw + 18
  const b: Box = { x: px0 + 40, y: 26, w: Math.max(40, w - px0 - 74), h: h - 74 }
  const isc = Math.max(calc.value.isc, 0.001)
  const r: Range = { xmin: 0, xmax: isc * 1.15, ymin: 0, ymax: E.value * 1.15 }
  drawFrame(ctx, b, r, { xLabel: 'I / A', yLabel: 'U / V' }, { grid: TC.grid, text3: TC.text3, text2: TC.text2 })
  const m = mapper(b, r)
  poly(ctx, [m(0, E.value), m(isc, 0)], SIG.v, 2.4)
  label(ctx, '电源外特性 U=E−IR₀', b.x + b.w - 4, m(0, E.value)[1] - 12, SIG.v, 'right', 10.5, true)
  if (state.value === 'normal') {
    poly(ctx, [m(0, 0), m(Math.min(r.xmax, E.value / Math.max(RL.value, 0.01)), E.value)], SIG.i, 2, [5, 4])
    label(ctx, '负载线 U=IR_L', b.x + b.w - 4, m(0, 0)[1] + 12, SIG.i, 'right', 10.5)
  }
  const op = m(calc.value.I, calc.value.U)
  dot(ctx, op[0], op[1], 5, SIG.p)
  label(ctx, '工作点', op[0] + 8, op[1] - 10, SIG.p, 'left', 11, true)
})
</script>

<template>
  <div class="ohm">
    <div class="o-ctrls">
      <Ctrl label="电动势 E" v-model="E" :min="1" :max="24" :step="0.5" unit="V" />
      <Ctrl label="内阻 R₀" v-model="R0" :min="0" :max="10" :step="0.1" unit="Ω" />
      <Ctrl label="负载 R_L" v-model="RL" :min="0.5" :max="100" :step="0.5" unit="Ω" :log="true" />
      <Seg
        v-model="state"
        label="状态"
        :options="[
          { value: 'normal', label: '有载' },
          { value: 'open', label: '开路' },
          { value: 'short', label: '短路' }
        ]"
      />
      <button
        type="button"
        class="o-reset"
        aria-label="重置欧姆定律演示：把电动势、内阻、负载与状态恢复到默认值"
        @click="reset"
      >重置</button>
    </div>
    <canvas ref="cv" class="o-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <div class="o-out">
      <span>I = <b>{{ calc.I.toFixed(3) }}</b> A</span>
      <span>U<sub>负载</sub> = <b>{{ calc.U.toFixed(2) }}</b> V</span>
      <span>P<sub>负载</sub> = <b>{{ calc.PL.toFixed(2) }}</b> W</span>
      <span>P<sub>电源</sub> = <b>{{ calc.PE.toFixed(2) }}</b> W</span>
      <span>P<sub>内耗</sub> = <b>{{ (calc.PE - calc.PL).toFixed(2) }}</b> W</span>
      <span>η = <b>{{ (calc.eta * 100).toFixed(1) }}</b> %</span>
    </div>
  </div>
</template>

<style scoped>
.ohm { display: flex; flex-direction: column; gap: 8px; }
.o-ctrls { display: flex; flex-direction: column; gap: 1px; }
.o-cv { width: 100%; height: 280px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.o-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.o-reset {
  align-self: flex-start;
  margin-top: 4px;
  padding: 4px 12px;
  font-size: 12px;
  font-family: inherit;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}
.o-reset:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.o-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
</style>
