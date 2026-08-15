// Unit test for the skin plugin: asset route + index tap behavior.
// Run: node --input-type=module -e "..."  (or import this file)
import { apply } from './index.js'

const disposers = []
const fakeWebServer = {
  register(route) {
    console.log('register called:', route.kind, route.path)
    disposers.push(route)
    return () => { console.log('route disposed') }
  },
  tapIndex(fn) {
    console.log('tapIndex called')
    disposers.push(fn)
    return () => { console.log('tap disposed') }
  },
}
const ctx = {
  effect(fn, label) {
    console.log('effect registered:', label)
    const disposer = fn()
    return disposer
  },
  webServer: fakeWebServer,
}

apply(ctx)
console.log('--- apply OK ---')

// Exercise the registered route handler with a fake request
const route = disposers.find(d => d && d.kind === 'prefix')
if (!route) throw new Error('no route registered')

// Valid asset request
const req = { url: '/skin-assets/rizen-crosshair-cursor-64.webp' }
const res = {
  writeHead(code, headers) { console.log('asset response:', code, headers['Content-Type']); this.code = code },
  end(body) { console.log('asset body bytes:', body?.length ?? 0) },
}
route.handler(req, res)

// Path traversal attempt must be rejected
const res2 = {
  writeHead(code) { console.log('traversal response:', code); this.code = code; return this },
  end() {},
}
route.handler({ url: '/skin-assets/../../etc/passwd' }, res2)

// Unknown extension must be rejected
const res3 = {
  writeHead(code) { console.log('unknown-ext response:', code); this.code = code; return this },
  end() {},
}
route.handler({ url: '/skin-assets/evil.exe' }, res3)

// Index tap: skin style must appear before </head>
const tap = disposers.find(d => typeof d === 'function')
const html = '<!doctype html><html><head><title>x</title></head><body></body></html>'
const out = tap(html)
console.log('tap injects style:', out.includes('data-plugin="skin-digital-arcade"'))
console.log('tap before </head>:', out.indexOf('data-plugin="skin-digital-arcade"') < out.indexOf('</head>'))
console.log('tap has skin-assets url:', out.includes('/skin-assets/'))
console.log('--- all assertions ran ---')
