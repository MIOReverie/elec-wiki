/**
 * 内容目录（单一数据源）
 *
 * 站点里所有「有哪些章节、谁属于哪门课、哪一节在哪个分组」都从这里来：
 *   - config.mts 用它生成导航与侧边栏
 *   - 首页 / 课程主页 / 内容状态页 用它渲染卡片与表格
 *
 * 因此新增一页时**不需要**再去改 config.mts：把 .md 放进课程目录、frontmatter 写上
 * 标题，构建时自动出现在侧边栏与课程路线图里。
 *
 * 约定：
 *   - 每门课 = docs/<slug>/ 一个目录，docs/<slug>/index.md 是课程主页
 *   - 章节序号取标题前缀「08 · xxx」里的数字；没有序号时按字母序排在最后
 *   - 分组由下面的 SECTION_LABELS 决定（按二级目录名映射），未登记的目录自动归入「其它」
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const ROOT = fileURLToPath(new URL('../..', import.meta.url)) // docs/
const DOCS = join(ROOT)

export interface Chapter {
  /** 页面在 docs 下的相对路径，不带扩展名，如 ee/04-ac/phasor */
  slug: string
  /** 站内路由，如 /ee/04-ac/phasor */
  route: string
  /** 序号（标题前缀的数字），指南类页面为 0 */
  num: number
  title: string
  /** 页头 <Meta> 里声明的预计耗时（分钟），未声明为 null */
  minutes: number | null
  /** 核心 / 了解 / 可跳过 / 指南 … */
  level: string
  /** 正文字数（去掉代码块与标签后的非空白字符数） */
  chars: number
  /** 例题数（::: tip 例 N） */
  examples: number
  demos: number
  figs: number
  headings: number
  /** 是否含「结论先行 / 易错点 / 工程实例」等模块 */
  has: { conclusion: boolean; mistakes: boolean; engineering: boolean; selfCheck: boolean }
  /** 用于 meta description 的一句摘要 */
  description: string
}

export interface Section {
  title: string
  chapters: Chapter[]
}

export interface Course {
  slug: string
  route: string
  /** 课程名，如「电工学」 */
  name: string
  /** 导航里的短名 */
  short: string
  /** 一句话定位 */
  tagline: string
  /** 课程主页 frontmatter 里的说明 */
  summary: string
  /** 是否有独立课程主页 */
  hasIndex: boolean
  minutes: number
  chapters: Chapter[]
  sections: Section[]
  /** 最近一次内容改动（ISO），来自 git；不可得时为 null */
  updated: string | null
}

/** 侧边栏分组：二级目录 → 分组标题 */
const SECTION_LABELS: Record<string, { title: string; dirs: string[]; collapsed?: boolean }[]> = {
  ee: [
    { title: '直流电路', dirs: ['01-basics', '02-methods'] },
    { title: '暂态分析', dirs: ['03-transient'] },
    { title: '交流与三相', dirs: ['04-ac', '05-three-phase'] },
    { title: '磁路与电机', dirs: ['06-machine'] },
    { title: '控制与安全', dirs: ['07-control'], collapsed: true },
    { title: '电子技术速览', dirs: ['08-electronics'], collapsed: true }
  ],
  digital: [{ title: '数字电路', dirs: ['.'] }],
  analog: [{ title: '模拟电子技术', dirs: ['.'] }],
  embedded: [{ title: '嵌入式开发', dirs: ['.'] }],
  shared: [{ title: '工具', dirs: ['.'] }]
}

/** 课程元信息：这些是「人写的」，其余全部由文件系统推导 */
export const COURSE_META: {
  slug: string
  name: string
  short: string
  tagline: string
}[] = [
  {
    slug: 'ee',
    name: '电工学',
    short: '电工学',
    tagline: '从电路定律到电机控制：强电视角的一条主线'
  },
  {
    slug: 'digital',
    name: '数字电路',
    short: '数字电路',
    tagline: '只用 0 和 1，从门电路搭到计数器与 ADC'
  },
  {
    slug: 'analog',
    name: '模拟电子技术',
    short: '模拟电子',
    tagline: '从二极管到电源：连续信号怎么被放大、运算和产生'
  },
  {
    slug: 'embedded',
    name: '嵌入式开发',
    short: '嵌入式',
    tagline: '以 STM32 为载体，把芯片真正跑起来'
  }
]

