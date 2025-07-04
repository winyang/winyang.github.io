<template>
  <div class="home-layout">
    <aside class="sidebar">
      <div class="search-box">
        <input v-model="search" type="text" placeholder="Search..." />
      </div>
      <div class="category-box">
        <div
          v-for="cat in categories"
          :key="cat"
          :class="['category-item', { active: cat === selectedCategory }]"
          @click="selectCategory(cat)"
        >
          {{ cat }} <span class="cat-count">({{ categoryCount[cat] || 0 }})</span>
        </div>
      </div>
    </aside>
    <div class="content-area">
      <div v-if="!selectedPost" class="posts-list">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card clickable"
          @click="selectPost(post)"
        >
          <div class="post-title">{{ post.title }}</div>
          <div class="post-date">{{ post.date }}</div>
        </div>
        <div v-if="filteredPosts.length === 0" class="empty-tip">暂无文章</div>
      </div>
      <div v-else class="article-panel">
        <div class="post-header">
          <h1 class="post-title">{{ selectedPost.title }}</h1>
          <div class="post-date">{{ selectedPost.date }}</div>
        </div>
        <div class="post-body" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const modules = import.meta.glob('@/posts/*/*.md', { query: '?raw', import: 'default', eager: true })
const posts = ref([])
const categories = ref([])
const selectedCategory = ref('')
const search = ref('')
const categoryCount = ref({})
const selectedPost = ref(null)
const renderedContent = ref('')


async function loadCategoriesAndPosts() {
  const arr = []
  const countMap = {}
  for (const path in modules) {
    const content = modules[path]
    const match = content.match(/^# (.+)/)
    const title = match ? match[1] : '未命名'
    const catMatch = path.match(/posts\/(.*?)\//)
    const category = catMatch ? catMatch[1] : '未分类'
    const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})/)
    const date = dateMatch ? dateMatch[1] : ''
    const idMatch = path.match(/posts\/.*?\/(.+)\.md$/)
    const id = idMatch ? idMatch[1] : ''
    
    arr.push({ id, title, date, category })
    countMap[category] = (countMap[category] || 0) + 1
  }
  let allCats = []
  try {
    const res = await fetch('/src/categories.json')
    if (res.ok) {
      allCats = await res.json()
    }
  } catch (e) {}
  allCats.forEach(cat => {
    if (!(cat in countMap)) countMap[cat] = 0
  })
  categories.value = allCats.length ? allCats : Object.keys(countMap)
  posts.value = arr.sort((a, b) => b.date.localeCompare(a.date))
  categoryCount.value = countMap
  
  if (!selectedCategory.value && categories.value.length > 0) {
    selectedCategory.value = categories.value[0]
  }
}

onMounted(loadCategoriesAndPosts)



function selectCategory(cat) {
  selectedCategory.value = cat
  // 切换分类时，清空选中的文章，显示文章列表
  selectedPost.value = null
  renderedContent.value = ''
}

function selectPost(post) {
  selectedPost.value = post
  // 加载文章内容
  const postPath = `/src/posts/${post.category}/${post.id}.md`
  
  if (modules[postPath]) {
    const content = modules[postPath]
    // 移除标题行，因为标题已经在头部显示了
    const contentWithoutTitle = content.replace(/^# .+$/m, '')
    renderedContent.value = marked(contentWithoutTitle)
    
    // 在下一个 tick 中重新高亮代码块
    setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.post-body pre code')
      codeBlocks.forEach(block => {
        // 移除之前的高亮标记
        block.removeAttribute('data-highlighted')
        block.className = block.className.replace(/hljs language-\w+/, '')
        // 重新高亮
        hljs.highlightElement(block)
      })
    }, 0)
  }
}

const filteredPosts = computed(() => {
  if (!selectedCategory.value) return []
  
  let list = posts.value.filter(post => post.category === selectedCategory.value)
  
  if (search.value.trim()) {
    list = list.filter(post => post.title.toLowerCase().includes(search.value.trim().toLowerCase()))
  }
  
  return list
})

watch(categories, (newCats) => {
  if (!selectedCategory.value && newCats.length > 0) {
    selectedCategory.value = newCats[0]
  }
})

