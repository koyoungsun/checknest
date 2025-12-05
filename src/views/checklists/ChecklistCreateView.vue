<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 상단 헤더 -->
    <header class="flex items-center px-4 h-14 border-b bg-white">
      <button @click="router.back()" class="mr-2 text-xl">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h1 class="text-base font-semibold">새 체크리스트 만들기</h1>
    </header>

    <!-- 본문 -->
    <main class="flex-1 p-4 space-y-6">
      <!-- 제목 -->
      <section>
        <label class="block text-sm font-medium mb-1">제목</label>
        <input
          v-model="title"
          type="text"
          placeholder="예: 여행 준비, 쇼핑 리스트"
          class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100"
        />
      </section>

      <!-- 설명 -->
      <section>
        <label class="block text-sm font-medium mb-1">설명</label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="부가 설명 (선택)"
          class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100"
        ></textarea>
      </section>

      <!-- 마감일 -->
      <section>
        <label class="block text-sm font-medium mb-1">마감일 (선택)</label>
        <input
          type="date"
          v-model="dueDate"
          class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100"
        />
      </section>

      <!-- 템플릿에서 시작하기 -->
      <section>
        <label class="block text-sm font-medium mb-1">시작 방식</label>
        <button
          class="w-full py-3 border rounded-lg bg-white text-gray-700 flex justify-between items-center px-3 mb-2"
          @click="selectTemplate"
        >
          <span>
            템플릿 불러오기
            <span v-if="selectedTemplate" class="text-xs text-gray-500">
              ({{ selectedTemplate?.name }})
            </span>
          </span>
          <i class="bi bi-chevron-right"></i>
        </button>

        <p class="text-xs text-gray-500">
          템플릿을 선택하지 않으면 빈 체크리스트로 생성됩니다.
        </p>
      </section>

      <!-- 지인과 함께 사용 (초대) -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">지인과 함께 사용</span>
          <button
            class="w-12 h-6 rounded-full flex items-center px-1 transition-colors"
            :class="isShared ? 'bg-blue-500' : 'bg-gray-300'"
            @click="toggleShared"
          >
            <div
              class="w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform"
              :class="isShared ? 'translate-x-6' : ''"
            ></div>
          </button>
        </div>

        <div v-if="isShared" class="space-y-2 mt-2 text-sm">
          <p class="text-xs text-gray-500">
            친구/지인에게 체크리스트를 공유하고 같이 사용할 수 있어요.
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-2 border rounded-lg bg-white flex items-center justify-center gap-1 text-xs"
              @click="invite('friend')"
            >
              <i class="bi bi-person-plus"></i>
              친구 초대
            </button>
            <button
              type="button"
              class="flex-1 py-2 border rounded-lg bg-white flex items-center justify-center gap-1 text-xs"
              @click="invite('contact')"
            >
              <i class="bi bi-phone"></i>
              연락처 초대
            </button>
            <button
              type="button"
              class="flex-1 py-2 border rounded-lg bg-white flex items-center justify-center gap-1 text-xs"
              @click="invite('email')"
            >
              <i class="bi bi-envelope"></i>
              이메일 초대
            </button>
          </div>
        </div>
      </section>

      <!-- 공개 범위 & 비밀번호 -->
      <section>
        <label class="block text-sm font-medium mb-2">공개 범위</label>

        <div class="space-y-2 text-sm">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="private"
              v-model="accessMode"
            />
            <span>나만 보기</span>
          </label>

          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="link"
              v-model="accessMode"
            />
            <span>링크가 있는 사람만</span>
          </label>

          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="password"
              v-model="accessMode"
            />
            <span>비밀번호로 보호</span>
          </label>
        </div>

        <div v-if="accessMode === 'password'" class="mt-3">
          <label class="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            v-model="password"
            placeholder="체크리스트 입장시 필요합니다."
            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100"
          />
        </div>
      </section>
    </main>

    <!-- 하단 생성 버튼 -->
    <div class="p-4 border-t bg-white">
      <button
        class="w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold text-sm disabled:bg-gray-300"
        :disabled="!title.trim()"
        @click="createChecklist"
      >
        체크리스트 생성
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 기본 정보
const title = ref("");
const description = ref("");
const dueDate = ref("");

// 템플릿
const selectedTemplate = ref<{ id: string; name: string } | null>(null);

// 지인 공유
const isShared = ref(false);

// 공개 범위 & 비밀번호
const accessMode = ref<"private" | "link" | "password">("private");
const password = ref("");

// 템플릿 선택 (가라)
const selectTemplate = () => {
  alert("템플릿 선택 화면으로 이동 (가라)");
  // 예시로 가라데이터 하나 세팅
  selectedTemplate.value = { id: "temp_1", name: "여행 준비 템플릿" };
};

// 지인 공유 토글
const toggleShared = () => {
  isShared.value = !isShared.value;
};

// 초대 액션 (가라)
const invite = (type: "friend" | "contact" | "email") => {
  if (type === "friend") {
    alert("친구 리스트에서 초대 (알림센터 기록 대상)");
  } else if (type === "contact") {
    alert("연락처 기반 공유 링크 전송 (알림 없음)");
  } else {
    alert("이메일 초대 링크 발송 (알림 없음)");
  }
};

// 생성
const createChecklist = () => {
  console.log("체크리스트 생성 요청", {
    title: title.value,
    description: description.value,
    dueDate: dueDate.value,
    templateId: selectedTemplate.value?.id || null,
    isShared: isShared.value,
    accessMode: accessMode.value,
    password: accessMode.value === "password" ? password.value : null,
  });

  // TODO: Firestore 연동

  router.push("/checklists/1"); // 가라 상세 페이지로 이동
};
</script>

<style scoped>
</style>