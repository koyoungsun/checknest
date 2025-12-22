import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import {
  searchAll,
  searchChecklists,
  searchTemplates,
  searchPosts,
  type SearchResults,
} from "@/services/search";
import type { Checklist } from "@/types/checklist";
import type { Template } from "@/types/template";
import type { Post } from "@/services/posts";

/**
 * 검색 관리 Composable
 */
export function useSearch() {
  const { currentUser } = useAuth();
  const results = ref<SearchResults>({
    checklists: [],
    templates: [],
    posts: [],
  });
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 통합 검색 실행
   */
  const search = async (keyword: string) => {
    if (!keyword.trim()) {
      results.value = {
        checklists: [],
        templates: [],
        posts: [],
      };
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const searchResults = await searchAll(
        keyword,
        currentUser.value?.uid
      );
      results.value = searchResults;
    } catch (err: any) {
      error.value = err as Error;
      console.error("[useSearch] 검색 실패:", err?.message || err);
      // 에러 발생 시 빈 결과 반환
      results.value = {
        checklists: [],
        templates: [],
        posts: [],
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 체크리스트 검색
   */
  const searchChecklistsOnly = async (
    keyword: string
  ): Promise<Checklist[]> => {
    try {
      return await searchChecklists(keyword, currentUser.value?.uid);
    } catch (err: any) {
      console.error("[useSearch] 체크리스트 검색 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 템플릿 검색
   */
  const searchTemplatesOnly = async (keyword: string): Promise<Template[]> => {
    try {
      return await searchTemplates(keyword);
    } catch (err: any) {
      console.error("[useSearch] 템플릿 검색 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 게시글 검색
   */
  const searchPostsOnly = async (keyword: string): Promise<Post[]> => {
    try {
      return await searchPosts(keyword);
    } catch (err: any) {
      console.error("[useSearch] 게시글 검색 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 검색 결과 초기화
   */
  const clearResults = () => {
    results.value = {
      checklists: [],
      templates: [],
      posts: [],
    };
    error.value = null;
  };

  return {
    results,
    loading,
    error,
    search,
    searchChecklistsOnly,
    searchTemplatesOnly,
    searchPostsOnly,
    clearResults,
  };
}





