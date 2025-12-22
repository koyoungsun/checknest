<template>
  <div v-if="subtitle" class="page-subtitle">
    <button
      v-if="showBack"
      class="back-btn"
      @click="goBack"
      aria-label="이전 페이지로 이동"
    >
      <span aria-hidden="true">&lt;</span>
    </button>
    <h2 class="subtitle-text" :class="{ 'has-back-btn': showBack }">{{ subtitle }}</h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const subtitle = computed(() => {
  const sub = route.meta.subtitle;
  if (typeof sub === 'string' && sub.trim()) {
    return sub;
  }
  return null;
});

const showBack = computed(() => route.meta.back === true);

const goBack = () => router.back();
</script>

<style scoped>
.page-subtitle {
  display:flex; align-items:center; gap:0; padding:6px 10px;
  background:#FFE8D1; border-bottom:1px solid #e5e7eb;
  position:sticky; top:0; z-index:9; min-height:48px;
  width:100%; box-sizing:border-box; margin:0;
}

/* 서브타이틀 다음 요소가 겹치지 않도록 처리 */
/* 서브타이틀 높이: padding 12px * 2 + min-height 48px = 약 72px */
/* sticky이므로 본문이 서브타이틀 아래에 자연스럽게 위치하도록 함 */
/* 하지만 겹침을 방지하기 위해 서브타이틀 다음 요소에 최소 여백 보장 */
.page-subtitle + section, .page-subtitle + main,
.page-subtitle + div > section:first-child, .page-subtitle + div > div:first-child {
  position:relative; z-index:1;
}

.back-btn {
  display:flex; align-items:center; justify-content:center;
  width:32px; height:32px; border:none; background:transparent;
  cursor:pointer; color:#8b3a1a; font-size:18px; padding:0;
}

.back-btn:hover {
  opacity:0.7;
}

.subtitle-text {
  font-size:16px; font-weight:700; color:#8b3a1a;
  margin:0; flex:1; letter-spacing:-1px;
}

.subtitle-text.has-back-btn {
  /* text-indent 제거됨 */
}
</style>

