import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getChecklists, createChecklist } from "@/services/checklists";

// 모듈 레벨 변수: 기본 체크리스트 초기화 플래그 (전역적으로 관리)
let hasInitialized = false;
let initializationInProgress = false; // 진행 중인 요청 추적

/**
 * 기본 개인 체크리스트 생성 (최초 로그인 시)
 * 
 * 요구사항:
 * - isDefault === true 인 'todo' 리스트가 없을 경우만 실행
 * - 중복 생성 절대 금지
 * - 로그인 후 최초 1회만 자동 생성
 * - 여러 컴포넌트에서 동시 호출되어도 안전하게 처리
 */
const createDefaultChecklist = async (user: User): Promise<void> => {
  // 중복 실행 방지: 이미 초기화되었거나 진행 중이면 즉시 return
  if (hasInitialized || initializationInProgress) {
    console.log("[INIT] default checklist initialization skipped (already initialized or in progress)");
    return;
  }

  try {
    initializationInProgress = true;

    // 안전장치: ownerId + isDefault === true 조건으로 이미 기본 체크리스트가 존재하면 즉시 return
    const existingChecklists = await getChecklists({
      ownerId: user.uid,
    });

    // isDefault === true 인 체크리스트가 있는지 확인
    const hasDefaultChecklist = existingChecklists.some(
      (checklist) => checklist.isDefault === true
    );

    if (hasDefaultChecklist) {
      console.log("[INIT] default checklist already exists");
      hasInitialized = true; // 이미 존재하므로 초기화 완료로 표시
      return;
    }

    // 기본 체크리스트 생성
    // members는 [user.uid]로 명시적으로 설정 (서비스에서도 ownerId를 추가하지만, 명시적으로 설정)
    // V1에서는 채팅을 기본 항상 활성으로 유지 (chatEnabled: true 명시)
    // groups 배열 필수: 기본 그룹 1개 생성
    console.log("[INIT] default checklist created");
    await createChecklist({
      ownerId: user.uid,
      title: "todo",
      description: "",
      groups: [{
        groupId: crypto.randomUUID(),
        groupName: "Group default",
        order: 0
      }],
      members: [user.uid], // 명시적으로 user.uid 포함 (서비스에서도 추가하지만 중복 방지)
      rolesEnabled: false,
      isDefault: true, // 기본 체크리스트로 표시
      chatEnabled: true, // V1에서는 채팅을 기본 항상 활성으로 유지
      dueDate: null, // 마감일 없음
    });
    
    hasInitialized = true; // 생성 완료 후 초기화 완료로 표시
  } catch (error) {
    console.error("[createDefaultChecklist] 기본 체크리스트 생성 실패:", error);
    // 에러가 발생해도 로그인 플로우는 계속 진행
  } finally {
    initializationInProgress = false;
  }
};

/**
 * 인증 상태 관리 Composable
 */
export const useAuth = () => {
  const router = useRouter();
  const currentUser = ref<User | null>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      currentUser.value = user;
      loading.value = false;

      // 로그인 유저가 감지되면 기본 체크리스트 생성 확인
      // createDefaultChecklist 내부에서 중복 실행 방지 로직 처리
      if (user) {
        await createDefaultChecklist(user);
      }
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  /**
   * 로그인 필요 시 리다이렉트
   */
  const requireAuth = () => {
    if (!currentUser.value) {
      router.push("/login");
      return false;
    }
    return true;
  };

  return {
    currentUser,
    loading,
    requireAuth,
  };
};






