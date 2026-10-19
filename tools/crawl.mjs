// 爬站检查：从首页 BFS，验证每个站内链接返回 200，并找出没有任何入口的孤儿页
// 用法: node crawl.mjs <baseUrl> <distDir>
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const baseUrl = (process.argv[2] || 'http://localhost:4174').replace(/\/$/, '')
const dist = process.argv[3]

function htmlFiles(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) htmlFiles(p, out)
    else if (n.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = new Set(
  htmlFiles(dist).map((f) => {
    let r = '/' + relative(dist, f).split('\\').join('/').replace(/\.html$/, '')
    r = r.replace(/\/index$/, '/')
    return r === '/index' ? '/' : r
  })
)

const visited = new Set()
const errors = []
const queue = ['/']

while (queue.length) {
  const path = queue.shift()
  if (visited.has(path)) continue
  visited.add(path)
  let res
  try {
    res = await fetch(baseUrl + path, { redirect: 'manual' })
  } catch (e) {
    errors.push(`${path} 请求失败 ${e.message}`)
    continue
  }
  if (res.status !== 200) {
    errors.push(`${path} -> HTTP ${res.status}`)
    continue
  }
  const type = res.headers.get('content-type') || ''
  if (!type.includes('text/html')) continue
  const html = await res.text()
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1]
    if (/^(https?:|mailto:|javascript:)/.test(href)) continue
    if (/\.(css|js|svg|png|jpe?g|webp|woff2?|json|xml|txt|ico)$/.test(href)) continue
    // 相对链接（VitePress 会输出 ./../ee/depth 这种）先按当前页面解析成绝对路径
    let clean
    try {
      clean = new URL(href, baseUrl + path).pathname
    } catch {
      continue
    }
    if (!clean || visited.has(clean)) continue
    queue.push(clean)
  }
}

const missing = [...pages].filter((p) => !visited.has(p))
console.log(`pages=${pages.size} visited=${visited.size} errors=${errors.length} orphans=${missing.length}`)
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'))
if (missing.length) console.log('ORPHANS:\n' + missing.join('\n'))
process.exitCode = errors.length || missing.length ? 1 : 0
