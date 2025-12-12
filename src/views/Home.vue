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
        <section class="mb-6 overflow-x-hidden my-check home-swipe-section">
        <h2 class="section-title">내 체크리스트
          <a href="" class="more-link">더보기 <i class="bi bi-chevron-right"></i></a>
        </h2>
        <Swiper 
          :slides-per-view="2.3" 
          :space-between="8" 
          :slides-offset-before="16" 
          :slides-offset-after="16" 
          class="pb-2"
          @slideChange="onSlideChange"
        >
          <SwiperSlide>
            <router-link to="/checklist/mytodo" class="check-card">
              <h3>MyTodo</h3>
              <p>개인용 기본 체크리스트</p>
            </router-link>
          </SwiperSlide>

          <SwiperSlide>
            <router-link to="/checklists/1" class="check-card">
              <div style="position: relative; width: 100%; height: 100%;">
                <h3>여행 준비</h3>
                <p>개인용 기본 체크리스트</p>
                <!-- 진행률 퍼센트 (우측 하단 고정) -->
                <span style="position: absolute; bottom: 10px; right: 10px; white-space: nowrap; display: flex; align-items: baseline; color: #4b5563; gap: 4px;">
                  <span style="font-size: 34px; font-weight: 700;">{{ getDisplayProgress('home-1') }}</span>
                  <span v-if="getDisplayProgress('home-1') !== '-'" style="font-size: 20px; font-weight: 500;">%</span>
                </span>
              </div>
            </router-link>
          </SwiperSlide>

          <SwiperSlide>
            <router-link to="/checklists/2" class="check-card">
              <div style="position: relative; width: 100%; height: 100%;">
                <h3>쇼핑 리스트</h3>
                <p>개인용 기본 체크리스트</p>
                <!-- 진행률 퍼센트 (우측 하단 고정) -->
                <span style="position: absolute; bottom: 10px; right: 10px; white-space: nowrap; display: flex; align-items: baseline; color: #4b5563; gap: 4px;">
                  <span style="font-size: 34px; font-weight: 700;">{{ getDisplayProgress('home-2') }}</span>
                  <span v-if="getDisplayProgress('home-2') !== '-'" style="font-size: 20px; font-weight: 500;">%</span>
                </span>
              </div>
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
          <h2 class="section-title">최근 템플릿
            <router-link to="/templates" class="more-link">더보기<i class="bi bi-chevron-right"></i></router-link>
          </h2>
  
          <div class="bg-white rounded-xl shadow-sm border divide-y">
  
            <router-link to="/templates/1" class="block hover:bg-gray-50 flex items-center justify-between">
              <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">여행</strong>
                <span>여행 준비 템플릿</span>
                <em v-if="isNew('2025.12.02')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
              </div>
              <div class="text-xs text-gray-500">
                2025.12.02
              </div>
            </router-link>
  
            <router-link to="/templates/2" class="block hover:bg-gray-50 flex items-center justify-between">
              <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">집안일</strong>
                <span>명절 준비</span>
                <em v-if="isNew('2025.11.30')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
              </div>
              <div class="text-xs text-gray-500">
                2025.11.30
              </div>
            </router-link>
  
            <router-link to="/templates/3" class="block hover:bg-gray-50 flex items-center justify-between">
              <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">생활</strong>
                <span>쇼핑 리스트</span>
                <em v-if="isNew('2025.11.29')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
              </div>
              <div class="text-xs text-gray-500">
                2025.11.29
              </div>
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
            <h2 class="section-title">최근 게시글
              <router-link to="/posts" class="more-link">더보기<i class="bi bi-chevron-right"></i></router-link>
            </h2>
    
            <div class="bg-white rounded-xl shadow-sm border divide-y">
              <router-link to="/posts/1" class="block hover:bg-gray-50 flex items-center justify-between">
                <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                  <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">여행</strong>
                  <span>속초 여행 체크리스트 공유</span>
                  <em v-if="isNew('2025.12.03')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
                </div>
                <div class="text-xs text-gray-500">
                  2025.12.03
                </div>
              </router-link>
    
              <router-link to="/posts/2" class="block hover:bg-gray-50 flex items-center justify-between">
                <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                  <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">집안일</strong>
                  <span>명절 준비 체크 포인트</span>
                  <em v-if="isNew('2025.11.30')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
                </div>
                <div class="text-xs text-gray-500">
                  2025.11.30
                </div>
              </router-link>
    
              <router-link to="/posts/3" class="block hover:bg-gray-50 flex items-center justify-between">
                <div class="font-semibold flex items-center gap-1" style="font-size: 15px; display: flex; align-items: center; gap: 4px;">
                  <strong style="font-weight: 400; font-size: 12px; background-color: #f90; padding: 2px 4px; border-radius: 2px; color: #fff;">취미</strong>
                  <span>가성비 캠핑 준비 리스트</span>
                  <em v-if="isNew('2025.11.29')" style="font-style: normal; color: var(--color-primary, #ff6b35); font-size: 11px; font-weight: 600; flex-shrink: 0; margin-left: 4px;">new</em>
                </div>
                <div class="text-xs text-gray-500">
                  2025.11.29
                </div>
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
    import { ref, onMounted } from "vue";

    interface Banner {
      image: string;
    }

    const banner1 = ref<Banner | null>(null);
    const banner2 = ref<Banner | null>(null);

    const openSort = () => {
        console.log("open sort bottom sheet");
    };

    // 진행률 애니메이션
    const animatedProgress = ref<Record<string, number>>({});
    const animationStarted = ref<Record<string, boolean>>({});

    // 홈 체크리스트 데이터
    const homeChecklists = [
      { id: 'home-1', progress: 60, slideIndex: 1 },
      { id: 'home-2', progress: 20, slideIndex: 2 },
    ];

    // 표시할 진행률 가져오기 (애니메이션 전에는 "-" 표시)
    const getDisplayProgress = (id: string) => {
      if (animatedProgress.value[id] !== undefined) {
        return animatedProgress.value[id];
      }
      return '-';
    };

    // 슬롯머신 애니메이션 시작 (특정 ID에 대해)
    const startProgressAnimation = (id: string) => {
      // 이미 애니메이션이 시작된 경우 중복 실행 방지
      if (animationStarted.value[id]) return;
      animationStarted.value[id] = true;

      const item = homeChecklists.find(item => item.id === id);
      if (!item) return;

      const targetProgress = item.progress;
      const duration = 1500; // 1.5초
      const startTime = Date.now();
      const startProgress = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easing 함수 (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentProgress = Math.floor(startProgress + (targetProgress - startProgress) * easeOut);
        
        animatedProgress.value[id] = currentProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          animatedProgress.value[id] = targetProgress;
        }
      };

      requestAnimationFrame(animate);
    };

    // Swiper 슬라이드 변경 이벤트 핸들러
    const onSlideChange = (swiper: any) => {
      const activeIndex = swiper.activeIndex;
      
      // 활성화된 슬라이드에 해당하는 체크리스트 찾기
      const activeItem = homeChecklists.find(item => item.slideIndex === activeIndex);
      if (activeItem) {
        startProgressAnimation(activeItem.id);
      }
    };

    // 컴포넌트 마운트 시 첫 번째 슬라이드가 활성화되어 있으면 애니메이션 시작
    onMounted(() => {
      // 첫 번째 슬라이드(인덱스 1)가 활성화되어 있을 수 있으므로 확인
      setTimeout(() => {
        // 첫 번째 체크리스트 슬라이드가 보이는 경우를 위해
        // 실제로는 Swiper의 초기 activeIndex를 확인해야 하지만,
        // 사용자가 스와이프할 때만 애니메이션이 시작되도록 하기 위해
        // onMounted에서는 시작하지 않음
      }, 100);
    });

    // 3일 이내인지 확인 (날짜 문자열 형식: "2025.12.02")
    const isNew = (dateString: string) => {
      if (!dateString) return false;
      const [year, month, day] = dateString.split('.').map(Number);
      const created = new Date(year, month - 1, day);
      const now = new Date();
      const diffTime = now.getTime() - created.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    };
  </script>
  <style>
  </style>