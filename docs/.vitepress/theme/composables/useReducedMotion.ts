import { onUnmounted, ref } from 'vue'

/**
 * 响应系统「减少动态效果」偏好（prefers-reduced-motion: reduce）。
 * SSR 安全：不直接访问 window / matchMedia，在客户端挂载后才查询。
 * 返回一个只读 ref（true 表示用户要求减少动画），并监听偏好变化实时更新。
 * 无全局副作用，按需在组件内调用。
 */
export function useReducedMotion() {
  const reduced = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      reduced.value = e.matches
    }
    // 旧浏览器无 addEventListener，退回 addListener
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      onUnmounted(() => mq.removeEventListener('change', onChange))
    } else {
      mq.addListener(onChange)
      onUnmounted(() => mq.removeListener(onChange))
    }
  }

  return { reduced }
}
