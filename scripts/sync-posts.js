const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. 生成最新 posts.index.json
execSync('node scripts/generate-posts-index.js', { stdio: 'inherit' });

// 2. 确保 public 目录存在
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// 3. 拷贝 posts.index.json
fs.copyFileSync(
  path.join(__dirname, '../src/posts.index.json'),
  path.join(publicDir, 'posts.index.json')
);

// 4. 拷贝 posts 目录
const srcPosts = path.join(__dirname, '../src/posts');
const publicPosts = path.join(publicDir, 'posts');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);
  fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// 清空 public/posts 目录再拷贝
if (fs.existsSync(publicPosts)) {
  fs.rmSync(publicPosts, { recursive: true, force: true });
}
copyDir(srcPosts, publicPosts);

console.log('已同步最新 posts.index.json 和 posts 目录到 public/'); 