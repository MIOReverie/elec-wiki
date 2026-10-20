<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { poly, label } from '../../lib/plot'
import Ctrl from '../Ctrl.vue'

const N = ref(10) // 模数（2~16）
const speed = ref(1)
const cv = ref<HTMLCanvasElement | null>(null)

const cvLabel = computed(
  () =>
    `模 N 计数器波形演示：模数 N=${N.value}（二进制 ${N.value.toString(2).padStart(4, '0')}），速度 ${speed.value} 倍。` +
    `计到 N 时异步清零，因此只循环 0 到 N−1，构成 N 进制。`
)

const anim = useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const n = N.value
    const cycles = n // 一个完整模 N 周期所含的时钟数（计到 N 立即清零）
    const x0 = 56
    const pw = w - x0 - 22
    const rowH = (h - 32) / 5
    const cellW = pw / (cycles * 2)
    const rows = ['CLK', 'Q0', 'Q1', 'Q2', 'Q3']

    const levelAt = (row: number, idx: number) => {
      if (row === 0) return idx % 2 === 0 ? 1 : 0
      const c = Math.floor(idx / 2)
      const v = c % cycles
      return (v >> (row - 1)) & 1
    }

    const tc = (t * speed.value) % cycles
    const k = Math.floor(tc)

    rows.forEach((name, row) => {
      const yBase = 18 + rowH * (row + 0.5)
      const hi = yBase - rowH * 0.3
      const lo = yBase + rowH * 0.3
      label(ctx, name, x0 - 8, yBase, row === 0 ? TC.text2 : SIG.i, 'right', 11.5, true)
      ctx.strokeStyle = TC.grid
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(x0, lo); ctx.lineTo(x0 + pw, lo); ctx.stroke()
      ctx.globalAlpha = 1

      const pts: [number, number][] = []
      for (let c = 0; c < cycles; c++) {
        const xa = x0 + c * 2 * cellW
        const xb = xa + cellW
        const xc = xa + 2 * cellW
        const va = levelAt(row, c * 2)
        const yv = va ? hi : lo
        const yn = va ? lo : hi
        pts.push([xa, yv], [xb, yv], [xb, yn], [xc, yn])
      }
      poly(ctx, pts, row === 0 ? TC.text2 : SIG.v, 2)
    })

    // 计到 N 的清零边界（右端虚线）
    const clearX = x0 + cycles * 2 * cellW
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = SIG.warn
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(clearX, 12); ctx.lineTo(clearX, h - 12); ctx.stroke()
    ctx.setLineDash([])
    label(ctx, `计到 ${n}（${n.toString(2).padStart(4, '0')}）即异步清零`, clearX + 4, 14, SIG.warn, 'left', 11, true)

    // 播放头 + 当前计数值
    const px = x0 + (tc / cycles) * pw
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = SIG.p
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(px, 12); ctx.lineTo(px, h - 10); ctx.stroke()
    ctx.setLineDash([])
    label(ctx, `计数 = ${k}  （${k.toString(2).padStart(4, '0')}）`, px + 8, 14, SIG.p, 'left', 12, true)
  },
  { animate: true }
)

const reducedMotion = useReducedMotion().reduced
</script>

<template>
  <div class="mc">
    <div class="mc-bar">
      <Ctrl label="模数 N" v-model="N" :min="2" :max="16" :step="1" :fixed="0" />
      <Ctrl label="速度" v-model="speed" :min="0.25" :max="3" :step="0.25" unit="×" />
    </div>
    <canvas ref="cv" class="mc-cv" role="img" :aria-label="cvLabel" />
    <p class="sr-only">{{ cvLabel }}</p>
    <button class="mc-play" type="button" @click="anim.togglePlay()">
      {{ anim.playing.value ? '⏸ 暂停' : '▶ 播放' }}<template v-if="reducedMotion && !anim.playing.value">（已按系统设置减少动态效果）</template>
    </button>
    <p class="mc-note">
      这就是<b>异步清零法</b>：计数器自由跑 0 → N−1，一旦出现 N（二进制 1010 对十进制）立刻被 ̄RD 拉回 0，于是只循环 0~N−1，构成 <b>N 进制</b>。把 N 改成 6、12 看看循环长度怎么变。
    </p>
  </div>
</template>

<style scoped>
.mc { display: flex; flex-direction: column; gap: 8px; }
.mc-bar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
.mc-cv { width: 100%; height: 240px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.mc-play {
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
.mc-play:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.mc-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.mc-note b { color: var(--vp-c-text-2); }
</style>
