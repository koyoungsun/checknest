import { ref, computed } from "vue";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  updateItemsOrder,
  type ItemUpdateInput,
} from "@/services/items";
import type { Item } from "@/types/item";

/**
 * 항목 관리 Composable
 */
export const useItems = (checklistId: string) => {
  const items = ref<Item[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 항목 목록 로드
   */
  const loadItems = async () => {
    loading.value = true;
    error.value = null;
    try {
      items.value = await getItems(checklistId);
    } catch (err) {
      error.value = err as Error;
      console.error("항목 목록 로드 실패:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 항목 추가
   */
  const addItem = async (input: {
    name: string;
    isDone?: boolean;
    assignedTo?: string | null;
    order: number;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const id = await createItem({
        ...input,
        checklistId,
      });
      await loadItems();
      return id;
    } catch (err) {
      error.value = err as Error;
      console.error("항목 추가 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 항목 업데이트
   */
  const editItem = async (id: string, input: ItemUpdateInput) => {
    loading.value = true;
    error.value = null;
    try {
      await updateItem(id, input);
      await loadItems();
    } catch (err) {
      error.value = err as Error;
      console.error("항목 업데이트 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 항목 삭제
   */
  const removeItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteItem(id);
      items.value = items.value.filter((item) => item.id !== id);
    } catch (err) {
      error.value = err as Error;
      console.error("항목 삭제 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 항목 완료 토글
   */
  const toggleItem = async (id: string) => {
    const item = items.value.find((i) => i.id === id);
    if (!item) return;

    await editItem(id, { isDone: !item.isDone });
  };

  /**
   * 항목 순서 변경
   */
  const reorderItems = async (newOrder: { id: string; order: number }[]) => {
    loading.value = true;
    error.value = null;
    try {
      await updateItemsOrder(newOrder);
      await loadItems();
    } catch (err) {
      error.value = err as Error;
      console.error("항목 순서 변경 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Computed
  const completedItems = computed(() =>
    items.value.filter((item) => item.isDone)
  );

  const pendingItems = computed(() =>
    items.value.filter((item) => !item.isDone)
  );

  const progress = computed(() => {
    if (items.value.length === 0) return 0;
    const completed = completedItems.value.length;
    return Math.round((completed / items.value.length) * 100);
  });

  return {
    items,
    loading,
    error,
    completedItems,
    pendingItems,
    progress,
    loadItems,
    addItem,
    editItem,
    removeItem,
    toggleItem,
    reorderItems,
  };
};

