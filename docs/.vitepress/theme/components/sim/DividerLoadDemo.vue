<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { drawFrame, mapper, poly, dot, label, type Box, type Range } from '../../lib/plot'

const E = ref(12)
const R1 = ref(10)
const R2 = ref(10)
const RL = ref(100)

const par = computed(() => (R2.value * RL.value) / (R2.value + RL.value))
const U0 = computed(() => (E.value * R2.value) / (R1.value + R2.value)) // 空载
const Uout = computed(() => (E.value * par.value) / (R1.value + par.value))
const dev = computed(() => Math.abs(Uout.value - U0.value) / U0.value)

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  const b: Box = { x: 52, y: 26, w: w - 92, h: h - 76 }
  const r: Range = { xmin: 0, xmax: 100, ymin: 0, ymax: Math.max(E.value * 1.1, U0.value * 1.3) }
  drawFrame(ctx, b, r, { xLabel: '负载 R_L / Ω', yLabel: 'U_out / V' }, { grid: TC.grid, text3: TC.text3, text2: TC.text2 })
  const m = mapper(b, r)

  const pts: [number, number][] = []
  for (let i = 0; i <= 240; i++) {
    const rl = 0.5 * Math.pow(200, i / 240)
    const p = (R2.value * rl) / (R2.value + rl)
    pts.push(m(rl, (E.value * p) / (R1.value + p)))
  }
  poly(ctx, pts, SIG.v, 2.4)

  // 空载渐近线
  poly(ctx, [m(0, U0.value), m(100, U0.value)], TC.text3, 1.4, [5, 4])
  label(ctx, `空载 U₀=${U0.value.toFixed(2)}V`, b.x + 6, m(0, U0.value)[1] - 11, TC.text3, 'left', 10.5)

  const cur = m(Math.min(RL.value, 100), Uout.value)
  dot(ctx, cur[0], cur[1], 5, SIG.p)
  label(ctx, `R_L=${RL.value}Ω → ${Uout.value.toFixed(2)}V`, cur[0], cur[1] - 14, SIG.p, 'center', 11, true)
  label(ctx, `跌落 ${(dev.value * 100).toFixed(1)}%`, w / 2, h - 16, dev.value > 0.1 ? SIG.warn : TC.text3, 'center', 12, true)
})
</script>

<template>
  <div class="dl">
    <div class="dl-ctrls">
      <Ctrl label="电源 E" v-model="E" :min="1" :max="30" :step="0.5" unit="V" />
      <Ctrl label="R₁ 上臂" v-model="R1" :min="1" :max="100" :step="1" unit="Ω" />
      <Ctrl label="R₂ 下臂" v-model="R2" :min="1" :max="100" :step="1" unit="Ω" />
      <Ctrl label="负载 R_L" v-model="RL" :min="1" :max="100" :step="1" unit="Ω" />
    </div>
    <canvas ref="cv" class="dl-cv" />
    <div class="dl-out">
      <span>空载 U₀ = <b>{{ U0.toFixed(3) }}</b> V</span>
      <span>带载 U_out = <b>{{ Uout.toFixed(3) }}</b> V</span>
      <span>R₂∥R_L = <b>{{ par.toFixed(2) }}</b> Ω</span>
      <span>偏差 = <b>{{ (dev * 100).toFixed(1) }}</b> %</span>
    </div>
    <p class="dl-note">R_L 越接近 R₂，并联值偏离越大 → 分压比被"拉垮"。这就是<b>负载效应</b>，也是射极跟随器/运放缓冲存在的理由。</p>
  </div>
</template>

<style scoped>
.dl { display: flex; flex-direction: column; gap: 8px; }
.dl-ctrls { display: flex; flex-direction: column; gap: 1px; }
.dl-cv { width: 100%; height: 230px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.dl-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.dl-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.dl-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.6; }
.dl-note b { color: var(--vp-c-text-2); }
</style>
