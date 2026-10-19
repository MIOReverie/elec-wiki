/** 波形/曲线生成工具：所有图解共用 */

export type Pt = [number, number]

/** 通用采样：把 f 在 [xMin,xMax] 上采 n 个点 */
export function curve(f: (x: number) => number, xMin: number, xMax: number, n = 240): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n
    out.push([x, f(x)])
  }
  return out
}

/** 常用波形（x 为归一化时间 0..1） */
export const waves = {
  sine: (amp = 1, cycles = 1, phase = 0) => (x: number) => amp * Math.sin(2 * Math.PI * cycles * x + phase),
  cos: (amp = 1, cycles = 1, phase = 0) => (x: number) => amp * Math.cos(2 * Math.PI * cycles * x + phase),
  /** 三相：返回三个 120° 相差的正弦 */
  threePhase: (amp = 1, cycles = 1) => [
    (x: number) => amp * Math.sin(2 * Math.PI * cycles * x),
    (x: number) => amp * Math.sin(2 * Math.PI * cycles * x - (2 * Math.PI) / 3),
    (x: number) => amp * Math.sin(2 * Math.PI * cycles * x + (2 * Math.PI) / 3)
  ],
  /** 全波整流输出 */
  rectify: (amp = 1, cycles = 2) => (x: number) => amp * Math.abs(Math.sin(2 * Math.PI * cycles * x)),
  /** 半波整流 */
  halfRectify: (amp = 1, cycles = 2) => (x: number) => Math.max(0, amp * Math.sin(2 * Math.PI * cycles * x)),
  /** 方波（占空比 duty） */
  square: (amp = 1, cycles = 4, duty = 0.5, offset = 0) => (x: number) => {
    const p = (x * cycles) % 1
    return p < duty ? amp + offset : offset
  },
  /** 三角波 */
  triangle: (amp = 1, cycles = 2, offset = 0) => (x: number) => {
    const p = (x * cycles) % 1
    return offset + (p < 0.5 ? amp * (4 * p - 1) : amp * (3 - 4 * p))
  },
  /** 锯齿波（扫描） */
  saw: (amp = 1, cycles = 3, offset = 0) => (x: number) => offset + amp * ((x * cycles) % 1),
  /** 指数充放电：tau 以归一化时间计 */
  exp: (u0 = 0, uInf = 1, tau = 0.3, cycles = 1) => {
    const T = 1 / cycles
    return (x: number) => {
      const t = x % T
      return uInf + (u0 - uInf) * Math.exp(-t / tau)
    }
  },
  /** 衰减振荡（欠阻尼暂态） */
  damped: (amp = 1, cycles = 3, damp = 6) => (x: number) => amp * Math.exp(-damp * x) * Math.cos(2 * Math.PI * cycles * x),
  /** RC 充放电 + 负载（最终稳定值不是 1） */
  chargeRL: (tau = 0.25, final = 0.8) => (x: number) => final * (1 - Math.exp(-x / tau)),
  /** 线性上升/下降斜坡 */
  ramp: (from = 0, to = 1, cycles = 2) => (x: number) => {
    const p = (x * cycles) % 1
    return from + (to - from) * p
  }
}

/** 采样点转 path 的 d 属性（数据坐标，画布变换在组件里做） */
export function toPath(pts: Pt[], xf: (p: Pt) => Pt): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${xf(p).map(n => Math.round(n * 100) / 100).join(' ')}`).join(' ')
}
