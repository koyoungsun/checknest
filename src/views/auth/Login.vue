<template>
    <div class="wrap-login bg-gray-50 flex flex-col justify-center px-6">
      <!-- 로고 -->
      <h1 class="login-logo">CHECK<strong>NEST</strong></h1>
      <p class="top-comment">함께 체크하고 대화하고
        <br />준비를 동와주는 <strong>공유형 체크리스트</strong> 체크네스트
    </p>
      <!-- 로그인 카드 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border text-center space-y-6">
        <!-- 이메일 로그인 영역 -->
        <div class="space-y-3 input-area">
          <input v-model="email" type="email" placeholder="Insert E-mail" class="input" />
          <input v-model="password" type="password" placeholder="Insert Password" class="input" />
          <!-- 아이디 저장 -->
          <label class="email-btn flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" v-model="rememberEmail" />이메일 기억하기
          </label>
  
          <button class="primary-btn" @click="emailLogin">
            Email Login
          </button>
        </div>
  
        <div class="text-gray-400 text-sm">또는</div>
  
        <!-- 구글 로그인 버튼 -->
        <button class="google-btn" @click="loginWithGoogle">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="icon" />
          <span>Google로 계속하기</span>
        </button>
      </div>
  
      <!-- 회원가입 이동 -->
      <p class="sign-btn text-center mt-6 text-sm text-gray-500">
        아직 계정이 없나요?
        <router-link to="/signup" class="text-blue-600 underline">
          회원가입
        </router-link>
      </p>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { auth, googleProvider, db } from "@/firebase/firebase";
  import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  
  const router = useRouter();
  
  // Email Login
  const email = ref("");
  const password = ref("");
  const rememberEmail = ref(false);
  
  import { getSavedEmail, saveEmail, removeSavedEmail } from "@/utils/storageUtils";
  
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
    try {
      const result = await signInWithEmailAndPassword(auth, email.value, password.value);
      const user = result.user;
  
      console.log("이메일 로그인 성공:", user.uid);
  
      // 이메일 저장 체크
      if (rememberEmail.value) {
        saveEmail(email.value);
      } else {
        removeSavedEmail();
      }
  
      router.push("/");
    } catch (err: any) {
      alert("로그인 실패: " + err.message);
      console.error(err);
    }
  };
  
  // 구글 로그인
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      console.log("구글 로그인 성공:", user.uid);
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        router.push("/signup/add-info");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("구글 로그인 실패:", err);
    }
  };
  </script>
  
  <style scoped>
  .min-h-screen{padding:50px 16px;}
  .input {
    width: 100%;
    border: 1px solid #d1d5db;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    box-sizing:border-box;
  }
  
  .primary-btn {
    width: 100%;
    background: #2563eb;
    color: #fff;
    padding: 12px 0;
    border-radius: 10px;
    font-weight: 600;
  }
  
  .google-btn {
    width: 100%;
    background: #fff;
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