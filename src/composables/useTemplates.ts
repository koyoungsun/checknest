import { ref, computed } from "vue";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createChecklistFromTemplate as createChecklistFromTemplateService,
  type TemplateCreateInput,
  type TemplateUpdateInput,
} from "@/services/templates";
import type { Template } from "@/types/template";

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
  const loadTemplates = async (category?: string) => {
    loading.value = true;
    error.value = null;
    try {
      templates.value = await getTemplates({ category });
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
  };
};

