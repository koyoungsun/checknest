import { ref } from "vue";
import { useAuth } from "./useAuth";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  uploadProfileImage,
  type UserProfile,
} from "@/services/userService";

/**
 * 사용자 프로필 관리 Composable
 */
export const useUserProfile = () => {
  const { currentUser, requireAuth } = useAuth();

  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const uploading = ref(false);

  /**
   * 프로필 로드
   */
  const loadProfile = async (): Promise<void> => {
    if (!currentUser.value) return;

    loading.value = true;
    try {
      let userProfile = await getUserProfile(currentUser.value.uid);

      if (!userProfile) {
        // 프로필이 없으면 생성
        await createUserProfile(currentUser.value);
        userProfile = await getUserProfile(currentUser.value.uid);
      }

      profile.value = userProfile;
    } catch (error) {
      console.error("프로필 로드 실패:", error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 프로필 업데이트
   */
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser.value || !requireAuth()) return;

    try {
      await updateUserProfile(currentUser.value.uid, updates);
      if (profile.value) {
        profile.value = { ...profile.value, ...updates };
      }
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      throw error;
    }
  };

  /**
   * 프로필 이미지 업로드
   */
  const uploadImage = async (file: File): Promise<string> => {
    if (!currentUser.value || !requireAuth()) {
      throw new Error("로그인이 필요합니다");
    }

    uploading.value = true;
    try {
      const url = await uploadProfileImage(currentUser.value.uid, file);
      await updateProfile({ photoURL: url });
      return url;
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw error;
    } finally {
      uploading.value = false;
    }
  };

  return {
    profile,
    loading,
    uploading,
    loadProfile,
    updateProfile,
    uploadImage,
  };
};

