import type { Timestamp } from "firebase/firestore";

export interface Chat {
  id: string;
  checklistId: string;
  userId: string;
  message: string;
  createdAt: Timestamp;
  /**
   * 정렬을 위한 숫자 타임스탬프
   * 
   * @note ChatCreateInput에서 받지 않음
   * @note createChat 서비스에서 Date.now()로 자동 생성됨
   */
  createdAtNum?: number;
  system: boolean; // 안내 메시지인지 구분
  /**
   * 클라이언트 ID (optimistic update용)
   * temp 메시지를 Firestore 메시지로 교체할 때 사용
   */
  clientId?: string;
}

export interface ChatCreateInput {
  checklistId: string;
  userId: string;
  message: string;
  system?: boolean;
}

