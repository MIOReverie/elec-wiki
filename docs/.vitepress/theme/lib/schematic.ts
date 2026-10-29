/**
 * SVG 电路/逻辑元件符号库（GB/T 4728 风格）
 *
 * 为什么用 SVG 而不是图片或 canvas？
 *   1. 矢量，深浅色主题自动适配（颜色走 CSS 变量 currentColor / var()）
 *   2. 参数化：符号位置由调用方给坐标，改一个数就重排
 *   3. 体积为零、可全文搜索、打印清晰
 *   4. 电路符号用 AI 生图必错，只能手绘
 *
 * 约定：每个元件以「中心点 (x, y)」放置，默认沿水平方向（引线在 ±端点）。
 * 需要竖直方向传 rot=90。元件内部用局部坐标（原点即中心）。
 */

export interface ElOpt {
  /** 旋转角度（度），90 = 竖直 */
  rot?: number
  /** 覆盖默认端距 */
  half?: number
  /** 标注文字（画在元件正上方） */
  label?: string
  /** 标注位置微调 */
  dx?: number
  dy?: number
}

const P = (x: number, y: number) => `${round(x)} ${round(y)}`

function round(n: number) {
  return Math.round(n * 100) / 100
}

/* ------------------------------------------------------------------ 基础图元 */

/** 坐标对「x y」—— 只允许用于 path 数据（M/L）和 transform，
 *  绝不能塞进 x1 / cx 这类单值属性，否则整条命令会被浏览器判为非法而丢弃。 */
function pt(x: number, y: number): string {
  return `${round(x)} ${round(y)}`
}

/** 导线 */
export function wire(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"/>`
}

/** 折线（多段） */
export function poly(pts: number[][], o: { fill?: boolean } = {}): string {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${pt(p[0], p[1])}`).join(' ')
  return o.fill
    ? `<path d="${d} Z" class="sf-fill"/>`
    : `<path d="${d}" fill="none"/>`
}

/** 实心多边形（二极管三角、运放本体、箭头头部）——描边同色、无描边 */
export function solid(pts: number[][]): string {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${pt(p[0], p[1])}`).join(' ')
  return `<path d="${d} Z" class="sf-solid"/>`
}

/** 实心节点 */
export function dot(x: number, y: number, r = 3): string {
  return `<circle cx="${round(x)}" cy="${round(y)}" r="${r}" class="sf-dot"/>`
}

/** 空心节点 */
export function node(x: number, y: number, r = 3.2): string {
  return `<circle cx="${round(x)}" cy="${round(y)}" r="${r}" class="sf-node"/>`
}

/** 箭头（当前方向 / 电流方向 / 旋转方向） */
export function arrow(x1: number, y1: number, x2: number, y2: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const L = 8
  const spread = 0.42
  const p1 = [x2 - L * Math.cos(a - spread), y2 - L * Math.sin(a - spread)]
  const p2 = [x2 - L * Math.cos(a + spread), y2 - L * Math.sin(a + spread)]
  return (
    wire(x1, y1, x2 - L * 0.7 * Math.cos(a), y2 - L * 0.7 * Math.sin(a)) +
    solid([[x2, y2], p1, p2] as number[][])
  )
}

/** 双箭头 */
export function arrow2(x1: number, y1: number, x2: number, y2: number): string {
  return arrow(x1, y1, x2, y2) + arrow(x2, y2, x1, y1)
}

export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${r}" fill="none"/>`
}

