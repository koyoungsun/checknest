<template>
  <header class="app-header">
    
    <!-- 왼쪽: 메뉴 버튼 -->
    <button class="icon-btn" @click="onMenuClick" aria-label="Open Menu">
      <i class="bi bi-list"></i>
    </button>

    <!-- 가운데 타이틀 -->
    <h1 class="title">CheckNest</h1>

    <!-- 오른쪽: 검색 버튼 -->
    <button class="icon-btn" @click="onSearch" aria-label="Search">
      <i class="bi bi-search"></i>
    </button>

  </header>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["open-menu"]);

// 메뉴 클릭 핸들러
const onMenuClick = () => {
  console.log("HEADER CLICK");
  emit("open-menu");
};

// 검색 페이지 이동
const onSearch = () => {
  router.push("/search");
};
</script>

<style scoped>
</style>