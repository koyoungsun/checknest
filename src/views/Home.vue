<template>
    <div class="flex flex-col min-h-screen bg-gray-50 main-wrap">
      <!-- ================= MAIN CONTENT ================= -->
      <main class="flex-1 pb-24 px-4">
        <!-- -------- 정렬 옵션 -------- -->
        <div class="flex justify-end my-4 hidden">
          <button @click="openSort" class="px-3 py-1 bg-white border rounded-lg shadow-sm text-sm">정렬 ▾</button>
        </div>
        <!-- -------- 스와이프 체크리스트 -------- -->
        <section class="mb-6 overflow-x-hidden my-check home-swipe-section">
          <h2 class="section-title">내 체크리스트
            <router-link to="/lists" class="more-link">더보기 <i class="bi bi-chevron-right"></i></router-link>
          </h2>
          <Swiper
            :slides-per-view="2.5"
            :space-between="8"
            :centered-slides="false"
            class="swiper-container"
            style="padding: 0 16px;"
            @slideChange="onSlideChange"
          >
            <SwiperSlide
              v-for="item in homeChecklists"
              :key="item.id"
              class="swiper-slide"
            >
              <div
                @click="goDetail(item.id)"
                class="list-card list-item"
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
            <SwiperSlide class="swiper-slide">
              <router-link
                to="/checklists/create"
                class="check-card"
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 100%; height: 160px;"
              >
                <i class="bi bi-plus-circle" style="font-size: 48px; color: #ff6b35; margin-bottom: 8px;"></i>
                <h3 style="font-size: 18px; color: #e55a2b;">체크리스트 만들기</h3>
              </router-link>
            </SwiperSlide>
          </Swiper>
        </section>
        <!-- 배너존 #1 -->
        <div v-if="banner1"
              class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border">
          <img :src="banner1?.image" class="w-full object-cover" />
        </div>
        <!-- -------- 최근 템플릿 -------- -->
        <section class="mb-6 recent-template">
          <h2 class="section-title">최근 템플릿
            <router-link to="/templates" class="more-link">더보기<i class="bi bi-chevron-right"></i></router-link>
          </h2>
  
          <div class="bg-white rounded-xl shadow-sm border divide-y">
            <router-link 
              v-for="tpl in recentTemplates" 
              :key="tpl.id"
              :to="`/templates/${tpl.id}`" 
              class="block hover:bg-gray-50"
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
                <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성자:</strong> {{ tpl.author }}</span>
                <span style="flex-shrink: 0;">·</span>
                <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatTemplateDate(tpl.createdAt) }}</span>
                <span style="flex-shrink: 0;">·</span>
                <span style="flex-shrink: 0; white-space: nowrap;"><strong>추천:</strong> {{ tpl.likes }}</span>
                <span style="flex-shrink: 0;">·</span>
                <span style="flex-shrink: 0; white-space: nowrap;"><strong>사용:</strong> {{ tpl.used }}회</span>
              </div>
            </router-link>
          </div>
  
          <!-- 배너존 #2 -->
          <div v-if="banner2"
               class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border">
            <img :src="banner2?.image" class="w-full object-cover" />
          </div>
  
          
        </section>
        <!-- -------- 최근 게시글 -------- -->
        <section class="mb-10">
          <div class="recent-board">
            <h2 class="section-title">최근 게시글
              <router-link to="/posts" class="more-link">더보기<i class="bi bi-chevron-right"></i></router-link>
            </h2>
    
            <div class="bg-white rounded-xl shadow-sm border divide-y">
              <router-link 
                v-for="post in recentPosts" 
                :key="post.id"
                :to="`/posts/${post.id}`" 
                class="block hover:bg-gray-50"
                style="padding: 8px; display: flex; flex-direction: column; align-items: flex-start;"
              >
                <!-- 제목 -->
                <div class="mb-1">
                  <h3 class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px; color: #111;">
                    <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">여행</strong>
                    <span class="truncate" style="color: #111;">{{ post.title }}</span>
                    <em v-if="isNewPost(post.createdAt)" style="font-style: normal; color: #f00; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px; position: relative; top: -3px;">new</em>
                  </h3>
                </div>
                
                <!-- 작성일/코멘트 -->
                <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 0; flex-wrap: nowrap; width: 100%; gap: 4px;" class="text-gray-500">
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>작성일:</strong> {{ formatPostDate(post.createdAt) }}</span>
                  <span style="flex-shrink: 0;">·</span>
                  <span style="flex-shrink: 0; white-space: nowrap;"><strong>코멘트:</strong> {{ post.comments.length }}개</span>
                </div>
              </router-link>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  <script setup lang="ts">
    import { Swiper, SwiperSlide } from "swiper/vue";
    import "swiper/css";
    import { ref, onMounted, computed } from "vue";
    import { useRouter } from "vue-router";
    import { formatTemplateDate, formatPostDate, isOverdue, calculateDDay, getDDayColor } from "@/utils/dateUtils";
    import { useChecklists } from "@/composables/useChecklists";
    import { useAuth } from "@/composables/useAuth";

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
    
    // 작성일 포맷 헬퍼 함수
    const formatCreatedAt = (createdAt: any): string => {
      if (!createdAt) return '';
      
      let date: Date | null = null;
      
      // Firestore Timestamp인 경우
      if (createdAt && typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
      }
      
      if (!date || isNaN(date.getTime())) return '';
      
      return formatDate(date);
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
      if (!currentUser.value) return [];
      const userId = currentUser.value.uid;
      
      return checklists.value
        .filter((checklist) => {
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
    });

    // myList: ownerId === currentUser.uid 인 체크리스트만 포함
    // 기본 todo는 myList에만 포함되고 sharedList에는 절대 포함되지 않는다
    const myList = computed(() => {
      if (!currentUser.value) return [];
      const userId = currentUser.value.uid;
      
      // ownerId === currentUser.uid 인 체크리스트만 필터링
      const ownerChecklists = list.value.filter((item) => {
        return item.ownerId === userId;
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
      if (!currentUser.value) return [];
      const userId = currentUser.value.uid;
      
      const shared = list.value.filter((item) => {
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
    // 1. myList 중 기본 todo 카드가 항상 가장 먼저 노출
    // 2. 그 다음에 sharedList 카드들이 노출
    // 3. 완료된 체크리스트(progress === 100)는 제외됨 (이미 myList와 sharedList에서 필터링됨)
    const homeChecklists = computed(() => {
      const result = [];
      
      // 1. myList 중 기본 todo 카드 (항상 첫 번째)
      const defaultTodo = myList.value.find(item => item.isDefault === true);
      if (defaultTodo) {
        result.push(defaultTodo);
      }
      
      // 2. sharedList 카드들
      sharedList.value.forEach((item) => {
        result.push(item);
      });
      
      return result;
    });
    
    // 데이터 로드 및 초기 애니메이션
    onMounted(async () => {
      if (currentUser.value) {
        // 내 체크리스트와 공유 체크리스트 모두 로드
        await loadMyChecklists(false); // 완료되지 않은 체크리스트만
        await loadSharedChecklists(false); // 완료되지 않은 체크리스트만
        
        // 첫 번째 카드가 기본 todo가 아니면 애니메이션 시작
        setTimeout(() => {
          if (homeChecklists.value.length > 0 && !homeChecklists.value[0]?.isDefault) {
            startProgressAnimation(homeChecklists.value[0].id);
          }
        }, 100);
      }
    });



    // 표시할 진행률 가져오기 (애니메이션 전에는 "-" 표시)
    const getDisplayProgress = (id: string) => {
      if (animatedProgress.value[id] !== undefined) {
        return animatedProgress.value[id];
      }
      return '-';
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

    // 템플릿 데이터 (TemplatesList.vue와 동일)
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

    // 게시글 데이터 (PostListView.vue와 동일)
    const posts = ref([
      {
        id: "p1",
        author: "Aiden",
        title: "캠핑갈 때 꼭 필요한 체크리스트 공유!",
        content: "이번에 캠핑 다녀오면서 정리한 리스트입니다. 참고해서 사용하세요!",
        image: "https://placehold.co/600x400",
        createdAt: Date.now() - 1000 * 60 * 10,
        likes: 12,
        liked: false,
        comments: [
          {
            id: "c1",
            author: "Kate",
            text: "와 너무 유용하네요!",
            createdAt: Date.now() - 1000 * 60 * 5,
          },
        ],
      },
      {
        id: "p2",
        author: "Kate",
        title: "속초 여행 체크리스트 공유",
        content: "속초 여행을 다녀오면서 만든 체크리스트를 공유합니다.",
        image: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        likes: 8,
        liked: true,
        comments: [],
      },
      {
        id: "p3",
        author: "John",
        title: "명절 준비 체크 포인트",
        content: "명절 준비할 때 놓치기 쉬운 것들을 정리했습니다.",
        image: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        likes: 15,
        liked: false,
        comments: [
          {
            id: "c2",
            author: "Aiden",
            text: "정말 도움되네요!",
            createdAt: Date.now() - 1000 * 60 * 60 * 20,
          },
        ],
      },
    ]);

    // 최근 템플릿 3개 (생성일 기준 최신순)
    const recentTemplates = computed(() => {
      return [...templates.value]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3);
    });

    // 최근 게시글 3개 (생성일 기준 최신순)
    const recentPosts = computed(() => {
      return [...posts.value]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);
    });


    // 3일 이내인지 확인 (Date 객체용)
    const isNewTemplate = (date: Date) => {
      if (!date) return false;
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    };

    // 3일 이내인지 확인 (timestamp용)
    const isNewPost = (timestamp: number) => {
      if (!timestamp) return false;
      const now = Date.now();
      const diffTime = now - timestamp;
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