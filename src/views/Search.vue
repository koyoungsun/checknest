<template>
    <div class="bg-gray-50 pt-[100px] relative z-10">
  
      <!-- 검색창 -->
      <section class="px-4 pt-6 pb-2 relative z-20">
        <div class="search-box" style="padding: 24px 16px 8px; width: 100%; box-sizing: border-box;">
          <div class="search-box-wrapper" style="background: linear-gradient(to bottom right, #e55a2b, #ff6b35, #ffa366); padding: 3px; border-radius: 16px; width: 100%; display: block;">
            <input
              type="text"
              v-model="keyword"
              placeholder="검색어를 입력하세요"
              style="width: 100%; height: 50px; font-size: 14px; border-radius: 13px; background: #fff !important; border: none; box-sizing: border-box; outline: none;"
            />
          </div>
        </div>
      </section>
  
      <!-- 검색 결과 -->
      <main class="px-4 pb-10 mt-4">
  
        <!-- 검색어 없을 때 -->
        <div
          v-if="keyword.trim().length === 0"
          class="text-gray-400 text-sm mt-10 text-center"
        >
          검색어를 입력하면 결과가 표시됩니다.
        </div>
  
        <!-- 리스트 검색 결과 -->
        <section v-if="filteredLists.length > 0">
          <h2 class="text-xs font-semibold text-gray-500 mb-2">체크리스트</h2>
  
          <div class="space-y-3">
            <div
              v-for="item in filteredLists"
              :key="item.id"
              class="bg-white p-4 border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
              @click="goChecklist(item.id)"
            >
              <p class="font-semibold text-sm">{{ item.title }}</p>
              <p class="text-xs text-gray-500 mt-1">
                항목 {{ item.items }}개 · {{ item.members }}명 참여
              </p>
            </div>
          </div>
        </section>
  
        <!-- 템플릿 검색 결과 -->
        <section v-if="filteredTemplates.length > 0" class="mt-6">
          <h2 class="text-xs font-semibold text-gray-500 mb-2">템플릿</h2>
  
          <div class="space-y-3">
            <div
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              class="bg-white p-4 border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
              @click="goTemplate(tpl.id)"
            >
              <p class="font-semibold text-sm">{{ tpl.title }}</p>
              <p class="text-xs text-gray-500 mt-1">
                항목 {{ tpl.items }}개 · 사용 {{ tpl.used }}회
              </p>
            </div>
          </div>
        </section>
  
        <!-- 결과 없음 -->
        <div
          v-if="keyword.trim().length > 0 && filteredLists.length === 0 && filteredTemplates.length === 0"
          class="text-center mt-10 text-gray-400 text-sm"
        >
          검색 결과가 없습니다.
        </div>
  
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  
  // 🔎 검색어
  const keyword = ref("");
  
  // 📁 더미 체크리스트 데이터
  const checklists = ref([
    { id: "c1", title: "오늘의 할 일", items: 8, members: 1 },
    { id: "c2", title: "장보기 리스트", items: 12, members: 2 },
    { id: "c3", title: "캠핑 준비 체크", items: 15, members: 2 },
  ]);
  
  // 📁 더미 템플릿 데이터
  const templates = ref([
    { id: "t1", title: "여행 준비 템플릿", items: 12, used: 82 },
    { id: "t2", title: "장보기 템플릿", items: 8, used: 154 },
    { id: "t3", title: "캠핑 체크 템플릿", items: 15, used: 40 },
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
  </script>
  
  <style scoped>
  </style>