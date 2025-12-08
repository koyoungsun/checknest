<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
  
      <!-- 로고 -->
      <h1 class="text-center text-2xl font-bold mb-10">
        CHECK<strong>NEST</strong>
      </h1>
  
      <!-- 로그인 카드 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border text-center">
  
        <!-- 안내 문구 -->
        <p class="text-sm text-gray-500 mb-6">
          아래 버튼을 눌러 간편하게 로그인하세요.
        </p>
  
        <!-- 구글 로그인 버튼 -->
        <button class="google-btn" @click="googleLogin">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="icon" />
          <span>Google로 계속하기</span>
        </button>
  
        <!-- 또는 문구 -->
        <div class="text-xs text-gray-400 mt-4">
          * 실제 로그인은 아직 연결되지 않은 가상 기능입니다.
        </div>
      </div>
  
      <!-- 회원가입 링크 (필요 없으면 제거 가능) -->
      <p class="text-center mt-6 text-sm text-gray-500">
        계정이 없나요? 
        <router-link to="/signup" class="text-blue-600 underline">
          회원가입
        </router-link>
      </p>
    </div>
  </template>
  
  <script setup lang="ts">
  const googleLogin = () => {
    alert("Google OAuth 로그인 처리 예정 (가상 로직)");
    
    // 나중에 Firebase Auth 연동 시:
    // const provider = new GoogleAuthProvider();
    // signInWithPopup(auth, provider);
  
    // 지금은 로그인 성공한 것처럼 메인으로 이동하는 가상 코드
    // router.push("/");
  };
  </script>
  
  <style scoped>
  .google-btn {
    width: 100%;
    background: white;
    border: 1px solid #d1d5db;
    padding: 12px 0;
    border-radius: 10px;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  
  .google-btn:hover {
    background: #f9fafb;
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
  </style>