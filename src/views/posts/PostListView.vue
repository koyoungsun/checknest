<template>
  <div class="min-h-screen bg-gray-50 flex flex-col board-wrapper">
    <PageSubtitle />

    <!-- 검색 영역 -->
    <SearchInput
      v-model="search"
      placeholder="게시글 검색"
      label="게시글 검색"
      input-id="post-search-input"
      @search="handleSearch"
      class="board-search"
    />

    <!-- 게시글 리스트 -->
    <main class="flex-1 overflow-y-auto content-wrapper board-body">
      <div v-if="search.trim()" style="padding: 8px 16px;" class="board-search-results">
        <div v-if="filteredPosts.length > 0" class="space-y-0 board-list">
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            @click="goDetail(post.id)"
            class="list-card list-item board-item"
          >
            <!-- 작성자 정보 -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="bi bi-person-fill text-gray-600"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900">{{ post.authorName }}</p>
                <p class="text-xs text-gray-400 flex items-center gap-1">
                  <i class="bi bi-clock text-[10px]"></i>
                  {{ formatRelativeTime(toDate(post.createdAt) || new Date()) }}
                </p>
              </div>
            </div>

            <!-- 제목 -->
            <h2 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ post.title }}
            </h2>

            <!-- 본문 미리보기 -->
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
              {{ post.content }}
            </p>

            <!-- 좋아요 / 댓글 수 -->
            <div class="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <i class="bi bi-heart"></i>
                <span>{{ post.likeCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="bi bi-chat"></i>
                <span>{{ post.commentCount || 0 }}</span>
              </div>
              <div class="ml-auto flex items-center gap-1">
                <i class="bi bi-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 없을 때 -->
        <div v-else class="empty-state mt-20 board-empty">
          <i class="bi bi-inbox"></i>
          <p>등록된 게시글이 없습니다.</p>
        </div>
      </div>
      
      <div v-else class="board-content">
        <div v-if="filteredPosts.length > 0" class="space-y-0 board-list">
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            @click="goDetail(post.id)"
            class="list-card list-item board-item"
          >
            <!-- 작성자 정보 -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="bi bi-person-fill text-gray-600"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900">{{ post.authorName }}</p>
                <p class="text-xs text-gray-400 flex items-center gap-1">
                  <i class="bi bi-clock text-[10px]"></i>
                  {{ formatRelativeTime(toDate(post.createdAt) || new Date()) }}
                </p>
              </div>
            </div>

            <!-- 제목 -->
            <h2 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ post.title }}
            </h2>

            <!-- 본문 미리보기 -->
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
              {{ post.content }}
            </p>

            <!-- 좋아요 / 댓글 수 -->
            <div class="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <i class="bi bi-heart"></i>
                <span>{{ post.likeCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="bi bi-chat"></i>
                <span>{{ post.commentCount || 0 }}</span>
              </div>
              <div class="ml-auto flex items-center gap-1">
                <i class="bi bi-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 없을 때 -->
        <div v-else class="empty-state mt-20 board-empty">
          <i class="bi bi-inbox"></i>
          <p>등록된 게시글이 없습니다.</p>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { formatRelativeTime, toDate } from "@/utils/dateUtils";
import { usePosts } from "@/composables/usePosts";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import SearchInput from "@/components/common/SearchInput.vue";
import type { Post } from "@/services/posts";

const router = useRouter();

// usePosts를 단일 데이터 소스로 사용
const { posts, loadPosts, loading } = usePosts();

// 검색
const search = ref("");

// 검색 실행
const handleSearch = () => {
  // 실시간 검색이 이미 computed로 작동하므로 포커스만 유지
  document.getElementById('post-search-input')?.focus();
};

// 필터링 처리: usePosts의 posts 상태를 기준으로 동작
const filteredPosts = computed(() => {
  const postsArray = Array.isArray(posts.value) ? posts.value : [];
  
  if (!search.value.trim()) {
    return postsArray;
  }
  
  const searchLower = search.value.toLowerCase();
  return postsArray.filter((post) =>
    post.title.toLowerCase().includes(searchLower) ||
    post.content.toLowerCase().includes(searchLower)
  );
});

// 상세 이동: posts 컬렉션 사용
const goDetail = (id: string) => {
  router.push(`/posts/${id}`);
};

// 게시글 목록 로드 (public read, 로그인 여부와 무관)
onMounted(async () => {
  try {
    await loadPosts();
  } catch (err: any) {
    // 에러 발생 시에도 기존 state는 유지 (빈 배열로 덮어쓰지 않음)
    console.error("[PostListView] 게시글 목록 로드 실패:", err?.message || err);
  }
});
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.list-card img {
  max-width: 100%;
}
</style>
