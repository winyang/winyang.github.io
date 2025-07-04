# 个人博客

基于 Vue3 + Vite 构建的现代化个人博客系统，支持 Markdown 文章管理、分类浏览、搜索功能等。

## ✨ 特性

- 🚀 **Vue3 + Vite** - 现代化的前端技术栈
- 📝 **Markdown 支持** - 使用 marked.js 渲染 Markdown 内容
- 🎨 **代码高亮** - 支持 GitHub 风格的代码语法高亮
- 🔍 **搜索功能** - 实时搜索文章标题
- 📂 **分类管理** - 按文件夹自动分类文章
- 📱 **响应式设计** - 适配各种设备屏幕
- ⚡ **静态部署** - 支持 GitHub Pages 等静态托管

## 🏗️ 项目结构

```
winyang.github.io/
├── src/
│   ├── pages/           # 页面组件
│   │   ├── Home.vue     # 首页（文章列表 + 文章详情）
│   │   └── Post.vue     # 文章详情页
│   ├── posts/           # Markdown 文章
│   │   ├── 1.Learn/     # 学习分类
│   │   └── 2.Test/      # 测试分类
│   ├── components/      # 公共组件
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── router.js        # 路由配置
├── dist/                # 构建输出目录
├── package.json
└── vite.config.mjs
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 部署到 GitHub Pages
```bash
npm run deploy
```

## 📝 文章管理

### 添加文章
1. 在 `src/posts/` 目录下创建分类文件夹（如 `1.Learn/`）
2. 在分类文件夹中添加 Markdown 文件
3. 文件命名格式：`YYYY-MM-DD-文章标题.md`
4. 文章必须以 `# 标题` 开头

### 文章格式

```
markdown
```

## 🎨 功能特性

### 左侧边栏
- **搜索框** - 实时搜索文章标题
- **分类列表** - 显示所有文章分类及文章数量

### 右侧内容区
- **文章列表** - 显示当前分类的所有文章
- **文章详情** - 点击文章标题查看完整内容
- **代码高亮** - 支持多种编程语言的语法高亮

## 🌐 部署

### GitHub Pages
项目已配置自动部署到 GitHub Pages：

1. 运行 `npm run deploy`
2. 在 GitHub 仓库设置中启用 Pages
3. 选择 `gh-pages` 分支作为源

### 其他平台
也可以部署到 Vercel、Netlify 等静态托管平台。

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **Marked** - Markdown 解析器
- **Highlight.js** - 代码语法高亮
- **gh-pages** - GitHub Pages 部署工具

## 许可证

MIT License 