import { onMounted, onUnmounted, watchEffect, type Ref } from 'vue'

export interface Frame {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  t: number
}

/**
 * 把 canvas 接到响应式上：draw 里读到的 ref 变化会自动重绘。
 * animate=true 时额外开启 requestAnimationFrame 循环（用于动画）。
 */
export function useCanvas(
  el: Ref<HTMLCanvasElement | null>,
  draw: (f: Frame) => void,
  opts: { animate?: boolean } = {}
) {
  let raf = 0
  let ro: ResizeObserver | null = null
  const start = performance.now()

  function render() {
    const c = el.value
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = c.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.font = '12px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.textBaseline = 'middle'
    draw({ ctx, w, h, t: (performance.now() - start) / 1000 })
  }

  watchEffect(() => render(), { flush: 'post' })

  onMounted(() => {
    if (!el.value) return
    ro = new ResizeObserver(() => {
      if (!opts.animate) render()
    })
    ro.observe(el.value)
    if (opts.animate) {
      const loop = () => {
        render()
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    ro?.disconnect()
  })
}

export function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/** 主题自适应取色 */
export const TC = {
  get text() { return cssVar('--vp-c-text-1', '#e5e7eb') },
  get text2() { return cssVar('--vp-c-text-2', '#9ca3af') },
  get text3() { return cssVar('--vp-c-text-3', '#6b7280') },
  get grid() { return cssVar('--vp-c-divider', '#374151') },
  get soft() { return cssVar('--vp-c-bg-alt', '#1f2937') },
  get brand() { return cssVar('--vp-c-brand-1', '#3b82f6') }
}

/** 信号配色（明暗主题通用） */
export const SIG = {
  v: '#f59e0b',
  i: '#38bdf8',
  p: '#34d399',
  warn: '#ef4444',
  q: '#a78bfa',
  neutral: '#94a3b8'
}
