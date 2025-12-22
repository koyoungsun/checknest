<template>
  <div class="min-h-screen bg-gray-50 flex flex-col template-wrapper">
    <PageSubtitle />
    
    <!-- 정렬 옵션 -->
    <section class="bg-white border-b px-4 py-3 template-sort-section">
      <div class="flex items-center gap-2 template-sort-body">
        <span class="text-sm font-medium text-gray-700">정렬:</span>
        <select
          v-model="sortOption"
          @change="handleSortChange"
          class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 template-sort-select"
        >
          <option value="createdAt_desc">최신순</option>
          <option value="createdAt_asc">오래된순</option>
          <option value="title_asc">제목순</option>
          <option value="category_asc">카테고리순</option>
        </select>
      </div>
    </section>

    <!-- 카테고리 탭 -->
    <section class="overflow-x-auto bg-white border-b template-category-section" style="padding: 16px;">
      <div class="flex template-category-body" style="gap: 2px;">
        <label
          v-for="cat in categories"
          :key="cat"
          class="radio-tab template-category-tab"
          :class="{ 'radio-tab--active': selectedCategory === cat }"
        >
          <input
            type="radio"
            :value="cat"
            v-model="selectedCategory"
            class="radio-input"
            @change="handleCategoryChange"
          />
          <span class="radio-label">{{ cat }}</span>
        </label>
      </div>
    </section>

    <!-- 템플릿 리스트 -->
    <main class="flex-1 overflow-y-auto content-wrapper template-body">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="flex items-center justify-center py-12 template-loading">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">로딩 중...</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="hasError" class="flex items-center justify-center py-12 template-error">
        <div class="text-center">
          <p class="text-red-600 mb-4">{{ errorPublic?.message || errorMy?.message || '오류가 발생했습니다.' }}</p>
          <button
            @click="loadTemplatesData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 template-error-retry"
          >
            다시 시도
          </button>
        </div>
      </div>

      <!-- 템플릿 리스트 -->
      <div v-else class="space-y-6 template-content">
        <!-- 내 템플릿 섹션 -->
        <section v-if="myTemplates.length > 0" class="template-my-section">
          <h2 class="text-lg font-bold text-gray-800 mb-3 px-2 template-my-header">내 템플릿</h2>
          <div class="space-y-0 template-list-section template-my-list">
            <div
              v-for="(tpl, index) in myTemplates"
              :key="`my-${tpl.id}`"
              @click="goDetail(tpl.id)"
              class="list-card list-item cursor-pointer hover:bg-gray-50 transition-colors template-my-item"
            >
              <div class="px-4 py-3">
                <!-- 넘버 및 제목 -->
                <div class="flex items-start gap-3 mb-2">
                  <span class="text-lg font-bold text-blue-600 flex-shrink-0" style="min-width: 24px;">
                    {{ index + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base text-gray-800 truncate flex items-center gap-1">
                      {{ tpl.title }}
                      <span v-if="tpl.visibility === 'public'" class="text-xs text-blue-600 flex-shrink-0" title="공유 템플릿">
                        🌍
                      </span>
                      <span v-else-if="tpl.visibility === 'private'" class="text-xs text-gray-500 flex-shrink-0" title="개인 템플릿">
                        🔒
                      </span>
                      <em v-if="isNewTemplate(tpl.createdAt)" style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-2 py-0.5 bg-black text-white rounded">
                        {{ tpl.category }}
                      </span>
                      <span class="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                        {{ tpl.visibility === 'public' ? '공개' : '비공개' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 작성자 및 작성일 -->
                <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <span v-if="getAuthorName(tpl.ownerId)">
                    작성자: {{ getAuthorName(tpl.ownerId) }}
                  </span>
                  <span v-if="getAuthorName(tpl.ownerId) && tpl.createdAt">·</span>
                  <span v-if="tpl.createdAt">
                    작성일: {{ formatCreatedAt(tpl.createdAt) }}
                  </span>
                </div>

                <!-- 통계 정보 -->
                <div class="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span class="flex items-center gap-1">
                    <i class="bi bi-heart"></i>
                    {{ tpl.likeCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="bi bi-check-circle"></i>
                    {{ tpl.usedCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="bi bi-list-ul"></i>
                    {{ tpl.items?.length || 0 }}개 항목
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 공개 템플릿 섹션 -->
        <section v-if="publicTemplates.length > 0" class="template-public-section">
          <h2 class="text-lg font-bold text-gray-800 mb-3 px-2 template-public-header">공개 템플릿</h2>
          <div class="space-y-0 template-list-section template-public-list">
            <div
              v-for="(tpl, index) in publicTemplates"
              :key="`public-${tpl.id}`"
              @click="goDetail(tpl.id)"
              class="list-card list-item cursor-pointer hover:bg-gray-50 transition-colors template-public-item"
            >
              <div class="px-4 py-3">
                <!-- 넘버 및 제목 -->
                <div class="flex items-start gap-3 mb-2">
                  <span class="text-lg font-bold text-blue-600 flex-shrink-0" style="min-width: 24px;">
                    {{ index + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base text-gray-800 truncate flex items-center gap-1">
                      {{ tpl.title }}
                      <em v-if="isNewTemplate(tpl.createdAt)" style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-2 py-0.5 bg-black text-white rounded">
                        {{ tpl.category }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 작성자 및 작성일 -->
                <div class="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <span v-if="getAuthorName(tpl.ownerId)">
                    작성자: {{ getAuthorName(tpl.ownerId) }}
                  </span>
                  <span v-if="getAuthorName(tpl.ownerId) && tpl.createdAt">·</span>
                  <span v-if="tpl.createdAt">
                    작성일: {{ formatCreatedAt(tpl.createdAt) }}
                  </span>
                </div>

                <!-- 통계 정보 -->
                <div class="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span class="flex items-center gap-1">
                    <i class="bi bi-heart"></i>
                    {{ tpl.likeCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="bi bi-check-circle"></i>
                    {{ tpl.usedCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="bi bi-list-ul"></i>
                    {{ tpl.items?.length || 0 }}개 항목
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 템플릿 없을 때 -->
        <div v-if="myTemplates.length === 0 && publicTemplates.length === 0" class="empty-state template-empty">
          <i class="bi bi-inbox text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">템플릿이 없습니다.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getTemplates } from "@/services/templates";
import { useAuth } from "@/composables/useAuth";
import { getUserProfile } from "@/services/userService";
import { formatDateYYYYMMDD, toDate } from "@/utils/dateUtils";
import { isNewTemplate } from "@/utils/templateUtils";
import type { TemplateSortOption, Template } from "@/types/template";
import type { Timestamp } from "firebase/firestore";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { currentUser } = useAuth();

// 작성자 이름 캐시
const authorNameCache = ref<Map<string, string>>(new Map());

// 공개 템플릿과 내 템플릿을 분리하여 관리
const publicTemplatesList = ref<Template[]>([]);
const myTemplatesList = ref<Template[]>([]);
const loadingPublic = ref(false);
const loadingMy = ref(false);
const errorPublic = ref<Error | null>(null);
const errorMy = ref<Error | null>(null);

// 카테고리
const categories = ["전체", "생활", "여행", "쇼핑", "업무", "기타"];
const selectedCategory = ref("전체");

// 정렬 옵션 (통합)
// 형식: "필드_방향" (예: "createdAt_desc", "title_asc")
const sortOption = ref<string>("createdAt_desc"); // 기본값: 최신순

// 로딩 및 에러 상태 (둘 중 하나라도 로딩 중이면 로딩)
const isLoading = computed(() => loadingPublic.value || loadingMy.value);
const hasError = computed(() => errorPublic.value || errorMy.value);

// 내 템플릿 (클라이언트 사이드 정렬 적용)
const myTemplates = computed(() => {
  return applyClientSideSort(myTemplatesList.value);
});

// 공개 템플릿 (클라이언트 사이드 정렬 적용)
const publicTemplates = computed(() => {
  return applyClientSideSort(publicTemplatesList.value);
});

// 카테고리 변경 핸들러
const handleCategoryChange = () => {
  // 카테고리 변경 시 데이터 다시 로드
  loadTemplatesData();
};

// 정렬 변경 핸들러
const handleSortChange = () => {
  // 정렬 변경 시 데이터 다시 로드
  loadTemplatesData();
};

// 작성자 이름 가져오기
const getAuthorName = (ownerId: string): string => {
  if (!ownerId) return "";
  
  // 캐시에 있으면 반환
  if (authorNameCache.value.has(ownerId)) {
    return authorNameCache.value.get(ownerId) || "";
  }
  
  // 캐시에 없으면 비동기로 로드 (UI는 "로딩 중..." 표시)
  loadAuthorName(ownerId);
  return "로딩 중...";
};

// 작성자 이름 비동기 로드
const loadAuthorName = async (ownerId: string) => {
  if (!ownerId || authorNameCache.value.has(ownerId)) return;
  
  try {
      const profile = await getUserProfile(ownerId);
      if (profile && profile.displayName) {
        authorNameCache.value.set(ownerId, profile.displayName);
      } else {
        authorNameCache.value.set(ownerId, "알 수 없음");
      }
  } catch (err) {
    console.error("작성자 프로필 로드 실패:", err);
    authorNameCache.value.set(ownerId, "알 수 없음");
  }
};

// 작성일 포맷팅
// 수정 전: Timestamp 타입만 받음 → createdAt.toDate() 직접 호출 시도 시 에러 발생 가능
// 수정 후: toDate 유틸 함수 사용하여 Timestamp/Date/number 모두 안전하게 처리
const formatCreatedAt = (createdAt: Timestamp | Date | number | null | undefined): string => {
  if (!createdAt) return '';
  // toDate 유틸 함수 사용 (Timestamp, Date, number 모두 처리 가능)
  const date = toDate(createdAt);
  if (!date) return '';
  return formatDateYYYYMMDD(date);
};


// 정렬 옵션 파싱
const parseSortOption = (): { sortBy: TemplateSortOption; sortOrder: "asc" | "desc" } => {
  const [field, order] = sortOption.value.split("_");
  return {
    sortBy: (field as TemplateSortOption) || "createdAt",
    sortOrder: (order as "asc" | "desc") || "desc",
  };
};

// 클라이언트 사이드 정렬 (제목순, 카테고리순은 클라이언트에서 정렬)
const applyClientSideSort = (templates: Template[]): Template[] => {
  const { sortBy, sortOrder } = parseSortOption();
  
  if (sortBy === "title") {
    return [...templates].sort((a, b) => {
      const aTitle = a.title || "";
      const bTitle = b.title || "";
      const comparison = aTitle.localeCompare(bTitle, "ko", { numeric: true });
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }
  
  if (sortBy === "category") {
    return [...templates].sort((a, b) => {
      const aCategory = a.category || "";
      const bCategory = b.category || "";
      const comparison = aCategory.localeCompare(bCategory, "ko", { numeric: true });
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }
  
  // createdAt는 서버에서 정렬되므로 그대로 반환
  return templates;
};

// 수정 전: onMounted에서만 로드 → currentUser가 나중에 들어와도 재계산 안 됨
// 수정 후: 공개 템플릿은 즉시 로드, 내 템플릿은 currentUser watch로 재계산

// 공개 템플릿은 currentUser와 무관하게 즉시 로드
// 수정: visibility === "public" 조건이 정확히 적용되도록 필터 명확히 설정
onMounted(async () => {
  loadingPublic.value = true;
  errorPublic.value = null;
  try {
    // visibility === "public" 조건 명확히 적용
    const publicFilters: any = {
      visibility: "public", // 공개 템플릿만 조회
    };
    if (selectedCategory.value !== "전체") {
      publicFilters.category = selectedCategory.value;
    }
    
    // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
    const { sortBy, sortOrder } = parseSortOption();
    // createdAt만 서버에서 정렬, 나머지는 클라이언트에서 정렬
    const serverSortBy = sortBy === "createdAt" ? sortBy : "createdAt";
    const serverSortOrder = sortBy === "createdAt" ? sortOrder : "desc";
    const templates = await getTemplates(publicFilters, serverSortBy, serverSortOrder);
    publicTemplatesList.value = Array.isArray(templates) ? templates : [];
    
    // 작성자 이름 로드
    publicTemplatesList.value.forEach((tpl) => {
      loadAuthorName(tpl.ownerId);
    });
  } catch (err) {
    errorPublic.value = err as Error;
    console.error("공개 템플릿 로드 실패:", err);
    // 에러 발생 시 빈 배열 유지 (가라데이터 사용 금지)
    publicTemplatesList.value = [];
  } finally {
    loadingPublic.value = false;
  }
});

// 내 템플릿은 currentUser가 확정된 이후에만 로드 및 재계산
// 수정: ownerId 조건이 정확히 적용되도록 필터 명확히 설정
watch(
  () => currentUser.value,
  async (user) => {
    if (!user) {
      myTemplatesList.value = [];
      return;
    }

    loadingMy.value = true;
    errorMy.value = null;
    try {
      // ownerId === user.uid 조건 명확히 적용
      // visibility와 관계없이 모든 내 템플릿 조회
      const myFilters: any = {
        ownerId: user.uid, // 내 템플릿만 조회
      };
      if (selectedCategory.value !== "전체") {
        myFilters.category = selectedCategory.value;
      }
      
      // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
      const { sortBy, sortOrder } = parseSortOption();
      // createdAt만 서버에서 정렬, 나머지는 클라이언트에서 정렬
      const serverSortBy = sortBy === "createdAt" ? sortBy : "createdAt";
      const serverSortOrder = sortBy === "createdAt" ? sortOrder : "desc";
      const templates = await getTemplates(myFilters, serverSortBy, serverSortOrder);
      myTemplatesList.value = Array.isArray(templates) ? templates : [];
      
      // 작성자 이름 로드
      myTemplatesList.value.forEach((tpl) => {
        loadAuthorName(tpl.ownerId);
      });
    } catch (err) {
      errorMy.value = err as Error;
      console.error("내 템플릿 로드 실패:", err);
      // 에러 발생 시 빈 배열 유지 (가라데이터 사용 금지)
      myTemplatesList.value = [];
    } finally {
      loadingMy.value = false;
    }
  },
  { immediate: true } // 초기값도 감시하여 즉시 실행
);

// 카테고리/정렬 변경 시 전체 재로드
// 수정: public/my templates 쿼리를 명확히 분리하고 가라데이터 방지
const loadTemplatesData = async () => {
  // 공개 템플릿 재로드
  loadingPublic.value = true;
  errorPublic.value = null;
  try {
    // visibility === "public" 조건 명확히 적용
    const publicFilters: any = {
      visibility: "public", // 공개 템플릿만 조회
    };
    if (selectedCategory.value !== "전체") {
      publicFilters.category = selectedCategory.value;
    }
    
    // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
    const { sortBy, sortOrder } = parseSortOption();
    // createdAt만 서버에서 정렬, 나머지는 클라이언트에서 정렬
    const serverSortBy = sortBy === "createdAt" ? sortBy : "createdAt";
    const serverSortOrder = sortBy === "createdAt" ? sortOrder : "desc";
    const templates = await getTemplates(publicFilters, serverSortBy, serverSortOrder);
    publicTemplatesList.value = Array.isArray(templates) ? templates : [];
    
    // 작성자 이름 로드
    publicTemplatesList.value.forEach((tpl) => {
      loadAuthorName(tpl.ownerId);
    });
  } catch (err) {
    errorPublic.value = err as Error;
    console.error("공개 템플릿 로드 실패:", err);
    // 에러 발생 시 빈 배열 유지 (가라데이터 사용 금지)
    publicTemplatesList.value = [];
  } finally {
    loadingPublic.value = false;
  }

  // 내 템플릿 재로드 (currentUser가 있는 경우만)
  if (currentUser.value) {
    loadingMy.value = true;
    errorMy.value = null;
    try {
      // ownerId === currentUser.uid 조건 명확히 적용
      const myFilters: any = {
        ownerId: currentUser.value.uid, // 내 템플릿만 조회
      };
      if (selectedCategory.value !== "전체") {
        myFilters.category = selectedCategory.value;
      }
      
      // 초기 가라데이터 방지: 실제 Firestore 데이터만 사용
      const { sortBy, sortOrder } = parseSortOption();
      // createdAt만 서버에서 정렬, 나머지는 클라이언트에서 정렬
      const serverSortBy = sortBy === "createdAt" ? sortBy : "createdAt";
      const serverSortOrder = sortBy === "createdAt" ? sortOrder : "desc";
      const templates = await getTemplates(myFilters, serverSortBy, serverSortOrder);
      myTemplatesList.value = Array.isArray(templates) ? templates : [];
      
      // 작성자 이름 로드
      myTemplatesList.value.forEach((tpl) => {
        loadAuthorName(tpl.ownerId);
      });
    } catch (err) {
      errorMy.value = err as Error;
      console.error("내 템플릿 로드 실패:", err);
      // 에러 발생 시 빈 배열 유지 (가라데이터 사용 금지)
      myTemplatesList.value = [];
    } finally {
      loadingMy.value = false;
    }
  }
};

// 상세 이동
const goDetail = (id: string) => {
  router.push(`/templates/${id}`);
};
</script>

<style scoped>
.content-wrapper {
  padding:16px;
}

.template-list-section {
  background-color:#fff; padding:0; border-radius:12px;
  border:1px solid var(--color-primary, #000000);
}

.template-list-section .list-item {
  border-bottom:1px dashed #aeaeae;
}

.template-list-section .list-item:last-child {
  border-bottom:none;
}

.radio-tab {
  display:inline-flex; align-items:center; cursor:pointer; position:relative;
}

.radio-input {
  position:absolute; opacity:0; width:0; height:0;
}

.radio-label {
  display:inline-flex; align-items:center; justify-content:center;
  padding:6px 12px; border-radius:999px; font-size:13px; font-weight:700;
  border:1px solid #d1d5db; background-color:#fff; color:#374151;
  transition:all 0.2s ease; white-space:nowrap; margin-right:2px;
}

.radio-tab--active .radio-label {
  background-color:var(--color-primary, #000000); color:#fff;
  border-color:var(--color-primary, #000000);
}

.radio-input:checked + .radio-label {
  background-color:var(--color-primary, #000000); color:#fff;
  border-color:var(--color-primary, #000000);
}

.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:48px 16px; text-align:center;
}
</style>
