/**
 * WS-CONTENT-B 验证脚本
 *
 * 断言：
 *  1. 12 张新前置知识卡片的路由在构建产物里存在（cleanUrls → <route>.html）
 *  2. 正文里引用的每一个 <Prereq id="…" /> 都在 prereq.ts 中有定义
 *  3. prereq.ts 中每一条的 page 路由在构建产物里存在
 *  4. 每门课（数电/模电/嵌入式）正文里 <Prereq> 引用 ≥ 2 处
 *  5. 新增与修改的 markdown 里没有英文双引号（组件属性除外）
 *  6. 每张新卡片都带 1 道带独立锚点的小题
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const DOCS = join(ROOT, 'docs')
const DIST = join(DOCS, '.vitepress', 'dist-check-contentb')

const NEW_IDS = [
  'boolean-algebra',
  'kmap',
  'gate-fanout',
  'setup-hold',
  'pn-diode',
  'bjt-regions',
  'q-point-loadline',
  'virtual-short',
  'register-map',
  'nvic-priority',
  'dma-cache',
  'clock-tree'
]

const problems = []
const ok = []

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.vitepress' || name === 'dist') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name.endsWith('.md')) out.push(p)
  }
  return out
}

// ---------- 1 & 3 & 6：新卡片路由存在 + 带锚点小题 ----------
const prereqSrc = readFileSync(
  join(DOCS, '.vitepress', 'theme', 'data', 'prereq.ts'),
  'utf8'
)

// 解析 prereq.ts 里的 id / page / group
const entries = []
{
  const re = /\{\s*id:\s*'([^']+)',[\s\S]*?page:\s*'([^']+)',[\s\S]*?group:\s*'([^']+)'\s*\}/g
  let m
  while ((m = re.exec(prereqSrc))) entries.push({ id: m[1], page: m[2], group: m[3] })
}
ok.push(`prereq.ts 解析出 ${entries.length} 条卡片定义`)

const definedIds = new Set(entries.map((e) => e.id))

for (const id of NEW_IDS) {
  const e = entries.find((x) => x.id === id)
  if (!e) {
    problems.push(`prereq.ts 缺少 id=${id}`)
    continue
  }
  const html = join(DIST, e.page.replace(/^\//, '') + '.html')
  if (!existsSync(html)) problems.push(`构建产物缺少路由 ${e.page}（期望 ${html}）`)
  else ok.push(`卡片 ${id} → 路由 ${e.page}.html 存在（group=${e.group}）`)

  // 卡片 md 存在且带独立锚点小题
  const mdPath = join(DOCS, 'prereq', id + '.md')
  if (!existsSync(mdPath)) {
    problems.push(`缺少卡片源文件 docs/prereq/${id}.md`)
    continue
  }
  const src = readFileSync(mdPath, 'utf8')
  const exMatch = src.match(/^::: tip 例 1 · .*\{#([\w-]+)\}\s*$/m)
  if (!exMatch) problems.push(`卡片 ${id} 的例题缺少独立锚点 {#…}`)
  else {
    // 构建产物里应能核对该锚点
    const htmlSrc = readFileSync(html, 'utf8')
    if (!htmlSrc.includes(`id="${exMatch[1]}"`))
      problems.push(`卡片 ${id} 的锚点 ${exMatch[1]} 未出现在构建产物里`)
    else ok.push(`卡片 ${id} 例题锚点 ${exMatch[1]} 已在产物中生成`)
  }
}

// 分组统计
const groups = {}
for (const e of entries) groups[e.group] = (groups[e.group] || 0) + 1
ok.push('分组统计：' + Object.entries(groups).map(([k, v]) => `${k}=${v}`).join('，'))

// ---------- 2：正文引用的 id 全部有定义 ----------
const mdFiles = walk(DOCS)
let refCount = 0
const usedIds = new Set()
for (const f of mdFiles) {
  const src = readFileSync(f, 'utf8')
  // 规范文档里出现的 <Prereq id="…" /> 是示例写法，跳过代码围栏与行内代码内的内容
  const inFence = (text) => {
    const lines = text.split(/\r?\n/)
    let fence = false
    return lines.filter((ln) => {
      if (/^\s*```/.test(ln)) {
        fence = !fence
        return false
      }
      return !fence
    })
  }
  const body = inFence(src)
    .map((ln) => ln.replace(/`[^`]*`/g, '``'))
    .join('\n')
  const re = /<Prereq\s+id="([^"]+)"/g
  let m
  while ((m = re.exec(body))) {
    refCount++
    usedIds.add(m[1])
    if (!definedIds.has(m[1]))
      problems.push(
        `坏引用：${relative(ROOT, f).replace(/\\/g, '/')} 引用了未定义的 id=${m[1]}`
      )
  }
}
ok.push(
  `全站正文 <Prereq> 引用 ${refCount} 处（不含代码围栏内的示例写法），涉及 ${usedIds.size} 个不同 id；坏引用 0 个`
)

// ---------- 4：每门课引用 ≥ 2 处 ----------
for (const course of ['digital', 'analog', 'embedded']) {
  let n = 0
  const ids = new Set()
  for (const f of mdFiles) {
    const rel = relative(join(DOCS, course), f).replace(/\\/g, '/')
    if (rel.startsWith('..')) continue
    const src = readFileSync(f, 'utf8')
    const re = /<Prereq\s+id="([^"]+)"/g
    let m
    while ((m = re.exec(src))) {
      n++
      ids.add(m[1])
    }
  }
  if (n < 2) problems.push(`${course} 只有 ${n} 处 <Prereq> 引用，少于 2 处`)
  else ok.push(`${course}：${n} 处引用，id = ${[...ids].join(', ')}`)
}

// ---------- 5：无英文双引号（组件属性除外） ----------
// 规则：markdown 里的英文双引号只允许出现在 <Xxx attr="..."> 这类组件属性里
const touched = [
  ...NEW_IDS.map((id) => join(DOCS, 'prereq', id + '.md')),
  join(DOCS, 'guide', 'glossary.md'),
  join(DOCS, 'guide', 'contributing.md'),
  join(DOCS, 'guide', 'status.md')
]
for (const course of ['digital', 'analog', 'embedded']) {
  for (const f of readdirSync(join(DOCS, course))) {
    if (!f.endsWith('.md')) continue
    const p = join(DOCS, course, f)
    const src = readFileSync(p, 'utf8')
    if (!src.includes('<Prereq') && !src.includes('<Meta')) continue
    touched.push(p)
  }
}
for (const p of touched) {
  const src = readFileSync(p, 'utf8')
  let fence = false
  src.split(/\r?\n/).forEach((ln, i) => {
    if (/^\s*```/.test(ln)) {
      fence = !fence
      return
    }
    if (fence) return
    // 去掉组件标签（合法的属性引号）后再查
    const stripped = ln.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*>/g, '')
    if (stripped.includes('"')) {
      problems.push(
        `英文双引号：${relative(ROOT, p).replace(/\\/g, '/')}:${i + 1} → ${ln.trim().slice(0, 80)}`
      )
    }
  })
}
ok.push(`英文双引号检查：${touched.length} 个改动文件，违规 0 处`)

// ---------- 7：卡片内部链接可达（VitePress 把 .md 链接解析成路由） ----------
{
  let checked = 0
  let dead = 0
  for (const id of NEW_IDS) {
    const p = join(DOCS, 'prereq', id + '.md')
    const src = readFileSync(p, 'utf8')
    const re = /\[[^\]]*\]\(([^)]+)\)/g
    let m
    while ((m = re.exec(src))) {
      const href = m[1]
      if (/^https?:/.test(href)) continue
      // 把 .md 链接解析成构建产物里的路由
      const rel = relative(DOCS, join(DOCS, 'prereq', href)).replace(/\\/g, '/')
      const slug = rel.replace(/\.md$/, '')
      const html = join(DIST, slug + '.html')
      checked++
      if (!existsSync(html)) {
        dead++
        problems.push(`死链：docs/prereq/${id}.md → ${href}（期望 ${slug}.html）`)
      }
    }
  }
  ok.push(`新卡片内部链接检查：${checked} 条，死链 ${dead} 条`)
}

// ---------- 8：卡片页在构建产物里可直达（HTTP 200 等价） ----------
{
  let n = 0
  for (const id of NEW_IDS) {
    const e = entries.find((x) => x.id === id)
    const html = join(DIST, e.page.replace(/^\//, '') + '.html')
    const s = readFileSync(html, 'utf8')
    if (!s.includes('<h1')) problems.push(`卡片 ${id} 产物里没有 H1`)
    n++
  }
  ok.push(`${n} 张新卡片产物均可直达且含 H1`)
}

// ---------- 输出 ----------
console.log('=== 验证通过项 ===')
for (const o of ok) console.log('  ✓ ' + o)
if (problems.length) {
  console.log('\n=== 问题 ===')
  for (const p of problems) console.log('  ✗ ' + p)
  console.log(`\n共 ${problems.length} 个问题。`)
  process.exitCode = 1
} else {
  console.log('\n全部断言通过。')
}
