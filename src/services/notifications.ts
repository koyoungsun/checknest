import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type {
  Notification,
  NotificationCreateInput,
} from "@/types/notification";

const COLLECTION_NAME = "notifications";

/**
 * 알람 목록 조회 (현재 로그인 유저의 알람만)
 * 최신순(createdAt desc) 정렬
 */
export const getNotifications = async (
  userId: string,
  limitCount?: number
): Promise<Notification[]> => {
  try {
    const constraints: any[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        checklistId: data.checklistId,
        read: data.read || false,
        createdAt: data.createdAt,
      } as Notification;
    });
  } catch (error: any) {
    // 인덱스 오류인 경우 안내 메시지 출력
    if (error?.code === "failed-precondition") {
      console.warn(
        "[getNotifications] Firestore 인덱스가 필요합니다.",
        "Firestore 콘솔에서 다음 인덱스를 생성하세요:",
        "Collection: notifications",
        "Fields: userId (Ascending), createdAt (Descending)"
      );
      // 인덱스가 없어도 빈 배열 반환 (에러로 처리하지 않음)
      return [];
    }
    console.error("[getNotifications] 알람 목록 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 읽지 않은 알람 개수 조회
 */
export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error("[getUnreadNotificationCount] 읽지 않은 알람 개수 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 알람 생성
 */
export const createNotification = async (
  input: NotificationCreateInput
): Promise<string> => {
  try {
    const payload: any = {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: serverTimestamp(),
    };

    if (input.checklistId) {
      payload.checklistId = input.checklistId;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    console.log("[createNotification] 알람 생성 성공, ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[createNotification] 알람 생성 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 알람 읽음 처리 (단일)
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(docRef, {
      read: true,
    });
    console.log("[markNotificationAsRead] 알람 읽음 처리 성공, ID:", notificationId);
  } catch (error: any) {
    console.error("[markNotificationAsRead] 알람 읽음 처리 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 알람 읽음 처리 (전체 - 현재 유저의 모든 unread 알람)
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log("[markAllNotificationsAsRead] 전체 알람 읽음 처리 성공");
  } catch (error: any) {
    console.error("[markAllNotificationsAsRead] 전체 알람 읽음 처리 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 알람 삭제
 */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await deleteDoc(docRef);
    console.log("[deleteNotification] 알람 삭제 성공, ID:", notificationId);
  } catch (error: any) {
    console.error("[deleteNotification] 알람 삭제 실패:", error?.message || error);
    throw error;
  }
};

