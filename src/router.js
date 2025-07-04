import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Archive from './pages/Archive.vue'
import Post from './pages/Post.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/archives', component: Archive },
  { path: '/post/:category/:id', component: Post },
  { path: '/post/:id', component: Post },
  { path: '/:pathMatch(.*)*', component: () => import('./components/NotFound.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
}) 