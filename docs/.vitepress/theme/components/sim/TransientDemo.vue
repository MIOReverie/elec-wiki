<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { drawFrame, mapper, poly, dot, label, type Box, type Range } from '../../lib/plot'
import { resistor, battery, capacitor, inductor, wire, tag, ground } from '../../lib/parts'

const mode = ref<'RC' | 'RL'>('RC')
const E = ref(10)
const R = ref(10) // kΩ for RC / Ω for RL
const C = ref(100) // µF
const L = ref(100) // mH
const act = ref<'charge' | 'discharge'>('charge')
const t0 = ref(typeof performance !== 'undefined' ? performance.now() : 0)

function restart(v: 'charge' | 'discharge') {
  act.value = v
  t0.value = performance.now()
}

const tau = computed(() =>
  mode.value === 'RC' ? R.value * 1000 * C.value * 1e-6 : L.value / 1000 / Math.max(R.value, 0.01)
)
const f0 = computed(() => {
  const steady = mode.value === 'RC' ? E.value : E.value / Math.max(R.value, 0.01)
  return act.value === 'charge' ? 0 : steady
})
const fInf = computed(() => {
  const steady = mode.value === 'RC' ? E.value : E.value / Math.max(R.value, 0.01)
  return act.value === 'charge' ? steady : 0
})
const unit = computed(() => (mode.value === 'RC' ? 'u_C / V' : 'i_L / A'))
const name = computed(() => (mode.value === 'RC' ? 'u_C' : 'i_L'))

const cvLabel = computed(() => {
  const unitTxt = mode.value === 'RC' ? `R=${R.value} kΩ、C=${C.value} µF` : `R=${R.value} Ω、L=${L.value} mH`
  return `${mode.value} 一阶暂态响应（${act.value === 'charge' ? '零状态充电' : '零输入放电'}）：电源 ${E.value} V，${unitTxt}。` +
    `初始值 ${f0.value.toFixed(3)}，稳态值 ${fInf.value.toFixed(3)}，时间常数 τ=${tau.value.toFixed(4)} s，` +
    `1τ 到 63.2 %、3τ 到 95 %、5τ 到 99.3 %。`
})

const cv = ref<HTMLCanvasElement | null>(null)

const anim = useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const el = performance.now()
    const elapsed = (el - t0.value) / 1000
    const tauv = tau.value
    const ff0 = f0.value
    const ffin = fInf.value

    // 上半：电路图
    const ch = h * 0.4
    const L0 = 40, Rr = Math.min(w * 0.55, 300), T = 34, B = ch - 16
    const cy0 = (T + B) / 2
    wire(ctx, L0, T, L0, cy0 - 15, TC.text2)
    wire(ctx, L0, cy0 + 15, L0, B, TC.text2)
    battery(ctx, L0, cy0, false, TC.text)
    tag(ctx, `${E.value}V`, L0 - 14, cy0, TC.text, 'right', true)
    wire(ctx, L0, T, Rr, T, TC.text2)
    wire(ctx, L0, B, Rr, B, TC.text2)
    resistor(ctx, (L0 + Rr) / 2, T, true, TC.text2)
    tag(ctx, `R=${R.value}${mode.value === 'RC' ? 'kΩ' : 'Ω'}`, (L0 + Rr) / 2, T - 16, TC.text3)
    if (mode.value === 'RC') {
      capacitor(ctx, Rr, cy0, false, TC.text2)
      tag(ctx, `C=${C.value}µF`, Rr + 16, cy0, TC.text, 'left', true)
    } else {
      inductor(ctx, Rr, cy0, false, TC.text2)
      tag(ctx, `L=${L.value}mH`, Rr + 16, cy0, TC.text, 'left', true)
    }
    wire(ctx, Rr, T, Rr, cy0 - 15, TC.text2)
    wire(ctx, Rr, cy0 + 15, Rr, B, TC.text2)
    ground(ctx, (L0 + Rr) / 2 - 60, B, TC.text2)
    tag(ctx, act.value === 'charge' ? '开关合上（接通电源）' : '开关断开并短接（放电）', w - 8, 14, SIG.p, 'right', true)

    // 下半：响应曲线
    const b: Box = { x: 52, y: ch + 26, w: w - 92, h: h - ch - 66 }
    const tmax = tauv * 6
    const ylo = Math.min(ff0, ffin) - Math.abs(ffin - ff0) * 0.15 - 1e-9
    const yhi = Math.max(ff0, ffin) + Math.abs(ffin - ff0) * 0.15 + 1e-9
    const r: Range = { xmin: 0, xmax: tmax, ymin: Math.min(ylo, -0.001), ymax: yhi }
    drawFrame(ctx, b, r, { xLabel: 't / s', yLabel: unit.value }, { grid: TC.grid, text3: TC.text3, text2: TC.text2 })
    const m = mapper(b, r)

    const wave: [number, number][] = []
    for (let i = 0; i <= 300; i++) {
      const tt = (tmax * i) / 300
      wave.push(m(tt, ffin + (ff0 - ffin) * Math.exp(-tt / tauv)))
    }
    poly(ctx, wave, SIG.v, 2.4)

    // τ、3τ 参考线
    for (const [mult, col, txt] of [
      [1, SIG.q, 'τ → 63.2%'],
      [3, SIG.p, '3τ → 95%'],
      [5, TC.text3, '5τ → 99.3%']
    ] as [number, string, string][]) {
      const tt = tauv * mult
      if (tt > tmax) continue
      const v = ffin + (ff0 - ffin) * Math.exp(-mult)
      const p = m(tt, v)
      ctx.setLineDash([3, 4])
      ctx.strokeStyle = col
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(b.x, p[1]); ctx.lineTo(p[0], p[1]); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(p[0], b.y + b.h); ctx.lineTo(p[0], p[1]); ctx.stroke()
      ctx.setLineDash([])
      dot(ctx, p[0], p[1], 3.5, col)
      label(ctx, txt, p[0] + 4, p[1] - 10, col, 'left', 10)
    }

    // 当前时刻游标
    const tc = Math.min(elapsed, tmax)
    const vc = ffin + (ff0 - ffin) * Math.exp(-tc / tauv)
    const pc = m(tc, vc)
    dot(ctx, pc[0], pc[1], 5, SIG.v)
    label(ctx, `${vc.toFixed(3)}`, pc[0] + 8, pc[1] - 12, SIG.v, 'left', 11.5, true)

    label(
      ctx,
      `${name.value}(t) = ${ffin.toFixed(2)} + [${ff0.toFixed(2)} − ${ffin.toFixed(2)}]·e^(−t/${tauv.toFixed(3)})`,
      w / 2,
      h - 14,
      TC.text2,
      'center',
      12,
      true
    )
  },
  { animate: true }
)

