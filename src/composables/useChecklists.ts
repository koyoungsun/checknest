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
   * Home.vue 기준 필터링 규칙:
   * - 기본 todo (isDefault === true)는 포함 (가장 오래된 1개만)
   * - 일반 체크리스트는:
   *   - progress === 100 제외 (완료됨)
   *   - isFinished(item) 제외 (종료됨)
   * 
   * 새로 생성된 체크리스트가 항상 포함되도록 isCompleted === false만 필터링
   */
  const loadMyChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      // Firestore에서 ownerId로 조회 (isCompleted 필터 적용)
      // 새로 생성된 체크리스트가 항상 포함되도록 isCompleted === false만 필터링 (기본값)
      // Home.vue와 동일한 조건: isCompleted === false
      const myChecklists = await getChecklistsService({
        ownerId: currentUser.value.uid,
        isCompleted: isCompleted !== undefined ? isCompleted : false,
      });
      
      // 초기 가라데이터 방지: 배열이 아닌 경우 빈 배열로 처리
      const validMyChecklists = Array.isArray(myChecklists) ? myChecklists : [];
      
      // Home.vue 기준 클라이언트 필터링 적용
      // 종료 여부 확인 헬퍼 함수 (Home.vue와 동일한 로직)
      const getDueDateAsDate = (dueDate: any): Date | null => {
        if (!dueDate) return null;
        
        // Firestore Timestamp인 경우
        if (dueDate && typeof (dueDate as any).toDate === 'function') {
          return (dueDate as any).toDate();
        }
        
        // 이미 Date 객체인 경우
        if (dueDate instanceof Date) {
          return dueDate;
        }
        
        // 문자열인 경우 (YYYY-MM-DD 형식)
        if (typeof dueDate === 'string') {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const date = new Date(dueDate + 'T23:59:59');
            if (!isNaN(date.getTime())) {
              return date;
            }
          } else {
            const date = new Date(dueDate);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
        
        return null;
      };
      
      const isFinished = (item: Checklist): boolean => {
        // 기본 todo 체크리스트는 종료 개념이 없음
        if (item.isDefault === true) {
          return false;
        }
        
        const progress = item.progress || 0;
        
        // progress === 100인 경우만 완료 로직 진입
        if (progress === 100) {
          if (!item.dueDate) {
            return true;
          }
          
          const dueDateObj = getDueDateAsDate(item.dueDate);
          if (dueDateObj) {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            
            if (dueDateObj < now) {
              return true;
            }
            
            return false;
          }
          
          return true;
        }
        
        return false;
      };
      
      // Home.vue 기준 필터링: progress === 100 제외, isFinished 제외
      // 기본 todo는 포함 (나중에 별도 처리)
      const filteredMyChecklists = validMyChecklists.filter((item) => {
        // 기본 todo는 포함 (필터링하지 않음)
        if (item.isDefault === true) {
          return true;
        }
        
        // progress === 100이면 제외 (완료됨)
        const progress = item.progress || 0;
        if (progress === 100) {
          return false;
        }
        
        // 종료된 체크리스트 제외
        if (isFinished(item)) {
          return false;
        }
        
        return true;
      });
      
      // 기존 checklists에서 내가 만든 체크리스트를 제거하고 새로 로드한 것으로 교체
      // 공유 체크리스트는 유지
      const sharedChecklists = checklists.value.filter(
        (c) => c.ownerId !== currentUser.value!.uid
      );
      
      // 동일 id를 가진 체크리스트는 1번만 포함되도록 Set 기반 정규화
      const checklistMap = new Map<string, Checklist>();
      
      // 새로 로드한 내 체크리스트 추가
      filteredMyChecklists.forEach(c => {
        checklistMap.set(c.id, c);
      });
      
      // 기존 공유 체크리스트 추가 (중복 제거)
      sharedChecklists.forEach(c => {
        if (!checklistMap.has(c.id)) {
          checklistMap.set(c.id, c);
        }
      });
      
      // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
      checklists.value = Array.from(checklistMap.values());
    } catch (err: any) {
      handleError(err, "내 체크리스트 목록 로드 실패");
      
      // Firestore 인덱스 오류인 경우 기존 state 유지 (빈 배열로 덮어쓰지 않음)
      if (err?.code === "failed-precondition" && err?.message?.includes("index")) {
        console.warn("[loadMyChecklists] Firestore 인덱스 오류 - 기존 데이터 유지");
        // 기존 checklists.value는 그대로 유지 (초기화하지 않음)
        return;
      }
      
      // 기타 에러 발생 시에도 기존 공유 체크리스트는 유지
      // 내 체크리스트만 제거하지 않고 기존 state 유지
      // (데이터가 갑자기 사라지지 않도록)
    } finally {
      loading.value = false;
    }
  };

  /**
   * 내가 초대된 체크리스트 불러오기
   * members 배열에 currentUser.uid가 포함된 체크리스트를 기준으로 한다.
   * 
   * Home.vue 기준 필터링 규칙:
   * - 기본 todo 체크리스트는 제외
   * - ownerId === currentUser.uid 제외 (myList에 포함됨)
   * - progress === 100인 경우:
   *   - dueDate가 아직 남아있으면 포함
   *   - dueDate가 없거나 지났으면 제외
   * - progress < 100인 경우:
   *   - isFinished(item) 제외 (종료됨)
   * 
   * 새로 생성된 체크리스트가 항상 포함되도록 isCompleted === false만 필터링
   */
  const loadSharedChecklists = async (isCompleted?: boolean) => {
    if (!currentUser.value) {
      error.value = new Error("로그인이 필요합니다.");
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      // memberId로 조회 (isCompleted 필터 적용 - Home.vue와 Lists.vue에서 동일한 조건 사용)
      // 새로 생성된 체크리스트가 항상 포함되도록 isCompleted === false만 필터링
      // Home.vue와 동일한 조건: isCompleted === false
      const allMemberChecklists = await getChecklistsService({
        memberId: currentUser.value.uid,
        isCompleted: isCompleted !== undefined ? isCompleted : false,
      });
      
      // 초기 가라데이터 방지: 배열이 아닌 경우 빈 배열로 처리
      const validMemberChecklists = Array.isArray(allMemberChecklists) ? allMemberChecklists : [];
      
      // Home.vue 기준 클라이언트 필터링 적용
      // 종료일 변환 헬퍼 함수 (Home.vue와 동일한 로직)
      const getDueDateAsDate = (dueDate: any): Date | null => {
        if (!dueDate) return null;
        
        // Firestore Timestamp인 경우
        if (dueDate && typeof (dueDate as any).toDate === 'function') {
          return (dueDate as any).toDate();
        }
        
        // 이미 Date 객체인 경우
        if (dueDate instanceof Date) {
          return dueDate;
        }
        
        // 문자열인 경우 (YYYY-MM-DD 형식)
        if (typeof dueDate === 'string') {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const date = new Date(dueDate + 'T23:59:59');
            if (!isNaN(date.getTime())) {
              return date;
            }
          } else {
            const date = new Date(dueDate);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
        
        return null;
      };
      
      // 종료 여부 확인 헬퍼 함수 (Home.vue와 동일한 로직)
      const isFinished = (item: Checklist): boolean => {
        // 기본 todo 체크리스트는 종료 개념이 없음
        if (item.isDefault === true) {
          return false;
        }
        
        const progress = item.progress || 0;
        
        // progress === 100인 경우만 완료 로직 진입
        if (progress === 100) {
          if (!item.dueDate) {
            return true;
          }
          
          const dueDateObj = getDueDateAsDate(item.dueDate);
          if (dueDateObj) {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            
            if (dueDateObj < now) {
              return true;
            }
            
            return false;
          }
          
          return true;
        }
        
        return false;
      };
      
      // Home.vue 기준 필터링 적용
      const sharedOnly = validMemberChecklists.filter(
        (checklist) => {
          // ownerId가 현재 사용자인 체크리스트는 제외 (myList에 포함됨)
          if (checklist.ownerId === currentUser.value!.uid) {
            return false;
          }
          
          // 기본 todo 체크리스트는 제외
          if (checklist.isDefault === true) {
            return false;
          }
          
          const progress = checklist.progress || 0;
          
          // progress === 100인 경우
          if (progress === 100) {
            // dueDate가 아직 남아있으면 공유 중 영역에 표시
            if (checklist.dueDate) {
              const dueDateObj = getDueDateAsDate(checklist.dueDate);
              if (dueDateObj) {
                const now = new Date();
                now.setHours(23, 59, 59, 999);
                // dueDate가 아직 남아있으면 공유 중 영역에 표시
                if (dueDateObj >= now) {
                  return true;
                }
              }
            }
            // dueDate가 없거나 지났으면 제외 (완료된 체크리스트 영역으로 이동)
            return false;
          }
          
          // progress < 100인 경우
          // 종료된 체크리스트 제외 (dueDate 지남)
          if (isFinished(checklist)) {
            return false;
          }
          
          return true;
        }
      );
      
      // 기존 checklists에서 내가 만든 체크리스트(ownerId === currentUser.uid) 보존
      const myChecklists = checklists.value.filter(
        (c) => c.ownerId === currentUser.value!.uid
      );
      
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
      
      // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
      checklists.value = Array.from(checklistMap.values());
    } catch (err: any) {
      handleError(err, "공유 체크리스트 목록 로드 실패");
      
      // Firestore 인덱스 오류인 경우 기존 state 유지 (빈 배열로 덮어쓰지 않음)
      if (err?.code === "failed-precondition" && err?.message?.includes("index")) {
        console.warn("[loadSharedChecklists] Firestore 인덱스 오류 - 기존 데이터 유지");
        // 기존 checklists.value는 그대로 유지 (초기화하지 않음)
        return;
      }
      
      // 기타 에러 발생 시에도 기존 state 유지
      // (데이터가 갑자기 사라지지 않도록)
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
      // 필수 필드 검증
      if (!input.title || !input.title.trim()) {
        throw new Error("체크리스트 제목은 필수입니다.");
      }
      if (!input.groups || !Array.isArray(input.groups) || input.groups.length === 0) {
        throw new Error("최소 1개 이상의 그룹이 필요합니다.");
      }
      
      // members 배열 처리: ownerId는 별도 필드로 관리하므로 members 배열에는 포함하지 않음
      // 하지만 기존 코드 호환성을 위해 객체 배열 형태로 변환
      const members: Array<{ userId: string; role: 'admin' | 'member' }> = [];
      
      if (input.members && Array.isArray(input.members)) {
        input.members.forEach((member) => {
          // 객체 형태인 경우
          if (typeof member === 'object' && member !== null && 'userId' in member) {
            const memberObj = member as { userId: string; role?: 'admin' | 'member' };
            if (memberObj.userId && memberObj.userId !== currentUser.value.uid) {
              members.push({
                userId: memberObj.userId,
                role: memberObj.role || 'member'
              });
            }
          }
          // 문자열 형태인 경우 (legacy)
          else if (typeof member === 'string' && member !== currentUser.value.uid) {
            members.push({
              userId: member,
              role: 'member'
            });
          }
        });
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
   * 수정: UI가 빈 상태를 즉시 렌더링하지 않도록 loading 상태를 함께 관리
   */
  const resetChecklists = () => {
    // loading 상태를 true로 설정하여 UI가 빈 상태를 렌더링하지 않도록 함
    loading.value = true;
    checklists.value = [];
    // reset 후 즉시 load가 호출되므로 loading은 load 함수에서 false로 변경됨
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
