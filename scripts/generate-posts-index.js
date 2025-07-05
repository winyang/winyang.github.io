const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/posts');
const outFile = path.join(__dirname, '../src/posts.index.json');

function getAllMarkdownFiles(dir, category = '') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath, file.name));
    } else if (file.isFile() && file.name.endsWith('.md')) {
      // 解析元数据
      const match = file.name.match(/(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      const date = match ? match[1] : '';
      const id = match ? match[2] : file.name.replace(/\.md$/, '');
      const relDir = path.relative(postsDir, dir);
      const relPath = path.join(relDir, file.name).replace(/\\/g, '/');
      // 读取首行标题
      let title = id;
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)/m);
        if (titleMatch) title = titleMatch[1];
      } catch (e) {}
      results.push({
        id,
        title,
        date,
        category: relDir.split(path.sep)[0] || '',
        path: `posts/${relDir}/${file.name}`.replace(/\\/g, '/'),
      });
    }
  });
  return results;
}

const posts = getAllMarkdownFiles(postsDir);
fs.writeFileSync(outFile, JSON.stringify(posts, null, 2), 'utf-8');
console.log(`已生成 ${posts.length} 篇文章索引到 ${outFile}`); 