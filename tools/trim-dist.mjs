#!/usr/bin/env node
// 产物瘦身：删除构建目录 assets 里的死字体文件，并统计体积。
//
// 用法：
//   node tools/trim-dist.mjs                      # 默认 docs/.vitepress/dist
//   node tools/trim-dist.mjs docs/.vitepress/dist-check
//
// 规则（无依赖）：
//   1. 所有 .woff 与 .ttf —— CSS 的 KaTeX 字体声明只保留 woff2，这两类不会被请求；
//   2. KaTeX_Caligraphic* / KaTeX_Fraktur* / KaTeX_Script* / KaTeX_SansSerif* /
//      KaTeX_Typewriter* 的 .woff2 —— 全站正文没有使用这些排版命令；
//   3. inter-roman/italic-cyrillic* / greek* / vietnamese* 的 .woff2 —— 纯中文站用不到。
// 保留：KaTeX_Main / Math / AMS / Size1-4 的 woff2，inter-roman-latin(-ext) 与 inter-italic-latin(-ext)。
//
// 安全网：删除前先扫 CSS 里的 url(...woff2)，被引用的 .woff2 一律不删；删完再确认文件消失。

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const distDir = path.resolve(ROOT, process.argv[2] ?? 'docs/.vitepress/dist')
const assetsDir = path.join(distDir, 'assets')

const DROP_EXT = new Set(['.woff', '.ttf'])
const DROP_WOFF2 = [
  /^KaTeX_(Caligraphic|Fraktur|Script|SansSerif|Typewriter)/,
  /^inter-(roman|italic)-(cyrillic|greek|vietnamese)/,
]

const fmt = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function totalSize(files) {
  let sum = 0
  for (const f of files) sum += fs.statSync(f).size
  return sum
}

// CSS 中仍被引用的 woff2 文件名（按 basename 比较，兼容 base 前缀）
function referencedWoff2(dir) {
  const refs = new Set()
  for (const file of walk(dir)) {
    if (!file.endsWith('.css')) continue
    const css = fs.readFileSync(file, 'utf8')
    for (const m of css.matchAll(/url\(\s*["']?([^"')]*?\.woff2)["']?\s*\)/g)) {
      refs.add(path.posix.basename(m[1].split('?')[0]))
    }
  }
  return refs
}

if (!fs.existsSync(assetsDir)) {
  console.error(`[trim-dist] 找不到 ${path.relative(ROOT, assetsDir)}，先跑构建`)
  process.exit(1)
}

const before = walk(assetsDir)
const beforeSize = totalSize(before)
const beforeFonts = before.filter((f) => /\.(woff2?|ttf)$/i.test(f)).length
const referenced = referencedWoff2(assetsDir)

const targets = []
const kept = []
for (const file of before) {
  const base = path.basename(file)
  const ext = path.extname(base).toLowerCase()
  if (ext !== '.woff' && ext !== '.woff2' && ext !== '.ttf') continue

  let drop = false
  let why = ''
  if (DROP_EXT.has(ext)) {
    drop = true
    why = '旧格式（CSS 只用 woff2）'
  } else if (DROP_WOFF2.some((re) => re.test(base))) {
    drop = true
    why = '未被使用'
  }

  if (drop && referenced.has(base)) {
    kept.push({ base, why: '规则命中但 CSS 仍引用，保留' })
    continue
  }
  if (drop) targets.push({ file, base, why })
  else if (ext === '.woff2') kept.push({ base, why: '保留' })
}

let freed = 0
for (const { file } of targets) {
  freed += fs.statSync(file).size
  fs.rmSync(file, { force: true })
}

const missing = targets.filter(({ file }) => fs.existsSync(file))
if (missing.length) {
  console.error(`[trim-dist] 删除失败：${missing.map((m) => m.base).join(', ')}`)
  process.exit(1)
}

const after = walk(assetsDir)
const afterSize = totalSize(after)
const afterFonts = after.filter((f) => /\.(woff2?|ttf)$/i.test(f)).length

const warnRefs = [...referenced].filter((base) => !fs.existsSync(path.join(assetsDir, base)))

console.log(`[trim-dist] ${path.relative(ROOT, assetsDir)}`)
console.log(`  删除死字体 ${targets.length} 个，释放 ${fmt(freed)}（${(freed / 1024).toFixed(0)} KB）`)
console.log(`  assets 体积：${fmt(beforeSize)} → ${fmt(afterSize)}（省 ${((freed / beforeSize) * 100).toFixed(1)}%）`)
console.log(`  字体文件：${beforeFonts} → ${afterFonts}`)
if (targets.length) {
  const byRule = new Map()
  for (const t of targets) byRule.set(t.why, (byRule.get(t.why) ?? 0) + 1)
  for (const [why, n] of byRule) console.log(`    ${why}：${n}`)
}
const droppedNames = kept.filter((k) => k.why !== '保留')
for (const k of droppedNames) console.log(`  跳过 ${k.base}（${k.why}）`)

if (warnRefs.length) {
  console.error(`[trim-dist] CSS 引用的字体在磁盘上不存在：${warnRefs.join(', ')}`)
  process.exit(1)
}
console.log(`[trim-dist] CSS 引用的 ${referenced.size} 个 woff2 全部存在`)
