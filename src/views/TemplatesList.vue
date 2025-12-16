<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />
    <!-- 검색 영역 -->
    <SearchInput
      v-model="search"
      placeholder="템플릿 검색"
      label="템플릿 검색"
      input-id="template-search-input"
      @search="handleSearch"
    />

    <!-- 카테고리 탭 -->
    <section class="overflow-x-auto bg-white border-b" style="padding: 24px 16px 8px 16px;">
      <div class="flex" style="gap: 2px;">
        <label
          v-for="cat in categories"
          :key="cat"
          class="radio-tab"
          :class="{ 'radio-tab--active': selectedCategory === cat }"
        >
          <input
            type="radio"
            :value="cat"
            v-model="selectedCategory"
            class="radio-input"
          />
          <span class="radio-label">{{ cat }}</span>
        </label>
      </div>
    </section>

    <!-- 템플릿 리스트 -->
    <main class="flex-1 overflow-y-auto content-wrapper">
      <div v-if="search.trim()" style="padding: 8px 16px;">
        <!-- 템플릿 리스트 -->
        <div v-if="paginatedTemplates.length > 0" class="space-y-0 template-list-section">
          <div
            v-for="tpl in paginatedTemplates"
            :key="tpl.id"
            @click="goDetail(tpl.id)"
            class="list-card list-item"
          >
            <!-- 제목 -->
            <div class="mb-1">
              <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                <strong>{{ tpl.category }}</strong> <span class="truncate" style="color: #111;">{{ tpl.title }}</span>
                <em v-if="isNew(tpl.createdAt)" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
              </h3>
            </div>

            <!-- 작성자/날짜 -->
            <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 6px; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
              <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ tpl.author }}</span>
              <span style="flex-shrink: 0;">·</span>
              <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatDate(tpl.createdAt) }}</span>
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

        <!-- 템플릿 없을 때 -->
        <div v-else class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>검색 결과가 없습니다.</p>
        </div>

        <!-- 페이징 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn--disabled': currentPage === 1 }"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="pagination-btn"
            :class="{ 'pagination-btn--active': currentPage === page }"
          >
            {{ page }}
          </button>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn--disabled': currentPage === totalPages }"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <div v-else>
        <!-- 템플릿 리스트 -->
        <div v-if="paginatedTemplates.length > 0" class="space-y-0 template-list-section">
          <div
            v-for="tpl in paginatedTemplates"
            :key="tpl.id"
            @click="goDetail(tpl.id)"
            class="list-card list-item"
          >
            <!-- 제목 -->
            <div class="mb-1">
              <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                <strong>{{ tpl.category }}</strong> <span class="truncate" style="color: #111;">{{ tpl.title }}</span>
                <em v-if="isNew(tpl.createdAt)" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
              </h3>
            </div>

            <!-- 작성자/날짜 -->
            <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 6px; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
              <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ tpl.author }}</span>
              <span style="flex-shrink: 0;">·</span>
              <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatDate(tpl.createdAt) }}</span>
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

        <!-- 템플릿 없을 때 -->
        <div v-else class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>검색 결과가 없습니다.</p>
        </div>

        <!-- 페이징 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn--disabled': currentPage === 1 }"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="pagination-btn"
            :class="{ 'pagination-btn--active': currentPage === page }"
          >
            {{ page }}
          </button>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn--disabled': currentPage === totalPages }"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import SearchInput from "@/components/common/SearchInput.vue";
import { formatRelativeTime } from "@/utils/dateUtils";

const router = useRouter();

// 검색
const search = ref("");

