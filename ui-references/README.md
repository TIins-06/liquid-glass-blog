# 液态玻璃博客 — UI 设计参考库

## 设计体系

本文件夹存放博客项目的所有 UI 设计参考、组件样式和设计规范。
用于学习审美、保持一致的视觉风格，以及作为未来 UI 迭代的基准。

---

## 1. 核心设计语言

### 色彩体系
- **暗色背景**: `#0d1117` (GitHub Dark)
- **亮色背景**: `#ffffff` (纯白)
- **玻璃层**: `rgba(255,255,255,0.04-0.06)` 暗色 / `rgba(255,255,255,0.65-0.7)` 亮色
- **强调色**: 6 组预设 (紫罗兰、海洋蓝、日落橙、森林绿、薰衣草、樱花粉)
- **文字**: 三级 — primary(`#e6edf3`), secondary(`#8b949e`), muted(`#6e7681`)

### 排版
- **正文字体**: Inter, system-ui, sans-serif
- **等宽字体**: JetBrains Mono (代码、section 标题)
- **标题**: font-weight 600-700, letter-spacing -0.3px
- **正文字号**: 0.875rem-1rem, line-height 1.6-1.8

### 间距与圆角
- **卡片圆角**: 0.75rem (12px) — 干净利落
- **按钮圆角**: 1rem-2rem (胶囊形)
- **Section 间距**: 2.5rem (space-y-10)
- **卡片内距**: 1.25rem-1.5rem (p-5 to p-6)

---

## 2. 组件样式参考

### 导航栏 (Navbar)
- **风格**: 浮动胶囊式，固定顶部，居中 max-width 640px
- **背景**: glass-strong (深色毛玻璃 80% 不透明)
- **高度**: 52px
- **导航项**: 圆角 rounded-xl, hover 时 bg-white/5
- **活跃态**: bg-white/10 + text-white

### 液态玻璃卡片 (Liquid Glass Card)
- **背景**: 深色半透明 `rgba(20,28,48,0.55)`
- **边框**: 内发光 `0 0 0 1px rgba(255,255,255,0.12) inset`
- **阴影**: `0 20px 40px -12px rgba(0,0,0,0.4)`
- **悬浮**: translateY(-6px) + 更强内发光
- **高光层**: `::after` 线性渐变 125deg 模拟玻璃折射
- **SVG 滤镜**: feTurbulence + feDisplacementMap 实现液态扭曲

### 按钮 (Glass Button)
- **背景**: `rgba(255,255,255,0.18)`
- **边框**: `0.5px solid rgba(255,255,255,0.5)`
- **圆角**: 2rem (全胶囊)
- **悬浮**: 背景加深至 0.3 + scale(1.02)

### Section 标题
- **结构**: 彩色竖条(3px×20px) + 等宽字体标题 + "View all →" 链接
- **竖条**: 使用 `--accent-1` 颜色
- **链接悬浮**: gap 增大 + 颜色变化

### 服务链接 (Service Link)
- **布局**: flex 水平排列，icon(28px) + 标题 + 描述
- **悬浮**: translateX(3px) + 背景变化
- **复制按钮**: 1.75rem 正方形，hover 时背景变 accent 色

### 复制按钮 (Copy Button)
- **尺寸**: 28px × 28px
- **边框**: 1px solid var(--glass-border)
- **悬浮**: background 变 accent-1 + 白色图标
- **成功态**: 背景变绿色 #22c55e

---

## 3. 动效规范

### 过渡
- **标准过渡**: 0.3s ease
- **弹性过渡**: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **弹簧过渡**: cubic-bezier(0.2, 0.9, 0.4, 1.1) (液态卡片)

### 关键帧动画
- **slideUp**: opacity 0→1 + translateY(20px→0), 0.5s
- **float**: translateY(0→-10px→0), 6s 循环
- **wave**: 手臂挥动效果, 2.5s
- **gradient-animation**: 背景位置循环, 8s

### 液态玻璃动效 (SVG 滤镜)
- **feTurbulence**: fractalNoise, baseFrequency 0.024, 4 octaves
- **feDisplacementMap**: scale 14-44 (随鼠标距离变化)
- **色差**: 红通道偏移 dx=2.2, 蓝通道偏移 dx=-1.8
- **交互**: 鼠标接近卡片时扭曲增强 + 频率变密

---

## 4. 设计灵感来源

| 来源 | 风格要点 | 引用文件 |
|------|---------|---------|
| tunan-blog | 浮动胶囊导航、section 彩色竖条、渐变文字、极简背景 | `tunan-nav.css` |
| iOS Liquid Glass | SVG 滤镜液态扭曲、色差折射、多层高光 | `liquid-glass.html` |
| GitHub Dark | 干净暗色背景、精确边框、专业排版 | `github-dark.css` |

---

## 5. 使用指南

1. **新建组件时**: 先查看本文件夹内是否有匹配的组件样式
2. **修改配色时**: 参考色彩体系中的变量名和色值
3. **添加动效时**: 参考动效规范中的过渡时间和曲线
4. **保持一致性**: 所有卡片、按钮、链接应遵循本文件夹中的圆角、间距规范
