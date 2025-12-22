<template>
  <Transition name="fade">
    <div v-if="isLoading" class="global-loading">
      <div class="global-loading__spinner">
        <div class="spinner"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useGlobalLoading } from "@/composables/useGlobalLoading";

const { isLoading } = useGlobalLoading();
</script>

<style scoped lang="scss">
.global-loading {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0, 0, 0, 0.3);
  z-index:9999;
  display:flex; align-items:center; justify-content:center;
}

.global-loading__spinner {
  display:flex; align-items:center; justify-content:center;
}

.spinner {
  width:48px; height:48px;
  border:4px solid rgba(255, 255, 255, 0.3);
  border-top-color:#000;
  border-radius:50%;
  animation:spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform:rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition:opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity:0;
}
</style>