/** 文本标注 */
export function txt(
  x: number,
  y: number,
  s: string,
  o: {
    anchor?: 'start' | 'middle' | 'end'
    size?: number
    color?: string
    baseline?: string
    rot?: number
    weight?: number | string
    italic?: boolean
    mono?: boolean
    dy?: number
  } = {}
): string {
  const cls = [
    'sf-t',
    o.mono ? 'sf-mono' : '',
    o.italic ? 'sf-it' : '',
    o.weight ? 'sf-w' + o.weight : ''
  ].join(' ')
  // stroke="none" 必须显式写：根 svg 上的 stroke 会被文字继承，导致中文变成描边糊字
  // fill 也必须显式写：根 svg 上是 fill="none"，不写的话文字会继承「无填充」而完全隐形
  // （2026-10-15 实测：Edge 下默认色文本 0 墨迹，全部标签都看不见）
  const fill = o.color || 'var(--vp-c-text-1)'
  const tr = o.rot ? ` transform="rotate(${o.rot} ${pt(x, y + (o.dy || 0))})"` : ''
  return (
    `<text x="${round(x)}" y="${round(y + (o.dy || 0))}" text-anchor="${o.anchor || 'middle'}" ` +
    `dominant-baseline="${o.baseline || 'middle'}" font-size="${o.size || 12}" ` +
    `stroke="none" fill="${fill}" class="${cls}"${tr}>${esc(s)}</text>`
  )
}

/** 带上下标的文本：S("U") -> U + 下标 ab */
export function sub(
  x: number,
  y: number,
  base: string,
  s: string,
  o: { anchor?: 'start' | 'middle' | 'end'; size?: number; color?: string; dy?: number } = {}
): string {
  const sz = o.size || 12
  const w = base.length * sz * 0.62
  const anchor = o.anchor || 'middle'
  const bx = anchor === 'middle' ? x - w * 0.15 : anchor === 'end' ? x - w : x
  return (
    txt(bx, y, base, { anchor: 'start', size: sz, color: o.color, italic: true, dy: o.dy }) +
    txt(bx + w, y + sz * 0.55, s, { anchor: 'start', size: sz * 0.72, color: o.color, dy: o.dy })
  )
}

/* ------------------------------------------------------------------ 无源元件 */

