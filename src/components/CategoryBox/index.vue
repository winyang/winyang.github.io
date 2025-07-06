<template>
  <div class="category-box">
    <div
      v-for="cat in categories"
      :key="cat"
      :class="['category-item', { active: cat === selectedCategory }]"
      @click="$emit('select', cat)"
    >
      {{ cat }} <span class="cat-count">({{ categoryCount[cat] || 0 }})</span>
    </div>
  </div>
</template>

<script setup>
import { useCategoryBox } from './logic.js'
import './module.css'

const { categories, selectedCategory, categoryCount } = defineProps(['categories', 'selectedCategory', 'categoryCount'])
const emit = defineEmits(['select'])

useCategoryBox()
</script> 