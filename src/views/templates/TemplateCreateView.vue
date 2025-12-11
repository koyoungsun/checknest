<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageSubtitle />
    <div class="px-4 py-4 content-wrapper">
      <!-- 템플릿 이름 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">템플릿 이름</label>
        <input
          v-model="title"
          type="text"
          class="input"
          placeholder="예: 여행 준비 템플릿"
        />
      </section>

      <!-- 카테고리 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">카테고리</label>
        <select v-model="category" class="input">
          <option value="생활">생활</option>
          <option value="여행">여행</option>
          <option value="쇼핑">쇼핑</option>
          <option value="업무">업무</option>
          <option value="기타">기타</option>
        </select>
      </section>

      <!-- 설명 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">설명 (선택)</label>
        <textarea
          v-model="description"
          rows="2"
          class="input"
          placeholder="템플릿에 대한 설명을 적어주세요."
        ></textarea>
      </section>

      <!-- 기본 항목 -->
      <section class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-semibold">기본 체크 항목</label>
          <button class="text-xs text-blue-600" @click="addItem">
            + 항목 추가
          </button>
        </div>

        <div v-if="items.length === 0" class="text-xs text-gray-400">
          항목을 추가하면 이 템플릿으로 리스트를 만들 때 자동으로 포함됩니다.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="flex items-center gap-2"
          >
            <input
              v-model="item.text"
              type="text"
              class="input flex-1"
              :placeholder="`항목 ${idx + 1}`"
            />
            <button class="text-xs text-red-500" @click="removeItem(idx)">
              삭제
            </button>
          </div>
        </div>
      </section>

      <!-- 버튼 -->
      <section class="button-group">
        <button class="btn-primary" @click="save">
          템플릿 생성
        </button>
        <button class="btn-secondary" @click="cancel">
          취소
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTemplates } from "@/composables/useTemplates";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { addTemplate } = useTemplates();

const title = ref("");
const category = ref("생활");
const description = ref("");
const items = ref<{ text: string }[]>([]);

const addItem = () => {
  items.value.push({ text: "" });
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const save = async () => {
  if (!title.value.trim()) {
    alert("템플릿 이름을 입력해주세요.");
    return;
  }

  try {
    await addTemplate({
      title: title.value,
      category: category.value,
      description: description.value,
      items: items.value
        .filter((item) => item.text.trim())
        .map((item, index) => ({
          name: item.text.trim(),
          order: index + 1,
        })),
    });

    router.push("/templates");
  } catch (error) {
    console.error("템플릿 생성 실패:", error);
    alert("템플릿 생성에 실패했습니다.");
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

.button-group {
  display: flex;
  gap: 4px;
  margin-top: 24px;
}

.btn-primary {
  background: #2563eb;
  color: white;
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
