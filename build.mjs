/**
 * Bundle the generated window runtime into the client module the Harness web
 * loader serves.
 *
 * The loader hands each client plugin a CommonJS factory through
 * `window.__ModuleLoader__.load`, so the bundle is CJS wrapped in that call
 * (the same carrier `dsh-skin-code-console` uses). The runtime imports nothing,
 * so the bundle has no external dependencies to declare.
 *
 * Usage: node build.mjs
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

const ID = 'dsh-skin-digital-arcade'

mkdirSync('lib', { recursive: true })

await build({
  entryPoints: ['src/client/index.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  banner: {
    js: `window.__ModuleLoader__.load({ id: '${ID}', factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})
