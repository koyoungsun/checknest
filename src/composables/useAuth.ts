import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

/**
 * 인증 상태 관리 Composable
 */
export const useAuth = () => {
  const router = useRouter();
  const currentUser = ref<User | null>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      loading.value = false;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  /**
   * 로그인 필요 시 리다이렉트
   */
  const requireAuth = () => {
    if (!currentUser.value) {
      router.push("/login");
      return false;
    }
    return true;
  };

  return {
    currentUser,
    loading,
    requireAuth,
  };
};

