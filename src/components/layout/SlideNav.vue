<script setup lang="ts">
  const props = defineProps({
    open: { type: Boolean, required: true }
  });
  const emit = defineEmits(["close"]);

  // 닫기
  const close = () => emit("close");

  // TODO: Firestore에서 실제 닉네임 불러오는 로직으로 변경 예정
  const nickname = "Aiden";
</script>

<template>
  <div>
    <!-- 오버레이 -->
    <div v-if="open" class="dimd" @click="close"></div>
    <!-- 사이드 메뉴 -->
    <aside class="slide-nav" :class="{ 'slide-nav--open': open }">
      <!-- 🔹 상단: 닫기 버튼 -->
      <div class="top-bar">
        <button class="close-btn" @click="close"><i class="bi bi-x-lg"></i></button>
      </div>

      <!-- 🔹 사용자 정보 -->
      <div class="profile-box">
        <div class="avatar"></div>
        <div class="nickname">{{ nickname }}</div>
        <router-link to="/my" class="mypage-link" @click="close">마이페이지</router-link>
      </div>

      <!-- 🔹 메뉴 목록 -->
      <nav class="menu-list">
        <router-link to="/checklists" class="menu-item" @click="close">나의 체크리스트</router-link>
        <router-link to="/templates" class="menu-item" @click="close">템플릿</router-link>
        <router-link to="/messages" class="menu-item" @click="close">메시지</router-link>
        <router-link to="/notifications" class="menu-item" @click="close">알림센터</router-link>
        <router-link to="/notices" class="menu-item" @click="close">공지사항</router-link>
        <router-link to="/posts" class="menu-item" @click="close">게시글/공유</router-link>
      </nav>

      <!-- 🔹 하단 메뉴 -->
      <div class="footer-menu">
        <router-link to="/settings" class="menu-item" @click="close">설정</router-link>
        <router-link to="/terms" class="menu-item" @click="close">약관</router-link>
        <button class="menu-item w-full text-left" @click="close">로그아웃</button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
</style>