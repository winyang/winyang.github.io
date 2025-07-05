<template>
  <div class="pagination-wrapper">
    <div class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePagination } from './logic.js'
import './module.css'
const { currentPage, totalPages } = defineProps(['currentPage', 'totalPages'])
const emit = defineEmits(['update:currentPage'])
usePagination()
</script> 