# Vue3 博客项目

## 简介
本项目为简化版 Vue3 单页应用（SPA）博客，支持文章列表、归档、文章详情、404 页面等基本功能。

## 目录结构
```
my-blog/
├── public/
│   ├── posts/           # 存放 markdown 文章
│   └── images/          # 静态图片资源
├── src/
│   ├── components/      # 公共组件
│   ├── pages/           # 路由页面
│   ├── App.vue
│   ├── main.js
│   └── router.js
├── package.json
└── vite.config.js
```

## 启动方式
```bash
npm install
npm run dev
```

## 文章添加
将 markdown 文件放入 `public/posts/`，如 `2023-01-01-hello.md`，即可通过 `/post/2023-01-01-hello` 访问。

## 部署
构建后可部署到 GitHub Pages、Vercel、Netlify 等静态托管平台。 