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
        <!-- 뒤로가기 (hideHeaderBack이 true가 아닐 때만 표시) -->
        <button
          v-if="route.meta.back && route.meta.hideHeaderBack !== true"
          class="icon-btn mr-2"
          @click="goBack"
          aria-label="이전 페이지로 이동"
        >
          <i class="btn-back bi bi-arrow-left" aria-hidden="true"></i>
        </button>

        <!-- 검색 버튼 (hideHeaderBack이 true이거나 back이 false일 때) -->
        <button
          v-else-if="route.meta.showSearch !== false"
          class="icon-btn mr-2"
          @click="router.push('/search')"
          aria-label="검색"
        >
          <i class="bi bi-search" aria-hidden="true"></i>
        </button>

        <!-- 자리가 비었을 때 간격 유지 -->
        <div v-else class="w-6"></div>
      </div>

      <!-- 중앙: 로고 -->
      <h1 
        class="top-logo"
        @click="goHome"
        role="button"
        tabindex="0"
        aria-label="홈으로 이동"
        @keydown.enter="goHome"
        @keydown.space.prevent="goHome"
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
          :aria-label="unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '알림'"
        >
          <i class="bi bi-bell" aria-hidden="true"></i>

          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full"
            aria-hidden="true"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- 메뉴 버튼 -->
        <button
          v-if="route.meta.menu !== false"
          class="icon-btn"
          @click="$emit('open-menu')"
          aria-label="메뉴 열기"
        >
          <i class="btn-menu bi bi-list" aria-hidden="true"></i>
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