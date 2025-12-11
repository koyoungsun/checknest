<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item">
      <i class="bi bi-house"></i>
      <span>홈</span>
    </router-link>

    <router-link to="/lists" class="nav-item">
      <i class="bi bi-card-checklist"></i>
      <span>리스트</span>
    </router-link>

    <!-- 중앙 플러스 버튼 -->
    <button class="fab-button" @click="handleFabClick">
      <i class="bi bi-plus-lg"></i>
    </button>

    <router-link to="/templates" class="nav-item">
      <i class="bi bi-collection"></i>
      <span>템플릿</span>
    </router-link>

    <router-link to="/posts" class="nav-item">
      <i class="bi bi-chat-square-text"></i>
      <span>게시글</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
const emit = defineEmits(["open-sheet"]);

const handleFabClick = () => {
  console.log("FAB button clicked");
  emit("open-sheet");
};
</script>

<style scoped>
.bottom-nav {
  @apply fixed bottom-0 left-0 w-full z-30 h-[60px] flex justify-around items-center;
  background-color: var(--color-primary);
  border: 0;
  border-radius: 2px;
}

.nav-item {
  @apply flex flex-col items-center text-xs;
  color: #fff;
  
  i {
    color: #fff;
  }
  
  span {
    color: #fff;
  }
}

.fab-button {
  @apply w-14 h-14 flex items-center justify-center shadow-lg -mt-8;
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 2px;
  padding: 4px;
  color: #fff;
  
  i {
    color: #fff;
  }
}
</style>