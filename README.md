# dsh-skin-digital-arcade · Rizen Signal Console

DeepSeek Harness Web GUI 的数码电玩风 HUD 皮肤（独立分发 bundle）。

## 特性

- **霓虹配色**：青色 `#6fffe0` / 紫罗兰 `#d28cff` / 品红 `#ff62bd` / 琥珀 `#ffc36b`
  的赛博 HUD 语言，替代默认蓝金
- **像素字体**：Ark Pixel 16/10（OFL 许可，中/日/英子集）用于按钮、标题、标签
- **动画 HUD**：背景网格漂移、hero 光晕脉动、侧边栏雷达/粒子、选中项状态信标、
  输入卡扫描线、发送能量帧动画、气泡悬停 chroma 扫描
- **像素资产**：程序化生成的 arcade 城市背景、数据核心/碎片精灵、
  信号吉祥物 sprite sheet、十字准星光标（全部 WebP 压缩）
- **可读性优先**：编辑器文字保持官方渲染路径；对话正文系统字体；
  输入框静态网格 + 底部扫描线（无干扰动画）

## 安装

```sh
# 从源码目录安装（先构建 harness）
dsh plugin --profile web add <path-to-this-repo>

# 或从 GitHub 安装
dsh plugin --profile web add https://github.com/RizenHNT/dsh-skin-digital-arcade
```

安装后**重启 web 进程**生效（新 bundle 层只在启动时加载）：

```sh
dsh --profile web
```

## 卸载

```sh
dsh plugin --profile web remove dsh-skin-digital-arcade
```

## 原理

- `cordis.patch.yml` 插入一行 host 插件 `skin-digital-arcade`
- `index.js` 在 apply 时：
  1. 注册 `/skin-assets/*` 前缀路由，服务包内字体/精灵图（含路径穿越防护）
  2. tap index 渲染，把 `skin.css` 内联进 `<head>`（`data-plugin` 标记）
- 卸载即移除路由与注入，页面恢复默认主题

## 开发

```sh
# 重新生成 skin.css（从 harness 的 personal.css 转换资源路径）
python tools/gen-skin-css.py

# 单元测试（模拟 webServer 验证路由与注入）
node test-plugin.mjs
```

## 许可

MIT。像素字体 Ark Pixel © TakWolf，OFL-1.1 许可（见 `assets/fonts/`）。
