<template>
  <section class="px-4 pt-6 pb-2 bg-gray-50 border-b">
    <div class="search-box">
      <label :for="inputId" class="sr-only">{{ label }}</label>
      <div class="search-box-wrapper">
        <input
          :id="inputId"
          type="text"
          :value="modelValue"
          :placeholder="placeholder"
          :aria-label="label"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          @keydown.enter="handleSearch"
          class="search-input"
          :style="`padding-right: ${modelValue.trim() ? '90px' : '50px'};`"
        />
        <button
          v-if="modelValue.trim()"
          type="button"
          @click="clearInput"
          aria-label="검색어 지우기"
          class="search-clear-btn"
        >
          <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          @click="handleSearch"
          aria-label="검색"
          class="search-submit-btn"
        >
          <i class="bi bi-search" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: string;
  placeholder?: string;
  label?: string;
  inputId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "검색어를 입력하세요",
  label: "검색",
  inputId: "search-input",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  search: [];
}>();

const handleSearch = () => {
  emit("search");
  document.getElementById(props.inputId)?.focus();
};

const clearInput = () => {
  emit("update:modelValue", "");
};
</script>

<style scoped>
.search-box {
  padding:24px 16px 8px; width:100%; box-sizing:border-box;
}

.search-box-wrapper {
  background:linear-gradient(to bottom right, #000000, #1A1A1A, #333333);
  padding:3px; border-radius:16px; width:100%; display:block; position:relative;
}

.search-input {
  width:100%; height:50px; font-size:14px; font-weight:700 !important;
  font-family:'Spoqa Han Sans Neo', sans-serif; color:#333 !important;
  border-radius:13px; background:#fff !important; border:none;
  box-sizing:border-box; outline:none; padding-left:16px;
}

.search-input::placeholder {
  color:#666666 !important; opacity:1 !important;
}

.search-input::-webkit-input-placeholder {
  color:#666666 !important; opacity:1 !important;
}

.search-input::-moz-placeholder {
  color:#666666 !important; opacity:1 !important;
}

.search-input:-ms-input-placeholder {
  color:#666666 !important; opacity:1 !important;
}

.search-input::-ms-input-placeholder {
  color:#666666 !important; opacity:1 !important;
}

.search-clear-btn, .search-submit-btn {
  position:absolute; top:50%; transform:translateY(-50%); z-index:10;
  background:transparent; border:none; cursor:pointer; padding:0;
  display:flex; align-items:center; justify-content:center;
}

.search-clear-btn {
  right:50px; color:#999; font-size:18px;
}

.search-submit-btn {
  right:16px; color:#666666; font-size:18px;
}
</style>






