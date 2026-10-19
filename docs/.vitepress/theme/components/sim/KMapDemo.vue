<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Seg from '../Seg.vue'

type Preset = 'p2' | 'p3' | 'p4e' | 'p4d'

interface Def {
  title: string
  rowVar: string
  colVar: string
  rows: number
  cols: number
  rowVals: number[]
  colVals: number[]
  grid: number[][]
  answer: string
  note: string
}

// 格雷码显示顺序对应的二进制值：00 01 11 10 -> 0 1 3 2
const G2 = [0, 1, 3, 2]
const G1 = [0, 1]

const DEFS: Record<Preset, Def> = {
  p2: {
    title: '2 变量',
    rowVar: 'A', colVar: 'B', rows: 2, cols: 2,
    rowVals: G1, colVals: G1,
    grid: [[0, 1], [1, 1]],
    answer: 'F = A + B',
    note: '只能圈两个 2 格圈：上面一行是 B，右边一列是 A。m0 是 0，所以不能贪心圈 4 格大圈——圈里不许出现 0。'
  },
  p3: {
    title: '3 变量',
    rowVar: 'A', colVar: 'BC', rows: 2, cols: 4,
    rowVals: G1, colVals: G2,
    grid: [[1, 1, 0, 1], [0, 1, 1, 1]],
    answer: 'F = ĀB̄ + BC̄ + AC',
    note: '三个 2 格圈。这张图里找不到任何 4 格大圈，所以 3 圈就是最优。另一组等价最优解是 F = ĀC̄ + B̄C + AB，答案不唯一。'
  },
  p4e: {
    title: '4 变量',
    rowVar: 'AB', colVar: 'CD', rows: 4, cols: 4,
    rowVals: G2, colVals: G2,
    grid: [
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1]
    ],
    answer: 'F = D̄',
    note: '整个函数只取决于 D：D=0 的两列是最左一列和最右一列。**按住最右一列往左拖出边界**，松手时最左一列会一起亮——跨左右边界合成一个 8 格圈，只剩 D̄。'
  },
  p4d: {
    title: '4 变量 + 无关项',
    rowVar: 'AB', colVar: 'CD', rows: 4, cols: 4,
    rowVals: G2, colVals: G2,
    grid: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 2, 2, 0],
      [0, 1, 2, 0]
    ],
    answer: 'F = D',
    note: 'd 是无关项，可当 1 也可当 0。把 d 当 1 用：D=1 的中间两列合成一个 8 格圈 → F=D。死板地不碰 d，就要多圈好几个。'
  }
}

const preset = ref<Preset>('p3')
const def = computed(() => DEFS[preset.value])

watch(preset, () => {
  sel.value = null
  circles.value = []
})

// —— 拖拽圈选（渲染坐标允许越界，越界即跨边界环绕）——
interface Cell { r: number; c: number }
const dragFrom = ref<Cell | null>(null)
const dragTo = ref<Cell | null>(null)
const sel = ref<Cell[] | null>(null)

function wrap(r: number, c: number): Cell {
  const d = def.value
  return {
    r: ((r % d.rows) + d.rows) % d.rows,
    c: ((c % d.cols) + d.cols) % d.cols
  }
}

function collect(a: Cell, b: Cell): Cell[] {
  const rt = Math.min(a.r, b.r), rb = Math.max(a.r, b.r)
  const cl = Math.min(a.c, b.c), cr = Math.max(a.c, b.c)
  const out: Cell[] = []
  const seen = new Set<string>()
  for (let r = rt; r <= rb; r++) {
    for (let c = cl; c <= cr; c++) {
      const w = wrap(r, c)
      const k = w.r + ',' + w.c
      if (!seen.has(k)) { seen.add(k); out.push(w) }
    }
  }
  return out
}

function startDrag(r: number, c: number) {
  dragFrom.value = { r, c }
  dragTo.value = { r, c }
}
function moveDrag(r: number, c: number) {
  if (dragFrom.value) dragTo.value = { r, c }
}
function endDrag() {
  if (dragFrom.value && dragTo.value) sel.value = collect(dragFrom.value, dragTo.value)
  dragFrom.value = null
  dragTo.value = null
}

