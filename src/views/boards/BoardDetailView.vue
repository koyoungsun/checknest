<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
    
    <main class="flex-1 overflow-y-auto">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">로딩 중...</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="flex items-center justify-center py-12">
        <div class="text-center">
          <p class="text-red-600 mb-4">{{ error.message || '오류가 발생했습니다.' }}</p>
          <button
            @click="loadBoardData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div v-else-if="board" class="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mb-4">
        <!-- 제목 및 카테고리 -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span v-if="board.isPinned" class="text-xs px-2 py-0.5 bg-red-500 text-white rounded">
              공지
            </span>
            <span class="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">
              {{ getCategoryLabel(board.category) }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">{{ board.title }}</h1>
        </div>

        <!-- 작성자 및 작성일 -->
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b">
          <span v-if="board.authorName">
            작성자: {{ board.authorName }}
          </span>
          <span v-if="board.authorName && board.createdAt">·</span>
          <span v-if="board.createdAt">
            작성일: {{ formatCreatedAt(board.createdAt) }}
          </span>
        </div>

        <!-- 본문 내용 -->
        <div
          class="prose max-w-none mb-6"
          v-html="board.content"
        ></div>

        <!-- 좋아요 버튼 -->
        <div class="flex items-center gap-4 mb-6 pb-6 border-b">
          <button
            @click="handleLike"
            :disabled="!currentUser || isLiking"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            :class="liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <i class="bi" :class="liked ? 'bi-heart-fill' : 'bi-heart'"></i>
            <span>{{ board.likeCount }}</span>
          </button>
        </div>

        <!-- 수정/삭제 버튼 (작성자만) -->
        <div v-if="isAuthor" class="flex gap-2 mb-6">
          <button
            @click="goEdit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            수정
          </button>
          <button
            @click="handleDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ isDeleting ? "삭제 중..." : "삭제" }}
          </button>
        </div>
      </div>

      <!-- 댓글 영역 -->
      <div v-if="board" class="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">댓글</h2>

        <!-- 댓글이 없을 경우: 입력창 노출 -->
        <div v-if="!currentComment && !isCommentSubmitting">
          <textarea
            v-model="commentContent"
            rows="3"
            placeholder="댓글을 입력하세요 (게시글당 1개만 작성 가능)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          ></textarea>
          <button
            @click="handleAddComment"
            :disabled="!commentContent.trim() || !currentUser"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            댓글 작성
          </button>
        </div>

        <!-- 댓글이 있을 경우: 댓글 표시 및 수정 -->
        <div v-else-if="currentComment">
          <div class="p-4 bg-gray-50 rounded-lg mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-gray-800">{{ currentComment.authorName }}</span>
              <span class="text-xs text-gray-500">
                {{ formatCreatedAt(currentComment.createdAt) }}
              </span>
            </div>
            <div v-if="!isEditingComment" class="text-gray-700">
              {{ currentComment.content }}
            </div>
            <div v-else class="mb-2">
              <textarea
                v-model="editCommentContent"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button
                  @click="handleUpdateComment"
                  :disabled="!editCommentContent.trim()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  @click="cancelEditComment"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </div>
          </div>

          <!-- 댓글 수정/삭제 버튼 (작성자만) -->
          <div v-if="isCommentAuthor && !isEditingComment" class="flex gap-2">
            <button
              @click="startEditComment"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              수정
            </button>
            <button
              @click="handleDeleteComment"
              :disabled="isDeletingComment"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {{ isDeletingComment ? "삭제 중..." : "삭제" }}
            </button>
          </div>
        </div>

        <!-- 댓글 작성 중 -->
        <div v-if="isCommentSubmitting" class="text-center py-4">
          <p class="text-gray-600">댓글 작성 중...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBoards } from "@/composables/useBoards";
import { useAuth } from "@/composables/useAuth";
import { formatDateYYYYMMDD, toDate } from "@/utils/dateUtils";
import type { BoardCategory } from "@/types/board";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const route = useRoute();
const router = useRouter();
const { currentUser } = useAuth();
const {
  currentBoard: board,
  currentComment,
  loading,
  error,
  liked,
  loadBoard,
  removeBoard,
  addComment,
  editComment,
  removeComment,
  toggleLike,
  checkLike,
} = useBoards();

const commentContent = ref("");
const editCommentContent = ref("");
const isEditingComment = ref(false);
const isCommentSubmitting = ref(false);
const isDeletingComment = ref(false);
const isDeleting = ref(false);
const isLiking = ref(false);

