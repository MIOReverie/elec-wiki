/**
 * 构建产物自检：给 CI / 本地兜底用。
 *
 * 用法：node tools/check-dist.mjs [distDir=docs/.vitepress/dist]
 *
 * 只查「构建静默成功、但产物其实不可用」的几类问题：
 *  1. index.html 不存在
 *  2. assets/ 目录不存在或里面没有 .js
 *  3. index.html 引用了 assets 下不存在的文件（干净的安装 + 缓存导致的老资源残留最爱出这个）
 *  4. 产物目录是空的（outDir 写错，构建写到了别处）
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const dir = resolve(process.argv[2] || 'docs/.vitepress/dist')
const problems = []

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function listHtml(dirPath) {
  const out = []
  for (const name of await readdir(dirPath, { withFileTypes: true })) {
    const p = join(dirPath, name.name)
    if (name.isDirectory()) out.push(...(await listHtml(p)))
    else if (name.name.endsWith('.html')) out.push(p)
  }
  return out
}

if (!(await exists(dir))) {
  console.error(`[FAIL] 产物目录不存在: ${dir}`)
  process.exit(1)
}

const entries = await readdir(dir)
if (entries.length === 0) problems.push(`产物目录为空: ${dir}`)

const indexHtml = join(dir, 'index.html')
if (!(await exists(indexHtml))) {
  problems.push('缺少 index.html')
} else {
  const html = await readFile(indexHtml, 'utf8')
  // 找出 /assets/... 引用，确认文件真的在产物里
  const refs = new Set()
  for (const m of html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)) {
    const rel = m[1].replace(/^https?:\/\/[^/]+/, '').split('?')[0]
    if (rel.startsWith('/assets/')) refs.add(rel.slice(1))
  }
  for (const rel of refs) {
    if (!(await exists(join(dir, rel)))) problems.push(`index.html 引用了不存在的资源: ${rel}`)
  }
}

const assetsDir = join(dir, 'assets')
if (!(await exists(assetsDir))) {
  problems.push('缺少 assets 目录')
} else {
  const js = (await readdir(assetsDir)).filter((f) => f.endsWith('.js'))
  if (js.length === 0) problems.push('assets 目录里没有 .js 产物')
}

const pages = (await exists(dir)) ? await listHtml(dir) : []
if (pages.length < 2) problems.push(`HTML 页面数异常（${pages.length}），构建可能没跑完`)

if (problems.length) {
  for (const p of problems) console.error(`[FAIL] ${p}`)
  process.exit(1)
}

console.log(`[OK] ${dir}: ${pages.length} 个 HTML 页面，assets/ 与 index.html 引用完整`)
