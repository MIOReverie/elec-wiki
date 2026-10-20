<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useCanvas, TC, SIG } from '../../lib/canvas'
import { useReducedMotion } from '../../composables/useReducedMotion'
import { arrow, label } from '../../lib/plot'

type Kind = 'R' | 'V' | 'I' | 'LAMP' | 'SW' | 'GND' | 'W' | 'DEL'

interface Comp {
  id: number
  type: Kind
  a: string
  b: string
  value: number
  on: boolean
}

const GRID = 34
const cv = ref<HTMLCanvasElement | null>(null)
const comps = shallowRef<Comp[]>([])
const mode = ref<Kind>('R')
const pending = ref<{ x: number; y: number } | null>(null)
const hover = ref<{ x: number; y: number } | null>(null)
const selected = ref<number | null>(null)
const t0 = performance.now()
let uid = 1

const TOOLS: { v: Kind; t: string; d: string }[] = [
  { v: 'R', t: '电阻 R', d: '耗能 · 限流' },
  { v: 'V', t: '电压源 V', d: '理想直流电压源' },
  { v: 'I', t: '电流源 I', d: '理想直流电流源' },
  { v: 'LAMP', t: '灯泡', d: '亮度 ∝ 功率' },
  { v: 'SW', t: '开关', d: '点击切换通断' },
  { v: 'W', t: '导线', d: '连接两点' },
  { v: 'GND', t: '接地', d: '参考点，必须有一个' },
  { v: 'DEL', t: '删除', d: '点击删除元件' }
]

const PRESETS: { n: string; f: () => Comp[] }[] = [
  {
    n: '单回路',
    f: () => [
      { id: uid++, type: 'V', a: '2,5', b: '2,2', value: 12, on: true },
      { id: uid++, type: 'R', a: '2,2', b: '9,2', value: 10, on: true },
      { id: uid++, type: 'LAMP', a: '9,2', b: '9,5', value: 20, on: true },
      { id: uid++, type: 'W', a: '9,5', b: '2,5', value: 0, on: true },
      { id: uid++, type: 'GND', a: '2,5', b: '2,5', value: 0, on: true }
    ]
  },
  {
    n: '串并联',
    f: () => [
      { id: uid++, type: 'V', a: '1,6', b: '1,3', value: 24, on: true },
      { id: uid++, type: 'R', a: '1,3', b: '5,3', value: 6, on: true },
      { id: uid++, type: 'R', a: '5,3', b: '5,6', value: 12, on: true },
      { id: uid++, type: 'R', a: '5,3', b: '9,3', value: 4, on: true },
      { id: uid++, type: 'LAMP', a: '9,3', b: '9,6', value: 8, on: true },
      { id: uid++, type: 'W', a: '5,6', b: '1,6', value: 0, on: true },
      { id: uid++, type: 'W', a: '9,6', b: '5,6', value: 0, on: true },
      { id: uid++, type: 'GND', a: '1,6', b: '1,6', value: 0, on: true }
    ]
  },
  {
    n: '电桥',
    f: () => [
      { id: uid++, type: 'V', a: '4,7', b: '4,4', value: 10, on: true },
      { id: uid++, type: 'R', a: '4,4', b: '1,4', value: 10, on: true },
      { id: uid++, type: 'R', a: '4,4', b: '7,4', value: 20, on: true },
      { id: uid++, type: 'R', a: '1,4', b: '1,7', value: 15, on: true },
      { id: uid++, type: 'R', a: '7,4', b: '7,7', value: 30, on: true },
      { id: uid++, type: 'R', a: '1,4', b: '7,4', value: 0, on: true },
      { id: uid++, type: 'W', a: '1,7', b: '4,7', value: 0, on: true },
      { id: uid++, type: 'W', a: '7,7', b: '4,7', value: 0, on: true },
      { id: uid++, type: 'GND', a: '4,7', b: '4,7', value: 0, on: true }
    ]
  }
]

function load(i: number) {
  comps.value = PRESETS[i].f()
  selected.value = null
  pending.value = null
}

/* ---------- 求解：改进结点法 MNA ---------- */
interface Res { ok: boolean; msg?: string; volt: Map<string, number>; cur: Map<number, number>; root?: (k: string) => string }

