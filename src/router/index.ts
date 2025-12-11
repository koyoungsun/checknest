import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const routes = [
  // ===========================
  // 🔐 AUTH
  // ===========================
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: {
      hideHeader: true,   // 헤더 숨김
      public: true,
      bottomNav: false,
    },
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/auth/SignUp.vue"),
    meta: {
      hideHeader: true,   // 헤더 숨김
      public: true,
      back: true,
      bottomNav: false,
    },
  },

  // ===========================
  // 🏠 HOME
  // ===========================
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "홈",
      subtitle: null,   // 2층 서브타이틀 없음
      back: false,
      menu: true,
      bottomNav: true,
      showSearch: true,
      showNotification: true,
    },
  },

  // ===========================
  // 📌 템플릿
  // ===========================
  {
    path: "/templates",
    name: "Templates",
    component: () => import("@/views/TemplatesList.vue"),
    meta: {
      title: "템플릿",
      subtitle: "템플릿 목록",
      back: true,
      menu: true,
      bottomNav: true,
    },
  },
  {
    path: "/templates/:id",
    name: "TemplateDetail",
    component: () => import("@/views/templates/TemplateDetailView.vue"),
    meta: {
      title: "템플릿 상세",
      subtitle: "템플릿 상세보기",
      back: true,
      menu: true,
      bottomNav: false,
    },
  },
  {
    path: "/templates/new",
    name: "TemplateCreate",
    component: () => import("@/views/templates/TemplateCreateView.vue"),
    meta: {
      title: "템플릿 생성",
      subtitle: "새 템플릿 만들기",
      back: true,
      menu: false,
      bottomNav: true,
    },
  },

  // ===========================
  // 📋 체크리스트
  // ===========================
  {
    path: "/lists",
    name: "Lists",
    component: () => import("@/views/Lists.vue"),
    meta: {
      title: "나의 체크리스트",
      subtitle: "내 체크리스트 목록",
      back: true,
      menu: true,
      bottomNav: true,
    },
  },
  {
    path: "/checklists/new",
    name: "ChecklistCreate",
    component: () => import("@/views/checklists/ChecklistCreateView.vue"),
    meta: {
      title: "체크리스트 생성",
      subtitle: "새 체크리스트 만들기",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },
  {
    path: "/checklists/:id",
    name: "ChecklistDetail",
    component: () => import("@/views/checklists/ChecklistDetailView.vue"),
    meta: {
      title: "체크리스트 상세",
      subtitle: "체크리스트 보기",
      back: true,
      menu: true,
      bottomNav: false,
      showSearch: false,
    },
  },

  // ===========================
  // 🔍 검색
  // ===========================
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/Search.vue"),
    meta: {
      title: "검색",
      subtitle: null,
      back: true,
      menu: false,
      bottomNav: false,
      showSearch: false,
      showNotification: false,
    },
  },

  // ===========================
  // 🔔 알림
  // ===========================
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/views/Notifications.vue"),
    meta: {
      title: "알림",
      subtitle: "알림 목록",
      back: true,
      menu: true,
      bottomNav: true,
      showSearch: true,
      showNotification: true,
    },
  },

  // ===========================
  // 👤 마이페이지
  // ===========================
  {
    path: "/my",
    name: "MyPage",
    component: () => import("@/views/Mypage.vue"),
    meta: {
      title: "마이페이지",
      subtitle: "내 정보",
      back: false,
      menu: true,
      bottomNav: true,
      showSearch: true,
      showNotification: true,
    },
  },

  // ===========================
  // 📄 약관
  // ===========================
  {
    path: "/terms",
    name: "Terms",
    component: () => import("@/views/Terms.vue"),
    meta: {
      public: true,
      title: "이용약관",
      subtitle: "이용약관",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/Privacy.vue"),
    meta: {
      public: true,
      title: "개인정보 처리방침",
      subtitle: "개인정보 처리방침",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },

  // ===========================
  // 📝 게시글 / 공유
  // ===========================
  {
    path: "/posts",
    name: "PostList",
    component: () => import("@/views/posts/PostListView.vue"),
    meta: {
      title: "게시글 / 공유",
      subtitle: "게시글 목록",
      back: false,
      menu: true,
      bottomNav: true,
      showSearch: true,
      showNotification: true,
    },
  },
  {
    path: "/posts/write",
    name: "PostWrite",
    component: () => import("@/views/posts/PostWriteView.vue"),
    meta: {
      title: "게시글 작성",
      subtitle: "새 게시글 작성",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },
  {
    path: "/posts/:id",
    name: "PostDetail",
    component: () => import("@/views/posts/PostDetailView.vue"),
    meta: {
      title: "게시글 상세",
      subtitle: "게시글 보기",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },

  // ===========================
  // 📢 공지사항
  // ===========================
  {
    path: "/notices",
    name: "Notices",
    component: () => import("@/views/Notices.vue"),
    meta: {
      title: "공지사항",
      subtitle: "공지사항 목록",
      back: true,
      menu: true,
      bottomNav: true,
    },
  },
  {
    path: "/notices/:id",
    name: "NoticeDetail",
    component: () => import("@/views/NoticeDetail.vue"),
    meta: {
      title: "공지사항 상세",
      subtitle: "공지사항 보기",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },
];

// ==================================
// 🔐 AUTH GUARD
// ==================================
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const auth = getAuth();

// 인증 상태가 준비될 때까지 기다리는 Promise
const waitForAuth = (): Promise<any> => {
  return new Promise((resolve) => {
    // 이미 인증 상태가 준비되어 있다면 즉시 반환
    if (auth.currentUser !== null) {
      resolve(auth.currentUser);
      return;
    }

    // 인증 상태가 준비될 때까지 대기
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // 한 번만 실행되도록 구독 해제
      resolve(user);
    });
  });
};

router.beforeEach(async (to, _from, next) => {
  // 공개 페이지는 바로 통과
  if (to.meta.public) {
    return next();
  }

  // 인증 상태가 준비될 때까지 대기
  const user = await waitForAuth();

  // 로그인 페이지로 가는 경우는 통과
  if (to.path === "/login") {
    return next();
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    return next("/login");
  }

  // 인증된 사용자는 요청한 페이지로 이동
  next();
});

export default router;