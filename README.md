# dsh-skin-digital-arcade · Rizen Signal Console

DeepSeek Harness Web GUI 的数码电玩风 HUD 皮肤（独立分发 bundle）。

它不是单纯换颜色——是一套完整的交互系统：**光标锁定、输入解码、气泡扫描、按钮命中、HUD 扫描**。编辑器文字始终保持在官方渲染路径上，可读性优先。

## 预览

| 暗色模式 | 亮色模式 |
|---|---|
| ![dark](preview/preview-dark.png) | ![light](preview/preview-light.png) |

## 交互反馈

皮肤的核心是"页面像游戏界面一样回应你"。按 元素 — 触发 — 反馈 列出：

| 元素 | 触发 | 视觉反馈 |
|---|---|---|
| 按钮 / 链接 / 下拉框 | hover | 青色提亮 + 青紫双重光晕 + 轻微上浮（链接与按钮共用此规则） |
| 按钮 / 链接 / 下拉框 | 按下 | 变琥珀色 + 下沉（命中确认） |
| 按钮 / 链接 / 下拉框 | 键盘聚焦 | 品红色瞄准框 |
| 未选中标签页 | hover | 品红—琥珀色扫描线划过 |
| 对话气泡 | hover | 顶部扫描线 + 文字短暂 chromatic glitch（数据读取动画） |
| 输入框 | 聚焦 | 显示 `INPUT // DECODE 01` 状态标签、边框脉动、文字 RGB 分离与短暂乱码 |
| 输入框 | 输入中 | 低频 typed glitch（每 4.6s 闪一次 RGB 分离） |
| 发送按钮 | 常驻 | 狐狸精灵 sprite 持续播放 + 青色光晕 |
| 发送按钮 | hover | 光晕增强 + 能量 atlas 帧动画 |
| 发送按钮 | 按下 | 能量帧爆发 + 整个输入卡 send burst 扩散 |
| 底部统计条 | 常驻 | 雷达旋转 + 横向扫描线（游戏 HUD 状态条） |
| Session Log / 后台任务 / 活动标签 | 常驻 | 各自挂载 data-core / data-shard 精灵（非随机漂浮装饰） |
| 侧边栏选中项 | 常驻 | 青色边缘 + 琥珀色状态信标脉冲 |
| 侧边栏 | 常驻 | 雷达 / 粒子动画 |
| hero 标题 | 常驻 | 青紫辉光脉动 |

## 特性

- **霓虹配色**：青色 `#6fffe0` / 紫罗兰 `#d28cff` / 品红 `#ff62bd` / 琥珀 `#ffc36b`
  的赛博 HUD 语言，替代默认蓝金
- **像素字体**：Fusion Pixel 12px（OFL-1.1，latin + 简体中文子集，覆盖全 CJK 常用字）
  用于按钮、标题、标签；英文数字与中文统一 12px 像素网格，混排协调
- **动画 HUD**：背景网格漂移、hero 光晕脉动、侧边栏雷达/粒子、选中项状态信标、
  输入卡扫描线、发送能量帧动画、气泡悬停 chroma 扫描、底部 HUD 状态条
- **像素资产**：程序化生成的 arcade 城市背景、数据核心/碎片精灵、
  信号吉祥物 sprite sheet、能量 FX atlas、十字准星光标（全部 WebP 压缩）
- **自定义光标**：十字准星（32×32）应用于可交互元素，文本输入处恢复文本光标
- **可读性优先**：编辑器文字保持官方渲染路径；对话正文系统字体；
  输入框静态网格 + 底部扫描线（无干扰动画）
- **设置面板兼容**：打开设置时临时提升侧边栏层级并解除裁剪，
  保证遮罩和面板完整显示（无 `backdrop-filter`，fixed 面板保持全视口）

## 更新记录

### v0.1.1

- **侧边栏会话树像素化**：工作区名、会话标题、分组标签（如「工作区」）统一像素字体，
  时间戳 / 状态标签使用小号像素字
- **全 CJK 像素字体**：改用 Fusion Pixel 12px（覆盖简体中文常用字），
  英文数字与中文保持同一 12px 像素网格
- **预览图更新**：基于真实页面捕获 + 占位文本重制（不含任何真实数据）

### v0.1.0

- 初始发布：霓虹 HUD 主题、像素字体、动画精灵、交互反馈、自定义光标

## 安装

插件本体是 JavaScript + CSS + 静态资源，**无需单独编译**。

```sh
# 从 GitHub 安装
dsh plugin --profile web add https://github.com/RizenHNT/dsh-skin-digital-arcade

# 或从本地目录安装
dsh plugin --profile web add /path/to/dsh-skin-digital-arcade
```

> 若使用 Harness **源码版 CLI**（`pnpm dsh ...`），需先按官方文档构建 Harness；
> 安装版 CLI（`dsh`）不需要。

安装或更新后**建议重启**当前 `dsh web` 进程，确保新的 bundle、资源路由和 index 注入全部加载：

```sh
dsh --profile web
```

## 卸载

```sh
dsh plugin --profile web remove dsh-skin-digital-arcade
```

卸载即移除路由与注入，页面恢复默认主题。

## 原理

- `cordis.patch.yml` 插入一行 host 插件 `skin-digital-arcade`
- `index.js` 在 apply 时：
  1. 注册 `/skin-assets/*` 前缀路由，服务包内字体/精灵图（含路径穿越防护）
  2. tap index 渲染，把 `skin.css` 内联进 `<head>`（`data-plugin` 标记）
- `skin.css` 是纯声明层：覆盖 `--dsw-*` 令牌 + 稳定 DOM 属性，
  不触碰编辑器布局属性

## 开发

```sh
# 插件自检（模拟 webServer 验证资源路由、路径防护与 CSS 注入）
node test-plugin.mjs

# 重新生成 skin.css（可选：从 Harness 仓库的 personal.css 转换资源路径）
python tools/gen-skin-css.py
```

> `tools/gen-skin-css.py` 需要 Harness 源码树中的 `personal.css` 作为输入；
> 对皮肤使用本仓库现成的 `skin.css` 无需运行它。

## 许可

- 本仓库代码、素材包装与文档：**MIT**（见 [LICENSE](LICENSE)）
- 像素字体 **Fusion Pixel** © TakWolf：**OFL-1.1**（见 [assets/fonts/OFL-fusion-pixel.txt](assets/fonts/OFL-fusion-pixel.txt)）