const preview = computed<Cell[] | null>(() => {
  if (dragFrom.value && dragTo.value) return collect(dragFrom.value, dragTo.value)
  return sel.value
})

// —— 分析当前圈 ——
const BAR = (s: string) => s.split('').map(ch => ch + '\u0304').join('')

function bitsOf(val: number, n: number): string[] {
  return val.toString(2).padStart(n, '0').split('')
}
function mt(r: number, c: number): number {
  const d = def.value
  return d.rowVals[r] * d.cols + d.colVals[c]
}

interface Analysis {
  cells: Cell[]
  minterms: number[]
  ones: number
  zeros: number
  donts: number
  legal: boolean
  reason: string
  expr: string
  erased: string[]
}

const analysis = computed<Analysis | null>(() => {
  const cells = preview.value
  const d = def.value
  if (!cells || !cells.length) return null
  let ones = 0, zeros = 0, donts = 0
  const minterms: number[] = []
  for (const { r, c } of cells) {
    const v = d.grid[r][c]
    if (v === 0) zeros++
    else if (v === 1) ones++
    else donts++
    minterms.push(mt(r, c))
  }
  minterms.sort((a, b) => a - b)
  const pow2 = cells.length > 0 && (cells.length & (cells.length - 1)) === 0
  const legal = pow2 && zeros === 0
  let reason = ''
  if (!pow2) reason = '圈的大小必须是 1、2、4、8 格（2 的幂）'
  else if (zeros > 0) reason = '圈里出现了 0 格——先检查是不是拖歪了'
  // 逐位分析：行变量在前，列变量在后
  const nRowBits = Math.round(Math.log2(d.rows))
  const nColBits = Math.round(Math.log2(d.cols))
  const rowBitsList = d.rowVals.map(v => bitsOf(v, nRowBits))
  const colBitsList = d.colVals.map(v => bitsOf(v, nColBits))
  const vars = [...d.rowVar, ...d.colVar]
  const terms: string[] = []
  const erased: string[] = []
  for (let i = 0; i < vars.length; i++) {
    const inRow = i < nRowBits
    const bitIdx = inRow ? i : i - nRowBits
    const vals = new Set(cells.map(({ r, c }) => (inRow ? rowBitsList[r] : colBitsList[c])[bitIdx]))
    if (vals.size > 1) {
      erased.push(vars[i])
    } else {
      const v = vals.values().next().value
      terms.push(v === '1' ? vars[i] : BAR(vars[i]))
    }
  }
  return {
    cells, minterms, ones, zeros, donts, legal, reason,
    expr: terms.length ? terms.join('') : '1',
    erased
  }
})

// —— 已确认的圈 ——
interface Circle { id: number; expr: string; minterms: number[]; keys: string[] }
const circles = ref<Circle[]>([])
let cid = 0

function confirm() {
  const a = analysis.value
  if (!a || !a.legal) return
  circles.value.push({
    id: cid++,
    expr: a.expr,
    minterms: [...a.minterms].sort((x, y) => x - y),
    keys: a.cells.map(c => c.r + ',' + c.c)
  })
  sel.value = null
}
function remove(id: number) {
  circles.value = circles.value.filter(c => c.id !== id)
}

const totalExpr = computed(() => circles.value.length ? circles.value.map(c => c.expr).join(' + ') : '（还没有确认任何圈）')
const coveredKeys = computed(() => {
  const s = new Set<string>()
  circles.value.forEach(c => c.keys.forEach(k => s.add(k)))
  return s
})
const totalOnes = computed(() => {
  const d = def.value
  let n = 0
  for (let r = 0; r < d.rows; r++) for (let c = 0; c < d.cols; c++) if (d.grid[r][c] === 1) n++
  return n
})
const coveredOnes = computed(() => {
  const d = def.value
  const s = coveredKeys.value
  let n = 0
  for (let r = 0; r < d.rows; r++) for (let c = 0; c < d.cols; c++) if (d.grid[r][c] === 1 && s.has(r + ',' + c)) n++
  return n
})
const done = computed(() => circles.value.length > 0 && coveredOnes.value === totalOnes.value)

