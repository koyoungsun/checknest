<template>
    <div class="page">
      <h1>Checklist Detail</h1>
      <p>ID: {{ id }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from "vue-router";
  
  const route = useRoute();
  const id = route.params.id;
  </script>
  
  <style scoped>
  .page { padding: 20px; }
  </style>