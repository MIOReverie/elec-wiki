/**
 * 内容 lint：在构建前抓出那些「构建会报错、但报错信息很难懂」的问题。
 *
 * 收录的检查项都是实际踩过的坑：
 *  1. 组件属性里的引号没配对（中文引号 / 英文引号写进了 note="..." 里）
 *  2. Vue 组件插槽里塞 markdown —— 插槽不解析 markdown，公式会显示成源码
 *  3. <DemoBox> / <FigBox> 没有闭合
 *  4. 行内公式 $ 不配对（会让本行之后所有公式渲染失败）
 *  5. 块级公式 $$ 不成对
 *  6. 同一张表格里列数不一致（Markdown 会把多出来的单元格吞掉）
 *  7. 同级标题重名（右侧目录会出现两个一样的条目）
 *  8. 空链接 []()、占位文字 TODO / 待补
 *  9. 用了不存在的组件（大小写写错时 Vue 会静默渲染成空标签）
 *
 * 用法：node tools/lint.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

// 注意：必须用 fileURLToPath 转换，import.meta.url 里的中文路径是 URL 编码的，
// 直接 decodeURIComponent 会在 Windows 上留下正斜杠，导致路径不存在。
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DOCS = join(ROOT, 'docs')
const THEME = join(DOCS, '.vitepress', 'theme')

/** 递归收集所有 markdown */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.vitepress' || name === 'dist') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (extname(p) === '.md') out.push(p)
  }
  return out
}

/** 收集主题里注册过的组件名（文件名即组件名） */
function collectComponents(dir, out = new Set()) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) collectComponents(p, out)
    else if (name.endsWith('.vue')) out.add(basename(name, '.vue'))
  }
  return out
}

const KNOWN_COMPONENTS = collectComponents(THEME)
const HTML_TAGS = new Set([
  'a', 'abbr', 'b', 'br', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img',
  'input', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 's', 'small', 'span',
  'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul', 'video', 'source', 'br', 'wbr', 'svg', 'path',
  'circle', 'rect', 'line', 'text', 'tspan', 'g', 'defs', 'use', 'iframe'
])

const problems = []
const files = walk(DOCS)