function solve(): Res {
  const cs = comps.value
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x)
    let r = x
    while (parent.get(r) !== r) r = parent.get(r)!
    let c = x
    while (parent.get(c) !== r) {
      const nx = parent.get(c)!
      parent.set(c, r)
      c = nx
    }
    return r
  }
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const c of cs) if (c.type === 'W' || (c.type === 'SW' && c.on)) union(c.a, c.b)

  const gnd = cs.find((c) => c.type === 'GND')
  if (!gnd) return { ok: false, msg: '请先放置一个接地（GND）作为参考点', volt: new Map(), cur: new Map() }
  const gRoot = find(gnd.a)

  const idx = new Map<string, number>()
  for (const c of cs)
    for (const k of [c.a, c.b]) {
      const r = find(k)
      if (r !== gRoot && !idx.has(r)) idx.set(r, idx.size)
    }
  const n = idx.size
  const vs = cs.filter((c) => c.type === 'V')
  const m = vs.length
  const N = n + m
  if (N === 0) return { ok: false, msg: '电路为空', volt: new Map(), cur: new Map() }

  const A: number[][] = Array.from({ length: N }, () => new Array(N).fill(0))
  const z = new Array(N).fill(0)
  const gi = (k: string) => {
    const r = find(k)
    return r === gRoot ? -1 : idx.get(r)!
  }

  for (const c of cs) {
    const a = gi(c.a), b = gi(c.b)
    if (c.type === 'R' || c.type === 'LAMP') {
      const g = 1 / Math.max(c.value, 1e-6)
      if (a >= 0) A[a][a] += g
      if (b >= 0) A[b][b] += g
      if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g }
    } else if (c.type === 'I') {
      if (a >= 0) z[a] -= c.value
      if (b >= 0) z[b] += c.value
    } else if (c.type === 'V') {
      const k = n + vs.indexOf(c)
      if (a >= 0) { A[a][k] += 1; A[k][a] += 1 }
      if (b >= 0) { A[b][k] -= 1; A[k][b] -= 1 }
      z[k] = c.value
    }
  }

  // 高斯消元（部分选主元）
  const x = new Array(N).fill(0)
  for (let col = 0; col < N; col++) {
    let piv = col
    for (let r = col + 1; r < N; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r
    if (Math.abs(A[piv][col]) < 1e-12)
      return { ok: false, msg: '电路无法求解：可能存在电压源并联/短路回路', volt: new Map(), cur: new Map() }
    if (piv !== col) {
      const t = A[piv]; A[piv] = A[col]; A[col] = t
      const tz = z[piv]; z[piv] = z[col]; z[col] = tz
    }
    const d = A[col][col]
    for (let r = col + 1; r < N; r++) {
      const f = A[r][col] / d
      if (f === 0) continue
      for (let cc = col; cc < N; cc++) A[r][cc] -= f * A[col][cc]
      z[r] -= f * z[col]
    }
  }
  for (let r = N - 1; r >= 0; r--) {
    let s = z[r]
    for (let cc = r + 1; cc < N; cc++) s -= A[r][cc] * x[cc]
    x[r] = s / A[r][r]
  }

  const volt = new Map<string, number>()
  volt.set(gRoot, 0)
  for (const [root, i] of idx) volt.set(root, x[i])

  const cur = new Map<number, number>()
  for (const c of cs) {
    if (c.type === 'R' || c.type === 'LAMP') {
      const va = volt.get(find(c.a)) ?? 0
      const vb = volt.get(find(c.b)) ?? 0
      cur.set(c.id, (va - vb) / Math.max(c.value, 1e-6))
    } else if (c.type === 'V') {
      cur.set(c.id, x[n + vs.indexOf(c)])
    } else if (c.type === 'I') {
      cur.set(c.id, c.value)
    }
  }
  return { ok: true, volt, cur, root: find }
}

const nodeVolt = (k: string, r: Res) => r.volt.get(k) ?? 0