marked.setOptions({
  highlight: function(code, lang) {
    // 清理代码，移除多余的空格和换行
    const cleanCode = code.trim()
    
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(cleanCode, { language: lang }).value
      } catch (e) {
        return hljs.escape(cleanCode)
      }
    }
    
    // 对于没有指定语言的代码块，尝试自动检测语言
    try {
      const result = hljs.highlightAuto(cleanCode)
      return result.value
    } catch (e) {
      // 如果自动检测失败，返回原始代码
      return hljs.escape(cleanCode)
    }
  }
})
</script>

<style scoped>
.home-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 12px 0 12px;
  gap: 28px;
  align-items: flex-start;
  color: #222;
  font-family: 'PT Sans', 'Helvetica Neue', Arial, sans-serif;
  background: #f7f7f7;
}
.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #e5e5e5;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 22px 14px 14px 14px;
  color: #222;
}
.search-box {
  margin-bottom: 18px;
  margin-top: 8px;
}
.search-box input {
  width: 100%;
  padding: 8px 10px;
  border: 1.2px solid #e5e5e5;
  border-radius: 14px;
  font-size: 0.98rem;
  transition: all 0.3s;
  background: #fafafa;
  text-align: center;
  box-sizing: border-box;
  color: #111;
  height: 32px;
  min-height: unset;
}
.search-box input:focus {
  outline: none;
  border-color: #111;
  box-shadow: 0 0 0 2px #2222;
}
.search-box input::placeholder {
  color: #aaa;
  font-size: 0.98rem;
  letter-spacing: 0.5px;
  text-align: center;
}
.category-box {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category-item {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #222;
  background: #f5f5f5;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
}
.category-item.active, .category-item:hover {
  background: #222;
  color: #fff;
  border: 1px solid #222;
}
.cat-count {
  font-size: 0.98em;
  color: #aaa;
  margin-left: 6px;
}
.content-area {
  flex: 1;
  color: #222;
}

.post-title {
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111;
  text-decoration: none;
  display: block;
  transition: color 0.2s;
}
.post-title:hover {
  color: #222;
  text-decoration: underline;
}
.post-date {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 12px;
}

.post-content {
  color: #444;
  font-size: 1rem;
  line-height: 1.6;
}

.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: #111;
  font-weight: 600;
}

.post-content h1 { font-size: 1.3rem; }
.post-content h2 { font-size: 1.2rem; }
.post-content h3 { font-size: 1.1rem; }
.post-content h4 { font-size: 1rem; }
.post-content h5 { font-size: 0.9rem; }
.post-content h6 { font-size: 0.8rem; }

.post-content p {
  margin-bottom: 12px;
}

.post-content code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #c7254e;
}

.post-content pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #333;
}

.post-content pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: 0.85rem;
  line-height: 1.4;
}

.post-content ul, .post-content ol {
  margin: 12px 0;
  padding-left: 20px;
}

.post-content li {
  margin-bottom: 6px;
}

.post-content blockquote {
  border-left: 3px solid #ddd;
  padding-left: 12px;
  margin: 12px 0;
  color: #666;
  font-style: italic;
}
.post-summary {
  color: #444;
  font-size: 1.02rem;
  line-height: 1.7;
}
.empty-tip {
  color: #aaa;
  text-align: center;
  margin-top: 40px;
  font-size: 1.1rem;
}
.welcome-tip {
  color: #aaa;
  text-align: center;
  margin-top: 80px;
  font-size: 1.2rem;
  letter-spacing: 1px;
}
.post-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #222;
}
.post-title {
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111;
  text-decoration: none;
  display: block;
  transition: color 0.2s;
}
.post-content {
  flex: 1;
  color: #444;
  font-size: 1.02rem;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .home-layout {
    flex-direction: column;
    gap: 14px;
    padding: 14px 2vw 0 2vw;
  }
  .sidebar {
    width: 100%;
    min-height: unset;
    padding: 12px 6px 8px 6px;
  }
  .content-area {
    gap: 10px;
  }
}
.clickable {
  cursor: pointer;
  color: #111;
  text-decoration: underline;
  transition: color 0.2s;
}
.clickable:hover {
  color: #c7254e;
}



