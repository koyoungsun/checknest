<template>
  <div class="min-h-screen bg-gray-50 pb-20 board-write-wrapper">
    <PageSubtitle />
    <div class="px-4 py-4 content-wrapper board-write-body">
      <!-- 제목 -->
      <section class="mb-4 board-write-title-section">
        <label class="block text-sm font-semibold mb-1">제목</label>
        <input
          v-model="title"
          type="text"
          class="input board-write-title-input"
          placeholder="제목을 입력하세요"
        />
      </section>

      <!-- 카테고리 -->
      <section class="mb-4 board-write-category-section">
        <label class="block text-sm font-semibold mb-1">카테고리</label>
        <select v-model="category" class="input board-write-category-select">
          <option value="free">자유</option>
          <option value="notice">공지</option>
          <option value="review">후기</option>
        </select>
      </section>

      <!-- 내용 -->
      <section class="mb-4 board-write-content-section">
        <label class="block text-sm font-semibold mb-1">내용</label>
        <textarea
          v-model="content"
          rows="8"
          class="input board-write-content-input"
          placeholder="공유하고 싶은 내용을 작성해주세요."
        ></textarea>
      </section>

      <!-- 버튼 -->
      <section class="button-group board-write-actions">
        <button 
          class="btn-primary board-write-save-btn" 
          @click="save"
          :disabled="loading || !title.trim() || !content.trim()"
        >
          {{ loading ? "저장 중..." : "게시글 등록" }}
        </button>
        <button class="btn-secondary board-write-cancel-btn" @click="cancel" :disabled="loading">
          취소
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePosts } from "@/composables/usePosts";
import { getUserProfile } from "@/services/userService";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { currentUser } = useAuth();
const { addPost, loading } = usePosts();

const title = ref("");
const category = ref<"notice" | "free" | "review">("free");
const content = ref("");

const save = async () => {
  if (!title.value.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!content.value.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  if (!currentUser.value) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    // 작성자 이름을 users 컬렉션에서 가져오기 (본인 프로필이므로 항상 조회 가능)
    let authorName = currentUser.value.displayName || "사용자";
    try {
      const profile = await getUserProfile(currentUser.value.uid, currentUser.value.uid);
      if (profile && profile.displayName) {
        authorName = profile.displayName;
      }
    } catch (err) {
      // 프로필 조회 실패 시 Firebase Auth의 displayName 사용 (fallback)
      console.warn("[PostWriteView] 프로필 조회 실패, Firebase Auth displayName 사용:", err);
    }

    // Firestore에 게시글 저장
    await addPost({
      category: category.value || "free",
      title: title.value.trim(),
      content: content.value.trim(),
      ownerId: currentUser.value.uid,
      authorName: authorName,
    });

    // 저장 성공 시 게시판 리스트 페이지로 이동
    router.push("/posts");
  } catch (error: any) {
    console.error("[PostWriteView] 게시글 저장 실패:", error);
    alert("게시글 저장에 실패했습니다. 다시 시도해주세요.");
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
