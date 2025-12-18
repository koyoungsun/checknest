<template>
  <div class="min-h-screen bg-gray-50 flex flex-col template-detail-wrapper">
    <PageSubtitle />

    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center flex-1 template-detail-loading">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">로딩 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center flex-1 template-detail-error">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ error.message }}</p>
        <button
          @click="loadTemplateData"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 template-detail-error-retry"
        >
          다시 시도
        </button>
      </div>
    </div>

    <!-- 정상 상태 -->
    <template v-else-if="template">
      <!-- 상단 헤더 -->
      <header class="flex items-center px-4 h-14 border-b bg-white flex-shrink-0 template-detail-header">
        <button @click="router.back()" class="mr-3 text-xl text-gray-700 template-detail-back-btn">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="text-base font-semibold truncate flex-1 template-detail-title">
          템플릿 상세
        </h1>
      </header>

      <!-- 상세 내용 -->
      <main class="flex-1 overflow-y-auto detail-content space-y-6 p-4 template-detail-body">
        <!-- 템플릿 제목 및 카테고리 -->
        <section class="bg-white p-4 rounded-xl border shadow-sm template-detail-info-section">
          <div class="flex items-start justify-between mb-2 template-detail-info-header">
            <h2 class="text-lg font-bold text-gray-800 template-detail-info-title">{{ template.title }}</h2>
            <span class="text-xs px-2 py-1 bg-orange-500 text-white rounded template-detail-info-category">
              {{ template.category }}
            </span>
          </div>
          
          <!-- 설명 -->
          <p v-if="template.description" class="text-sm text-gray-600 leading-relaxed mt-2 template-detail-info-description">
            {{ template.description }}
          </p>
        </section>

        <!-- 통계 정보 -->
        <section class="bg-white p-4 rounded-xl border shadow-sm template-detail-stats-section">
          <div class="flex items-center justify-around template-detail-stats-body">
            <div class="text-center template-detail-stats-item">
              <div class="text-2xl font-bold text-blue-600">{{ template.likeCount }}</div>
              <div class="text-xs text-gray-500 mt-1">좋아요</div>
            </div>
            <div class="text-center template-detail-stats-item">
              <div class="text-2xl font-bold text-green-600">{{ template.usedCount }}</div>
              <div class="text-xs text-gray-500 mt-1">사용 횟수</div>
            </div>
            <div class="text-center template-detail-stats-item">
              <div class="text-2xl font-bold text-gray-600">{{ template.items?.length || 0 }}</div>
              <div class="text-xs text-gray-500 mt-1">항목 수</div>
            </div>
          </div>
        </section>

        <!-- 템플릿 항목 미리보기 (그룹별) -->
        <section class="bg-white p-4 rounded-xl border shadow-sm template-detail-items-section">
          <h3 class="text-sm font-semibold mb-3 template-detail-items-header">포함된 체크 항목</h3>
          <div v-if="template.groups && template.groups.length > 0" class="space-y-4 template-detail-items-list">
            <div
              v-for="group in sortedGroups"
              :key="group.groupId"
              class="group-preview template-detail-items-group"
            >
              <h4 class="text-xs font-semibold text-gray-600 mb-2 template-detail-items-group-name">{{ group.groupName }}</h4>
              <ul class="space-y-1 ml-2 template-detail-items-group-list">
                <li
                  v-for="item in getGroupItems(group.groupId)"
                  :key="item.title"
                  class="flex items-center gap-2 text-sm text-gray-700 template-detail-items-group-item"
                >
                  <i class="bi bi-check-square text-gray-400"></i>
                  <span>{{ item.title }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 template-detail-items-empty">
            항목이 없습니다.
          </div>
        </section>

        <!-- 좋아요 버튼 -->
        <section class="bg-white p-4 rounded-xl border shadow-sm template-detail-actions-section">
          <button
            @click="handleLike"
            :disabled="isLiking"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed template-detail-like-btn"
          >
            <i :class="isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
            <span class="font-semibold">
              {{ isLiked ? '좋아요 취소' : '좋아요' }}
            </span>
          </button>
        </section>

        <!-- 템플릿 사용 버튼 -->
        <section class="pb-6 template-detail-use-section">
          <button
            @click="createChecklist"
            :disabled="isCreating"
            class="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed template-detail-use-btn"
          >
            {{ isCreating ? '생성 중...' : '이 템플릿으로 시작' }}
          </button>
        </section>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTemplates } from "@/composables/useTemplates";
import { useAuth } from "@/composables/useAuth";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const route = useRoute();
const router = useRouter();
const { currentTemplate, loading, error, loadTemplate, createChecklist: createChecklistFromTemplate, toggleLike } = useTemplates();
const { currentUser } = useAuth();

const template = currentTemplate;
const isLiked = ref(false);
const isLiking = ref(false);
const isCreating = ref(false);

// 그룹 정렬 (order 기준)
const sortedGroups = computed(() => {
  if (!template.value?.groups) return [];
  return [...template.value.groups].sort((a, b) => a.order - b.order);
});

// 그룹의 항목 목록 가져오기
const getGroupItems = (groupId: string) => {
  if (!template.value?.items) return [];
  return template.value.items.filter((item) => item.groupId === groupId);
};

// 템플릿 데이터 로드
const loadTemplateData = async () => {
  const id = route.params.id as string;
  await loadTemplate(id);
};

// 좋아요 핸들러
const handleLike = async () => {
  if (!template.value || isLiking.value) return;
  
  isLiking.value = true;
  const previousLikedState = isLiked.value;
  const previousLikeCount = template.value.likeCount;
  
  try {
    // Optimistic update: UI에 즉시 반영
    isLiked.value = !isLiked.value;
    if (isLiked.value) {
      template.value.likeCount += 1;
    } else {
      template.value.likeCount = Math.max(0, template.value.likeCount - 1);
    }
    
    // 서버에 반영
    await toggleLike(template.value.id, previousLikedState);
  } catch (err) {
    console.error("좋아요 처리 실패:", err);
    // 실패 시 원상복구
    isLiked.value = previousLikedState;
    if (template.value) {
      template.value.likeCount = previousLikeCount;
    }
    alert("좋아요 처리에 실패했습니다.");
  } finally {
    isLiking.value = false;
  }
};

// 체크리스트 생성 핸들러
const createChecklist = async () => {
  if (!template.value || !currentUser.value || isCreating.value) return;

  isCreating.value = true;
  try {
    const checklistId = await createChecklistFromTemplate(
      template.value.id,
      currentUser.value.uid
    );
    
    // 생성 완료 후 새 체크리스트 상세 페이지로 이동
    router.push(`/checklists/${checklistId}`);
  } catch (err) {
    console.error("체크리스트 생성 실패:", err);
    alert("체크리스트 생성에 실패했습니다.");
  } finally {
    isCreating.value = false;
  }
};

// 초기 로드
onMounted(() => {
  loadTemplateData();
});
</script>

<style scoped>
.detail-content {
  padding: 16px;
}
</style>
