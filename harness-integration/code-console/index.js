/**
 * Optional Code Console skin for the DeepSeek Harness Web GUI.
 *
 * The host half injects the stylesheet early so the real UI does not flash
 * through a different surface while the browser half is loading. The browser
 * half owns the opt-in switch and scopes the visual override to one body
 * attribute, so disabling the switch restores the active skin's CSS.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

export const name = 'dsh-skin-code-console'

export const inject = ['webServer']

const HERE = fileURLToPath(new URL('.', import.meta.url))
const CSS = readFileSync(join(HERE, 'code-console.css'), 'utf8')

/** Inject the opt-in stylesheet into the served application document. */
function injectSkin(html) {
  const style = `<style data-plugin="skin-code-console">\n${CSS}\n</style>`
  const head = html.indexOf('</head>')
  if (head === -1) return `${html}${style}`
  return `${html.slice(0, head)}${style}${html.slice(head)}`
}

/** Mount the stylesheet injection and remove it with the plugin fiber. */
export function apply(ctx) {
  ctx.effect(() => ctx.webServer.tapIndex(injectSkin), 'dsh-skin-code-console: index stylesheet')
}
