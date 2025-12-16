  <template>
    <!-- 오버레이 -->
    <transition name="fade-dimd">
      <div
        v-if="open"
        class="dimd"
        @click="close"
      ></div>
    </transition>
  
    <!-- 바텀시트 -->
    <transition name="fade">
      <div
        v-if="open"
        class="btm-sht fixed inset-0 flex items-center justify-center z-50"
        @click.stop="close"
      >
        <div
          class="btm-sht-content bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center"
          @click.stop
        >
          <!-- 헤더: 타이틀과 닫기 버튼 -->
          <div class="btm-sht-header">
            <h2 class="btm-sht-title">무엇을 만들까요?</h2>
            <button class="btm-sht-close-btn" @click.stop="close" aria-label="닫기">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>
    
          <!-- 메뉴 버튼 목록 -->
          <div class="w-full flex flex-col items-center btm-sht-buttons">
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('checklist')"
              aria-label="체크리스트 만들기"
            >
              <i class="bi bi-card-checklist" aria-hidden="true"></i>
              체크리스트 만들기
              <i class="bi bi-chevron-right ml-auto" aria-hidden="true"></i>
            </button>
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('template')"
              aria-label="템플릿 만들기"
            >
              <i class="bi bi-collection" aria-hidden="true"></i>
              템플릿 만들기
              <i class="bi bi-chevron-right ml-auto" aria-hidden="true"></i>
            </button>
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('post')"
              aria-label="게시글 쓰기"
            >
              <i class="bi bi-pencil-square" aria-hidden="true"></i>
              게시글 쓰기
              <i class="bi bi-chevron-right ml-auto" aria-hidden="true"></i>
            </button>
    
          </div>
        </div>
      </div>
    </transition>
  </template>
  
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits(["close", "create-checklist", "create-template", "write-post"]);
  
const close = () => emit("close");

// ESC 키로 닫기
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) {
    close();
  }
};

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleEscape);
  } else {
    window.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});
  
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