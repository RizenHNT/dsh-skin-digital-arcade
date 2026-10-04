# Canvas Confetti provenance

Source: https://github.com/catdad/canvas-confetti

Version: 1.9.4, retrieved from https://registry.npmjs.org/canvas-confetti/-/canvas-confetti-1.9.4.tgz

License: ISC; the unmodified upstream notice is in `LICENSE`.

The upstream `confetti.module.mjs` is also served as `confetti.module.js` so the local server supplies the JavaScript MIME type. The bytes are unchanged. SHA256 of both copies: `D29DC7B2DAE5D04BAF55666E4F677BBF7F8B0BF587E1ACE6098823C4363E7589`.

The application serves this unmodified module from its own origin. The integration selects an explicit canvas with `useWorker: false`, square particles and reduced-motion support. It passes pointer coordinates and rendering options, with no conversation, workspace, credential or filesystem inputs. Source inspection found no fetch, XMLHttpRequest, WebSocket, cookie, localStorage or eval calls. This is a scoped source inspection, not an independent security audit. Package scripts are not executed; no global installation or CDN is used.

本模块来自上述官方仓库对应的 npm 1.9.4 发布包，保留原文件和 ISC 许可。界面从 DSH 自身地址加载它，并禁用 Worker。接入仅传递指针坐标与绘制参数，未接入会话、工作区、凭据或文件内容。上述检查是针对当前源码的有限检查，不能等同于独立安全审计。