/** 求解结果的 DOM 兜底文本：canvas 里画了同样的信息，但读屏与「复制文字」要能拿到 */
const readout = computed<{ ok: boolean; msg: string }>(() => {
  const r = solve()
  if (!r.ok) return { ok: false, msg: r.msg || '电路无法求解' }
  const parts: string[] = [`已放置 ${comps.value.length} 个元件`]
  for (const c of comps.value) {
    if (c.type === 'GND') continue
    const va = nodeVolt(r.root!(c.a), r)
    const vb = nodeVolt(r.root!(c.b), r)
    const I = r.cur.get(c.id) ?? 0
    const name = { R: `电阻 ${c.value} Ω`, LAMP: `灯泡 ${c.value} Ω`, V: `电压源 ${c.value} V`, I: `电流源 ${c.value} A`, SW: c.on ? '开关（闭合）' : '开关（断开）', W: '导线' }[c.type]
    parts.push(`${name}：${va.toFixed(2)} V 到 ${vb.toFixed(2)} V，电流 ${I.toFixed(3)} A`)
  }
  return { ok: true, msg: parts.join('；') }
})
/** readout 依赖 comps / selected，做浅层依赖即可（solve 每次重算是纯函数） */

const cursor = ref({ x: 2, y: 2 })
const toolIndex = computed(() => Math.max(0, TOOLS.findIndex((t) => t.v === mode.value)))

const cvLabel = computed(() => {
  const head =
    `电路搭建沙盒：当前工具 ${TOOLS[toolIndex.value]?.t ?? '电阻 R'}，` +
    `光标在第 ${cursor.value.y + 1} 行第 ${cursor.value.x + 1} 列。`
  return readout.value.ok ? `${head}${readout.value.msg}。` : `${head}${readout.value.msg}`
})

/* ---------- 绘制 ---------- */
function px(gx: number, gy: number, w: number, h: number): [number, number] {
  const cols = Math.floor(w / GRID)
  const rows = Math.floor(h / GRID)
  const ox = (w - (cols - 1) * GRID) / 2
  const oy = (h - (rows - 1) * GRID) / 2
  return [ox + gx * GRID, oy + gy * GRID]
}

function ptOf(k: string) {
  const [a, b] = k.split(',').map(Number)
  return { x: a, y: b }
}

function hitTest(mx: number, my: number, w: number, h: number): Comp | null {
  for (const c of comps.value) {
    if (c.type === 'GND') continue
    const p1 = ptOf(c.a), p2 = ptOf(c.b)
    const [x1, y1] = px(p1.x, p1.y, w, h)
    const [x2, y2] = px(p2.x, p2.y, w, h)
    const mxm = (x1 + x2) / 2, mym = (y1 + y2) / 2
    const len = Math.hypot(x2 - x1, y2 - y1)
    if (len < 1) continue
    const d = Math.abs((x2 - x1) * (my - y1) - (mx - x1) * (y2 - y1)) / len
    if (d < 11 && Math.hypot(mx - mxm, my - mym) < len / 2 + 10) return c
  }
  return null
}

/** 键盘光标命中的元件：从光标向左右各延伸半格再测一次，等价于鼠标点在格点上 */
function kbHit(gx: number, gy: number, w: number, h: number): Comp | null {
  const [cx, cy] = px(gx, gy, w, h)
  return hitTest(cx, cy, w, h)
}