export function resistor(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 24
  return g(
    x,
    y,
    o,
    wire(-h, 0, -9, 0) +
      rect(-9, -6, 18, 12, 1.5) +
      wire(9, 0, h, 0) +
      (o.label ? txt(0, -14, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** 电阻的欧姆定律说明用：把 R 换成滑动变阻器 */
export function rheostat(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 24
  return g(
    x,
    y,
    o,
    wire(-h, 0, -9, 0) +
      rect(-9, -6, 18, 12, 1.5) +
      wire(9, 0, h, 0) +
      `<line x1="-2" y1="-15" x2="-2" y2="0"/>` +
      `<line x1="-9" y1="-15" x2="5" y2="-15"/>` +
      (o.label ? txt(0, -22, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

export function capacitor(x: number, y: number, o: ElOpt & { polar?: boolean } = {}): string {
  const h = o.half ?? 22
  const top = o.polar ? -13 : -10
  const bot = o.polar ? -2 : 10
  return g(
    x,
    y,
    o,
    wire(-h, 0, -4, 0) +
      `<line x1="-4" y1="${top}" x2="-4" y2="${bot}" stroke-width="2.6"/>` +
      `<line x1="4" y1="${top}" x2="4" y2="${bot}" stroke-width="2.6"/>` +
      (o.polar ? `<text x="11" y="-8" font-size="13" class="sf-t">+</text>` : '') +
      wire(4, 0, h, 0) +
      (o.label ? txt(0, -18, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** 可变电容（电机起动电容） */
export function capVar(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 22
  return g(
    x,
    y,
    o,
    wire(-h, 0, -4, 0) +
      `<line x1="-4" y1="-10" x2="-4" y2="10" stroke-width="2.6"/>` +
      `<line x1="4" y1="-10" x2="4" y2="10" stroke-width="2.6"/>` +
      `<line x1="2" y1="-10" x2="2" y2="10" stroke-width="1" stroke-dasharray="2 3"/>` +
      `<line x1="-8" y1="-17" x2="6" y2="-17" stroke-width="1.4"/>` +
      wire(4, 0, h, 0) +
      (o.label ? txt(0, -24, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

export function inductor(x: number, y: number, o: ElOpt & { turns?: number; core?: boolean } = {}): string {
  const h = o.half ?? 24
  const n = o.turns ?? 4
  const r = 5
  const w = n * r // 线圈半宽：n 个半圆 each 宽 2r → 总宽 n·2r，关于中心对称
  let d = `M${-w} 0 `
  for (let i = 0; i < n; i++) d += `a${r} ${r} 0 0 1 ${2 * r} 0 `
  return g(
    x,
    y,
    o,
    // 引线从 ±w 补到 ±h，保证元件总跨度正好 = 2·half（seg 靠这个严丝合缝接线）
    wire(-h, 0, -w, 0) +
      `<path d="${d}" fill="none"/>` +
      wire(w, 0, h, 0) +
      (o.core ? `<line x1="${-w}" y1="7" x2="${w}" y2="7"/>` : '') +
      (o.label ? txt(0, -15, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** 互感：两个线圈 + 耦合线 */
export function coupledInductor(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 26
  const mk = (oy: number) => {
    let d = `M-14 ${oy} `
    for (let i = 0; i < 3; i++) d += `a5 5 0 0 1 10 0 `
    d += `L16 ${oy}`
    return `<path d="${d}" fill="none"/>`
  }
  return g(
    x,
    y,
    o,
    wire(-h, 0, -14, 0) + mk(0) +
      wire(16, 0, h, 0) +
      wire(-h, 26, -14, 26) + mk(26) +
      wire(16, 26, h, 26)
  )
}

/* ------------------------------------------------------------------ 电源与开关 */

export function sourceDC(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 26
  return g(
    x,
    y,
    o,
    wire(-h, 0, -5, 0) +
      `<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>` +
      `<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>` +
      wire(5, 0, h, 0) +
      (o.label ? txt(0, -18, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

export function sourceAC(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 26
  return g(
    x,
    y,
    o,
    wire(-h, 0, -12, 0) +
      `<circle cx="0" cy="0" r="12" fill="none"/>` +
      poly([[-6, 0], [-3, -5], [0, 5], [3, -5], [6, 0]]) +
      wire(12, 0, h, 0) +
      (o.label ? txt(0, -19, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** 电流源（圆环 + 内部箭头，箭头方向 = 电流方向）。dir=1 电流沿局部 +x，即从起点流向终点 */
export function sourceI(x: number, y: number, o: ElOpt & { dir?: 1 | -1 } = {}): string {
  const h = o.half ?? 24
  const d = o.dir ?? 1
  return g(
    x,
    y,
    o,
    wire(-h, 0, -14, 0) +
      `<circle cx="0" cy="0" r="14" fill="none"/>` +
      // 箭头必须沿导线方向（局部 x 轴），否则竖放时会变成横着指
      (d === 1 ? arrow(-8, 0, 8, 0) : arrow(8, 0, -8, 0)) +
      wire(14, 0, h, 0) +
      (o.label ? txt(0, -20, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** 继电器 / 接触器线圈（矩形框，GB/T 4728 控制电路线圈；label 画在框内） */
export function coil(x: number, y: number, o: ElOpt & { on?: boolean } = {}): string {
  return g(
    x,
    y,
    o,
    `<rect x="-20" y="-12" width="40" height="24" rx="2" fill="${o.on ? 'var(--vp-c-brand-1)' : 'none'}" ` +
      `fill-opacity="${o.on ? 0.18 : 0}" stroke-width="2"/>` +
      (o.label ? txt(0, 1, o.label, { size: 13, weight: 600, dy: o.dy }) : '')
  )
}

/** 三相异步电动机（圆 + M，下方 3~） */
export function motor(x: number, y: number, o: ElOpt = {}): string {
  return g(
    x,
    y,
    o,
    `<circle cx="0" cy="0" r="17" fill="none" stroke-width="2"/>` +
      txt(0, 0, 'M', { size: 15, weight: 700, italic: true }) +
      txt(0, 27, '3~', { size: 11, dy: o.dy })
  )
}

export function ground(x: number, y: number, o: { label?: string } = {}): string {
  return (
    wire(x, y, x, y + 10) +
    wire(x - 9, y + 10, x + 9, y + 10).replace('/>', ' stroke-width="2.4"/>') +
    wire(x - 5.5, y + 14, x + 5.5, y + 14) +
    wire(x - 2, y + 18, x + 2, y + 18) +
    (o.label ? txt(x, y + 27, o.label, { size: 11 }) : '')
  )
}

/** 开关：closed=true 时刀闸合上；nc=true 画常闭触点（刀片搭在右接点上）；
 *  kind: spst=刀开关 / button=按钮（带按钮帽）/ cont=接触器触点 */
export function sw(
  x: number,
  y: number,
  o: ElOpt & { closed?: boolean; kind?: 'spst' | 'button' | 'cont'; nc?: boolean } = {}
): string {
  const h = o.half ?? 22
  const closed = o.closed ?? false
  const kind = o.kind ?? 'spst'
  const nc = o.nc ?? false
  let blades = ''
  if (kind === 'cont') {
    // 常开：刀片翘起不接触；常闭：刀片搭上右接点
    blades = node(-8, 0) + node(8, 0) + (closed && !nc ? wire(-8, 0, 8, 0) : wire(-8, 0, 8, nc ? -3 : -12))
  } else if (kind === 'button') {
    blades = node(-8, 0) + node(8, 0)
    if (nc) {
      // 常闭按钮：闭合刀片 + 上方按钮帽
      blades += wire(-8, 0, 8, -3) + wire(0, -3, 0, -13) + wire(-4, -13, 4, -13)
    } else {
      blades += wire(-8, 0, 0, -11) + wire(0, -11, 8, 0)
    }
  } else {
    blades = node(-8, 0) + node(8, 0) + (closed && !nc ? wire(-8, 0, 8, 0) : wire(-8, 0, 7, nc ? -3 : -11))
  }
  return g(x, y, o, wire(-h, 0, -8, 0) + blades + wire(8, 0, h, 0) + (o.label ? txt(0, -18, o.label, { size: 12, dy: o.dy }) : ''))
}

/** 熔断器 */
export function fuse(x: number, y: number, o: ElOpt = {}): string {
  const h = o.half ?? 20
  return g(x, y, o, wire(-h, 0, -8, 0) + rect(-8, -4, 16, 8, 3) + wire(8, 0, h, 0) + (o.label ? txt(0, -14, o.label, { size: 11, dy: o.dy }) : ''))
}

export function lamp(x: number, y: number, o: ElOpt & { on?: boolean } = {}): string {
  const h = o.half ?? 22
  const c = o.on ? 'var(--vp-c-brand-1)' : undefined
  return g(
    x,
    y,
    o,
    wire(-h, 0, -10, 0) +
      `<circle cx="0" cy="0" r="10" fill="none"${c ? ` stroke="${c}" stroke-width="2.2"` : ''}/>` +
      wire(-5, -5, 5, 5) +
      wire(5, -5, -5, 5) +
      wire(10, 0, h, 0) +
      (o.label ? txt(0, -17, o.label, { size: 12, dy: o.dy }) : '')
  )
}

/** 电流表 / 电压表 */
export function meter(
  x: number,
  y: number,
  o: ElOpt & { type?: 'A' | 'V' | 'W' | 'PF' }
): string {
  const h = o.half ?? 22
  const t = o.type ?? 'A'
  return g(
    x,
    y,
    o,
    wire(-h, 0, -12, 0) +
      `<circle cx="0" cy="0" r="12" fill="none"/>` +
      txt(0, 1, t, { size: 11, weight: 600 }) +
      wire(12, 0, h, 0) +
      (o.label ? txt(0, -19, o.label, { size: 11, dy: o.dy }) : '')
  )
}

/* ------------------------------------------------------------------ 半导体 */

/** 二极管：dir=1 阳极在左，阴极在右（电流沿局部 +x 方向） */
export function diode(x: number, y: number, o: ElOpt & { dir?: 1 | -1; zener?: boolean; led?: boolean } = {}): string {
  const h = o.half ?? 20
  const dir = o.dir ?? 1
  const tri = dir === 1
    ? solid([[-5, -8], [5, 0], [-5, 8]])
    : solid([[5, -8], [-5, 0], [5, 8]])
  const bar = tri
    ? `<line x1="5" y1="-10" x2="5" y2="10" stroke-width="2.4"/>`
    : `<line x1="-5" y1="-10" x2="-5" y2="10" stroke-width="2.4"/>`
  const zk = o.zener
    ? tri
      ? poly([[5, -10], [2, -10], [2, 10], [5, 10]])
      : poly([[-5, -10], [-2, -10], [-2, 10], [-5, 10]])
    : ''
  const ledArrows = o.led
    ? arrow(10, -4, 17, -13) + arrow(16, -4, 23, -13)
    : ''
  return g(
    x,
    y,
    o,
    wire(-h, 0, -5, 0) + tri + bar + zk + ledArrows + wire(5, 0, h, 0) +
      (o.label ? txt(0, -16, o.label, { size: 12, italic: true, dy: o.dy }) : '')
  )
}

/** BJT：npn / pnp，竖直放置（b 在左，c 在上，e 在下） */
export function bjt(x: number, y: number, o: ElOpt & { type?: 'npn' | 'pnp'; flip?: boolean } = {}): string {
  const t = o.type ?? 'npn'
  const flip = o.flip ? -1 : 1
  const up = -18 * flip
  const dn = 18 * flip
  const arrowOut = t === 'npn'
  const a1 = arrowOut ? arrow(2, dn, 10, dn + 8 * flip) : arrow(10, dn + 8 * flip, 2, dn)
  return g(
    x,
    y,
    o,
    `<line x1="-10" y1="-9" x2="-10" y2="9" stroke-width="2.6"/>` +
      wire(-22, 0, -10, 0) +
      wire(-10, -9, 6, up * 0.78) + wire(6, up * 0.78, 6, up) +
      wire(-10, 9, 6, dn * 0.78) + wire(6, dn * 0.78, 6, dn) +
      a1 +
      `<circle cx="6" cy="${up}" r="2.4" fill="none"/>` +
      (o.label ? txt(-22, 0, o.label, { anchor: 'end', size: 12, italic: true, dy: -10 }) : '')
  )
}

/** NMOS（增强型），竖直放置：d 上 s 下，g 左 */
export function nmos(x: number, y: number, o: ElOpt = {}): string {
  return g(
    x,
    y,
    o,
    wire(-24, -6, -8, -6) +
      `<line x1="-8" y1="-8" x2="-8" y2="18" stroke-width="2.6"/>` +
      `<line x1="-3" y1="-10" x2="-3" y2="2" stroke-width="2.6"/>` +
      `<line x1="-8" y1="-4" x2="4" y2="-4"/>` +
      `<line x1="-8" y1="8" x2="4" y2="8"/>` +
      wire(4, -20, 4, -4) + wire(4, 8, 4, 20) +
      arrow(4, -18, 4, -8) +
      (o.label ? txt(-26, -6, o.label, { anchor: 'end', size: 12, italic: true }) : '')
  )
}

/** 集成运放（+ 在上，- 在下） */
export function opamp(x: number, y: number, o: ElOpt & { flip?: boolean; gain?: string } = {}): string {
  const f = o.flip ? -1 : 1
  return g(
    x,
    y,
    o,
    solid([[-16, -22], [16, 0], [-16, 22]]) +
      wire(-22, -8 * f, -16, -8 * f) + wire(-22, 8 * f, -16, 8 * f) +
      wire(16, 0, 22, 0) +
      txt(-11, -8 * f, f === 1 ? '−' : '+', { size: 13, weight: 700 }) +
      txt(-11, 8 * f, f === 1 ? '+' : '−', { size: 13, weight: 700 }) +
      (o.gain ? txt(0, 3, o.gain, { size: 10, color: 'var(--vp-c-text-3)' }) : '') +
      (o.label ? txt(-24, 0, o.label, { anchor: 'end', size: 11, dy: -22 }) : '')
  )
}

/** 变压器（双线圈 + 铁芯） */
export function transformer(x: number, y: number, o: ElOpt & { core?: boolean; turns?: [number, number] } = {}): string {
  const h = 30
  const mk = (oy: number, n: number) => {
    const r = 5.5
    const step = 2 * r
    const w = Math.min((n * step) / 2, 26) // 线圈半宽，关于中心对称
    let d = `M${-w} ${oy} `
    for (let i = 0; i < n; i++) d += `a${r} ${r} 0 0 1 ${step} 0 `
    return `<path d="${d}" fill="none"/>`
  }
  const t = o.turns ?? [4, 6]
  return g(
    x,
    y,
    o,
    wire(-h, 0, -Math.min(t[0] * 5.5, 26), 0) + mk(0, t[0]) + wire(Math.min(t[0] * 5.5, 26), 0, h, 0) +
      wire(-h, 34, -Math.min(t[1] * 5.5, 26), 34) + mk(34, t[1]) + wire(Math.min(t[1] * 5.5, 26), 34, h, 34) +
      (o.core !== false ? `<line x1="-9" y1="-6" x2="-9" y2="40"/><line x1="-5" y1="-6" x2="-5" y2="40"/>` : '')
  )
}

/** 互感器（电流互感器 CT 符号） */
export function ct(x: number, y: number, o: ElOpt = {}): string {
  return g(x, y, o, `<circle cx="0" cy="0" r="13" fill="none" stroke-width="1.6"/>` + wire(-20, 0, 20, 0))
}

/* ------------------------------------------------------------------ 逻辑门 */

type Gate = 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor'

function gateBody(kind: Gate): { d: string; inputs: number; dx: number } {
  switch (kind) {
    case 'and':
    case 'nand':
      return { d: 'M-14 -16 L0 -16 A10 10 0 0 1 0 16 L-14 16 Z', inputs: 2, dx: 0 }
    case 'or':
    case 'nor':
    case 'xor':
    case 'xnor':
      return { d: 'M-14 -16 Q-2 0 -14 16 Q2 -14 14 0 Q2 14 -14 16 Z', inputs: 2, dx: 0 }
    case 'not':
      return { d: 'M-12 -14 L12 0 L-12 14 Z', inputs: 1, dx: 0 }
  }
}

export function gate(x: number, y: number, kind: Gate, o: { label?: string; scale?: number } = {}): string {
  const s = o.scale ?? 1
  const b = gateBody(kind)
  let inner = ''
  const iy = b.inputs === 2 ? [-7, 7] : [0]
  iy.forEach(dy => {
    inner += wire(-20, dy, -14, dy)
  })
  if (kind === 'not') inner += `<circle cx="12" cy="0" r="2.4" fill="none"/>` + wire(14.4, 0, 20, 0)
  else inner += wire(12, 0, 20, 0)
  if (kind === 'nand' || kind === 'nor' || kind === 'xnor') {
    inner += `<circle cx="12" cy="0" r="2.4" fill="none"/>`
    if (kind === 'xnor') inner += `<path d="M15 -3 Q20 0 15 3" fill="none"/>`
  }
  if (kind === 'xor' || kind === 'xnor') {
    inner += `<path d="M-9 -16 Q0 0 -9 16" fill="none"/>`
  }
  const body = `<path d="${b.d}" class="sf-fill"/>`
  return (
    `<g transform="translate(${pt(x, y)}) scale(${s})">` +
    inner + body +
    (o.label ? txt(0, -20, o.label, { size: 11 }) : '') +
    `</g>`
  )
}

/** 传输门 / 开关符号（数电里常用） */
export function muxBox(x: number, y: number, o: { label?: string; w?: number; h?: number } = {}): string {
  const w = o.w ?? 26
  const h = o.h ?? 34
  return (
    `<g transform="translate(${pt(x, y)})">` +
    poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { fill: true }) +
    (o.label ? txt(0, 0, o.label, { size: 11 }) : '') +
    `</g>`
  )
}

/* ------------------------------------------------------------------ 高层布局 API */

/** 各元件的半长（引线端点到中心的距离），布局时用来精确对齐 */
export const HALF: Record<string, number> = {
  resistor: 24,
  rheostat: 24,
  capacitor: 22,
  capVar: 22,
  inductor: 24,
  coupledInductor: 26,
  sourceDC: 26,
  sourceAC: 26,
  sourceI: 24,
  sw: 22,
  fuse: 20,
  lamp: 22,
  meter: 22,
  diode: 20,
  coil: 20,
  transformer: 30,
  ct: 20
}

const ELEM: Record<string, (x: number, y: number, o: ElOpt) => string> = {
  resistor,
  rheostat,
  capacitor,
  capVar,
  inductor,
  coupledInductor,
  sourceDC,
  sourceAC,
  sourceI,
  sw,
  fuse,
  lamp,
  meter,
  diode,
  coil,
  transformer,
  ct
}

/** seg 的附加选项：透传给元件本身的开关/二极管属性 */
export interface SegOpt extends ElOpt {
  kind?: 'spst' | 'button' | 'cont'
  closed?: boolean
  nc?: boolean
  dir?: 1 | -1
  on?: boolean
  /** 标签由元件自己画在内部（如线圈的 KM），seg 不再补外部标签 */
  inside?: boolean
}

/**
 * 在两点之间放置一个元件，并自动补上两端的引线。
 * 这是画电路图的主力函数——永远不要手算「元件放哪、线画到哪」，
 * 直接给起止点即可，端点必然严丝合缝：
 *
 *   seg('resistor', 60, 60, 240, 60, { label: 'R₁' })
 *   seg('diode', 130, 170, 230, 70)            // 45° 斜置也一样精确
 *
 * 角度由起止点自动求出（横 0° / 竖 ±90° / 斜 45/30/60°），
 * 引线沿该方向从端点直抵元件本体，绝不gap、绝不重叠。
 */
export function seg(
  name: keyof typeof ELEM | string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: SegOpt = {}
): string {
  const draw = ELEM[name]
  const half = HALF[name] ?? 24
  if (!draw) throw new Error(`schematic: 未知元件 ${name}`)
  const dx = x2 - x1
  const dy = y2 - y1
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const rot = Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
  const rad = (rot * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  const core = draw(cx, cy, { ...o, rot, label: o.inside ? o.label : undefined })
  // 外部标签：竖放置右侧，其余放上方（水平文本，不随元件旋转）
  let label = ''
  if (o.label && !o.inside) {
    if (Math.abs(rot) === 90) {
      label = txt(cx + (o.dx ?? 18), cy, o.label, { size: 12, italic: true, anchor: 'start', dy: o.dy })
    } else {
      label = txt(cx, cy - 16, o.label, { size: 12, italic: true, dy: o.dy })
    }
  }
  return (
    wire(x1, y1, cx - half * ux, cy - half * uy) +
    core +
    wire(cx + half * ux, cy + half * uy, x2, y2) +
    label
  )
}

/* ------------------------------------------------------------------ 辅助 */

/** 把「局部坐标」的内容平移到 (x,y)；有 rot 时绕自身中心旋转。
 *  必须始终带 translate —— 元件内部一律用局部坐标绘制（引线在 ±half），
 *  漏掉平移会让所有元件堆在 SVG 原点。
 *  注意：内容以局部原点为中心，所以「平移 + 旋转」就是绕自身中心旋转；
 *  不要写成 translate(x,y) rotate(θ) translate(-x,-y) —— 那等于把位于原点的
 *  内容绕 (x,y) 旋转，元素会被甩到画布外（本项目 2026-10-15 实测踩坑）。 */
function g(x: number, y: number, o: ElOpt, inner: string): string {
  const t = o.rot ? `translate(${pt(x, y)}) rotate(${o.rot})` : `translate(${pt(x, y)})`
  return `<g transform="${t}">${inner}</g>`
}

export function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** 生成一个完整 <svg> 包裹层
 *  注意：默认样式走 presentation attribute 而不是 CSS 类，
 *  否则 CSS 优先级高于 attribute，会把元件上调粗的 stroke-width 覆盖掉。
 */
export function svg(w: number, h: number, inner: string, cls = ''): string {
  return (
    `<svg viewBox="0 0 ${w} ${h}" class="sf ${cls}" xmlns="http://www.w3.org/2000/svg" ` +
    `fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" ` +
    `stroke-linecap="round" stroke-linejoin="round" role="img">${inner}</svg>`
  )
}
