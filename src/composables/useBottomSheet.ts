import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

/**
 * 바텀시트 관리 Composable
 */
export const useBottomSheet = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const isOpen = ref(false);
  const showLoginPrompt = ref(false);

  const open = () => {
    // 로그인 체크: 로그인하지 않은 경우 로그인 유도 모달 표시
    if (!currentUser.value) {
      showLoginPrompt.value = true;
      return;
    }
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const closeLoginPrompt = () => {
    showLoginPrompt.value = false;
  };

  const goToChecklistCreate = () => {
    // 로그인 체크
    if (!currentUser.value) {
      showLoginPrompt.value = true;
      close();
      return;
    }
    router.push("/checklists/new");
    close();
  };

  const goToTemplateCreate = () => {
    // 로그인 체크
    if (!currentUser.value) {
      showLoginPrompt.value = true;
      close();
      return;
    }
    router.push("/templates/new");
    close();
  };

  const goToPostWrite = () => {
    // 로그인 체크
    if (!currentUser.value) {
      showLoginPrompt.value = true;
      close();
      return;
    }
    router.push("/posts/write");
    close();
  };

  return {
    isOpen,
    showLoginPrompt,
    open,
    close,
    closeLoginPrompt,
    goToChecklistCreate,
    goToTemplateCreate,
    goToPostWrite,
  };
};