// —— 渲染几何：网格左右各画一份副本列，副本上也能直接拖（跨边界圈）；上下不设副本 ——
const CELL = 42
const OX = 46
const OY = 30
const rowRange = computed(() => {
  const n = def.value.rows
  return Array.from({ length: n }, (_, i) => i)
})
const colRange = computed(() => {
  const n = def.value.cols
  return Array.from({ length: n + 2 }, (_, i) => i - 1)
})
// 渲染坐标（cc，可越界）+ 主坐标（c，已 wrap）
const renderRows = computed(() => rowRange.value.map(r => ({ rr: r, r })))
const renderCols = computed(() => colRange.value.map(cc => ({ cc, c: wrap(0, cc).c })))
const vbW = computed(() => (def.value.cols + 2) * CELL + OX)
const vbH = computed(() => (def.value.rows) * CELL + OY + 6)

function grayLabel(mainIdx: number, isRow: boolean): string {
  const d = def.value
  const n = isRow ? Math.round(Math.log2(d.rows)) : Math.round(Math.log2(d.cols))
  const v = isRow ? d.rowVals[mainIdx] : d.colVals[mainIdx]
  return v.toString(2).padStart(n, '0')
}

const previewKeys = computed(() => {
  const s = new Set<string>()
  ;(preview.value || []).forEach(c => s.add(c.r + ',' + c.c))
  return s
})
const circleKeys = computed(() => coveredKeys.value)

function cellFill(r: number, c: number): string {
  const v = def.value.grid[r][c]
  if (previewKeys.value.has(r + ',' + c)) return 'var(--vp-c-brand-1)'
  if (v === 1) return 'var(--vp-c-brand-soft)'
  if (v === 2) return 'var(--vp-c-tip-soft)'
  return 'var(--vp-c-bg-alt)'
}
function cellFillOp(r: number, c: number): number {
  const v = def.value.grid[r][c]
  if (previewKeys.value.has(r + ',' + c)) return 0.32
  if (v === 1) return 1
  if (v === 2) return 1
  return 0.55
}
function cellStroke(r: number, c: number): string {
  if (previewKeys.value.has(r + ',' + c)) {
    const a = analysis.value
    return a && !a.legal ? 'var(--vp-c-danger-1)' : 'var(--vp-c-brand-1)'
  }
  if (def.value.grid[r][c] === 2) return 'var(--vp-c-tip-1)'
  return 'var(--vp-c-divider)'
}
</script>

