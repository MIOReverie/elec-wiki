<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label, arrow } from '../../lib/plot'
import { resistor, battery, ground, wire, tag } from '../../lib/parts'

const mode = ref<'KCL' | 'KVL'>('KCL')

/* --- KCL --- */
const i1 = ref(2)
const i2 = ref(1.5)
const i3 = ref(1)
const i4 = computed(() => i1.value + i2.value + i3.value)

/* --- KVL --- */
const E = ref(12)
const R1 = ref(4)
const R2 = ref(6)
const R3 = ref(2)
const Ik = computed(() => E.value / (R1.value + R2.value + R3.value))
const drops = computed(() => [Ik.value * R1.value, Ik.value * R2.value, Ik.value * R3.value])

const cvLabel = computed(() =>
  mode.value === 'KCL'
    ? `KCL 节点电流演示：流入电流 I₁=${i1.value.toFixed(2)} A、I₂=${i2.value.toFixed(2)} A、I₃=${i3.value.toFixed(2)} A，` +
        `流出电流 I₄=${i4.value.toFixed(2)} A，流入之和等于流出之和。`
    : `KVL 回路电压演示：电动势 ${E.value} V，电阻 R₁=${R1.value} Ω、R₂=${R2.value} Ω、R₃=${R3.value} Ω，` +
        `回路电流 ${Ik.value.toFixed(3)} A，各段压降 ${drops.value.map((d) => d.toFixed(2) + ' V').join('、')}，代数和为零。`
)

const cv = ref<HTMLCanvasElement | null>(null)

useCanvas(cv, ({ ctx, w, h }) => {
  if (mode.value === 'KCL') {
    const cx = w * 0.5
    const cy = h * 0.5
    const R = 12
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, 7)
    ctx.fillStyle = TC.brand
    ctx.fill()
    label(ctx, '节点', cx, cy + 30, TC.text2, 'center', 11)

    const scale = 26 / Math.max(Math.abs(i4.value), 2.2)
    const branches: { a: number; v: number; dir: 1 | -1; name: string }[] = [
      { a: -Math.PI * 0.82, v: i1.value, dir: 1, name: 'I₁' },
      { a: -Math.PI * 0.18, v: i2.value, dir: 1, name: 'I₂' },
      { a: Math.PI * 0.18, v: i3.value, dir: 1, name: 'I₃' },
      { a: Math.PI * 0.82, v: i4.value, dir: -1, name: 'I₄' }
    ]
    for (const br of branches) {
      const len = 40 + Math.abs(br.v) * scale
      const ux = Math.cos(br.a)
      const uy = Math.sin(br.a)
      const x0 = cx + ux * R
      const y0 = cy + uy * R
      const x1 = cx + ux * (R + len)
      const y1 = cy + uy * (R + len)
      // 指向节点 = 流入
      const [ax, ay, bx, by] = br.dir === 1 ? [x1, y1, x0, y0] : [x0, y0, x1, y1]
      arrow(ctx, ax, ay, bx, by, SIG.i, 2, 9)
      const lx = cx + ux * (R + len + 22)
      const ly = cy + uy * (R + len + 22)
      label(ctx, `${br.name}=${br.v.toFixed(2)}A`, lx, ly, SIG.i, 'center', 11.5, true)
    }
    label(
      ctx,
      `ΣI = I₁ + I₂ + I₃ − I₄ = ${(i1.value + i2.value + i3.value - i4.value).toFixed(2)} A`,
      w / 2,
      20,
      SIG.p,
      'center',
      12.5,
      true
    )
    label(ctx, '流入 = 流出（电荷守恒）', w / 2, h - 14, TC.text3, 'center', 11.5)
  } else {
    // 环路图
    const L = 40, Rr = Math.min(w * 0.5, 300), T = 58, B = 190
    const cy0 = (T + B) / 2
    wire(ctx, L, T, L, cy0 - 16, TC.text2)
    wire(ctx, L, cy0 + 16, L, B, TC.text2)
    battery(ctx, L, cy0, false, TC.text)
    tag(ctx, `E=${E.value}V`, L - 16, cy0, TC.text, 'right', true)

    wire(ctx, L, T, Rr, T, TC.text2)
    wire(ctx, L, B, Rr, B, TC.text2)
    wire(ctx, Rr, T, Rr, B, TC.text2)
    resistor(ctx, (L + Rr) / 2, T, true, TC.text2)
    resistor(ctx, Rr, cy0, false, TC.text2)
    resistor(ctx, (L + Rr) / 2, B, true, TC.text2)
    ground(ctx, (L + Rr) / 2 - 70, B, TC.text2)

    tag(ctx, `R₁=${R1.value}Ω`, (L + Rr) / 2, T - 18, TC.text3)
    tag(ctx, `R₂=${R2.value}Ω`, Rr + 16, cy0, TC.text3, 'left')
    tag(ctx, `R₃=${R3.value}Ω`, (L + Rr) / 2, B + 22, TC.text3)
    tag(ctx, `I = ${Ik.value.toFixed(3)} A`, L + 24, T - 18, SIG.i, 'left', true)

    // 电位高度剖面（沿回路走一圈）
    const y0 = h - 44
    const x0 = 46, x1 = w - 26
    const span = x1 - x0
    const maxV = E.value
    const Y = (v: number) => y0 - (v / (maxV * 1.05)) * 74
    const seg = span / 4
    const pts: [number, number][] = [
      [x0, Y(0)],
      [x0 + seg, Y(E.value)],
      [x0 + 2 * seg, Y(E.value - drops.value[0])],
      [x0 + 3 * seg, Y(E.value - drops.value[0] - drops.value[1])],
      [x1, Y(0)]
    ]
    // 基线
    poly(ctx, [[x0, y0], [x1, y0]], TC.grid, 1)
    poly(ctx, pts, SIG.v, 2.4)
    for (const p of pts) dot(ctx, p[0], p[1], 3.5, SIG.v)
    label(ctx, '+E', (x0 + x0 + seg) / 2, Y(E.value) - 12, SIG.p, 'center', 11, true)
    label(ctx, `−U₁=${drops.value[0].toFixed(2)}V`, x0 + 1.5 * seg, Y(E.value - drops.value[0]) + 14, SIG.v, 'center', 10.5)
    label(ctx, `−U₂=${drops.value[1].toFixed(2)}V`, x0 + 2.5 * seg, Y(E.value - drops.value[0] - drops.value[1]) + 14, SIG.v, 'center', 10.5)
    label(ctx, `−U₃=${drops.value[2].toFixed(2)}V`, x0 + 3.5 * seg, Y(0) + 14, SIG.v, 'center', 10.5)
    label(ctx, '沿回路走一圈，电位升 = 电位降', w / 2, y0 + 26, TC.text3, 'center', 11.5)
    label(
      ctx,
      `ΣU = E − ${drops.value.map((d) => d.toFixed(2)).join(' − ')} = ${(E.value - drops.value.reduce((a, b) => a + b, 0)).toFixed(2)} V`,
      w / 2,
      h - 6,
      SIG.p,
      'center',
      12.5,
      true
    )
  }
})
</script>

