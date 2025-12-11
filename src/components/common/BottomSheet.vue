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
            <button class="btm-sht-close-btn" @click.stop="close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
    
          <!-- 메뉴 버튼 목록 -->
          <div class="w-full flex flex-col items-center btm-sht-buttons">
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('checklist')"
            >
              <i class="bi bi-card-checklist"></i>
              체크리스트 만들기
              <i class="bi bi-chevron-right ml-auto"></i>
            </button>
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('template')"
            >
              <i class="bi bi-collection"></i>
              템플릿 만들기
              <i class="bi bi-chevron-right ml-auto"></i>
            </button>
    
            <button
              class="sheet-item btm-sheet-btn"
              @click.stop="emitCreate('post')"
            >
              <i class="bi bi-pencil-square"></i>
              게시글 쓰기
              <i class="bi bi-chevron-right ml-auto"></i>
            </button>
    
          </div>
        </div>
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