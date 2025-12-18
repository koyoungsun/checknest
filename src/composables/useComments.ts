import { ref, onUnmounted, watch } from "vue";
import {
  createComment,
  deleteComment,
  type CommentCreateInput,
} from "@/services/comments";
import type { Comment } from "@/types/comment";
import { onSnapshot, collection, query, orderBy, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/**
 * 댓글 관리 Composable
 */
export function useComments(postId: string | (() => string)) {
  const comments = ref<Comment[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let unsubscribe: (() => void) | null = null;

  // postId를 함수로 받은 경우 computed로 처리
  const getPostId = typeof postId === 'function' ? postId : () => postId;

  /**
   * 댓글 목록 로드 (실시간 구독)
   * posts/{postId}/comments 서브컬렉션 사용
   */
  const loadComments = () => {
    const currentPostId = getPostId();
    if (!currentPostId) {
      comments.value = [];
      return;
    }

    // 기존 구독 해제
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    loading.value = true;
    error.value = null;

    try {
      // posts/{postId}/comments 서브컬렉션 경로 사용
      const commentsRef = collection(db, "posts", currentPostId, "comments");
      const q = query(commentsRef, orderBy("createdAt", "desc"));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          comments.value = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              postId: currentPostId,
              authorId: data.authorId || data.ownerId, // ownerId도 지원 (호환성)
              authorName: data.authorName,
              content: data.content,
              createdAt: data.createdAt,
            } as Comment;
          });
          loading.value = false;
        },
        (err: any) => {
          // permission error는 warn 레벨로 로그 (로그인 필요 안내)
          if (err?.code === "permission-denied") {
            console.warn("[useComments] 댓글 조회 권한 없음: 로그인이 필요합니다.", err?.message || err);
          } else {
            console.error("[useComments] 댓글 실시간 구독 실패:", err?.message || err);
          }
          error.value = err as Error;
          loading.value = false;
          // 댓글 0개는 정상 상태이므로 빈 배열로 설정
          comments.value = [];
        }
      );
    } catch (err: any) {
      // permission error는 warn 레벨로 로그 (로그인 필요 안내)
      if (err?.code === "permission-denied") {
        console.warn("[useComments] 댓글 조회 권한 없음: 로그인이 필요합니다.", err?.message || err);
      } else {
        console.error("[useComments] 댓글 로드 실패:", err?.message || err);
      }
      error.value = err as Error;
      loading.value = false;
      // 댓글 0개는 정상 상태이므로 빈 배열로 설정
      comments.value = [];
    }
  };

  /**
   * 댓글 추가
   */
  const addComment = async (input: Omit<CommentCreateInput, "postId">) => {
    const currentPostId = getPostId();
    if (!currentPostId) {
      throw new Error("게시글 ID가 없습니다.");
    }
    try {
      await createComment({
        ...input,
        postId: currentPostId,
      });
      // 실시간 구독으로 자동 업데이트됨
    } catch (err: any) {
      console.error("[useComments] 댓글 추가 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 댓글 삭제
   */
  const removeComment = async (commentId: string) => {
    const currentPostId = getPostId();
    if (!currentPostId) {
      throw new Error("게시글 ID가 없습니다.");
    }
    try {
      await deleteComment(commentId, currentPostId);
      // 실시간 구독으로 자동 업데이트됨
    } catch (err: any) {
      console.error("[useComments] 댓글 삭제 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 실시간 구독 해제
   */
  const unsubscribeComments = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  // postId 변경 감지 및 재구독
  if (typeof postId === 'function') {
    watch(
      postId,
      () => {
        loadComments();
      },
      { immediate: false }
    );
  }

  // 컴포넌트 언마운트 시 구독 해제
  onUnmounted(() => {
    unsubscribeComments();
  });

  return {
    comments,
    loading,
    error,
    loadComments,
    addComment,
    removeComment,
    unsubscribeComments,
  };
}

