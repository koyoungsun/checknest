<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useNotifications } from "../../composables/useNotifications";

const route = useRoute();
const router = useRouter();

// 전역 알림 카운트
const { unreadCount } = useNotifications();

const goBack = () => router.back();
</script>

<template>
  <header class="app-header flex items-center justify-between h-14 px-4 border-b bg-white">

    <!-- 🔹 왼쪽 영역 -->
    <div class="flex items-center">
      <!-- 뒤로가기 버튼 -->
      <button
        v-if="route.meta.back"
        class="icon-btn mr-2"
        @click="goBack"
      >
        <i class="bi bi-arrow-left text-lg"></i>
      </button>

      <!-- 왼쪽에 아무것도 없을 때 공간 유지 -->
      <div v-else class="w-6"></div>
    </div>

    <!-- 🔹 중앙 타이틀 -->
    <h1 class="font-semibold text-base truncate max-w-[140px] text-center">
      {{ route.meta.title || "CHECKNEST" }}
    </h1>

    <!-- 🔹 오른쪽 버튼 영역 -->
    <div class="flex items-center gap-1">

      <!-- 🔔 알림 버튼 (showNotification !== false 이면 기본 표시) -->
      <button
        v-if="route.meta.showNotification !== false"
        class="icon-btn relative ico-alarm"
        @click="router.push('/notifications')"
      >
        <i class="bi bi-bell text-lg"></i>

        <!-- 알림 카운트 배지 -->
        <span v-if="unreadCount > 0" class="count" >
          {{ unreadCount }}
        </span>
      </button>

      <!-- 검색 버튼 (showSearch = false면 숨김) -->
      <button
        v-if="route.meta.showSearch !== false"
        class="icon-btn"
        @click="router.push('/search')"
      >
        <i class="bi bi-search text-lg"></i>
      </button>

      <!-- 메뉴 버튼 (menu = false면 숨김) -->
      <button
        v-if="route.meta.menu !== false"
        class="icon-btn"
        @click="$emit('open-menu')"
      >
        <i class="bi bi-list text-lg"></i>
      </button>

    </div>

  </header>
</template>

<style scoped>
.icon-btn {
  padding: 6px;
}
</style>