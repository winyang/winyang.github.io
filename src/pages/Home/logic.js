import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export function useHome() {
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
    let arr = []
    try {
      const res = await fetch('/posts.index.json')
      if (res.ok) {
        arr = await res.json()
      }
    } catch (e) {}
    const countMap = {}
    arr.forEach(post => {
      countMap[post.category] = (countMap[post.category] || 0) + 1
    })
    const allCats = Array.from(new Set(arr.map(post => post.category)))
    categories.value = allCats
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
    search.value = ''
  }

  async function selectPost(post) {
    selectedPost.value = post
    // 动态 fetch 资源
    let mdPath = `/posts/${post.path.replace(/^posts\//, '')}`
    try {
      const res = await fetch(mdPath)
      if (res.ok) {
        let md = await res.text()
        // 提取标题
        const match = md.match(/^#\s+(.+)/)
        const title = match ? match[1] : '文章详情'
        if (match) {
          md = md.replace(/^#\s+(.+)\n?/, '')
        }
        const html = marked(md)
        selectedPostDetail.value = {
          ...post,
          title,
          html,
          date: post.date
        }
        setTimeout(() => {
          const codeBlocks = document.querySelectorAll('.post-body pre code, .markdown-body pre code')
          codeBlocks.forEach(block => {
            block.removeAttribute('data-highlighted')
            block.className = block.className.replace(/hljs language-\w+/, '')
            hljs.highlightElement(block)
          })
        }, 0)
      } else {
        selectedPostDetail.value = { ...post, title: '404 Not Found', html: '<p>文章未找到</p>' }
      }
    } catch (e) {
      selectedPostDetail.value = { ...post, title: '404 Not Found', html: '<p>文章未找到</p>' }
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