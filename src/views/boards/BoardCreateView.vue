<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
    
    <main class="flex-1 overflow-y-auto p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <!-- 제목 입력 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            제목 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="게시글 제목을 입력하세요"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- 카테고리 선택 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            카테고리 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <label
              v-for="cat in categories"
              :key="cat.value"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer text-center transition-colors"
              :class="{
                'bg-blue-600 text-white border-blue-600': form.category === cat.value,
                'bg-white text-gray-700 hover:bg-gray-50': form.category !== cat.value,
              }"
            >
              <input
                type="radio"
                :value="cat.value"
                v-model="form.category"
                class="hidden"
              />
              {{ cat.label }}
            </label>
          </div>
        </div>

        <!-- 내용 입력 (간단한 에디터) -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            내용 <span class="text-red-500">*</span>
          </label>
          
          <!-- 포맷 툴바 -->
          <div class="flex gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
            <button
              type="button"
              @click="formatText('bold')"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
              :class="{ 'bg-blue-100': isFormatActive('bold') }"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              @click="formatText('italic')"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
              :class="{ 'bg-blue-100': isFormatActive('italic') }"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              @click="formatText('underline')"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
              :class="{ 'bg-blue-100': isFormatActive('underline') }"
            >
              <u>U</u>
            </button>
          </div>

          <!-- 에디터 영역 -->
          <div
            ref="editorRef"
            contenteditable="true"
            @input="handleContentInput"
            class="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="white-space: pre-wrap;"
            placeholder="게시글 내용을 입력하세요"
          ></div>
          <p class="text-xs text-gray-500 mt-1">
            포맷 버튼을 사용하여 텍스트를 꾸밀 수 있습니다.
          </p>
        </div>

        <!-- 제출 버튼 -->
        <div class="flex gap-2">
          <button
            @click="goBack"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || isSubmitting"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "작성 중..." : "작성하기" }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useBoards } from "@/composables/useBoards";
import { useAuth } from "@/composables/useAuth";
import { getUserProfile } from "@/services/userService";
import type { BoardCategory } from "@/types/board";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { currentUser } = useAuth();
const { addBoard, loading: boardLoading } = useBoards();

const editorRef = ref<HTMLElement | null>(null);
const form = ref({
  title: "",
  category: "free" as BoardCategory,
  content: "",
});
const isSubmitting = ref(false);

// 카테고리 옵션
const categories = [
  { value: "notice" as BoardCategory, label: "공지" },
  { value: "free" as BoardCategory, label: "자유" },
  { value: "review" as BoardCategory, label: "후기" },
];

// 제출 가능 여부
const canSubmit = computed(() => {
  return form.value.title.trim() !== "" && form.value.content.trim() !== "";
});

// 내용 입력 핸들러
const handleContentInput = () => {
  if (editorRef.value) {
    form.value.content = editorRef.value.innerHTML;
  }
};

// 포맷 적용
const formatText = (command: "bold" | "italic" | "underline") => {
  document.execCommand(command, false);
  if (editorRef.value) {
    editorRef.value.focus();
  }
};

// 포맷 활성 상태 확인
const isFormatActive = (command: "bold" | "italic" | "underline"): boolean => {
  return document.queryCommandState(command);
};

// 제출 핸들러
const handleSubmit = async () => {
  if (!canSubmit.value || !currentUser.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    // 본인 프로필 조회 (currentUserId 전달하여 항상 조회 가능)
    const profile = await getUserProfile(currentUser.value.uid, currentUser.value.uid);
    const authorName = profile?.displayName || "사용자";

    await addBoard({
      title: form.value.title.trim(),
      content: form.value.content,
      category: form.value.category,
      authorId: currentUser.value.uid,
      authorName: authorName,
    });

    // 작성 완료 후 리스트로 이동
    router.push("/boards");
  } catch (err) {
    console.error("게시글 작성 실패:", err);
    alert("게시글 작성에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// 뒤로가기
const goBack = () => {
  router.back();
};

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.focus();
  }
});
</script>

<style scoped>
[contenteditable="true"]:empty:before {
  content:attr(placeholder); color:#9ca3af;
}
</style>

