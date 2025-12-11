<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
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
    <main class="flex-1 overflow-y-auto content-wrapper">
      <!-- 템플릿 리스트 -->
      <div v-if="filteredTemplates.length > 0" class="space-y-0">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          @click="goDetail(tpl.id)"
          class="list-card list-item"
        >
          <div class="flex items-start gap-4">
            <!-- 아이콘 영역 -->
            <div class="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <i class="bi bi-card-checklist text-xl text-blue-600"></i>
            </div>

            <!-- 템플릿 정보 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 class="font-semibold text-sm text-gray-900 truncate">
                  {{ tpl.title }}
                </h3>
                <span class="badge badge--gray flex-shrink-0">
                  {{ tpl.category }}
                </span>
              </div>

              <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <i class="bi bi-list-check text-xs"></i>
                  항목 {{ tpl.items }}개
                </span>
                <span class="flex items-center gap-1">
                  <i class="bi bi-people text-xs"></i>
                  사용 {{ tpl.used }}회
                </span>
              </div>
            </div>

            <!-- 화살표 -->
            <div class="flex items-center text-gray-400 flex-shrink-0">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 템플릿 없을 때 -->
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>검색 결과가 없습니다.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

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

<style scoped>
.content-wrapper {
  padding: 16px;
}
</style>