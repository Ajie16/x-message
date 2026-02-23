# OpenAgent 官网

> 一站式AI Agent开发与部署平台 - 现代化响应式官网设计

## 🎨 设计概述

本项目是OpenAgent官网的UI设计与前端实现，采用现代化设计风格，面向AI Agent开发者与技术决策者。

### 核心设计理念

- **科技感** - 使用渐变、粒子动画、玻璃态效果营造科技氛围
- **专业性** - 清晰的信息层级，突出边缘设备部署与低代码构建核心卖点
- **响应式** - 完美适配1920×1080到移动端的各种屏幕尺寸

## 📐 设计规范

### 色彩系统

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主色（科技蓝） | `#165DFF` | 品牌主色、按钮、链接 |
| 辅助色（薄荷绿） | `#00C48C` | 高亮、成功状态 |
| 辅助色（淡紫） | `#7B61FF` | 渐变、强调 |
| 背景浅色 | `#F8F9FA` | 页面背景 |
| 背景深色 | `#1D2129` | 页脚背景 |
| 文字深色 | `#1D2129` | 标题、正文 |
| 文字灰色 | `#869099` | 辅助文字 |

### 布局规范

- **栅格系统**: 8px基准栅格
- **模块间距**: 24px / 32px / 48px
- **留白率**: ≥40%
- **最大宽度**: 1280px（标准），1440px（1920+屏幕）

### 字体规范

- **字体族**: Inter（主要），系统字体（备用）
- **标题**: 粗体 32/28px
- **正文**: 16px，行高1.8
- **辅助文字**: 14px，行高1.6

## 🏗️ 项目结构

```
openagent-website/
├── index.html          # 主页面（单页应用结构）
├── css/
│   └── main.css        # 主样式表（包含响应式设计）
├── js/
│   └── main.js         # 交互逻辑脚本
├── images/             # 图片资源（占位）
├── assets/             # 其他资源
└── README.md           # 项目说明
```

## ✨ 核心功能模块

### 1. 导航栏
- 顶部固定，滚动时透明渐变至 `#165DFF`（opacity 0.9）
- 左侧Logo，右侧导航链接+暗黑模式切换
- Hover时2px主色下划线（0.3s过渡）
- 移动端为汉堡菜单，按钮≥56px

### 2. Hero首屏
- 渐变背景 + 轻量化粒子动画（Canvas实现）
- 主标题+副标题突出核心卖点
- 右侧Agent交互演示图
- CTA按钮hover上浮+阴影加深，点击径向反馈
- 首屏资源内联，非关键资源懒加载

### 3. 核心功能区
- 三列网格布局
- 卡片圆角12px+轻微阴影
- Hover时translateY(-6px)+阴影强化
- 图标线性简约，主色填充

### 4. 技术优势区
- 左右分栏布局
- 左侧图标列表（开源生态、高兼容性、低延迟）
- 右侧代码片段展示（语法高亮）

### 5. 案例展示区
- 瀑布流网格布局
- 卡片16:9比例
- 分类筛选功能
- 点击打开模态框

### 6. 底部
- 三栏布局（关于我们、快速链接、联系我们）
- 社交媒体链接
- 版权信息居中

## 🚀 性能优化

### 加载性能
- **关键CSS内联** - 首屏样式直接内联在HTML中
- **异步加载** - 非关键CSS和JS使用异步加载
- **字体预连接** - Google Fonts预连接优化
- **懒加载** - 图片使用Intersection Observer懒加载

### 动画性能
- **GPU加速** - 使用transform和opacity实现动画
- **减少运动** - 尊重 `prefers-reduced-motion` 设置
- **标签页优化** - 隐藏标签页时暂停粒子动画

### Core Web Vitals目标
| 指标 | 目标值 | 实现方式 |
|------|--------|---------|
| LCP | <2.5s | 关键资源预加载、图片懒加载 |
| CLS | <0.1 | 图片尺寸预设、字体加载策略 |
| FID | <100ms | JS代码分割、事件监听优化 |

## 📱 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|---------|
| Mobile | < 640px | 单列布局，汉堡菜单 |
| Tablet | 640px - 1023px | 双列网格 |
| Desktop | 1024px - 1279px | 完整布局 |
| Large | 1280px - 1919px | 最大宽度1280px |
| XL | ≥ 1920px | 最大宽度1440px |

## 🔒 SEO与安全

### SEO优化
- 完整的meta标签（description, keywords, Open Graph, Twitter Card）
- Schema.org结构化数据（Organization, Product）
- 语义化HTML5标签
- Canonical URL设置

### 安全配置
- Content Security Policy (CSP) 头部
- HSTS支持
- Cookie SameSite=Lax
- SRI资源校验

## 🎯 交互特性

- **滚动动画** - 模块进入视口时淡入（translateY+opacity）
- **粒子效果** - Hero区域Canvas粒子动画
- **主题切换** - 支持暗黑/亮色模式
- **数字滚动** - 统计数据动态计数效果
- **模态框** - 案例详情弹窗
- **平滑滚动** - 锚点链接平滑滚动

## 🛠️ 使用方式

### 本地开发

```bash
# 进入项目目录
cd openagent-website

# 使用任意本地服务器
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

访问 http://localhost:8080

### 部署

静态文件可直接部署到：
- Vercel
- Netlify
- GitHub Pages
- 阿里云OSS/腾讯云COS
- 任何CDN

## 📝 自定义配置

### 修改颜色主题
编辑 `css/main.css` 中的 CSS 变量：

```css
:root {
    --primary: #165DFF;      /* 主色 */
    --secondary: #00C48C;    /* 辅助色 */
    --accent: #7B61FF;       /* 强调色 */
    /* ... */
}
```

### 修改粒子效果
编辑 `js/main.js` 中的 CONFIG：

```javascript
const CONFIG = {
    particleCount: 25,       /* 粒子数量 */
    animationDuration: 400,  /* 动画时长 */
    /* ... */
};
```

## 🎨 Figma设计稿说明

### 图层结构

```
📁 OpenAgent Website
├── 📁 01_Guides          # 栅格、边距参考线
├── 📁 02_Components      # 可复用组件
│   ├── Button
│   ├── Card
│   ├── Input
│   └── ...
├── 📁 03_Sections        # 页面模块
│   ├── Navigation
│   ├── Hero
│   ├── Features
│   ├── Tech
│   ├── Cases
│   └── Footer
└── 📁 04_Pages           # 完整页面
    └── Home
```

### 标注规范

- 尺寸: 使用8px栅格
- 间距: 标注24/32/48px等间距值
- 颜色: 显示色值和变量名
- 字体: 标注字号、字重、行高

## 📄 文件说明

| 文件 | 大小 | 说明 |
|------|------|------|
| index.html | ~39KB | 主页面，包含内联关键CSS |
| css/main.css | ~33KB | 主样式表，响应式设计 |
| js/main.js | ~16KB | 交互逻辑，性能优化 |

## 🔄 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📜 许可证

MIT License

## 👥 团队

OpenAgent Design Team

---

**注意**: 当前版本为设计实现原型，图片资源使用占位符，实际部署时请替换为真实图片资源（建议使用AVIF/WebP格式以获得最佳性能）。