function parseFrontmatter(src: string): Record<string, string> {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

function stripTags(s: string) {
  return s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*`|]/g, '')
}

/** 取正文第一个有内容的段落，做 meta description */
function extractDescription(body: string): string {
  const lines = body.split(/\r?\n/)
  let started = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith(':::') || line.startsWith('<') || line.startsWith('|') || line.startsWith('```')) continue
    if (line.startsWith('>')) continue
    started = true
    const text = stripTags(line)
      .replace(/\$[^$]*\$/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length >= 12) return text.slice(0, 110)
  }
  return started ? '' : ''
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name.endsWith('.md')) out.push(p)
  }
  return out
}

/** 不是章节的工具页（在侧边栏里单独挂，不进课程路线图与统计） */
const TOOL_PAGES = new Set(['ee/graph', 'ee/depth', 'shared/cheatsheet'])

function chapterFrom(file: string): Chapter | null {
  const src = readFileSync(file, 'utf8')
  const fm = parseFrontmatter(src)
  const slug = relative(DOCS, file).replace(/\\/g, '/').replace(/\.md$/, '')
  if (slug.endsWith('/index')) return null
  if (slug.startsWith('ee/prereq/')) return null // 前置知识卡片只在抽屉里出现
  if (TOOL_PAGES.has(slug)) return null
  if (fm.chapter === 'false') return null
  if (fm.layout === 'home' || fm.layout === 'page') return null

  const body = src.replace(/^---[\s\S]*?---\r?\n/, '')
  const h1 = (body.match(/^#\s+(.+)$/m) || [])[1]
  const title = (fm.title || h1 || slug.split('/').pop() || slug).trim()
  const numMatch = title.match(/^(\d+)\s*[·.、]/)
  const meta = body.match(/<Meta\b([^>]*)>/)
  const metaAttrs = meta ? meta[1] : ''
  const timeAttr = (metaAttrs.match(/time="([^"]*)"/) || [])[1] || ''
  const minutes = /^\d+/.test(timeAttr) ? parseInt(timeAttr, 10) : null
  const level = (metaAttrs.match(/level="([^"]*)"/) || [])[1] || '—'
  const text = stripTags(body)
  const plain = text.replace(/\s+/g, '')

  return {
    slug,
    route: '/' + slug,
    num: numMatch ? parseInt(numMatch[1], 10) : 0,
    title,
    minutes,
    level,
    chars: plain.length,
    examples: (body.match(/^::: tip 例\s*\d/gm) || []).length,
    demos: (body.match(/<DemoBox\b/g) || []).length,
    figs: (body.match(/<FigBox\b|<CircuitFig\b/g) || []).length,
    headings: (body.match(/^##\s+/gm) || []).length,
    has: {
      conclusion: /^##\s*结论先行/m.test(body) || /结论先行/.test(body.slice(0, 900)),
      mistakes: /^##\s*易错/m.test(body),
      engineering: /^##\s*工程实例/m.test(body),
      selfCheck: /自检|自查/.test(body)
    },
    description: extractDescription(body)
  }
}

function sortChapters(a: Chapter, b: Chapter) {
  if (a.num !== b.num) return a.num - b.num
  return a.slug.localeCompare(b.slug)
}

function buildCourse(meta: (typeof COURSE_META)[number]): Course {
  const dir = join(DOCS, meta.slug)
  const files = walk(dir)
  const indexFile = files.find((f) => f.replace(/\\/g, '/').endsWith(`${meta.slug}/index.md`))
  const indexSrc = indexFile ? readFileSync(indexFile, 'utf8') : ''
  const indexFm = parseFrontmatter(indexSrc)
  const chapters = files
    .map(chapterFrom)
    .filter((c): c is Chapter => Boolean(c))
    .sort(sortChapters)

  const sectionPlan = SECTION_LABELS[meta.slug] || [{ title: meta.name, dirs: ['.'] }]
  const used = new Set<string>()
  const sections: Section[] = []
  for (const plan of sectionPlan) {
    const picked = chapters.filter((c) => {
      if (used.has(c.slug)) return false
      const sub = c.slug.split('/')[1]
      return plan.dirs.includes(sub) || (plan.dirs.includes('.') && c.slug.split('/').length === 2)
    })
    if (picked.length) {
      picked.forEach((c) => used.add(c.slug))
      sections.push({ title: plan.title, chapters: picked })
    }
  }
  const rest = chapters.filter((c) => !used.has(c.slug))
  if (rest.length) sections.push({ title: '其它', chapters: rest })

  return {
    slug: meta.slug,
    route: `/${meta.slug}/`,
    name: indexFm.title ? indexFm.title.replace(/\s*·\s*课程主页$/, '') : meta.name,
    short: meta.short,
    tagline: meta.tagline,
    summary: indexFm.description || '',
    hasIndex: Boolean(indexFile),
    minutes: chapters.reduce((sum, c) => sum + (c.minutes || 0), 0),
    chapters,
    sections,
    updated: null
  }
}

let cache: Course[] | null = null

export function getCourses(): Course[] {
  if (cache) return cache
  cache = COURSE_META.map(buildCourse)
  return cache
}

export function getCourse(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug)
}

export interface RecentItem {
  route: string
  title: string
  course: string
  date: string
}

/**
 * 最近更新的页面。
 * 优先读 git 历史（部署时 fetch-depth 0），拿不到就返回空数组——
 * 宁可少一个区块，也不显示假的更新时间。
 */
export function getRecent(limit = 8): RecentItem[] {
  try {
    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
    const out = execSync('git log --format=@@%cI --name-only -n 400 -- docs', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 8 * 1024 * 1024
    })
    // 只有一个提交（刚导入仓库）时，所有文件「同样新」，
    // 列出来只会造成误导：宁可整块不显示，等真的有第二次改动再出现。
    const commits = (out.match(/^@@/gm) || []).length
    if (commits <= 1) return []

    const seen = new Set<string>()
    const items: RecentItem[] = []
    let date = ''
    for (const raw of out.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('@@')) {
        date = line.slice(2)
        continue
      }
      if (!line.endsWith('.md')) continue
      const slug = line.replace(/^docs\//, '').replace(/\.md$/, '')
      if (seen.has(slug)) continue
      seen.add(slug)
      const course = getCourses().find((c) => slug === c.slug || slug.startsWith(c.slug + '/'))
      const chapter = course?.chapters.find((c) => c.slug === slug)
      const isIndex = slug.endsWith('/index') || !slug.includes('/')
      const route = isIndex ? `/${slug.replace(/\/index$/, '')}/` : `/${slug}`
      const title = chapter?.title || (isIndex ? (course?.name ?? '首页') + ' · 课程主页' : slug)
      items.push({ route, title, course: course?.name || '本站', date })
      if (items.length >= limit) break
    }
    return items
  } catch {
    return []
  }
}

/** 扁平化：所有章节 */
export function allChapters(): Chapter[] {
  return getCourses().flatMap((c) => c.chapters)
}

/** 每门课共用的「工具」分组 */
const TOOL_ITEMS = [
  { text: '内容状态与成熟度', link: '/guide/status' },
  { text: '公式速查表', link: '/shared/cheatsheet' },
  { text: '全部页面', link: '/guide/pages' }
]

/** 侧边栏：每门课一组，工具固定在顶部 */
export function courseSidebar(slug: string) {
  const course = getCourse(slug)
  if (!course) return []
  return [
    {
      text: '本站',
      items: [{ text: '课程主页 · 路线图', link: course.route }, ...TOOL_ITEMS]
    },
    ...course.sections.map((s, i) => ({
      text: s.title,
      collapsed: i >= 3,
      items: s.chapters.map((c) => ({ text: c.title, link: c.route }))
    }))
  ]
}
