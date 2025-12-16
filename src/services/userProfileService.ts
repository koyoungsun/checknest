import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

export interface UserProfileData {
  nickname: string;
  email: string;
  photoURL: string;
}

/**
 * 사용자 프로필 데이터 조회 (간단 버전)
 */
export const getUserProfileData = async (user: User): Promise<UserProfileData> => {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        nickname: data.nickname || "사용자",
        email: user.email || "",
        photoURL: data.photoURL || user.photoURL || "",
      };
    }

    return {
      nickname: user.displayName || "사용자",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
  } catch (error) {
    console.error("프로필 데이터 조회 실패:", error);
    return {
      nickname: user.displayName || "사용자",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
  }
};







