<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 알림 리스트 -->
    <main class="flex-1 overflow-y-auto space-y-0 content-wrapper">

      <!-- 알림 없음 -->
      <div
        v-if="notifications.length === 0"
        class="text-center text-gray-400 mt-20"
      >
        <i class="bi bi-bell-slash text-4xl"></i>
        <p class="mt-3 text-sm">새로운 알림이 없습니다</p>
      </div>

      <!-- 알림 반복 -->
      <div
        v-for="n in notifications"
        :key="n.id"
        @click="openNotification(n)"
        class="list-card list-item"
        :class="!n.read ? 'bg-blue-50/30 border-blue-200' : ''"
      >
        <div class="flex items-start gap-3">
          <!-- 왼쪽 아이콘 -->
          <div class="mt-0.5 flex-shrink-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                 :class="n.type === 'invite' ? 'bg-blue-50' : n.type === 'check' ? 'bg-green-50' : 'bg-gray-50'">
              <i :class="iconClass(n.type)" class="text-lg"></i>
            </div>
          </div>

          <!-- 내용 -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm leading-snug mb-1"
              :class="n.read ? 'text-gray-600' : 'font-semibold text-gray-900'"
            >
              {{ n.message }}
            </p>

            <div class="flex items-center gap-2">
              <p class="text-[11px] text-gray-400 flex items-center gap-1">
                <i class="bi bi-clock text-[10px]"></i>
                {{ formatRelativeTime(n.time) }}
              </p>
            </div>
          </div>

          <!-- 읽지 않음 표시 -->
          <div v-if="!n.read" class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { formatRelativeTime } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();

// 🔔 더미 알림 데이터 (나중에 Firestore 연결)
const notifications = ref([
  {
    id: "n1",
    type: "invite",
    message: "아내님이 '장보기 리스트'에 초대했습니다.",
    read: false,
    time: Date.now() - 1000 * 60 * 5, // 5분 전
    targetId: "checklist1",
  },
  {
    id: "n2",
    type: "check",
    message: "'캠핑 준비 체크' 항목 2개가 완료되었습니다.",
    read: true,
    time: Date.now() - 1000 * 60 * 60, // 1시간 전
    targetId: "checklist2",
  },
  {
    id: "n3",
    type: "system",
    message: "템플릿 기능이 새로 업데이트되었습니다.",
    read: true,
    time: Date.now() - 1000 * 60 * 60 * 24, // 1일 전
    targetId: null,
  },
]);

// 🔘 알림 타입 아이콘
const iconClass = (type: string) => {
  switch (type) {
    case "invite":
      return "bi bi-person-plus text-blue-500";
    case "check":
      return "bi bi-check2-square text-green-600";
    case "system":
      return "bi bi-info-circle text-gray-600";
    default:
      return "bi bi-bell";
  }
};

// 알림 클릭
const openNotification = (n: any) => {
  n.read = true;

  if (n.targetId) {
    router.push(`/checklists/${n.targetId}`);
  }
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}
</style>