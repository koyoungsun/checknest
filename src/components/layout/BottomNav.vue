<template>
  <nav class="bottom-nav">

    <!-- 홈 -->
    <router-link to="/" class="nav-item">
      <i class="bi bi-house"></i>
      <span>홈</span>
    </router-link>

    <!-- 리스트 -->
    <router-link to="/lists" class="nav-item">
      <i class="bi bi-card-checklist"></i>
      <span>리스트</span>
    </router-link>

    <!-- + 액션 버튼 (바텀시트 오픈) -->
    <button class="nav-item action-btn" @click="$emit('open-sheet')">
      <i class="bi bi-plus-circle"></i>
      <span>추가</span>
    </button>

    <!-- 템플릿 -->
    <router-link to="/templates" class="nav-item">
      <i class="bi bi-collection"></i>
      <span>템플릿</span>
    </router-link>

    <!-- 마이 -->
    <router-link to="/my" class="nav-item">
      <i class="bi bi-person"></i>
      <span>마이</span>
    </router-link>

  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 40;
}

.nav-item {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #444;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 2px;
}

/* FAB 액션 버튼 강조 */
.action-btn {
  color: #2563eb;
  background: none;
  border: none;
}

.action-btn i {
  font-size: 26px;
  margin-bottom: 0px;
}
</style>