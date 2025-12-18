<script setup lang="ts">
import { auth } from "@/firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getUserProfileData } from "@/services/userProfileService";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  open: { type: Boolean, required: true }
});

const emit = defineEmits(["close"]);
const router = useRouter();

// 사용자 정보
const user = ref({
  nickname: "",
  email: "",
  photoURL: ""
});

const uid = ref<string | null>(null);

/* ============================================================
   🔥 로그인 상태 감지 (실시간)
============================================================ */
onMounted(() => {
  onAuthStateChanged(auth, async (current) => {
    if (!current) {
      uid.value = null;
      user.value = { nickname: "", email: "", photoURL: "" };
      return;
    }

    uid.value = current.uid;
    await loadUserProfile();
  });
});

/* ============================================================
   🔥 네비가 열릴 때마다 유저정보 다시 로딩
============================================================ */
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && uid.value) {
      await loadUserProfile();
    }
  }
);

/* ============================================================
   🔥 Firestore 프로필 불러오기
============================================================ */
const loadUserProfile = async () => {
  const current = auth.currentUser;
  if (!current) return;

  const profileData = await getUserProfileData(current);
  user.value = {
    nickname: profileData.nickname,
    email: profileData.email,
    photoURL: profileData.photoURL,
  };
};

/* ============================================================
   기능
============================================================ */
const close = () => emit("close");

const goMyPage = () => {
  router.push("/my");
  close();
};

const logout = async () => {
  await signOut(auth);
  router.push("/login");
  close();
};
</script>

<template>
  <div>
    <!-- dim overlay -->
    <div v-if="open" class="dimd" @click="close"></div>

    <!-- RIGHT NAV -->
    <aside class="slide-nav" :class="{ 'slide-nav--open': open }">

      <!-- Close icon -->
      <div class="top-bar top-bar--left">
        <button class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Profile box -->
      <div class="profile-box" @click="goMyPage">
        <div class="avatar overflow-hidden">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            class="w-full h-full object-cover"
          />
          <i
            v-else
            class="bi bi-person text-4xl text-gray-500 flex items-center justify-center h-full"
          ></i>
        </div>

        <div class="nickname">{{ user.nickname }}</div>
        <div class="email">{{ user.email }}</div>

        <div class="mypage-link">마이페이지 →</div>
      </div>

      <!-- MENU -->
      <nav class="menu-list">
        <router-link to="/lists" class="menu-item" @click="close">나의 체크리스트</router-link>
        <router-link to="/templates" class="menu-item" @click="close">템플릿</router-link>
        <router-link to="/posts" class="menu-item" @click="close">게시글·공유</router-link>
        <router-link to="/notifications" class="menu-item" @click="close">
          <i class="bi bi-bell mr-2"></i>내 알람
        </router-link>
        <router-link to="/notices" class="menu-item" @click="close">공지사항</router-link>
      </nav>

      <!-- FOOTER -->
      <footer class="footer-simple">
        <router-link to="/terms" class="footer-link" @click="close">이용약관</router-link>
        <router-link to="/privacy" class="footer-link" @click="close">개인정보 처리방침</router-link>

        <span class="footer-version">CheckNest v1.0.0</span>

        <button class="logout-btn" @click="logout">
          로그아웃
        </button>
      </footer>

    </aside>
  </div>
</template>