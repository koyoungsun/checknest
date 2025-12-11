<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageSubtitle />
    <div class="px-4 py-4 content-wrapper">
      <!-- 제목 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">제목</label>
        <input
          v-model="title"
          type="text"
          class="input"
          placeholder="제목을 입력하세요"
        />
      </section>

      <!-- 카테고리 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">카테고리 (선택)</label>
        <select v-model="category" class="input">
          <option value="">선택 안 함</option>
          <option value="공지">공지</option>
          <option value="팁">생활 팁</option>
          <option value="템플릿 공유">템플릿 공유</option>
          <option value="기타">기타</option>
        </select>
      </section>

      <!-- 내용 -->
      <section class="mb-4">
        <label class="block text-sm font-semibold mb-1">내용</label>
        <textarea
          v-model="content"
          rows="8"
          class="input"
          placeholder="공유하고 싶은 내용을 작성해주세요."
        ></textarea>
      </section>

      <!-- 버튼 -->
      <section class="button-group">
        <button class="btn-primary" @click="save">
          게시글 등록
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
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();

const title = ref("");
const category = ref("");
const content = ref("");

const save = () => {
  if (!title.value.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!content.value.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  console.log("NEW POST", {
    title: title.value,
    category: category.value,
    content: content.value,
  });

  alert("게시글이 등록된 것으로 가정합니다. (추후 Firestore 연동)");
  router.push("/posts");
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
