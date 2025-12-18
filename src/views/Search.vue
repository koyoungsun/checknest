<template>
  <div class="bg-gray-50 pt-[100px] relative z-10 min-h-screen search-wrapper">
    <!-- 검색창 -->
    <div class="relative z-20 px-4 search-input-section">
      <SearchInput
        v-model="keyword"
        placeholder="검색어를 입력하세요"
        label="검색어를 입력하세요"
        input-id="search-input"
        @search="handleSearch"
        class="search-input"
      />
    </div>

    <!-- 검색 결과 -->
    <main class="pb-10 mt-4 px-4 search-body">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center text-gray-400 mt-20 search-loading">
        <i class="bi bi-hourglass-split text-4xl animate-spin"></i>
        <p class="mt-3 text-sm">검색 중...</p>
      </div>

      <!-- 검색어 없을 때 -->
      <div v-else-if="keyword.trim().length === 0" class="no-data search-empty">
        검색어를 입력하면 결과가 표시됩니다.
      </div>

      <!-- 검색 결과 영역 -->
      <div v-else-if="keyword.trim().length > 0" class="search-results">
        <!-- 전체 empty state -->
        <div
          v-if="
            results.checklists.length === 0 &&
            results.templates.length === 0 &&
            results.posts.length === 0
          "
          class="no-data search-empty"
        >
          <i class="bi bi-search text-4xl mb-3"></i>
          <p>검색 결과가 없습니다.</p>
        </div>

        <!-- 체크리스트 검색 결과 -->
        <section
          v-if="results.checklists.length > 0"
          class="mb-6 search-checklist-section"
        >
          <h2 class="text-xs font-semibold text-gray-500 mb-2 search-checklist-header">체크리스트</h2>
          <div class="space-y-0 search-list-section search-checklist-list">
            <div
              v-for="item in results.checklists"
              :key="item.id"
              @click="goChecklist(item.id)"
              class="list-card list-item cursor-pointer search-checklist-item"
              :class="{
                'search-item-personal': !item.members || item.members.length <= 1,
                'search-item-shared': item.members && item.members.length > 1,
              }"
            >
              <!-- 제목 -->
              <div class="mb-1">
                <h3
                  class="font-semibold"
                  style="font-size: 15px; display: flex; align-items: center; gap: 4px;"
                >
                  <strong>{{
                    !item.members || item.members.length <= 1 ? "개인" : "공유"
                  }}</strong>
                  <span
                    class="truncate"
                    v-html="highlightKeyword(item.title, keyword)"
                  ></span>
                </h3>
              </div>

              <!-- 설명 -->
              <div
                v-if="item.description"
                class="text-xs text-gray-400 mt-1 line-clamp-1"
                v-html="highlightKeyword(item.description, keyword)"
              ></div>

              <!-- 날짜 -->
              <p
                class="flex items-center"
                style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;"
                :class="
                  isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'
                "
              >
                <i
                  class="bi bi-calendar-event"
                  style="font-size: 12px; margin-right: 4px;"
                ></i>
                작성일: {{ formatCreatedAt(item.createdAt) }}
              </p>
            </div>
          </div>
        </section>

        <!-- 템플릿 검색 결과 -->
        <section v-if="results.templates.length > 0" class="mb-6 search-template-section">
          <h2 class="text-xs font-semibold text-gray-500 mb-2 search-template-header">템플릿</h2>
          <div class="space-y-0 search-template-section search-template-list">
            <div
              v-for="tpl in results.templates"
              :key="tpl.id"
              @click="goTemplate(tpl.id)"
              class="list-card list-item cursor-pointer search-template-item"
            >
              <!-- 제목 -->
              <div class="mb-1">
                <h3
                  class="font-semibold"
                  style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;"
                >
                  <strong
                    style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;"
                  >
                    {{ tpl.category }}
                  </strong>
                  <span
                    class="truncate"
                    style="color: #111;"
                    v-html="highlightKeyword(tpl.title, keyword)"
                  ></span>
                  <em
                    v-if="isNewTemplate(tpl.createdAt)"
                    style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;"
                  >
                    new
                  </em>
                </h3>
              </div>

              <!-- 설명 -->
              <div
                v-if="tpl.description"
                class="text-xs text-gray-400 mt-1 line-clamp-1"
                v-html="highlightKeyword(tpl.description, keyword)"
              ></div>

              <!-- 작성자/날짜 -->
              <div
                class="flex items-center justify-start text-xs text-gray-500 mt-2 gap-2"
              >
                <span v-if="getAuthorName(tpl.ownerId)">
                  <strong>작성자:</strong> {{ getAuthorName(tpl.ownerId) }}
                </span>
                <span v-if="getAuthorName(tpl.ownerId) && tpl.createdAt">·</span>
                <span v-if="tpl.createdAt">
                  <strong>작성일:</strong>
                  {{ formatTemplateCreatedAt(tpl.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 게시글 검색 결과 -->
        <section v-if="results.posts.length > 0" class="mb-6 search-post-section">
          <h2 class="text-xs font-semibold text-gray-500 mb-2 search-post-header">게시글</h2>
          <div class="space-y-0 search-post-section search-post-list">
            <div
              v-for="post in results.posts"
              :key="post.id"
              @click="goPost(post.id)"
              class="list-card list-item cursor-pointer search-post-item"
            >
              <!-- 제목 -->
              <div class="mb-1">
                <h3
                  class="font-semibold"
                  style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;"
                >
                  <strong
                    style="font-weight: 400; font-size: 12px; background-color: #09f; padding: 2px 4px; border-radius: 2px; color: #fff;"
                  >
                    {{
                      post.category === "notice"
                        ? "공지"
                        : post.category === "free"
                        ? "자유"
                        : "후기"
                    }}
                  </strong>
                  <span
                    class="truncate"
                    style="color: #111;"
                    v-html="highlightKeyword(post.title, keyword)"
                  ></span>
                </h3>
              </div>

              <!-- 내용 미리보기 -->
              <div
                class="text-xs text-gray-500 mt-1 line-clamp-2"
                v-html="highlightKeyword(post.content.substring(0, 100), keyword)"
              ></div>

              <!-- 작성자/날짜/댓글 수 -->
              <div
                class="flex items-center justify-start text-xs text-gray-500 mt-2 gap-2"
              >
                <span><strong>작성자:</strong> {{ post.authorName }}</span>
                <span>·</span>
                <span>
                  <strong>작성일:</strong>
                  {{ formatPostCreatedAt(post.createdAt) }}
                </span>
                <span v-if="post.commentCount > 0">·</span>
                <span v-if="post.commentCount > 0">
                  <strong>댓글:</strong> {{ post.commentCount }}개
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useSearch } from "@/composables/useSearch";
import { useAuthorName } from "@/composables/useAuthorName";
import { formatTemplateDate, toDate } from "@/utils/dateUtils";
import { isNewTemplate } from "@/utils/templateUtils";
import SearchInput from "@/components/common/SearchInput.vue";

const router = useRouter();
const { currentUser } = useAuth();
const { results, loading, search, clearResults } = useSearch();
const { getAuthorName, loadAuthorNames } = useAuthorName();

const keyword = ref("");

// 검색 실행 (debounce)
let searchTimeout: NodeJS.Timeout | null = null;
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    if (keyword.value.trim()) {
      search(keyword.value.trim());
    } else {
      clearResults();
    }
  }, 300);
};

