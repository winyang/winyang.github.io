<template>
  <div class="main-container">
    <div class="home-layout">
        <aside class="sidebar">
        <div class="search-box">
          <input v-model="search" type="text" placeholder="Search..." />
        </div>
        <CategoryBox 
          :categories="categories" 
          :selectedCategory="selectedCategory" 
          :categoryCount="categoryCount"
          @select="selectCategory"
        />
      </aside>
      <div class="content-area">
        <div v-if="!selectedPost" class="posts-area">
          <div class="posts-scroll-wrapper">
            <PostsGrid :posts="filteredPosts" @select="selectPost" />
          </div>
        </div>
        <div v-else class="article-panel">
          <PostDetail :post="selectedPostDetail" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PostsGrid from '@/components/PostsGrid/index.vue'
import PostDetail from '@/components/PostDetail/index.vue'
import CategoryBox from '@/components/CategoryBox/index.vue'
import { useHome } from './logic.js'
import './module.css'

const {
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
} = useHome()
</script> 