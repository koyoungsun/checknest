<template>
  <div class="fixed bottom-6 right-6 z-50">

    <!-- 오버레이 -->
    <div
      v-if="open"
      class="fixed inset-0 bg-black/20 z-40"
      @click="$emit('close')"
    ></div>

    <!-- 펼쳐지는 메뉴 -->
    <transition-group name="fab" tag="div" class="open-btn">
      <ol>
        <li><button v-if="open" key="check" @click="go('/checklists/new')" class="fab-item"> 체크리스트 만들기</button></li>
        <li><button v-if="open" key="template" @click="go('/templates/new')" class="fab-item">템플릿 만들기</button></li>
        <li><button v-if="open" key="board" @click="go('/posts/new')" class="fab-item">게시판 글쓰기</button></li>
    </ol>
    </transition-group>

    <!-- FAB 버튼 -->
    <button class="btn-fab text-3xl relative z-50" @click="$emit('toggle')">
      <i class="bi bi-plus-lg transition-transform duration-200" :class="open ? 'rotate-45' : ''" ></i>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["toggle", "close"]);

const router = useRouter();

const go = (path) => {
  emit("close"); // FAB 닫기
  router.push(path); // 이동
};
</script>

<style scoped>
    .fab-item {@apply bg-white shadow-lg px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200;}
    .fab-enter-from, .fab-leave-to {opacity: 0; transform: translateY(10px);}
    .fab-enter-active, .fab-leave-active {transition: all 0.15s ease-out;}
    .btn-fab{position:fixed; bottom:100px; right:10px; width:100px; height:100px; border-radius:50%;}
    .open-btn{position:fixed; bottom:100px; right:130px; z-index:10; text-align:right;
        li{margin:2px 0;}
    }
</style>