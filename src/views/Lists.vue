<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 리스트 전체 -->
    <main class="flex-1 overflow-y-auto space-y-8 pb-16 content-wrapper">

      <!-- ① 나의 체크리스트 -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            나의 체크리스트(todo)
          </h2>
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px;">
            기본 개인 리스트
          </p>
        </div>

        <div v-if="myList.length" class="space-y-0 my-list-section">
          <div
            v-for="item in myList"
            :key="item.id"
            @click="goDetail(item.id)"
            class="list-card list-item"
          >
            <!-- 제목 -->
            <div class="mb-1">
              <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong>개인</strong> <span class="truncate">{{ item.title }}</span>
              </h3>
            </div>

            <!-- 작성일 (항상 표시) -->
            <p class="flex items-center" style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px; color: #fff;">
              <i class="bi bi-calendar3" style="font-size: 12px; margin-right: 4px;"></i>
              작성일 · {{ formatCreatedAt(item.createdAt) }}
            </p>

            <!-- 종료일 (dueDate가 있는 경우만 표시) -->
            <p
              v-if="item.dueDate"
              class="flex items-center"
              style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px; color: #fff;"
              :class="isFinished(item) ? 'text-red-500' : 'text-gray-500'"
            >
              <i class="bi bi-calendar-event" style="font-size: 12px; color: #fff; margin-right: 4px;"></i>
              종료일 · {{ formatDueDate(getDueDateAsDate(item.dueDate)?.toISOString().split('T')[0] || '') }}
              <span v-if="isFinished(item)" style="margin-left: 4px; font-weight: 600; font-size: 11px;">종료됨</span>
            </p>

            <!-- 진행률 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 progress-bar progress-bar--small">
                <div
                  class="progress-fill"
                  :style="{ width: item.progress + '%', backgroundColor: getProgressColor(item.progress || 0) }"
                ></div>
              </div>
            </div>
            <!-- 진행률 퍼센트 (우측 중앙 고정) -->
            <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; gap: 4px;" :style="{ color: getProgressColor(item.progress || 0) }">
              <span style="font-size: 34px; font-weight: 700;">{{ getAnimatedProgress(item.id) }}</span>
              <span style="font-size: 20px; font-weight: 500;">%</span>
            </span>
          </div>
        </div>

        <!-- 개인 리스트 없을 때 -->
        <div v-else class="empty-state text-xs my-list-section">
          <i class="bi bi-inbox"></i>
          <p>나만 사용하는 리스트가 없습니다.<br />새 체크리스트를 만들어 보세요.</p>
        </div>
      </section>

      <!-- ② 공유 중인 체크리스트 -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            공유 중인 체크리스트
          </h2>
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px;">
            가족 · 친구 · 팀과 함께 쓰는 리스트
          </p>
        </div>

        <div v-if="sharedList.length" class="space-y-0 shared-list-section">
          <div
            v-for="item in sharedList"
            :key="item.id"
            @click="goDetail(item.id)"
            class="list-card list-item"
          >
            <!-- 제목 -->
            <div class="mb-1">
              <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong>공유</strong> <span class="truncate">{{ item.title }}</span>
              </h3>
            </div>

            <!-- 작성일 (항상 표시) -->
            <p class="flex items-center text-gray-500" style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;">
              <i class="bi bi-calendar3" style="font-size: 12px; margin-right: 4px;"></i>
              작성일 · {{ formatCreatedAt(item.createdAt) }}
            </p>

            <!-- 종료일 (dueDate가 있는 경우만 표시) -->
            <p
              v-if="item.dueDate"
              class="flex items-center"
              style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;"
              :class="isFinished(item) ? 'text-red-500' : 'text-gray-500'"
            >
              <i class="bi bi-calendar-event" style="font-size: 12px; margin-right: 4px;"></i>
              종료일 · {{ formatDueDate(getDueDateAsDate(item.dueDate)?.toISOString().split('T')[0] || '') }}
              <span v-if="isFinished(item)" style="margin-left: 4px; font-weight: 600; font-size: 11px;">종료됨</span>
            </p>

            <!-- 멤버 정보 -->
            <p style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; margin: 0; margin-top: 4px;" class="text-gray-500">
              <i class="bi bi-people" style="font-size: 12px;"></i>
              {{ item.members.length }}명 참여
            </p>

            <!-- 진행률 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 progress-bar progress-bar--small">
                <div
                  class="progress-fill progress-fill--green"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
            <!-- 진행률 퍼센트 (우측 중앙 고정) -->
            <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; color: #222; gap: 4px;">
              <span style="font-size: 34px; font-weight: 700;">{{ getAnimatedProgress(item.id) }}</span>
              <span style="font-size: 20px; font-weight: 500;">%</span>
            </span>
          </div>
        </div>

        <!-- 공유 리스트 없을 때 -->
        <div v-else class="empty-state text-xs shared-list-section">
          <i class="bi bi-people"></i>
          <p>아직 초대된 체크리스트가 없습니다.<br />가족이나 친구와 체크리스트를 공유해 보세요.</p>
        </div>
      </section>

      <!-- ③ 종료된 리스트 (항상 표시) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            종료된 체크리스트
          </h2>
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px;">
            종료일이 지난 리스트입니다. 한달 후 삭제됩니다. 저장을 원하시면 상세페이지에서 템플릿 저장을 해주세요.
          </p>
        </div>

        <div v-if="completedList.length > 0" class="space-y-0 completed-list-section">
          <div
            v-for="item in completedList"
            :key="item.id"
            @click="goDetail(item.id)"
            class="list-card list-item"
          >
            <!-- 제목 -->
            <div class="mb-1">
              <h3 class="font-semibold" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong>종료</strong> <span class="truncate">{{ item.title }}</span>
              </h3>
            </div>

            <!-- 작성일 (항상 표시) -->
            <p class="flex items-center text-gray-500" style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;">
              <i class="bi bi-calendar3" style="font-size: 12px; margin-right: 4px;"></i>
              작성일 · {{ formatCreatedAt(item.createdAt) }}
            </p>

            <!-- 종료일 (dueDate가 있는 경우만 표시) -->
            <p
              v-if="item.dueDate"
              class="flex items-center text-red-500"
              style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;"
            >
              <i class="bi bi-calendar-event" style="font-size: 12px; margin-right: 4px;"></i>
              종료일 · {{ formatDueDate(getDueDateAsDate(item.dueDate)?.toISOString().split('T')[0] || '') }}
              <span style="margin-left: 4px; font-weight: 600; font-size: 11px;">종료됨</span>
            </p>

            <!-- 진행률 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 progress-bar progress-bar--small">
                <div
                  class="progress-fill"
                  :style="{ width: item.progress + '%', backgroundColor: getProgressColor(item.progress || 0) }"
                ></div>
              </div>
            </div>
            <!-- 진행률 퍼센트 (우측 중앙 고정) -->
            <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; gap: 4px;" :style="{ color: getProgressColor(item.progress || 0) }">
              <span style="font-size: 34px; font-weight: 700;">{{ getAnimatedProgress(item.id) }}</span>
              <span style="font-size: 20px; font-weight: 500;">%</span>
            </span>
          </div>
        </div>

        <!-- 종료된 리스트 없을 때 -->
        <div v-else class="empty-state text-xs completed-list-section">
          <i class="bi bi-check-circle"></i>
          <p>종료된 체크리스트가 없습니다.</p>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import { isOverdue } from "@/utils/dateUtils";
