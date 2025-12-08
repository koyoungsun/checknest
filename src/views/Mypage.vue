<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- ========== 프로필 영역 ========== -->
    <section class="px-4 py-6 bg-white border-b">
      <div class="flex items-center space-x-4">

        <!-- 프로필 이미지 -->
        <div
          class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer"
          @click="triggerImageUpload"
        >
          <img
            v-if="profileImage"
            :src="profileImage"
            class="w-full h-full object-cover"
          />
          <i v-else class="bi bi-person text-4xl text-gray-400"></i>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onImageSelected"
        />

        <!-- 닉네임 / 이메일 / 소개 -->
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <p class="text-lg font-semibold">{{ nickname }}</p>
            <button class="text-xs text-blue-600 underline" @click="editNickname">
              수정
            </button>
          </div>

          <p class="text-xs text-gray-500">{{ email }}</p>

          <!-- 소개 -->
          <div
            class="bg-gray-100 rounded-lg px-3 py-2 mt-2 text-sm text-gray-700 cursor-pointer"
            @click="editBio"
          >
            <span v-if="bio">{{ bio }}</span>
            <span v-else class="text-gray-400">자기소개를 입력하세요.</span>
          </div>
        </div>
      </div>
    </section>


    <!-- ========================================================= -->
    <!--                        멤버 관리                          -->
    <!-- ========================================================= -->

    <main class="px-4 py-4 space-y-4 flex-1">

      <!-- ===== 나의 멤버 ===== -->
      <div class="accordion-group">
        <button class="accordion-header" @click="toggle('my')">
          <span>나의 멤버</span>
          <i :class="['bi', accordion.my ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
        </button>

        <div v-if="accordion.my" class="accordion-body">
          <template v-if="myMembers.length > 0">
            <div class="accordion-item" v-for="user in myMembers" :key="user.id">
              <span>{{ user.name }}</span>
              <i class="bi bi-person-check text-green-600"></i>
            </div>
          </template>

          <!-- 빈 상태 -->
          <div v-else class="empty-state">
            <i class="bi bi-people text-3xl text-gray-400"></i>
            <p class="text-sm text-gray-500 mt-2">아직 멤버가 없습니다.</p>
          </div>
        </div>
      </div>


      <!-- ===== 차단한 멤버 ===== -->
      <div class="accordion-group">
        <button class="accordion-header" @click="toggle('blocked')">
          <span>차단한 멤버</span>
          <i :class="['bi', accordion.blocked ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
        </button>

        <div v-if="accordion.blocked" class="accordion-body">
          <template v-if="blockedMembers.length > 0">
            <div class="accordion-item" v-for="user in blockedMembers" :key="user.id">
              <span>{{ user.name }}</span>
              <button class="unblock-btn" @click="unblock(user.id)">해제</button>
            </div>
          </template>

          <!-- Empty -->
          <div v-else class="empty-state">
            <i class="bi bi-slash-circle text-3xl text-gray-400"></i>
            <p class="text-sm text-gray-500 mt-2">차단한 멤버가 없습니다.</p>
          </div>
        </div>
      </div>

    </main>


    <!-- ========================================================= -->
    <!--                        탈퇴하기 버튼                      -->
    <!-- ========================================================= -->
    <div class="px-4 py-6">
      <button class="withdraw-btn w-full" @click="tryWithdraw">
        탈퇴하기
      </button>

      <!-- 안내 문구 -->
      <p class="text-[11px] text-gray-400 mt-3 leading-relaxed text-center">
        탈퇴 시 모든 데이터는 즉시 삭제되며 복구할 수 없습니다.<br />
        동일한 정보로는 7일간 재가입이 제한됩니다.
      </p>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref } from "vue";

// ------------------------
// 유저 기본 정보
// ------------------------
const nickname = ref("Aiden");
const email = ref("aiden@example.com");
const bio = ref("");
const profileImage = ref("");

const fileInput = ref<HTMLInputElement | null>(null);

const triggerImageUpload = () => fileInput.value?.click();

const onImageSelected = (e: any) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => (profileImage.value = reader.result as string);
  reader.readAsDataURL(file);
};

const editNickname = () => {
  const name = prompt("새 닉네임 입력", nickname.value);
  if (name) nickname.value = name.trim();
};

const editBio = () => {
  const text = prompt("소개 입력", bio.value);
  if (text !== null) bio.value = text.trim();
};


// ------------------------
// 멤버 / 차단 멤버
// ------------------------
const myMembers = ref([]);       // 기본은 빈 상태
const blockedMembers = ref([]);  // 기본은 빈 상태

const unblock = (id: number) => {
  blockedMembers.value = blockedMembers.value.filter((m) => m.id !== id);
};


// ------------------------
// 아코디언
// ------------------------
const accordion = ref({
  my: false,
  blocked: false,
});

const toggle = (key: string) => {
  accordion.value[key] = !accordion.value[key];
};


// ------------------------
// 회원 탈퇴
// ------------------------
const tryWithdraw = () => {
  const confirmDelete = confirm(
    "정말 탈퇴하시겠습니까?\n\n" +
    "• 탈퇴 후 동일한 정보로는 7일간 재가입할 수 없습니다.\n" +
    "• 모든 데이터는 즉시 삭제되며 복구가 불가능합니다.\n" +
    "• 삭제 데이터에는 체크리스트, 템플릿, 공유 기록 등이 포함됩니다.\n\n" +
    "계속 진행하시겠습니까?"
  );

  if (confirmDelete) {
    alert("탈퇴 처리 예정입니다. (Firestore 연동 후 실제 삭제 예정)");
    // TODO:
    // 1) Firestore 사용자 문서 삭제
    // 2) 체크리스트/템플릿/공유 데이터 정리
    // 3) Firebase Auth 계정 삭제
  }
};
</script>


<style scoped>
.accordion-group {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 14px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-body {
  border-top: 1px solid #f3f4f6;
  padding: 12px 0;
}

.accordion-item {
  padding: 12px 16px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
}

.unblock-btn {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
}

.withdraw-btn {
  background: #dc2626;
  color: white;
  font-size: 0.9rem;
  padding: 14px 0;
  border-radius: 12px;
  font-weight: 600;
}
</style>