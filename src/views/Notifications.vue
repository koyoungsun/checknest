<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 알림 리스트 -->
    <main class="flex-1 overflow-y-auto space-y-0 content-wrapper">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center text-gray-400 mt-20">
        <i class="bi bi-hourglass-split text-4xl animate-spin"></i>
        <p class="mt-3 text-sm">알림을 불러오는 중...</p>
      </div>

      <!-- 알림 없음 -->
      <div
        v-else-if="notifications.length === 0"
        class="text-center text-gray-400 mt-20"
      >
        <i class="bi bi-bell-slash text-4xl"></i>
        <p class="mt-3 text-sm">새로운 알림이 없습니다</p>
      </div>

      <!-- 알림 반복 -->
      <div
        v-else
        v-for="notification in notifications"
        :key="notification.id"
        class="list-card list-item mb-2"
        :class="!notification.read ? 'bg-blue-50/30 border-blue-200' : ''"
      >
        <div class="flex items-start gap-3">
          <!-- 왼쪽 아이콘 -->
          <div class="mt-0.5 flex-shrink-0">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                notification.type === 'invite'
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              "
            >
              <i
                :class="
                  notification.type === 'invite'
                    ? 'bi bi-person-plus text-blue-500'
                    : 'bi bi-info-circle text-gray-600'
                "
                class="text-lg"
              ></i>
            </div>
          </div>

          <!-- 내용 -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm leading-snug mb-1"
              :class="
                notification.read
                  ? 'text-gray-600'
                  : 'font-semibold text-gray-900'
              "
            >
              {{ notification.title }}
            </p>
            <p
              class="text-xs text-gray-500 mb-2"
              :class="notification.read ? '' : 'font-medium'"
            >
              {{ notification.message }}
            </p>

            <div class="flex items-center gap-2">
              <p class="text-[11px] text-gray-400 flex items-center gap-1">
                <i class="bi bi-clock text-[10px]"></i>
                {{ formatRelativeTime(toDate(notification.createdAt) || new Date()) }}
              </p>
            </div>

            <!-- 체크리스트 초대인 경우 "체크리스트로 이동" 버튼 -->
            <div
              v-if="notification.type === 'invite' && notification.checklistId"
              class="mt-3"
            >
              <button
                @click.stop="goToChecklist(notification.checklistId!)"
                class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                체크리스트로 이동
              </button>
            </div>
          </div>

          <!-- 읽지 않음 표시 -->
          <div v-if="!notification.read" class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useNotifications } from "@/composables/useNotifications";
import { formatRelativeTime, toDate } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { currentUser } = useAuth();
const {
  notifications,
  loading,
  loadNotifications,
  markAllRead,
} = useNotifications();

// 알람 페이지 진입 시 알람 로드 및 읽음 처리
onMounted(async () => {
  if (currentUser.value) {
    await loadNotifications();
    // 페이지 진입 시 모든 unread 알람을 read로 변경
    await markAllRead();
  }
});

// currentUser 변경 시 알람 다시 로드
watch(
  () => currentUser.value,
  async (user) => {
    if (user) {
      await loadNotifications();
    }
  }
);

// 체크리스트로 이동
const goToChecklist = (checklistId: string) => {
  router.push(`/checklists/${checklistId}`);
};
</script>

<style scoped>
.content-wrapper {
  padding:16px;
}
</style>
