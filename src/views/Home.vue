<template>
    <div class="flex flex-col min-h-screen bg-gray-50 main-wrap">
      <!-- ================= MAIN CONTENT ================= -->
      <main class="flex-1 pb-24 px-4">
        <!-- -------- 정렬 옵션 -------- -->
        <div class="flex justify-end my-4 hidden">
          <button @click="openSort" class="px-3 py-1 bg-white border rounded-lg shadow-sm text-sm">정렬 ▾</button>
        </div>
        <!-- -------- 스와이프 체크리스트 -------- -->
        <!-- -------- 내 체크리스트 -------- -->
        <section class="mb-6 overflow-x-hidden my-check">
        <h2 class="section-title">내 체크리스트
          <a href="">더보기</a>
        </h2>
        <Swiper :slides-per-view="2.3" :space-between="8" :slides-offset-before="16" :slides-offset-after="16" class="pb-2">
          <SwiperSlide>
            <router-link to="/checklist/mytodo" class="check-card">
              <h3>MyTodo</h3>
              <p>개인용 기본 체크리스트</p>
            </router-link>
          </SwiperSlide>

          <SwiperSlide>
            <router-link to="/checklists/1" class="check-card">
              <h3>여행 준비</h3>
              <p>진행률 60%</p>
            </router-link>
          </SwiperSlide>

          <SwiperSlide>
            <router-link to="/checklists/2" class="check-card">
              <h3>쇼핑 리스트</h3>
              <p>진행률 20%</p>
            </router-link>
          </SwiperSlide>

          <SwiperSlide>
            <button class="check-card border-dashed flex flex-col items-center justify-center">
              <i class="bi bi-plus text-3xl text-gray-500 mb-1"></i>
              <span class="text-sm text-gray-600">새 체크리스트</span>
            </button>
          </SwiperSlide>
        </Swiper>
        </section>
        <!-- 배너존 #1 -->
        <div v-if="banner1"
              class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border">
          <img :src="banner1?.image" class="w-full object-cover" />
        </div>
        <!-- -------- 최근 템플릿 -------- -->
        <section class="mb-6 recent-template">
          <h2 class="font-semibold text-gray-700 mb-2">최근 템플릿
            <router-link to="/templates" class="block text-right mt-2 text-sm text-blue-600">템플릿 더 보기 ▸</router-link>

          </h2>
  
          <div class="bg-white rounded-xl shadow-sm border divide-y">
  
            <router-link to="/templates/1" class="block p-3 hover:bg-gray-50">
              <div class="font-semibold">여행 준비 템플릿</div>
              <div class="text-xs text-gray-500">여행 · 2025.12.02</div>
            </router-link>
  
            <router-link to="/templates/2" class="block p-3 hover:bg-gray-50">
              <div class="font-semibold">명절 준비</div>
              <div class="text-xs text-gray-500">집안일 · 2025.11.30</div>
            </router-link>
  
            <router-link to="/templates/3" class="block p-3 hover:bg-gray-50">
              <div class="font-semibold">쇼핑 리스트</div>
              <div class="text-xs text-gray-500">생활 · 2025.11.29</div>
            </router-link>
  
          </div>
  
          <!-- 배너존 #2 -->
          <div v-if="banner2"
               class="mt-3 bg-white rounded-xl overflow-hidden shadow-sm border">
            <img :src="banner2?.image" class="w-full object-cover" />
          </div>
  
          
        </section>
        <!-- -------- 최근 게시글 -------- -->
        <section class="mb-10">
          <div class="recent-board">
            <h2 class="font-semibold text-gray-700 mb-2">최근 게시글
              <router-link to="/posts" class="block text-right mt-2 text-sm text-blue-600">
              게시글 더 보기 ▸
            </router-link>
            </h2>
    
            <div class="bg-white rounded-xl shadow-sm border divide-y">
              <router-link to="/posts/1" class="block p-3 hover:bg-gray-50">
                <div class="font-semibold">속초 여행 체크리스트 공유</div>
                <div class="text-xs text-gray-500">여행 · 2025.12.03</div>
              </router-link>
    
              <router-link to="/posts/2" class="block p-3 hover:bg-gray-50">
                <div class="font-semibold">명절 준비 체크 포인트</div>
                <div class="text-xs text-gray-500">집안일 · 2025.11.30</div>
              </router-link>
    
              <router-link to="/posts/3" class="block p-3 hover:bg-gray-50">
                <div class="font-semibold">가성비 캠핑 준비 리스트</div>
                <div class="text-xs text-gray-500">취미 · 2025.11.29</div>
              </router-link>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  <script setup lang="ts">
    import { Swiper, SwiperSlide } from "swiper/vue";
    import "swiper/css";
    import { ref } from "vue";

    interface Banner {
      image: string;
    }

    const banner1 = ref<Banner | null>(null);
    const banner2 = ref<Banner | null>(null);

    const openSort = () => {
        console.log("open sort bottom sheet");
    };
  </script>
  <style>
  </style>