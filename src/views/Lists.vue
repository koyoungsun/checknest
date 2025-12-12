<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 리스트 전체 -->
    <main class="flex-1 overflow-y-auto space-y-8 pb-16 content-wrapper">

      <!-- ① 개인 리스트 (My To-Do) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            나의 리스트
          </h2>
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px;">
            나 혼자 사용하는 리스트
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

            <!-- 날짜 -->
            <p
              class="flex items-center"
              style="font-size: 12px; margin-top: 4px; margin-bottom: 6px; gap: 4px;"
              :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
            >
              <i class="bi bi-calendar-event" style="font-size: 12px; color: #fff; margin-right: 4px;"></i>
              마감: {{ item.dueDate }}
            </p>

            <!-- 진행률 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 progress-bar progress-bar--small">
                <div
                  class="progress-fill"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
            <!-- 진행률 퍼센트 (우측 중앙 고정) -->
            <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; color: #4b5563; gap: 4px;">
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

      <!-- ② 공유 리스트 (Shared Lists) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            공유 리스트
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

            <!-- 날짜 + 멤버 -->
            <div style="display: flex; align-items: center; justify-content: flex-start; font-size: 12px; margin-top: 4px; margin-bottom: 6px; flex-wrap: nowrap; width: 100%; gap: 12px;">
              <p
                style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; margin: 0;"
                :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
              >
                <i class="bi bi-calendar-event" style="font-size: 12px; margin-right: 4px;"></i>
                마감: {{ item.dueDate }}
              </p>
              <p style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; margin: 0;" class="text-gray-500">
                <i class="bi bi-people" style="font-size: 12px;"></i>
                {{ item.members.length }}명 참여
              </p>
            </div>

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

      <!-- ③ 종료된 리스트 -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-600">
            종료된 리스트
          </h2>
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px;">
            마감기간 종료. 한달 후 삭제됩니다. 저장을 원하시면 상세페이지에서 템플릿 저장을 해주세요.
          </p>
        </div>

        <div v-if="completedList.length" class="space-y-0 completed-list-section">
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

            <!-- 날짜 -->
            <p
              class="flex items-center"
              style="font-size: 12px; margin-top: 4px; margin-bottom: 6px;"
              :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
            >
              <i class="bi bi-calendar-event" style="font-size: 12px; margin-right: 4px;"></i>
              마감: {{ item.dueDate }}
            </p>

            <!-- 진행률 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 progress-bar progress-bar--small">
                <div
                  class="progress-fill"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
            <!-- 진행률 퍼센트 (우측 중앙 고정) -->
            <span style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); white-space: nowrap; display: flex; align-items: baseline; color: #4b5563; gap: 4px;">
              <span style="font-size: 34px; font-weight: 700;">{{ getAnimatedProgress(item.id) }}</span>
              <span style="font-size: 20px; font-weight: 500;">%</span>
            </span>
          </div>
        </div>

        <!-- 종료된 리스트 없을 때 -->
        <div v-else class="completed-list-section">
          <p style="color: #999; font-size: 12px; letter-spacing: -1px; margin-bottom: 8px; padding: 16px;">
            종료된 리스트 입니다. 1개월 후 삭제됩니다. 템플릿을 저장하기 원하시면 템플릿에 추가하세요.
          </p>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { isOverdue } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();

// 임시 currentUser (나중에 인증 연동)
const currentUser = {
  id: "me",
};

// 더미 리스트 데이터
const list = ref([
  {
    id: "c1",
    title: "오늘의 할 일",
    ownerId: "me",
    members: ["me"],
    dueDate: "2025-12-10",
    progress: 40,
  },
  {
    id: "c2",
    title: "장보기 리스트",
    ownerId: "me",
    members: ["me", "wife"],
    dueDate: "2025-12-08",
    progress: 75,
  },
  {
    id: "c3",
    title: "캠핑 준비 체크",
    ownerId: "friend1",
    members: ["friend1", "me"],
    dueDate: "2025-12-31",
    progress: 10,
  },
]);

// 개인 리스트: ownerId = 나, 멤버 1명
const myList = computed(() => {
  return list.value.filter(
    (item) =>
      item.ownerId === currentUser.id &&
      item.members.length === 1
  );
});

// 공유 리스트: 멤버 2명 이상 또는 내가 멤버로 포함된 다른 사람 리스트
const sharedList = computed(() => {
  return list.value.filter((item) => {
    const isShared =
      item.members.length >= 2 ||
      (item.ownerId !== currentUser.id &&
        item.members.includes(currentUser.id));

    return isShared;
  });
});

// 종료된 리스트: 마감일이 지난 리스트
const completedList = computed(() => {
  return list.value.filter((item) => {
    if (!item.dueDate) return false;
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
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

// 컴포넌트 마운트 시 애니메이션 시작
onMounted(() => {
  setTimeout(() => {
    startProgressAnimation();
  }, 100);
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