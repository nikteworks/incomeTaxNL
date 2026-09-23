// Local production-artifact harness. Executes actual middleware; CDN and Vercel
// redirect-rule semantics still require the deployed HTTP release checks.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import middleware from '../../middleware.js'
const root = resolve('dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' }
createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4173')
  const result = middleware(new Request(url))
  if (result.status === 308) {
    response.writeHead(308, { location: result.headers.get('location') }).end()
    return
  }
  const target = new URL(result.headers.get('x-middleware-rewrite') || url)
  const file = resolve(root, `.${target.pathname}`)
  try {
    if (!file.startsWith(root + '/')) throw new Error('Invalid path')
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end('<h1>404 — Page not found</h1>')
  }
}).listen(4173, '127.0.0.1')
