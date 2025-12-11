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

export interface UserProfile {
  nickname: string;
  email: string;
  bio: string;
  photoURL: string;
  myMembers: Array<{ id: string; name: string }>;
  blockedMembers: Array<{ id: string; name: string }>;
}

export interface SimpleMember {
  id: string;
  name: string;
}

/**
 * 사용자 프로필 조회
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        nickname: data.nickname || "사용자",
        email: data.email || "",
        bio: data.bio || "",
        photoURL: data.photoURL || "",
        myMembers: data.myMembers || [],
        blockedMembers: data.blockedMembers || [],
      };
    }
    return null;
  } catch (error) {
    console.error("사용자 프로필 조회 실패:", error);
    throw error;
  }
};

/**
 * 사용자 프로필 생성
 */
export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      nickname: user.displayName || "사용자",
      email: user.email || "",
      bio: "",
      photoURL: user.photoURL || "",
      myMembers: [],
      blockedMembers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("사용자 프로필 생성 실패:", error);
    throw error;
  }
};

/**
 * 사용자 프로필 업데이트
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("사용자 프로필 업데이트 실패:", error);
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