// keyword 변경 감지
watch(
  () => keyword.value,
  () => {
    handleSearch();
  }
);

// 작성일 포맷팅
const formatCreatedAt = (createdAt: any): string => {
  const date = toDate(createdAt);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const formatTemplateCreatedAt = (createdAt: any): string => {
  const date = toDate(createdAt);
  if (!date) return "";
  return formatTemplateDate(date);
};

const formatPostCreatedAt = (createdAt: any): string => {
  return formatCreatedAt(createdAt);
};

// 종료일 판정
const isOverdue = (dueDate: any): boolean => {
  if (!dueDate) return false;
  const date = toDate(dueDate);
  if (!date) return false;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return date < now;
};

// 클릭 이동
const goChecklist = (id: string) => {
  router.push(`/checklists/${id}`);
};

const goTemplate = (id: string) => {
  router.push(`/templates/${id}`);
};

const goPost = (id: string) => {
  router.push(`/posts/${id}`);
};

// 검색어 하이라이트 함수
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword.trim() || !text) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(
    regex,
    '<mark style="background-color: transparent; color: #2272ed; font-weight: 700;">$1</mark>'
  );
};

// 작성자 이름 로드
watch(
  () => results.value.templates,
  async (templates) => {
    if (templates && templates.length > 0) {
      const ownerIds = templates.map((tpl) => tpl.ownerId).filter(Boolean);
      if (ownerIds.length > 0) {
        await loadAuthorNames(ownerIds);
      }
    }
  }
);
</script>

<style scoped>
.no-data {
  text-align: center;
  margin: 40px auto;
  color: #9ca3af;
  font-size: 14px;
}

.search-list-section,
.search-template-section,
.search-post-section {
  background-color: #fff;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--color-primary, #ff6b35);
}

.search-list-section .list-item,
.search-template-section .list-item,
.search-post-section .list-item {
  border-bottom: 1px dashed #aeaeae;
}

.search-list-section .list-item:last-child,
.search-template-section .list-item:last-child,
.search-post-section .list-item:last-child {
  border-bottom: none;
}

.search-list-section h3 strong {
  font-weight: 400;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
  margin-right: 4px;
  color: #fff;
  background-color: #333;
}

/* 개인 리스트 스타일 */
.search-item-personal {
  background: linear-gradient(
    to bottom right,
    var(--color-primary),
    var(--color-primary-light),
    #ffa366,
    #e55a2b
  );
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
