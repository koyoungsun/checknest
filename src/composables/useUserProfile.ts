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
   * 본인 프로필은 isPublicProfile 값과 관계없이 항상 조회 가능합니다.
   */
  const loadProfile = async (): Promise<void> => {
    if (!currentUser.value) return;

    loading.value = true;
    try {
      // 본인 프로필 조회 (currentUserId 전달하여 항상 조회 가능)
      let userProfile = await getUserProfile(currentUser.value.uid, currentUser.value.uid);

      if (!userProfile) {
        // 프로필이 없으면 공개 프로필로 생성
        await createUserProfile(currentUser.value, true);
        userProfile = await getUserProfile(currentUser.value.uid, currentUser.value.uid);
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
   * 공개 프로필 필드(displayName, photoURL, isPublicProfile)만 업데이트 가능합니다.
   */
  const updateProfile = async (updates: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'isPublicProfile'>>): Promise<void> => {
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