const anim = useCanvas(
  cv,
  ({ ctx, w, h, t }) => {
    const cols = Math.floor(w / GRID)
    const rows = Math.floor(h / GRID)
    const ox = (w - (cols - 1) * GRID) / 2
    const oy = (h - (rows - 1) * GRID) / 2
    const P = (gx: number, gy: number): [number, number] => [ox + gx * GRID, oy + gy * GRID]

    // 网格
    ctx.fillStyle = TC.grid
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const [x, y] = P(i, j)
        ctx.globalAlpha = 0.35
        ctx.beginPath(); ctx.arc(x, y, 1.4, 0, 7); ctx.fill()
      }
    ctx.globalAlpha = 1

    const res = solve()
    const tAnim = t

    // 导线 / 元件
    for (const c of comps.value) {
      const p1 = ptOf(c.a), p2 = ptOf(c.b)
      const [x1, y1] = P(p1.x, p1.y)
      const [x2, y2] = P(p2.x, p2.y)
      const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1)
      const isSel = selected.value === c.id
      const col = isSel ? TC.brand : TC.text2

      if (c.type === 'GND') {
        ctx.strokeStyle = TC.text2
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 + 8); ctx.stroke()
        for (let k = 0; k < 3; k++) {
          const wd = 16 - k * 5
          ctx.beginPath(); ctx.moveTo(x1 - wd, y1 + 8 + k * 5); ctx.lineTo(x1 + wd, y1 + 8 + k * 5); ctx.stroke()
        }
        label(ctx, '0V', x1 + 22, y1 + 16, TC.text3, 'left', 10)
        continue
      }

      if (c.type === 'W' || (c.type === 'SW' && c.on)) {
        ctx.strokeStyle = col
        ctx.lineWidth = 2.2
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        if (c.type === 'SW') {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          ctx.fillStyle = TC.soft
          ctx.beginPath(); ctx.arc(mx, my, 4, 0, 7); ctx.fill()
          ctx.strokeStyle = col
          ctx.stroke()
        }
        continue
      }
      if (c.type === 'SW' && !c.on) {
        ctx.strokeStyle = col
        ctx.lineWidth = 2.2
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - 8, my); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(mx + 8, my); ctx.lineTo(x2, y2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 7, my - 7); ctx.stroke()
        continue
      }

      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      const dx = horiz ? 1 : 0, dy = horiz ? 0 : 1
      const ex = horiz ? 16 : 0, ey = horiz ? 0 : 16

      // 引线
      ctx.strokeStyle = col
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - dx * ex, my - dy * ey); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(mx + dx * ex, my + dy * ey); ctx.lineTo(x2, y2); ctx.stroke()

      if (c.type === 'R') {
        const n = 6, seg = (ex * 2) / n
        ctx.beginPath()
        ctx.moveTo(mx - dx * ex, my - dy * ey)
        for (let k = 0; k < n; k++) {
          const s0 = -ex + (k + 0.5) * seg
          const yy = my - dy * ey + (horiz ? (k % 2 ? -6 : 6) : 0)
          const xx = mx - dx * ex + (horiz ? 0 : (k % 2 ? -6 : 6))
          ctx.lineTo(horiz ? mx + s0 : xx, horiz ? yy : my + s0)
        }
        ctx.lineTo(mx + dx * ex, my + dy * ey)
        ctx.stroke()
      } else if (c.type === 'LAMP') {
        const I = res.ok ? Math.abs(res.cur.get(c.id) ?? 0) : 0
        const pw = I * I * c.value
        const glow = Math.min(1, pw / 6)
        ctx.beginPath(); ctx.arc(mx, my, 13, 0, 7)
        ctx.fillStyle = `rgba(245,158,11,${0.12 + glow * 0.8})`
        ctx.fill()
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke()
        ctx.strokeStyle = TC.text2
        ctx.beginPath(); ctx.moveTo(mx - 7, my - 7); ctx.lineTo(mx + 7, my + 7)
        ctx.moveTo(mx + 7, my - 7); ctx.lineTo(mx - 7, my + 7); ctx.stroke()
        if (glow > 0.05) {
          ctx.save()
          ctx.shadowColor = 'rgba(245,158,11,0.9)'
          ctx.shadowBlur = 10 + glow * 22
          ctx.beginPath(); ctx.arc(mx, my, 4, 0, 7); ctx.fillStyle = '#f59e0b'; ctx.fill()
          ctx.restore()
        }
      } else if (c.type === 'V') {
        ctx.beginPath(); ctx.arc(mx, my, 14, 0, 7)
        ctx.fillStyle = TC.soft; ctx.fill()
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke()
        ctx.strokeStyle = TC.text
        ctx.lineWidth = 1.6
        const s = 5
        ctx.beginPath()
        ctx.moveTo(mx - dx * ex - dy * s + dx * 4, my - dy * ey - dx * s + dy * 4)
        ctx.lineTo(mx - dx * ex - dy * s + dx * 10, my - dy * ey - dx * s + dy * 10)
        ctx.moveTo(mx - dx * ex - dy * s + dx * 7 - dy * 3, my - dy * ey - dx * s + dy * 7 + dx * 3)
        ctx.lineTo(mx - dx * ex - dy * s + dx * 7 + dy * 3, my - dy * ey - dx * s + dy * 7 - dx * 3)
        ctx.stroke()
      } else if (c.type === 'I') {
        ctx.beginPath(); ctx.arc(mx, my, 14, 0, 7)
        ctx.fillStyle = TC.soft; ctx.fill()
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke()
        arrow(ctx, mx - dx * 9, my - dy * 9, mx + dx * 9, my + dy * 9, TC.text, 1.8, 7)
      }

      // 标签
      const I = res.ok ? (res.cur.get(c.id) ?? 0) : 0
      let txt = ''
      if (c.type === 'R') txt = `${c.value}Ω`
      else if (c.type === 'LAMP') txt = `${c.value}Ω 灯`
      else if (c.type === 'V') txt = `${c.value}V`
      else if (c.type === 'I') txt = `${c.value}A`
      const lx = horiz ? mx : mx + 20
      const ly = horiz ? my - 20 : my
      label(ctx, txt, lx, ly, TC.text, 'center', 11, true)
      if (res.ok && (c.type === 'R' || c.type === 'LAMP')) {
        label(ctx, `${I >= 0 ? '' : '−'}${Math.abs(I).toFixed(2)}A`, lx, ly + 14, SIG.i, 'center', 10.5)
      }

      // 电流流动动画
      if (res.ok && Math.abs(I) > 1e-4 && (c.type === 'R' || c.type === 'LAMP' || c.type === 'W')) {
        const dir = I >= 0 ? 1 : -1
        // 电流为正时从 a 流向 b，为负时反向
        const ax = dir > 0 ? x1 : x2, ay = dir > 0 ? y1 : y2
        const bx = dir > 0 ? x2 : x1, by = dir > 0 ? y2 : y1
        const speed = Math.min(2.4, 0.25 + Math.abs(I) * 0.5)
        for (let k = 0; k < 3; k++) {
          const ph = ((tAnim * speed + k / 3) % 1)
          const cxp = ax + (bx - ax) * ph
          const cyp = ay + (by - ay) * ph
          ctx.beginPath()
          ctx.arc(cxp, cyp, 2.6, 0, 7)
          ctx.fillStyle = SIG.i
          ctx.globalAlpha = 0.85
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    }

    // 待放置预览
    if (pending.value && hover.value) {
      const [x1, y1] = P(pending.value.x, pending.value.y)
      const [x2, y2] = P(hover.value.x, hover.value.y)
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = TC.brand
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x1, y1)
      if (Math.abs(x2 - x1) >= Math.abs(y2 - y1)) ctx.lineTo(x2, y1)
      else ctx.lineTo(x1, y2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 键盘光标（只画焦点框，不改电路）
    {
      const [kx, ky] = P(cursor.value.x, cursor.value.y)
      ctx.setLineDash([3, 3])
      ctx.strokeStyle = SIG.q
      ctx.lineWidth = 1.5
      ctx.strokeRect(kx - GRID / 2 + 1, ky - GRID / 2 + 1, GRID - 2, GRID - 2)
      ctx.setLineDash([])
    }

    // 节点电位
    if (res.ok) {
      const seen = new Set<string>()
      for (const c of comps.value) {
        for (const k of [c.a, c.b]) {
          if (seen.has(k)) continue
          seen.add(k)
          const p = ptOf(k)
          const [x, y] = P(p.x, p.y)
          const v = nodeVolt(k, res)
          const col = v > 0.001 ? SIG.v : v < -0.001 ? SIG.i : TC.text3
          ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = col; ctx.fill()
          label(ctx, `${v.toFixed(2)}V`, x, y - 12, col, 'center', 10, true)
        }
      }
    } else {
      label(ctx, res.msg || '', w / 2, 16, SIG.warn, 'center', 12, true)
    }
  },
  { animate: true }
)

