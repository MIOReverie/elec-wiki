import { label } from './plot'

export function wire(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width = 2
) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

/** 电阻（锯齿） */
export function resistor(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, horiz: boolean, color: string, len = 34
) {
  const n = 6
  const step = len / n
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - (horiz ? len / 2 : 0), cy - (horiz ? 0 : len / 2))
  for (let i = 0; i < n; i++) {
    const s = -len / 2 + (i + 0.5) * step
    const off = i % 2 === 0 ? -6 : 6
    if (horiz) ctx.lineTo(cx + s, cy + off)
    else ctx.lineTo(cx + off, cy + s)
  }
  ctx.lineTo(cx + (horiz ? len / 2 : 0), cy + (horiz ? 0 : len / 2))
  ctx.stroke()
}

/** 直流电压源（长短线） */
export function battery(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, horiz: boolean, color: string, gap = 5
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  if (horiz) {
    ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx - gap, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + 12, cy); ctx.stroke()
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(cx - gap, cy - 9); ctx.lineTo(cx - gap, cy + 9); ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx + gap, cy - 5); ctx.lineTo(cx + gap, cy + 5); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy - gap); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + 12); ctx.stroke()
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(cx - 9, cy - gap); ctx.lineTo(cx + 9, cy - gap); ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx - 5, cy + gap); ctx.lineTo(cx + 5, cy + gap); ctx.stroke()
  }
}

/** 交流源（圆内正弦） */
export function acSource(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string, r = 15
) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7)
  ctx.fillStyle = 'transparent'; ctx.fill()
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
  ctx.strokeStyle = color; ctx.lineWidth = 1.6
  ctx.beginPath()
  for (let i = 0; i <= 24; i++) {
    const x = cx - 8 + (16 * i) / 24
    const y = cy - Math.sin((i / 24) * Math.PI * 2) * 5
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
}

/** 灯泡 */
export function lamp(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string, glow = 0
) {
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7)
  ctx.fillStyle = `rgba(245,158,11,${0.1 + glow * 0.85})`
  ctx.fill()
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
  ctx.strokeStyle = color; ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx + 6, cy + 6)
  ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(cx - 6, cy + 6)
  ctx.stroke()
  if (glow > 0.03) {
    ctx.save()
    ctx.shadowColor = 'rgba(245,158,11,0.95)'
    ctx.shadowBlur = 8 + glow * 24
    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7)
    ctx.fillStyle = '#f59e0b'; ctx.fill()
    ctx.restore()
  }
}

/** 接地 */
export function ground(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 7); ctx.stroke()
  for (let k = 0; k < 3; k++) {
    const w = 14 - k * 4.5
    ctx.beginPath(); ctx.moveTo(x - w, y + 7 + k * 4.5); ctx.lineTo(x + w, y + 7 + k * 4.5); ctx.stroke()
  }
}

/** 电容 */
export function capacitor(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, horiz: boolean, color: string
) {
  ctx.strokeStyle = color; ctx.lineWidth = 2
  if (horiz) {
    ctx.beginPath(); ctx.moveTo(cx - 3, cy - 9); ctx.lineTo(cx - 3, cy + 9); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 3, cy - 9); ctx.lineTo(cx + 3, cy + 9); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.moveTo(cx - 9, cy - 3); ctx.lineTo(cx + 9, cy - 3); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - 9, cy + 3); ctx.lineTo(cx + 9, cy + 3); ctx.stroke()
  }
}

/** 电感（半圆串） */
export function inductor(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, horiz: boolean, color: string
) {
  ctx.strokeStyle = color; ctx.lineWidth = 2
  ctx.beginPath()
  const n = 4, w = 8
  if (horiz) {
    ctx.moveTo(cx - (n * w) / 2, cy)
    for (let i = 0; i < n; i++) ctx.arc(cx - (n * w) / 2 + w * i + w / 2, cy, w / 2, Math.PI, 0)
  } else {
    ctx.moveTo(cx, cy - (n * w) / 2)
    for (let i = 0; i < n; i++) {
      ctx.arc(cx, cy - (n * w) / 2 + w * i + w / 2, w / 2, -Math.PI / 2, Math.PI / 2)
    }
  }
  ctx.stroke()
}

/** 二极管 */
export function diode(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, horiz: boolean, color: string
) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.8
  ctx.beginPath()
  if (horiz) {
    ctx.moveTo(cx - 7, cy - 8); ctx.lineTo(cx - 7, cy + 8); ctx.lineTo(cx + 7, cy)
  } else {
    ctx.moveTo(cx - 8, cy - 7); ctx.lineTo(cx + 8, cy - 7); ctx.lineTo(cx, cy + 7)
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill()
  ctx.beginPath()
  if (horiz) { ctx.moveTo(cx + 7, cy - 8); ctx.lineTo(cx + 7, cy + 8) }
  else { ctx.moveTo(cx - 8, cy + 7); ctx.lineTo(cx + 8, cy + 7) }
  ctx.stroke()
}

/** 带文字标注 */
export function tag(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, color: string, align: CanvasTextAlign = 'center', bold = false
) {
  label(ctx, text, x, y, color, align, 11.5, bold)
}
