import { readdirSync, readFileSync } from 'node:fs'
const dir = 'docs/prereq'
let mn = 1e9, mx = 0
for (const f of readdirSync(dir).sort()) {
  let s = readFileSync(dir + '/' + f, 'utf8')
  s = s.replace(/^---[\s\S]*?---\r?\n/, '')
  s = s.replace(/```[\s\S]*?```/g, '')
  // 行内代码先摘掉：里面常有 (1<<5) 这种不成对的尖括号，会打乱后面的标签匹配
  s = s.replace(/`[^`\n]*`/g, '')
  s = s.replace(/<[^<>]*>/g, '')
  s = s.replace(/[#>*|\[\]()\-]/g, '')
  const cjk = (s.match(/[\u4e00-\u9fa5]/g) || []).length
  mn = Math.min(mn, cjk); mx = Math.max(mx, cjk)
  console.log(String(cjk).padStart(5), f)
}
console.log('范围', mn, '-', mx, mn >= 400 && mx <= 800 ? '✓ 在 400-800 区间' : '✗ 超出区间')
