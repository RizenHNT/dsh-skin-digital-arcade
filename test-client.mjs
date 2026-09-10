/**
 * Client-half self-check: loads the SHIPPED bundle (lib/client.js) through the
 * same `window.__ModuleLoader__` carrier the Harness web loader uses, mounts the
 * plugin against a jsdom page, and drives real DOM events.
 *
 * It asserts user-visible behaviour of the window runtime — click-to-front
 * layering, edge resizing, cascade placement, composer reserve, window moves —
 * plus the page-global install guard that keeps this plugin and the Harness
 * personal-theme patch from doubling every listener.
 *
 * Run: node test-client.mjs   (after `npm run build`)
 */
import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import { JSDOM } from 'jsdom'

const bundle = readFileSync(new URL('./lib/client.js', import.meta.url), 'utf8')

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
const { window } = dom
const document = window.document

// The loader hands each client plugin a CommonJS factory; capture the module
// the bundle registers instead of evaluating it as a bare script.
let registered = null
let registeredId = null
window.__ModuleLoader__ = {
  load({ id, factory }) {
    registeredId = id
    registered = factory(() => { throw new Error('the window runtime must not require anything') })
  },
}
window.eval(bundle)

assert.ok(registered !== null, 'bundle must register through window.__ModuleLoader__.load')
assert.equal(registeredId, 'dsh-skin-digital-arcade', 'bundle must register under the skin package id')
assert.equal(typeof registered.apply, 'function', 'client half must export apply')
assert.ok(registered.inject.length === 0, 'the runtime must declare no service dependencies')

/** Mount the plugin and collect the disposer of every effect it opens. */
function mount() {
  const disposers = []
  const ctx = { effect: (executor) => { disposers.push(executor()) } }
  registered.apply(ctx)
  return () => { for (const dispose of disposers.splice(0)) dispose() }
}

/** jsdom has no PointerEvent; the listeners read a few flat fields only. */
function pointerEvent(type, init) {
  const event = new window.Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, {
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
    pointerId: init.pointerId ?? 1,
    button: init.button ?? 0,
  })
  return event
}

/** A floating window at a fixed rect, with the markers the theme styles. */
function mountPanel(rect, { pinned = true } = {}) {
  const host = document.createElement('div')
  if (pinned) {
    host.setAttribute('data-dsh-panel-pinned', 'true')
    host.setAttribute('data-dsh-panel-side', 'left')
  }
  const panel = document.createElement('div')
  panel.setAttribute('data-dsh-code-panel', '')
  panel.setAttribute('data-dsh-detail-panel', 'code')
  document.body.appendChild(host)
  host.appendChild(panel)
  panel.getBoundingClientRect = () => ({
    left: rect.left, top: rect.top, width: rect.width, height: rect.height,
    right: rect.left + rect.width, bottom: rect.top + rect.height,
    x: rect.left, y: rect.top, toJSON: () => ({}),
  })
  return { host, panel }
}

const settle = () => new Promise(resolve => { window.setTimeout(resolve, 5) })

// ---------------------------------------------------------------- lifecycle --
assert.equal(window.__dshArcadeWindowRuntime, undefined, 'no marker before mounting')

const unmount = mount()
assert.equal(window.__dshArcadeWindowRuntime, true, 'mounting must claim the page-global install marker')

// A second mount (the Harness patch, or a reload) must stand down: one click
// must still produce exactly one hit marker, not two.
{
  const second = mount()
  document.body.dispatchEvent(pointerEvent('pointerdown', { clientX: 40, clientY: 40 }))
  assert.equal(document.querySelectorAll('.dsh-click-hit').length, 1, 'a doubled install would emit two hit markers')
  assert.equal(window.__dshArcadeWindowRuntime, true, 'the second mount must not clear the marker')
  second()
  assert.equal(window.__dshArcadeWindowRuntime, true, 'unmounting the stand-down mount must leave the owner installed')
}

