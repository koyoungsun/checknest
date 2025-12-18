import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import { useAuth } from "@/composables/useAuth";

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
      back: true, // PageSubtitle의 이전 버튼 표시용
      menu: true,
      bottomNav: true,
      showSearch: true, // 헤더에 검색 버튼 표시
      showNotification: true,
      hideHeaderBack: true, // 헤더의 이전 버튼 숨김
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
      back: true, // PageSubtitle의 이전 버튼 표시용
      menu: true,
      bottomNav: true,
      showSearch: true, // 헤더에 검색 버튼 표시
      hideHeaderBack: true, // 헤더의 이전 버튼 숨김
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
      subtitle: "마이페이지",
      back: true,
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
      back: true, // PageSubtitle의 이전 버튼 표시용
      menu: true,
      bottomNav: true,
      showSearch: true, // 헤더에 검색 버튼 표시
      showNotification: true,
      hideHeaderBack: true, // 헤더의 이전 버튼 숨김
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

  // ===========================
  // 📋 게시판
  // ===========================
  {
    path: "/boards",
    name: "Boards",
    component: () => import("@/views/boards/BoardListView.vue"),
    meta: {
      title: "게시판",
      subtitle: "게시판 목록",
      back: true,
      menu: true,
      bottomNav: true,
      showSearch: true,
      hideHeaderBack: true,
    },
  },
  {
    path: "/boards/create",
    name: "BoardCreate",
    component: () => import("@/views/boards/BoardCreateView.vue"),
    meta: {
      title: "게시글 작성",
      subtitle: "새 게시글 작성",
      back: true,
      menu: false,
      bottomNav: false,
    },
  },
  {
    path: "/boards/:id",
    name: "BoardDetail",
    component: () => import("@/views/boards/BoardDetailView.vue"),
    meta: {
      title: "게시글 상세",
      subtitle: "게시글 보기",
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

router.beforeEach(async (to, from, next) => {
  // 공개 페이지는 바로 통과
  if (to.meta.public) {
    return next();
  }

  // useAuth composable 사용
  const { authReady, currentUser } = useAuth();

  // authReady가 false면 대기 (깜빡임/무한리다이렉트 방지)
  if (!authReady.value) {
    // authReady가 true가 될 때까지 Promise로 대기
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (authReady.value) {
          resolve();
        } else {
          // 100ms마다 확인
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트 (원래 경로 저장)
  if (!currentUser.value) {
    const redirect = to.fullPath !== "/login" ? to.fullPath : undefined;
    return next({
      path: "/login",
      query: redirect ? { redirect } : undefined,
    });
  }

  // 인증된 사용자는 요청한 페이지로 이동
  next();
});

export default router;