<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import AppHeader from "@/components/layout/AppHeader.vue";
import SlideNav from "@/components/layout/SlideNav.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import BottomSheet from "@/components/common/BottomSheet.vue"; // ⭐ 추가됨

// ===== 상태 =====
const sideOpen = ref(false);
const sheetOpen = ref(false); // ⭐ 바텀시트 상태 추가

const openMenu = () => (sideOpen.value = true);
const closeMenu = () => (sideOpen.value = false);

const openSheet = () => (sheetOpen.value = true);
const closeSheet = () => (sheetOpen.value = false);

const router = useRouter();
const route = useRoute();

// ===== 바텀시트 액션 =====
const goCreateChecklist = () => {
  sheetOpen.value = false;
  router.push("/checklists/create");
};

const goCreateTemplate = () => {
  sheetOpen.value = false;
  router.push("/templates/create");
};

const goWritePost = () => {
  sheetOpen.value = false;
  router.push("/posts/write");
};

// ===== 하단 네비/헤더 표시 제어 =====
const showBottomNav = computed(() => route.meta.bottomNav !== false);
</script>


<template>
  <div class="app-wrap relative min-h-screen bg-gray-50">

    <!-- ===== 상단 헤더 ===== -->
    <AppHeader
      :showBack="route.meta.showBack === true"
      @open-menu="openMenu"
    />

    <!-- ===== 사이드 네비 ===== -->
    <SlideNav :open="sideOpen" @close="closeMenu" />

    <!-- ===== 페이지 콘텐츠 ===== -->
    <main class="page-content pt-[56px] pb-[70px]">
      <router-view />
    </main>

    <!-- ===== 하단 네비 + 바텀시트 ===== -->
    <BottomNav
      v-if="showBottomNav"
      @open-sheet="openSheet"
    />

    <BottomSheet
      :open="sheetOpen"
      @close="closeSheet"
      @create-checklist="goCreateChecklist"
      @create-template="goCreateTemplate"
      @write-post="goWritePost"
    />

  </div>
</template>


<style scoped>
.app-wrap {
  overflow-x: hidden;
  position: relative;
}

/* page-content 기본 여백 */
.page-content {
  min-height: calc(100vh - 56px);
  overflow-y: auto;
}
</style>