import { getProgressColor } from "@/utils/progressColor";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import { useChecklists } from "@/composables/useChecklists";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { checklists, loadMyChecklists, loadSharedChecklists, resetChecklists } = useChecklists();
const { currentUser } = useAuth();

// 기본 todo 체크리스트 생성 로직은 useAuth.ts의 onAuthStateChanged에서만 실행됨
// Lists.vue에서는 조회(load)만 수행, 생성(create) 로직은 절대 실행하지 않음

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
// Firestore Timestamp, Date, string 모두 처리
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
  
  // 문자열인 경우 (YYYY-MM-DD 형식) - 하루의 끝 시간(23:59:59)으로 설정
  if (typeof dueDate === 'string') {
    // YYYY-MM-DD 형식인 경우 T23:59:59 추가
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      const date = new Date(dueDate + 'T23:59:59');
      if (!isNaN(date.getTime())) {
        return date;
      }
    } else {
      // 다른 형식의 문자열인 경우 그대로 파싱 시도
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null;
};

// 종료 여부 확인 헬퍼 함수
// progress === 100 && (dueDate가 지났거나 없음) → 종료됨
// progress === 100 && dueDate가 아직 남아있음 → 완료되었지만 아직 유효 (공유 중 영역에 표시)
// 기본 todo 체크리스트(isDefault === true)는 항상 false 반환 (종료 개념 없음)
const isFinished = (item: { isDefault?: boolean; progress?: number; dueDate?: any }): boolean => {
  // 기본 todo 체크리스트는 종료 개념이 없음 (예외 규칙)
  if (item.isDefault === true) {
    return false; // 항상 종료되지 않음
  }
  
  // progress를 1차 기준으로 사용
  const progress = item.progress || 0;
  
  // progress === 100인 경우만 완료 로직 진입
  if (progress === 100) {
    // dueDate가 없거나 지났으면 종료됨
    if (!item.dueDate) {
      return true; // dueDate 없음 → 종료됨
    }
    
    const dueDateObj = getDueDateAsDate(item.dueDate);
    if (dueDateObj) {
      // 현재 시간과 비교 (오늘의 끝 시간으로 설정)
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      // 종료일이 현재 시간보다 이전이면 종료된 것으로 판정
      if (dueDateObj < now) {
        return true; // dueDate 지남 → 종료됨
      }
      
      // dueDate가 아직 남아있으면 종료되지 않음 (공유 중 영역에 표시)
      return false;
    }
    
    // dueDate 파싱 실패 시 종료된 것으로 간주
    return true;
  }
  
  // progress < 100이면 종료되지 않음
  return false;
};

