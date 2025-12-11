<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <PageSubtitle />
  
      <!-- 상단 헤더 -->
      <header class="flex items-center px-4 h-14 border-b bg-white">
        <button @click="router.back()" class="mr-3 text-xl">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="text-base font-semibold truncate">게시글</h1>
      </header>
  
      <!-- 로딩 상태 -->
      <div
        v-if="!post"
        class="flex-1 flex items-center justify-center text-gray-400"
      >
        불러오는 중...
      </div>
  
      <!-- 게시글 내용 -->
      <main v-else class="flex-1 overflow-y-auto detail-content space-y-6">
  
        <!-- 게시글 카드 -->
        <section class="bg-white rounded-xl p-4 shadow-sm border">
          
          <!-- 작성자 정보 -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <p class="text-sm font-semibold">{{ post.author }}</p>
              <p class="text-xs text-gray-400">{{ formatRelativeTime(post.createdAt) }}</p>
            </div>
          </div>
  
          <!-- 제목 -->
          <h2 class="text-base font-semibold mb-2">{{ post.title }}</h2>
  
          <!-- 본문 -->
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {{ post.content }}
          </p>
  
          <!-- 이미지 -->
          <div v-if="post.image" class="mt-4">
            <img
              :src="post.image"
              alt="post image"
              class="rounded-lg border w-full object-cover"
            />
          </div>
  
          <!-- 좋아요 / 댓글 수 -->
          <div class="flex items-center gap-6 mt-4 text-gray-500 text-sm">
            <div class="flex items-center gap-1 cursor-pointer" @click="toggleLike">
              <i :class="post.liked ? 'bi bi-heart-fill text-red-500' : 'bi bi-heart'"></i>
              <span>{{ post.likes }}</span>
            </div>
  
            <div class="flex items-center gap-1">
              <i class="bi bi-chat"></i>
              <span>{{ post.comments.length }}</span>
            </div>
          </div>
        </section>
  
        <!-- 댓글 목록 -->
        <section class="space-y-4">
  
          <h3 class="text-sm font-semibold text-gray-700">댓글</h3>
  
          <div v-if="post.comments.length === 0" class="text-gray-400 text-sm">
            아직 댓글이 없습니다.
          </div>
  
          <div
            v-for="c in post.comments"
            :key="c.id"
            class="bg-white p-3 rounded-xl border shadow-sm"
          >
            <p class="text-sm font-semibold">{{ c.author }}</p>
            <p class="text-xs text-gray-400 mb-2">{{ formatRelativeTime(c.createdAt) }}</p>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ c.text }}</p>
          </div>
  
        </section>
  
        <!-- 댓글 입력 -->
        <section class="mt-4 pb-16">
          <div class="flex items-center bg-white p-3 rounded-xl border shadow-sm">
            <input
              v-model="newComment"
              type="text"
              placeholder="댓글을 입력하세요"
              class="flex-1 text-sm outline-none"
            />
            <button
              @click="addComment"
              class="ml-2 text-blue-600 text-sm font-semibold"
            >
              등록
            </button>
          </div>
        </section>
  
      </main>
  
    </div>
  </template>
  
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatRelativeTime } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
  
  const router = useRouter();
  const route = useRoute();
  
  interface Post {
    id: string;
    author: string;
    title: string;
    content: string;
    image: string;
    createdAt: number;
    likes: number;
    liked: boolean;
    comments: Array<{
      id: string;
      author: string;
      text: string;
      createdAt: number;
    }>;
  }
  
  // -------------------------
  // 더미 게시글 데이터 (Firestore 연결 전)
  // -------------------------
  const dummyPosts: Post[] = [
    {
      id: "p1",
      author: "Aiden",
      title: "캠핑갈 때 꼭 필요한 체크리스트 공유!",
      content: "이번에 캠핑 다녀오면서 정리한 리스트입니다.\n참고해서 사용하세요!",
      image: "https://placehold.co/600x400",
      createdAt: Date.now() - 1000 * 60 * 10,
      likes: 12,
      liked: false,
      comments: [
        {
          id: "c1",
          author: "Kate",
          text: "와 너무 유용하네요!",
          createdAt: Date.now() - 1000 * 60 * 5,
        },
      ],
    },
  ];
  
  const post = ref<Post | null>(null);
  const newComment = ref("");
  
  // -------------------------
  // 게시글 로드
  // -------------------------
  onMounted(() => {
    const id = route.params.id as string;
    post.value = dummyPosts.find((p) => p.id === id) || null;
  });
  
  // -------------------------
  // 좋아요 토글
  // -------------------------
  const toggleLike = () => {
    if (!post.value) return;
  
    post.value.liked = !post.value.liked;
    post.value.likes += post.value.liked ? 1 : -1;
  };
  
  // -------------------------
  // 댓글 추가
  // -------------------------
  const addComment = () => {
    if (!newComment.value.trim() || !post.value) return;
  
    post.value.comments.push({
      id: "c" + Date.now(),
      author: "Aiden",
      text: newComment.value,
      createdAt: Date.now(),
    });
  
    newComment.value = "";
  };
  </script>
  
  <style scoped>
  </style>