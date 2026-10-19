<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { poly, dot, label } from '../../lib/plot'

const dir = ref<'up' | 'down'>('up')
const bits = ref(4)
const speed = ref(1)

const cv = ref<HTMLCanvasElement | null>(null)

const rows = computed(() => ['CLK', ...Array.from({ length: bits.value }, (_, i) => `Q${i}`)])

useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const n = bits.value
    const max = Math.pow(2, n)
    const cycles = max
    const x0 = 52
    const pw = w - x0 - 26
    const rowH = (h - 30) / (n + 1)
    const cellW = pw / (cycles * 2)

    // 时刻
    const tc = (t * speed.value) % cycles
    const k = Math.floor(tc)

    const levelAt = (row: number, idx: number) => {
      // row 0 = CLK（占空比 50%），row i+1 = Qi，翻转周期 2^i 个时钟
      if (row === 0) return idx % 2 === 0 ? 1 : 0
      const div = Math.pow(2, row - 1)
      const up = Math.floor(idx / (div * 2)) % 2 === 0 ? 1 : 0
      // 减计数 = 加计数逐位取反
      return dir.value === 'up' ? up : 1 - up
    }

    rows.value.forEach((name, row) => {
      const yBase = 20 + rowH * (row + 0.5)
      const hi = yBase - rowH * 0.3
      const lo = yBase + rowH * 0.3
      label(ctx, name, x0 - 8, yBase, row === 0 ? TC.text2 : SIG.i, 'right', 11.5, true)
      ctx.strokeStyle = TC.grid
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(x0, lo); ctx.lineTo(x0 + pw, lo); ctx.stroke()
      ctx.globalAlpha = 1

      const pts: [number, number][] = []
      // 每个时钟占 2 个格
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

    // 播放头
    const px = x0 + (tc / cycles) * pw
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = SIG.p
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(px, 12); ctx.lineTo(px, h - 10); ctx.stroke()
    ctx.setLineDash([])

    // 当前值
    let val = k
    if (dir.value === 'down') val = max - 1 - k
    const bin = val.toString(2).padStart(n, '0')
    const q = Array.from({ length: n }, (_, i) => levelAt(i + 1, k * 2))
    const qval = q.reduce((acc, b, i) => acc + b * Math.pow(2, i), 0)
    label(ctx, `计数 = ${qval}`, px + 8, 14, SIG.p, 'left', 12, true)
    label(
      ctx,
      `二进制 ${bin.split('').reverse().join('')}  (Q${n - 1}…Q0)   十六进制 0x${qval.toString(16).toUpperCase()}`,
      w / 2,
      h - 8,
      TC.text2,
      'center',
      11.5
    )
  },
  { animate: true }
)
</script>

<template>
  <div class="cd">
    <div class="cd-bar">
      <Seg
        v-model="dir"
        label="方向"
        :options="[
          { value: 'up', label: '加计数' },
          { value: 'down', label: '减计数' }
        ]"
      />
      <Ctrl label="位数" v-model="bits" :min="2" :max="4" :step="1" :fixed="0" />
      <Ctrl label="速度" v-model="speed" :min="0.25" :max="3" :step="0.25" unit="×" />
    </div>
    <canvas ref="cv" class="cd-cv" />
    <p class="cd-note">
      看关键规律：<b>Q0 每个时钟翻一次，Q1 每 2 个，Q2 每 4 个…</b> —— 频率逐级二分频，所以计数器同时也是<b>分频器</b>。
    </p>
  </div>
</template>

<style scoped>
.cd { display: flex; flex-direction: column; gap: 8px; }
.cd-bar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
.cd-cv { width: 100%; height: 260px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.cd-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.cd-note b { color: var(--vp-c-text-2); }
</style>
