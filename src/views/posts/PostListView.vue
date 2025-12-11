<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <PageSubtitle />

    <!-- 검색 영역 -->
    <section class="px-4 py-3 bg-white border-b">
      <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <i class="bi bi-search text-gray-500 mr-2"></i>
        <input
          type="text"
          v-model="search"
          placeholder="게시글 검색"
          class="bg-transparent w-full outline-none text-sm"
        />
      </div>
    </section>

    <!-- 게시글 리스트 -->
    <main class="flex-1 overflow-y-auto content-wrapper">
      <div v-if="filteredPosts.length > 0" class="space-y-0">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          @click="goDetail(post.id)"
          class="list-card list-item"
        >
          <!-- 작성자 정보 -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="bi bi-person-fill text-gray-600"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ post.author }}</p>
              <p class="text-xs text-gray-400 flex items-center gap-1">
                <i class="bi bi-clock text-[10px]"></i>
                {{ formatRelativeTime(post.createdAt) }}
              </p>
            </div>
          </div>

          <!-- 제목 -->
          <h2 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {{ post.title }}
          </h2>

          <!-- 본문 미리보기 -->
          <p class="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
            {{ post.content }}
          </p>

          <!-- 이미지 미리보기 -->
          <div v-if="post.image" class="mb-3">
            <img
              :src="post.image"
              alt="post image"
              class="rounded-lg border w-full h-40 object-cover"
              style="max-width: 100%;"
            />
          </div>

          <!-- 좋아요 / 댓글 수 -->
          <div class="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <i :class="post.liked ? 'bi bi-heart-fill text-red-500' : 'bi bi-heart'"></i>
              <span>{{ post.likes }}</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="bi bi-chat"></i>
              <span>{{ post.comments.length }}</span>
            </div>
            <div class="ml-auto flex items-center gap-1">
              <i class="bi bi-chevron-right text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 게시글 없을 때 -->
      <div v-else class="empty-state mt-20">
        <i class="bi bi-inbox"></i>
        <p>등록된 게시글이 없습니다.</p>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { formatRelativeTime } from "@/utils/dateUtils";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();

// 검색
const search = ref("");

// 더미 게시글 데이터 (Firestore 연결 전)
const posts = ref([
  {
    id: "p1",
    author: "Aiden",
    title: "캠핑갈 때 꼭 필요한 체크리스트 공유!",
    content: "이번에 캠핑 다녀오면서 정리한 리스트입니다. 참고해서 사용하세요!",
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
  {
    id: "p2",
    author: "Kate",
    title: "속초 여행 체크리스트 공유",
    content: "속초 여행을 다녀오면서 만든 체크리스트를 공유합니다.",
    image: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    likes: 8,
    liked: true,
    comments: [],
  },
  {
    id: "p3",
    author: "John",
    title: "명절 준비 체크 포인트",
    content: "명절 준비할 때 놓치기 쉬운 것들을 정리했습니다.",
    image: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    likes: 15,
    liked: false,
    comments: [
      {
        id: "c2",
        author: "Aiden",
        text: "정말 도움되네요!",
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],
  },
]);

// 필터링 처리
const filteredPosts = computed(() => {
  if (!search.value.trim()) {
    return posts.value;
  }
  return posts.value.filter((post) =>
    post.title.toLowerCase().includes(search.value.toLowerCase()) ||
    post.content.toLowerCase().includes(search.value.toLowerCase())
  );
});

// 상세 이동
const goDetail = (id: string) => {
  router.push(`/posts/${id}`);
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.list-card img {
  max-width: 100%;
}
</style>
