<template>
  <!-- 오버레이 -->
  <transition name="fade-dimd">
    <div
      v-if="open"
      class="dimd fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="close"
    ></div>
  </transition>

  <!-- 모달 -->
  <transition name="fade">
    <div
      v-if="open"
      class="login-modal fixed inset-0 flex items-center justify-center z-50"
      @click.stop="close"
    >
      <div
        class="login-modal-content bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center max-w-sm w-full mx-4"
        @click.stop
      >
        <!-- 헤더: 타이틀과 닫기 버튼 -->
        <div class="flex items-center justify-between w-full mb-4">
          <h2 class="text-lg font-semibold text-gray-900">로그인이 필요합니다</h2>
          <button
            class="text-gray-400 hover:text-gray-600 text-xl"
            @click="close"
            aria-label="닫기"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>

        <!-- 안내 문구 -->
        <div class="w-full mb-6 text-center">
          <p class="text-sm text-gray-600 leading-relaxed">
            체크리스트, 템플릿, 게시판은<br />
            로그인 후 사용할 수 있습니다.
          </p>
        </div>

        <!-- 버튼 영역 -->
        <div class="w-full flex flex-col gap-3">
          <button
            @click="handleLogin"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            로그인
          </button>
          <button
            @click="handleSignup"
            class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  login: [];
  signup: [];
}>();

const router = useRouter();

const close = () => {
  emit("close");
};

const handleLogin = () => {
  emit("login");
  close();
  router.push("/login");
};

const handleSignup = () => {
  emit("signup");
  close();
  router.push("/signup");
};
</script>

<style scoped>
.fade-dimd-enter-active,
.fade-dimd-leave-active {
  transition: opacity 0.3s ease;
}

.fade-dimd-enter-from,
.fade-dimd-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>

