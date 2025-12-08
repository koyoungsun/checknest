<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 검색 영역 -->
    <section class="px-4 py-3 bg-white border-b">
      <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <i class="bi bi-search text-gray-500 mr-2"></i>
        <input
          type="text"
          v-model="search"
          placeholder="템플릿 검색"
          class="bg-transparent w-full outline-none text-sm"
        />
      </div>
    </section>

    <!-- 카테고리 탭 -->
    <section class="px-4 py-3 overflow-x-auto bg-white border-b">
      <div class="flex space-x-3">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3 py-1 rounded-full text-sm border"
          :class="selectedCategory === cat
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300'"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- 템플릿 리스트 -->
    <main class="flex-1 overflow-y-auto px-4 py-4">

      <!-- 템플릿 카드 반복 -->
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          @click="goDetail(tpl.id)"
          class="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition"
        >
          <!-- 썸네일 -->
          <div
            class="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400"
          >
            <i class="bi bi-card-checklist text-2xl"></i>
          </div>

          <!-- 템플릿 제목 -->
          <p class="font-semibold text-sm truncate">{{ tpl.title }}</p>

          <!-- 항목 수 + 사용 횟수 -->
          <p class="text-xs text-gray-500 mt-1">
            항목 {{ tpl.items }}개 · 사용 {{ tpl.used }}회
          </p>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 검색
const search = ref("");

// 카테고리
const categories = ["전체", "생활", "여행", "쇼핑", "업무", "기타"];
const selectedCategory = ref("전체");

// 임시 템플릿 데이터 (Firestore 연동 전)
const templates = ref([
  {
    id: "tpl1",
    title: "여행 준비 템플릿",
    category: "여행",
    items: 12,
    used: 82,
  },
  {
    id: "tpl2",
    title: "장보기 기본 템플릿",
    category: "생활",
    items: 8,
    used: 154,
  },
  {
    id: "tpl3",
    title: "캠핑 체크리스트",
    category: "여행",
    items: 15,
    used: 40,
  },
]);

// 필터링 처리
const filteredTemplates = computed(() => {
  return templates.value.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === "전체" ||
      tpl.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

// 상세 이동
const goDetail = (id) => {
  router.push(`/templates/${id}`);
};
</script>