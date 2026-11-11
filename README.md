# MRKL.top — Astro 重构版

AI Agent 架构学习站（MRKL · ReAct · Agent Loop），双语（中文 / English）。纯静态站，由 **Astro** 构建，内容用 **Markdown** 编写，部署到 GitHub Pages。

## 快速开始

```bash
npm install        # 安装依赖（需要可访问 npm registry）
npm run dev        # 本地开发 http://localhost:4321
npm run build      # 构建到 dist/（含 postbuild 生成 /en/index.html）
npm run preview    # 本地预览构建产物
```

## 写一篇新文章

在 `src/content/zh/`（中文）或 `src/content/en/`（英文）下新建 `slug.md`：

```markdown
---
title: "你的文章标题"
description: "一句话摘要（会显示在卡片、meta description、RSS 里）"
date: 2026-11-11
minutes: 8          # 阅读时长（分钟）
tags:
  - 概念
  - 对比
lang: zh            # zh 或 en
order: 12           # 排序编号（决定卡片顺序与上一篇/下一篇）
---

## 小节标题 {#custom-id}   ← 可选：自定义锚点 id（目录/滚动高亮用）

正文 Markdown……支持表格、代码块、列表、引用、图片。
```

构建后自动生成：
- 文章页 `/articles/slug.html`（或 `/en/articles/slug.html`）
- 首页卡片 / 统计数字 / 上一篇下一篇
- sitemap.xml（含双语 hreflang 配对）
- feed.xml（zh / en 各一份 RSS）

### 双语对应规则
- 中英文文章按**同名 slug** 一一对应（如 `zh/agent-loop.md` ↔ `en/agent-loop.md`），页面互相跳转 + hreflang 配对自动完成。
- 英文旗舰教程 `en/mrkl-tutorial.md` 对应中文 `what-is-mrkl.md`（在 `src/pages/en/articles/[slug].astro` 中有特判）。
- 卡片展示文案（策展式标题/摘要/标签）在 `src/data/cards.ts` 维护；新文章记得补一条，否则卡片区域为空。

## 部署

1. 推送 main 分支 → `.github/workflows/deploy.yml` 自动构建并部署到 GitHub Pages。
2. Pages 来源必须是 **GitHub Actions**（Settings → Pages → Build and deployment → Source: GitHub Actions）。
3. 自定义域名 `mrkl.top`：`public/CNAME` 已包含；DNS 的 A 记录/CNMAE 保持即可。

## 订阅（Buttondown）

订阅表单为公开嵌入表单（`https://buttondown.com/api/emails/embed-subscribe/vencen`），**无需任何密钥**，安全。API Key 仅用于本机维护，绝不入库。

## 目录结构

```
astro.config.mjs        # Astro 配置（build.format: file 保持 .html URL）
src/content/zh|en/*.md  # 文章内容（Markdown + frontmatter）
src/content.config.ts   # 内容集合 schema
src/layouts/            # BaseLayout / ArticleLayout
src/components/         # HomeMain（首页各区块）
src/pages/              # 首页 / 文章动态页 / 404 / feed / sitemap
src/data/cards.ts       # 首页卡片展示文案
public/assets/          # style.css + app.js（交互脚本，含暗色/搜索/点赞等）
public/CNAME · robots.txt
scripts/                # convert.mjs（旧 HTML→MD 迁移脚本）· remark-heading-id.mjs · postbuild.mjs
```
