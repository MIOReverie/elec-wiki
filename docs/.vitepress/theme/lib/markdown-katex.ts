/**
 * 自研的 markdown-it KaTeX 插件
 *
 * 为什么不用 markdown-it-katex？
 *   它把自己的 KaTeX 0.6（2016 年）塞进 node_modules，用它生成 HTML；
 *   而页面加载的是顶层 KaTeX 0.16 的 CSS。两者结构不兼容，
 *   结果就是上下标 / 分式 / 根号全部错位。此插件强制用顶层 katex，
 *   保证 HTML 与 CSS 同源同版本。
 *
 * 语法：
 *   行内   $E = IR$
 *   块级   $$ ... $$   （可单行 $$x$$，可多行）
 */
import katex from 'katex'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface KatexOptions {
  macros?: Record<string, string>
  [key: string]: any
}

/* 分隔符合法性：$ 后面不能是空格（不能开），前面不能是空格、后面不能是数字（不能闭） */
function isValidDelim(state: any, pos: number) {
  const prev = pos > 0 ? state.src.charCodeAt(pos - 1) : -1
  const next = pos + 1 <= state.posMax ? state.src.charCodeAt(pos + 1) : -1
  let canOpen = true
  let canClose = true
  if (prev === 0x20 || prev === 0x09 || (next >= 0x30 && next <= 0x39)) canClose = false
  if (next === 0x20 || next === 0x09) canOpen = false
  return { canOpen, canClose }
}

function mathInline(state: any, silent: boolean): boolean {
  if (state.src[state.pos] !== '$') return false

  if (!isValidDelim(state, state.pos).canOpen) {
    if (!silent) state.pending += '$'
    state.pos += 1
    return true
  }

  const start = state.pos + 1
  let match = start
  while ((match = state.src.indexOf('$', match)) !== -1) {
    // 跳过被反斜杠转义的 \$（偶数个反斜杠才是真分隔符）
    let p = match - 1
    while (state.src[p] === '\\') p -= 1
    if ((match - p) % 2 === 1) break
    match += 1
  }

  if (match === -1) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }
  if (match - start === 0) {
    // 空内容 $$：交给块级规则
    if (!silent) state.pending += '$$'
    state.pos = start + 1
    return true
  }
  if (!isValidDelim(state, match).canClose) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.markup = '$'
    token.content = state.src.slice(start, match)
  }
  state.pos = match + 1
  return true
}

function mathBlock(state: any, start: number, end: number, silent: boolean): boolean {
  let pos = state.bMarks[start] + state.tShift[start]
  let max = state.eMarks[start]
  if (pos + 2 > max) return false
  if (state.src.slice(pos, pos + 2) !== '$$') return false
  if (silent) return true

  pos += 2
  let firstLine = state.src.slice(pos, max)
  let lastLine = ''
  let found = false
  let next = start

  if (firstLine.trim().slice(-2) === '$$') {
    // 单行块：$$x$$
    firstLine = firstLine.trim().slice(0, -2)
    found = true
  }

  while (!found) {
    next++
    if (next >= end) break
    pos = state.bMarks[next] + state.tShift[next]
    max = state.eMarks[next]
    if (pos < max && state.tShift[next] < state.blkIndent) break
    if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
      lastLine = state.src.slice(0, max).lastIndexOf('$$') > -1
        ? state.src.slice(pos, state.src.slice(0, max).lastIndexOf('$$'))
        : ''
      found = true
    }
  }

  state.line = next + 1
  const token = state.push('math_block', 'math', 0)
  token.block = true
  token.content =
    (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine && lastLine.trim() ? lastLine : '')
  token.map = [start, state.line]
  token.markup = '$$'
  return true
}

export default function markdownKatex(md: any, options: KatexOptions = {}) {
  const render = (src: string, displayMode: boolean) => {
    try {
      return katex.renderToString(src, {
        displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        ...options
      })
    } catch (e: any) {
      return `<span class="katex-error" title="${escapeHtml(String(e?.message || e))}">${escapeHtml(src)}</span>`
    }
  }

  md.inline.ruler.after('escape', 'math_inline', mathInline)
  md.block.ruler.after('blockquote', 'math_block', mathBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })

  md.renderer.rules.math_inline = (tokens: any[], idx: number) => render(tokens[idx].content, false)
  md.renderer.rules.math_block = (tokens: any[], idx: number) => render(tokens[idx].content, true) + '\n'
}