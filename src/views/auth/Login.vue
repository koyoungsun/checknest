<template>
    <div class="wrap-login bg-gray-50 flex flex-col justify-center px-6 auth-wrapper auth-login-wrapper">
      <!-- 로고 -->
      <h1 class="login-logo auth-logo">CHECK<strong>NEST</strong></h1>
      <p class="top-comment auth-description">함께 체크하고 대화하고
        <br />준비를 동와주는 <strong>공유형 체크리스트</strong> 체크네스트
    </p>
      <!-- 로그인 카드 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border text-center space-y-6 auth-card auth-login-card">
        <!-- 이메일 로그인 영역 -->
        <div class="space-y-3 input-area auth-login-form">
          <input v-model="email" type="email" placeholder="Insert E-mail" class="input auth-input auth-email-input" />
          <input v-model="password" type="password" placeholder="Insert Password" class="input auth-input auth-password-input" />
          <!-- 아이디 저장 -->
          <label class="email-btn flex items-center gap-2 text-sm text-gray-600 auth-remember">
            <input type="checkbox" v-model="rememberEmail" />이메일 기억하기
          </label>
  
          <button 
            class="primary-btn auth-submit-btn auth-login-submit-btn" 
            @click="emailLogin"
            :disabled="isLoading"
          >
            {{ isLoading ? "로그인 중..." : "로그인" }}
          </button>

          <!-- 비밀번호 재설정 링크 -->
          <button
            @click="handlePasswordReset"
            :disabled="isResettingPassword"
            class="text-xs text-blue-600 hover:text-blue-700 mt-2 auth-password-reset-btn"
            style="background: none; border: none; cursor: pointer; padding: 0;"
          >
            {{ isResettingPassword ? "발송 중..." : "비밀번호 재설정" }}
          </button>
        </div>
  
        <div class="text-gray-400 text-sm auth-divider">또는</div>
  
        <!-- 구글 로그인 버튼 -->
        <button 
          class="google-btn auth-google-btn" 
          @click="loginWithGoogle"
          :disabled="isLoading"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="icon" />
          <span>Google로 계속하기</span>
        </button>
      </div>
  
      <!-- 회원가입 이동 -->
      <p class="sign-btn text-center mt-6 text-sm text-gray-500 auth-signup-link">
        아직 계정이 없나요?
        <router-link :to="`/signup${route.query.redirect ? '?redirect=' + route.query.redirect : ''}`" class="text-blue-600 underline">
          회원가입
        </router-link>
      </p>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAuth } from "@/composables/useAuth";
  import { getSavedEmail, saveEmail, removeSavedEmail } from "@/utils/storageUtils";
  
  const router = useRouter();
  const route = useRoute();
  const { signInWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  
  // Email Login
  const email = ref("");
  const password = ref("");
  const rememberEmail = ref(false);
  const isLoading = ref(false);
  const isResettingPassword = ref(false);
  
  // 저장된 이메일 불러오기
  onMounted(() => {
    const saved = getSavedEmail();
    if (saved) {
      email.value = saved;
      rememberEmail.value = true;
    }
  });
  
  // 이메일 로그인
  const emailLogin = async () => {
    if (!email.value.trim() || !password.value.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    isLoading.value = true;
    try {
      await signInWithEmail(email.value.trim(), password.value);
  
      // 이메일 저장 체크
      if (rememberEmail.value) {
        saveEmail(email.value);
      } else {
        removeSavedEmail();
      }
  
      // redirect 쿼리가 있으면 그 경로로, 없으면 홈으로
      const redirect = route.query.redirect as string;
      router.push(redirect || "/");
    } catch (err: any) {
      alert(err.message || "로그인에 실패했습니다.");
      console.error("[Login] 로그인 실패:", err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // 구글 로그인
  const loginWithGoogle = async () => {
    isLoading.value = true;
    try {
      await signInWithGoogle();
      
      // redirect 쿼리가 있으면 그 경로로, 없으면 홈으로
      const redirect = route.query.redirect as string;
      router.push(redirect || "/");
    } catch (err: any) {
      alert(err.message || "구글 로그인에 실패했습니다.");
      console.error("[Login] 구글 로그인 실패:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 비밀번호 재설정
  const handlePasswordReset = async () => {
    if (!email.value.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    isResettingPassword.value = true;
    try {
      await sendPasswordReset(email.value.trim());
      alert("비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.");
    } catch (err: any) {
      alert(err.message || "비밀번호 재설정 이메일 발송에 실패했습니다.");
      console.error("[Login] 비밀번호 재설정 실패:", err);
    } finally {
      isResettingPassword.value = false;
    }
  };
  </script>
  
  <style scoped>
  .min-h-screen{padding:50px 16px;}
  .input {
    width:100%; border:none; border-bottom:1px solid #999;
    padding:10px 12px; border-radius:0; font-size:14px; box-sizing:border-box;
  }
  
  .primary-btn {
    width:100%; background:#2563eb; color:#fff;
    padding:12px 0; border-radius:10px; font-weight:600; cursor:pointer;
  }
  .primary-btn:disabled {
    opacity:0.6; cursor:not-allowed;
  }
  
  .google-btn {
    width:100%; background:#fff; border:1px solid #d1d5db;
    padding:12px 0; border-radius:10px; font-weight:600;
    display:flex; justify-content:center; align-items:center; gap:10px; cursor:pointer;
  }
  .google-btn:hover:not(:disabled) {
    background:#f9fafb;
  }
  .google-btn:disabled {
    opacity:0.6; cursor:not-allowed;
  }
  .icon {
    width:20px; height:20px;
  }
  </style>