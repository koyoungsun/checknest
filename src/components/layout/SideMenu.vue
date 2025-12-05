<template>
    <div>
      <!-- 오버레이 -->
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-40"
        @click="$emit('close')"
      ></div>
  
      <!-- 사이드 메뉴 -->
      <aside
        v-if="open"
        class="fixed top-0 left-0 h-full w-[75vw] max-w-[300px] bg-white z-50 shadow-xl flex flex-col"
      >
        <div class="p-5 border-b bg-gray-50">
          <h1 class="font-bold text-xl text-blue-600">CheckNest</h1>
          <p class="text-xs text-gray-500 mt-1">생활형 체크·템플릿 서비스</p>
        </div>
  
        <nav class="p-4 space-y-4">
          <router-link to="/" class="block text-lg">홈</router-link>
          <router-link to="/templates" class="block text-lg">템플릿</router-link>
          <router-link to="/checklists" class="block text-lg">리스트</router-link>
          <router-link to="/notifications" class="block text-lg">알림</router-link>
        </nav>
      </aside>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    open: boolean;
  }>();
  
  defineEmits(["close"]);
  </script>