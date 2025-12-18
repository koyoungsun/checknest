import { db, storage } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { User } from "firebase/auth";

/**
 * 공개 사용자 프로필 인터페이스
 * users 컬렉션에는 공개 프로필 정보만 저장됩니다.
 * isPublicProfile === true인 경우에만 다른 사용자가 조회할 수 있습니다.
 */
export interface UserProfile {
  displayName: string; // 공개 표시 이름
  photoURL?: string; // 프로필 이미지 URL (선택)
  isPublicProfile: boolean; // 공개 프로필 여부 (true인 경우에만 다른 사용자가 조회 가능)
  createdAt: any; // 생성일 (Timestamp)
  updatedAt?: any; // 수정일 (Timestamp, 선택)
}

/**
 * 내부 사용자 프로필 인터페이스 (향후 확장용)
 * 민감한 정보는 별도 컬렉션이나 암호화하여 관리해야 합니다.
 */
export interface PrivateUserProfile {
  email?: string;
  bio?: string;
  myMembers?: Array<{ id: string; name: string }>;
  blockedMembers?: Array<{ id: string; name: string }>;
}

export interface SimpleMember {
  id: string;
  name: string;
}

/**
 * 공개 사용자 프로필 조회
 * isPublicProfile === true인 경우에만 조회 가능합니다.
 * 본인 프로필은 isPublicProfile 값과 관계없이 항상 조회 가능합니다.
 * 
 * @param uid - 사용자 ID
 * @param currentUserId - 현재 로그인한 사용자 ID (선택, 본인 프로필 조회 시 필요)
 * @returns 공개 프로필 정보 또는 null (문서가 없거나 공개되지 않은 경우)
 */
export const getUserProfile = async (
  uid: string,
  currentUserId?: string
): Promise<UserProfile | null> => {
  // userId 검증: undefined, null, 빈 문자열 체크
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.warn("[userService] getUserProfile: 유효하지 않은 userId:", uid);
    return null;
  }

  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      
      // 본인 프로필이거나 공개 프로필인 경우만 반환
      const isOwnProfile = currentUserId && currentUserId === uid;
      const isPublic = data.isPublicProfile === true;
      
      if (!isOwnProfile && !isPublic) {
        // 공개되지 않은 프로필은 null 반환 (권한 오류가 아님)
        return null;
      }
      
      return {
        displayName: data.displayName || data.nickname || "사용자", // 하위 호환성: nickname도 지원
        photoURL: data.photoURL || undefined,
        isPublicProfile: data.isPublicProfile === true,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    }
    return null;
  } catch (error: any) {
    // 권한 오류 처리 (isPublicProfile === false인 경우 발생 가능)
    if (error?.code === 'permission-denied') {
      // 권한 오류는 공개되지 않은 프로필이거나 구조적 문제일 수 있음
      // UI가 깨지지 않도록 null 반환 (fallback 처리)
      console.warn("[userService] getUserProfile: 권한 오류 (프로필이 비공개일 수 있음):", uid);
      return null;
    }
    // 네트워크 오류 등 기타 에러는 throw
    console.error("[userService] getUserProfile: 프로필 조회 실패:", error);
    throw error;
  }
};

/**
 * 공개 사용자 프로필 생성
 * users 컬렉션에는 공개 프로필 정보만 저장합니다.
 * 기본적으로 isPublicProfile === true로 설정되어 공개 프로필로 생성됩니다.
 * 
 * @param user - Firebase Auth User 객체
 * @param isPublic - 공개 프로필 여부 (기본값: true)
 */
export const createUserProfile = async (
  user: User,
  isPublic: boolean = true
): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid);
    
    // 기존 문서가 있는지 확인 (중복 생성 방지)
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      console.log("[userService] createUserProfile: 프로필이 이미 존재합니다:", user.uid);
      return;
    }
    
    // 공개 프로필 저장 (isPublicProfile 필드 필수)
    await setDoc(userRef, {
      displayName: user.displayName || "사용자",
      photoURL: user.photoURL || null,
      isPublicProfile: isPublic,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log("[userService] createUserProfile: 프로필 생성 완료:", user.uid, `(isPublic: ${isPublic})`);
  } catch (error: any) {
    console.error("[userService] createUserProfile: 프로필 생성 실패:", error);
    // 권한 오류는 구조적 문제이므로 throw
    if (error?.code === 'permission-denied') {
      throw new Error("프로필 생성 권한이 없습니다. Firestore rules를 확인하세요.");
    }
    throw error;
  }
};

/**
 * 공개 사용자 프로필 업데이트
 * 공개 프로필 필드(displayName, photoURL, isPublicProfile)만 업데이트 가능합니다.
 * 
 * @param uid - 사용자 ID
 * @param updates - 업데이트할 공개 프로필 필드
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'isPublicProfile'>>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    
    // 공개 프로필 필드만 업데이트
    const publicUpdates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    
    if (updates.displayName !== undefined) {
      publicUpdates.displayName = updates.displayName;
    }
    if (updates.photoURL !== undefined) {
      publicUpdates.photoURL = updates.photoURL || null;
    }
    if (updates.isPublicProfile !== undefined) {
      publicUpdates.isPublicProfile = updates.isPublicProfile === true;
    }
    
    if (Object.keys(publicUpdates).length === 1) {
      // updatedAt만 있는 경우 (실제 업데이트할 필드 없음)
      console.warn("[userService] updateUserProfile: 업데이트할 필드가 없습니다.");
      return;
    }
    
    await updateDoc(userRef, publicUpdates);
    console.log("[userService] updateUserProfile: 프로필 업데이트 완료:", uid);
  } catch (error: any) {
    console.error("[userService] updateUserProfile: 프로필 업데이트 실패:", error);
    // 권한 오류는 구조적 문제이므로 throw
    if (error?.code === 'permission-denied') {
      throw new Error("프로필 업데이트 권한이 없습니다. 본인의 프로필만 수정할 수 있습니다.");
    }
    throw error;
  }
};

/**
 * 프로필 이미지 업로드
 */
export const uploadProfileImage = async (
  uid: string,
  file: File
): Promise<string> => {
  try {
    const path = `users/${uid}/profile.jpg`;
    const refInStorage = storageRef(storage, path);
    await uploadBytes(refInStorage, file);
    const url = await getDownloadURL(refInStorage);
    return url;
  } catch (error) {
    console.error("프로필 이미지 업로드 실패:", error);
    throw error;
  }
};

/**
 * 사용자 삭제
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("사용자 삭제 실패:", error);
    throw error;
  }
};







