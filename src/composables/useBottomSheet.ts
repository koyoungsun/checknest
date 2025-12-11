import { ref } from "vue";
import { useRouter } from "vue-router";

/**
 * 바텀시트 관리 Composable
 */
export const useBottomSheet = () => {
  const router = useRouter();
  const isOpen = ref(false);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const goToChecklistCreate = () => {
    router.push("/checklists/new");
    close();
  };

  const goToTemplateCreate = () => {
    router.push("/templates/new");
    close();
  };

  const goToPostWrite = () => {
    router.push("/posts/write");
    close();
  };

  return {
    isOpen,
    open,
    close,
    goToChecklistCreate,
    goToTemplateCreate,
    goToPostWrite,
  };
};

