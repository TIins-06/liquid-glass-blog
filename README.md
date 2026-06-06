# 💎 Liquid Glass Blog

> 一个融合「液态玻璃」设计美学与现代前端技术的全栈个人博客系统

![Astro](https://img.shields.io/badge/Astro-6.x-orange)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-06B6D4)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F48120)
![License](https://img.shields.io/badge/License-MIT-green)

🔗 **在线预览**: [blog.likegz.dpdns.org](https://blog.likegz.dpdns.org)

---

## ✨ 项目简介

Liquid Glass Blog 是一个基于 **Astro 6** 构建的全栈博客系统，部署在 **Cloudflare Pages** 上。它以「液态玻璃」为核心设计语言，通过 `backdrop-filter: blur()` 毛玻璃效果、流畅的 CSS 动画和精心设计的光影层次，打造沉浸式的阅读体验。

本项目不仅仅是一个静态博客——它内置了完整的 **管理后台**、**Markdown 在线编辑器**、**音乐播放系统**、**全局设置面板** 和 **Cloudflare KV 跨设备数据持久化**，是一个真正可用的全功能博客平台。

---

## 🎨 设计亮点

### 液态玻璃（Liquid Glass）风格
- 所有卡片、导航栏、侧边栏均采用 `backdrop-filter: blur()` + 半透明背景的毛玻璃质感
- 精心调校的 `box-shadow` 和 `border` 营造丰富的光影层次
- 支持 **5 档圆角**（直角 → 胶囊）和 **5 档模糊强度**（无 → 超强）自由组合

### 6 套主题配色
| 配色 | 主色 | 辅色 |
|------|------|------|
| 🟣 紫罗兰 | `#7c3aed` | `#06b6d4` |
| 🔵 海洋蓝 | `#0ea5e9` | `#06b6d4` |
| 🟠 日落橙 | `#f43f5e` | `#f97316` |
| 🟢 森林绿 | `#10b981` | `#059669` |
| 🟣 薰衣草 | `#8b5cf6` | `#d946ef` |
| 🌸 樱花粉 | `#ec4899` | `#f43f5e` |

### 明/暗主题
- 深色主题为默认，浅色主题采用高对比度文字确保可读性
- 所有玻璃效果自动适配两种主题

### 动效系统
- CSS `@keyframes` 驱动的入场动画（slide-up、fade-in）
- 按钮涟漪点击反馈
- 卡片悬浮放大 + 阴影增强
- 全局动效开关（一键关闭所有动画）
- 自定义光标跟随特效

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────┐
│                  Cloudflare Pages                │
│              (自动部署 from GitHub)              │
├─────────────────────────────────────────────────┤
│  Astro 6 (SSG + SSR hybrid)                     │
│  ├── React 19 Islands (交互组件)                │
│  ├── Tailwind CSS 4 (样式)                      │
│  ├── MDX (文章内容)                             │
│  └── @uiw/react-md-editor (编辑器)              │
├─────────────────────────────────────────────────┤
│  Cloudflare Workers Runtime                      │
│  ├── API Routes (SSR)                           │
│  ├── KV Storage (跨设备数据持久化)               │
│  └── Visit Counter (访问统计)                   │
└─────────────────────────────────────────────────┘
```

### Astro Islands 架构
- **纯 Astro 页面**：首页、文章列表、标签页 — 零客户端 JS，极速加载
- **React Islands**：设置面板、音乐播放器、光标特效、文章编辑器 — 仅在交互时加载
- **SSR 路由**：API 接口、管理后台 — 运行时动态渲染

### 核心依赖

| 包 | 版本 | 用途 |
|---|---|---|
| `astro` | ^6.4 | 核心框架 |
| `@astrojs/react` | ^5.0 | React 组件支持 |
| `@astrojs/cloudflare` | ^13.6 | Cloudflare Pages 适配器 |
| `@astrojs/mdx` | ^6.0 | MDX 文章支持 |
| `tailwindcss` | ^4.x | 工具类 CSS |
| `react` / `react-dom` | ^19 | UI 组件 |
| `framer-motion` | ^12 | 动画库 |
| `@uiw/react-md-editor` | ^4.1 | Markdown 编辑器 |

---

## 🚀 功能模块

### 📝 文章系统
- **Content Collections**：基于 Astro 的内容集合，支持 MDX 格式
- **在线 Markdown 编辑器**：集成 `@uiw/react-md-editor`，支持实时预览、工具栏、拖拽分屏
- **文章管理后台**：创建 / 编辑 / 删除，支持草稿模式
- **标签分类**：自动聚合标签，按标签筛选文章
- **代码高亮**：内置 Prism.js 语法高亮
- **响应式排版**：Prose 样式自动适配移动端

### 🎵 音乐播放器
- **迷你播放器**：固定底部胶囊样式，播放/暂停/上下曲/音量控制
- **播放进度条**：可视化进度 + 点击跳转
- **状态持久化**：使用 `sessionStorage` 保存播放状态，切换页面不中断
- **在线搜索**：导航栏内嵌搜索框，搜索网易云音乐
- **自定义音源**：支持接入 `lx-music-api-server` 等第三方音源
- **收藏 & 播放列表**：管理后台可编辑播放列表和收藏

### ⚙️ 全局设置面板
- **明/暗主题切换**：一键切换，自动保存
- **6 套主题配色**：紫罗兰、海洋蓝、日落橙、森林绿、薰衣草、樱花粉
- **卡片圆角调节**：5 档预设（直角 4px → 胶囊 100px）
- **毛玻璃模糊强度**：5 档预设（无 → 超强 48px）
- **动效开关**：一键关闭所有动画
- **跨设备同步**：设置保存到 Cloudflare KV，任何设备登录即恢复

### 📊 后台管理系统
- **仪表盘**：站点概览、快捷入口
- **文章管理**：列表展示 + 编辑/删除按钮 + 在线 Markdown 编辑器
- **音乐管理**：搜索 / 播放列表 / 收藏 / 音源配置（4 个标签页）
- **站点设置**：全站配置项管理
- **密码保护**：管理员登录验证

### 🏠 首页
- **三栏布局**：左侧个人信息 + 中间文章流 + 右侧工具栏
- **个人信息卡片**：QQ 头像、昵称、签名、在线状态
- **服务导航**：可自定义的服务按钮列表（支持复制链接）
- **文章卡片网格**：悬浮放大 + 光影变化 + 标签展示
- **站点统计**：今日访问 / 总访问量 / 运行时间
- **音乐卡片**：右侧栏内嵌播放列表
- **侧边栏折叠**：支持隐藏/展开，状态自动保存

### 🔧 其他特性
- **访问计数器**：基于 KV 的每日/总访问量统计
- **自定义光标**：跟随鼠标的光晕特效
- **ViewTransitions**：Astro 内置的页面过渡动画
- **SEO 优化**：meta 标签、Open Graph、robots.txt
- **响应式设计**：四档断点适配（1400px → 1100px → 800px → 单列）

---

## 📁 项目结构

```
liquid-glass-blog/
├── src/
│   ├── components/
│   │   ├── glass/            # 玻璃卡片组件
│   │   │   └── GlassCard.astro
│   │   ├── interactive/      # React 交互组件
│   │   │   ├── ArticleEditor.tsx   # Markdown 编辑器
│   │   │   ├── CursorEffect.tsx    # 光标特效
│   │   │   ├── MusicPlayer.tsx     # 音乐播放器
│   │   │   └── SettingsPanel.tsx   # 设置面板
│   │   └── layout/           # 布局组件
│   │       ├── Footer.astro
│   │       └── Navbar.astro       # 导航栏（含搜索框）
│   ├── content/
│   │   └── blog/             # MDX 文章
│   ├── layouts/
│   │   ├── Base.astro        # 全局基础布局
│   │   └── Admin.astro       # 管理后台布局
│   ├── pages/
│   │   ├── index.astro       # 首页（三栏布局）
│   │   ├── blog/             # 文章列表 & 详情
│   │   ├── tags/             # 标签聚合
│   │   ├── admin/            # 管理后台
│   │   │   ├── login.astro   # 登录页
│   │   │   ├── index.astro   # 仪表盘
│   │   │   ├── articles.astro# 文章管理
│   │   │   ├── editor.astro  # Markdown 编辑器
│   │   │   ├── music.astro   # 音乐管理
│   │   │   └── settings.astro# 站点设置
│   │   └── api/              # SSR API 接口
│   │       ├── auth.ts       # 认证
│   │       ├── settings.ts   # 全站设置
│   │       ├── music.ts      # 播放列表
│   │       ├── visit.ts      # 访问计数
│   │       ├── articles/     # 文章 CRUD
│   │       └── music/        # 音乐搜索/收藏
│   ├── lib/
│   │   └── kv.ts             # Cloudflare KV 工具
│   └── styles/
│       └── global.css        # 全局样式 + CSS 变量
├── public/                   # 静态资源
├── wrangler.toml             # Cloudflare 配置
├── astro.config.mjs          # Astro 配置
└── package.json
```

---

## 🛠️ 快速开始

### 环境要求
- Node.js >= 18
- npm / pnpm / yarn

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/TIins-06/liquid-glass-blog.git
cd liquid-glass-blog

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:4321` 预览博客。

### 构建 & 预览

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

### 部署到 Cloudflare Pages

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "部署"
   git push origin main
   ```

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 **Workers & Pages** → **创建应用程序** → **连接到 Git**
   - 授权并选择仓库

3. **配置构建设置**
   | 配置项 | 值 |
   |--------|-----|
   | 框架预设 | Astro |
   | 构建命令 | `npm run build` |
   | 构建输出目录 | `dist` |

4. **添加 KV 绑定**
   - 在 Cloudflare Dashboard → Workers & Pages → 你的项目 → **设置** → **绑定**
   - 添加 KV 命名空间绑定，名称设为 `BLOG_KV`
   - 更新 `wrangler.toml` 中的 KV namespace ID

5. **保存并部署** — 每次 push 到 `main` 分支自动触发部署

---

## 🔑 管理后台

访问 `/admin/login` 进入管理后台，默认密码：`liquid2026`

### 功能一览

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/admin` | 站点概览 |
| 文章管理 | `/admin/articles` | 查看/编辑/删除文章 |
| 写文章 | `/admin/editor` | Markdown 在线编辑器 |
| 音乐管理 | `/admin/music` | 搜索/播放列表/收藏/音源 |
| 站点设置 | `/admin/settings` | 全站配置 |

### 在线 Markdown 编辑器

- 基于 `@uiw/react-md-editor`
- 实时预览 / 纯编辑 / 分屏三种模式
- 工具栏：加粗、标题、引用、代码块、链接、图片、表格
- 支持 Frontmatter 元数据（标题、描述、标签、日期）
- 一键保存草稿或直接发布

---

## 🎛️ API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/settings` | GET / PUT | 全站设置读写 |
| `/api/music` | GET / PUT | 播放列表管理 |
| `/api/music/search?q=xxx` | GET | 搜索音乐（网易云） |
| `/api/music/favorites` | GET / PUT | 收藏管理 |
| `/api/articles` | GET | 文章列表（静态 + KV 合并） |
| `/api/articles/manage` | GET / PUT / DELETE | 文章 CRUD |
| `/api/visit` | GET | 访问计数（每日/总量） |
| `/api/auth` | POST | 管理员认证 |

所有数据通过 **Cloudflare KV** 持久化，支持跨设备同步。

---

## 🎯 为什么选择 Liquid Glass Blog？

| 特性 | 传统静态博客 | Liquid Glass Blog |
|------|-------------|-------------------|
| 部署方式 | 手动部署 | Git Push 自动部署 |
| 文章编辑 | 本地编辑 + 推送 | 在线 Markdown 编辑器 |
| 主题切换 | 固定主题 | 6 套配色 + 明暗切换 |
| 卡片样式 | 固定 | 圆角/模糊自由调节 |
| 音乐播放 | ❌ | ✅ 内置播放器 + 搜索 |
| 跨设备同步 | ❌ | ✅ Cloudflare KV |
| 管理后台 | ❌ | ✅ 完整后台系统 |
| 动效体验 | 基础 | 液态玻璃 + 精细动画 |
| 性能 | 一般 | Astro Islands 零 JS 首屏 |

---

## 📄 License

[MIT](https://github.com/TIins-06/liquid-glass-blog/blob/main/LICENSE)

---

<p align="center">
  <em>用液态玻璃的质感，记录每一个灵感瞬间 ✨</em>
</p>
