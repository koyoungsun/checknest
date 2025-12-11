import { ref, computed } from "vue";
import { FirestoreError } from "firebase/firestore";
import { useAuth } from "./useAuth";
import {
  getChecklists,
  getChecklist,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  updateChecklistProgress,
  type ChecklistCreateInput,
  type ChecklistUpdateInput,
} from "@/services/checklists";
import type { Checklist } from "@/types/checklist";

/**
 * 체크리스트 관리 Composable
 */
export const useChecklists = () => {
  const { currentUser } = useAuth();
  const checklists = ref<Checklist[]>([]);
  const currentChecklist = ref<Checklist | null>(null);
  const loading = ref(false);
  const error = ref<Error | FirestoreError | null>(null);

  /**
   * 에러 핸들링 헬퍼
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    if (err instanceof FirestoreError) {
      error.value = err;
      console.error(`${defaultMessage} (FirestoreError):`, err.code, err.message);
    } else if (err instanceof Error) {
      error.value = err;
      console.error(`${defaultMessage}:`, err.message);
    } else {
      error.value = new Error(defaultMessage);
      console.error(defaultMessage, err);
    }
  };

  /**
   * 체크리스트 목록 로드
   * 
   * filters를 명확하게 분기 처리:
   * - ownerId만 제공: 내가 만든 체크리스트만 조회
   * - memberId만 제공: 내가 초대된 체크리스트만 조회
   * - 둘 다 제공: 두 조건 모두 만족하는 체크리스트 조회 (실제로는 없을 수 있음)
   * - 둘 다 없음: 모든 체크리스트 조회 (권한 확인 필요)
   */
  const loadChecklists = async (filters?: {
    ownerId?: string;
    memberId?: string;
    isCompleted?: boolean;
  }) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      // filters를 그대로 전달 (기본값 강제하지 않음)
      checklists.value = await getChecklists(filters);
    } catch (err) {
      handleError(err, "체크리스트 목록 로드 실패");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 내가 만든 체크리스트 불러오기
   */
  const loadMyChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    await loadChecklists({
      ownerId: currentUser.value.uid,
      isCompleted,
    });
  };

  /**
   * 내가 초대된 체크리스트 불러오기
   */
  const loadSharedChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    await loadChecklists({
      memberId: currentUser.value.uid,
      isCompleted,
    });
  };

  /**
   * 체크리스트 단일 로드
   */
  const loadChecklist = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const checklist = await getChecklist(id);
      if (!checklist) {
        throw new Error("체크리스트를 찾을 수 없습니다.");
      }
      currentChecklist.value = checklist;
    } catch (err) {
      handleError(err, "체크리스트 로드 실패");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 체크리스트 생성
   */
  const addChecklist = async (input: Omit<ChecklistCreateInput, "ownerId">) => {
    if (!currentUser.value) {
      throw new Error("로그인이 필요합니다.");
    }

    loading.value = true;
    error.value = null;
    try {
      const id = await createChecklist({
        ...input,
        ownerId: currentUser.value.uid,
      });
      
      // 새로 생성된 체크리스트를 목록에 추가 (Firestore 재조회 없이)
      const newChecklist: Checklist = {
        id,
        ownerId: currentUser.value.uid,
        title: input.title,
        description: input.description || "",
        dueDate: null,
        createdAt: {} as any, // 서버에서 생성됨
        createdAtNum: Date.now(),
        updatedAt: {} as any,
        isCompleted: false,
        progress: 0,
        members: input.members || [currentUser.value.uid],
        rolesEnabled: input.rolesEnabled || false,
        templateId: input.templateId || null,
      };
      checklists.value.unshift(newChecklist);
      
      return id;
    } catch (err) {
      handleError(err, "체크리스트 생성 실패");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 체크리스트 업데이트
   * 
   * 최적화: 불필요한 loadChecklist/loadChecklists 호출 제거
   * 변경된 값은 state에 직접 patch하여 Firestore 호출 비용 절감
   */
  const editChecklist = async (
    id: string,
    input: ChecklistUpdateInput
  ) => {
    loading.value = true;
    error.value = null;
    try {
      await updateChecklist(id, input);

      // 현재 체크리스트가 업데이트된 것이라면 state에 직접 patch
      if (currentChecklist.value?.id === id) {
        // input의 필드만 선택적으로 업데이트
        if (input.title !== undefined) currentChecklist.value.title = input.title;
        if (input.description !== undefined) currentChecklist.value.description = input.description;
        if (input.dueDate !== undefined) {
          // dueDate는 Date를 Timestamp로 변환해야 하지만, 여기서는 서버에서 처리된 값으로 간주
          // 실제로는 서버에서 업데이트된 값을 다시 가져와야 하지만, 성능을 위해 부분 업데이트
        }
        if (input.isCompleted !== undefined) currentChecklist.value.isCompleted = input.isCompleted;
        if (input.progress !== undefined) currentChecklist.value.progress = input.progress;
        if (input.members !== undefined) currentChecklist.value.members = input.members;
        if (input.rolesEnabled !== undefined) currentChecklist.value.rolesEnabled = input.rolesEnabled;
        currentChecklist.value.updatedAt = {} as any; // 서버에서 업데이트됨
      }

      // 목록에서도 해당 체크리스트 업데이트
      const index = checklists.value.findIndex((c) => c.id === id);
      if (index !== -1 && checklists.value[index]) {
        const checklist = checklists.value[index];
        if (input.title !== undefined) checklist.title = input.title;
        if (input.description !== undefined) checklist.description = input.description;
        if (input.isCompleted !== undefined) checklist.isCompleted = input.isCompleted;
        if (input.progress !== undefined) checklist.progress = input.progress;
        if (input.members !== undefined) checklist.members = input.members;
        if (input.rolesEnabled !== undefined) checklist.rolesEnabled = input.rolesEnabled;
        checklist.updatedAt = {} as any;
      }
    } catch (err) {
      handleError(err, "체크리스트 업데이트 실패");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 체크리스트 삭제
   */
  const removeChecklist = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteChecklist(id);
      
      // state에서 직접 제거 (Firestore 재조회 없이)
      checklists.value = checklists.value.filter((c) => c.id !== id);
      if (currentChecklist.value?.id === id) {
        currentChecklist.value = null;
      }
    } catch (err) {
      handleError(err, "체크리스트 삭제 실패");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 진행률 업데이트
   * 
   * 최적화: 진행률만 업데이트하고 state에 직접 patch
   */
  const refreshProgress = async (id: string) => {
    try {
      await updateChecklistProgress(id);
      
      // 진행률 업데이트 후 최신 정보만 가져오기
      const updatedChecklist = await getChecklist(id);
      if (updatedChecklist) {
        // 현재 체크리스트가 업데이트된 것이라면 state에 직접 patch
        if (currentChecklist.value?.id === id && currentChecklist.value) {
          currentChecklist.value.progress = updatedChecklist.progress;
          currentChecklist.value.isCompleted = updatedChecklist.isCompleted;
        }

        // 목록에서도 진행률 업데이트
        const index = checklists.value.findIndex((c) => c.id === id);
        if (index !== -1 && checklists.value[index]) {
          checklists.value[index].progress = updatedChecklist.progress;
          checklists.value[index].isCompleted = updatedChecklist.isCompleted;
        }
      }
    } catch (err) {
      handleError(err, "진행률 업데이트 실패");
      throw err;
    }
  };

  // Computed
  /**
   * 내가 만든 체크리스트
   * 단순화: ownerId === currentUser.uid 기준
   */
  const myChecklists = computed(() => {
    if (!currentUser.value) return [];
    return checklists.value.filter(
      (c) => c.ownerId === currentUser.value!.uid
    );
  });

  /**
   * 공유된 체크리스트
   * 재정의: owner가 아니면서 members에 내가 포함되어 있는 경우
   */
  const sharedChecklists = computed(() => {
    if (!currentUser.value) return [];
    const userId = currentUser.value.uid;
    return checklists.value.filter(
      (c) => c.ownerId !== userId && c.members.includes(userId)
    );
  });

  return {
    checklists,
    currentChecklist,
    loading,
    error,
    myChecklists,
    sharedChecklists,
    loadChecklists,
    loadMyChecklists,
    loadSharedChecklists,
    loadChecklist,
    addChecklist,
    editChecklist,
    removeChecklist,
    refreshProgress,
  };
};
