import { createRouter, createWebHistory } from "vue-router";

// 페이지들 import
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/templates",
    name: "Templates",
    component: () => import("@/views/TemplatesList.vue"),
  },
  {
    path: "/lists",
    name: "Lists",
    component: () => import("@/views/Lists.vue"),
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/views/Notifications.vue"),
  },
  {
    path: "/my",
    name: "MyPage",
    component: () => import("@/views/MyPage.vue"),
  },{
    path: "/checklists/new",
    name: "ChecklistCreate",
    component: () => import('@/views/checklists/ChecklistCreateView.vue'),
  },{
    path: "/checklists/:id",
    name: "ChecklistDetail",
    component: () => import("@/views/checklists/ChecklistDetailView.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;