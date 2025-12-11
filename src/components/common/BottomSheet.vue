<template>
    <!-- 오버레이 -->
    <div
      v-if="open"
      class="dimd"
      @click="close"
    ></div>
  
    <!-- 바텀시트 -->
    <transition name="slide-up">
      <div
        v-if="open"
        class="btm-sht fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl z-50 p-6 flex flex-col items-center"
        @click.stop
      >
        <h2 class="text-lg font-semibold mb-4 text-center">무엇을 만들까요?</h2>
  
        <!-- 메뉴 버튼 목록 -->
        <div class="space-y-3 w-full flex flex-col items-center">
  
          <button
            class="sheet-item btm-sheet-btn"
            @click.stop="emitCreate('checklist')"
          >
            <i class="bi bi-card-checklist text-blue-600"></i>
            체크리스트 만들기
            <i class="bi bi-chevron-right ml-auto"></i>
          </button>
  
          <button
            class="sheet-item btm-sheet-btn"
            @click.stop="emitCreate('template')"
          >
            <i class="bi bi-collection text-purple-600"></i>
            템플릿 만들기
            <i class="bi bi-chevron-right ml-auto"></i>
          </button>
  
          <button
            class="sheet-item btm-sheet-btn"
            @click.stop="emitCreate('post')"
          >
            <i class="bi bi-pencil-square text-green-600"></i>
            게시글 쓰기
            <i class="bi bi-chevron-right ml-auto"></i>
          </button>
  
        </div>
  
        <!-- 닫기 버튼 -->
        <button class="mt-6 w-full py-3 bg-gray-100 rounded-xl text-center btm-sheet-btn" @click.stop="close">
          닫기
        </button>
      </div>
    </transition>
  </template>
  
<script setup lang="ts">
defineProps<{ open: boolean }>();
const emit = defineEmits(["close", "create-checklist", "create-template", "write-post"]);
  
const close = () => emit("close");
  
const emitCreate = (type: string) => {
  console.log("BottomSheet emitCreate called:", type);
  switch (type) {
    case "checklist":
      console.log("Emitting create-checklist");
      emit("create-checklist");
      break;
    case "template":
      console.log("Emitting create-template");
      emit("create-template");
      break;
    case "post":
      console.log("Emitting write-post");
      emit("write-post");
      break;
  }
  emit("close");
};
</script>
  
  <style scoped>
  </style>