// ------------------------------------------------------------ click-to-front --
{
  const first = mountPanel({ left: 200, top: 100, width: 236, height: 300 })
  const second = mountPanel({ left: 260, top: 160, width: 236, height: 300 })
  first.panel.dispatchEvent(pointerEvent('pointerdown', { clientX: 220, clientY: 120, pointerId: 31 }))
  const firstZ = parseFloat(first.panel.style.getPropertyValue('--dsh-panel-z'))
  assert.ok(firstZ > 40, 'pressing a window must raise it above the resting layer')
  assert.equal(first.panel.getAttribute('data-dsh-panel-active'), 'true')

  second.panel.dispatchEvent(pointerEvent('pointerdown', { clientX: 280, clientY: 180, pointerId: 32 }))
  assert.ok(
    parseFloat(second.panel.style.getPropertyValue('--dsh-panel-z')) > firstZ,
    'the newly pressed window must land above the previous one',
  )
  assert.equal(first.panel.getAttribute('data-dsh-panel-active'), null, 'the previous window loses the active marker')
}

// ------------------------------------------------------------------ cascade --
{
  document.body.innerHTML = ''
  const root = document.createElement('div')
  root.setAttribute('data-dsh-detail-overlay-root', 'true')
  document.body.appendChild(root)
  const a = document.createElement('div')
  a.setAttribute('data-dsh-detail-panel', 'think')
  const b = document.createElement('div')
  b.setAttribute('data-dsh-detail-panel', 'tool')
  root.append(a, b)
  window.dispatchEvent(new window.Event('resize'))
  await settle()
  assert.equal(a.style.getPropertyValue('--dsh-panel-cascade'), '0px', 'the first window takes no cascade offset')
  assert.equal(b.style.getPropertyValue('--dsh-panel-cascade'), '28px', 'each further window steps the cascade')
}

// ------------------------------------------------------- resize and no reflow --
{
  document.body.innerHTML = ''
  const { panel } = mountPanel({ left: 100, top: 100, width: 236, height: 300 })
  const rect = panel.getBoundingClientRect()
  panel.dispatchEvent(pointerEvent('pointerdown', { clientX: rect.right - 3, clientY: rect.top + 150, pointerId: 7 }))
  assert.equal(panel.getAttribute('data-dsh-resizing'), 'true', 'an east-edge press starts a resize')
  document.dispatchEvent(pointerEvent('pointermove', { clientX: rect.right + 140, clientY: rect.top + 150, pointerId: 7 }))
  assert.ok(parseFloat(panel.style.getPropertyValue('--dsh-panel-width')) > 236, 'the window grows with the pointer')
  document.dispatchEvent(pointerEvent('pointermove', { clientX: -900, clientY: rect.top + 150, pointerId: 7 }))
  assert.equal(parseFloat(panel.style.getPropertyValue('--dsh-panel-width')), 196, 'the minimum width clamps the drag')
  document.dispatchEvent(pointerEvent('pointerup', { pointerId: 7 }))
  assert.equal(panel.getAttribute('data-dsh-resizing'), null, 'releasing the pointer ends the resize')
}

// ------------------------------------------------------- composer reserve ----
{
  document.body.innerHTML = ''
  const phase = document.createElement('div')
  phase.setAttribute('data-phase', 'active')
  document.body.appendChild(phase)
  const composer = document.createElement('div')
  composer.className = 'xComposerSeatx'
  phase.appendChild(composer)
  composer.getBoundingClientRect = () => ({
    left: 0, top: 600, width: 800, height: 120, right: 800, bottom: 720, x: 0, y: 600, toJSON: () => ({}),
  })
  window.dispatchEvent(new window.Event('resize'))
  await settle()
  const reserve = document.documentElement.style.getPropertyValue('--dsh-composer-reserve')
  assert.match(reserve, /^\d+px$/, 'the composer reserve must be published for the maximized window')
  assert.ok(parseInt(reserve, 10) > 0, 'a composer near the bottom must reserve real space')
}

// ------------------------------------------------------------- window move ---
{
  document.body.innerHTML = ''
  const { panel } = mountPanel({ left: 300, top: 200, width: 236, height: 200 }, { pinned: false })
  const root = document.createElement('div')
  root.setAttribute('data-dsh-detail-overlay-root', 'true')
  document.body.appendChild(root)
  root.appendChild(panel)
  panel.getBoundingClientRect = () => {
    const left = parseFloat(panel.style.left || '300')
    const top = parseFloat(panel.style.top || '200')
    return { left, top, width: 236, height: 200, right: left + 236, bottom: top + 200, x: left, y: top, toJSON: () => ({}) }
  }

  const moves = []
  panel.addEventListener('dsh-panel-moved', event => moves.push(event.detail))
  // Drag the panel body well clear of its own edge zone.
  panel.dispatchEvent(pointerEvent('pointerdown', { clientX: 400, clientY: 300, pointerId: 41 }))
  document.dispatchEvent(pointerEvent('pointermove', { clientX: 520, clientY: 380, pointerId: 41 }))
  assert.equal(panel.style.position, 'fixed', 'a body drag floats the window at the pointer')
  document.dispatchEvent(pointerEvent('pointerup', { pointerId: 41 }))
  assert.equal(moves.length, 1, 'a pinned window must report its settled position')
  assert.ok(moves[0].left >= 0 && moves[0].top >= 0, 'the reported position stays on the page')
}

