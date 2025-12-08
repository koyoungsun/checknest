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
    <button class="btn-fab" @click="$emit('toggle')">
      <strong>만들기</strong>
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
    .fab-enter-from, .fab-leave-to {opacity: 0; transform: translateY(10px);}
    .fab-enter-active, .fab-leave-active {transition: all 0.15s ease-out;}
    .btn-fab{position:fixed; bottom:90px; right:10px; width:60px; height: 60px; border-radius:50%; border:0;}
    .btn-fab strong{text-align:left; font-size:12px; letter-spacing:-1px; width:60px; display:block; bottom:90px; right:10px; position:fixed; height:60px; line-height:60px; text-align:center;}
    .open-btn{position:fixed; bottom:60px; right:74px; z-index:10; text-align:right;
        
    }
    .open-btn li{margin:2px 0;}
    .open-btn li button{font-size:12px; padding:3px 8px; background-color: #2272ed; border:0; border-radius:8px;}
</style>