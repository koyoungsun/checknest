<template>
  <div class="not-found-wrapper">
    <div class="not-found-content">
      <!-- 404 아이콘/이미지 -->
      <div class="not-found-icon">
        <i class="bi bi-exclamation-triangle"></i>
      </div>

      <!-- 404 메시지 -->
      <h1 class="not-found-title">404</h1>
      
      <!-- 안내 문구 -->
      <p class="not-found-message">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <p class="not-found-submessage">
        페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
      </p>

      <!-- 홈으로 이동 버튼 -->
      <button @click="goHome" class="not-found-button">
        홈으로 이동
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<style scoped lang="scss">
.not-found-wrapper {
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  padding:24px; background-color:#f5f5f5;
}

.not-found-content {
  text-align:center; max-width:400px; width:100%;
}

.not-found-icon {
  font-size:80px; color:#666; margin-bottom:24px;
}

.not-found-title {
  font-size:72px; font-weight:700; color:#000; margin:0 0 16px 0;
  letter-spacing:-2px;
}

.not-found-message {
  font-size:18px; font-weight:600; color:#333; margin:0 0 8px 0;
  letter-spacing:-0.5px;
}

.not-found-submessage {
  font-size:14px; color:#666; margin:0 0 32px 0; line-height:1.6;
}

.not-found-button {
  padding:12px 32px; background-color:#000; color:#fff;
  border:none; border-radius:8px; font-size:16px; font-weight:600;
  cursor:pointer; transition:background-color 0.2s ease;
  letter-spacing:-0.5px;
}

.not-found-button:hover {
  background-color:#333;
}

.not-found-button:active {
  background-color:#000;
}
</style>




