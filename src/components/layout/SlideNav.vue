<script setup lang="ts">
const props = defineProps({
  open: { type: Boolean, required: true }
});
const emit = defineEmits(["close"]);

// 닫기
const close = () => emit("close");

// TODO: Firestore 연동 예정
const nickname = "Aiden";
</script>

<template>
  <div>

    <!-- dim overlay -->
    <div
      v-if="open"
      class="dimd"
      @click="close"
    ></div>

    <!-- RIGHT SLIDE NAV -->
    <aside class="slide-nav" :class="{ 'slide-nav--open': open }">

      <!-- Close button -->
      <div class="top-bar">
        <button class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Profile -->
      <div class="profile-box">
        <div class="avatar"></div>
        <div class="nickname">{{ nickname }}</div>

        <router-link to="/my" class="mypage-link" @click="close">
          마이페이지
        </router-link>
      </div>

      <!-- Menu List -->
      <nav class="menu-list">

        <router-link to="/lists" class="menu-item" @click="close">
          나의 체크리스트
        </router-link>

        <router-link to="/templates" class="menu-item" @click="close">
          템플릿
        </router-link>

        <router-link to="/search" class="menu-item" @click="close">
          검색
        </router-link>

        <router-link to="/notices" class="menu-item" @click="close">
          공지사항
        </router-link>

        <router-link to="/posts" class="menu-item" @click="close">
          게시글·공유
        </router-link>

      </nav>

      <!-- FOOTER (LinkNest 스타일) -->
      <footer class="footer-simple">
        <router-link to="/terms" class="footer-link" @click="close">
          이용약관
        </router-link>

        <router-link to="/privacy" class="footer-link" @click="close">
          개인정보 처리방침
        </router-link>

        <span class="footer-version">CheckNest v1.0.0</span>

        <button class="logout-btn" @click="close">
          로그아웃
        </button>
      </footer>
    </aside>

  </div>
</template>

<style scoped>

/* Dim background */
.dimd {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 49;
}

/* Slide panel */
.slide-nav {
  position: fixed;
  top: 0;
  right: -100%;
  width: 75vw;
  max-width: 300px;
  height: 100%;
  background: white;
  border-left: 1px solid #e5e5e5;
  box-shadow: -4px 0 12px rgba(0,0,0,0.12);
  transition: right 0.28s ease;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 18px;
}

.slide-nav--open {
  right: 0;
}

/* Top close button */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.close-btn {
  font-size: 1.2rem;
  padding: 6px;
}

/* Profile */
.profile-box {
  text-align: center;
  margin-bottom: 24px;
}

.avatar {
  width: 58px;
  height: 58px;
  background: #e0e0e0;
  border-radius: 50%;
  margin: 0 auto;
}

.nickname {
  margin-top: 10px;
  font-weight: 600;
}

.mypage-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #0d6efd;
}

/* Menu List */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: auto;
}

.menu-item {
  font-size: 0.95rem;
  padding: 10px 4px;
  border-bottom: 1px solid #f0f0f0;
}

/* ---- Footer (LinkNest style) ---- */
.footer-simple {
  margin-top: 20px;
  text-align: center;
  font-size: 0.75rem;
  color: #777;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 12px;
}

.footer-link {
  color: #666;
}

.footer-version {
  margin-top: 2px;
  color: #aaa;
}

.logout-btn {
  margin-top: 10px;
  color: #e60023;
  font-size: 0.85rem;
}
</style>