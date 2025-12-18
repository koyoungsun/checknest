import type { User } from "firebase/auth";
import { getUserProfile } from "./userService";

export interface UserProfileData {
  nickname: string; // 하위 호환성을 위해 nickname 유지 (내부적으로 displayName 사용)
  email: string; // Firebase Auth에서 가져옴
  photoURL: string;
}

/**
 * 사용자 프로필 데이터 조회 (간단 버전)
 * 본인 프로필은 isPublicProfile 값과 관계없이 항상 조회 가능합니다.
 * 
 * @param user - Firebase Auth User 객체
 * @returns 사용자 프로필 데이터
 */
export const getUserProfileData = async (user: User): Promise<UserProfileData> => {
  try {
    // 본인 프로필 조회 (currentUserId 전달하여 항상 조회 가능)
    const profile = await getUserProfile(user.uid, user.uid);

    if (profile) {
      return {
        nickname: profile.displayName || "사용자",
        email: user.email || "", // Firebase Auth에서 가져옴
        photoURL: profile.photoURL || user.photoURL || "",
      };
    }

    // 프로필이 없는 경우 Firebase Auth 정보 사용
    return {
      nickname: user.displayName || "사용자",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
  } catch (error: any) {
    // 권한 오류는 발생하지 않아야 하지만, 발생 시 Firebase Auth 정보 사용 (fallback)
    if (error?.code === 'permission-denied') {
      console.warn("[userProfileService] 프로필 조회 권한 오류 (본인 프로필이므로 발생하지 않아야 함):", user.uid);
    } else {
      // 네트워크 오류 등 예외적인 경우에만 에러 로그
      console.error("[userProfileService] 프로필 데이터 조회 실패:", error);
    }
    // 오류 발생 시 Firebase Auth 정보 사용 (fallback)
    return {
      nickname: user.displayName || "사용자",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
  }
};







