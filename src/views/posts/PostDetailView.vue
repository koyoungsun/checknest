<template>
    <div class="min-h-screen bg-gray-50 flex flex-col board-detail-wrapper">
      <PageSubtitle />
  
      <!-- 상단 헤더 -->
      <header class="flex items-center px-4 h-14 border-b bg-white board-detail-header">
        <button @click="router.back()" class="mr-3 text-xl board-detail-back-btn">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="text-base font-semibold truncate board-detail-title">게시글</h1>
      </header>
  
      <!-- 로딩 상태 -->
      <div
        v-if="loading"
        class="flex-1 flex items-center justify-center text-gray-400 board-detail-loading"
      >
        불러오는 중...
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="flex-1 flex items-center justify-center text-gray-400 board-detail-error"
      >
        <div class="text-center">
          <p class="mb-4">{{ error.message || "게시글을 불러올 수 없습니다." }}</p>
          <button
            @click="router.push('/posts')"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg board-detail-error-back-btn"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
  
      <!-- 게시글 내용 -->
      <main v-else-if="post" class="flex-1 overflow-y-auto detail-content space-y-6 board-detail-body">
  
        <!-- 게시글 카드 -->
        <section class="bg-white rounded-xl p-4 shadow-sm border board-detail-post-section">
          
          <!-- 작성자 정보 및 수정/삭제 버튼 -->
          <div class="flex items-center justify-between mb-3 board-detail-post-header">
            <div class="flex items-center gap-3 board-detail-post-author">
              <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <p class="text-sm font-semibold">{{ post.authorName }}</p>
                <p class="text-xs text-gray-400">
                  {{ formatRelativeTime(toDate(post.createdAt) || new Date()) }}
                </p>
              </div>
            </div>
            
            <!-- 수정/삭제 버튼 (작성자만 표시) -->
            <div v-if="isOwner" class="flex items-center gap-2 board-detail-post-actions">
              <button
                @click="handleEdit"
                class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded board-detail-post-edit-btn"
              >
                수정
              </button>
              <button
                @click="handleDelete"
                class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded board-detail-post-delete-btn"
              >
                삭제
              </button>
            </div>
          </div>
  
          <!-- 카테고리 -->
          <div class="mb-2 board-detail-post-category">
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {{ post.category === 'notice' ? '공지' : post.category === 'free' ? '자유' : '후기' }}
            </span>
          </div>
  
          <!-- 제목 -->
          <h2 class="text-base font-semibold mb-2 board-detail-post-title">{{ post.title }}</h2>
  
          <!-- 본문 -->
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line board-detail-post-content">
            {{ post.content }}
          </p>
  
          <!-- 좋아요 / 댓글 수 -->
          <div class="flex items-center gap-6 mt-4 text-gray-500 text-sm board-detail-post-stats">
            <div class="flex items-center gap-1">
              <i class="bi bi-heart"></i>
              <span>{{ post.likeCount || 0 }}</span>
            </div>
  
            <div class="flex items-center gap-1">
              <i class="bi bi-chat"></i>
              <span>{{ post.commentCount || 0 }}</span>
            </div>
          </div>
        </section>
  
        <!-- 댓글 섹션 -->
        <section class="bg-white rounded-xl p-4 shadow-sm border space-y-4 board-detail-comments-section">
          <h3 class="text-sm font-semibold text-gray-700 board-detail-comments-header">
            댓글 ({{ comments.length }})
          </h3>

          <!-- 댓글 입력 (로그인 사용자만) -->
          <div v-if="currentUser" class="border-t pt-4 board-detail-comments-input">
            <textarea
              v-model="newComment"
              rows="3"
              class="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 board-detail-comments-textarea"
              placeholder="댓글을 입력하세요..."
            ></textarea>
            <div class="flex justify-end mt-2 board-detail-comments-actions">
              <button
                @click="handleAddComment"
                :disabled="!newComment.trim() || commentLoading"
                class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed board-detail-comments-submit-btn"
              >
                {{ commentLoading ? "등록 중..." : "댓글 등록" }}
              </button>
            </div>
          </div>

          <!-- 로그인 안내 -->
          <div v-else class="border-t pt-4 text-center text-gray-400 text-sm board-detail-comments-login-prompt">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>

          <!-- 댓글 목록 -->
          <div v-if="comments.length > 0" class="space-y-4 border-t pt-4 board-detail-comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex items-start gap-3 pb-4 border-b last:border-b-0 board-detail-comment-item"
            >
              <div class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div class="flex-1 min-w-0 board-detail-comment-body">
                <div class="flex items-center justify-between mb-1 board-detail-comment-header">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">
                      {{ comment.authorName }}
                    </p>
                    <p class="text-xs text-gray-400">
                      {{ formatRelativeTime(toDate(comment.createdAt) || new Date()) }}
                    </p>
                  </div>
                  <!-- 삭제 버튼 (작성자만) -->
                  <button
                    v-if="currentUser && comment.authorId === currentUser.uid"
                    @click="handleDeleteComment(comment.id)"
                    class="text-xs text-red-600 hover:text-red-700 board-detail-comment-delete-btn"
                  >
                    삭제
                  </button>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-line mt-1 board-detail-comment-content">
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- 댓글 없음 -->
          <div
            v-else
            class="border-t pt-4 text-center text-gray-400 text-sm board-detail-comments-empty"
          >
            아직 댓글이 없습니다.
          </div>
        </section>
  
      </main>
  
    </div>
  </template>
  
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatRelativeTime, toDate } from "@/utils/dateUtils";
import { useAuth } from "@/composables/useAuth";
import { usePosts } from "@/composables/usePosts";
import { useComments } from "@/composables/useComments";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
const router = useRouter();
const route = useRoute();
const { currentUser } = useAuth();
const { currentPost, loadPost, loading, error, removePost, loadPosts } = usePosts();

