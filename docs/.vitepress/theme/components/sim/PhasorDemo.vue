<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { poly, dot, label, arrow } from '../../lib/plot'

const Um = ref(6)
const Im = ref(3)
const f = ref(0.6)
const psi = ref(30)
const phi = ref(45) // u 超前 i 的角度

function reset() {
  Um.value = 6
  Im.value = 3
  f.value = 0.6
  psi.value = 30
  phi.value = 45
}

const cv = ref<HTMLCanvasElement | null>(null)
const W = 2 // 画 2 个周期

const info = computed(() => ({
  U: Um.value / Math.SQRT2,
  I: Im.value / Math.SQRT2,
  T: 1 / f.value,
  w: 2 * Math.PI * f.value,
  lead: phi.value >= 0 ? '电压超前电流' : '电压滞后电流'
}))

const cvLabel = computed(
  () =>
    `正弦量相量与波形演示：电压峰值 ${Um.value} V、电流峰值 ${Im.value} A、频率 ${f.value} Hz、` +
    `初相 ${psi.value}°、相位差 ${phi.value}°（${info.value.lead}）。` +
    `有效值 U=${info.value.U.toFixed(2)} V、I=${info.value.I.toFixed(2)} A，` +
    `角频率 ω=${info.value.w.toFixed(2)} rad/s，周期 T=${info.value.T.toFixed(2)} s。`
)

const anim = useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const cy = h * 0.5
    const rr = Math.min(h * 0.36, 92)
    const cx = 30 + rr
    const wx0 = cx + rr + 46
    const pw = Math.max(60, w - wx0 - 26)

    const ku = (rr * 0.92) / 10
    const ki = (rr * 0.62) / 5

    const om = 2 * Math.PI * f.value
    const pu = (psi.value * Math.PI) / 180
    const thU = om * t + pu
    const thI = thU - (phi.value * Math.PI) / 180

    /* ---- 左：旋转相量 ---- */
    ctx.strokeStyle = TC.grid
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - rr - 10, cy); ctx.lineTo(cx + rr + 10, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy - rr - 10); ctx.lineTo(cx, cy + rr + 10); ctx.stroke()

    const tipU: [number, number] = [cx + Um.value * ku * Math.cos(thU), cy - Um.value * ku * Math.sin(thU)]
    const tipI: [number, number] = [cx + Im.value * ki * Math.cos(thI), cy - Im.value * ki * Math.sin(thI)]
    arrow(ctx, cx, cy, tipI[0], tipI[1], SIG.i, 2.2, 8)
    arrow(ctx, cx, cy, tipU[0], tipU[1], SIG.v, 2.6, 10)
    dot(ctx, cx, cy, 3, TC.text)
    label(ctx, 'U̇', tipU[0] + 12 * Math.cos(thU), tipU[1] - 12 * Math.sin(thU) - 6, SIG.v, 'center', 12, true)
    label(ctx, 'İ', tipI[0] + 12 * Math.cos(thI), tipI[1] - 12 * Math.sin(thI) + 8, SIG.i, 'center', 12, true)

    // 投影虚线
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = SIG.v
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(tipU[0], tipU[1]); ctx.lineTo(cx, tipU[1]); ctx.stroke()
    ctx.setLineDash([])
    label(ctx, 'sin 投影 = 瞬时值', cx - 4, cy + rr + 22, TC.text3, 'right', 10.5)
    label(ctx, `ω = ${info.value.w.toFixed(2)} rad/s`, 12, 16, TC.text3, 'left', 10.5)
    label(ctx, `ψ = ${psi.value}°`, 12, 32, TC.text3, 'left', 10.5)

    /* ---- 右：波形 ---- */
    const T = info.value.T
    const span = W * T
    const Y = (v: number, k: number) => cy - v * k
    ctx.strokeStyle = TC.grid
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(wx0, cy); ctx.lineTo(wx0 + pw, cy); ctx.stroke()

    const uPts: [number, number][] = []
    const iPts: [number, number][] = []
    for (let i = 0; i <= 400; i++) {
      const tt = (span * i) / 400
      const x = wx0 + (pw * i) / 400
      uPts.push([x, Y(Um.value * Math.sin(om * tt + pu), ku)])
      iPts.push([x, Y(Im.value * Math.sin(om * tt + pu - (phi.value * Math.PI) / 180), ki)])
    }
    poly(ctx, iPts, SIG.i, 2)
    poly(ctx, uPts, SIG.v, 2.4)

    // 播放头
    const tNow = t % span
    const pxNow = wx0 + (pw * tNow) / span
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = TC.text3
    ctx.beginPath(); ctx.moveTo(pxNow, 18); ctx.lineTo(pxNow, h - 18); ctx.stroke()
    ctx.setLineDash([])
    dot(ctx, pxNow, Y(Um.value * Math.sin(om * tNow + pu), ku), 4.5, SIG.v)
    dot(ctx, pxNow, Y(Im.value * Math.sin(om * tNow + pu - (phi.value * Math.PI) / 180), ki), 4, SIG.i)

    // 相位差标注
    const zx = wx0 + 6
    const zy = 24
    ctx.fillStyle = SIG.q
    ctx.font = '11px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Δφ = ${phi.value}°  ${info.value.lead}`, zx, zy)

    // 连接线：相量 tip → 播放头
    ctx.setLineDash([3, 5])
    ctx.strokeStyle = TC.text3
    ctx.globalAlpha = 0.6
    ctx.beginPath(); ctx.moveTo(tipU[0], tipU[1]); ctx.lineTo(pxNow, Y(Um.value * Math.sin(om * tNow + pu), ku)); ctx.stroke()
    ctx.globalAlpha = 1
    ctx.setLineDash([])
  },
  { animate: true }
)

