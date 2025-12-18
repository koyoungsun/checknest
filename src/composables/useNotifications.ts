import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  type NotificationCreateInput,
} from "@/services/notifications";
import type { Notification } from "@/types/notification";

/**
 * 알람 관리 Composable
 */
export function useNotifications() {
  const { currentUser } = useAuth();
  const notifications = ref<Notification[]>([]);
  const hasUnread = ref(false);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 읽지 않은 알람 존재 여부 조회
   */
  const checkUnreadNotifications = async () => {
    if (!currentUser.value) {
      hasUnread.value = false;
      return;
    }

    try {
      const count = await getUnreadNotificationCount(currentUser.value.uid);
      hasUnread.value = count > 0;
    } catch (err: any) {
      console.error("[useNotifications] 읽지 않은 알람 확인 실패:", err?.message || err);
      hasUnread.value = false;
    }
  };

  /**
   * 알람 목록 로드
   */
  const loadNotifications = async () => {
    if (!currentUser.value) {
      notifications.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      notifications.value = await getNotifications(currentUser.value.uid);
      // 읽지 않은 알람 존재 여부 업데이트
      hasUnread.value = notifications.value.some((n) => !n.read);
    } catch (err: any) {
      error.value = err as Error;
      console.error("[useNotifications] 알람 목록 로드 실패:", err?.message || err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 알람 읽음 처리 (단일)
   */
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // 로컬 상태 업데이트
      const notification = notifications.value.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      // 읽지 않은 알람 존재 여부 재확인
      await checkUnreadNotifications();
    } catch (err: any) {
      console.error("[useNotifications] 알람 읽음 처리 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 전체 알람 읽음 처리
   */
  const markAllRead = async () => {
    if (!currentUser.value) return;

    try {
      await markAllNotificationsAsRead(currentUser.value.uid);
      // 로컬 상태 업데이트
      notifications.value.forEach((n) => {
        n.read = true;
      });
      hasUnread.value = false;
    } catch (err: any) {
      console.error("[useNotifications] 전체 알람 읽음 처리 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 알람 삭제
   */
  const removeNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      // 로컬 상태 업데이트
      notifications.value = notifications.value.filter((n) => n.id !== notificationId);
      // 읽지 않은 알람 존재 여부 재확인
      await checkUnreadNotifications();
    } catch (err: any) {
      console.error("[useNotifications] 알람 삭제 실패:", err?.message || err);
      throw err;
    }
  };

  /**
   * 알람 생성 (다른 컴포넌트에서 사용 가능)
   */
  const addNotification = async (input: NotificationCreateInput) => {
    try {
      await createNotification(input);
      // 읽지 않은 알람 존재 여부 재확인 (생성된 알람의 대상 유저가 현재 유저인 경우)
      if (input.userId === currentUser.value?.uid) {
        await checkUnreadNotifications();
      }
    } catch (err: any) {
      console.error("[useNotifications] 알람 생성 실패:", err?.message || err);
      throw err;
    }
  };

  return {
    notifications,
    hasUnread,
    loading,
    error,
    loadNotifications,
    checkUnreadNotifications,
    markAsRead,
    markAllRead,
    removeNotification,
    addNotification,
  };
}