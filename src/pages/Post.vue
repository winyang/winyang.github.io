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
      <div class="sidebar-list">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="sidebar-post-item"
          @click="goToPost(post)"
          :title="post.title"
          :class="{ active: route.params.id === post.id }"
        >
          <span class="sidebar-post-title">{{ post.title }}</span>
          <span class="sidebar-post-date">{{ post.date }}</span>
        </div>
        <div v-if="filteredPosts.length === 0" class="empty-tip">暂无文章</div>
      </div>
    </aside>
    <main class="main">
      <div class="post-main">
        <h1 class="post-title">{{ title }}</h1>
        <div class="post-content" v-html="content"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const route = useRoute()
const router = useRouter()
const content = ref('')
const title = ref('')

// 文章列表和分类相关
const modules = import.meta.glob('./posts/*/*.md', { query: '?raw', import: 'default', eager: true })
const posts = ref([])
const categories = ref([])
const selectedCategory = ref('')
const search = ref('')
const categoryCount = ref({})

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

function selectCategory(cat) {
  selectedCategory.value = cat
}

const filteredPosts = ref([])
watch([posts, selectedCategory, search], () => {
  if (!selectedCategory.value) {
    filteredPosts.value = []
    return
  }
  let list = posts.value.filter(post => post.category === selectedCategory.value)
  if (search.value.trim()) {
    list = list.filter(post => post.title.toLowerCase().includes(search.value.trim().toLowerCase()))
  }
  filteredPosts.value = list
})

onMounted(() => {
  loadCategoriesAndPosts()
  loadPost()
})

watch(content, async () => {
  await nextTick()
  hljs.highlightAll()
})

async function loadPost() {
  const { category, id } = route.params
  let mdPath = ''
  if (category && id) {
    mdPath = `/src/posts/${category}/${id}.md`
  } else if (id) {
    mdPath = `/src/posts/${id}.md`
  }
  if (!mdPath) {
    content.value = '<p>文章未找到</p>'
    title.value = '404 Not Found'
    return
  }
  try {
    const res = await fetch(mdPath)
    if (res.ok) {
      let md = await res.text()
      const match = md.match(/^#\s+(.+)/)
      title.value = match ? match[1] : '文章详情'
      if (match) {
        md = md.replace(/^#\s+(.+)\n?/, '')
      }
      content.value = marked(md)
    } else {
      content.value = '<p>文章未找到</p>'
      title.value = '404 Not Found'
    }
  } catch (e) {
    content.value = '<p>文章未找到</p>'
    title.value = '404 Not Found'
  }
}

// 切换分类或搜索时，点击文章跳转详情
function goToPost(post) {
  router.push(`/post/${post.category}/${post.id}`)
}

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})
</script>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #222;
}
.post-main {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 38px 36px 32px 36px;
  max-width: 700px;
  width: 100%;
  margin: 0 18px;
}
.post-title {
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 28px;
  color: #111;
  text-align: center;
}
.post-content {
  color: #181818;
  font-size: 1.13rem;
  line-height: 1.85;
  word-break: break-word;
  font-family: 'PT Sans', 'Helvetica Neue', Arial, sans-serif;
}
.post-content p {
  margin: 1.1em 0;
  line-height: 1.85;
}
.post-content h2, .post-content h3, .post-content h4 {
  font-weight: 700;
  color: #111;
  margin: 2.1em 0 1em 0;
  line-height: 1.4;
}
.post-content h2 { font-size: 1.45em; border-left: 4px solid #222; padding-left: 10px; }
.post-content h3 { font-size: 1.18em; border-left: 3px solid #aaa; padding-left: 8px; }
.post-content h4 { font-size: 1.08em; border-left: 2px solid #ccc; padding-left: 7px; }
.post-content ul, .post-content ol {
  margin: 1.2em 0 1.2em 1.5em;
  padding-left: 1.2em;
}
.post-content li {
  margin: 0.4em 0;
  line-height: 1.7;
}
.post-content blockquote {
  border-left: 4px solid #222;
  background: #fafafa;
  color: #555;
  margin: 1.5em 0;
  padding: 0.8em 1.2em;
  border-radius: 8px;
  font-style: italic;
}
.post-content pre {
  background: #222;
  color: #fff;
  border-radius: 12px;
  padding: 1.1em 1.2em;
  overflow-x: auto;
  font-size: 0.98em;
  margin: 1.5em 0;
  border: 2.5px solid #222;
}
.post-content code {
  background: #f4f4f4;
  color: #c7254e;
  border-radius: 4px;
  padding: 0.18em 0.38em;
  font-size: 0.98em;
  font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', monospace;
}
.post-content pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
}
.post-content img {
  max-width: 100%;
  display: block;
  margin: 1.5em auto;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
.post-content a {
  color: #222;
  text-decoration: underline;
  transition: color 0.2s;
}
.post-content a:hover {
  color: #c7254e;
  text-decoration: underline;
}
@media (max-width: 900px) {
  .post-main {
    padding: 18px 6vw 18px 6vw;
    max-width: 98vw;
  }
  .post-layout {
    padding: 18px 0 12px 0;
  }
}
.sidebar-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 1.01rem;
  color: #222;
  background: #f5f5f5;
  transition: background 0.18s, color 0.18s;
  border: 1px solid transparent;
}
.sidebar-post-item.active, .sidebar-post-item:hover {
  background: #222;
  color: #fff;
  border: 1px solid #222;
}
.sidebar-post-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-post-date {
  font-size: 0.93em;
  color: #aaa;
  margin-left: 10px;
}
</style> 