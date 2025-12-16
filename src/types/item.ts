import type { Timestamp } from "firebase/firestore";

export interface Item {
  id: string;
  checklistId: string;
  name: string;
  isDone: boolean;
  assignedTo: string | null;
  order: number;
  createdAt: Timestamp;
  /**
   * 정렬을 위한 숫자 타임스탬프
   * 
   * @note ItemCreateInput에서 받지 않음
   * @note createItem 서비스에서 Date.now()로 자동 생성됨
   */
  createdAtNum?: number;
  updatedAt: Timestamp;
  /**
   * 그룹 ID (필수 필드)
   * 
   * @note item은 반드시 하나의 groupId를 가져야 함
   */
  groupId: string;
  /**
   * 그룹명 (UI 그룹 렌더링 기준)
   * 
   * @note 없으면 '기본 그룹'으로 처리
   */
  groupName?: string;
}

export interface ItemCreateInput {
  checklistId: string;
  name: string;
  isDone?: boolean;
  assignedTo?: string | null;
  order: number;
  /**
   * 그룹 ID (필수 필드)
   * 
   * @note item은 반드시 하나의 groupId를 가져야 함
   */
  groupId: string;
}

export interface ItemUpdateInput {
  name?: string;
  isDone?: boolean;
  assignedTo?: string | null;
  order?: number;
  /**
   * 그룹 ID (업데이트 시 사용)
   */
  groupId?: string;
}

