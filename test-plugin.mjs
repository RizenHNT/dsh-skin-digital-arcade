// Plugin self-check: exercises the skin plugin's asset route and index tap
// against a fake webServer, with real assertions (non-zero exit on failure).
// Run: node test-plugin.mjs
import { apply } from './index.js'
import { strict as assert } from 'node:assert'

const disposers = []
const fakeWebServer = {
  register(route) {
    disposers.push(route)
    return () => {}
  },
  tapIndex(fn) {
    disposers.push(fn)
    return () => {}
  },
}
const ctx = {
  effect(fn) { return fn() },
  webServer: fakeWebServer,
}

apply(ctx)

const route = disposers.find(d => d && d.kind === 'prefix')
assert.ok(route, 'plugin must register a prefix route')
assert.equal(route.path, '/skin-assets/', 'route path must be /skin-assets/')

/** Fake response collecting status + body. */
function fakeRes() {
  let status = 0
  let headers = null
  let body = null
  return {
    writeHead(code, h) { status = code; headers = h; return this },
    end(b) { body = b },
    get status() { return status },
    get headers() { return headers },
    get body() { return body },
  }
}

// 1. A real asset must be served 200 with the right content type.
{
  const res = fakeRes()
  route.handler({ url: '/skin-assets/rizen-crosshair-cursor-64.webp' }, res)
  assert.equal(res.status, 200, 'existing asset must be 200')
  assert.equal(res.headers['Content-Type'], 'image/webp')
  assert.ok(res.body.length > 0, 'asset body must be non-empty')
}

// 2. Fonts must be served with font/woff2.
{
  const res = fakeRes()
  route.handler({ url: '/skin-assets/fonts/ark-pixel-16px-monospaced-latin.otf.woff2' }, res)
  assert.equal(res.status, 200)
  assert.equal(res.headers['Content-Type'], 'font/woff2')
}

// 3. Path traversal must be rejected (URL normalization may yield 400 or 404,
//    but must never serve a file).
{
  const res = fakeRes()
  route.handler({ url: '/skin-assets/../../etc/passwd' }, res)
  assert.ok(res.status === 400 || res.status === 404, 'path traversal must be rejected (400 or 404)')
  assert.ok(res.body === null || res.body.length < 100, 'traversal must not return file content')
}

// 4. Unknown extensions must be rejected.
{
  const res = fakeRes()
  route.handler({ url: '/skin-assets/evil.exe' }, res)
  assert.equal(res.status, 404, 'unknown extension must 404')
}

// 5. Missing asset must 404.
{
  const res = fakeRes()
  route.handler({ url: '/skin-assets/does-not-exist.webp' }, res)
  assert.equal(res.status, 404, 'missing asset must 404')
}

// 6. Index tap must inject the skin style before </head>.
{
  const tap = disposers.find(d => typeof d === 'function')
  assert.ok(tap, 'plugin must tap index')
  const html = '<!doctype html><html><head><title>x</title></head><body></body></html>'
  const out = tap(html)
  assert.ok(out.includes('data-plugin="skin-digital-arcade"'), 'style tag must carry the plugin marker')
  assert.ok(out.indexOf('data-plugin="skin-digital-arcade"') < out.indexOf('</head>'), 'style must land before </head>')
  assert.ok(out.includes('/skin-assets/'), 'injected css must reference skin assets')
  assert.ok(out.includes('@font-face'), 'injected css must carry fonts')
}

console.log('ALL 6 ASSERTION GROUPS PASSED')
