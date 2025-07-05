<template>
  <div class="posts-list">
    <div class="posts-grid">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card clickable"
        @click="$emit('select', post)"
      >
        <div class="post-card-date"><span class="post-date">{{ post.date }}</span></div>
        <div class="post-card-title"><span class="post-title">{{ post.title.length > 10 ? post.title.slice(0, 10) + '…' : post.title }}</span></div>
      </div>
    </div>
    <div v-if="posts.length === 0" class="empty-tip">暂无文章</div>
  </div>
</template>

<script setup>
import { usePostsGrid } from './logic.js'
import './module.css'
const { posts } = defineProps(['posts'])
const emit = defineEmits(['select'])
usePostsGrid()
</script> 