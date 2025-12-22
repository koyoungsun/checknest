import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { auth, googleProvider } from "@/firebase/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { getChecklists, createChecklist } from "@/services/checklists";
import { createUserProfile } from "@/services/userService";

// 모듈 레벨 변수: 기본 체크리스트 초기화 플래그 (전역적으로 관리)
// 수정: 중복 초기화 방지를 위한 강화된 플래그 관리
let hasInitialized = false;
let initializationInProgress = false; // 진행 중인 요청 추적
let initializedUserId: string | null = null; // 초기화된 사용자 ID 추적

// 모듈 레벨: 인증 상태 관리 (전역 단일 인스턴스)
const globalAuthState = {
  currentUser: ref<User | null>(null),
  loading: ref(true),
  authReady: ref(false),
  unsubscribe: null as (() => void) | null,
};

// 앱 시작 시 한 번만 구독 설정 (모듈 로드 시 즉시 실행)
// main.ts에서 이 모듈을 import하면 자동으로 실행됨
if (!globalAuthState.unsubscribe) {
  globalAuthState.unsubscribe = onAuthStateChanged(auth, async (user) => {
    globalAuthState.currentUser.value = user;
    globalAuthState.loading.value = false;
    globalAuthState.authReady.value = true;

    // 로그인 유저가 감지되면 기본 체크리스트 생성 확인
    if (user) {
      await createDefaultChecklist(user);
    }
  });
}

/**
 * 기본 개인 체크리스트 생성 (최초 로그인 시)
 * 
 * 요구사항:
 * - isDefault === true 인 'todo' 리스트가 없을 경우만 실행
 * - 중복 생성 절대 금지
 * - 로그인 후 최초 1회만 자동 생성
 * - 여러 컴포넌트에서 동시 호출되어도 안전하게 처리
 * - onAuthStateChanged 중복 실행 방지
 * - 실제 사용자 체크리스트 로딩과 완전히 분리 (백그라운드에서만 실행)
 */
const createDefaultChecklist = async (user: User): Promise<void> => {
  // 중복 실행 방지: 이미 초기화되었거나 진행 중이면 즉시 return
  // 같은 사용자에 대해 이미 초기화되었는지도 확인
  if (hasInitialized && initializedUserId === user.uid) {
    return; // 로그 출력 없이 조용히 return (중복 로그 방지)
  }
  
  if (initializationInProgress) {
    return; // 로그 출력 없이 조용히 return (중복 로그 방지)
  }

  try {
    initializationInProgress = true;

    // 안전장치: ownerId + isDefault === true 조건으로 이미 기본 체크리스트가 존재하면 즉시 return
    // 수정: isCompleted 필터 없이 조회하여 모든 체크리스트 확인
    const existingChecklists = await getChecklists({
      ownerId: user.uid,
      // isCompleted 필터 제거: 모든 체크리스트를 확인하여 정확한 판단
    });

    // isDefault === true 인 체크리스트가 있는지 확인
    const hasDefaultChecklist = existingChecklists.some(
      (checklist) => checklist.isDefault === true
    );

    if (hasDefaultChecklist) {
      hasInitialized = true; // 이미 존재하므로 초기화 완료로 표시
      initializedUserId = user.uid; // 사용자 ID 저장
      return; // 로그 출력 없이 return (중복 로그 방지)
    }

    // 기본 체크리스트 생성 (isDefault === true인 체크리스트가 없을 때만)
    // members 배열: ownerId는 별도 필드로 관리하므로 빈 배열로 전달
    // (createChecklist 서비스에서 ownerId를 members에 추가하지 않도록 수정됨)
    await createChecklist({
      ownerId: user.uid,
      title: "todo",
      description: "",
      groups: [{
        groupId: crypto.randomUUID(),
        groupName: "Group default",
        order: 0
      }],
      members: [], // 빈 배열 (ownerId는 별도 필드로 관리)
      rolesEnabled: false,
      isDefault: true, // 기본 체크리스트로 표시
      chatEnabled: false, // 기본 todo는 채팅 비활성
      dueDate: null, // 마감일 없음
    });
    
    hasInitialized = true; // 생성 완료 후 초기화 완료로 표시
    initializedUserId = user.uid; // 사용자 ID 저장
  } catch (error) {
    console.error("[createDefaultChecklist] 기본 체크리스트 생성 실패:", error);
    // 에러가 발생해도 로그인 플로우는 계속 진행
    // 기본 체크리스트 생성 실패는 치명적이지 않음
  } finally {
    initializationInProgress = false;
  }
};