const reducedMotion = useReducedMotion().reduced

/* ---------- 交互 ---------- */
function gridAt(e: PointerEvent) {
  const c = cv.value!
  const r = c.getBoundingClientRect()
  const w = r.width, h = r.height
  const cols = Math.floor(w / GRID), rows = Math.floor(h / GRID)
  const ox = (w - (cols - 1) * GRID) / 2, oy = (h - (rows - 1) * GRID) / 2
  const gx = Math.max(0, Math.min(cols - 1, Math.round((e.clientX - r.left - ox) / GRID)))
  const gy = Math.max(0, Math.min(rows - 1, Math.round((e.clientY - r.top - oy) / GRID)))
  return { x: gx, y: gy }
}

function onDown(e: PointerEvent) {
  const c = cv.value
  if (!c) return
  const r = c.getBoundingClientRect()
  const g = gridAt(e)
  // 触屏：抓住指针，手指滑出画布仍继续收到 pointermove
  try { c.setPointerCapture(e.pointerId) } catch { /* 某些浏览器在鼠标上会抛，忽略 */ }
  const hit = hitTest(e.clientX - r.left, e.clientY - r.top, r.width, r.height)

  if (mode.value === 'DEL') {
    if (hit) comps.value = comps.value.filter((x) => x.id !== hit.id)
    return
  }
  if (hit && (hit.type === 'SW')) {
    comps.value = comps.value.map((x) => (x.id === hit.id ? { ...x, on: !x.on } : x))
    return
  }
  if (hit) { selected.value = hit.id; pending.value = null; return }

  if (mode.value === 'GND') {
    comps.value = [...comps.value.filter((x) => x.type !== 'GND'), { id: uid++, type: 'GND', a: `${g.x},${g.y}`, b: `${g.x},${g.y}`, value: 0, on: true }]
    return
  }
  if (!pending.value) { pending.value = g; return }

  const p = pending.value
  pending.value = null
  if (p.x === g.x && p.y === g.y) return
  const horiz = Math.abs(g.x - p.x) >= Math.abs(g.y - p.y)
  const end = horiz ? `${g.x},${p.y}` : `${p.x},${g.y}`
  comps.value = [
    ...comps.value,
    { id: uid++, type: mode.value, a: `${p.x},${p.y}`, b: end, value: mode.value === 'R' || mode.value === 'LAMP' ? 10 : mode.value === 'V' ? 12 : 1, on: true }
  ]
  selected.value = comps.value[comps.value.length - 1].id
}

