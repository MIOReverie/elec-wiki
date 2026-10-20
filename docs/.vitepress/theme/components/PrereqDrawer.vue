<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { PREREQ } from '../data/prereq'
import {
  prereqOpen,
  prereqHtml,
  prereqLoading,
  prereqFailed,
  currentId,
  closePrereq
} from '../composables/usePrereq'

const item = computed(() => (currentId.value ? PREREQ[currentId.value] : undefined))
const panel = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
let lastFocused: HTMLElement | null = null

function focusables(): HTMLElement[] {
  const root = panel.value
  if (!root) return []
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

function onKey(e: KeyboardEvent) {
  if (!prereqOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closePrereq()
    return
  }
  if (e.key !== 'Tab') return
  const list = focusables()
  if (!list.length) return
  const first = list[0]
  const last = list[list.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

watch(prereqOpen, async (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('prereq-open', open)
  if (open) {
    lastFocused = document.activeElement as HTMLElement | null
    await nextTick()
    closeBtn.value?.focus()
  } else {
    const target = lastFocused
    lastFocused = null
    target?.focus?.()
  }
})
</script>

<template>
  <Transition name="pd">
    <div v-if="prereqOpen" class="pd-root" @click.self="closePrereq()">
      <aside
        ref="panel"
        class="pd-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pd-title"
      >
        <header class="pd-head">
          <div class="pd-headline">
            <span class="pd-kind">前置知识</span>
            <span v-if="item?.group" class="pd-group">{{ item.group }}</span>
          </div>
          <h3 id="pd-title" class="pd-title">{{ item?.title || currentId }}</h3>
          <button
            ref="closeBtn"
            class="pd-close"
            type="button"
            aria-label="关闭前置知识"
            @click="closePrereq()"
          >✕</button>
        </header>

        <div class="pd-body">
          <p v-if="item?.brief" class="pd-brief">{{ item.brief }}</p>

          <div v-if="prereqLoading" class="pd-state" role="status">正在加载完整卡片…</div>
          <div v-else-if="prereqFailed" class="pd-state pd-warn" role="alert">
            卡片加载失败（离线或未构建），可点击下方按钮打开完整章节。
          </div>
          <!-- 拉取的是站内已构建的静态页，可信内容 -->
          <div v-else-if="prereqHtml" class="vp-doc pd-doc" v-html="prereqHtml" />
        </div>

        <footer class="pd-foot">
          <a v-if="item?.full" class="pd-link" :href="withBase(item.full)">
            深入：{{ item.fullTitle || '相关章节' }} →
          </a>
          <button class="pd-btn" type="button" @click="closePrereq()">继续阅读</button>
        </footer>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.pd-root {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  justify-content: flex-end;
  background: rgb(0 0 0 / 0.35);
  backdrop-filter: blur(2px);
}
.pd-panel {
  width: min(460px, 92vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  border-left: 1px solid var(--vp-c-divider);
  box-shadow: -14px 0 40px rgb(0 0 0 / 0.22);
}
.pd-head {
  position: relative;
  padding: 16px 52px 12px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.pd-headline { display: flex; gap: 8px; align-items: center; }
/* 白字底色用 brand-3（深色阶梯）：浅色 #1d4ed8 → 6.70:1，暗色 #2563eb → 5.17:1，均 ≥4.5 */
.pd-kind {
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 1px 7px;
  border-radius: 4px;
  color: #fff;
  background: var(--vp-c-brand-3);
}
.pd-group { font-size: 11px; color: var(--vp-c-text-3); }
.pd-title { margin: 6px 0 0; font-size: 17px; font-weight: 700; }
.pd-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
}
.pd-close:hover { color: var(--vp-c-text-1); background: var(--vp-c-bg-alt); }
.pd-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px 18px 20px;
  font-size: 14px;
  line-height: 1.75;
}
.pd-brief {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 0 8px 8px 0;
  color: var(--vp-c-text-1);
}
.pd-state { padding: 18px 0; color: var(--vp-c-text-3); font-size: 13px; }
.pd-warn { color: var(--vp-c-warning-1); }
.pd-doc { padding: 0 !important; }
.pd-doc :deep(p) { margin: 0.7em 0; }
.pd-doc :deep(h2),
.pd-doc :deep(h3) { margin: 1em 0 0.4em; font-size: 15px; border: none; padding: 0; }
.pd-doc :deep(ul) { padding-left: 1.2em; margin: 0.6em 0; }
.pd-doc :deep(code) { font-size: 0.9em; }
/* 抽屉只有 420px 宽：公式整体缩一点，块级公式允许横向滚动 */
.pd-doc :deep(.katex) { font-size: 0.95em; }
.pd-doc :deep(.katex-display) {
  font-size: 0.92em;
  margin: 0.5em 0;
  padding-bottom: 4px;
  overflow-x: auto;
  scrollbar-width: thin;
}
.pd-doc :deep(table) { display: block; overflow-x: auto; font-size: 12.5px; }
.pd-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.pd-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.pd-link:hover { text-decoration: underline; }
.pd-btn {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.pd-btn:hover { color: var(--vp-c-text-1); background: var(--vp-c-bg-alt); }

.pd-enter-active, .pd-leave-active { transition: opacity 0.22s ease; }
.pd-enter-active .pd-panel, .pd-leave-active .pd-panel { transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1); }
.pd-enter-from, .pd-leave-to { opacity: 0; }
.pd-enter-from .pd-panel, .pd-leave-to .pd-panel { transform: translateX(100%); }
</style>
