export interface Box { x: number; y: number; w: number; h: number }
export interface Range { xmin: number; xmax: number; ymin: number; ymax: number }

export function mapper(b: Box, r: Range) {
  return (x: number, y: number): [number, number] => [
    b.x + ((x - r.xmin) / (r.xmax - r.xmin)) * b.w,
    b.y + b.h - ((y - r.ymin) / (r.ymax - r.ymin)) * b.h
  ]
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min
  if (span <= 0) return [min]
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / step) * step
  const out: number[] = []
  for (let v = start; v <= max + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-6 ? 0 : v)
  return out
}

export const fmtNum = (v: number) => {
  const a = Math.abs(v)
  if (a === 0) return '0'
  if (a >= 1e5 || a < 1e-3) return v.toExponential(1)
  if (a >= 100) return v.toFixed(0)
  if (a >= 10) return v.toFixed(1)
  return v.toFixed(2)
}

export interface FrameOpts {
  xLabel?: string
  yLabel?: string
  xTicks?: number[]
  yTicks?: number[]
  fmtX?: (v: number) => string
  fmtY?: (v: number) => string
  zeroLine?: boolean
}

/** 画坐标轴网格与刻度 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  b: Box,
  r: Range,
  o: FrameOpts,
  colors: { grid: string; text3: string; text2: string }
) {
  const m = mapper(b, r)
  const fx = o.fmtX || fmtNum
  const fy = o.fmtY || fmtNum
  const xt = o.xTicks || niceTicks(r.xmin, r.xmax, 6)
  const yt = o.yTicks || niceTicks(r.ymin, r.ymax, 5)

  ctx.lineWidth = 1
  ctx.strokeStyle = colors.grid
  ctx.fillStyle = colors.text3
  ctx.font = '11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  for (const x of xt) {
    const [px] = m(x, 0)
    ctx.beginPath()
    ctx.moveTo(Math.round(px) + 0.5, b.y)
    ctx.lineTo(Math.round(px) + 0.5, b.y + b.h)
    ctx.stroke()
    ctx.fillText(fx(x), px, b.y + b.h + 5)
  }

  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (const y of yt) {
    const [, py] = m(0, y)
    ctx.beginPath()
    ctx.moveTo(b.x, Math.round(py) + 0.5)
    ctx.lineTo(b.x + b.w, Math.round(py) + 0.5)
    ctx.stroke()
    ctx.fillText(fy(y), b.x - 6, py)
  }

  if (o.zeroLine !== false) {
    const [zx, zy] = m(0, 0)
    ctx.strokeStyle = colors.text2
    ctx.lineWidth = 1.2
    if (zy >= b.y && zy <= b.y + b.h) {
      ctx.beginPath(); ctx.moveTo(b.x, zy); ctx.lineTo(b.x + b.w, zy); ctx.stroke()
    }
    if (zx >= b.x && zx <= b.x + b.w) {
      ctx.beginPath(); ctx.moveTo(zx, b.y); ctx.lineTo(zx, b.y + b.h); ctx.stroke()
    }
  }

  if (o.xLabel) {
    ctx.fillStyle = colors.text2
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(o.xLabel, b.x + b.w, b.y + b.h + 20)
  }
  if (o.yLabel) {
    ctx.fillStyle = colors.text2
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(o.yLabel, b.x - 2, b.y - 16)
  }
}

export function poly(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  color: string,
  width = 2,
  dash?: number[]
) {
  if (pts.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.stroke()
  ctx.restore()
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left',
  size = 12,
  bold = false
) {
  ctx.fillStyle = color
  ctx.font = `${bold ? '600 ' : ''}${size}px system-ui, -apple-system, "Segoe UI", sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

/** 箭头 */
export function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width = 2, head = 8
) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2 - Math.cos(a) * head * 0.7, y2 - Math.sin(a) * head * 0.7)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head)
  ctx.lineTo(x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