function onMove(e: PointerEvent) {
  const c = cv.value
  if (!c) return
  const r = c.getBoundingClientRect()
  hover.value = gridAt(e)
  if (pending.value) {
    const g = hover.value
    const p = pending.value
    const horiz = Math.abs(g.x - p.x) >= Math.abs(g.y - p.y)
    hover.value = horiz ? { x: g.x, y: p.y } : { x: p.x, y: g.y }
  }
}

const selComp = computed(() => comps.value.find((c) => c.id === selected.value) || null)

function setVal(v: number) {
  if (!selComp.value) return
  comps.value = comps.value.map((c) => (c.id === selected.value ? { ...c, value: v } : c))
}
function delSel() {
  comps.value = comps.value.filter((c) => c.id !== selected.value)
  selected.value = null
}

/* ---------- 键盘操作 ---------- */
function onKey(e: KeyboardEvent) {
  const c = cv.value
  if (!c) return
  const r = c.getBoundingClientRect()
  const cols = Math.max(1, Math.floor(r.width / GRID))
  const rows = Math.max(1, Math.floor(r.height / GRID))
  const k = e.key
  let handled = true

  if (k === 'ArrowLeft') cursor.value = { x: Math.max(0, cursor.value.x - 1), y: cursor.value.y }
  else if (k === 'ArrowRight') cursor.value = { x: Math.min(cols - 1, cursor.value.x + 1), y: cursor.value.y }
  else if (k === 'ArrowUp') cursor.value = { x: cursor.value.x, y: Math.max(0, cursor.value.y - 1) }
  else if (k === 'ArrowDown') cursor.value = { x: cursor.value.x, y: Math.min(rows - 1, cursor.value.y + 1) }
  else if (k === '[' || k === ']') {
    const i = toolIndex.value
    const n = TOOLS.length
    mode.value = TOOLS[((k === '[' ? i - 1 : i + 1) + n) % n].v
  } else if (k === 'Enter' || k === ' ') {
    // Enter = 放置 / 选中（复用与鼠标一致的 place 逻辑）
    const hit = kbHit(cursor.value.x, cursor.value.y, r.width, r.height)
    if (mode.value === 'DEL') {
      if (hit) comps.value = comps.value.filter((x) => x.id !== hit.id)
    } else if (hit && hit.type === 'SW') {
      comps.value = comps.value.map((x) => (x.id === hit.id ? { ...x, on: !x.on } : x))
    } else if (hit) {
      selected.value = hit.id
      pending.value = null
    } else if (mode.value === 'GND') {
      comps.value = [...comps.value.filter((x) => x.type !== 'GND'), { id: uid++, type: 'GND', a: `${cursor.value.x},${cursor.value.y}`, b: `${cursor.value.x},${cursor.value.y}`, value: 0, on: true }]
    } else if (!pending.value) {
      pending.value = { ...cursor.value }
    } else {
      const p = pending.value
      pending.value = null
      if (p.x !== cursor.value.x || p.y !== cursor.value.y) {
        const horiz = Math.abs(cursor.value.x - p.x) >= Math.abs(cursor.value.y - p.y)
        const end = horiz ? `${cursor.value.x},${p.y}` : `${p.x},${cursor.value.y}`
        comps.value = [
          ...comps.value,
          { id: uid++, type: mode.value, a: `${p.x},${p.y}`, b: end, value: mode.value === 'R' || mode.value === 'LAMP' ? 10 : mode.value === 'V' ? 12 : 1, on: true }
        ]
        selected.value = comps.value[comps.value.length - 1].id
      }
    }
  } else if (k === 'Delete' || k === 'Backspace') {
    if (selected.value !== null) delSel()
  } else {
    handled = false
  }

  if (handled) {
    e.preventDefault()
    hover.value = { ...cursor.value }
  }
}
</script>