/**
 * Firebase Auth 에러 코드를 사용자 친화적 메시지로 변환
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "유효하지 않은 이메일 주소입니다.",
    "auth/user-disabled": "이 계정은 비활성화되었습니다.",
    "auth/user-not-found": "등록되지 않은 이메일입니다.",
    "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
    "auth/weak-password": "비밀번호가 너무 약합니다. 6자 이상 입력해주세요.",
    "auth/operation-not-allowed": "이 로그인 방법은 허용되지 않습니다.",
    "auth/too-many-requests": "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
    "auth/network-request-failed": "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
    "auth/popup-closed-by-user": "로그인 창이 닫혔습니다.",
    "auth/cancelled-popup-request": "로그인 요청이 취소되었습니다.",
  };

  return errorMessages[errorCode] || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
};

/**
 * 인증 상태 관리 Composable
 */
export const useAuth = () => {
  const router = useRouter();

  // 전역 상태 참조 반환
  const currentUser = globalAuthState.currentUser;
  const loading = globalAuthState.loading;
  const authReady = globalAuthState.authReady;

  // computed로 isLoggedIn 제공
  const isLoggedIn = computed(() => !!currentUser.value);

  /**
   * 이메일/비밀번호로 회원가입
   */
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // displayName이 제공되면 프로필 업데이트
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Firestore users 문서 생성
      try {
        await createUserProfile(user);
      } catch (profileError) {
        console.error("[useAuth] Firestore 사용자 프로필 생성 실패:", profileError);
        // 프로필 생성 실패해도 회원가입은 성공으로 처리
      }

      console.log("[useAuth] 회원가입 성공:", user.uid);
    } catch (error: any) {
      console.error("[useAuth] 회원가입 실패:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  /**
   * 이메일/비밀번호로 로그인
   */
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[useAuth] 이메일 로그인 성공:", userCredential.user.uid);
    } catch (error: any) {
      console.error("[useAuth] 이메일 로그인 실패:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  /**
   * 비밀번호 재설정 이메일 발송
   */
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("[useAuth] 비밀번호 재설정 이메일 발송 성공");
    } catch (error: any) {
      console.error("[useAuth] 비밀번호 재설정 이메일 발송 실패:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  /**
   * 구글 로그인
   */
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("[useAuth] 구글 로그인 성공:", user.uid);

      // Firestore users 문서가 없으면 생성
      try {
        const { getUserProfile, createUserProfile } = await import("@/services/userService");
        // 본인 프로필 조회 (currentUserId 전달하여 항상 조회 가능)
        const existingProfile = await getUserProfile(user.uid, user.uid);
        if (!existingProfile) {
          // 기본적으로 공개 프로필로 생성 (isPublicProfile: true)
          await createUserProfile(user, true);
        }
      } catch (profileError) {
        console.error("[useAuth] Firestore 사용자 프로필 확인/생성 실패:", profileError);
        // 프로필 생성 실패해도 로그인은 성공으로 처리
      }
    } catch (error: any) {
      console.error("[useAuth] 구글 로그인 실패:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  /**
   * 로그아웃
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      console.log("[useAuth] 로그아웃 성공");
    } catch (error: any) {
      console.error("[useAuth] 로그아웃 실패:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

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
    authReady,
    isLoggedIn,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordReset,
    signInWithGoogle,
    signOut,
    requireAuth,
  };
};






