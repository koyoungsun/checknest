<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
  
      <!-- 로고 -->
      <h1 class="text-center text-2xl font-bold mb-8">
        CHECK<strong>NEST</strong>
      </h1>
  
      <div class="bg-white p-6 rounded-xl shadow-sm border">
  
        <!-- 닉네임 -->
        <label class="block text-sm font-medium mb-1">닉네임</label>
        <input
          v-model="nickname"
          type="text"
          class="input"
          placeholder="닉네임을 입력하세요"
        />
  
        <!-- 이메일 -->
        <label class="block text-sm font-medium mt-4 mb-1">이메일</label>
        <input
          v-model="email"
          type="email"
          class="input"
          placeholder="email@example.com"
        />
  
        <!-- 비밀번호 -->
        <label class="block text-sm font-medium mt-4 mb-1">비밀번호</label>
        <input
          v-model="password"
          type="password"
          class="input"
          placeholder="8자 이상 입력"
        />
  
        <!-- 가입하기 -->
        <button class="btn-primary w-full mt-6" @click="signup">
          회원가입
        </button>
  
        <!-- 로그인 이동 -->
        <p class="text-center mt-4 text-sm text-gray-500">
          이미 계정이 있나요?
          <router-link to="/login" class="text-blue-600 underline">
            로그인
          </router-link>
        </p>
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  
  const nickname = ref("");
  const email = ref("");
  const password = ref("");
  
  // Firebase Auth + Firestore 프로필 생성 예정
  const signup = () => {
    if (!nickname.value || !email.value || !password.value) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
  
    if (password.value.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
  
    alert("회원가입 처리 예정 (Firebase Auth 연동)");
  };
  </script>
  
  <style scoped>
  .input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
  }
  .input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
    padding: 12px 0;
    border-radius: 8px;
    font-weight: 600;
  }
  </style>