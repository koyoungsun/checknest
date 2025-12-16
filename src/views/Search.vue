<template>
    <div class="bg-gray-50 pt-[100px] relative z-10">
  
      <!-- 검색창 -->
      <div class="relative z-20">
        <SearchInput
          v-model="keyword"
          placeholder="검색어를 입력하세요"
          label="검색어를 입력하세요"
          input-id="search-input"
          @search="handleSearch"
        />
      </div>
  
      <!-- 검색 결과 -->
      <main class="pb-10 mt-4">
        <!-- 검색어 없을 때 -->
        <div
          v-if="keyword.trim().length === 0"
          class="no-data"
        >
          검색어를 입력하면 결과가 표시됩니다.
        </div>
  
        <!-- 검색어 입력 시 리스트 영역 -->
        <div v-if="keyword.trim().length > 0" style="padding: 8px 16px;">
          <!-- 리스트 검색 결과 -->
          <section v-if="filteredLists.length > 0" style="margin-bottom: 24px;">
            <h2 class="text-xs font-semibold text-gray-500" style="margin-bottom: 8px;">체크리스트</h2>
  
            <div class="space-y-0 search-list-section">
              <div
                v-for="item in filteredLists"
                :key="item.id"
                @click="goChecklist(item.id)"
                class="list-card list-item"
                :class="{ 'search-item-personal': item.members.length === 1, 'search-item-shared': item.members.length >= 2 }"
              >
                <!-- 제목 -->
                <div class="mb-1">
                  <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                    <strong>{{ item.members.length === 1 ? '개인' : '공유' }}</strong> 
                    <span class="truncate" v-html="highlightKeyword(item.title, keyword)"></span>
                  </h3>
                </div>

                <!-- 날짜 + 멤버 (공유인 경우) -->
                <div v-if="item.members.length >= 2" style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 6px; flex-wrap: nowrap; width: 100%; gap: 12px;">
                  <p
                    style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; margin: 0;"
                    :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
                  >
                    <i class="bi bi-calendar-event" style="font-size: 12px; margin-right: 4px;"></i>
                    종료일: {{ item.dueDate }}
                  </p>
                  <p style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; margin: 0;" class="text-gray-500">
                    <i class="bi bi-people" style="font-size: 12px;"></i>
                    {{ item.members.length }}명 참여
                  </p>
                </div>
                
                <!-- 날짜 (개인인 경우) -->
                <p
                  v-else
                  class="flex items-center"
                  style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;"
                  :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
                >
                  <i class="bi bi-calendar-event" style="font-size: 12px; color: #fff; margin-right: 4px;"></i>
                  종료일: {{ item.dueDate }}
                </p>

                <!-- 진행률 -->
                <div class="mt-2 flex items-center gap-2">
                  <div class="flex-1 progress-bar progress-bar--small">
                    <div
                      class="progress-fill"
                      :class="{ 'progress-fill--green': item.members.length >= 2 }"
                      :style="{ width: item.progress + '%' }"
                    ></div>
                  </div>
                </div>
                <!-- 진행률 퍼센트 (우측 중앙 고정) -->
                <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; gap: 4px;"
                  :style="{ color: item.members.length >= 2 ? '#222' : '#fff' }"
                >
                  <span style="font-size: 34px; font-weight: 700;">{{ item.progress }}</span>
                  <span style="font-size: 20px; font-weight: 500;">%</span>
                </span>
              </div>
            </div>
          </section>
  
          <!-- 템플릿 검색 결과 -->
          <section v-if="filteredTemplates.length > 0" style="margin-bottom: 24px;">
            <h2 class="text-xs font-semibold text-gray-500" style="margin-bottom: 8px;">템플릿</h2>
  
            <div class="space-y-0 search-template-section">
              <div
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                @click="goTemplate(tpl.id)"
                class="list-card list-item"
              >
                <!-- 제목 -->
                <div class="mb-1">
                  <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                    <strong>{{ tpl.category }}</strong> 
                    <span class="truncate" style="color: #111;" v-html="highlightKeyword(tpl.title, keyword)"></span>
                    <em v-if="isNewTemplate(tpl.createdAt)" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                  </h3>
                </div>

                <!-- 작성자/날짜 -->
                <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 6px; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ tpl.author }}</span>
                  <span style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatTemplateDate(tpl.createdAt) }}</span>
                </div>
                
                <!-- 항목/추천수/사용자수 -->
                <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 0; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>항목:</strong> {{ tpl.items }}개</span>
                  <span style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>추천:</strong> {{ tpl.likes }}</span>
                  <span style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>사용:</strong> {{ tpl.used }}회</span>
                </div>
              </div>
            </div>
          </section>
  
          <!-- 결과 없음 -->
          <div
            v-if="filteredLists.length === 0 && filteredTemplates.length === 0"
            class="no-data"
          >
            검색 결과가 없습니다.
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { isOverdue, formatRelativeTime, formatTemplateDate } from "@/utils/dateUtils";
  import SearchInput from "@/components/common/SearchInput.vue";
  
  const router = useRouter();
  
  // 🔎 검색어
  const keyword = ref("");

  // 검색 실행
  const handleSearch = () => {
    // 실시간 검색이 이미 computed로 작동하므로 포커스만 유지
    document.getElementById('search-input')?.focus();
  };
  
  // 📁 더미 체크리스트 데이터
  const checklists = ref([
    { 
      id: "c1", 
      title: "오늘의 할 일", 
      ownerId: "me",
      members: ["me"],
      dueDate: "2025-12-10",
      progress: 40,
    },
    { 
      id: "c2", 
      title: "장보기 리스트", 
      ownerId: "me",
      members: ["me", "wife"],
      dueDate: "2025-12-08",
      progress: 75,
    },
    { 
      id: "c3", 
      title: "캠핑 준비 체크", 
      ownerId: "friend1",
      members: ["friend1", "me"],
      dueDate: "2025-12-31",
      progress: 10,
    },
  ]);
  
  // 임시 currentUser
  const currentUser = {
    id: "me",
  };
  
  // 📁 더미 템플릿 데이터
  const templates = ref([
    { 
      id: "t1", 
      title: "여행 준비 템플릿", 
      category: "여행",
      items: 12, 
      used: 82,
      author: "김철수",
      likes: 45,
      createdAt: new Date(),
    },
    { 
      id: "t2", 
      title: "장보기 템플릿", 
      category: "생활",
      items: 8, 
      used: 154,
      author: "이영희",
      likes: 120,
      createdAt: new Date(2024, 11, 20),
    },
    { 
      id: "t3", 
      title: "캠핑 체크 템플릿", 
      category: "여행",
      items: 15, 
      used: 40,
      author: "박민수",
      likes: 28,
      createdAt: new Date(2025, 1, 5),
    },
  ]);
  
  // 리스트 검색 필터
  const filteredLists = computed(() => {
    return checklists.value.filter((item) =>
      item.title.toLowerCase().includes(keyword.value.toLowerCase())
    );
  });
  
  // 템플릿 검색 필터
  const filteredTemplates = computed(() => {
    return templates.value.filter((tpl) =>
      tpl.title.toLowerCase().includes(keyword.value.toLowerCase())
    );
  });
  
  // 클릭 이동
  const goChecklist = (id: string) => {
    router.push(`/checklists/${id}`);
  };
  
  const goTemplate = (id: string) => {
    router.push(`/templates/${id}`);
  };
  
  
  // 템플릿 3일 이내인지 확인
  const isNewTemplate = (date: Date) => {
    if (!date) return false;
    const now = new Date();
    const created = new Date(date);
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };
  
  // 검색어 하이라이트 함수
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark style="background-color: transparent; color: #2272ed; font-weight: 700;">$1</mark>');
  };
  </script>
  
  <style scoped>
  .no-data {
    text-align: center;
    margin: 8px auto;
    color: #9ca3af;
    font-size: 14px;
  }
  
  .search-list-section {
    background-color: #fff;
    padding: 0;
    border-radius: 12px;
    border: 1px solid var(--color-primary, #ff6b35);
  }
  
  .search-list-section .list-item {
    border-bottom: 1px dashed #aeaeae;
  }
  
  .search-list-section .list-item:last-child {
    border-bottom: none;
  }
  
  .search-list-section h3 strong {
    font-weight: 400;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 2px;
    margin-right: 4px;
    color: #fff;
  }
  
  .search-list-section h3 strong {
    background-color: #333;
  }
  
  /* 개인 리스트 스타일 */
  .search-item-personal {
    background: linear-gradient(to bottom right,
      var(--color-primary), var(--color-primary-light), #ffa366, #e55a2b);
  }
  
  .search-item-personal h3,
  .search-item-personal p,
  .search-item-personal span {
    color: #fff;
  }
  
  .search-item-personal i {
    color: #fff;
  }
  
  /* 공유 리스트 스타일 */
  .search-item-shared h3 strong {
    background-color: var(--color-primary, #ff6b35);
  }
  
  /* 템플릿 리스트 스타일 */
  .search-template-section {
    background-color: #fff;
    padding: 0;
    border-radius: 12px;
    border: 1px solid var(--color-primary, #ff6b35);
  }
  
  .search-template-section .list-item {
    border-bottom: 1px dashed #aeaeae;
  }
  
  .search-template-section .list-item:last-child {
    border-bottom: none;
  }
  
  .search-template-section h3 strong {
    font-weight: 400;
    font-size: 12px;
    background-color: #f90;
    padding: 2px 4px;
    border-radius: 2px;
    margin-right: 4px;
    color: #fff;
  }
  </style>