const post = computed(() => currentPost.value);
const postId = computed(() => route.params.id as string);

// 댓글 관리
const { comments, loading: commentLoading, loadComments, addComment, removeComment } = useComments(() => postId.value);
const newComment = ref("");

// 작성자 여부 확인
const isOwner = computed(() => {
  return currentUser.value && post.value && post.value.ownerId === currentUser.value.uid;
});

// 게시글 로드
onMounted(async () => {
  const id = postId.value;
  if (!id) {
    router.push("/posts");
    return;
  }

  try {
    await loadPost(id);
    // 댓글 로드 (실시간 구독 시작)
    loadComments();
  } catch (err: any) {
    console.error("[PostDetailView] 게시글 로드 실패:", err);
    if (err?.message?.includes("찾을 수 없습니다")) {
      alert("게시글을 찾을 수 없습니다.");
      router.push("/posts");
    }
  }
});


// 게시글 삭제
const handleDelete = async () => {
  if (!post.value) return;
  
  if (!confirm("정말 삭제하시겠습니까?")) {
    return;
  }

  try {
    await removePost(post.value.id);
    router.push("/posts");
  } catch (err: any) {
    console.error("[PostDetailView] 게시글 삭제 실패:", err);
    alert("게시글 삭제에 실패했습니다.");
  }
};

// 게시글 수정
const handleEdit = () => {
  if (!post.value) return;
  router.push(`/posts/${post.value.id}/edit`);
};

// 댓글 추가
const handleAddComment = async () => {
  if (!newComment.value.trim() || !currentUser.value || !post.value) {
    return;
  }

  try {
    await addComment({
      authorId: currentUser.value.uid,
      authorName: currentUser.value.displayName || "사용자",
      content: newComment.value.trim(),
    });
    newComment.value = "";
    // 게시글 목록 새로고침 (댓글 수 업데이트)
    await loadPosts();
  } catch (err: any) {
    console.error("[PostDetailView] 댓글 추가 실패:", err);
    alert("댓글 등록에 실패했습니다.");
  }
};

// 댓글 삭제
const handleDeleteComment = async (commentId: string) => {
  if (!confirm("댓글을 삭제하시겠습니까?")) {
    return;
  }

  try {
    await removeComment(commentId);
    // 게시글 목록 새로고침 (댓글 수 업데이트)
    await loadPosts();
  } catch (err: any) {
    console.error("[PostDetailView] 댓글 삭제 실패:", err);
    alert("댓글 삭제에 실패했습니다.");
  }
};
</script>
  
  <style scoped>
  </style>