<template>
  <div class="km">
    <div class="km-bar">
      <Seg
        v-model="preset"
        label="函数"
        :options="[
          { value: 'p2', label: '2 变量' },
          { value: 'p3', label: '3 变量' },
          { value: 'p4e', label: '4 变量' },
          { value: 'p4d', label: '4 变量+无关项' }
        ]"
      />
      <span class="km-fn">{{ def.title }} · F = Σm{{ preset === 'p4d' ? '(1,3,5,7,9)+d(11,13,15)' : preset === 'p4e' ? '(0,2,4,6,8,10,12,14)' : preset === 'p3' ? '(0,1,2,5,6,7)' : '(1,2,3)' }}</span>
    </div>

    <div class="km-main">
      <div class="km-mapwrap">
        <svg
          class="km-svg"
          :viewBox="`0 0 ${vbW} ${vbH}`"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
          <!-- 行标签 -->
          <text
            v-for="(row, i) in renderRows" :key="'rl' + i"
            :x="OX - 8" :y="OY + row.rr * CELL + CELL / 2 + 4"
            text-anchor="end" font-size="12" font-weight="600"
            fill="var(--vp-c-text-2)"
          >{{ grayLabel(row.r, true) }}</text>
          <!-- 列标签 -->
          <text
            v-for="(col, i) in renderCols" :key="'cl' + i"
            :x="OX + col.cc * CELL + CELL / 2" :y="OY - 10"
            text-anchor="middle" font-size="12" font-weight="600"
            :opacity="col.cc < 0 || col.cc >= def.cols ? 0.35 : 1"
            fill="var(--vp-c-text-2)"
          >{{ grayLabel(col.c, false) }}</text>
          <!-- 轴变量名 -->
          <text :x="OX - 8" :y="14" text-anchor="end" font-size="11" fill="var(--vp-c-text-3)">{{ def.rowVar }}</text>
          <text :x="OX" :y="14" font-size="11" fill="var(--vp-c-text-3)">{{ def.colVar }}</text>

          <!-- 格子 -->
          <template v-for="(row, ri) in renderRows" :key="'row' + ri">
            <rect
              v-for="(col, ci) in renderCols" :key="'c' + ri + '-' + ci"
              :x="OX + col.cc * CELL + 1"
              :y="OY + row.rr * CELL + 1"
              :width="CELL - 2"
              :height="CELL - 2"
              rx="5"
              :fill="cellFill(row.r, col.c)"
              :fill-opacity="cellFillOp(row.r, col.c)"
              :stroke="cellStroke(row.r, col.c)"
              :stroke-width="previewKeys.has(row.r + ',' + col.c) ? 2 : 1.2"
              :stroke-dasharray="circleKeys.has(row.r + ',' + col.c) && !previewKeys.has(row.r + ',' + col.c) ? '4 3' : undefined"
              :opacity="col.cc < 0 || col.cc >= def.cols ? 0.38 : 1"
              class="km-cell"
              @mousedown.prevent="startDrag(row.rr, col.cc)"
              @mouseenter="moveDrag(row.rr, col.cc)"
            />
          </template>
          <!-- 格内文字：最小项编号 + 值 -->
          <template v-for="(row, ri) in renderRows" :key="'tr' + ri">
            <text
              v-for="(col, ci) in renderCols" :key="'t' + ri + '-' + ci"
              :x="OX + col.cc * CELL + 5" :y="OY + row.rr * CELL + 13"
              font-size="9" :opacity="(row.rr < 0 || row.rr >= def.rows || col.cc < 0 || col.cc >= def.cols) ? 0.38 : 0.75"
              fill="var(--vp-c-text-3)"
            >m{{ mt(row.r, col.c) }}</text>
            <text
              v-for="(col, ci) in renderCols" :key="'v' + ri + '-' + ci"
              :x="OX + col.cc * CELL + CELL / 2" :y="OY + row.rr * CELL + CELL / 2 + 6"
              text-anchor="middle" font-size="14" font-weight="700"
              :opacity="col.cc < 0 || col.cc >= def.cols ? 0.38 : 1"
              :fill="def.grid[row.r][col.c] === 1 ? 'var(--vp-c-brand-1)' : def.grid[row.r][col.c] === 2 ? 'var(--vp-c-tip-1)' : 'var(--vp-c-text-3)'"
            >{{ def.grid[row.r][col.c] === 1 ? '1' : def.grid[row.r][col.c] === 2 ? 'd' : '0' }}</text>
          </template>
        </svg>
        <p class="km-hint">在格子上按住拖动画矩形圈；左右边界相通——左右两侧各有一列淡淡的副本，想圈「最左+最右」时，把副本列和相邻的主列一起框住即可（4 变量那道题必须这么圈）。</p>
      </div>

      <div class="km-panel">
        <div class="km-card">
          <div class="km-pt">当前圈</div>
          <template v-if="analysis">
            <div class="km-mt">覆盖 {{ analysis.minterms.map(m => 'm' + m).join('、') }}（{{ analysis.ones }} 个 1{{ analysis.donts ? '，' + analysis.donts + ' 个 d' : '' }}）</div>
            <div class="km-expr" :class="{ bad: !analysis.legal }">
              {{ analysis.legal ? analysis.expr : analysis.reason }}
            </div>
            <div v-if="analysis.legal" class="km-note">
              {{ analysis.erased.length ? '被消去的变量：' + analysis.erased.join('、') : '没有变量变化，这是单格圈' }}
            </div>
            <div class="km-btns">
              <button class="km-go" :disabled="!analysis.legal" @click="confirm">确认这个圈</button>
              <button class="km-cancel" @click="sel = null">取消选择</button>
            </div>
          </template>
          <p v-else class="km-empty">还没有选区。在左边按住拖动，或单击单个格子。</p>
        </div>

        <div class="km-card">
          <div class="km-pt">已确认的圈（{{ circles.length }}）</div>
          <div v-if="circles.length" class="km-chips">
            <div v-for="c in circles" :key="c.id" class="km-chip">
              <b>{{ c.expr }}</b>
              <span>m{{ c.minterms.join('、m') }}</span>
              <button class="km-x" @click="remove(c.id)">×</button>
            </div>
          </div>
          <p v-else class="km-empty">圈一个合法矩形，点「确认这个圈」累积到这里。</p>
        </div>

        <div class="km-card">
          <div class="km-pt">化简结果</div>
          <div class="km-f">F = {{ totalExpr }}</div>
          <div class="km-prog">
            <div class="km-progbar"><div :style="{ width: totalOnes ? (coveredOnes / totalOnes * 100) + '%' : '0%' }" /></div>
            <span>1 格覆盖 {{ coveredOnes }} / {{ totalOnes }}</span>
          </div>
          <div v-if="done" class="km-done">全部 1 格已覆盖，对照右下角参考答案看看圈法是否一样。</div>
        </div>

        <div class="km-card km-ans">
          <div class="km-pt">参考答案</div>
          <div class="km-f">{{ def.answer }}</div>
          <p>{{ def.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.km { margin: 22px 0; }
.km-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.km-fn { font-size: 12px; color: var(--vp-c-text-3); font-family: var(--vp-font-family-mono); }
.km-main { display: grid; grid-template-columns: minmax(260px, 340px) 1fr; gap: 16px; align-items: start; }
@media (max-width: 760px) { .km-main { grid-template-columns: 1fr; } }
.km-mapwrap { min-width: 0; }
.km-svg { width: 100%; height: auto; display: block; user-select: none; }
.km-cell { cursor: crosshair; }
.km-cell:hover { filter: brightness(1.12); }
.km-hint { margin: 8px 2px 0; font-size: 12px; color: var(--vp-c-text-3); line-height: 1.65; }
.km-panel { display: grid; gap: 10px; min-width: 0; }
.km-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
}
.km-pt { font-size: 12px; font-weight: 700; color: var(--vp-c-text-2); margin-bottom: 6px; }
.km-mt { font-size: 12.5px; color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); }
.km-expr {
  font-size: 20px; font-weight: 700; margin: 4px 0 2px;
  color: var(--vp-c-brand-1); font-family: var(--vp-font-family-mono);
}
.km-expr.bad { font-size: 13.5px; font-weight: 600; color: var(--vp-c-danger-1); }
.km-note { font-size: 12px; color: var(--vp-c-text-3); }
.km-btns { display: flex; gap: 8px; margin-top: 8px; }
.km-go, .km-cancel {
  padding: 5px 13px; font-size: 12.5px; border-radius: 7px; cursor: pointer;
  border: 1px solid var(--vp-c-brand-1); font-family: inherit;
}
.km-go { background: var(--vp-c-brand-1); color: #fff; font-weight: 600; }
.km-go:disabled { opacity: 0.45; cursor: not-allowed; }
.km-cancel { background: transparent; color: var(--vp-c-text-2); border-color: var(--vp-c-divider); }
.km-empty { margin: 2px 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.6; }
.km-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.km-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 5px 3px 9px; border-radius: 7px; font-size: 12px;
  background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider);
}
.km-chip b { color: var(--vp-c-brand-1); font-family: var(--vp-font-family-mono); }
.km-chip span { color: var(--vp-c-text-3); font-size: 11px; font-family: var(--vp-font-family-mono); }
.km-x { border: 0; background: transparent; color: var(--vp-c-text-3); cursor: pointer; font-size: 13px; padding: 0 2px; }
.km-x:hover { color: var(--vp-c-danger-1); }
.km-f { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); word-break: break-all; }
.km-prog { margin-top: 7px; }
.km-progbar { height: 5px; border-radius: 3px; background: var(--vp-c-divider); overflow: hidden; }
.km-progbar > div { height: 100%; background: var(--vp-c-brand-1); transition: width 0.25s; }
.km-prog span { display: block; margin-top: 4px; font-size: 11.5px; color: var(--vp-c-text-3); }
.km-done { margin-top: 6px; font-size: 12px; font-weight: 600; color: var(--vp-c-brand-1); }
.km-ans p { margin: 6px 0 0; font-size: 12px; color: var(--vp-c-text-3); line-height: 1.7; }
</style>
