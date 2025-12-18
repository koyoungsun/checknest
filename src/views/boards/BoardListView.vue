<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
    
    <!-- 카테고리 필터 -->
    <section class="overflow-x-auto bg-white border-b" style="padding: 16px;">
      <div class="flex" style="gap: 2px;">
        <label
          v-for="cat in categories"
          :key="cat.value"
          class="radio-tab"
          :class="{ 'radio-tab--active': selectedCategory === cat.value }"
        >
          <input
            type="radio"
            :value="cat.value"
            v-model="selectedCategory"
            class="radio-input"
            @change="handleCategoryChange"
          />
          <span class="radio-label">{{ cat.label }}</span>
        </label>
      </div>
    </section>

    <!-- 게시글 리스트 -->
    <main class="flex-1 overflow-y-auto content-wrapper">
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
            @click="loadBoardsData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>

      <!-- 게시글 리스트 -->
      <div v-else class="space-y-0 board-list-section">
        <div
          v-for="board in boards"
          :key="board.id"
          @click="goDetail(board.id)"
          class="list-card list-item cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="px-4 py-3">
            <!-- 제목 및 카테고리 -->
            <div class="flex items-start gap-3 mb-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span v-if="board.isPinned" class="text-xs px-2 py-0.5 bg-red-500 text-white rounded">
                    공지
                  </span>
                  <span class="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">
                    {{ getCategoryLabel(board.category) }}
                  </span>
                </div>
                <h3 class="font-semibold text-base text-gray-800 truncate">
                  {{ board.title }}
                </h3>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                  {{ board.summary }}
                </p>
              </div>
            </div>

            <!-- 작성자 및 작성일 -->
            <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <span v-if="board.authorName">
                작성자: {{ board.authorName }}
              </span>
              <span v-if="board.authorName && board.createdAt">·</span>
              <span v-if="board.createdAt">
                작성일: {{ formatCreatedAt(board.createdAt) }}
              </span>
            </div>

            <!-- 좋아요 및 댓글 -->
            <div class="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span class="flex items-center gap-1">
                <i class="bi bi-heart"></i>
                {{ board.likeCount }}
              </span>
              <span v-if="board.commentCount > 0" class="flex items-center gap-1">
                <i class="bi bi-chat"></i>
                댓글 있음
              </span>
            </div>
          </div>
        </div>

        <!-- 게시글 없을 때 -->
        <div v-if="!boards || boards.length === 0" class="empty-state">
          <i class="bi bi-inbox text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">게시글이 없습니다.</p>
        </div>
      </div>
    </main>

    <!-- 작성 버튼 (FAB) -->
    <button
      @click="goCreate"
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-10"
    >
      <i class="bi bi-pencil text-2xl"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useBoards } from "@/composables/useBoards";
import { useAuth } from "@/composables/useAuth";
import { formatDateYYYYMMDD, toDate } from "@/utils/dateUtils";
import type { BoardCategory } from "@/types/board";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { currentUser } = useAuth();
const { boards, loading, error, loadBoards } = useBoards();

// 카테고리 옵션
const categories = [
  { value: null as BoardCategory | null, label: "전체" },
  { value: "notice" as BoardCategory, label: "공지" },
  { value: "free" as BoardCategory, label: "자유" },
  { value: "review" as BoardCategory, label: "후기" },
];
const selectedCategory = ref<BoardCategory | null>(null);

// 카테고리 라벨
const getCategoryLabel = (category: BoardCategory): string => {
  const cat = categories.find(c => c.value === category);
  return cat?.label || category;
};

// 작성일 포맷팅
const formatCreatedAt = (createdAt: any): string => {
  if (!createdAt) return '';
  const date = toDate(createdAt);
  if (!date) return '';
  return formatDateYYYYMMDD(date);
};

// 카테고리 변경 핸들러
const handleCategoryChange = () => {
  loadBoardsData();
};

// 게시글 데이터 로드
// Firestore 권한 오류 발생 시에도 렌더가 깨지지 않도록 방어 코드 포함
const loadBoardsData = async () => {
  try {
    const filters: any = {};
    if (selectedCategory.value) {
      filters.category = selectedCategory.value;
    }
    await loadBoards(filters);
  } catch (err: any) {
    // Firestore 권한 오류 또는 기타 오류 발생 시
    // useBoards에서 이미 빈 배열로 설정되므로 여기서는 로그만 출력
    if (err?.code === "permission-denied") {
      console.error("[BoardListView] Firestore 권한 오류:", err);
    } else {
      console.error("[BoardListView] 게시글 로드 실패:", err);
    }
    // boards는 useBoards에서 빈 배열로 유지되므로 추가 처리 불필요
  }
};

// 초기 로드
onMounted(() => {
  loadBoardsData();
});

// 상세 이동
const goDetail = (id: string) => {
  router.push(`/boards/${id}`);
};

// 작성 이동
const goCreate = () => {
  router.push("/boards/create");
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.board-list-section {
  background-color: #fff;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--color-primary, #ff6b35);
}

.board-list-section .list-item {
  border-bottom: 1px dashed #aeaeae;
}

.board-list-section .list-item:last-child {
  border-bottom: none;
}

.radio-tab {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #374151;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-right: 2px;
}

.radio-tab--active .radio-label {
  background-color: var(--color-primary, #ff6b35);
  color: #fff;
  border-color: var(--color-primary, #ff6b35);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

