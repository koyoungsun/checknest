import { ref, computed } from "vue";
import { FirestoreError, Timestamp } from "firebase/firestore";
import { useAuth } from "./useAuth";
import {
  getChecklists as getChecklistsService,
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
      checklists.value = await getChecklistsService(filters);
    } catch (err) {
      handleError(err, "체크리스트 목록 로드 실패");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 내가 만든 체크리스트 불러오기
   * ownerId === currentUser.uid 인 체크리스트만 가져옴
   * 
   * 기본 todo는 Firestore에서 가져온 데이터만 사용하며, 별도로 추가하거나 병합하지 않음
   */
  const loadMyChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      console.log("[loadMyChecklists] 시작 - ownerId:", currentUser.value.uid);
      
      // Firestore에서 ownerId로 조회한 결과만 사용 (isCompleted 필터 적용)
      const myChecklists = await getChecklistsService({
        ownerId: currentUser.value.uid,
        isCompleted,
      });
      
      console.log("[loadMyChecklists] Firestore에서 가져온 내 체크리스트:", myChecklists.length, "개");
      console.log("[loadMyChecklists] 내 체크리스트 상세:", myChecklists.map(c => ({
        id: c.id,
        title: c.title,
        ownerId: c.ownerId,
        members: c.members,
        membersLength: c.members.length,
        isDefault: c.isDefault
      })));
      
      // 기존 checklists에서 내가 만든 체크리스트를 제거하고 새로 로드한 것으로 교체
      // 공유 체크리스트는 유지
      const sharedChecklists = checklists.value.filter(
        (c) => c.ownerId !== currentUser.value!.uid
      );
      
      console.log("[loadMyChecklists] 기존 공유 체크리스트:", sharedChecklists.length, "개");
      
      // 동일 id를 가진 체크리스트는 1번만 포함되도록 Set 기반 정규화
      const checklistMap = new Map<string, Checklist>();
      
      // 새로 로드한 내 체크리스트 추가
      myChecklists.forEach(c => {
        checklistMap.set(c.id, c);
      });
      
      // 기존 공유 체크리스트 추가 (중복 제거)
      sharedChecklists.forEach(c => {
        if (!checklistMap.has(c.id)) {
          checklistMap.set(c.id, c);
        }
      });
      
      checklists.value = Array.from(checklistMap.values());
      
      console.log("[loadMyChecklists] 최종 checklists.value:", checklists.value.length, "개");
      console.log("[loadMyChecklists] 기본 todo 포함 여부:", checklists.value.some(c => c.isDefault === true));
    } catch (err) {
      handleError(err, "내 체크리스트 목록 로드 실패");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 내가 초대된 체크리스트 불러오기
   * members 배열에 currentUser.uid가 포함된 체크리스트를 기준으로 한다.
   * 
   * 필터링 규칙:
   * - 기본 todo 체크리스트는 제외
   * - status === 'archived' 인 체크리스트는 제외
   * - progress === 100 이거나 status === 'completed' 인 체크리스트도
   *   종료일이 남아있다면 sharedList에 계속 노출
   * 
   * 기본 todo는 Firestore에서 가져온 데이터만 사용하며, 별도로 보존하거나 병합하지 않음
   */
  const loadSharedChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      console.log("[loadSharedChecklists] 시작 - memberId:", currentUser.value.uid);
      
      // memberId로 조회 (isCompleted 필터는 사용하지 않음 - 클라이언트에서 필터링)
      const allMemberChecklists = await getChecklistsService({
        memberId: currentUser.value.uid,
      });
      
      console.log("[loadSharedChecklists] Firestore에서 가져온 모든 멤버 체크리스트:", allMemberChecklists.length, "개");
      
      // 종료일이 남아있는지 확인하는 헬퍼 함수
      const hasRemainingDueDate = (checklist: Checklist): boolean => {
        if (!checklist.dueDate) return false;
        
        // Firestore Timestamp인 경우
        let dueDateObj: Date | null = null;
        if (checklist.dueDate && typeof (checklist.dueDate as any).toDate === 'function') {
          dueDateObj = (checklist.dueDate as any).toDate();
        } else if (checklist.dueDate instanceof Date) {
          dueDateObj = checklist.dueDate;
        }
        
        if (!dueDateObj) return false;
        
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return dueDateObj >= now;
      };
      
      // ownerId가 아닌 체크리스트만 필터링하고, 필터링 규칙 적용
      const sharedOnly = allMemberChecklists.filter(
        (checklist) => {
          // ownerId가 현재 사용자인 체크리스트는 제외 (myList에 포함됨)
          if (checklist.ownerId === currentUser.value!.uid) {
            return false;
          }
          
          // 기본 todo 체크리스트는 제외
          if (checklist.isDefault === true) {
            return false;
          }
          
          // status === 'archived' 인 체크리스트는 제외
          const status = (checklist as any).status;
          if (status === 'archived') {
            return false;
          }
          
          // progress === 100 이거나 status === 'completed' 인 경우
          const progress = checklist.progress || 0;
          const isCompleted = progress === 100 || status === 'completed' || checklist.isCompleted === true;
          
          if (isCompleted) {
            // 종료일이 남아있다면 포함, 없거나 지났다면 제외
            return hasRemainingDueDate(checklist);
          }
          
          // 그 외의 경우는 포함
          return true;
        }
      );
      
      console.log("[loadSharedChecklists] 필터링된 공유 체크리스트:", sharedOnly.length, "개");
      console.log("[loadSharedChecklists] 공유 체크리스트 상세:", sharedOnly.map(c => ({
        id: c.id,
        title: c.title,
        ownerId: c.ownerId,
        members: c.members,
        membersLength: c.members.length,
        progress: c.progress,
        status: (c as any).status,
        isCompleted: c.isCompleted,
        dueDate: c.dueDate
      })));
      
      // 기존 checklists에서 내가 만든 체크리스트(ownerId === currentUser.uid) 보존
      const myChecklists = checklists.value.filter(
        (c) => c.ownerId === currentUser.value!.uid
      );
      
      console.log("[loadSharedChecklists] 기존 내 체크리스트:", myChecklists.length, "개");
      
      // 동일 id를 가진 체크리스트는 1번만 포함되도록 Map 기반 정규화
      const checklistMap = new Map<string, Checklist>();
      
      // 기존 내 체크리스트 추가
      myChecklists.forEach(c => {
        checklistMap.set(c.id, c);
      });
      
      // 새로 로드한 공유 체크리스트 추가 (중복 제거)
      sharedOnly.forEach(c => {
        if (!checklistMap.has(c.id)) {
          checklistMap.set(c.id, c);
        }
      });
      
      checklists.value = Array.from(checklistMap.values());
      
      console.log("[loadSharedChecklists] 최종 checklists.value:", checklists.value.length, "개");
      console.log("[loadSharedChecklists] 기본 todo 포함 여부:", checklists.value.some(c => c.isDefault === true));
    } catch (err) {
      handleError(err, "공유 체크리스트 목록 로드 실패");
    } finally {
      loading.value = false;
    }
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
      // members 배열에 ownerId가 없으면 추가
      const members = input.members || [];
      if (!members.includes(currentUser.value.uid)) {
        members.push(currentUser.value.uid);
      }
      
      // 2. createChecklist 호출 직전에 dueDate 확인 로그 추가
      console.log("[addChecklist] input.dueDate:", input.dueDate, input.dueDate instanceof Date);
      console.log("[addChecklist] input 전체:", {
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        dueDateType: typeof input.dueDate,
        dueDateIsDate: input.dueDate instanceof Date,
        members: input.members,
        rolesEnabled: input.rolesEnabled,
        isDefault: input.isDefault,
      });
      
      // createChecklist에 전달할 데이터 준비
      const createChecklistInput = {
        ...input,
        ownerId: currentUser.value.uid,
        members: members, // ownerId가 포함된 members 배열
      };
      
      console.log("[addChecklist] createChecklist 호출 전 최종 input:", {
        ...createChecklistInput,
        dueDate: createChecklistInput.dueDate,
        dueDateType: typeof createChecklistInput.dueDate,
        dueDateIsDate: createChecklistInput.dueDate instanceof Date,
      });
      
      const id = await createChecklist(createChecklistInput);
      
      console.log("[addChecklist] 체크리스트 생성 성공, ID:", id);
      console.log("[addChecklist] 생성된 체크리스트 정보:", {
        id,
        ownerId: currentUser.value.uid,
        title: input.title,
        members: members,
        membersLength: members.length
      });
      
      // 새로 생성된 체크리스트를 목록에 추가
      // createdAt은 서버에서 생성되므로 실제 데이터를 가져와서 사용
      // getChecklist는 원본 필드를 유지하므로 (id: doc.id, ...doc.data() 패턴) 모든 필드가 보존됨
      const createdChecklist = await getChecklist(id);
      if (createdChecklist) {
        console.log("[addChecklist] 추가 전 checklists.value:", checklists.value.length, "개");
        checklists.value.unshift(createdChecklist);
        console.log("[addChecklist] 추가 후 checklists.value:", checklists.value.length, "개");
        console.log("[addChecklist] 추가된 체크리스트:", checklists.value[0]);
      } else {
        // 조회 실패 시 (거의 발생하지 않음)
        console.warn("[addChecklist] 생성된 체크리스트를 조회할 수 없습니다. ID:", id);
        // 다음 로드 시 정상 데이터로 교체되므로 여기서는 로그만 남김
      }
      
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
        if (input.isDefault !== undefined) currentChecklist.value.isDefault = input.isDefault;
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
        if (input.isDefault !== undefined) checklist.isDefault = input.isDefault;
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
   * 단순화: isDefault === true 기준
   */
  const myChecklists = computed(() => {
    if (!currentUser.value) return [];
    return checklists.value.filter(
      (c) => c.isDefault === true
    );
  });

  /**
   * 공유된 체크리스트
   * 단순화: isDefault !== true && isCompleted !== true
   */
  const sharedChecklists = computed(() => {
    if (!currentUser.value) return [];
    return checklists.value.filter(
      (c) => c.isDefault !== true && c.isCompleted !== true
    );
  });

  /**
   * checklists 초기화 (외부에서 호출 가능)
   */
  const resetChecklists = () => {
    checklists.value = [];
  };

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
    resetChecklists,
  };
};
