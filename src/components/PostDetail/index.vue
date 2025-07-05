<template>
  <div class="post-detail" v-if="post">
    <h1 class="post-title">{{ post.title }}</h1>
    <div class="post-date">{{ post.date }}</div>
    <div class="post-content markdown-body" v-html="post.html"></div>
  </div>
  <div v-else class="empty-tip">请选择一篇文章</div>
</template>

<script setup>
import { usePostDetail } from './logic.js'
import './module.css'
const { post } = defineProps(['post'])
usePostDetail()
</script> 