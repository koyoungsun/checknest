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
}

export interface ItemCreateInput {
  checklistId: string;
  name: string;
  isDone?: boolean;
  assignedTo?: string | null;
  order: number;
}

export interface ItemUpdateInput {
  name?: string;
  isDone?: boolean;
  assignedTo?: string | null;
  order?: number;
}

