<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <PageSubtitle />
  
      <!-- 상단 헤더 -->
      <header class="flex items-center px-4 h-14 border-b bg-white">
        <button @click="router.back()" class="mr-3 text-xl">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="text-base font-semibold truncate">
          {{ checklist.title }}
        </h1>
        <button class="ml-auto text-xl" @click="openMenu">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </header>
  
      <!-- 메인 내용 -->
      <main class="flex-1 overflow-y-auto detail-content space-y-6">
  
        <!-- 체크리스트 기본 정보 카드 -->
        <section class="bg-white rounded-xl shadow-sm p-4 space-y-2 border">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-lg font-semibold">{{ checklist.title }}</h2>
              <p class="text-xs text-gray-500 mt-1">
                {{ checklist.description || '설명이 없습니다.' }}
              </p>
            </div>
  
            <!-- 공개 범위 표시 -->
            <div>
              <i v-if="checklist.accessMode === 'private'" class="bi bi-lock-fill text-gray-400"></i>
              <i v-else-if="checklist.accessMode === 'link'" class="bi bi-link-45deg text-gray-400"></i>
              <i v-else-if="checklist.accessMode === 'password'" class="bi bi-shield-lock text-gray-400"></i>
            </div>
          </div>
  
          <div class="flex justify-between mt-3 text-xs text-gray-500">
            <span>마감일: {{ checklist.dueDate || '-' }}</span>
            <span>멤버 {{ checklist.members.length }}명</span>
          </div>
        </section>
  
        <!-- 진행률 -->
        <section class="bg-white rounded-xl shadow-sm p-4 space-y-3 border">
          <div class="flex justify-between text-xs text-gray-600">
            <span>진행률</span>
            <span>{{ checklist.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: checklist.progress + '%' }"
            ></div>
          </div>
        </section>
  
        <!-- 빠른 액션 버튼 -->
        <section class="bg-white rounded-xl shadow-sm border p-3 flex justify-around text-xs">
          <button class="flex flex-col items-center gap-1" @click="openAddItem">
            <i class="bi bi-plus-circle text-lg"></i>
            <span>항목 추가</span>
          </button>
  
          <button class="flex flex-col items-center gap-1" @click="openMembers">
            <i class="bi bi-people text-lg"></i>
            <span>멤버/역할</span>
          </button>
  
          <button class="flex flex-col items-center gap-1" @click="openAlerts">
            <i class="bi bi-bell text-lg"></i>
            <span>알림</span>
          </button>
        </section>
  
        <!-- 항목 리스트 -->
        <section>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">체크 항목</h3>
  
          <div class="bg-white rounded-xl shadow-sm border divide-y">
            <div
              v-for="(item, idx) in checklist.items"
              :key="item.id"
              class="flex items-center px-3 py-3 gap-3"
            >
              <input
                type="checkbox"
                v-model="item.checked"
                @change="toggleItem(idx)"
                class="w-5 h-5"
              />
              <span
                :class="item.checked ? 'line-through text-gray-400' : 'text-gray-800'"
              >
                {{ item.text }}
              </span>
            </div>
          </div>
        </section>
      </main>
  
      <!-- 하단 항목 추가 바 -->
      <div class="p-3 bg-white border-t flex items-center gap-2">
        <input
          v-model="newItem"
          type="text"
          placeholder="새 항목 추가..."
          class="flex-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100"
        />
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg"
          @click="addItem"
          :disabled="!newItem.trim()"
        >
          추가
        </button>
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
  const router = useRouter();
  
  // 가라데이터
  const checklist = ref({
    id: "chk_1",
    title: "여행 준비",
    description: "제주도 여행 준비 체크리스트",
    dueDate: "2025-12-10",
    progress: 40,
    accessMode: "private", // private | link | password
    members: ["aiden", "kate"],
    items: [
      { id: "i1", text: "신분증 챙기기", checked: false },
      { id: "i2", text: "여행 가방 준비", checked: true },
      { id: "i3", text: "세면도구 챙기기", checked: false },
    ],
  });
  
  // 새 항목 추가 바
  const newItem = ref("");
  
  const addItem = () => {
    checklist.value.items.push({
      id: "temp_" + Date.now(),
      text: newItem.value,
      checked: false,
    });
    newItem.value = "";
  };
  
  // 항목 상태 변경
  const toggleItem = (index: number) => {
    const item = checklist.value.items[index];
    if (item) {
      item.checked = !item.checked;
    }
  };
  
  // 메뉴 액션 (가라)
  const openMenu = () => alert("옵션 메뉴 (수정 / 삭제 / 공유)");
  const openAddItem = () => alert("항목 추가 BottomSheet 예정");
  const openMembers = () => alert("멤버 & 역할 관리 예정");
  const openAlerts = () => alert("알림 설정 예정");
  </script>
  
  <style scoped>
  </style>