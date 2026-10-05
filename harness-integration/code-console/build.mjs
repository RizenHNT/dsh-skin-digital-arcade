import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('lib', { recursive: true })

const external = [
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-*',
  'react',
  'react-dom',
  'react/jsx-runtime',
]

await build({
  entryPoints: ['src/client/index.js'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  external,
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-skin-code-console', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})
