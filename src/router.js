import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home/index.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: () => import('./components/NotFound.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
}) 