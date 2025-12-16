<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">템플릿 예시</h1>

    <!-- 템플릿 목록 -->
    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">템플릿 목록</h2>
      <div v-if="loading">로딩 중...</div>
      <div v-else-if="error">{{ error.message }}</div>
      <div v-else class="space-y-2">
        <div
          v-for="template in templates"
          :key="template.id"
          class="p-4 border rounded-lg"
        >
          <h3 class="font-semibold">{{ template.title }}</h3>
          <p class="text-sm text-gray-500">{{ template.description }}</p>
          <div class="mt-2">
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ template.category }}
            </span>
            <span class="text-xs text-gray-500 ml-2">
              항목 {{ template.items.length }}개
            </span>
          </div>
          <button
            @click="handleUseTemplate(template.id)"
            class="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm"
            :disabled="loading"
          >
            이 템플릿 사용하기
          </button>
        </div>
      </div>
    </section>

    <!-- 템플릿 생성 -->
    <section>
      <h2 class="text-lg font-semibold mb-2">새 템플릿 만들기</h2>
      <input
        v-model="newTemplate.title"
        type="text"
        placeholder="템플릿 제목"
        class="border p-2 rounded mb-2 w-full"
      />
      <input
        v-model="newTemplate.category"
        type="text"
        placeholder="카테고리"
        class="border p-2 rounded mb-2 w-full"
      />
      <div class="space-y-2 mb-2">
        <div
          v-for="(item, index) in newTemplate.items"
          :key="index"
          class="flex gap-2"
        >
          <input
            v-model="item.name"
            type="text"
            :placeholder="`항목 ${index + 1}`"
            class="border p-2 rounded flex-1"
          />
          <button
            @click="removeTemplateItem(index)"
            class="bg-red-600 text-white px-3 py-2 rounded"
          >
            삭제
          </button>
        </div>
      </div>
      <button
        @click="addTemplateItem"
        class="bg-gray-600 text-white px-4 py-2 rounded mb-2"
      >
        항목 추가
      </button>
      <br />
      <button
        @click="handleCreateTemplate"
        class="bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="loading"
      >
        템플릿 생성
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useTemplates } from "@/composables/useTemplates";
import { useRouter } from "vue-router";

const { currentUser } = useAuth();
const router = useRouter();
const {
  templates,
  loading,
  error,
  loadTemplates,
  addTemplate,
  createChecklist,
} = useTemplates();

const newTemplate = ref({
  title: "",
  description: "",
  category: "",
  items: [{ name: "", order: 1 }],
});

onMounted(() => {
  loadTemplates();
});

const addTemplateItem = () => {
  newTemplate.value.items.push({
    name: "",
    order: newTemplate.value.items.length + 1,
  });
};

const removeTemplateItem = (index: number) => {
  newTemplate.value.items.splice(index, 1);
  // order 재정렬
  newTemplate.value.items.forEach((item, idx) => {
    item.order = idx + 1;
  });
};

const handleCreateTemplate = async () => {
  if (!newTemplate.value.title.trim()) return;

  try {
    await addTemplate({
      title: newTemplate.value.title,
      description: newTemplate.value.description,
      category: newTemplate.value.category,
      items: newTemplate.value.items.filter((item) => item.name.trim()),
    });
    newTemplate.value = {
      title: "",
      description: "",
      category: "",
      items: [{ name: "", order: 1 }],
    };
  } catch (err) {
    console.error("템플릿 생성 실패:", err);
  }
};

const handleUseTemplate = async (templateId: string) => {
  if (!currentUser.value) return;

  try {
    const checklistId = await createChecklist(
      templateId,
      currentUser.value.uid
    );
    router.push(`/checklists/${checklistId}`);
  } catch (err) {
    console.error("체크리스트 생성 실패:", err);
  }
};
</script>







