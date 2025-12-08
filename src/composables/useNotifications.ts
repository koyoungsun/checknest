import { ref, computed } from "vue";

// 🔔 알림 리스트 (나중에 Firestore로 교체)
const notifications = ref([
  { id: "n1", message: "초대가 도착했습니다.", read: false },
  { id: "n2", message: "항목이 완료되었습니다.", read: true },
  { id: "n3", message: "새로운 업데이트가 있습니다.", read: false },
]);

// 읽지 않은 알림 수
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// 특정 알림 읽음 처리
const markAsRead = (id: string) => {
  const item = notifications.value.find(n => n.id === id);
  if (item) item.read = true;
};

// 전체 읽음 처리
const markAllRead = () => {
  notifications.value.forEach(n => (n.read = true));
};

export function useNotifications() {
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
  };
}