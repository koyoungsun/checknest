<template>
    <!-- 오버레이 -->
    <transition name="fade">
      <div
        v-if="open"
        class="sheet-overlay"
        @click.self="$emit('close')"
      ></div>
    </transition>
  
    <!-- 바텀시트 -->
    <transition name="slide-up">
      <div v-if="open" class="sheet-panel">
        <div class="sheet-handle"></div>
  
        <h2 class="sheet-title">무엇을 만들까요?</h2>
  
        <button class="sheet-item" @click="$emit('create-checklist')">
          <i class="bi bi-card-checklist mr-2"></i>
          체크리스트 만들기
        </button>
  
        <button class="sheet-item" @click="$emit('create-template')">
          <i class="bi bi-collection mr-2"></i>
          템플릿 만들기
        </button>
  
        <button class="sheet-item" @click="$emit('write-post')">
          <i class="bi bi-chat-dots mr-2"></i>
          게시글 작성
        </button>
  
        <button class="sheet-item text-red-500" @click="$emit('close')">
          닫기
        </button>
      </div>
    </transition>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    open: boolean;
  }>();
  
  const emit = defineEmits([
    "close",
    "create-checklist",
    "create-template",
    "write-post",
  ]);
  </script>
  
  <style scoped>
  .sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 60;
  }
  
  .sheet-panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 16px 20px 24px;
    box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.12);
    z-index: 61;
  }
  
  .sheet-handle {
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: #ddd;
    margin: 0 auto 12px;
  }
  
  .sheet-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .sheet-item {
    width: 100%;
    text-align: left;
    padding: 12px 4px;
    font-size: 14px;
    border-bottom: 1px solid #f3f3f3;
    display: flex;
    align-items: center;
  }
  
  .sheet-item:last-child {
    border-bottom: none;
  }
  
  /* 트랜지션 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.22s ease;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(100%);
  }
  </style>