// 실제 체크리스트 데이터 (Firestore에서 로드)
// 모든 체크리스트 포함 (종료된 것도 포함)
// 원본 데이터를 유지하고, dueDate는 변환하지 않음 (렌더링 시에만 변환)
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
      // 원본 checklist 객체를 spread로 유지 (dueDate 포함)
      return {
        ...checklist, // 원본 데이터 유지 (dueDate 포함)
        id: checklist.id, // id는 명시적으로 유지
      };
    });
});

// 나의 체크리스트: ownerId === currentUser.uid 인 체크리스트만 포함
// 기본 todo는 myList에만 포함되고 sharedList에는 절대 포함되지 않는다
// 동일한 checklist id는 중복 노출되지 않는다
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

// 공유 중인 체크리스트: members에 currentUser.uid가 포함되고, ownerId !== currentUser.uid인 체크리스트만 포함
// 기본 todo는 절대 포함되지 않음
// 동일한 checklist id는 중복 노출되지 않는다
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
    
    const progress = item.progress || 0;
    
    // progress === 100인 경우
    if (progress === 100) {
      // dueDate가 아직 남아있으면 공유 중 영역에 표시
      if (item.dueDate) {
        const dueDateObj = getDueDateAsDate(item.dueDate);
        if (dueDateObj) {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          // dueDate가 아직 남아있으면 공유 중 영역에 표시
          if (dueDateObj >= now) {
            return true;
          }
        }
      }
      // dueDate가 없거나 지났으면 제외 (완료된 체크리스트 영역으로 이동)
      return false;
    }
    
    // progress < 100인 경우
    // 종료된 체크리스트 제외 (dueDate 지남)
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

// 종료된 리스트: progress === 100 && (dueDate 없음 OR dueDate 지남)
// 완료된 체크리스트 중 종료일이 지났거나 없는 것만 포함
// 기본 todo 체크리스트는 절대 완료 영역에 포함되지 않음 (예외 규칙)
const completedList = computed(() => {
  const finished = list.value.filter((item) => {
    // 기본 todo 체크리스트는 절대 완료 영역에 포함되지 않음 (예외 규칙)
    if (item.isDefault === true) return false;
    
    const progress = item.progress || 0;
    
    // progress === 100인 경우만 완료 로직 진입
    if (progress === 100) {
      // dueDate가 없거나 지났으면 종료된 것으로 분류
      return isFinished(item);
    }
    
    // progress < 100이면 종료되지 않음
    return false;
  });
  
  return finished;
});

// 상세로 이동
const goDetail = (id: string) => {
  router.push(`/checklists/${id}`);
};

// 진행률 애니메이션
const animatedProgress = ref<Record<string, number>>({});
const animationStarted = ref(false);

// 애니메이션된 진행률 가져오기
const getAnimatedProgress = (id: string) => {
  return animatedProgress.value[id] ?? 0;
};

// 슬롯머신 애니메이션 시작
const startProgressAnimation = () => {
  if (animationStarted.value) return;
  animationStarted.value = true;

  // 모든 리스트 아이템 수집
  const allItems = [...myList.value, ...sharedList.value, ...completedList.value];

  allItems.forEach((item) => {
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
      
      animatedProgress.value[item.id] = currentProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        animatedProgress.value[item.id] = targetProgress;
      }
    };

    requestAnimationFrame(animate);
  });
};

// 기본 todo 체크리스트 생성 로직은 useAuth.ts의 onAuthStateChanged에서만 실행됨
// Lists.vue에서는 제거됨 (중복 생성 방지)

