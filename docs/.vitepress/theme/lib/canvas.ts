import { onMounted, onUnmounted, ref, watchEffect, type Ref } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'

export interface Frame {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  t: number
}

export interface CanvasHandle {
  /** animate 模式下是否正在播放（reduced-motion 下默认 false） */
  playing: Ref<boolean>
  /** 播放 / 暂停切换（非 animate 模式下是空操作） */
  togglePlay: () => void
}

/**
 * 把 canvas 接到响应式上：draw 里读到的 ref 变化会自动重绘。
 * animate=true 时额外开启 requestAnimationFrame 循环（用于动画），并带三重门控：
 *   1. prefers-reduced-motion: reduce → 默认不启动动画，只渲染静态首帧（用户可点「播放」手动启动）
 *   2. document.visibilitychange → 页签隐藏时暂停、恢复可见时继续
 *   3. IntersectionObserver → 滚出视口自动暂停（可用 opts.pauseOffscreen 关闭）
 */
export function useCanvas(
  el: Ref<HTMLCanvasElement | null>,
  draw: (f: Frame) => void,
  opts: { animate?: boolean; pauseOffscreen?: boolean } = {}
): CanvasHandle {
  let raf = 0
  ensureSrOnlyStyle()
  ensureThemeWatch()
  let ro: ResizeObserver | null = null
  let io: IntersectionObserver | null = null
  let tStart = 0 // 本次播放的起点（ms）；0 表示当前没在跑循环
  let tOffset = 0 // 已经播过的累计秒数：暂停 / 滚出视口期间冻结
  let inView = true
  // 用户意图：animate 模式默认播放（reduced-motion 下改为默认暂停）
  const playing = ref(false)
  const { reduced } = useReducedMotion()

  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
  /** t 的语义：从开始播放起累计的秒数（不是帧间隔）；暂停期间不累加 */
  const currentT = () => tOffset + (tStart ? (nowMs() - tStart) / 1000 : 0)

  function render() {
    // 把主题登记为 watchEffect 的依赖：深浅色切换后 TC / SIG 的墨色要跟着重绘
    void themeRev.value
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
    draw({ ctx, w, h, t: currentT() })
  }

  function loopRunning() {
    return raf !== 0
  }
  function startLoop() {
    if (loopRunning()) return
    tStart = nowMs()
    const loop = () => {
      render()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
  }
  function stopLoop() {
    if (loopRunning()) {
      // 冻结动画时钟：把这一段播放时长结转进累计值，暂停期间流逝的时间不计入 t
      tOffset = currentT()
      tStart = 0
      cancelAnimationFrame(raf)
      raf = 0
      render()
    }
  }
  /** 循环是否应该跑 = 用户要播 && 在视口内 && 页签可见 */
  function syncLoop() {
    const should =
      playing.value && inView && (typeof document === 'undefined' || !document.hidden)
    if (should) startLoop()
    else stopLoop()
  }
  function setPlaying(v: boolean) {
    playing.value = v
    syncLoop()
  }
  function togglePlay() {
    setPlaying(!playing.value)
  }

  watchEffect(() => render(), { flush: 'post' })

  onMounted(() => {
    if (!el.value) return
    ro = new ResizeObserver(() => {
      if (!opts.animate || !loopRunning()) render()
    })
    ro.observe(el.value)

    if (opts.animate) {
      if (opts.pauseOffscreen !== false && 'IntersectionObserver' in window) {
        io = new IntersectionObserver((entries) => {
          inView = entries.some((e) => e.isIntersecting)
          syncLoop()
        })
        io.observe(el.value)
      }
      const onVis = () => syncLoop()
      document.addEventListener('visibilitychange', onVis)
      onUnmounted(() => document.removeEventListener('visibilitychange', onVis))
      // reduced-motion：默认不启动动画（静态首帧由 watchEffect 完成），偏好变化时跟随
      if (reduced.value) playing.value = false
      else playing.value = true
      syncLoop()
      const stopRmWatch = watchEffect(() => {
        if (reduced.value && playing.value) playing.value = false
        syncLoop()
      })
      onUnmounted(stopRmWatch)
    }
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    raf = 0
    ro?.disconnect()
    io?.disconnect()
  })

  return { playing, togglePlay }
}

/**
 * 只对读屏可见的文本（sr-only）。
 * 全局注入一次即可，仿真组件里给 canvas 补「等价数据摘要」时统一用 class="sr-only"。
 * 项目不允许改 base.css（不在本任务的改动范围内），所以放这里。
 */
let srOnlyInjected = false
export function ensureSrOnlyStyle() {
  if (srOnlyInjected || typeof document === 'undefined') return
  srOnlyInjected = true
  if (document.getElementById('sim-sr-only-style')) return
  const el = document.createElement('style')
  el.id = 'sim-sr-only-style'
  el.textContent =
    '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
    'overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap;border:0}'
  document.head.appendChild(el)
}

export function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/**
 * 主题自适应取色。
 * 值在首次取用时缓存（避免每帧数十次 getComputedStyle 强制样式重算），
 * <html> 的 class 变化（深浅色切换）时缓存自动失效。
 */
const TC_KEYS = {
  text: ['--vp-c-text-1', '#e5e7eb'],
  text2: ['--vp-c-text-2', '#9ca3af'],
  text3: ['--vp-c-text-3', '#6b7280'],
  grid: ['--vp-c-divider', '#374151'],
  soft: ['--vp-c-bg-alt', '#1f2937'],
  brand: ['--vp-c-brand-1', '#3b82f6']
} as const

type TCKey = keyof typeof TC_KEYS

/**
 * 主题版本号：<html> 的 class 变化（深浅色切换）时 +1。
 * useCanvas 的 render() 会读它，因此主题变化成为 watchEffect 的依赖 → 画布重绘。
 */
export const themeRev = ref(0)
let themeWatcher: MutationObserver | null = null

/** 全局只挂一次 MutationObserver：失效取色缓存 + 推进主题版本号（SSR 下是空操作） */
export function ensureThemeWatch() {
  if (typeof document === 'undefined' || themeWatcher) return
  themeWatcher = new MutationObserver(() => {
    tcCache.clear()
    themeRev.value++
  })
  themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

const tcCache = new Map<TCKey, string>()

function tcGet(key: TCKey) {
  ensureThemeWatch()
  const hit = tcCache.get(key)
  if (hit !== undefined) return hit
  const [name, fallback] = TC_KEYS[key]
  const v = cssVar(name, fallback)
  tcCache.set(key, v)
  return v
}

export const TC = {
  get text() { return tcGet('text') },
  get text2() { return tcGet('text2') },
  get text3() { return tcGet('text3') },
  get grid() { return tcGet('grid') },
  get soft() { return tcGet('soft') },
  get brand() { return tcGet('brand') }
}

/** 信号配色：浅色模式用深色高对比值（对比度 ≥ 4.5:1），暗色保留原高亮值 */
const SIG_LIGHT = {
  v: '#b45309',
  i: '#0369a1',
  p: '#047857',
  warn: '#b91c1c',
  q: '#6d28d9',
  neutral: '#475569'
}
const SIG_DARK = {
  v: '#f59e0b',
  i: '#38bdf8',
  p: '#34d399',
  warn: '#ef4444',
  q: '#a78bfa',
  neutral: '#94a3b8'
}
type SIGKey = keyof typeof SIG_LIGHT

function isDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

export const SIG = {
  get v() { return isDark() ? SIG_DARK.v : SIG_LIGHT.v },
  get i() { return isDark() ? SIG_DARK.i : SIG_LIGHT.i },
  get p() { return isDark() ? SIG_DARK.p : SIG_LIGHT.p },
  get warn() { return isDark() ? SIG_DARK.warn : SIG_LIGHT.warn },
  get q() { return isDark() ? SIG_DARK.q : SIG_LIGHT.q },
  get neutral() { return isDark() ? SIG_DARK.neutral : SIG_LIGHT.neutral }
} satisfies Record<SIGKey, string>