for (const file of files) {
  const rel = file.replace(ROOT, '')
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)

  // ---- 1. 组件标签与自定义容器里的引号 ----
  // 背景：Vue 编译器会把 markdown 里的组件标签当 HTML 解析。属性值内部如果
  // 出现英文双引号（哪怕数量是偶数），属性会被提前闭合，剩下的内容被当成
  // 新属性名 → "Attribute name cannot contain U+0022" 构建错误。
  // 结论：这类位置一律禁止英文双引号，强调请用「」或『』。
  lines.forEach((ln, i) => {
    const trimmed = ln.trim()

    // --- 自定义容器 ::: tip 标题 ---
    if (/^:::\s*\S/.test(trimmed)) {
      if (trimmed.includes('"')) {
        problems.push({
          file: rel,
          line: i + 1,
          kind: '::: 容器标题里不能出现英文双引号',
          hint: 'VitePress 会把标题塞进 Vue 组件属性，" 会提前闭合。用「」或『』代替',
          text: trimmed.slice(0, 90)
        })
      }
      return
    }

    // --- 组件标签 ---
    const m = trimmed.match(/^<([A-Z][A-Za-z0-9]*)((?:\s[^>]*?)?)\/?>$/)
    if (!m) return

    const [, name, attrPart] = m

    if (!KNOWN_COMPONENTS.has(name)) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: `组件 <${name}> 不存在`,
        hint: '检查拼写；可用组件见 docs/guide/contributing.md',
        text: trimmed.slice(0, 90)
      })
    }

    // 把属性串逐个切开：name="value" | name='value' | name | :prop="v" | v-model="v"
    // 合法形态：每个属性要么无值，要么值被引号完整包裹。
    const attrRe = /(:?[\w-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g
    let hit = null
    let mm
    while ((mm = attrRe.exec(attrPart)) !== null) {
      const val = mm[2] ?? mm[3] ?? ''
      if (val.includes('"') || val.includes("'")) hit = hit ?? mm[1]
    }
    // 若 attrPart 里有未被合法属性消耗掉的引号字符，就是提前闭合
    const leftover = attrPart.replace(attrRe, '')
    if (hit || /["']/.test(leftover)) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: `<${name}> 属性里的英文双引号提前闭合了属性`,
        hint: '强调请用「」或『』。例：note="…当作『过渡过程结束』…"',
        text: trimmed.slice(0, 90)
      })
    }
  })

  // ---- 2. 组件内不应出现 markdown 语法（插槽不解析） ----
  lines.forEach((ln, i) => {
    if (!/^\s*<(DemoBox|FigBox)\b/.test(ln)) return
    if (/^\s*<\/(DemoBox|FigBox)>/.test(ln)) return
    // 组件行的下一行若以 ** 开头且不是插槽闭合，多半是误用
    const next = lines[i + 1] || ''
    if (/^\s*\*\*.+\*\*/.test(next) && !/^\s*</.test(next)) {
      problems.push({
        file: rel,
        line: i + 2,
        kind: '组件插槽里的 markdown 不会渲染',
        hint: '把说明文字挪到组件外，或改用 VitePress 自定义容器 ::: tip',
        text: next.trim().slice(0, 90)
      })
    }
  })

  // ---- 3. 组件开闭配对 ----
  // 只管有内容插槽的容器组件；Prereq / Meta / Ctrl / WavePreset 都是自闭合的
  const stack = []
  lines.forEach((ln, i) => {
    const open = ln.match(/^\s*<(DemoBox|FigBox|DemoSegment)\b/)
    if (open && !/>\s*$/.test(ln)) stack.push({ name: open[1], line: i + 1 })
    const close = ln.match(/^\s*<\/(\w+)>\s*$/)
    if (close) {
      const top = stack.pop()
      if (top && top.name !== close[1]) {
        problems.push({
          file: rel,
          line: i + 1,
          kind: `标签不匹配：<${top.name}> 未闭合就先写了 </${close[1]}>`,
          hint: '检查该行前后的组件标签',
          text: ln.trim().slice(0, 90)
        })
      }
    }
  })
  for (const s of stack) {
    problems.push({
      file: rel,
      line: s.line,
      kind: `<${s.name}> 缺少闭合标签 </${s.name}>`,
      hint: '容器组件必须显式闭合',
      text: ''
    })
  }

  // ---- 4. 行内公式 $ 与块级公式 $$ 成对（跳过代码块） ----
  let inFence = false
  let displayCount = 0
  lines.forEach((ln, i) => {
    if (/^\s*```/.test(ln)) {
      inFence = !inFence
      return
    }
    if (inFence) return
    if (/\\\$/.test(ln)) return // 已转义

    const dollars = ln.match(/\$\$/g)
    if (dollars) displayCount += dollars.length

    // 去掉 $$...$$ 再数剩下的单个 $
    const withoutDisplay = ln.replace(/\$\$[\s\S]*?\$\$/g, '')
    const singles = (withoutDisplay.match(/(?<!\\)\$/g) || []).length
    if (singles % 2 !== 0) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: '行内公式 $ 不成对',
        hint: '漏了一个 $，会导致本行之后所有公式渲染失败',
        text: ln.trim().slice(0, 90)
      })
    }
  })
  if (displayCount % 2 !== 0) {
    problems.push({
      file: rel,
      line: 1,
      kind: '块级公式 $$ 不成对',
      hint: '整页只有奇数个 $$，检查是否有漏写的收尾',
      text: ''
    })
  }

  // ---- 5. 表格列数一致 ----
  let tableStart = -1
  let tableCols = 0
  inFence = false
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    if (/^\s*```/.test(ln)) inFence = !inFence
    if (inFence) continue
    const isRow = /^\s*\|.*\|\s*$/.test(ln)
    // 统计单元格时先抹掉行内代码与转义竖线 \| ，否则公式里的 |Z| 会被当成列分隔
    const stripped = ln.replace(/`[^`]*`/g, 'X').replace(/\\\|/g, 'X')
    const cells = isRow ? stripped.trim().replace(/^\||\|$/g, '').split('|').length : 0
    if (!isRow) {
      tableStart = -1
      continue
    }
    if (tableStart === -1) {
      tableStart = i + 1
      tableCols = cells
    } else if (cells !== tableCols) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: `表格列数不一致：表头 ${tableCols} 列，本行 ${cells} 列`,
        hint: '多一列会整行错位，Markdown 不会报错',
        text: ln.trim().slice(0, 90)
      })
    }
  }

  // ---- 6. 同级标题重名 ----
  const seenH2 = new Map()
  lines.forEach((ln, i) => {
    const h = ln.match(/^##\s+(.+)$/)
    if (!h) return
    const t = h[1].trim()
    if (seenH2.has(t)) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: `二级标题重复：「${t}」`,
        hint: '右侧目录会出现两条一样的条目，把其中一条改成三级标题或改名',
        text: ''
      })
    } else {
      seenH2.set(t, i + 1)
    }
  })

  // ---- 7. 空链接与占位文字 ----
  lines.forEach((ln, i) => {
    if (/\[[^\]]*\]\(\s*\)/.test(ln)) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: '空链接：[]()',
        hint: '补上 URL，或改成普通文字',
        text: ln.trim().slice(0, 90)
      })
    }
    if (/\b(TODO|FIXME|XXX)\b|待补|待定/.test(ln)) {
      problems.push({
        file: rel,
        line: i + 1,
        kind: '正文里留有占位文字',
        hint: '发布前要么补完，要么删掉这句',
        text: ln.trim().slice(0, 90)
      })
    }
  })
}

// ---- 输出 ----
if (problems.length === 0) {
  console.log(`lint 通过：检查了 ${files.length} 个 markdown 文件、${KNOWN_COMPONENTS.size} 个组件，无问题。`)
} else {
  console.log(`lint 发现 ${problems.length} 个问题：\n`)
  const byFile = new Map()
  for (const p of problems) {
    if (!byFile.has(p.file)) byFile.set(p.file, [])
    byFile.get(p.file).push(p)
  }
  for (const [file, list] of byFile) {
    console.log(`  ${file}`)
    for (const p of list) {
      console.log(`    L${p.line}  [${p.kind}]`)
      console.log(`           ${p.hint}`)
      if (p.text) console.log(`           > ${p.text}`)
    }
    console.log('')
  }
  process.exitCode = 1
}
