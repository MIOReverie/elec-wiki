// 极简静态服务器：行为对齐 GitHub Pages（cleanUrls + 404）
// 用法: node serve.mjs <distDir> <port> [base]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const dir = process.argv[2] || '.'
const port = Number(process.argv[3] || 4174)
const base = process.argv[4] || '/'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json'
}

async function fileAt(p) {
  try {
    const s = await stat(p)
    if (s.isFile()) return p
  } catch {}
  return null
}

const server = createServer(async (req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0])
  if (!url.startsWith(base)) {
    res.writeHead(404)
    return res.end('not under base')
  }
  let rel = url.slice(base.length)
  rel = normalize(rel).replace(/^(\.\.[/\\])+/, '')
  const target = join(dir, rel)
  const candidates = []
  if (rel === '' || rel.endsWith('/')) {
    candidates.push(join(target, 'index.html'))
  } else if (extname(rel)) {
    candidates.push(target)
  } else {
    candidates.push(target + '.html', join(target, 'index.html'), target)
  }
  let file = null
  for (const c of candidates) {
    file = await fileAt(c)
    if (file) break
  }
  if (!file) {
    const notFound = join(dir, '404.html')
    const html = await readFile(notFound).catch(() => '404')
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(html)
  }
  const body = await readFile(file)
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(body)
})

server.listen(port, () => console.log(`serving ${dir} at http://localhost:${port}${base}`))
