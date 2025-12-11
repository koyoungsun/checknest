
<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <PageSubtitle />
  
      <!-- 상단 헤더 -->
      <header class="flex items-center px-4 h-14 border-b bg-white">
        <button @click="router.back()" class="mr-3 text-xl">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="text-base font-semibold truncate">
          {{ template?.title || "템플릿 상세" }}
        </h1>
      </header>
  
      <!-- 상세 내용 -->
      <main class="flex-1 overflow-y-auto detail-content space-y-6">
  
        <!-- 템플릿 설명 -->
        <section class="bg-white p-4 rounded-xl border shadow-sm">
          <h2 class="text-sm font-semibold mb-1">템플릿 소개</h2>
          <p class="text-xs text-gray-600 leading-relaxed">
            {{ template?.description || "이 템플릿은 여러 상황에서 유용하게 활용할 수 있습니다." }}
          </p>
  
          <p class="text-[11px] text-gray-400 mt-2">
            항목 {{ template?.items.length }}개 · 사용 {{ template?.used }}회
          </p>
        </section>
  
        <!-- 템플릿 항목 리스트 -->
        <section class="bg-white p-4 rounded-xl border shadow-sm">
          <h2 class="text-sm font-semibold mb-3">포함된 체크 항목</h2>
  
          <ul class="space-y-2">
            <li
              v-for="(item, index) in template?.items"
              :key="index"
              class="flex items-center gap-2 text-sm text-gray-700"
            >
              <i class="bi bi-check-square text-gray-400"></i>
              {{ item }}
            </li>
          </ul>
        </section>
  
        <!-- 템플릿 사용 버튼 -->
        <section class="pb-6">
          <button
            @click="createChecklist"
            class="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            이 템플릿으로 체크리스트 만들기
          </button>
        </section>
  
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
  const route = useRoute();
  const router = useRouter();
  
  const template = ref(null);
  
  // 더미 데이터 (나중에 Firestore로 교체)
  const dummyTemplates = [
    {
      id: "tpl1",
      title: "여행 준비 템플릿",
      description: "여행 전에 필요한 필수 준비물을 모아둔 템플릿입니다.",
      items: ["여권 확인", "짐싸기", "보조배터리", "세면도구", "의약품", "카메라"],
      used: 82,
    },
    {
      id: "tpl2",
      title: "장보기 기본 템플릿",
      description: "일상 장보기에 필요한 품목들을 담았습니다.",
      items: ["계란", "우유", "빵", "야채", "고기", "과일"],
      used: 154,
    },
  ];
  
  onMounted(() => {
    const id = route.params.id;
    template.value = dummyTemplates.find((t) => t.id === id);
  });
  
  // 클릭 시 체크리스트 생성 페이지로 이동 (추후 구현)
  const createChecklist = () => {
    alert("템플릿 기반 체크리스트 생성 예정!");
  };
  </script>
  
  <style scoped>
  </style>