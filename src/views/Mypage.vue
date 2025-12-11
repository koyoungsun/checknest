<!-- src/views/MyPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      내 정보를 불러오는 중입니다...
    </div>

    <template v-else>
      <!-- ========== 프로필 영역 ========== -->
      <section class="px-4 py-6 bg-white border-b">
        <div class="flex flex-col items-center">

          <!-- 프로필 이미지 -->
          <div
            class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer relative mb-4"
            @click="triggerImageUpload"
          >
            <img
              v-if="profileImage"
              :src="profileImage"
              class="w-full h-full object-cover"
            />
            <i v-else class="bi bi-person text-4xl text-gray-400"></i>

            <!-- 업로드 중 스피너 -->
            <div
              v-if="uploading"
              class="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs"
            >
              업로드 중...
            </div>
          </div>

          <!-- 숨겨진 파일 업로드 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageSelected"
          />

          <!-- 닉네임 / 이메일 / 소개 -->
          <div class="flex flex-col items-center w-full">
            <div class="flex items-center space-x-2 mb-1">
              <p class="text-lg font-semibold">{{ nickname }}</p>
              <button
                class="text-xs text-blue-600 underline"
                @click="editNickname"
              >
                수정
              </button>
            </div>

            <p class="text-xs text-gray-500 mb-3">
              {{ email }}
            </p>

            <!-- 소개 -->
            <div
              class="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer w-full text-center"
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
              <div
                class="accordion-item"
                v-for="user in myMembers"
                :key="user.id"
              >
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
              <div
                class="accordion-item"
                v-for="user in blockedMembers"
                :key="user.id"
              >
                <span>{{ user.name }}</span>
                <button
                  class="unblock-btn"
                  @click="unblock(user.id)"
                >
                  해제
                </button>
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
        <button
          class="withdraw-btn w-full"
          @click="tryWithdraw"
        >
          탈퇴하기
        </button>

        <!-- 안내 문구 -->
        <p class="text-[11px] text-gray-400 mt-3 leading-relaxed text-center">
          탈퇴 시 모든 데이터는 즉시 삭제되며 복구할 수 없습니다.<br />
          동일한 정보로는 7일간 재가입이 제한됩니다.
        </p>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, deleteUser, type User } from "firebase/auth";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteUserProfile,
  type SimpleMember,
} from "@/services/userService";

/* ------------------------
   상태
------------------------ */
const router = useRouter();

const loading = ref(true);
const uid = ref<string | null>(null);
const currentUser = ref<User | null>(null);

// 프로필 정보
const nickname = ref("사용자");
const email = ref("");
const bio = ref("");
const profileImage = ref("");
const uploading = ref(false);

// 멤버/차단 멤버
const myMembers = ref<SimpleMember[]>([]);
const blockedMembers = ref<SimpleMember[]>([]);

// 아코디언 상태
const accordion = ref({
  my: false,
  blocked: false,
});

/* ------------------------
   Auth + Firestore 초기 로딩
------------------------ */
onMounted(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // 로그인 안 되어 있으면 로그인 페이지로
      router.push("/login");
      return;
    }

    currentUser.value = user;
    uid.value = user.uid;
    email.value = user.email || "";

    try {
      let userProfile = await getUserProfile(user.uid);

      if (!userProfile) {
        // 최초 로그인 유저라면 기본 프로필 생성
        await createUserProfile(user);
        userProfile = await getUserProfile(user.uid);
      }

      if (userProfile) {
        nickname.value = userProfile.nickname;
        bio.value = userProfile.bio;
        profileImage.value = userProfile.photoURL;
        myMembers.value = userProfile.myMembers;
        blockedMembers.value = userProfile.blockedMembers;
      }
    } catch (err) {
      console.error("MyPage 사용자 정보 로딩 실패:", err);
    } finally {
      loading.value = false;
    }
  });

  onUnmounted(() => {
    unsub();
  });
});

/* ------------------------
   프로필 이미지 업로드
------------------------ */
const fileInput = ref<HTMLInputElement | null>(null);

const triggerImageUpload = () => {
  fileInput.value?.click();
};

const onImageSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !uid.value) return;

  try {
    uploading.value = true;
    const url = await uploadProfileImage(uid.value, file);
    profileImage.value = url;
    await updateUserProfile(uid.value, { photoURL: url });
  } catch (err) {
    console.error("프로필 이미지 업로드 실패:", err);
    alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
  } finally {
    uploading.value = false;
  }
};

/* ------------------------
   닉네임/소개 수정
------------------------ */
const editNickname = async () => {
  if (!uid.value) return;

  const name = window.prompt("새 닉네임을 입력하세요.", nickname.value);
  if (!name) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  try {
    nickname.value = trimmed;
    await updateUserProfile(uid.value, { nickname: trimmed });
  } catch (err) {
    console.error("닉네임 업데이트 실패:", err);
    alert("닉네임 변경 중 오류가 발생했습니다.");
  }
};

const editBio = async () => {
  if (!uid.value) return;

  const text = window.prompt("자기소개를 입력하세요.", bio.value);
  if (text === null) return;

  const trimmed = text.trim();

  try {
    bio.value = trimmed;
    await updateUserProfile(uid.value, { bio: trimmed });
  } catch (err) {
    console.error("소개 업데이트 실패:", err);
    alert("소개 변경 중 오류가 발생했습니다.");
  }
};

/* ------------------------
   멤버/차단 멤버
------------------------ */
const toggle = (key: "my" | "blocked") => {
  accordion.value[key] = !accordion.value[key];
};

const unblock = async (id: string) => {
  if (!uid.value) return;

  const next = blockedMembers.value.filter((m) => m.id !== id);
  blockedMembers.value = next;

  try {
    await updateUserProfile(uid.value, { blockedMembers: next });
  } catch (err) {
    console.error("차단 해제 저장 실패:", err);
  }
};

/* ------------------------
   회원 탈퇴
------------------------ */
const tryWithdraw = async () => {
  if (!uid.value || !currentUser.value) {
    alert("로그인 정보가 없습니다. 다시 로그인 후 진행해주세요.");
    return;
  }

  const ok = window.confirm(
    "정말 탈퇴하시겠습니까?\n\n" +
      "• 탈퇴 후 동일한 정보로는 7일간 재가입할 수 없습니다.\n" +
      "• 모든 데이터는 즉시 삭제되며 복구가 불가능합니다.\n" +
      "• 삭제 데이터에는 체크리스트, 템플릿, 공유 기록 등이 포함됩니다.\n\n" +
      "계속 진행하시겠습니까?"
  );

  if (!ok) return;

  try {
    // 1) Firestore 사용자 문서 삭제
    await deleteUserProfile(uid.value);

    // TODO: 체크리스트, 템플릿 등 사용자 관련 데이터도 함께 정리

    // 2) Auth 계정 삭제
    await deleteUser(currentUser.value);

    alert("탈퇴가 완료되었습니다.");
    router.push("/login");
  } catch (err: any) {
    console.error("탈퇴 실패:", err);
    if (err?.code === "auth/requires-recent-login") {
      alert("보안을 위해 다시 로그인 후 탈퇴를 진행해주세요.");
    } else {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
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
  text-align: center;
}

.accordion-header span {
  flex: 1;
  text-align: center;
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
  text-align: center;
}

.accordion-item span {
  flex: 1;
  text-align: center;
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