// 카테고리 라벨
const getCategoryLabel = (category: BoardCategory): string => {
  const labels: Record<BoardCategory, string> = {
    notice: "공지",
    free: "자유",
    review: "후기",
  };
  return labels[category] || category;
};

// 작성일 포맷팅
const formatCreatedAt = (createdAt: any): string => {
  if (!createdAt) return '';
  const date = toDate(createdAt);
  if (!date) return '';
  return formatDateYYYYMMDD(date);
};

// 작성자 여부
const isAuthor = computed(() => {
  return board.value && currentUser.value && board.value.authorId === currentUser.value.uid;
});

// 댓글 작성자 여부
const isCommentAuthor = computed(() => {
  return currentComment.value && currentUser.value && currentComment.value.authorId === currentUser.value.uid;
});

// 게시글 데이터 로드
const loadBoardData = async () => {
  const id = route.params.id as string;
  await loadBoard(id);
  
  // 좋아요 상태 확인
  if (currentUser.value && board.value) {
    await checkLike(board.value.id, currentUser.value.uid);
  }
};

// 좋아요 처리
const handleLike = async () => {
  if (!currentUser.value || !board.value || isLiking.value) {
    return;
  }

  isLiking.value = true;
  try {
    await toggleLike(board.value.id, currentUser.value.uid);
  } catch (err) {
    console.error("좋아요 처리 실패:", err);
    alert("좋아요 처리에 실패했습니다.");
  } finally {
    isLiking.value = false;
  }
};

// 댓글 작성
const handleAddComment = async () => {
  if (!currentUser.value || !board.value || !commentContent.value.trim()) {
    return;
  }

  isCommentSubmitting.value = true;
  try {
    await addComment({
      boardId: board.value.id,
      authorId: currentUser.value.uid,
      authorName: (await import("@/services/userService")).getUserProfile(currentUser.value.uid, currentUser.value.uid).then(p => p?.displayName || "사용자") || "사용자",
      content: commentContent.value.trim(),
    });
    commentContent.value = "";
  } catch (err: any) {
    console.error("댓글 작성 실패:", err);
    alert(err.message || "댓글 작성에 실패했습니다.");
  } finally {
    isCommentSubmitting.value = false;
  }
};

// 댓글 수정 시작
const startEditComment = () => {
  if (currentComment.value) {
    editCommentContent.value = currentComment.value.content;
    isEditingComment.value = true;
  }
};

// 댓글 수정 취소
const cancelEditComment = () => {
  isEditingComment.value = false;
  editCommentContent.value = "";
};

// 댓글 수정
const handleUpdateComment = async () => {
  if (!currentComment.value || !editCommentContent.value.trim()) {
    return;
  }

  isCommentSubmitting.value = true;
  try {
    await editComment(currentComment.value.id, {
      content: editCommentContent.value.trim(),
    });
    isEditingComment.value = false;
    editCommentContent.value = "";
  } catch (err) {
    console.error("댓글 수정 실패:", err);
    alert("댓글 수정에 실패했습니다.");
  } finally {
    isCommentSubmitting.value = false;
  }
};

// 댓글 삭제
const handleDeleteComment = async () => {
  if (!currentComment.value) {
    return;
  }

  if (!confirm("댓글을 삭제하시겠습니까?")) {
    return;
  }

  isDeletingComment.value = true;
  try {
    await removeComment(currentComment.value.id);
  } catch (err) {
    console.error("댓글 삭제 실패:", err);
    alert("댓글 삭제에 실패했습니다.");
  } finally {
    isDeletingComment.value = false;
  }
};

// 게시글 삭제
const handleDelete = async () => {
  if (!board.value) {
    return;
  }

  if (!confirm("게시글을 삭제하시겠습니까?")) {
    return;
  }

  isDeleting.value = true;
  try {
    await removeBoard(board.value.id);
    router.push("/boards");
  } catch (err) {
    console.error("게시글 삭제 실패:", err);
    alert("게시글 삭제에 실패했습니다.");
  } finally {
    isDeleting.value = false;
  }
};

// 수정 페이지로 이동
const goEdit = () => {
  // TODO: 게시글 수정 페이지 구현 필요
  alert("게시글 수정 기능은 준비 중입니다.");
};

onMounted(() => {
  loadBoardData();
});
</script>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose :deep(p) {
  margin-bottom: 1rem;
}

.prose :deep(strong) {
  font-weight: 600;
}

.prose :deep(em) {
  font-style: italic;
}

.prose :deep(u) {
  text-decoration: underline;
}
</style>

