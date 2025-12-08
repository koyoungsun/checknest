<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- 알림 리스트 -->
    <main class="flex-1 overflow-y-auto px-4 py-4 space-y-4">

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
        class="bg-white border border-gray-200 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition flex items-start gap-3"
      >

        <!-- 왼쪽 아이콘 -->
        <div class="mt-0.5">
          <i :class="iconClass(n.type)" class="text-xl"></i>
        </div>

        <!-- 내용 -->
        <div class="flex-1">
          <p
            class="text-sm leading-snug"
            :class="n.read ? 'text-gray-600' : 'font-semibold text-gray-900'"
          >
            {{ n.message }}
          </p>

          <p class="text-[11px] text-gray-400 mt-1">
            {{ formatTime(n.time) }}
          </p>
        </div>

        <!-- 읽지 않음 표시 점 -->
        <div v-if="!n.read" class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>

      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue"; // 경로는 프로젝트에 맞게 조정

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

// 🕒 시간 표시 포맷
const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

// 알림 클릭
const openNotification = (n: any) => {
  n.read = true;

  if (n.targetId) {
    router.push(`/checklists/${n.targetId}`);
  }
};

// 우측 슬라이드 메뉴 열기
const openMenu = () => {
  console.log("OPEN RIGHT MENU FROM NOTIFICATIONS");
};
</script>

<style scoped>
</style>