import { defineConfig } from 'vitepress'
import markdownKatex from './theme/lib/markdown-katex'
import { COURSE_META, allDescriptions, courseSidebar, getCourses } from './data/catalog'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// 部署到子路径时（如 GitHub Pages 项目页）：DOCS_BASE=/仓库名/ npm run build
const BASE = process.env.DOCS_BASE || '/'
// 站点正式地址（含子路径，如 https://user.github.io/repo/）：
// 只有配置了才输出 sitemap 与 canonical，避免写出错的绝对地址
const SITE_URL = process.env.SITE_URL || ''
const SITE_ROOT = SITE_URL ? SITE_URL.replace(/\/+$/, '') + '/' : ''
const SITE_ORIGIN = SITE_ROOT ? new URL(SITE_ROOT).origin : ''
const HOSTNAME = SITE_ROOT.replace(/\/$/, '')

/** 把站内路径拼到部署基路径上（BASE 是 / 或 /repo/） */
const withBasePath = (path: string) =>
  `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

const SITE_NAME = '电学手记'
const SITE_DESC =
  '电工学、数字电路、模拟电子与嵌入式开发的学习 Wiki：结论先行、可交互演示、每页标注难度与耗时。'
// og:image 宽高（docs/public/og.png）
const OG_IMAGE_W = 1200
const OG_IMAGE_H = 630

// 中文检索友好：把连续汉字切成 2-gram，避免整句变成一个 token
const zhTokenize = (text: string) => {
  const out: string[] = []
  const re = /[a-zA-Z0-9_]+|[\u4e00-\u9fa5]+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const s = m[0]
    if (/^[a-zA-Z0-9_]+$/.test(s)) {
      out.push(s.toLowerCase())
    } else {
      if (s.length === 1) out.push(s)
      for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2))
    }
  }
  return out
}

/** 路由 → 一句话摘要，用于生成 meta description / og:description（含前置知识卡片页） */
const DESCRIPTIONS: Record<string, string> = (() => {
  const map = allDescriptions()
  for (const course of getCourses()) {
    if (course.summary) map[course.route] = course.summary
  }
  return map
})()

const GUIDE_SIDEBAR = [
  {
    text: '关于本站',
    items: [
      { text: '这个站是什么', link: '/guide/' },
      { text: '怎么用（新读者从这里开始）', link: '/guide/start' },
      { text: '学习地图', link: '/map' },
      { text: 'B 站网课推荐', link: '/guide/courses' },
      { text: '关于与版权', link: '/guide/about' }
    ]
  },
  {
    text: '内容维护',
    items: [
      { text: '内容状态与成熟度', link: '/guide/status' },
      { text: '全部页面', link: '/guide/pages' },
      { text: '术语与前置知识索引', link: '/guide/glossary' },
      { text: '写作与贡献指南', link: '/guide/contributing' },
      { text: '更新日志', link: '/guide/changelog' },
      { text: '隐私与免责', link: '/guide/privacy' }
    ]
  }
]

/** 实验与仪器板块侧栏 */
const LAB_SIDEBAR = [
  {
    text: '实验与仪器',
    items: [
      { text: '实验总览', link: '/lab/' },
      { text: '万用表', link: '/lab/multimeter' },
      { text: '示波器', link: '/lab/oscilloscope' },
      { text: '焊接与搭电路', link: '/lab/soldering' },
      { text: '实验台与安全', link: '/lab/bench' }
    ]
  }
]

/** 项目专题板块侧栏（电力电子入门是其中一个子系列） */
const TOPICS_SIDEBAR = [
  {
    text: '项目专题',
    items: [
      { text: '专题总览', link: '/topics/' },
      { text: '可调实验电源', link: '/topics/power-supply' },
      { text: '直流电机驱动', link: '/topics/motor-drive' },
      { text: '双轴舵机云台', link: '/topics/servo-gimbal' }
    ]
  },
  {
    text: '电力电子入门',
    collapsed: false,
    items: [
      { text: '课程导览', link: '/topics/power-electronics/' },
      { text: '整流 AC-DC', link: '/topics/power-electronics/ac-dc' },
      { text: '直流变换 DC-DC', link: '/topics/power-electronics/dc-dc' },
      { text: '逆变 DC-AC', link: '/topics/power-electronics/dc-ac' }
    ]
  }
]

const COURSE_NAV = COURSE_META.map((m) => {
  const course = getCourses().find((c) => c.slug === m.slug)
  return { text: m.name, link: course?.route || `/${m.slug}/` }
})

export default defineConfig({
  base: BASE,
  lang: 'zh-CN',
  title: SITE_NAME,
  // VitePress 的占位符是 :title（不是 %s），渲染为「页面标题 · 电学手记」
  titleTemplate: ':title · 电学手记',
  description: SITE_DESC,
  cleanUrls: true,
  // 死链直接让构建失败：wiki 的第一条底线是「点得到」
  ignoreDeadLinks: false,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: `${BASE}logo.svg`, type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#f8fafc', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#0b1017', media: '(prefers-color-scheme: dark)' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'og:image', content: `${BASE}og.png` }]
  ],
  // sitemap 库只接受 origin：子路径要自己拼进每条 url，否则 /repo/ 会被吞掉
  sitemap: SITE_ROOT
    ? {
        hostname: SITE_ORIGIN,
        transformItems: (items: { url: string }[]) =>
          items.map((item) => ({ ...item, url: withBasePath(item.url) }))
      }
    : undefined,
  vite: {
    build: {
      // 本地反复构建时代价高、且某些环境会拦截批量删除；设 NO_CLEAN=1 可跳过清空 dist
      emptyOutDir: process.env.NO_CLEAN !== '1'
    }
  },
  markdown: {
    lineNumbers: false,
    config(md: any) {
      // 必须用自研插件：markdown-it-katex 内嵌 KaTeX 0.6，与顶层 0.16 的 CSS 版本错配会导致公式错位
      md.use(markdownKatex, {})
    }
  },
  // 首页没有 frontmatter title，pageData.title 会回退成站名，
  // 拼上 titleTemplate 就成了「电学手记 · 电学手记」；首页单独关掉模板
  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') pageData.titleTemplate = false
  },
  transformHtml(html: string, id: string) {
    let out = html
    // VitePress 会对默认主题硬插入 inter-roman-latin 的 <link rel=preload>（chunk-D3CUZ4fa.js:49604）。
    // 本站中文正文由 PingFang / 微软雅黑兜底，Inter 只服务拉丁字形，SSR 首屏不需要抢带宽；
    // 这里去掉该 preload，浏览器仍会在 CSS 解析到 @font-face 命中 latin 字形时才按需下载。
    out = out.replace(
      /<link\s+[^>]*rel="preload"[^>]*inter-roman-latin[^>]*>/g,
      ''
    )
    // 404 的客户端壳在禁用 JS 时是空白页：在 #app 容器内塞一份静态兜底，
    // Vue 挂载时会清空容器，不会产生 hydration 冲突；纯静态，无额外资源。
    if (/404\.html$/.test(id)) {
      out = out.replace(
        /<div id="app">/,
        `<div id="app"><div class="static-404">
      <style>
        .static-404{max-width:640px;margin:12vh auto;padding:0 24px;text-align:center;
          font-family:PingFang SC,Microsoft YaHei,system-ui,sans-serif;line-height:1.8;color:#1f2937}
        .static-404 h1{font-size:1.8rem;margin:0 0 12px}
        .static-404 p{margin:6px 0;color:#4b5563}
        .static-404 a{color:#3451b2}
        @media (prefers-color-scheme:dark){.static-404{color:#e5e7eb}.static-404 p{color:#9ca3af}.static-404 a{color:#93b4ff}}
      </style>
      <h1>页面不存在</h1>
      <p>你访问的这个地址在本站没有对应内容——它可能被移动、重命名，或从未存在。</p>
      <p><a href="${BASE}">返回站点首页</a>，从目录重新找一次。</p>
      <p>浏览器启用了 JavaScript 时还可以按 <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> 搜索站内内容。</p>
    </div><noscript><div class="static-404"><h1>页面不存在</h1><p>当前未启用 JavaScript，无法使用站内搜索。</p><p><a href="${BASE}">返回站点首页</a></p></div></noscript>`
      )
    }
    return out
  },
  transformHead({ pageData }) {
    // 404 页不进索引：默认主题用同一份数据渲染，这里显式声明 noindex
    if ((pageData as any).isNotFound) return [['meta', { name: 'robots', content: 'noindex' }]]

    const isIndex = /(^|\/)index\.md$/.test(pageData.relativePath)
    const isHome = pageData.relativePath === 'index.md'
    const slug = pageData.relativePath
      .replace(/\.md$/, '')
      .replace(/\/index$/, '')
      .replace(/^index$/, '')
    const route = slug ? `/${slug}${isIndex ? '/' : ''}` : '/'
    const desc = pageData.description || DESCRIPTIONS[route] || SITE_DESC
    const title = pageData.frontmatter.title || pageData.title || SITE_NAME
    const ogTitle = title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`
    // SITE_ROOT 已经包含子路径（https://user.github.io/repo/）
    const canonical = route === '/' ? SITE_ROOT : `${SITE_ROOT}${route.slice(1)}`
    // og:image 用绝对地址：分享卡片抓取器不接受相对路径
    const ogImage = SITE_ROOT ? `${SITE_ROOT}og.png` : `${BASE}og.png`
    const lastUpdated = pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : ''

    const tags: any[] = [
      ['meta', { property: 'og:title', content: ogTitle }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      // 与静态 head 里的 og:type:website 同名去重，正文页覆盖为 article
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { property: 'og:image:width', content: String(OG_IMAGE_W) }],
      ['meta', { property: 'og:image:height', content: String(OG_IMAGE_H) }],
      ['meta', { property: 'og:image:alt', content: `${SITE_NAME} 分享卡片` }],
      ['meta', { name: 'twitter:title', content: ogTitle }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: ogImage }]
    ]
    // 正文页大多没写 frontmatter description，用目录扫描出的首段摘要补一条 meta description
    if (!pageData.description) tags.push(['meta', { name: 'description', content: desc }])
    if (SITE_ROOT) {
      tags.push(['link', { rel: 'canonical', href: canonical }])
      tags.push(['meta', { property: 'og:url', content: canonical }])
    }
    if (lastUpdated && !isHome) {
      tags.push(['meta', { property: 'article:modified_time', content: lastUpdated }])
    }

    // 结构化数据：首页 WebSite，其余页 TechArticle + 面包屑
    if (isHome) {
      const website: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        description: SITE_DESC,
        inLanguage: 'zh-CN'
      }
      if (SITE_ROOT) website.url = SITE_ROOT
      tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(website)])
    } else {
      const article: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: ogTitle,
        description: desc,
        inLanguage: 'zh-CN',
        image: ogImage
      }
      if (SITE_ROOT) article.url = canonical
      if (lastUpdated) article.dateModified = lastUpdated
      tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(article)])

      // 面包屑：首页 > 课程（及中间有名字的层级）> 本页
      const crumbs: { '@type': string; name: string; url?: string }[] = [
        { '@type': 'ListItem', name: '首页' }
      ]
      if (SITE_ROOT) crumbs[0].url = SITE_ROOT
      const segs = route.split('/').filter(Boolean)
      segs.forEach((seg, i) => {
        const last = i === segs.length - 1
        const course = COURSE_META.find((m) => m.slug === seg)
        if (!last && !course) return // 无名字的中间目录（如 01-basics）跳过
        const item: { '@type': string; name: string; url?: string } = {
          '@type': 'ListItem',
          name: last ? title : (course?.name ?? seg)
        }
        if (SITE_ROOT) item.url = `${SITE_ROOT}${segs.slice(0, i + 1).join('/')}/`
        crumbs.push(item)
      })
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({ ...c, position: i + 1 }))
      }
      tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(breadcrumb)])
    }
    return tags
  },
  async buildEnd({ outDir }) {
    // public/robots.txt 是静态拷贝，Sitemap 行只有在知道正式地址时才有意义：
    // 构建产物里改写（保留原规则），不设置 SITE_URL 时保持原样
    if (!SITE_ROOT) return
    const file = join(outDir, 'robots.txt')
    let content: string
    try {
      content = await readFile(file, 'utf8')
    } catch {
      return
    }
    const sitemapLine = `Sitemap: ${SITE_ROOT}sitemap.xml`
    const lines = content.split(/\r?\n/).filter((l) => !/^Sitemap:/i.test(l.trim()))
    while (lines.length && lines[lines.length - 1] === '') lines.pop()
    if (lines.join('\n') !== sitemapLine && !lines.includes(sitemapLine)) {
      lines.push('', sitemapLine)
    }
    await writeFile(file, lines.join('\n').replace(/\n*$/, '\n'), 'utf8')
  },
  themeConfig: {
    // 不要自己拼 base：主题会对 logo.src 再做一次 withBase
    logo: { src: '/logo.svg', alt: SITE_NAME, width: 24, height: 24 },
    siteTitle: SITE_NAME,
    nav: [
      { text: '课程', items: COURSE_NAV },
      {
        text: '专题',
        items: [
          { text: '专题总览', link: '/topics/' },
          { text: '可调实验电源', link: '/topics/power-supply' },
          { text: '直流电机驱动', link: '/topics/motor-drive' },
          { text: '双轴舵机云台', link: '/topics/servo-gimbal' },
          { text: '电力电子入门', link: '/topics/power-electronics/' }
        ]
      },
      {
        text: '实验',
        items: [
          { text: '实验总览', link: '/lab/' },
          { text: '万用表', link: '/lab/multimeter' },
          { text: '示波器', link: '/lab/oscilloscope' },
          { text: '焊接与搭电路', link: '/lab/soldering' },
          { text: '实验台与安全', link: '/lab/bench' }
        ]
      },
      {
        text: '工具',
        items: [
          { text: '公式速查表', link: '/shared/cheatsheet' },
          { text: '知识依赖图谱', link: '/ee/graph' },
          { text: 'B 站网课推荐', link: '/guide/courses' },
          { text: '术语索引', link: '/guide/glossary' },
          { text: '内容状态', link: '/guide/status' },
          { text: '全部页面', link: '/guide/pages' }
        ]
      },
      { text: '学习地图', link: '/map' },
      { text: '关于', link: '/guide/about' }
    ],

    sidebar: {
      '/ee/': courseSidebar('ee'),
      '/digital/': courseSidebar('digital'),
      '/analog/': courseSidebar('analog'),
      '/embedded/': courseSidebar('embedded'),
      '/lab/': LAB_SIDEBAR,
      '/topics/': TOPICS_SIDEBAR,
      '/map': GUIDE_SIDEBAR,
      '/shared/': GUIDE_SIDEBAR,
      '/guide/': GUIDE_SIDEBAR
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true,
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '展开详情',
                resetButtonTitle: '清除查询',
                backButtonTitle: '返回',
                noResultsText: '没有找到相关内容',
                footer: {
                  selectText: '打开',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上一个',
                  navigateDownKeyAriaLabel: '下一个',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc'
                }
              }
            }
          }
        },
        miniSearch: {
          options: { tokenize: zhTokenize as any },
          searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 1, titles: 2 } }
        }
      } as any
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '本页更新于',
      formatOptions: { year: 'numeric', month: 'long', day: 'numeric' }
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '课程目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    langMenuLabel: '语言',
    externalLinkIcon: true,

    notFound: {
      title: '这一页不存在',
      quote: '可能是链接写错了，或者内容已经搬家。用搜索找一下，或者回到课程目录重新进入。',
      linkLabel: '返回首页',
      linkText: '回到首页'
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/MIOREverie' }],

    footer: {
      message: '内容基于秦曾煌《电工学》等教材整理，仅供个人学习使用',
      copyright: '交互演示由浏览器本地计算 · 无后端、无追踪'
    }
  }
})
