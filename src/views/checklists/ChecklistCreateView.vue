<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
    
    <!-- 리스트 전체 -->
    <main class="flex-1 overflow-y-auto space-y-8 pb-16 content-wrapper">
      <!-- 체크리스트 제목 -->
      <section class="mb-4">
      <label class="block text-sm font-semibold mb-1">체크리스트 제목</label>
      <input
        v-model="title"
        type="text"
        class="input"
        placeholder="예: 오늘의 할 일"
      />
    </section>

    <!-- 설명 -->
    <section class="mb-4">
      <label class="block text-sm font-semibold mb-1">설명 (선택)</label>
      <textarea
        v-model="description"
        rows="2"
        class="input"
        placeholder="체크리스트에 대한 설명을 적어주세요."
      ></textarea>
    </section>

    <!-- 마감일 -->
    <section class="mb-4">
      <label class="block text-sm font-semibold mb-1">마감일 (선택)</label>
      <div class="date-input-wrapper">
        <i class="bi bi-calendar3 date-icon"></i>
        <VueDatePicker
          v-model="dueDate"
          :enable-time-picker="false"
          :format="'yyyy-MM-dd'"
          :locale="ko"
          placeholder="마감일을 선택하세요"
          class="date-picker"
          :teleport="true"
        />
      </div>
    </section>

    <!-- 버튼 -->
    <section class="button-group">
      <button class="btn-primary" @click="save">
        체크리스트 생성
      </button>
      <button class="btn-secondary" @click="cancel">
        취소
      </button>
    </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useChecklists } from "@/composables/useChecklists";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import { ko } from "date-fns/locale";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import "@vuepic/vue-datepicker/dist/main.css";

const router = useRouter();
const { addChecklist } = useChecklists();

const title = ref("");
const description = ref("");
const dueDate = ref<Date | null>(null);

const save = async () => {
  if (!title.value.trim()) {
    alert("체크리스트 제목을 입력해주세요.");
    return;
  }

  try {
    await addChecklist({
      title: title.value,
      description: description.value,
      dueDate: dueDate.value,
    });
    
    router.push("/lists");
  } catch (error) {
    console.error("체크리스트 생성 실패:", error);
    alert("체크리스트 생성에 실패했습니다.");
  }
};

const cancel = () => {
  router.back();
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}
.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb20;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
  font-size: 1rem;
  pointer-events: none;
  z-index: 2;
}

.date-picker {
  width: 100%;
}

/* DatePicker 입력 필드 스타일 */
.date-picker :deep(.dp__input_wrap) {
  width: 100%;
}

.date-picker :deep(.dp__input) {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  cursor: pointer;
}

.date-picker :deep(.dp__input:focus) {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb20;
}

.date-picker :deep(.dp__input_icon) {
  display: none; /* 기본 아이콘 숨김 (우리가 추가한 아이콘 사용) */
}

.button-group {
  display: flex;
  gap: 4px;
  margin-top: 24px;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
  height: 50px;
  width: 50%;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  height: 50px;
  width: 50%;
  border-radius: 10px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}
</style>
