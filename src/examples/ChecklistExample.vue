<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">체크리스트 예시</h1>

    <!-- 체크리스트 목록 -->
    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">내 체크리스트</h2>
      <div v-if="loading">로딩 중...</div>
      <div v-else-if="error">{{ error.message }}</div>
      <div v-else class="space-y-2">
        <div
          v-for="checklist in myChecklists"
          :key="checklist.id"
          class="p-4 border rounded-lg cursor-pointer"
          @click="selectChecklist(checklist.id)"
        >
          <h3 class="font-semibold">{{ checklist.title }}</h3>
          <p class="text-sm text-gray-500">{{ checklist.description }}</p>
          <div class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full"
                :style="{ width: checklist.progress + '%' }"
              ></div>
            </div>
            <span class="text-xs text-gray-500">{{ checklist.progress }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 체크리스트 생성 -->
    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">새 체크리스트 만들기</h2>
      <input
        v-model="newTitle"
        type="text"
        placeholder="제목"
        class="border p-2 rounded mb-2 w-full"
      />
      <button
        @click="handleCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="loading"
      >
        생성
      </button>
    </section>

    <!-- 선택된 체크리스트 상세 -->
    <section v-if="selectedChecklistId">
      <ChecklistDetail :checklist-id="selectedChecklistId" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useChecklists } from "@/composables/useChecklists";
import ChecklistDetail from "./ChecklistDetailExample.vue";

const {
  myChecklists,
  loading,
  error,
  loadChecklists,
  addChecklist,
} = useChecklists();

const newTitle = ref("");
const selectedChecklistId = ref<string | null>(null);

onMounted(() => {
  loadChecklists();
});

const handleCreate = async () => {
  if (!newTitle.value.trim()) return;

  try {
    await addChecklist({
      title: newTitle.value,
      description: "",
    });
    newTitle.value = "";
  } catch (err) {
    console.error("생성 실패:", err);
  }
};

const selectChecklist = (id: string) => {
  selectedChecklistId.value = id;
};
</script>

