<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <PageSubtitle />
      <!-- 공지 리스트 -->
      <main class="flex-1 overflow-y-auto content-wrapper">
        <div v-if="notices.length > 0" class="space-y-0">
          <div
            v-for="notice in notices"
            :key="notice.id"
            class="list-card list-item"
          >
            <div class="flex items-start gap-3">
              <!-- 공지 아이콘 -->
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="bi bi-megaphone text-blue-600 text-lg"></i>
              </div>

              <!-- 공지 내용 -->
              <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-sm text-gray-900 mb-1">
                  {{ notice.title }}
                </h2>
                <div class="flex items-center gap-2 mt-2">
                  <p class="text-xs text-gray-500 flex items-center gap-1">
                    <i class="bi bi-calendar-event text-[10px]"></i>
                    {{ notice.date }}
                  </p>
                </div>
              </div>

              <!-- 화살표 -->
              <div class="flex items-center text-gray-400 flex-shrink-0">
                <i class="bi bi-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 데이터 없을 때 -->
        <div v-else class="empty-state mt-20">
          <i class="bi bi-info-circle"></i>
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
  interface Notice {
    id: number;
    title: string;
    date: string;
  }
  
  // 공지 데이터 (실 서비스에서는 Firestore 연결 예정)
  const notices = ref<Notice[]>([
    // {
    //   id: 1,
    //   title: "CheckNest 베타 서비스 오픈!",
    //   date: "2024-12-01",
    // },
  ]);
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}
</style>