import { defineConfig } from 'vitepress'
import markdownKatex from './theme/lib/markdown-katex'
import { COURSE_META, allChapters, courseSidebar, getCourses } from './data/catalog'

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

const SITE_NAME = '速通 Wiki'
const SITE_DESC =
  '电工学、数字电路、模拟电子与嵌入式开发的学习 Wiki：结论先行、可交互演示、每页标注难度与耗时。'

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

/** 路由 → 一句话摘要，用于生成 meta description / og:description */
const DESCRIPTIONS: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const c of allChapters()) if (c.description) map[c.route] = c.description
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
      { text: '关于与版权', link: '/guide/about' }
    ]
  },
  {
    text: '内容维护',
    items: [
      { text: '内容状态与成熟度', link: '/guide/status' },
      { text: '全部页面', link: '/guide/pages' },
      { text: '术语与前置知识索引', link: '/guide/glossary' },
      { text: '写作与贡献指南', link: '/guide/contributing' }
    ]
  },
  {
    text: '工具',
    items: [
      { text: '公式速查表', link: '/shared/cheatsheet' },
      { text: '知识依赖图谱', link: '/ee/graph' }
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
  transformHead({ pageData }) {
    const isIndex = /(^|\/)index\.md$/.test(pageData.relativePath)
    const slug = pageData.relativePath
      .replace(/\.md$/, '')
      .replace(/\/index$/, '')
      .replace(/^index$/, '')
    const route = slug ? `/${slug}${isIndex ? '/' : ''}` : '/'
    const desc = pageData.description || DESCRIPTIONS[route] || SITE_DESC
    const title = pageData.frontmatter.title || pageData.title || SITE_NAME
    const tags: any[] = [
      ['meta', { property: 'og:title', content: title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}` }],
      ['meta', { property: 'og:description', content: desc }]
    ]
    // SITE_ROOT 已经包含子路径（https://user.github.io/repo/）
    const canonical = route === '/' ? SITE_ROOT : `${SITE_ROOT}${route.slice(1)}`
    if (SITE_ROOT) {
      tags.push(['link', { rel: 'canonical', href: canonical }])
      tags.push(['meta', { property: 'og:url', content: canonical }])
    }
    return tags
  },
  themeConfig: {
    // 不要自己拼 base：主题会对 logo.src 再做一次 withBase
    logo: { src: '/logo.svg', alt: SITE_NAME, width: 24, height: 24 },
    siteTitle: SITE_NAME,
    nav: [
      { text: '课程', items: COURSE_NAV },
      {
        text: '工具',
        items: [
          { text: '公式速查表', link: '/shared/cheatsheet' },
          { text: '知识依赖图谱', link: '/ee/graph' },
          { text: '内容状态', link: '/guide/status' },
          { text: '全部页面', link: '/guide/pages' },
          { text: '术语索引', link: '/guide/glossary' }
        ]
      },
      { text: '怎么用', link: '/guide/start' },
      { text: '关于', link: '/guide/about' }
    ],

    sidebar: {
      '/ee/': courseSidebar('ee'),
      '/digital/': courseSidebar('digital'),
      '/analog/': courseSidebar('analog'),
      '/embedded/': courseSidebar('embedded'),
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/kongjianguan' }],

    footer: {
      message: '内容基于秦曾煌《电工学》等教材整理，仅供个人学习使用',
      copyright: '交互演示由浏览器本地计算 · 无后端、无追踪'
    }
  }
})