<template>
  <div class="sb">
    <div class="sb-tools">
      <button
        v-for="t in TOOLS"
        :key="t.v"
        class="sb-tool"
        :class="{ on: mode === t.v, danger: t.v === 'DEL' }"
        :title="t.d"
        @click="mode = t.v"
      >{{ t.t }}</button>
    </div>

    <canvas
      ref="cv"
      class="sb-canvas"
      role="application"
      tabindex="0"
      :aria-label="cvLabel"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerleave="hover = null"
      @pointerup="cursor = { ...gridAt($event) }"
      @keydown="onKey"
    />
    <p class="sr-only sb-sr" role="status">{{ readout.msg }}</p>

    <button class="sb-play" type="button" @click="anim.togglePlay()">
      {{ anim.playing.value ? '⏸ 暂停动画' : '▶ 播放动画' }}<template v-if="reducedMotion && !anim.playing.value">（已按系统设置减少动态效果）</template>
    </button>

    <div class="sb-bar">
      <span class="sb-tip">① 选工具 → ② 点起点 → ③ 点终点（自动对齐横/竖）· 点开关可切换通断</span>
      <span class="sb-presets">
        示例：
        <button v-for="(p, i) in PRESETS" :key="p.n" @click="load(i)">{{ p.n }}</button>
        <button class="danger" @click="comps = []; selected = null">清空</button>
      </span>
    </div>

    <div v-if="selComp && selComp.type !== 'GND'" class="sb-sel">
      <span class="sb-selname">
        {{ { R: '电阻', V: '电压源', I: '电流源', LAMP: '灯泡', SW: '开关', W: '导线' }[selComp.type] }}
      </span>
      <input
        v-if="['R', 'V', 'I', 'LAMP'].includes(selComp.type)"
        type="number"
        step="0.5"
        :value="selComp.value"
        @input="setVal(parseFloat(($event.target as HTMLInputElement).value) || 0)"
      />
      <button v-if="selComp.type === 'SW'" @click="comps = comps.map(c => c.id === selComp.id ? { ...c, on: !c.on } : c)">
        {{ selComp.on ? '断开' : '闭合' }}
      </button>
      <button class="danger" @click="delSel">删除</button>
    </div>
  </div>
</template>

<style scoped>
.sb { display: flex; flex-direction: column; gap: 8px; }
.sb-tools { display: flex; flex-wrap: wrap; gap: 6px; }
.sb-tool {
  padding: 4px 11px;
  font-size: 12.5px;
  font-family: inherit;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.sb-tool:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-brand-1); }
.sb-tool.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); font-weight: 600; }
.sb-tool.danger.on { background: #e0574a; border-color: #e0574a; }
.sb-canvas {
  width: 100%;
  height: 380px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  touch-action: none;
  cursor: crosshair;
}
.sb-play {
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
.sb-play:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.sb-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.sb-presets button {
  margin-left: 5px;
  padding: 2px 9px;
  font-size: 12px;
  font-family: inherit;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.sb-presets button:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.sb-presets button.danger { color: #e0574a; }
.sb-sel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-brand-soft);
  font-size: 12.5px;
}
.sb-selname { font-weight: 700; color: var(--vp-c-brand-1); }
.sb-sel input {
  width: 90px;
  padding: 3px 7px;
  font-size: 12.5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.sb-sel button {
  padding: 3px 10px;
  font-size: 12px;
  font-family: inherit;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.sb-sel button.danger { color: #e0574a; border-color: #e0574a; }
</style>
