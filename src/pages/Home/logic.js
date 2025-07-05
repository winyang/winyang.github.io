import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export function useHome() {
  const modules = import.meta.glob('@/posts/*/*.md', { query: '?raw', import: 'default', eager: true })
  const posts = ref([])
  const categories = ref([])
  const selectedCategory = ref('')
  const search = ref('')
  const categoryCount = ref({})
  const selectedPost = ref(null)
  const selectedPostDetail = ref(null)
  const currentPage = ref(1)
  const pageSize = 12

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
    selectedPost.value = null
    selectedPostDetail.value = null
    currentPage.value = 1
  }

  function selectPost(post) {
    selectedPost.value = post
    const postPath = `/src/posts/${post.category}/${post.id}.md`
    if (modules[postPath]) {
      const content = modules[postPath]
      const contentWithoutTitle = content.replace(/^# .+$/m, '')
      const html = marked(contentWithoutTitle)
      selectedPostDetail.value = {
        ...post,
        html
      }
      setTimeout(() => {
        const codeBlocks = document.querySelectorAll('.post-body pre code, .markdown-body pre code')
        codeBlocks.forEach(block => {
          block.removeAttribute('data-highlighted')
          block.className = block.className.replace(/hljs language-\w+/, '')
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

  const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filteredPosts.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredPosts.value.length / pageSize)
  })

  watch(categories, (newCats) => {
    if (!selectedCategory.value && newCats.length > 0) {
      selectedCategory.value = newCats[0]
    }
  })

  watch(search, () => {
    currentPage.value = 1
  })

  marked.setOptions({
    highlight: function(code, lang) {
      const cleanCode = code.trim()
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(cleanCode, { language: lang }).value
        } catch (e) {
          return hljs.escape(cleanCode)
        }
      }
      try {
        const result = hljs.highlightAuto(cleanCode)
        return result.value
      } catch (e) {
        return hljs.escape(cleanCode)
      }
    }
  })

  return {
    posts,
    categories,
    selectedCategory,
    search,
    categoryCount,
    selectedPost,
    selectedPostDetail,
    currentPage,
    pageSize,
    selectCategory,
    selectPost,
    filteredPosts,
    paginatedPosts,
    totalPages
  }
} 