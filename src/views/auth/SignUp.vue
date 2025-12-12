<template>
    <div class="wrap-login min-h-screen bg-gray-50 flex flex-col justify-center px-6">
  
      <!-- 로고 -->
      <h1 class="text-center text-2xl font-bold mb-8">
        CHECK<strong>NEST</strong>
      </h1>
  
      <div class="bg-white p-6 rounded-xl shadow-sm border">
  
        <!-- 닉네임 -->
        <label class="label">닉네임</label>
        <input
          v-model="nickname"
          type="text"
          class="input"
          placeholder="닉네임을 입력하세요"
        />
  
        <!-- 이메일 -->
        <label class="label mt-4">이메일</label>
        <input
          v-model="email"
          type="email"
          class="input"
          placeholder="email@example.com"
        />
  
        <!-- 비밀번호 -->
        <label class="label mt-4">비밀번호</label>
        <input
          v-model="password"
          type="password"
          class="input"
          placeholder="8자 이상 입력"
        />
  
        <!-- 성별 선택 -->
        <label class="label mt-6">성별 (선택)</label>
        <select v-model="gender" class="input">
          <option value="">선택 안 함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="none">기타 / 밝히고 싶지 않음</option>
        </select>
  
        <!-- 가입 버튼 -->
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
  const gender = ref("");
  
  // Firebase Auth + Firestore 프로필 생성 예정
  const signup = () => {
    if (!nickname.value || !email.value || !password.value) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
  
    if (password.value.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
  
    console.log("회원가입 데이터:", {
      nickname: nickname.value,
      email: email.value,
      gender: gender.value || null,
    });
  
    alert("회원가입 처리 예정 (Firebase Auth + Firestore 연동)");
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
  }
  </style>