<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useNotifications } from "@/composables/useNotifications";

const route = useRoute();
const router = useRouter();
const { unreadCount } = useNotifications();

// 뒤로가기
const goBack = () => router.back();

// 홈 이동
const goHome = () => router.push("/");
</script>

<template>
  <!-- ========================= -->
  <!--       전체 헤더 래퍼       -->
  <!-- ========================= -->
  <header class="bg-white border-b shadow-sm app-header">

    <!-- ========================= -->
    <!--        1층: 글로벌 헤더       -->
    <!-- ========================= -->
    <div class="top-area">

      <!-- 좌측: 검색 또는 뒤로가기 -->
      <div class="btn-l">
        <!-- 뒤로가기 -->
        <button
          v-if="route.meta.back"
          class="icon-btn mr-2"
          @click="goBack"
        >
          <i class="btn-back bi bi-arrow-left text-lg"></i>
        </button>

        <!-- 검색 버튼 -->
        <button
          v-else-if="route.meta.showSearch !== false"
          class="icon-btn mr-2"
          @click="router.push('/search')"
        >
          <i class="bi bi-search text-lg"></i>
        </button>

        <!-- 자리가 비었을 때 간격 유지 -->
        <div v-else class="w-6"></div>
      </div>

      <!-- 중앙: 로고 -->
      <h1 
        class="top-logo"
        @click="goHome"
      >
        CHECK<span>NEST</span>
      </h1>

      <!-- 우측: 알림 + 메뉴 -->
      <div class="btn-r">

        <!-- 알림 -->
        <button
          v-if="route.meta.showNotification !== false"
          class="icon-btn relative ico-alarm"
          @click="router.push('/notifications')"
        >
          <i class="bi bi-bell text-lg"></i>

          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- 메뉴 버튼 -->
        <button
          v-if="route.meta.menu !== false"
          class="icon-btn"
          @click="$emit('open-menu')"
        >
          <i class="btn-menu bi bi-list text-xl"></i>
        </button>

      </div>
    </div>

  </header>
</template>

<style scoped>
.icon-btn {
  padding: 6px;
}
</style>