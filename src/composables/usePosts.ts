import { ref } from "vue";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  type PostCreateInput,
  type PostUpdateInput,
  type PostListFilters,
  type Post,
} from "@/services/posts";

/**
 * 게시글 관리 Composable
 */
export const usePosts = () => {
  const posts = ref<Post[]>([]);
  const currentPost = ref<Post | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 게시글 목록 로드
   */
  const loadPosts = async (
    filters?: PostListFilters,
    limitCount?: number
  ) => {
    loading.value = true;
    error.value = null;
    try {
      posts.value = await getPosts(filters, limitCount);
    } catch (err: any) {
      error.value = err as Error;
      console.error("[usePosts] 게시글 목록 로드 실패:", err?.message || err);
      // 에러 발생 시에도 기존 state는 유지 (빈 배열로 덮어쓰지 않음)
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 단일 로드
   */
  const loadPost = async (postId: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentPost.value = await getPostById(postId);
      if (!currentPost.value) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }
    } catch (err: any) {
      error.value = err as Error;
      console.error("[usePosts] 게시글 로드 실패:", err?.message || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 생성
   */
  const addPost = async (input: PostCreateInput) => {
    loading.value = true;
    error.value = null;
    try {
      const id = await createPost(input);
      // 생성 후 목록 새로고침
      await loadPosts();
      return id;
    } catch (err: any) {
      error.value = err as Error;
      console.error("[usePosts] 게시글 생성 실패:", err?.message || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 업데이트
   */
  const editPost = async (postId: string, input: PostUpdateInput) => {
    loading.value = true;
    error.value = null;
    try {
      await updatePost(postId, input);
      await loadPost(postId);
      await loadPosts();
    } catch (err: any) {
      error.value = err as Error;
      console.error("[usePosts] 게시글 업데이트 실패:", err?.message || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 삭제
   */
  const removePost = async (postId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deletePost(postId);
      await loadPosts();
    } catch (err: any) {
      error.value = err as Error;
      console.error("[usePosts] 게시글 삭제 실패:", err?.message || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    posts,
    currentPost,
    loading,
    error,
    loadPosts,
    loadPost,
    addPost,
    editPost,
    removePost,
  };
};

