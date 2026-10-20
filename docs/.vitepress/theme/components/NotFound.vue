<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../../data/catalog.data'

const courses = data.courses.filter((c) => c.chapters.length > 0)

const tools = [
  { text: '公式速查表', route: '/shared/cheatsheet' },
  { text: '知识依赖图谱', route: '/ee/graph' },
  { text: '内容状态与成熟度', route: '/guide/status' },
  { text: '全部页面', route: '/guide/pages' },
  { text: '怎么用这个站', route: '/guide/start' }
]
</script>

<template>
  <div class="nf">
    <div class="nf-code" aria-hidden="true">404</div>
    <h1 class="nf-title">页面不存在</h1>
    <p class="nf-quote">
      链接可能写错了，或者内容搬了家。按 <kbd>Ctrl</kbd> + <kbd>K</kbd> 搜索关键词，或从下面随便挑一个入口。
    </p>

    <div class="nf-actions">
      <a class="nf-btn" :href="withBase('/')">返回首页</a>
      <button class="nf-btn nf-btn-alt" type="button" aria-label="打开站内搜索" @click="$el?.querySelector('.VPNavBarSearch button')?.click()">搜索</button>
    </div>

    <div class="nf-grid">
      <a v-for="c in courses" :key="c.slug" class="nf-card" :href="withBase(c.route)">
        <span class="nf-name">{{ c.name }}</span>
        <span class="nf-meta">{{ c.chapters.length }} 节 · 约 {{ Math.round(c.minutes / 60) }} 小时</span>
      </a>
    </div>

    <div class="nf-links">
      <a v-for="t in tools" :key="t.route" :href="withBase(t.route)">{{ t.text }}</a>
    </div>
  </div>
</template>

<style scoped>
.nf {
  max-width: 620px;
  margin: 0 auto;
  padding: 72px 24px 96px;
  text-align: center;
}
.nf-code {
  font-size: 84px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--vp-c-brand-1);
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}
.nf-title {
  margin: 12px 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nf-quote {
  margin: 0 auto 26px;
  max-width: 460px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}
.nf-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.nf-btn {
  display: inline-block;
  padding: 8px 18px;
  border-radius: var(--r-md);
  /* 白字底改 brand-3（深色阶梯）：浅色 #1d4ed8 → 6.70:1，暗色 #2563eb → 5.17:1，均 ≥4.5 */
  background: var(--vp-c-brand-3);
  color: #fff !important;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none !important;
  border: 1px solid transparent;
  cursor: pointer;
}
.nf-btn:hover { background: var(--vp-c-brand-2); }
.nf-btn-alt {
  background: transparent;
  color: var(--vp-c-text-1) !important;
  border-color: var(--vp-c-divider);
}
.nf-btn-alt:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}
.nf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  text-align: left;
}
.nf-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--r-md);
  background: var(--vp-c-bg-soft);
  text-decoration: none !important;
  transition: border-color 0.2s, transform 0.2s;
}
.nf-card:hover { border-color: var(--vp-c-brand-1); transform: translateY(-1px); }
.nf-name { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.nf-meta { font-size: var(--text-xs); color: var(--vp-c-text-3); }
.nf-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  font-size: 13px;
}
.nf-links a { color: var(--vp-c-text-2); }
.nf-links a:hover { color: var(--vp-c-brand-1); }
</style>
