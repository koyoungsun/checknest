<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 레이아웃 컴포넌트
import AppHeader from "@/components/layout/AppHeader.vue";
import SlideNav from "@/components/layout/SlideNav.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import FabMenu from "@/components/common/FabMenu.vue"; // ← FAB 추가

// 사이드메뉴 열림/닫힘 상태
const sideOpen = ref(false);
const openMenu = () => (sideOpen.value = true);
const closeMenu = () => (sideOpen.value = false);

// --- FAB 제어 상태 ---
const fabOpen = ref(false);
const toggleFab = () => (fabOpen.value = !fabOpen.value);
const closeFab = () => (fabOpen.value = false);

const router = useRouter();

// 라우트 이동 시 FAB 자동 닫기
onMounted(() => {
  router.afterEach(() => {
    fabOpen.value = false;
  });
});
</script>

<template>
  <div class="app-wrap relative min-h-screen overflow-hidden">

    <!-- 상단 헤더 -->
    <AppHeader @open-menu="openMenu" />

    <!-- 사이드 네비 -->
    <SlideNav :open="sideOpen" @close="closeMenu">
      <div style="font-size:32px; color:red;">TEST SLOT</div>
    </SlideNav>

    <!-- 페이지 콘텐츠 -->
    <main class="page-content">
      <router-view />
    </main>

    <!-- 하단 네비 -->
    <BottomNav />

    <!-- ====================== -->
    <!--      FAB 플로팅 버튼    -->
    <!-- ====================== -->
    <FabMenu
      :open="fabOpen"
      @toggle="toggleFab"
      @close="closeFab"
    />
  </div>
</template>

<style scoped></style>