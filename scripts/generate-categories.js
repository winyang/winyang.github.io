const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/posts');
const outFile = path.join(__dirname, '../src/categories.json');

function getFolders(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

const categories = getFolders(postsDir);
fs.writeFileSync(outFile, JSON.stringify(categories, null, 2), 'utf-8');
console.log('分类已生成:', categories); 