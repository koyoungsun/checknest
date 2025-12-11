<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 검색 -->
    <section class="px-4 pt-3 bg-gray-50 border-b">
      <div class="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center shadow-sm">
        <i class="bi bi-search text-gray-500 mr-2 text-sm"></i>
        <input
          type="text"
          v-model="search"
          placeholder="제목으로 검색"
          class="bg-transparent w-full outline-none text-sm placeholder:text-gray-400"
        />
      </div>
    </section>

    <!-- 리스트 전체 -->
    <main class="flex-1 overflow-y-auto space-y-8 pb-16 content-wrapper">

      <!-- ① 개인 리스트 (My To-Do) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-semibold text-gray-600">
            나의 리스트
          </h2>
          <p class="text-[11px] text-gray-400">
            나 혼자 사용하는 리스트
          </p>
        </div>

        <div v-if="myList.length" class="space-y-0">
          <div
            v-for="item in myList"
            :key="item.id"
            @click="goDetail(item.id)"
            class="list-card list-item"
          >
            <!-- 제목 + 뱃지 -->
            <div class="flex justify-between items-center gap-2 mb-1">
              <h3 class="font-semibold text-sm truncate">
                {{ item.title }}
              </h3>
              <span class="badge badge--blue">
                개인
              </span>
            </div>

            <!-- 날짜 -->
            <p
              class="text-[11px] mt-1 flex items-center gap-1"
              :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
            >
              <i class="bi bi-calendar-event text-[11px]"></i>
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
              <span class="text-[11px] text-gray-600">
                {{ item.progress }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 개인 리스트 없을 때 -->
        <div v-else class="empty-state text-xs">
          <i class="bi bi-inbox"></i>
          <p>나만 사용하는 리스트가 없습니다.<br />새 체크리스트를 만들어 보세요.</p>
        </div>
      </section>

      <!-- ② 공유 리스트 (Shared Lists) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-semibold text-gray-600">
            공유 리스트
          </h2>
          <p class="text-[11px] text-gray-400">
            가족 · 친구 · 팀과 함께 쓰는 리스트
          </p>
        </div>

        <div v-if="sharedList.length" class="space-y-0">
          <div
            v-for="item in sharedList"
            :key="item.id"
            @click="goDetail(item.id)"
            class="list-card list-item"
          >
            <!-- 제목 + 타입 뱃지 -->
            <div class="flex justify-between items-center gap-2 mb-1">
              <h3 class="font-semibold text-sm truncate">
                {{ item.title }}
              </h3>
              <span class="badge badge--green">
                공유
              </span>
            </div>

            <!-- 날짜 + 멤버 -->
            <div class="flex items-center justify-between mt-1 text-[11px] text-gray-500">
              <p
                class="flex items-center gap-1"
                :class="isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'"
              >
                <i class="bi bi-calendar-event text-[11px]"></i>
                마감: {{ item.dueDate }}
              </p>
              <p class="flex items-center gap-1">
                <i class="bi bi-people text-[11px]"></i>
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
              <span class="text-[11px] text-gray-600">
                {{ item.progress }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 공유 리스트 없을 때 -->
        <div v-else class="empty-state text-xs">
          <i class="bi bi-people"></i>
          <p>아직 초대된 체크리스트가 없습니다.<br />가족이나 친구와 체크리스트를 공유해 보세요.</p>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { isOverdue } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();

// 임시 currentUser (나중에 인증 연동)
const currentUser = {
  id: "me",
};

// 검색
const search = ref("");

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
      item.members.length === 1 &&
      item.title.toLowerCase().includes(search.value.toLowerCase())
  );
});

// 공유 리스트: 멤버 2명 이상 또는 내가 멤버로 포함된 다른 사람 리스트
const sharedList = computed(() => {
  return list.value.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.value.toLowerCase());

    const isShared =
      item.members.length >= 2 ||
      (item.ownerId !== currentUser.id &&
        item.members.includes(currentUser.id));

    return matchesSearch && isShared;
  });
});

// 상세로 이동
const goDetail = (id: string) => {
  router.push(`/checklists/${id}`);
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}
</style>