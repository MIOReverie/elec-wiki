<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

interface GN {
  id: string
  short: string
  label: string
  layer: number
  page: string
}

const NODES: GN[] = [
  { id: 'c01', short: '01', label: '电路模型与参考方向', layer: 0, page: '/ee/01-basics/model-reference' },
  { id: 'c02', short: '02', label: '基尔霍夫定律与电位', layer: 1, page: '/ee/01-basics/kcl-kvl' },
  { id: 'c03', short: '03', label: '串并联与电源等效', layer: 2, page: '/ee/02-methods/equivalent' },
  { id: 'c06', short: '06', label: '储能元件与换路定则', layer: 2, page: '/ee/03-transient/elements' },
  { id: 'c04', short: '04', label: '支路电流法 / 结点电压法', layer: 3, page: '/ee/02-methods/nodal' },
  { id: 'c07', short: '07', label: '三要素法 RC / RL', layer: 3, page: '/ee/03-transient/three-factor' },
  { id: 'c05', short: '05', label: '叠加 · 戴维南 · 最大功率', layer: 4, page: '/ee/02-methods/theorems' },
  { id: 'c08', short: '08', label: '正弦量与相量法', layer: 4, page: '/ee/04-ac/phasor' },
  { id: 'c09', short: '09', label: 'RLC 串联与阻抗', layer: 5, page: '/ee/04-ac/rlc' },
  { id: 'c22', short: '22', label: '整流 · 滤波 · 稳压', layer: 5, page: '/ee/08-electronics/rectifier' },
  { id: 'c10', short: '10', label: '功率与功率因数', layer: 6, page: '/ee/04-ac/power' },
  { id: 'c11', short: '11', label: '谐振与频率特性', layer: 6, page: '/ee/04-ac/resonance' },
  { id: 'c14', short: '14', label: '磁路基础', layer: 6, page: '/ee/06-machine/magnetic' },
  { id: 'c12', short: '12', label: '三相电路', layer: 7, page: '/ee/05-three-phase/circuit' },
  { id: 'c23', short: '23', label: '数字电路基础', layer: 7, page: '/ee/08-electronics/digital-basic' },
  { id: 'c13', short: '13', label: '三相功率与测量', layer: 8, page: '/ee/05-three-phase/power' },
  { id: 'c24', short: '24', label: '组合逻辑电路', layer: 8, page: '/ee/08-electronics/combinational' },
  { id: 'c15', short: '15', label: '变压器', layer: 9, page: '/ee/06-machine/transformer' },
  { id: 'c25', short: '25', label: '触发器与时序电路', layer: 9, page: '/ee/08-electronics/sequential' },
  { id: 'c16', short: '16', label: '三相异步电动机原理', layer: 10, page: '/ee/06-machine/induction-motor' },
  { id: 'c17', short: '17', label: '机械特性 · 起动 · 调速', layer: 11, page: '/ee/06-machine/motor-characteristic' },
  { id: 'c19', short: '19', label: '继电接触器控制', layer: 11, page: '/ee/07-control/relay' },
  { id: 'c20', short: '20', label: 'PLC 与梯形图', layer: 12, page: '/ee/07-control/plc' }
]

const EDGES: [string, string][] = [
  ['c01', 'c02'],
  ['c02', 'c03'], ['c02', 'c06'], ['c02', 'c08'], ['c02', 'c19'],
  ['c03', 'c04'], ['c03', 'c05'],
  ['c04', 'c05'],
  ['c06', 'c07'],
  ['c08', 'c09'], ['c08', 'c11'],
  ['c09', 'c10'], ['c09', 'c15'],
  ['c10', 'c12'],
  ['c12', 'c13'], ['c12', 'c16'],
  ['c07', 'c22'],
  ['c01', 'c14'],
  ['c14', 'c15'], ['c14', 'c16'],
  ['c16', 'c17'],
  ['c23', 'c20'], ['c23', 'c24'],
  ['c24', 'c25']
]

const NW = 178
const NH = 44
const GAPX = 206
const GAPY = 76
const PADX = 30
const PADY = 24