// 데이터 로드 함수 (조회만 수행, 생성 로직 없음)
// 주의: watch/onMounted에서는 조회(load)만 수행, 생성(create/add) 로직은 실행하지 않음
const loadData = async () => {
  if (!currentUser.value) {
    console.log("[loadData] 로그인 유저 없음, 데이터 로드 스킵");
    return;
  }
  
  const user = currentUser.value;
  console.log("========== [Lists.vue] 데이터 로드 시작 (조회만 수행) ==========");
  console.log("[loadData] user.uid:", user.uid);
  
  try {
    // 1. checklists 초기화
    console.log("[loadData] 1단계: resetChecklists() 호출");
    resetChecklists();
    console.log("[loadData] resetChecklists() 후 checklists.value:", checklists.value.length, "개");
    
    // 2. 내가 만든 체크리스트 로드 (ownerId로 조회) - 조회만 수행
    console.log("[loadData] 2단계: loadMyChecklists(false) 호출");
    await loadMyChecklists(false);
    console.log("[loadData] loadMyChecklists() 후 checklists.value:", checklists.value.length, "개");
    console.log("[loadData] loadMyChecklists() 후 내 체크리스트:", checklists.value.filter(c => c.ownerId === user.uid).length, "개");
    
    // 3. 공유 체크리스트 로드 (members에 포함되어 있지만 owner가 아닌 것만) - 조회만 수행
    console.log("[loadData] 3단계: loadSharedChecklists(false) 호출");
    await loadSharedChecklists(false);
    console.log("[loadData] loadSharedChecklists() 후 checklists.value:", checklists.value.length, "개");
    
    // 4. 최종 결과 로그
    console.log("========== [Lists.vue] 데이터 로드 완료 ==========");
    console.log("[loadData] 최종 checklists.value:", checklists.value.length, "개");
    console.log("[loadData] 최종 checklists 상세:", checklists.value.map(c => ({ 
      id: c.id, 
      title: c.title, 
      ownerId: c.ownerId, 
      members: c.members,
      membersLength: c.members.length,
      isOwner: c.ownerId === user.uid,
      isPersonal: c.members.length <= 1
    })));
    
    console.log("[loadData] myList.value:", myList.value.length, "개");
    console.log("[loadData] myList 상세:", myList.value.map(item => ({
      id: item.id,
      title: item.title,
      ownerId: item.ownerId,
      members: item.members,
      membersLength: item.members.length
    })));
    
    console.log("[loadData] sharedList.value:", sharedList.value.length, "개");
    console.log("[loadData] completedList.value:", completedList.value.length, "개");
    
    // 데이터 로드 후 애니메이션 시작
    setTimeout(() => {
      startProgressAnimation();
    }, 100);
  } catch (error) {
    console.error("[loadData] 데이터 로드 중 오류 발생:", error);
  }
};

// currentUser 변경 감지 및 데이터 로드 (조회만 수행)
watch(() => currentUser.value, async (user) => {
  if (user) {
    console.log("[watch currentUser] 로그인 유저 감지:", user.uid);
    await loadData();
  } else {
    console.log("[watch currentUser] 로그인 유저 없음");
    // 로그아웃 시 checklists 초기화
    resetChecklists();
  }
}, { immediate: true });

// 페이지가 활성화될 때마다 데이터 다시 로드 (다른 페이지에서 돌아올 때) - 조회만 수행
onActivated(() => {
  console.log("[onActivated] Lists.vue 페이지 활성화");
  // 현재 로그인된 사용자가 있으면 데이터 다시 로드 (조회만 수행)
  if (currentUser.value) {
    console.log("[onActivated] 현재 로그인 유저 있음, 데이터 리로드:", currentUser.value.uid);
    loadData();
  } else {
    console.log("[onActivated] 현재 로그인 유저 없음");
  }
});
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.my-list-section {
  background: linear-gradient(to bottom right,
    var(--color-primary), var(--color-primary-light), #ffa366, #e55a2b);
  padding: 0;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #fff;
}

.my-list-section h3,
.my-list-section p,
.my-list-section span {
  color: #fff;
}

.my-list-section i {
  color: #fff;
}

.my-list-section h3 strong,
.shared-list-section h3 strong,
.completed-list-section h3 strong {
  font-weight: 400;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
  margin-right: 4px;
  color: #fff;
}

.my-list-section h3 strong {
  background-color: #333;
}

.shared-list-section h3 strong {
  background-color: var(--color-primary, #ff6b35);
}

.completed-list-section h3 strong {
  background-color: #aeaeae;
}

.shared-list-section {
  background-color: #fff;
  padding: 0;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid var(--color-primary, #ff6b35);
}

.shared-list-section .list-item {
  border-bottom: 1px dashed #aeaeae;
}

.shared-list-section .list-item:last-child {
  border-bottom: none;
}

.completed-list-section {
  background-color: #fff;
  padding: 0;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #999;
}

.completed-list-section .list-item {
  border-bottom: 1px dashed #aeaeae;
}

.completed-list-section .list-item:last-child {
  border-bottom: none;
}
</style>