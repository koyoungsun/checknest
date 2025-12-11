<template>
  <div v-if="subtitle" class="page-subtitle">
    <button
      v-if="showBack"
      class="back-btn"
      @click="goBack"
    >
      <i class="bi bi-arrow-left"></i>
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 50px; /* 헤더 높이만큼 아래로 */
  z-index: 9; /* 헤더(z-index: 10)보다 낮게 */
  min-height: 48px;
  width: 100%;
  box-sizing: border-box;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-primary, #ff6b35);
  font-size: 18px;
  padding: 0;
}

.back-btn:hover {
  opacity: 0.7;
}

.subtitle-text {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  flex: 1;
  letter-spacing: -2px;
}

.subtitle-text.has-back-btn {
  text-indent: 50px; /* 이전 버튼이 있을 때 통일된 들여쓰기 */
}
</style>

