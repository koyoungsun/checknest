import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Chat, ChatCreateInput } from "@/types/chat";

export type { ChatCreateInput };

const COLLECTION_NAME = "chats";

/**
 * 채팅 조회 (단일)
 */
export const getChat = async (id: string): Promise<Chat | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Chat;
    }
    return null;
  } catch (error) {
    console.error("채팅 조회 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트의 채팅 목록 조회
 */
export const getChats = async (
  checklistId: string,
  options?: { limitCount?: number }
): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("checklistId", "==", checklistId),
      orderBy("createdAt", "desc"),
      ...(options?.limitCount ? [limit(options.limitCount)] : [])
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Chat)
    );
  } catch (error) {
    console.error("채팅 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 채팅 생성
 */
export const createChat = async (input: ChatCreateInput): Promise<string> => {
  try {
    // Firestore에 전달되는 payload 로그 출력
    const payload = {
      checklistId: input.checklistId,
      userId: input.userId,
      senderId: input.userId, // Firestore Rules에서 senderId 확인을 위해 추가
      message: input.message,
      system: input.system || false,
      createdAt: serverTimestamp(),
      createdAtNum: Date.now(), // 정렬을 위한 숫자 타임스탬프
    };
    
    console.log("[chats.ts] createChat() Firestore payload:", {
      checklistId: payload.checklistId,
      senderId: payload.senderId,
      userId: payload.userId,
      text: payload.message,
      system: payload.system,
      createdAtNum: payload.createdAtNum,
    });
    
    const now = Date.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    console.log("[chats.ts] createChat() 성공 - 생성된 문서 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[chats.ts] createChat() 실패:", error);
    throw error;
  }
};

/**
 * 시스템 메시지 생성
 */
export const createSystemChat = async (
  checklistId: string,
  message: string
): Promise<string> => {
  try {
    return await createChat({
      checklistId,
      userId: "system",
      message,
      system: true,
    });
  } catch (error) {
    console.error("시스템 메시지 생성 실패:", error);
    throw error;
  }
};

// 채팅 삭제 기능 제거: 채팅은 불변 로그로 동작

