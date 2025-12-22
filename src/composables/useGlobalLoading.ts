import { computed } from "vue";
import { useChecklists } from "./useChecklists";
import { usePosts } from "./usePosts";
import { useTemplates } from "./useTemplates";
import { useBoards } from "./useBoards";
import { useSearch } from "./useSearch";
import { useNotifications } from "./useNotifications";
import { useUserProfile } from "./useUserProfile";

/**
 * 전역 로딩 상태 관리 Composable
 * 
 * 각 composable의 loading 상태를 통합하여 전역 로딩 상태를 제공합니다.
 * 하나 이상의 composable이 로딩 중이면 전역 로딩 상태가 true가 됩니다.
 * 
 * 주의: useComments, useItems, useChats는 함수형 composable이므로
 * 전역에서 직접 참조할 수 없어 제외됩니다.
 */
export const useGlobalLoading = () => {
  // 각 composable의 loading 상태 참조
  const { loading: checklistsLoading } = useChecklists();
  const { loading: postsLoading } = usePosts();
  const { loading: templatesLoading } = useTemplates();
  const { loading: boardsLoading } = useBoards();
  const { loading: searchLoading } = useSearch();
  const { loading: notificationsLoading } = useNotifications();
  const { loading: userProfileLoading } = useUserProfile();

  // 전역 로딩 상태: 하나 이상의 composable이 로딩 중이면 true
  const isLoading = computed(() => {
    return (
      checklistsLoading.value ||
      postsLoading.value ||
      templatesLoading.value ||
      boardsLoading.value ||
      searchLoading.value ||
      notificationsLoading.value ||
      userProfileLoading.value
    );
  });

  return {
    isLoading,
  };
};

