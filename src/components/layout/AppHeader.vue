<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { onMounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useNotifications } from "@/composables/useNotifications";

const route = useRoute();
const router = useRouter();
const { currentUser } = useAuth();
const { hasUnread, checkUnreadNotifications } = useNotifications();

// 뒤로가기
const goBack = () => router.back();

// 홈 이동
const goHome = () => router.push("/");

// 읽지 않은 알람 존재 여부 확인
onMounted(() => {
  if (currentUser.value) {
    checkUnreadNotifications();
  }
});

// currentUser 변경 시 알람 확인
watch(
  () => currentUser.value,
  (user) => {
    if (user) {
      checkUnreadNotifications();
    }
  }
);
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
          v-if="route.meta.showNotification !== false && hasUnread"
          class="icon-btn relative ico-alarm"
          @click="router.push('/notifications')"
          aria-label="알림"
        >
          <i class="bi bi-bell" aria-hidden="true"></i>

          <!-- 읽지 않은 알람이 있을 때만 "N" 배지 표시 -->
          <span
            v-if="hasUnread"
            class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center"
            aria-hidden="true"
          >
            N
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