<template>
  <div class="kk">
    <Seg
      v-model="mode"
      label="定律"
      :options="[
        { value: 'KCL', label: 'KCL · 节点电流' },
        { value: 'KVL', label: 'KVL · 回路电压' }
      ]"
    />
    <div v-if="mode === 'KCL'" class="kk-ctrls">
      <Ctrl label="I₁ 流入" v-model="i1" :min="0" :max="5" :step="0.1" unit="A" />
      <Ctrl label="I₂ 流入" v-model="i2" :min="0" :max="5" :step="0.1" unit="A" />
      <Ctrl label="I₃ 流入" v-model="i3" :min="0" :max="5" :step="0.1" unit="A" />
      <p class="kk-note">I₄ 由 KCL 自动决定：<b>I₄ = I₁+I₂+I₃ = {{ i4.toFixed(2) }} A</b>，改任意一项它都跟着变。</p>
    </div>
    <div v-else class="kk-ctrls">
      <Ctrl label="电动势 E" v-model="E" :min="1" :max="30" :step="0.5" unit="V" />
      <Ctrl label="R₁" v-model="R1" :min="1" :max="20" :step="0.5" unit="Ω" />
      <Ctrl label="R₂" v-model="R2" :min="1" :max="20" :step="0.5" unit="Ω" />
      <Ctrl label="R₃" v-model="R3" :min="1" :max="20" :step="0.5" unit="Ω" />
    </div>
    <canvas ref="cv" class="kk-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
  </div>
</template>

<style scoped>
.kk { display: flex; flex-direction: column; gap: 8px; }
.kk-ctrls { display: flex; flex-direction: column; gap: 1px; }
.kk-note { margin: 4px 0 0; font-size: 12.5px; color: var(--vp-c-text-3); }
.kk-note b { color: var(--vp-c-brand-1); }
.kk-cv { width: 100%; height: 320px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
</style>
