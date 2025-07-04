<template>
  <div class="app-bg">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
.app-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7fafc 0%, #e6f7f1 100%);
  padding: 0;
}

body {
  margin: 0;
  font-family: 'PT Sans', 'Helvetica Neue', Arial, sans-serif;
  background: none;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
  background: #f0f0f0;
}
::-webkit-scrollbar-thumb {
  background: #c2e7db;
  border-radius: 6px;
}

/* 内容区卡片阴影和圆角（可配合子组件） */
.main, .sidebar, .post-card {
  box-shadow: 0 4px 24px rgba(66,185,131,0.08);
  border-radius: 16px;
}
</style> 