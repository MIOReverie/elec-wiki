<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label } from '../../lib/plot'

const mode = ref<'half' | 'bridge' | 'filtered'>('filtered')
const Vm = ref(20)
const f = ref(50)
const R = ref(200)
const C = ref(470)

const sim = computed(() => {
  const steps = 2400
  const cycles = 4
  const T = 1 / f.value
  const total = cycles * T
  const dt = total / steps
  const tau = Math.max(R.value, 0.01) * (C.value * 1e-6)
  const out: number[] = []
  const rect: number[] = []
  const inp: number[] = []
  let vc = 0
  let lastIdx = 0
  for (let i = 0; i <= steps; i++) {
    const tt = i * dt
    const s = Vm.value * Math.sin(2 * Math.PI * f.value * tt)
    const r = mode.value === 'half' ? Math.max(0, s) : Math.abs(s)
    inp.push(s)
    rect.push(r)
    if (mode.value === 'filtered') {
      vc = r > vc ? r : vc * Math.exp(-dt / Math.max(tau, 1e-12))
      out.push(vc)
    } else {
      out.push(r)
    }
    lastIdx = i
  }
  // 用最后一个周期统计
  const per = Math.round(steps / cycles)
  const seg = out.slice(steps - per)
  const vdc = seg.reduce((a, b) => a + b, 0) / seg.length
  const vmax = Math.max(...seg)
  const vmin = Math.min(...seg)
  return { out, rect, inp, dt, vdc, vr: vmax - vmin, vmax, vmin, total }
})

const MODE_NAME = { half: '半波整流', bridge: '桥式全波整流', filtered: '全波整流加电容滤波' } as const
const cvLabel = computed(() => {
  const s = sim.value
  return `整流滤波波形（${MODE_NAME[mode.value]}）：峰值 ${Vm.value} V、频率 ${f.value} Hz、` +
    `负载电阻 ${R.value} Ω${mode.value === 'filtered' ? `、滤波电容 ${C.value} µF` : ''}。` +
    `直流输出 ${s.vdc.toFixed(2)} V，纹波 ${s.vr.toFixed(3)} V，纹波系数 ${((s.vr / Math.max(s.vdc, 1e-6)) * 100).toFixed(2)} %。`
})

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h, t }) => {
  const s = sim.value
  const b = { x: 50, y: 22, w: w - 86, h: h - 62 }
  const ymax = Vm.value * 1.15
  const Y = (v: number) => b.y + b.h - ((v + ymax * 0.05) / (ymax * 1.1)) * b.h
  const X = (i: number) => b.x + (b.w * i) / s.inp.length

  ctx.strokeStyle = TC.grid
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(b.x, Y(0)); ctx.lineTo(b.x + b.w, Y(0)); ctx.stroke()
  label(ctx, '0', b.x - 6, Y(0), TC.text3, 'right', 10.5)

  const iP: [number, number][] = []
  const rP: [number, number][] = []
  const oP: [number, number][] = []
  for (let i = 0; i < s.inp.length; i++) {
    iP.push([X(i), Y(s.inp[i])])
    rP.push([X(i), Y(s.rect[i])])
    oP.push([X(i), Y(s.out[i])])
  }
  poly(ctx, iP, TC.text3, 1.4, [4, 4])
  if (mode.value === 'filtered') poly(ctx, rP, SIG.v, 1.6)
  poly(ctx, oP, mode.value === 'filtered' ? SIG.p : SIG.v, 2.6)

  // 直流平均线
  const ydc = Y(s.vdc)
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = SIG.p
  ctx.beginPath(); ctx.moveTo(b.x, ydc); ctx.lineTo(b.x + b.w, ydc); ctx.stroke()
  ctx.setLineDash([])
  label(ctx, `U_dc=${s.vdc.toFixed(2)}V`, b.x + b.w - 4, ydc - 10, SIG.p, 'right', 11, true)

  // 游标
  const steps = s.inp.length - 1
  const cur = Math.floor(((t * 0.4) % 1) * steps)
  dot(ctx, X(cur), Y(s.out[cur]), 4.5, SIG.p)

  label(ctx, '虚线：交流输入', b.x + 6, b.y + 10, TC.text3, 'left', 10.5)
  label(ctx, mode.value === 'filtered' ? '橙色：整流后（未滤波）' : '橙色：整流输出', b.x + 6, b.y + 26, SIG.v, 'left', 10.5)
  label(ctx, '绿色：最终直流输出', b.x + 6, b.y + 42, SIG.p, 'left', 10.5)
  label(ctx, 't', b.x + b.w, b.y + b.h + 16, TC.text3, 'right', 10.5)
})
</script>

<template>
  <div class="rc">
    <Seg
      v-model="mode"
      label="电路"
      :options="[
        { value: 'half', label: '半波整流' },
        { value: 'bridge', label: '桥式全波整流' },
        { value: 'filtered', label: '全波 + 电容滤波' }
      ]"
    />
    <div class="rc-ctrls">
      <Ctrl label="峰值 U_m" v-model="Vm" :min="5" :max="60" :step="1" unit="V" :fixed="0" />
      <Ctrl label="频率 f" v-model="f" :min="50" :max="400" :step="50" unit="Hz" :fixed="0" />
      <Ctrl label="负载 R" v-model="R" :min="10" :max="5000" :step="10" unit="Ω" :log="true" :fixed="0" />
      <Ctrl v-if="mode === 'filtered'" label="滤波电容 C" v-model="C" :min="1" :max="4700" :step="10" unit="µF" :log="true" :fixed="0" />
    </div>
    <canvas ref="cv" class="rc-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <div class="rc-out">
      <span>U_dc = <b>{{ sim.vdc.toFixed(2) }}</b> V</span>
      <span>纹波 ΔU = <b>{{ sim.vr.toFixed(3) }}</b> V</span>
      <span>纹波系数 = <b>{{ ((sim.vr / Math.max(sim.vdc, 1e-6)) * 100).toFixed(2) }}</b> %</span>
      <span>理论值 = <b>{{ (mode === 'half' ? Vm / Math.PI : (2 * Vm) / Math.PI).toFixed(2) }}</b> V</span>
    </div>
    <p class="rc-note">
      半波 U_dc = U_m/π ≈ 0.45U₂，全波 U_dc = 2U_m/π ≈ 0.9U₂（U₂ 为有效值）。
      滤波电容按 <b>R·C ≫ T/2</b> 选取才平滑；C 越大纹波越小，但<b>冲击电流</b>越大。
    </p>
  </div>
</template>

<style scoped>
.rc { display: flex; flex-direction: column; gap: 8px; }
.rc-ctrls { display: flex; flex-direction: column; gap: 1px; }
.rc-cv { width: 100%; height: 300px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.rc-out { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--vp-c-text-2); }
.rc-out b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.rc-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.rc-note b { color: var(--vp-c-text-2); }
</style>
