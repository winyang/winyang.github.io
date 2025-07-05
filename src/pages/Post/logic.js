import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export function usePostPage() {
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

  return {
    search,
    categories,
    selectedCategory,
    categoryCount,
    filteredPosts,
    selectCategory,
    goToPost,
    route,
    title,
    content
  }
} 