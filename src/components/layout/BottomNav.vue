<template>
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <i class="bi bi-house"></i>
        <span>홈</span>
      </router-link>
  
      <router-link to="/templates" class="nav-item">
        <i class="bi bi-collection"></i>
        <span>템플릿</span>
      </router-link>
  
      <router-link to="/lists" class="nav-item">
        <i class="bi bi-card-checklist"></i>
        <span>리스트</span>
      </router-link>
  
      <router-link to="/notifications" class="nav-item">
        <i class="bi bi-bell"></i>
        <span>알림</span>
      </router-link>
    </nav>
  </template>
  
  <script setup lang="ts">
  </script>
  
  <style scoped></style>