const layers = computed(() => {
  const g: GN[][] = []
  for (const n of NODES) {
    g[n.layer] = g[n.layer] || []
    g[n.layer].push(n)
  }
  return g
})

const maxCount = computed(() => Math.max(...layers.value.map((l) => (l ? l.length : 0))))
const width = computed(() => maxCount.value * GAPX + PADX * 2)
const height = computed(() => layers.value.length * GAPY + PADY * 2)

const pos = computed(() => {
  const m = new Map<string, { x: number; y: number }>()
  layers.value.forEach((row, li) => {
    if (!row) return
    const cx = width.value / 2
    row.forEach((n, i) => {
      m.set(n.id, {
        x: cx + (i - (row.length - 1) / 2) * GAPX - NW / 2,
        y: PADY + li * GAPY
      })
    })
  })
  return m
})

function pathOf(a: string, b: string) {
  const pa = pos.value.get(a)
  const pb = pos.value.get(b)
  if (!pa || !pb) return ''
  const x1 = pa.x + NW / 2
  const y1 = pa.y + NH
  const x2 = pb.x + NW / 2
  const y2 = pb.y
  const my = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
}

const hover = ref<string | null>(null)
const isRel = (id: string) => {
  if (!hover.value) return false
  return EDGES.some(([a, b]) => (a === hover.value && b === id) || (b === hover.value && a === id))
}
</script>

<template>
  <div class="dg">
    <p class="dg-tip">箭头方向 = 学习顺序。鼠标悬停某个节点，会高亮它的<b>直接前驱与后继</b>；点击直接跳转。</p>
    <div class="dg-wrap">
      <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" class="dg-svg">
        <defs>
          <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" class="dg-arrowhead" />
          </marker>
        </defs>
        <path
          v-for="([a, b], i) in EDGES"
          :key="i"
          :d="pathOf(a, b)"
          class="dg-edge"
          :class="{ on: hover && (a === hover || b === hover) }"
          marker-end="url(#dg-arrow)"
        />
        <a
          v-for="n in NODES"
          :key="n.id"
          :href="withBase(n.page)"
          class="dg-node"
          @mouseenter="hover = n.id"
          @mouseleave="hover = null"
        >
          <rect
            :x="pos.get(n.id)!.x"
            :y="pos.get(n.id)!.y"
            :width="NW"
            :height="NH"
            rx="9"
            class="dg-rect"
            :class="{ on: hover === n.id, rel: isRel(n.id) }"
          />
          <text :x="pos.get(n.id)!.x + 16" :y="pos.get(n.id)!.y + 18" class="dg-short">
            {{ n.short }}
          </text>
          <text :x="pos.get(n.id)!.x + 44" :y="pos.get(n.id)!.y + 18" class="dg-label">
            {{ n.label }}
          </text>
        </a>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.dg { margin: 18px 0; }
.dg-tip { margin: 0 0 12px; font-size: 12.5px; color: var(--vp-c-text-3); }
.dg-tip b { color: var(--vp-c-text-2); }
.dg-wrap { overflow-x: auto; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); padding: 8px; }
.dg-svg { display: block; max-width: 100%; height: auto; }
.dg-edge { fill: none; stroke: var(--vp-c-divider); stroke-width: 1.6; }
.dg-edge.on { stroke: var(--vp-c-brand-1); stroke-width: 2.4; }
.dg-arrowhead { fill: var(--vp-c-divider); }
.dg-rect { fill: var(--vp-c-bg); stroke: var(--vp-c-divider); stroke-width: 1.4; transition: 0.15s; }
.dg-rect.on { fill: var(--vp-c-brand-1); stroke: var(--vp-c-brand-1); }
.dg-rect.rel { stroke: var(--vp-c-brand-1); stroke-width: 2; }
.dg-short { font-size: 12px; font-weight: 800; fill: var(--vp-c-brand-1); }
.dg-node:hover .dg-short { fill: #fff; }
.dg-label { font-size: 12.5px; fill: var(--vp-c-text-1); }
.dg-node:hover .dg-label { fill: #fff; }
.dg-node { cursor: pointer; text-decoration: none; }
</style>
