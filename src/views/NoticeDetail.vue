<template>
    <div class="min-h-screen bg-gray-50 detail-content">
      <PageSubtitle />
  
      <!-- 제목 -->
      <h1 class="text-xl font-semibold mb-4">
        {{ notice?.title || "공지사항" }}
      </h1>
  
      <!-- 날짜 -->
      <p v-if="notice" class="text-xs text-gray-500 mb-6">
        {{ notice.date }}
      </p>
  
      <!-- 내용 -->
      <div v-if="notice" class="bg-white p-5 rounded-xl border shadow-sm leading-relaxed text-gray-800">
        <p v-html="notice.content"></p>
      </div>
  
      <!-- 데이터 없을 때 -->
      <div v-else class="text-center text-gray-400 mt-20">
        <i class="bi bi-exclamation-circle text-4xl mb-3"></i>
        <p>해당 공지사항을 찾을 수 없습니다.</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from "vue-router";
  import { ref, onMounted } from "vue";
  import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
  const route = useRoute();
  const noticeId = route.params.id;
  
  // 실제 Firestore 연결 전까지 임시 데이터
  const sampleNotices = [
    {
      id: "1",
      title: "CheckNest 베타 오픈 안내",
      date: "2024-12-01",
      content: `
        CheckNest 베타 버전이 오픈되었습니다.<br/>
        많은 관심과 피드백 부탁드립니다 🙌
      `
    },
    {
      id: "2",
      title: "서비스 점검 공지",
      date: "2024-12-05",
      content: `
        12월 10일 02:00 ~ 04:00 동안 서비스 점검이 진행됩니다.<br/>
        이용에 불편을 드려 죄송합니다.
      `
    }
  ];
  
  const notice = ref<any>(null);
  
  onMounted(() => {
    notice.value = sampleNotices.find(n => n.id === noticeId) || null;
  });
  </script>
  
  <style scoped>
  </style>