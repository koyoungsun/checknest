<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useBottomSheet } from "@/composables/useBottomSheet";

import AppHeader from "@/components/layout/AppHeader.vue";
import SlideNav from "@/components/layout/SlideNav.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import BottomSheet from "@/components/common/BottomSheet.vue";
import LoginPromptModal from "@/components/common/LoginPromptModal.vue";
import GlobalLoading from "@/components/common/GlobalLoading.vue";

const route = useRoute();
const {
  isOpen: sheetOpen,
  showLoginPrompt,
  open: openSheet,
  close: closeSheet,
  closeLoginPrompt,
  goToChecklistCreate,
  goToTemplateCreate,
  goToPostWrite,
} = useBottomSheet();

// 사이드 메뉴
const sideOpen = ref(false);
const openMenu = () => (sideOpen.value = true);
const closeMenu = () => (sideOpen.value = false);

// 바텀 네비 표시 여부
const showBottomNav = computed(() => route.meta.bottomNav !== false);

// 헤더 숨김 여부 (로그인, 회원가입 등에서 사용)
const hideHeader = computed(() => route.meta.hideHeader === true);
</script>

<template>
  <div class="app-wrap relative min-h-screen bg-gray-50">

    <!-- === 헤더 (숨김 옵션 적용) === -->
    <AppHeader
      v-if="!hideHeader"
      @open-menu="openMenu"
    />

    <!-- === 사이드 네비 === -->
    <SlideNav :open="sideOpen" @close="closeMenu" />

    <!-- === 페이지 콘텐츠 === -->
    <main
      class="page-content"
      :class="{
        'pt-0': hideHeader          // 로그인/회원가입 등
      }"
    >
      <router-view />
    </main>

    <!-- === 하단 네비 === -->
    <BottomNav
      v-if="showBottomNav && !hideHeader"
      @open-sheet="openSheet"
    />

    <!-- === 바텀시트 === -->
    <BottomSheet
      :open="sheetOpen"
      @close="closeSheet"
      @create-checklist="goToChecklistCreate"
      @create-template="goToTemplateCreate"
      @write-post="goToPostWrite"
    />

    <!-- === 로그인 유도 모달 === -->
    <LoginPromptModal
      :open="showLoginPrompt"
      @close="closeLoginPrompt"
    />

    <!-- === 전역 로딩 오버레이 === -->
    <GlobalLoading />
  </div>
</template>
