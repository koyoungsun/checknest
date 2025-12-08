import { createRouter, createWebHistory } from "vue-router";

// 페이지들 import
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },{
    path: "/templates",
    name: "Templates",
    component: () => import("@/views/TemplatesList.vue"),
    meta: {
      title: "템플릿",
      back: true,
      showSearch: true,
      menu: true,
      bottomNav: true,
      showNotification: true
    }
  },{
    path: "/templates/:id",
    name: "TemplateDetail",
    component: () => import("@/views/templates/TemplateDetailView.vue"),
    meta: {
      title: "템플릿 상세",
      back: true,
      showSearch: true,
      menu: true,
      bottomNav: true,
      showNotification: true
    },
  },{
    path: "/lists",
    name: "Lists",
    component: () => import("@/views/Lists.vue"),
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/views/Notifications.vue"),
    meta: {
      title: "알림",
      back: true,        // ← 이전 버튼 보이기
      showSearch: true, // ← 헤더 검색 버튼 숨기기
      menu: true,       // ← 메뉴 버튼 숨기기
      bottomNav: true,  // ← 검색 페이지는 바텀 네비 숨기기 권장
      showNotification: true
    }
  },
  {
    path: "/my",
    name: "MyPage",
    component: () => import("@/views/MyPage.vue"),
    meta: {
      title: "My Page",
      back: true,
      showSearch: true,
      menu: true,
      bottomNav: true,
      showNotification: true
    },
  },{
    path: "/checklists/new",
    name: "ChecklistCreate",
    component: () => import('@/views/checklists/ChecklistCreateView.vue'),
  },{
    path: "/checklists/:id",
    name: "ChecklistDetail",
    component: () => import("@/views/checklists/ChecklistDetailView.vue"),
  },{
    path: "/search",
    name: "Search",
    component: () => import("@/views/Search.vue"),
    meta: {
      title: "검색",
      back: true,        // ← 이전 버튼 보이기
      showSearch: false, // ← 헤더 검색 버튼 숨기기
      menu: false,       // ← 메뉴 버튼 숨기기
      bottomNav: false,  // ← 검색 페이지는 바텀 네비 숨기기 권장
      showNotification: true
    }
  },{
    path: "/terms",
    name: "Terms",
    component: () => import("../views/Terms.vue"),
    meta: {
      title: "이용약관",
      back: true,        // ← 이전 버튼 보이기
      showSearch: true, // ← 헤더 검색 버튼 숨기기
      menu: true,       // ← 메뉴 버튼 숨기기
      bottomNav: false,  // ← 검색 페이지는 바텀 네비 숨기기 권장
      showNotification: true
    }
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("../views/Privacy.vue"),
    meta: {
      title: "개인정보 처리방침",
      back: true,        // ← 이전 버튼 보이기
      showSearch: true, // ← 헤더 검색 버튼 숨기기
      menu: true,       // ← 메뉴 버튼 숨기기
      bottomNav: false,  // ← 검색 페이지는 바텀 네비 숨기기 권장
      showNotification: true
    }
  },{
    path: "/posts",
    name: "PostList",
    component: () => import("@/views/posts/PostListView.vue"),
    meta: {
      title: "게시글 / 공유",
      back: false,
      showSearch: true,
      menu: true,
      bottomNav: true,
      showNotification: true
    },
  },
  {
    path: "/posts/:id",
    name: "PostDetail",
    component: () => import("@/views/posts/PostDetailView.vue"),
    meta: {
      title: "게시글 상세",
      back: true,
      showSearch: false,
      menu: false,
      bottomNav: false,
      showNotification: true
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;