// 性能预算门禁：读取构建产物，断言关键 chunk 的 gzip 体积不超标。
// 用法：node tools/perf-budget.mjs <dist 目录>（默认 docs/.vitepress/dist）
// 任一预算超标以 exit 1 失败，供 CI 在 build 之后调用。
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const dist = process.argv[2] || 'docs/.vitepress/dist'
if (!existsSync(dist)) {
  console.error(`perf-budget: 产物目录不存在：${dist}（先构建再检查）`)
  process.exit(1)
}

// 递归列出 dist 下所有文件（相对路径，POSIX 分隔符）
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name)
    if (name.isDirectory()) walk(p, out)
    else out.push(p.slice(dist.length + 1).replace(/\\/g, '/'))
  }
  return out
}

const all = walk(dist)
const pick = (re) => all.filter((f) => re.test(f))
const gzipKB = (rel) => gzipSync(readFileSync(join(dist, rel))).length
const kb = (n) => `${(n / 1024).toFixed(1)} KB`

const theme = pick(/(^|\/)theme\.[\w-]+\.js$/)
const framework = pick(/(^|\/)framework\.[\w-]+\.js$/)
const app = pick(/(^|\/)app\.[\w-]+\.js$/)
const indexLean = pick(/(^|\/)index\.md\.[\w-]+\.lean\.js$/)
const style = pick(/(^|\/)style\.[\w-]+\.css$/)

const missing = [
  ['theme.*.js', theme],
  ['framework.*.js', framework],
  ['app.*.js', app],
  ['index.md.*.lean.js', indexLean],
  ['style.*.css', style]
].filter(([, v]) => !v.length)
if (missing.length) {
  console.error(
    'perf-budget: 产物不完整，缺少：' + missing.map(([k]) => k).join('、')
  )
  process.exit(1)
}

const results = []
let failed = false
const check = (label, files, budgetKB) => {
  const bytes = files.reduce((s, f) => s + gzipKB(f), 0)
  const ok = bytes / 1024 <= budgetKB
  if (!ok) failed = true
  results.push({ label, size: kb(bytes), budgetKB, ok })
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}: ${kb(bytes)}（预算 ${budgetKB} KB）  [${files.join(', ')}]`
  )
}

// theme chunk 预算 65KB：实测约 59.4KB（node 24）。gzip 输出随 zlib 版本有几十~几百字节差异，
// CI 用 node 20 时可能略超 60KB，故留出约 5KB 余量，避免「本地全绿、CI 偶发失败」。
check('theme chunk gzip', theme, 65)
check('首页关键路径 JS gzip（theme+framework+app+index.lean）', [
  ...theme,
  ...framework,
  ...app,
  ...indexLean
], 120)
check('style css gzip', style, 45)

console.log('')
if (failed) {
  console.error('perf-budget: 存在超标项，构建产物未通过性能预算')
  process.exit(1)
}
console.log('perf-budget: 全部通过')
