<template>
  <div>
    <h1>归档</h1>
    <div v-for="(group, year) in archives" :key="year">
      <h2>{{ year }}</h2>
      <ul>
        <li v-for="post in group" :key="post.id">
          <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const archives = ref({
  '2023': [
    { id: '2023-01-01-hello', title: '你好，世界' },
    { id: '2023-02-15-vue', title: 'Vue3 博客重构' }
  ],
  '2022': [
    { id: '2022-12-10-old', title: '旧文章示例' }
  ]
})
</script> 