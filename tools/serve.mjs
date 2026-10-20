// 极简静态服务器：行为对齐 GitHub Pages（cleanUrls + 404）
// 用法: node serve.mjs <distDir> <port> [base]
// 端口被占用时自动递增（最多尝试 20 次），日志里打印的是真实监听的端口。
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize, resolve, sep } from 'node:path'

const dir = resolve(process.argv[2] || '.')
const requestedPort = Number(process.argv[3] || 4174)
let port = requestedPort
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
  // Windows 路径穿越过滤：解析后必须仍在 dist 目录前缀内
  const target = resolve(dir, rel)
  if (target !== resolve(dir) && !target.startsWith(resolve(dir) + sep)) {
    res.writeHead(403)
    return res.end('forbidden')
  }
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

const MAX_TRIES = 20

/**
 * 递归监听：端口被占用就试下一个，成功后在日志里打印真实端口与 base。
 *
 * 两个坑都踩过：
 *  1. 原写法在 'error' 回调里 listen(port + 1)，但 port 变量从不更新，日志永远
 *     打印命令行里那个端口 —— 真实端口一律从 server.address() 读回。
 *  2. 同一个 server 被 listen 失败一次后，再次 listen 的 EADDRINUSE 是**同步抛出**
 *     的（不触发 'error' 事件），所以重试必须放在 try/catch 里递归，而不是挂在
 *     'error' 监听器上。
 */
function listenOn(port, triesLeft) {
  const settle = (attempt) => {
    // 先解绑上一轮的监听器，避免同一次失败被回调两次
    server.removeAllListeners('error')
    const onError = (err) => {
      server.removeListener('listening', onListening)
      if (err.code === 'EADDRINUSE' && attempt > 0) {
        return listenOn(port + 1, attempt - 1)
      }
      fail(err, port)
    }
    const onListening = () => {
      server.removeListener('error', onError)
      const addr = server.address()
      const realPort = typeof addr === 'object' && addr ? addr.port : port
      if (realPort !== requestedPort) {
        console.log(`[INFO] 端口 ${requestedPort} 被占用，已自动递增到 ${realPort}`)
      }
      console.log(`serving ${dir} at http://localhost:${realPort}${base} (base=${base})`)
    }
    server.once('error', onError)
    server.once('listening', onListening)
    try {
      server.listen(port)
    } catch (err) {
      // 同步抛出的 EADDRINUSE：手动走同一套重试
      onError(err)
    }
  }
  settle(triesLeft)
}

function fail(err, port) {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERROR] 端口 ${requestedPort}~${port} 全被占用，放弃`)
  } else {
    console.error(`[ERROR] 监听失败: ${err.message}`)
  }
  process.exit(1)
}

listenOn(port, MAX_TRIES)
