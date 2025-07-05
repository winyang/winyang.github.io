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
import { usePostPage } from './logic.js'
import './module.css'
const {
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
} = usePostPage()
</script> 