import { ref, onMounted, onUnmounted } from "vue";
import {
  getChats,
  createChat,
  createSystemChat,
  deleteChat,
} from "@/services/chats";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Chat } from "@/types/chat";

/**
 * 채팅 관리 Composable
 */
export const useChats = (checklistId: string) => {
  const chats = ref<Chat[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let unsubscribe: (() => void) | null = null;

  /**
   * 채팅 목록 로드
   */
  const loadChats = async (limitCount?: number) => {
    loading.value = true;
    error.value = null;
    try {
      chats.value = await getChats(checklistId, { limitCount });
    } catch (err) {
      error.value = err as Error;
      console.error("채팅 목록 로드 실패:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 실시간 채팅 구독
   */
  const subscribeChats = () => {
    const q = query(
      collection(db, "chats"),
      where("checklistId", "==", checklistId),
      orderBy("createdAt", "desc")
    );

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        chats.value = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Chat)
        );
      },
      (err) => {
        error.value = err;
        console.error("채팅 실시간 구독 실패:", err);
      }
    );
  };

  /**
   * 채팅 전송
   */
  const sendChat = async (input: {
    userId: string;
    message: string;
    system?: boolean;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const id = await createChat({
        ...input,
        checklistId,
      });
      return id;
    } catch (err) {
      error.value = err as Error;
      console.error("채팅 전송 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 시스템 메시지 전송
   */
  const sendSystemMessage = async (message: string) => {
    try {
      return await createSystemChat(checklistId, message);
    } catch (err) {
      console.error("시스템 메시지 전송 실패:", err);
      throw err;
    }
  };

  /**
   * 채팅 삭제
   */
  const removeChat = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteChat(id);
      chats.value = chats.value.filter((chat) => chat.id !== id);
    } catch (err) {
      error.value = err as Error;
      console.error("채팅 삭제 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 실시간 구독 시작
  onMounted(() => {
    subscribeChats();
  });

  // 구독 해제
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    chats,
    loading,
    error,
    loadChats,
    sendChat,
    sendSystemMessage,
    removeChat,
  };
};

