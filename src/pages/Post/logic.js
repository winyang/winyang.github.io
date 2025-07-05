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

  const posts = ref([])
  const categories = ref([])
  const selectedCategory = ref('')
  const search = ref('')
  const categoryCount = ref({})

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
    let postMeta = null
    if (category && id) {
      postMeta = posts.value.find(p => p.category === category && p.id === id)
    } else if (id) {
      postMeta = posts.value.find(p => p.id === id)
    }
    if (!postMeta) {
      content.value = '<p>文章未找到</p>'
      title.value = '404 Not Found'
      return
    }
    let mdPath = `/posts/${postMeta.path.replace(/^posts\//, '')}`
    try {
      const res = await fetch(mdPath)
      if (res.ok) {
        let md = await res.text()
        const match = md.match(/^#\s+(.+)/)
        title.value = match ? match[1] : postMeta.title
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