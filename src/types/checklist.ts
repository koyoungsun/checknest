import type { Timestamp } from "firebase/firestore";

/**
 * 체크리스트 데이터 구조
 */
export interface Checklist {
  id: string;
  ownerId: string; // 체크리스트 소유자 UID
  title: string;
  description: string;
  /**
   * 그룹 목록 (필수 필드)
   * 
   * @note 각 그룹은 고유한 groupId를 가짐
   * @note groupName은 단순 표시용 문자열
   * @note order는 그룹 정렬 순서
   * @note 최소 1개 이상의 그룹이 반드시 존재해야 함
   */
  groups: Array<{
    groupId: string; // UUID로 생성된 고유 ID
    groupName: string; // 표시용 그룹명
    order: number; // 그룹 정렬 순서
  }>;
  dueDate: Timestamp | null; // 종료일 (null: 종료일 없음)
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
   * 체크리스트 상태
   * 
   * @note 'active': 활성 상태 (기본값)
   * @note 'completed': 완료 상태 (progress === 100일 때 자동 설정)
   * @note 'archived': 보관 상태 (사용자가 보관함으로 이동한 경우)
   */
  status?: 'active' | 'completed' | 'archived';
  /**
   * 완료일 (서버 타임스탬프)
   * 
   * @note progress가 100%가 되면 자동으로 현재 시간이 저장됨
   * @note 완료되지 않은 체크리스트는 null 또는 undefined
   */
  completedAt?: Timestamp | null;
  /**
   * 초대된 멤버 정보 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note 빈 배열 []: 소유자만 있는 체크리스트
   * @note Firestore 저장 정책: undefined는 저장되지 않음, 빈 배열 []로 저장됨
   */
  members: Array<{
    userId: string; // 멤버 UID
    role: 'admin' | 'member'; // 역할 (owner는 ownerId 필드로 관리)
  }>;
  /**
   * 초대 대기중인 멤버 UID 배열
   * 
   * @note 초대는 되었으나 아직 수락하지 않은 멤버들
   * @note 수락하면 members 배열로 이동됨
   * @note Firestore 저장 정책: undefined는 저장되지 않음, 빈 배열 []로 저장됨
   */
  pendingMembers?: string[];
  rolesEnabled: boolean; // 역할 활성화 여부
  templateId: string | null; // 템플릿 ID (템플릿에서 생성된 경우)
  isDefault: boolean; // 기본 체크리스트 여부 (최초 로그인 시 자동 생성되는 'todo' 체크리스트)
  hasChat?: boolean; // 채팅 기능 활성화 여부 (deprecated: chatEnabled 사용 권장)
  chatEnabled: boolean; // 채팅 기능 활성화 여부 (필수 필드, 기본 todo는 false, 그 외는 true)
  /**
   * 최대 참가 인원 수
   * 
   * @note 체크리스트 생성 시 최초 참여자 수(owner + 초대된 멤버)로 저장됨
   * @note 초대 시 현재 members.length >= maxParticipants인 경우 초대 불가
   */
  maxParticipants?: number;
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
   * 종료일
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - null: null로 저장됨 (종료일 없음)
   *       - Date: Timestamp로 변환되어 저장됨
   */
  dueDate?: Date | null;
  /**
   * 초대된 멤버 정보 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - 빈 배열 []: 빈 배열로 저장됨 (소유자만 있는 체크리스트)
   *       - 배열: 배열로 저장됨
   * 
   * @default 빈 배열 []로 저장됨 (서비스에서 처리)
   */
  members?: Array<{
    userId: string; // 멤버 UID
    role: 'admin' | 'member'; // 역할 (owner는 ownerId 필드로 관리)
  }>;
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
  /**
   * 기본 체크리스트 여부
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - boolean: boolean 값으로 저장됨
   * 
   * @default false로 저장됨 (서비스에서 처리)
   */
  isDefault?: boolean;
  /**
   * 그룹 목록 (필수 필드)
   * 
   * @note 각 그룹은 고유한 groupId (UUID)를 가짐
   * @note groupName은 단순 표시용 문자열
   * @note order는 그룹 정렬 순서
   * @note 최소 1개 이상의 그룹이 반드시 필요함
   */
  groups: Array<{
    groupId: string;
    groupName: string;
    order: number;
  }>;
  /**
   * 채팅 기능 활성화 여부 (옵션)
   * 
   * @note Firestore 저장 정책:
   *       - undefined: true로 간주 (채팅 활성화)
   *       - boolean: boolean 값으로 저장됨
   * @note 기본 todo(isDefault: true)에는 false로 자동 지정됨
   */
  chatEnabled?: boolean;
  /**
   * 최대 참가 인원 수 (옵션)
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 저장되지 않음 (필드 자체가 생성되지 않음)
   *       - number: number 값으로 저장됨
   * @note 체크리스트 생성 시 최초 참여자 수(owner + 초대된 멤버)로 저장됨
   */
  maxParticipants?: number;
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
   * 종료일
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - null: null로 업데이트됨 (종료일 없음)
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
   * 초대된 멤버 정보 배열
   * 
   * @note ownerId는 포함하지 않음 (ownerId는 별도 필드로 관리)
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - 빈 배열 []: 빈 배열로 업데이트됨
   *       - 배열: 배열로 업데이트됨
   */
  members?: Array<{
    userId: string; // 멤버 UID
    role: 'admin' | 'member'; // 역할 (owner는 ownerId 필드로 관리)
  }>;
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
  /**
   * 기본 체크리스트 여부
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - boolean: boolean 값으로 업데이트됨
   */
  isDefault?: boolean;
  /**
   * 그룹 목록 업데이트
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - 배열: 그룹 배열로 업데이트됨
   */
  groups?: Array<{
    groupId: string;
    groupName: string;
    order: number;
  }>;
  /**
   * 체크리스트 상태 업데이트
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - 'active' | 'completed' | 'archived': 상태 값으로 업데이트됨
   */
  status?: 'active' | 'completed' | 'archived';
  /**
   * 완료일 업데이트
   * 
   * @note Firestore 저장 정책:
   *       - undefined: 업데이트되지 않음 (기존 값 유지)
   *       - null: null로 업데이트됨 (완료일 없음)
   *       - Date: Timestamp로 변환되어 업데이트됨
   * @note 일반적으로 서비스에서 serverTimestamp()로 자동 설정됨
   */
  completedAt?: Date | null;
}
