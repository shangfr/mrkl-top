# MRKL.top — AI Agent 架构学习站

围绕 MRKL / ReAct / Agent Loop 等大模型智能体架构概念的中文技术内容站（路线 A）。
纯静态站点：无需服务器、无需构建，GitHub Pages 直接托管。

## 技术架构

- **站点托管**：GitHub Pages（纯静态）
- **邮件分发**：Buttondown（用户名 `vencen`，邮箱 shangfengrui@gmail.com）
- **订阅表单**：Buttondown 公开嵌入表单（`https://buttondown.com/api/emails/embed-subscribe/vencen`）——无需服务器、无需密钥，由 Buttondown 处理订阅
- **RSS**：本站 `feed.xml`（站点内容）；Buttondown 归档页自带 RSS

## 目录结构

    ├── index.html                 # 首页（搜索/统计/标签云/打字动画/随机文章/订阅）
    ├── 404.html
    ├── robots.txt
    ├── sitemap.xml
    ├── feed.xml                   # RSS 订阅源
    ├── .nojekyll                  # 禁用 GitHub Pages 的 Jekyll 处理
    ├── assets/
    │   ├── style.css              # 全站样式（青色主题 + 暗色模式）
    │   └── app.js                 # 全站交互脚本
    └── articles/                  # 10 篇文章

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（如 `mrkl-top`），把本目录推送上去：

       git init
       git add .
       git commit -m "init: MRKL.top 内容站"
       git remote add origin https://github.com/<你的用户名>/mrkl-top.git
       git push -u origin main

2. 仓库 **Settings → Pages** → Build and deployment → Source 选 **Deploy from a branch** → 分支 `main` / 目录 `/(root)` → Save；
3. （可选）绑定自定义域名：Settings → Pages → **Custom domain** 填 `mrkl.top`，按 GitHub 提示到 DNS 加 CNAME 记录，勾选 **Enforce HTTPS**；
4. 推送后 Pages 自动更新。

## 安全说明

- 站点代码里**没有任何密钥**。你的 Buttondown API Key 只用于 API 操作（如本机建邮件草稿），**切勿提交进仓库或写进任何前端文件**；
- 订阅走 Buttondown 公开嵌入端点，由 Buttondown 后端处理，静态托管也能直接使用。

## 新增文章流程

1. 复制 `articles/` 下文章骨架写新文章（HTML）；
2. 更新 `index.html` 卡片、`sitemap.xml`、`feed.xml`、`assets/app.js` 的 ORDER 数组（上/下一篇顺序）；
3. 推送 GitHub → Pages 自动更新。

## 已内置的交互与增长元素

- 🌙 暗色模式切换（记忆偏好，跟随系统默认）
- 🔍 站内实时搜索（标题/标签/摘要）
- 📊 统计条、🏷️ 标签云、🎲 随机文章、⌨️ Hero 打字动画
- 📈 阅读进度条、⬆️ 回到顶部、📑 目录滚动高亮
- 📋 代码复制、👍 点赞、🔗 分享（X/LinkedIn/微博/复制链接）
- ⬅️➡️ 上/下一篇导航、📡 RSS、📱 移动端菜单

## 待办

- [x] 订阅表单接入 Buttondown（公开嵌入，无密钥）
- [ ] 接入统计（Cloudflare Web Analytics 或 Umami）
- [ ] 英文版旗舰文章（`/en/` + hreflang），抢 "MRKL tutorial" 英文流量
- [ ] （可选）把正文同步为 Buttondown 邮件，利用其归档页与自动 SEO 收录
