import type { Timestamp } from "firebase/firestore";

/**
 * 체크리스트 데이터 구조
 */
export interface Checklist {
  id: string;
  ownerId: string; // 체크리스트 소유자 UID
  title: string;
  description: string;
  dueDate: Timestamp | null; // 마감일 (null: 마감일 없음)
  createdAt: Timestamp; // 생성일 (서버 타임스탬프)
  /**
   * 정렬을 위한 숫자 타임스탬프
   * 
   * @note ChecklistCreateInput에서 받지 않음
   * @note createChecklist 서비스에서 Date.now()로 자동 생성됨
   * @note serverTimestamp()로 생성된 createdAt은 클라이언트에서 정렬 시 문제가 발생할 수 있어
   *       숫자 타임스탬프를 별도로 저장하여 정렬 기준으로 사용
   */
  createdAtNum?: number;
  updatedAt: Timestamp; // 수정일 (서버 타임스탬프)
  isCompleted: boolean; // 완료 여부
  progress: number; // 진행률 (0-100)
  /**
   * 초대된 멤버 UID 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note 빈 배열 []: 소유자만 있는 체크리스트
   * @note Firestore 저장 정책: undefined는 저장되지 않음, 빈 배열 []로 저장됨
   */
  members: string[];
  rolesEnabled: boolean; // 역할 활성화 여부
  templateId: string | null; // 템플릿 ID (템플릿에서 생성된 경우)
}

/**
 * 체크리스트 생성 입력 데이터
 * 
 * @note createdAt, createdAtNum, updatedAt은 서비스에서 자동 생성됨
 * @note createdAtNum은 createChecklist 서비스에서 Date.now()로 자동 생성됨
 */
export interface ChecklistCreateInput {
  ownerId: string; // 체크리스트 소유자 UID
  title: string;
  /**
   * 설명
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - 빈 문자열 "": 빈 문자열로 저장됨
   *       - null: null로 저장됨
   * 
   * @default 빈 문자열 ""로 저장됨 (서비스에서 처리)
   */
  description?: string;
  /**
   * 마감일
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - null: null로 저장됨 (마감일 없음)
   *       - Date: Timestamp로 변환되어 저장됨
   */
  dueDate?: Date | null;
  /**
   * 초대된 멤버 UID 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - 빈 배열 []: 빈 배열로 저장됨 (소유자만 있는 체크리스트)
   *       - 배열: 배열로 저장됨
   * 
   * @default 빈 배열 []로 저장됨 (서비스에서 처리)
   */
  members?: string[];
  /**
   * 역할 활성화 여부
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - boolean: boolean 값으로 저장됨
   * 
   * @default false로 저장됨 (서비스에서 처리)
   */
  rolesEnabled?: boolean;
  /**
   * 템플릿 ID
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - null: null로 저장됨 (템플릿에서 생성되지 않음)
   *       - string: 템플릿 ID로 저장됨
   * 
   * @default null로 저장됨 (서비스에서 처리)
   */
  templateId?: string | null;
}

/**
 * 체크리스트 업데이트 입력 데이터
 * 
 * @note undefined 필드는 업데이트되지 않음 (기존 값 유지)
 * @note null 필드는 명시적으로 null로 업데이트됨
 */
export interface ChecklistUpdateInput {
  title?: string;
  /**
   * 설명
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - 빈 문자열 "": 빈 문자열로 업데이트됨
   *       - null: null로 업데이트됨
   */
  description?: string;
  /**
   * 마감일
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - null: null로 업데이트됨 (마감일 없음)
   *       - Date: Timestamp로 변환되어 업데이트됨
   */
  dueDate?: Date | null;
  /**
   * 완료 여부
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - boolean: boolean 값으로 업데이트됨
   */
  isCompleted?: boolean;
  /**
   * 진행률 (0-100)
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - number: number 값으로 업데이트됨
   */
  progress?: number;
  /**
   * 초대된 멤버 UID 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - 빈 배열 []: 빈 배열로 업데이트됨
   *       - 배열: 배열로 업데이트됨
   */
  members?: string[];
  /**
   * 역할 활성화 여부
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - boolean: boolean 값으로 업데이트됨
   */
  rolesEnabled?: boolean;
  /**
   * 수정일
   * 
   * @note 일반적으로 서비스에서 serverTimestamp()로 자동 업데이트됨
   * @note 수동으로 설정할 경우에만 사용
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (서비스에서 serverTimestamp()로 자동 설정)
   *       - Timestamp: Timestamp 값으로 업데이트됨
   */
  updatedAt?: Timestamp;
}
