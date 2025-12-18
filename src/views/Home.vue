<template>
    <div class="flex flex-col min-h-screen bg-gray-50 main-wrap home-wrapper">
      <!-- ================= MAIN CONTENT ================= -->
      <main class="flex-1 pb-24 px-4 home-body">
        <!-- -------- 정렬 옵션 -------- -->
        <div class="flex justify-end my-4 hidden">
          <button @click="openSort" class="px-3 py-1 bg-white border rounded-lg shadow-sm text-sm">정렬 ▾</button>
        </div>
        <!-- -------- 스와이프 체크리스트 (로그인 전/후 분기) -------- -->
        <section class="mb-6 overflow-x-hidden my-check home-swipe-section home-checklist-section">
            <h2 class="section-title home-checklist-header">
            {{ currentUser ? '내 체크리스트' : 'CheckNest 시작하기' }}
            <router-link 
              v-if="currentUser && homeChecklists.length >= 3" 
              to="/lists" 
              class="more-link home-checklist-more"
            >
              더보기 <i class="bi bi-chevron-right"></i>
            </router-link>
          </h2>

          <!-- 로그인 전: 서비스 소개 영역 -->
          <template v-if="!currentUser">
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg home-login-prompt">
              <div class="text-center mb-4">
                <i class="bi bi-card-checklist text-5xl mb-3"></i>
                <h3 class="text-xl font-bold mb-2">체크리스트로 일상을 관리하세요</h3>
                <p class="text-sm text-orange-50 leading-relaxed mb-4">
                  할 일을 체계적으로 관리하고<br />
                  템플릿으로 빠르게 시작하세요
                </p>
              </div>
              <div class="space-y-2 text-sm text-orange-50">
                <div class="flex items-center gap-2">
                  <i class="bi bi-check-circle text-lg"></i>
                  <span>체크리스트 생성 및 관리</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="bi bi-check-circle text-lg"></i>
                  <span>템플릿으로 빠른 시작</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="bi bi-check-circle text-lg"></i>
                  <span>게시판에서 정보 공유</span>
                </div>
              </div>
              <div class="mt-6 flex gap-3">
                <button
                  @click="handleShowLoginPrompt"
                  class="flex-1 px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  로그인
                </button>
                <button
                  @click="router.push('/signup')"
                  class="flex-1 px-4 py-2 bg-orange-700 text-white rounded-lg font-semibold hover:bg-orange-800 transition-colors"
                >
                  회원가입
                </button>
              </div>
            </div>
          </template>

          <!-- 로그인 후: 기존 체크리스트 스와이프 -->
          <template v-else>
            <template v-if="homeChecklists && homeChecklists.length > 0">
              <Swiper
                :slides-per-view="2.5"
                :space-between="8"
                :centered-slides="false"
                class="swiper-container home-checklist-list"
                style="padding: 0 16px;"
                @slideChange="onSlideChange"
              >
                <SwiperSlide
                  v-for="item in homeChecklists"
                  :key="item.id"
                  class="swiper-slide home-checklist-slide"
                >
                  <div
                    @click="goDetail(item.id)"
                    class="list-card list-item home-checklist-item"
                    :class="item.isDefault ? 'my-list-section' : 'shared-list-section'"
                    style="height: 160px; cursor: pointer;"
                  >
                    <!-- 제목 -->
                    <div class="mb-1">
                      <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                        <strong>{{ item.isDefault ? '개인' : '공유' }}</strong> <span class="truncate">{{ item.title }}</span>
                      </h3>
                    </div>

                    <!-- 작성일 (항상 표시) -->
                    <p class="flex items-center" :style="`font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px; color: ${item.isDefault ? '#fff' : '#666'};`">
                      <i class="bi bi-calendar3" :style="`font-size: 12px; margin-right: 4px; color: ${item.isDefault ? '#fff' : '#666'};`"></i>
                      작성일 · {{ formatCreatedAt(item.createdAt) }}
                    </p>

                    <!-- 종료일 (dueDate가 있는 경우만 표시, 기본 todo 제외) -->
                    <p
                      v-if="item.dueDate && !item.isDefault"
                      class="flex items-center"
                      :style="`font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px; color: ${isFinished(item) ? '#ef4444' : '#666'};`"
                    >
                      <i class="bi bi-calendar-event" :style="`font-size: 12px; margin-right: 4px; color: ${item.isDefault ? '#fff' : '#666'};`"></i>
                      종료일 · {{ formatDueDate(getDueDateAsDate(item.dueDate)?.toISOString().split('T')[0] || '') }}
                      <span v-if="isFinished(item)" style="margin-left: 4px; font-weight: 600; font-size: 11px;">종료됨</span>
                    </p>

                    <!-- 진행률 -->
                    <div class="mt-2 flex items-center gap-2" v-if="!item.isDefault">
                      <div class="flex-1 progress-bar progress-bar--small">
                        <div
                          class="progress-fill"
                          :style="{ width: (item.progress || 0) + '%', backgroundColor: getProgressColorFromValue(item.progress || 0) }"
                        ></div>
                      </div>
                    </div>
                    <!-- 진행률 퍼센트 (우측 중앙 고정, 기본 todo 제외) -->
                    <span v-if="!item.isDefault" style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; gap: 4px;" :style="{ color: getProgressColorFromValue(item.progress || 0) }">
                      <span style="font-size: 34px; font-weight: 700;">{{ getAnimatedProgress(item.id) }}</span>
                      <span style="font-size: 20px; font-weight: 500;">%</span>
                    </span>
                  </div>
                </SwiperSlide>
                <!-- 체크리스트 만들기 카드 -->
                <SwiperSlide class="swiper-slide home-checklist-slide">
                  <div
                    @click="handleCreateChecklist"
                    class="check-card cursor-pointer home-checklist-create"
                    style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 100%; height: 160px;"
                  >
                    <i class="bi bi-plus-circle" style="font-size: 48px; color: #ff6b35; margin-bottom: 8px;"></i>
                    <h3 style="font-size: 18px; color: #e55a2b;">체크리스트 만들기</h3>
                  </div>
                </SwiperSlide>
              </Swiper>
            </template>
            <div v-else class="text-center py-8 text-gray-500 text-sm home-checklist-empty">
              아직 등록된 체크리스트가 없습니다.
            </div>
          </template>
        </section>
        <!-- 배너존 #1 -->
        <div v-if="banner1"
              class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border home-banner">
          <img :src="banner1?.image" class="w-full object-cover" />
        </div>
        <!-- -------- 최근 템플릿 -------- -->
        <section class="mb-6 recent-template home-template-section">
          <h2 class="section-title home-template-header">최근 템플릿
            <router-link 
              v-if="!loadingTemplates && recentTemplates.length >= 3" 
              to="/templates" 
              class="more-link home-template-more"
            >
              더보기 <i class="bi bi-chevron-right"></i>
            </router-link>
          </h2>
  
          <div class="bg-white rounded-xl shadow-sm border divide-y home-template-list">
            <template v-if="recentTemplates && recentTemplates.length > 0">
              <router-link 
                v-for="tpl in recentTemplates" 
                :key="tpl.id"
                :to="`/templates/${tpl.id}`" 
                class="block hover:bg-gray-50 home-template-item"
                style="padding: 8px; display: flex; flex-direction: column; align-items: flex-start;"
              >
                <!-- 제목 -->
                <div class="mb-1">
                  <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                    <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">{{ tpl.category }}</strong>
                    <span class="truncate" style="color: #111;">{{ tpl.title }}</span>
                    <em v-if="isNewTemplate(tpl.createdAt)" style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                  </h3>
                </div>

                <!-- 작성자/날짜/추천/사용 -->
                <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 0; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
                  <span v-if="getAuthorName(tpl.ownerId)" style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ getAuthorName(tpl.ownerId) }}</span>
                  <span v-if="getAuthorName(tpl.ownerId) && tpl.createdAt" style="flex-shrink: 0;">·</span>
                  <span v-if="tpl.createdAt" style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatTemplateCreatedAt(tpl.createdAt) }}</span>
                  <span v-if="tpl.createdAt" style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>추천:</strong> {{ tpl.likeCount || 0 }}</span>
                  <span style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>사용:</strong> {{ tpl.usedCount || 0 }}회</span>
                </div>
              </router-link>
            </template>
            <div v-else-if="!loadingTemplates" class="text-center py-8 text-gray-500 text-sm home-template-empty">
              공유된 템플릿이 아직 없습니다.
            </div>
          </div>
  
          <!-- 배너존 #2 -->
          <div v-if="banner2"
               class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border home-banner">
            <img :src="banner2?.image" class="w-full object-cover" />
          </div>
  
          
        </section>
        <!-- -------- 최근 게시글 -------- -->
        <section class="mb-10 home-post-section">
          <div class="recent-board home-post-wrapper">
            <h2 class="section-title home-post-header">최근 게시글
              <router-link 
                v-if="!loadingBoards && recentBoards.length >= 3" 
                to="/posts" 
                class="more-link home-post-more"
              >
                더보기 <i class="bi bi-chevron-right"></i>
              </router-link>
            </h2>
    
            <div class="bg-white rounded-xl shadow-sm border divide-y home-post-list">
              <template v-if="recentBoards && recentBoards.length > 0">
                <router-link 
                  v-for="post in recentBoards" 
                  :key="post.id"
                  :to="`/posts/${post.id}`" 
                  class="block hover:bg-gray-50 home-post-item"
                  style="padding: 8px; display: flex; flex-direction: column; align-items: flex-start;"
                >
                  <!-- 제목 -->
                  <div class="mb-1">
                    <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                      <strong style="font-weight: 400; font-size: 12px; background-color: #09f; padding: 2px 4px; border-radius: 2px; color: #fff;">{{ getPostCategoryLabel(post.category) }}</strong>
                      <span class="truncate" style="color: #111;">{{ post.title }}</span>
                      <em v-if="isNewPost(post.createdAt)" style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                    </h3>
                  </div>

                  <!-- 내용 미리보기 -->
                  <div v-if="post.content" class="text-xs text-gray-600 mt-1 line-clamp-1">
                    {{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}
                  </div>

                  <!-- 작성자/날짜/좋아요 -->
                  <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 0; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
                    <span v-if="post.authorName" style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ post.authorName }}</span>
                    <span v-if="post.authorName && post.createdAt" style="flex-shrink: 0;">·</span>
                    <span v-if="post.createdAt" style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatPostCreatedAt(post.createdAt) }}</span>
                    <span v-if="post.createdAt" style="flex-shrink: 0;">·</span>
                    <span style="flex-shrink: 0; white-space: nowrap;"><strong>좋아요:</strong> {{ post.likeCount || 0 }}</span>
                    <span v-if="post.commentCount > 0" style="flex-shrink: 0;">·</span>
                    <span v-if="post.commentCount > 0" style="flex-shrink: 0; white-space: nowrap;">댓글 {{ post.commentCount }}개</span>
                  </div>
                </router-link>
              </template>
              <div v-else class="text-center py-8 text-gray-500 text-sm home-post-empty">
                아직 등록된 게시글이 없습니다.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  <script setup lang="ts">
    import { Swiper, SwiperSlide } from "swiper/vue";
    import "swiper/css";
    import { ref, computed, watch, onMounted } from "vue";
    import { useRouter } from "vue-router";
    import { formatTemplateDate, formatPostDate, isOverdue, calculateDDay, getDDayColor, toDate } from "@/utils/dateUtils";
    import { isNewTemplate } from "@/utils/templateUtils";
    import { useChecklists } from "@/composables/useChecklists";
    import { useAuth } from "@/composables/useAuth";
    import { useAuthorName } from "@/composables/useAuthorName";
    import { useBottomSheet } from "@/composables/useBottomSheet";
    import type { Template } from "@/types/template";
    import { usePosts } from "@/composables/usePosts";

    interface Banner {
      image: string;
    }

    const banner1 = ref<Banner | null>(null);
    const banner2 = ref<Banner | null>(null);

    const openSort = () => {
        console.log("open sort bottom sheet");
    };

    // 진행률 애니메이션
    const animatedProgress = ref<Record<string, number>>({});
    const animationStarted = ref<Record<string, boolean>>({});

    // 실제 체크리스트 데이터 로드
    const router = useRouter();
    const { checklists, loadMyChecklists, loadSharedChecklists } = useChecklists();
    const { currentUser } = useAuth();
    const { getAuthorName, loadAuthorNames } = useAuthorName();
    const { showLoginPrompt } = useBottomSheet();
    
    // router가 undefined가 되지 않도록 보장
    if (!router) {
      console.error("[Home.vue] Router initialization failed");
    }
    
    // 상세로 이동
    const goDetail = (id: string) => {
      if (!router) {
        console.error("[Home.vue] Router is not available");
        return;
      }
      router.push(`/checklists/${id}`);
    };

    // 체크리스트 만들기 클릭 핸들러
    const handleCreateChecklist = () => {
      if (!currentUser.value) {
        showLoginPrompt.value = true;
        return;
      }
      router.push("/checklists/new");
    };

    // 로그인 유도 모달 표시
    const handleShowLoginPrompt = () => {
      showLoginPrompt.value = true;
    };
    
    // 날짜 포맷 헬퍼 함수: YYYY.MM.DD
    const formatDate = (date: Date | string | null | undefined): string => {
      if (!date) return '';
      
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return '';
      }
      
      if (isNaN(dateObj.getTime())) return '';
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    };
    
    // 작성일 포맷 헬퍼 함수 (체크리스트용)
    const formatCreatedAt = (createdAt: any): string => {
      const date = toDate(createdAt);
      if (!date) return '';
      return formatDate(date);
    };

    // 템플릿 작성일 포맷 헬퍼 함수 (템플릿용 - formatTemplateDate 사용)
    const formatTemplateCreatedAt = (createdAt: any): string => {
      const date = toDate(createdAt);
      if (!date) return '';
      return formatTemplateDate(date);
    };
    
    // 종료일 포맷 헬퍼 함수
    const formatDueDate = (dueDate: string | null): string => {
      if (!dueDate) return '';
      return formatDate(dueDate);
    };
    
    // 종료 판정용 Date 변환 함수
    const getDueDateAsDate = (dueDate: any): Date | null => {
      if (!dueDate) return null;
      
      // Firestore Timestamp인 경우
      if (dueDate && typeof dueDate.toDate === 'function') {
        return dueDate.toDate();
      }
      
      // 이미 Date 객체인 경우
      if (dueDate instanceof Date) {
        return dueDate;
      }
      
      // 문자열인 경우 (YYYY-MM-DD 형식)
      if (typeof dueDate === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
          const date = new Date(dueDate + 'T23:59:59');
          if (!isNaN(date.getTime())) {
            return date;
          }
        } else {
          const date = new Date(dueDate);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
      
      return null;
    };
    
    // 종료 여부 확인 헬퍼 함수
    const isFinished = (item: { isDefault?: boolean; progress?: number; dueDate?: any }): boolean => {
      // 기본 todo 체크리스트는 종료 개념이 없음
      if (item.isDefault === true) {
        return false;
      }
      
      const progress = item.progress || 0;
      
      // progress === 100인 경우만 완료 로직 진입
      if (progress === 100) {
        if (!item.dueDate) {
          return true;
        }
        
        const dueDateObj = getDueDateAsDate(item.dueDate);
        if (dueDateObj) {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          
          if (dueDateObj < now) {
            return true;
          }
          
          return false;
        }
        
        return true;
      }
      
      return false;
    };
    
    // list computed: members에 currentUser.uid가 포함된 체크리스트만 필터링
    const list = computed(() => {
      if (!currentUser.value) {
        return [];
      }
      
      const userId = currentUser.value.uid;
      const checklistsArray = Array.isArray(checklists.value) ? checklists.value : [];
      
      const filtered = checklistsArray
        .filter((checklist) => {
          if (!checklist || !checklist.id) return false;
          
          // members 배열에 userId가 포함되어 있는지 확인
          if (!checklist.members || !Array.isArray(checklist.members)) return false;
          
          // members가 객체 배열인 경우 (Array<{ userId: string; role: string }>)
          if (checklist.members.length > 0 && typeof checklist.members[0] === 'object' && checklist.members[0] !== null) {
            return checklist.members.some((m: any) => m && m.userId === userId);
          }
          
          // members가 문자열 배열인 경우 (legacy)
          return checklist.members.includes(userId);
        })
        .map((checklist) => {
          // 원본 checklist 객체를 spread로 유지
          return {
            ...checklist,
            id: checklist.id,
          };
        });
      
      return filtered;
    });

    // myList: ownerId === currentUser.uid 인 체크리스트만 포함
    // 기본 todo는 myList에만 포함되고 sharedList에는 절대 포함되지 않는다
    const myList = computed(() => {
      if (!currentUser.value) {
        return [];
      }
      
      const userId = currentUser.value.uid;
      const listArray = Array.isArray(list.value) ? list.value : [];
      
      // ownerId === currentUser.uid 인 체크리스트만 필터링
      const ownerChecklists = listArray.filter((item) => {
        return item && item.ownerId === userId;
      });
      
      // 기본 todo 체크리스트 (여러 개가 있어도 가장 오래된 1개만 사용)
      const allDefaultTodos = ownerChecklists.filter((item) => {
        return item.isDefault === true;
      });
      
      // createdAt 오름차순 정렬하여 가장 오래된 1개만 선택
      const defaultTodos = allDefaultTodos.length > 0
        ? [allDefaultTodos.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return aTime - bTime; // 오름차순 (가장 오래된 것)
          })[0]]
        : [];
      
      // 일반 체크리스트 (기본 todo 제외, 완료/종료 제외)
      const regularChecklists = ownerChecklists.filter((item) => {
        // 기본 todo는 제외 (위에서 별도 처리)
        if (item.isDefault === true) return false;
        
        // progress === 100이면 즉시 제외 (완료됨)
        const progress = item.progress || 0;
        if (progress === 100) return false;
        
        // 종료된 체크리스트 제외 (progress < 100이지만 dueDate 지남)
        if (isFinished(item)) return false;
        
        return true;
      });
      
      // 기본 todo를 최상단에 고정, 그 다음 일반 체크리스트
      // Set을 사용하여 중복 제거 (동일 id는 1번만 포함)
      const checklistMap = new Map<string, typeof ownerChecklists[0]>();
      
      // 기본 todo 추가 (1개만)
      defaultTodos.forEach(item => {
        checklistMap.set(item.id, item);
      });
      
      // 일반 체크리스트 추가 (중복 제거)
      regularChecklists.forEach(item => {
        if (!checklistMap.has(item.id)) {
          checklistMap.set(item.id, item);
        }
      });
      
      return Array.from(checklistMap.values());
    });

    // sharedList: members에 currentUser.uid가 포함되고, ownerId !== currentUser.uid인 체크리스트만 포함
    // 기본 todo는 절대 포함되지 않음
    // progress === 100인 체크리스트는 제외
    const sharedList = computed(() => {
      if (!currentUser.value) {
        return [];
      }
      
      const userId = currentUser.value.uid;
      const listArray = Array.isArray(list.value) ? list.value : [];
      
      const shared = listArray.filter((item) => {
        if (!item || !item.id) return false;
        // 기본 todo 체크리스트는 절대 공유 영역에 포함되지 않음
        if (item.isDefault === true) return false;
        
        // ownerId === currentUser.uid인 체크리스트는 제외 (myList에 포함됨)
        if (item.ownerId === userId) return false;
        
        // members에 currentUser.uid가 포함되어 있는지 확인
        if (!item.members || !Array.isArray(item.members)) return false;
        
        // members가 객체 배열인 경우 (Array<{ userId: string; role: string }>)
        if (item.members.length > 0 && typeof item.members[0] === 'object' && item.members[0] !== null) {
          const isMember = item.members.some((m: any) => m && m.userId === userId);
          if (!isMember) return false;
        } else {
          // members가 문자열 배열인 경우 (legacy)
          if (!item.members.includes(userId)) return false;
        }
        
        // progress === 100이면 제외 (완료됨)
        const progress = item.progress || 0;
        if (progress === 100) return false;
        
        // 종료된 체크리스트 제외
        if (isFinished(item)) return false;
        
        return true;
      });
      
      // Set을 사용하여 중복 제거 (동일 id는 1번만 포함)
      const checklistMap = new Map<string, typeof shared[0]>();
      shared.forEach(item => {
        if (!checklistMap.has(item.id)) {
          checklistMap.set(item.id, item);
        }
      });
      
      return Array.from(checklistMap.values());
    });

    // 홈 스와이프 체크리스트 데이터
    // 노출 규칙:
    // 1. myList의 모든 항목 포함 (기본 todo + 일반 체크리스트)
    // 2. sharedList의 모든 항목 포함
    // 3. myList와 sharedList는 OR 조건 (하나라도 존재하면 노출)
    const homeChecklists = computed(() => {
      // myList와 sharedList가 배열인지 확인하고 기본값 설정
      const mine = Array.isArray(myList.value) ? myList.value : [];
      const shared = Array.isArray(sharedList.value) ? sharedList.value : [];
      
      // myList와 sharedList를 단순 병합 (OR 조건)
      return [...mine, ...shared];
    });
    
    // ==================== 데이터 로딩 함수 정의 ====================
    
    // ============================================================
    // 섹션 1: 최근 템플릿 로드 함수
    // ============================================================
    // - Public 데이터: 로그인 여부와 무관하게 public 템플릿만 조회
    // - currentUser 의존성 없음 (독립 실행)
    // - onMounted에서만 호출됨
    // - 다른 섹션과 독립적으로 동작
    // 
    // 조회 조건:
    // - visibility === "public" 인 템플릿만 조회
    // - 최신순(createdAt desc)
    // - 최대 3개 표시
    const loadRecentTemplates = async () => {
      loadingTemplates.value = true;
      try {
        console.log("[HOME] loadRecentTemplates start");
        const { getTemplates } = await import("@/services/templates");
        
        // visibility === "public" 인 템플릿만 조회 (최신순)
        const publicTemplates = await getTemplates(
          { visibility: "public" },
          "createdAt",
          "desc"
        );
        
        // 실제 쿼리 결과 개수 확인
        const queryResultCount = Array.isArray(publicTemplates) ? publicTemplates.length : 0;
        console.log("[HOME] loadRecentTemplates query result:", queryResultCount, "templates (visibility: public)");
        
        // 최대 3개만 표시
        const templatesArray = Array.isArray(publicTemplates) ? publicTemplates : [];
        templates.value = templatesArray.slice(0, 3);
        const displayCount = templates.value.length;
        
        // 작성자 이름 로드 (템플릿이 있는 경우만)
        const ownerIds = templates.value.map((tpl) => tpl?.ownerId).filter(Boolean);
        if (ownerIds.length > 0) {
          await loadAuthorNames(ownerIds);
        }
        
        console.log("[HOME] loadRecentTemplates done: query=" + queryResultCount + ", display=" + displayCount);
        
        // 쿼리 결과가 0개인 경우에만 경고 (정상 상태일 수 있음)
        if (queryResultCount === 0) {
          console.warn("[HOME] loadRecentTemplates: Firestore에 public 템플릿이 0개입니다. visibility='public'인 템플릿이 있는지 확인하세요.");
        }
      } catch (err: any) {
        console.error("[HOME] loadRecentTemplates failed:", err?.message || err);
        templates.value = [];
      } finally {
        loadingTemplates.value = false;
      }
    };

    // ============================================================
    // 섹션 2: 최근 게시글 로드 함수
    // ============================================================
    // - Public 데이터: 로그인 여부와 무관하게 public 게시글만 조회
    // - currentUser 의존성 없음 (독립 실행)
    // - onMounted에서만 호출됨
    // - 다른 섹션과 독립적으로 동작
    const loadRecentBoards = async () => {
      loadingBoards.value = true;
      try {
        console.log("[HOME] loadRecentBoards start");
        await loadPosts(undefined, 5); // limit(5) 적용 (최근 게시글 5개)
        const count = recentPostsData.value.length;
        console.log("[HOME] loadRecentBoards done:", count);
        if (count === 0) {
          console.warn("[HOME] loadRecentBoards: 게시글이 0개입니다. Firestore에 데이터가 있는지 확인하세요.");
        }
      } catch (err: any) {
        console.error("[HOME] loadRecentBoards failed:", err?.message || err);
        // 에러 발생 시에도 빈 배열로 설정하여 UI가 깨지지 않도록 함
        recentPostsData.value = [];
      } finally {
        loadingBoards.value = false;
      }
    };

    // ============================================================
    // 섹션 3: 내 체크리스트 로드 함수
    // ============================================================
    // - Private 데이터: 로그인 상태(currentUser 존재)일 때만 로드
    // - currentUser 의존성 있음 (watch에서 호출됨)
    // - watch(currentUser)에서만 호출됨
    // - 다른 섹션과 독립적으로 동작
    const loadChecklists = async () => {
      // currentUser가 없으면 체크리스트 로드 불가
      if (!currentUser.value) {
        console.info("[HOME] loadChecklists: currentUser not ready → skip");
        return;
      }
      
      console.log("[HOME] loadChecklists start");
      
      try {
        await Promise.all([
          loadMyChecklists(false),
          loadSharedChecklists(false)
        ]);
        
        // 첫 번째 카드가 기본 todo가 아니면 애니메이션 시작
        setTimeout(() => {
          if (homeChecklists.value && homeChecklists.value.length > 0 && !homeChecklists.value[0]?.isDefault) {
            startProgressAnimation(homeChecklists.value[0].id);
          }
        }, 100);
        
        console.log("[HOME] loadChecklists done");
      } catch (err: any) {
        console.error("[HOME] loadChecklists failed:", err?.message || err);
      }
    };
    
    // ==================== Watch & Lifecycle ====================
    
    // ============================================================
    // Public 데이터 로드 (로그인 불필요)
    // ============================================================
    // 섹션 1: 최근 템플릿 - 로그인 여부와 무관하게 public 템플릿 로드
    // 섹션 2: 최근 게시글 - 로그인 여부와 무관하게 public 게시글 로드
    // - currentUser 의존성 없음 (독립 실행)
    // - onMounted에서만 실행
    onMounted(() => {
      loadRecentTemplates();
      loadRecentBoards();
    });
    
    // ============================================================
    // 섹션 3: 내 체크리스트 (Private 데이터)
    // ============================================================
    // - 로그인 상태(currentUser 존재)일 때만 로드
    // - currentUser 의존성 있음
    // - watch(currentUser)에서만 실행
    watch(
      () => currentUser.value,
      (user, prevUser) => {
        // currentUser가 없으면 체크리스트 로드 스킵
        if (!user) {
          console.info("[HOME] currentUser not ready → skip load checklists");
          return;
        }
        
        // 계정 전환 감지
        if (prevUser && prevUser.uid !== user.uid) {
          const { resetChecklists } = useChecklists();
          resetChecklists();
        }
        
        // currentUser 확정 후 체크리스트만 로드
        loadChecklists();
      },
      { immediate: true }
    );



    // 표시할 진행률 가져오기 (애니메이션 전에는 "-" 표시)
    const getDisplayProgress = (id: string) => {
      if (animatedProgress.value[id] !== undefined) {
        return animatedProgress.value[id];
      }
      return '-';
    };

    // 애니메이션된 진행률 가져오기 (템플릿에서 사용)
    const getAnimatedProgress = (id: string): number => {
      if (animatedProgress.value[id] !== undefined) {
        return animatedProgress.value[id];
      }
      // 애니메이션 값이 없으면 실제 progress 값 반환
      const item = homeChecklists.value.find(item => item.id === id);
      return item?.progress || 0;
    };

    // 진행률 변동 추적 (1일 단위)
    const progressHistory = ref<Record<string, { progress: number; date: string }>>({});

    // 진행률 색상 계산 (동적 반응)
    const getProgressColor = (id: string) => {
      const item = homeChecklists.value.find(item => item.id === id);
      if (!item) return '#999';
      
      // progress 값을 직접 사용 (애니메이션 값이 있으면 사용, 없으면 실제 progress)
      const progress = animatedProgress.value[id] !== undefined 
        ? animatedProgress.value[id] 
        : (item.progress || 0);
      
      // 진행률 컬러 계산 함수 사용
      return getProgressColorFromValue(progress);
    };
    
    // 진행률 값에서 컬러 계산 (공통 함수)
    const getProgressColorFromValue = (progressValue: number): string => {
      // 0% ~ 9%: 기본 회색
      if (progressValue < 10) {
        return '#999';
      }
      
      // 10% ~ 50%: 점점 진해지는 블루 (보간)
      if (progressValue >= 10 && progressValue < 50) {
        const ratio = (progressValue - 10) / 40;
        const r1 = 135, g1 = 206, b1 = 235; // 연한 블루 RGB
        const r2 = 34, g2 = 114, b2 = 237; // 진한 블루 RGB
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      // 51% ~ 100%: 블루 → 퍼플 → 레드 자연 전환 (보간)
      if (progressValue >= 51 && progressValue <= 100) {
        let r, g, b;
        
        if (progressValue < 75) {
          // 51% ~ 75%: 블루 → 퍼플
          const ratio = (progressValue - 51) / 24;
          const r1 = 34, g1 = 114, b1 = 237; // 진한 블루 RGB
          const r2 = 139, g2 = 0, b2 = 255; // 퍼플 RGB
          
          r = Math.round(r1 + (r2 - r1) * ratio);
          g = Math.round(g1 + (g2 - g1) * ratio);
          b = Math.round(b1 + (b2 - b1) * ratio);
        } else {
          // 75% ~ 100%: 퍼플 → 레드
          const ratio = (progressValue - 75) / 25;
          const r1 = 139, g1 = 0, b1 = 255; // 퍼플 RGB
          const r2 = 255, g2 = 0, b2 = 0; // 레드 RGB
          
          r = Math.round(r1 + (r2 - r1) * ratio);
          g = Math.round(g1 + (g2 - g1) * ratio);
          b = Math.round(b1 + (b2 - b1) * ratio);
        }
        
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      return '#999';
    };

    // 슬롯머신 애니메이션 시작 (특정 ID에 대해)
    const startProgressAnimation = (id: string) => {
      // 이미 애니메이션이 시작된 경우 중복 실행 방지
      if (animationStarted.value[id]) return;
      animationStarted.value[id] = true;

      const item = homeChecklists.value.find(item => item.id === id);
      if (!item) return;
      const targetProgress = item.progress;
      const duration = 1500; // 1.5초
      const startTime = Date.now();
      const startProgress = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easing 함수 (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentProgress = Math.floor(startProgress + (targetProgress - startProgress) * easeOut);
        
        animatedProgress.value[id] = currentProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          animatedProgress.value[id] = targetProgress;
        }
      };

      requestAnimationFrame(animate);
    };

    // 슬라이드 변경 이벤트 핸들러
    const onSlideChange = (swiper: any) => {
      const activeIndex = swiper.activeIndex;
      const activeSlide = homeChecklists.value[activeIndex];
      if (activeSlide && !activeSlide.isDefault) {
        startProgressAnimation(activeSlide.id);
      }
    };

    // ==================== 상태 선언 ====================
    
    // 템플릿 데이터
    const templates = ref<Template[]>([]);
    const loadingTemplates = ref(false);
    
    // 게시글 데이터 (usePosts composable에서 관리)
    const { posts: recentPostsData, loadPosts } = usePosts();
    const loadingBoards = ref(false);
    
    // ==================== Computed ====================
    
    // 최근 템플릿 3개
    const recentTemplates = computed(() => {
      return Array.isArray(templates.value) ? templates.value : [];
    });

    // 최근 게시글 3개 (posts 컬렉션 사용)
    const recentBoards = computed(() => {
      const postsArray = Array.isArray(recentPostsData.value) ? recentPostsData.value : [];
      return postsArray.slice(0, 3); // 최대 3개만 표시
    });

    // 게시글 카테고리 라벨
    const getPostCategoryLabel = (category: "notice" | "free" | "review"): string => {
      const labels: Record<"notice" | "free" | "review", string> = {
        notice: "공지",
        free: "자유",
        review: "후기",
      };
      return labels[category] || category;
    };

    // 게시글 작성일 포맷팅
    const formatPostCreatedAt = (createdAt: any): string => {
      if (!createdAt) return '';
      const date = toDate(createdAt);
      if (!date) return '';
      return formatTemplateDate(date);
    };

    // 게시글 NEW 뱃지 판별 (createdAt 기준)
    const isNewPost = (createdAt: any): boolean => {
      if (!createdAt) return false;
      const date = toDate(createdAt);
      if (!date) return false;
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    };

    // 3일 이내인지 확인 (날짜 문자열 형식: "2025.12.02") - 기존 호환성 유지
    const isNew = (dateString: string) => {
      if (!dateString) return false;
      const [year, month, day] = dateString.split('.').map(Number);
      const created = new Date(year, month - 1, day);
      const now = new Date();
      const diffTime = now.getTime() - created.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    };
  </script>
  <style>
  </style>