import { Timestamp } from "firebase/firestore";

/**
 * 알람 타입
 */
export type NotificationType = "invite" | "system";

/**
 * 알람 데이터 구조 (Firestore notifications 컬렉션)
 */
export interface Notification {
  id: string;
  userId: string; // 알람을 받는 사용자 ID
  type: NotificationType; // 알람 타입
  title: string; // 알람 제목
  message: string; // 알람 메시지
  checklistId?: string; // 체크리스트 초대인 경우 체크리스트 ID
  read: boolean; // 읽음 여부
  createdAt: Timestamp | Date | number; // 생성 시간
}

/**
 * 알람 생성 입력 데이터
 */
export interface NotificationCreateInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  checklistId?: string;
}