const reducedMotion = useReducedMotion().reduced
</script>

<template>
  <div class="ph">
    <div class="ph-ctrls">
      <Ctrl label="U_m" v-model="Um" :min="1" :max="10" :step="0.5" unit="V" />
      <Ctrl label="I_m" v-model="Im" :min="0.5" :max="5" :step="0.1" unit="A" />
      <Ctrl label="频率 f" v-model="f" :min="0.2" :max="2" :step="0.05" unit="Hz" />
      <Ctrl label="初相 ψ" v-model="psi" :min="0" :max="360" :step="5" unit="°" :fixed="0" />
      <Ctrl label="相位差 φ" v-model="phi" :min="-180" :max="180" :step="5" unit="°" :fixed="0" />
    </div>
    <canvas ref="cv" class="ph-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <button
      type="button"
      class="ph-reset"
      aria-label="重置相量演示：把峰值、频率、初相与相位差恢复到默认值"
      @click="reset"
    >重置</button>
    <button class="ph-play" type="button" @click="anim.togglePlay()">
      {{ anim.playing.value ? '⏸ 暂停' : '▶ 播放' }}<template v-if="reducedMotion && !anim.playing.value">（已按系统设置减少动态效果）</template>
    </button>
    <div class="ph-out">
      <span>有效值 U = <b>{{ info.U.toFixed(2) }}</b> V</span>
      <span>有效值 I = <b>{{ info.I.toFixed(2) }}</b> A</span>
      <span>ω = <b>{{ info.w.toFixed(2) }}</b> rad/s</span>
      <span>T = <b>{{ info.T.toFixed(2) }}</b> s</span>
      <span>{{ info.lead }} <b>{{ Math.abs(phi) }}°</b></span>
    </div>
  </div>
</template>

<style scoped>
.ph { display: flex; flex-direction: column; gap: 8px; }
.ph-ctrls { display: flex; flex-direction: column; gap: 1px; }
.ph-cv { width: 100%; height: 300px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.ph-play {
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
.ph-play:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.ph-reset {
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
.ph-reset:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.ph-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.ph-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
</style>
