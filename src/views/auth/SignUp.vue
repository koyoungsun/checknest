<template>
    <div class="wrap-login min-h-screen bg-gray-50 flex flex-col justify-center px-6 auth-wrapper auth-signup-wrapper">
  
      <!-- 로고 -->
      <h1 class="text-center text-2xl font-bold mb-8 auth-logo">
        CHECK<strong>NEST</strong>
      </h1>
  
      <div class="bg-white p-6 rounded-xl shadow-sm border auth-card auth-signup-card">
  
        <!-- 닉네임 (선택) -->
        <label class="label auth-label auth-nickname-label">닉네임 (선택)</label>
        <input
          v-model="nickname"
          type="text"
          class="input auth-input auth-nickname-input"
          placeholder="닉네임을 입력하세요"
        />
        <p v-if="errors.nickname" class="text-red-500 text-xs mt-1">{{ errors.nickname }}</p>
  
        <!-- 이메일 -->
        <label class="label mt-4 auth-label auth-email-label">이메일 <span class="text-red-500">*</span></label>
        <input
          v-model="email"
          type="email"
          class="input auth-input auth-email-input"
          :class="{ 'border-red-500': errors.email }"
          placeholder="email@example.com"
        />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
  
        <!-- 비밀번호 -->
        <label class="label mt-4 auth-label auth-password-label">비밀번호 <span class="text-red-500">*</span></label>
        <input
          v-model="password"
          type="password"
          class="input auth-input auth-password-input"
          :class="{ 'border-red-500': errors.password }"
          placeholder="6자 이상 입력"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
  
        <!-- 비밀번호 확인 -->
        <label class="label mt-4 auth-label auth-password-confirm-label">비밀번호 확인 <span class="text-red-500">*</span></label>
        <input
          v-model="passwordConfirm"
          type="password"
          class="input auth-input auth-password-confirm-input"
          :class="{ 'border-red-500': errors.passwordConfirm }"
          placeholder="비밀번호를 다시 입력하세요"
        />
        <p v-if="errors.passwordConfirm" class="text-red-500 text-xs mt-1">{{ errors.passwordConfirm }}</p>
  
        <!-- 성별 선택 -->
        <label class="label mt-6 auth-label auth-gender-label">성별 (선택)</label>
        <select v-model="gender" class="input auth-input auth-gender-select">
          <option value="">선택 안 함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="none">기타 / 밝히고 싶지 않음</option>
        </select>
  
        <!-- 가입 버튼 -->
        <button 
          class="btn-primary w-full mt-6 auth-submit-btn auth-signup-submit-btn" 
          @click="signup"
          :disabled="isLoading"
        >
          {{ isLoading ? "가입 중..." : "회원가입" }}
        </button>
  
        <!-- 로그인 이동 -->
        <p class="text-center mt-4 text-sm text-gray-500 auth-login-link">
          이미 계정이 있나요?
          <router-link :to="`/login${route.query.redirect ? '?redirect=' + route.query.redirect : ''}`" class="text-blue-600 underline">
            로그인
          </router-link>
        </p>
  
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAuth } from "@/composables/useAuth";
  
  const router = useRouter();
  const route = useRoute();
  const { signUpWithEmail } = useAuth();
  
  const nickname = ref("");
  const email = ref("");
  const password = ref("");
  const passwordConfirm = ref("");
  const gender = ref("");
  const isLoading = ref(false);
  const errors = ref({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  
  // 클라이언트 사이드 검증
  const validateForm = (): boolean => {
    errors.value = {
      nickname: "",
      email: "",
      password: "",
      passwordConfirm: "",
    };

    let isValid = true;

    // 이메일 검증
    if (!email.value.trim()) {
      errors.value.email = "이메일을 입력해주세요.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      errors.value.email = "유효한 이메일 주소를 입력해주세요.";
      isValid = false;
    }

    // 비밀번호 검증
    if (!password.value) {
      errors.value.password = "비밀번호를 입력해주세요.";
      isValid = false;
    } else if (password.value.length < 6) {
      errors.value.password = "비밀번호는 6자 이상이어야 합니다.";
      isValid = false;
    }

    // 비밀번호 확인 검증
    if (!passwordConfirm.value) {
      errors.value.passwordConfirm = "비밀번호 확인을 입력해주세요.";
      isValid = false;
    } else if (password.value !== passwordConfirm.value) {
      errors.value.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      isValid = false;
    }

    return isValid;
  };
  
  // 회원가입 처리
  const signup = async () => {
    // 클라이언트 사이드 검증
    if (!validateForm()) {
      return;
    }

    isLoading.value = true;
    try {
      // displayName은 nickname이 있으면 사용, 없으면 undefined
      await signUpWithEmail(
        email.value.trim(),
        password.value,
        nickname.value.trim() || undefined
      );
  
      // 회원가입 성공 시 자동 로그인 상태이므로 홈으로 이동
      // redirect 쿼리가 있으면 그 경로로, 없으면 홈으로
      const redirect = route.query.redirect as string;
      router.push(redirect || "/");
    } catch (err: any) {
      // Firebase 에러 메시지 표시
      alert(err.message || "회원가입에 실패했습니다.");
      console.error("[SignUp] 회원가입 실패:", err);
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
    box-sizing:border-box;
  }
  .input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .btn-primary {
    background: #2563eb;
    color: #fff;
    padding: 12px 0;
    border-radius: 8px;
    font-weight: 600;
    width:100%; height:50px; margin:8px 0 16px;
    cursor: pointer;
  }
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  </style>