// 검색 실행
const handleSearch = () => {
  // 실시간 검색이 이미 computed로 작동하므로 포커스만 유지
  document.getElementById('template-search-input')?.focus();
};

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
    author: "김철수",
    likes: 45,
    createdAt: new Date(), // 오늘
  },
  {
    id: "tpl2",
    title: "장보기 기본 템플릿",
    category: "생활",
    items: 8,
    used: 154,
    author: "이영희",
    likes: 120,
    createdAt: new Date(2024, 11, 20), // 2024-12-20
  },
  {
    id: "tpl3",
    title: "캠핑 체크리스트",
    category: "여행",
    items: 15,
    used: 40,
    author: "박민수",
    likes: 28,
    createdAt: new Date(2025, 1, 5), // 2025-02-05
  },
  {
    id: "tpl4",
    title: "명절 준비 체크리스트",
    category: "집안일",
    items: 20,
    used: 65,
    author: "최지영",
    likes: 52,
    createdAt: new Date(2024, 10, 25), // 2024-11-25
  },
  {
    id: "tpl5",
    title: "출장 준비물",
    category: "업무",
    items: 10,
    used: 120,
    author: "정대현",
    likes: 89,
    createdAt: new Date(2024, 9, 10), // 2024-10-10
  },
  {
    id: "tpl6",
    title: "운동 루틴 체크리스트",
    category: "기타",
    items: 7,
    used: 95,
    author: "강수진",
    likes: 67,
    createdAt: new Date(2025, 0, 8), // 2025-01-08
  },
  {
    id: "tpl7",
    title: "결혼식 준비 리스트",
    category: "기타",
    items: 30,
    used: 25,
    author: "윤서연",
    likes: 15,
    createdAt: new Date(2024, 11, 30), // 2024-12-30
  },
  {
    id: "tpl8",
    title: "이사 준비 체크리스트",
    category: "생활",
    items: 25,
    used: 45,
    author: "홍길동",
    likes: 33,
    createdAt: new Date(2025, 1, 12), // 2025-02-12
  },
  {
    id: "tpl9",
    title: "해외여행 필수품",
    category: "여행",
    items: 18,
    used: 88,
    author: "김민지",
    likes: 76,
    createdAt: new Date(2024, 11, 5), // 2024-12-05
  },
  {
    id: "tpl10",
    title: "프로젝트 관리 템플릿",
    category: "업무",
    items: 14,
    used: 200,
    author: "이준호",
    likes: 145,
    createdAt: new Date(2024, 8, 15), // 2024-09-15
  },
  {
    id: "tpl11",
    title: "주간 쇼핑 리스트",
    category: "쇼핑",
    items: 12,
    used: 300,
    author: "박지은",
    likes: 210,
    createdAt: new Date(2024, 7, 20), // 2024-08-20
  },
  {
    id: "tpl12",
    title: "생일파티 준비",
    category: "기타",
    items: 15,
    used: 55,
    author: "송하늘",
    likes: 42,
    createdAt: new Date(2025, 0, 22), // 2025-01-22
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

// 페이징
const currentPage = ref(1);
const itemsPerPage = 5;

// 총 페이지 수
const totalPages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / itemsPerPage);
});

// 현재 페이지의 템플릿
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTemplates.value.slice(start, end);
});

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 카테고리나 검색어 변경 시 첫 페이지로
watch([selectedCategory, search], () => {
  currentPage.value = 1;
});

// 날짜 포맷팅
const formatDate = (date) => {
  if (!date) return "";
  const timestamp = date.getTime();
  return formatRelativeTime(timestamp);
};

// 3일 이내인지 확인
const isNew = (date) => {
  if (!date) return false;
  const now = new Date();
  const created = new Date(date);
  const diffTime = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

// 상세 이동
const goDetail = (id) => {
  router.push(`/templates/${id}`);
};
</script>

<style scoped>
.content-wrapper {
  padding: 0 16px 16px 16px;
}

.template-list-section {
  background-color: #fff;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--color-primary, #ff6b35);
}

.template-list-section .list-item {
  border-bottom: 1px dashed #aeaeae;
}

.template-list-section .list-item:last-child {
  border-bottom: none;
}

.list-card h3 strong {
  font-weight: 400;
  font-size: 12px;
  background-color: #f90;
  padding: 2px 4px;
  border-radius: 2px;
  margin-right: 4px;
  color: #fff;
}

.radio-tab {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #374151;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-right: 2px;
}

.radio-tab--active .radio-label {
  background-color: var(--color-primary, #ff6b35);
  color: #fff;
  border-color: var(--color-primary, #ff6b35);
}

.radio-input:checked + .radio-label {
  background-color: var(--color-primary, #ff6b35);
  color: #fff;
  border-color: var(--color-primary, #ff6b35);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 24px;
  padding: 0 0 16px 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 25.2px;
  height: 25.2px;
  padding: 0 8.4px;
  border: 1px solid #d1d5db;
  border-radius: 4.2px;
  background-color: #fff;
  color: #374151;
  font-size: 9.8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.pagination-btn--disabled) {
  background-color: #f3f4f6;
  border-color: var(--color-primary, #ff6b35);
}

.pagination-btn--active {
  background-color: var(--color-primary, #ff6b35);
  color: #fff;
  border-color: var(--color-primary, #ff6b35);
}

.pagination-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>