.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 16px 18px;
  transition: box-shadow 0.18s, transform 0.15s, border 0.18s;
  border: 1px solid #e5e5e5;
  cursor: pointer;
  color: #222;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  border: 1px solid #222;
  transform: translateY(-2px);
}

.article-panel {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 24px;
  border: 1.5px solid #e5e5e5;
}

.post-content {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 24px;
  border: 1.5px solid #e5e5e5;
}

.post-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}





.post-header .post-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #111;
}

.post-header .post-date {
  font-size: 0.95rem;
  color: #888;
  margin: 0;
}

.post-body {
  line-height: 1.8;
  color: #2c3e50;
  font-size: 1.05rem;
  font-family: 'PT Sans', 'Helvetica Neue', Arial, sans-serif;
}

.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6 {
  margin-top: 32px;
  margin-bottom: 16px;
  color: #1a202c;
  font-weight: 700;
  line-height: 1.3;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.post-body h1 { 
  font-size: 1.8rem; 
  color: #1a202c;
  border-bottom: 3px solid #4299e1;
}
.post-body h2 { 
  font-size: 1.6rem; 
  color: #2d3748;
}
.post-body h3 { 
  font-size: 1.4rem; 
  color: #4a5568;
}
.post-body h4 { 
  font-size: 1.2rem; 
  color: #718096;
}
.post-body h5 { 
  font-size: 1.1rem; 
  color: #a0aec0;
}
.post-body h6 { 
  font-size: 1rem; 
  color: #cbd5e0;
}

.post-body p {
  margin-bottom: 20px;
  color: #2d3748;
  line-height: 1.8;
}

.post-body strong {
  color: #1a202c;
  font-weight: 700;
}

.post-body em {
  color: #4a5568;
  font-style: italic;
}

.post-body code {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
  color: #d73a49;
  border: 1px solid #e1e4e8;
}

.post-body pre {
  background: #000000;
  color: #ffffff;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #333333;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
  line-height: 1.45;
  position: relative;
}

.post-body pre::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, #333333 0%, #ffffff 50%, #333333 100%);
}

.post-body pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  border: none;
  font-weight: normal;
}

/* 纯黑底主题的语法高亮颜色 */
.post-body .hljs-keyword {
  color: #ff6b6b;
}

.post-body .hljs-string {
  color: #74b9ff;
}

.post-body .hljs-comment {
  color: #636e72;
  font-style: italic;
}

.post-body .hljs-number {
  color: #fd79a8;
}

.post-body .hljs-function {
  color: #a29bfe;
}

.post-body .hljs-title {
  color: #a29bfe;
}

.post-body .hljs-params {
  color: #ffffff;
}

.post-body .hljs-built_in {
  color: #fdcb6e;
}

.post-body .hljs-literal {
  color: #fd79a8;
}

.post-body .hljs-type {
  color: #ff6b6b;
}

.post-body .hljs-attr {
  color: #fd79a8;
}

.post-body .hljs-tag {
  color: #00b894;
}

.post-body .hljs-name {
  color: #00b894;
}

.post-body .hljs-attribute {
  color: #fd79a8;
}

.post-body .hljs-value {
  color: #74b9ff;
}

.post-body ul, .post-body ol {
  margin: 20px 0;
  padding-left: 28px;
  color: #2d3748;
}

.post-body li {
  margin-bottom: 10px;
  line-height: 1.7;
}

.post-body ul li {
  list-style-type: disc;
  color: #4a5568;
}

.post-body ol li {
  list-style-type: decimal;
  color: #4a5568;
}

.post-body blockquote {
  border-left: 4px solid #4299e1;
  padding: 16px 20px;
  margin: 24px 0;
  background: #f7fafc;
  border-radius: 0 8px 8px 0;
  color: #4a5568;
  font-style: italic;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-body blockquote p {
  margin: 0;
  color: #4a5568;
}

.post-body a {
  color: #3182ce;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.post-body a:hover {
  color: #2c5282;
  border-bottom-color: #2c5282;
}

.post-body hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0 0%, #4299e1 50%, #e2e8f0 100%);
  margin: 32px 0;
  border-radius: 1px;
}

.post-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-body th, .post-body td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.post-body th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.post-body td {
  color: #4a5568;
}
</style>
