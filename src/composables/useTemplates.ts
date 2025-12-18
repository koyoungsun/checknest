import { ref, computed } from "vue";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createChecklistFromTemplate as createChecklistFromTemplateService,
  appendTemplateItemsToChecklist as appendTemplateItemsToChecklistService,
  incrementTemplateLike,
  decrementTemplateLike,
  type TemplateCreateInput,
  type TemplateUpdateInput,
} from "@/services/templates";
import type {
  Template,
  TemplateListFilters,
  TemplateSortOption,
} from "@/types/template";

/**
 * 템플릿 관리 Composable
 */
export const useTemplates = () => {
  const templates = ref<Template[]>([]);
  const currentTemplate = ref<Template | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 템플릿 목록 로드
   */
  const loadTemplates = async (
    filters?: TemplateListFilters,
    sortBy: TemplateSortOption = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) => {
    loading.value = true;
    error.value = null;
    try {
      templates.value = await getTemplates(filters, sortBy, sortOrder);
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 목록 로드 실패:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿 단일 로드
   */
  const loadTemplate = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentTemplate.value = await getTemplate(id);
      if (!currentTemplate.value) {
        throw new Error("템플릿을 찾을 수 없습니다.");
      }
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 로드 실패:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿 생성
   */
  const addTemplate = async (input: TemplateCreateInput) => {
    loading.value = true;
    error.value = null;
    try {
      const id = await createTemplate(input);
      await loadTemplates();
      return id;
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 생성 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿 업데이트
   */
  const editTemplate = async (id: string, input: TemplateUpdateInput) => {
    loading.value = true;
    error.value = null;
    try {
      await updateTemplate(id, input);
      await loadTemplate(id);
      await loadTemplates();
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 업데이트 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿 삭제
   */
  const removeTemplate = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteTemplate(id);
      templates.value = templates.value.filter((t) => t.id !== id);
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
      }
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 삭제 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿으로부터 체크리스트 생성
   */
  const createChecklist = async (
    templateId: string,
    ownerId: string,
    title?: string
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const checklistId = await createChecklistFromTemplateService(
        templateId,
        ownerId,
        title
      );
      return checklistId;
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿으로부터 체크리스트 생성 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿의 items를 체크리스트에 추가 (append 방식)
   */
  const appendTemplateItems = async (
    templateId: string,
    checklistId: string,
    groupId: string
  ) => {
    loading.value = true;
    error.value = null;
    try {
      await appendTemplateItemsToChecklistService(
        templateId,
        checklistId,
        groupId
      );
    } catch (err) {
      error.value = err as Error;
      console.error("템플릿 항목 추가 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 템플릿 좋아요 토글
   * V1에서는 단순 카운트만 증가 (중복 방지는 V2)
   */
  const toggleLike = async (id: string, isLiked: boolean) => {
    try {
      // Optimistic update: UI에 즉시 반영
      if (currentTemplate.value?.id === id) {
        if (isLiked) {
          // 좋아요 취소 (감소)
          currentTemplate.value.likeCount = Math.max(
            0,
            currentTemplate.value.likeCount - 1
          );
          await decrementTemplateLike(id);
        } else {
          // 좋아요 추가 (증가)
          currentTemplate.value.likeCount += 1;
          await incrementTemplateLike(id);
        }
      } else {
        // currentTemplate이 없으면 서버에만 반영
        if (isLiked) {
          await decrementTemplateLike(id);
        } else {
          await incrementTemplateLike(id);
        }
      }
    } catch (err) {
      console.error("템플릿 좋아요 토글 실패:", err);
      // 실패 시 원상복구
      if (currentTemplate.value?.id === id) {
        if (isLiked) {
          currentTemplate.value.likeCount += 1;
        } else {
          currentTemplate.value.likeCount = Math.max(
            0,
            currentTemplate.value.likeCount - 1
          );
        }
      }
      throw err;
    }
  };

  // Computed
  const templatesByCategory = computed(() => {
    const grouped: Record<string, Template[]> = {};
    templates.value.forEach((template) => {
      const category = template.category || "기타";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });
    return grouped;
  });

  return {
    templates,
    currentTemplate,
    loading,
    error,
    templatesByCategory,
    loadTemplates,
    loadTemplate,
    addTemplate,
    editTemplate,
    removeTemplate,
    createChecklist,
    appendTemplateItems,
    toggleLike,
  };
};

