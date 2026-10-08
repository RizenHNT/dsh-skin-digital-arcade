# dsh-skin-code-console

An optional second appearance for DeepSeek Harness: the **Rizen Signal Console** code-editor HUD.

It is intentionally separate from `dsh-skin-digital-arcade`. With the optional Harness source integration patch applied, open Settings → Appearance → Interface style and choose **数码控制台**. It is exclusive with Pixel neon; Default restores the remembered Light/Dark/System color choice. Selection uses the Harness settings scope, not the former browser-local enable switch.

The visual layer keeps the conversation and coding controls readable while adding a compact retro console frame: a signal header, target-lock and active-quest cards, a small mission panel, clipped code surfaces, grid-lined conversation space, and a HUD status strip. It uses navy, mint, violet, pink, and amber accents instead of the original city-background skin. Selecting another style removes the scoped console attribute and its decorations.

## Local install

Apply the current [Harness source integration patch](../../README.md#完整工作台源码集成) first. Use the same profile and `DSH_HOME` as your existing Web service when installing this local bundle:

```sh
dsh plugin --profile web add /path/to/dsh-skin-digital-arcade/harness-integration/code-console
```

Restart the Web process with its existing data directory and launch configuration, then refresh the page. Open Settings → Appearance → Interface style and choose 数码控制台. The package includes a prebuilt `lib/client.js`; run `node build.mjs` in this bundle directory after changing `src/client/index.js`.

## Scope

This optional source integration requires the updated theme registry and appearance settings in arcade-ui.patch. It is not a standalone skin install for an unmodified Harness. Only installed console plugins contribute the console choice.