// ------------------------------------------------- detachable code block ----
{
  document.body.innerHTML = ''
  // A fenced reply block: the banner structure CodeBlock renders.
  const block = document.createElement('div')
  block.className = 'md-code-block'
  const wrap = document.createElement('div')
  wrap.className = 'x_bannerWrap_x'
  const banner = document.createElement('div')
  banner.className = 'x_banner_x'
  const copy = document.createElement('button')
  copy.type = 'button'
  banner.appendChild(copy)
  wrap.appendChild(banner)
  block.appendChild(wrap)
  document.body.appendChild(block)

  // The copy control keeps its own gesture.
  copy.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20 }))
  document.dispatchEvent(pointerEvent('pointerup', {}))
  assert.equal(block.hasAttribute('data-dsh-code-floating'), false, 'the copy control must not detach the block')

  // The banner toggles the window on release, without a drag.
  banner.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20 }))
  document.dispatchEvent(pointerEvent('pointerup', {}))
  assert.equal(block.hasAttribute('data-dsh-code-floating'), true, 'a banner click must detach the block')

  // A second click puts it back, without carrying a stale cascade offset.
  block.style.setProperty('--dsh-panel-cascade', '28px')
  banner.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20 }))
  document.dispatchEvent(pointerEvent('pointerup', {}))
  assert.equal(block.hasAttribute('data-dsh-code-floating'), false, 'a second banner click must restore the block')
  assert.equal(block.style.getPropertyValue('--dsh-panel-cascade'), '', 'restoring must clear the window cascade offset')
}

// ------------------------------------------------- anchored west/north drag --
{
  document.body.innerHTML = ''
  const { panel } = mountPanel({ left: 300, top: 200, width: 236, height: 300 })
  const rect = panel.getBoundingClientRect()
  const rightBefore = rect.right

  // Pulling the west edge left grows the window leftward: the right edge is the
  // anchor and must stay exactly where it was.
  const start = rect.left + 3
  const move = rect.left - 80
  panel.dispatchEvent(pointerEvent('pointerdown', { clientX: start, clientY: rect.top + 150, pointerId: 81 }))
  document.dispatchEvent(pointerEvent('pointermove', { clientX: move, clientY: rect.top + 150, pointerId: 81 }))
  const width = parseFloat(panel.style.getPropertyValue('--dsh-panel-width'))
  const left = parseFloat(panel.style.getPropertyValue('--dsh-panel-left'))
  assert.equal(width, rect.width + (start - move), 'a west drag must grow the width')
  assert.equal(left, rect.left - (start - move), 'a west drag must move the left edge')
  assert.equal(left + width, rightBefore, 'the right edge is the anchor and must not move')

  // Past the minimum width the held edge stops too.
  document.dispatchEvent(pointerEvent('pointermove', { clientX: rect.left + 400, clientY: rect.top + 150, pointerId: 81 }))
  assert.equal(parseFloat(panel.style.getPropertyValue('--dsh-panel-width')), 196, 'the minimum width still clamps')
  assert.equal(
    parseFloat(panel.style.getPropertyValue('--dsh-panel-left')) + 196,
    rightBefore,
    'the held edge must stop with the width, not slide on alone',
  )
  document.dispatchEvent(pointerEvent('pointerup', { pointerId: 81 }))
}

// ----------------------------------------------------------------- teardown --
unmount()
assert.equal(window.__dshArcadeWindowRuntime, undefined, 'unmounting the owner must clear the marker')
{
  // With the runtime gone the document listeners must be gone too.
  document.body.innerHTML = ''
  document.body.dispatchEvent(pointerEvent('pointerdown', { clientX: 60, clientY: 60 }))
  assert.equal(document.querySelectorAll('.dsh-click-hit').length, 0, 'unmounting must remove the document listeners')
}

console.log('ALL CLIENT-HALF ASSERTION GROUPS PASSED')