const reducedMotion = useReducedMotion().reduced
</script>

<template>
  <div class="tr">
    <Seg
      v-model="mode"
      label="电路"
      :options="[
        { value: 'RC', label: 'RC · 电容电压' },
        { value: 'RL', label: 'RL · 电感电流' }
      ]"
    />
    <div class="tr-acts">
      <button :class="{ on: act === 'charge' }" @click="restart('charge')">
        {{ mode === 'RC' ? '充电 (零状态)' : '接通直流 (零状态)' }}
      </button>
      <button :class="{ on: act === 'discharge' }" @click="restart('discharge')">
        {{ mode === 'RC' ? '放电 (零输入)' : '短接释放 (零输入)' }}
      </button>
    </div>
    <div class="tr-ctrls">
      <Ctrl label="电源 E" v-model="E" :min="1" :max="30" :step="1" unit="V" :fixed="0" />
      <Ctrl
        label="电阻 R"
        v-model="R"
        :min="1"
        :max="100"
        :step="1"
        :unit="mode === 'RC' ? 'kΩ' : 'Ω'"
        :fixed="0"
      />
      <Ctrl v-if="mode === 'RC'" label="电容 C" v-model="C" :min="1" :max="1000" :step="1" unit="µF" :fixed="0" />
      <Ctrl v-else label="电感 L" v-model="L" :min="1" :max="1000" :step="1" unit="mH" :fixed="0" />
    </div>
    <canvas ref="cv" class="tr-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <button class="tr-play" type="button" @click="anim.togglePlay()">
      {{ anim.playing.value ? '⏸ 暂停' : '▶ 播放' }}<template v-if="reducedMotion && !anim.playing.value">（已按系统设置减少动态效果）</template>
    </button>
    <div class="tr-out">
      <span>f(0₊) = <b>{{ f0.toFixed(3) }}</b></span>
      <span>f(∞) = <b>{{ fInf.toFixed(3) }}</b></span>
      <span>τ = <b>{{ tau.toFixed(4) }}</b> s</span>
      <span v-if="mode === 'RC'">τ = R·C</span>
      <span v-else>τ = L/R</span>
    </div>
  </div>
</template>

<style scoped>
.tr { display: flex; flex-direction: column; gap: 8px; }
.tr-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.tr-acts button {
  padding: 5px 14px;
  font-size: 12.5px;
  font-family: inherit;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.tr-acts button.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); font-weight: 600; }
.tr-ctrls { display: flex; flex-direction: column; gap: 1px; }
.tr-cv { width: 100%; height: 380px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.tr-play {
  align-self: flex-start;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-family: inherit;
}
.tr-play:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.tr-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.tr-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
</style>
