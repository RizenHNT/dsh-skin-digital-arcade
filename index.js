/**
 * Rizen Signal Console — digital arcade HUD skin for the DeepSeek Harness
 * Web GUI.
 *
 * Host-side bundle plugin. On apply it:
 *   1. Registers a /skin-assets/* prefix route serving this package's
 *      assets (pixel fonts, webp sprites, cursor) with long cache headers.
 *   2. Taps the index render to inject the skin stylesheet (skin.css) into
 *      the served HTML, so the theme is present before the app boots.
 *
 * The stylesheet is a pure declaration layer over the official --dsw-* token
 * system and stable DOM attributes; it never touches layout-owned properties
 * of the composer, and the editor text stays on the official rendering path.
 * Disposing the plugin removes the route, the tap, and therefore the skin.
 */

import { readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-skin-digital-arcade'

export const inject = ['webServer']

const HERE = fileURLToPath(new URL('.', import.meta.url))
const SKIN_CSS = readFileSync(join(HERE, 'skin.css'), 'utf8')
const ASSET_DIR = join(HERE, 'assets')

/** Content type per asset extension (only the skin's own asset set is served). */
const CONTENT_TYPES = {
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.png': 'image/png',
}

/** Serve one package asset; 404 for anything outside the skin's asset set. */
function serveAsset(req, res) {
  const pathname = new URL(req.url ?? '/', 'http://skin.local').pathname
  const rel = pathname.slice('/skin-assets/'.length)
  // Reject path traversal and unknown extensions.
  if (rel.includes('..') || rel.includes('\\')) {
    res.writeHead(400).end('bad path')
    return
  }
  const ext = extname(rel).toLowerCase()
  if (CONTENT_TYPES[ext] === undefined) {
    res.writeHead(404).end('not found')
    return
  }
  const file = join(ASSET_DIR, rel)
  try {
    const body = readFileSync(file)
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[ext],
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': body.length,
    })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}

/** Inject the skin stylesheet into every served index.html. */
function injectSkin(html) {
  const style = `<style data-plugin="skin-digital-arcade">\n${SKIN_CSS}\n</style>`
  const head = html.indexOf('</head>')
  if (head === -1) return `${html}${style}`
  return `${html.slice(0, head)}${style}${html.slice(head)}`
}

/**
 * Mount the skin: asset route + index tap. Disposing the fiber removes both.
 * @param ctx - plugin context with the webServer service.
 */
export function apply(ctx) {
  ctx.effect(() => {
    const disposeRoute = ctx.webServer.register({
      kind: 'prefix',
      path: '/skin-assets/',
      handler: serveAsset,
    })
    const disposeTap = ctx.webServer.tapIndex(injectSkin)
    return () => {
      disposeRoute()
      disposeTap()
    }
  }, 'dsh-skin-digital-arcade: asset route + index tap')
}
