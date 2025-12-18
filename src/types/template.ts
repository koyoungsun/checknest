import type { Timestamp } from "firebase/firestore";

/**
 * 템플릿 그룹 데이터 구조 (Checklist와 동일)
 */
export interface TemplateGroup {
  groupId: string; // UUID로 생성된 고유 ID
  groupName: string; // 표시용 그룹명
  order: number; // 그룹 정렬 순서
}

/**
 * 템플릿 항목 데이터 구조
 */
export interface TemplateItem {
  title: string;
  isCompleted: boolean; // 항상 false (템플릿에서는 완료 상태가 없음)
  groupId: string; // 속한 그룹의 ID
}

/**
 * 템플릿 데이터 구조 (Firestore)
 * 
 * @note Checklist와 동일한 groups 구조를 사용
 * @note groups와 items는 분리되어 저장됨 (Checklist와 동일)
 * 
 * 필수 필드:
 * - visibility: "public" | "private" (필수, 기본값 "private")
 * 
 * 사용하지 않는 필드:
 * - isPublic: 레거시 필드, 더 이상 사용하지 않음
 */
export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  /**
   * 그룹 목록 (필수 필드, Checklist와 동일한 구조)
   * 
   * @note 각 그룹은 고유한 groupId를 가짐
   * @note groupName은 단순 표시용 문자열
   * @note order는 그룹 정렬 순서
   * @note 최소 1개 이상의 그룹이 반드시 존재해야 함
   */
  groups: TemplateGroup[];
  /**
   * 항목 목록 (groups와 분리되어 저장)
   * 
   * @note 각 항목은 groupId를 통해 그룹에 속함
   * @note isCompleted는 항상 false
   */
  items: TemplateItem[];
  ownerId: string;
  /**
   * 공개 범위 (필수 필드)
   * 
   * @note "public": 다른 사용자에게 공개, 홈/탐색에 노출
   * @note "private": 나만 사용 가능, 홈에 노출되지 않음
   * @note 기본값: "private"
   * @note 기존 데이터 중 visibility가 없는 경우 "private"로 마이그레이션됨
   */
  visibility: "private" | "public";
  likeCount: number; // default 0
  usedCount: number; // default 0
  sourceChecklistId?: string; // 종료된 체크리스트에서 생성된 경우 (V1.1 고려)
  createdAt: Timestamp;
}

/**
 * 템플릿 생성 입력 데이터
 */
export interface TemplateCreateInput {
  title: string;
  description?: string;
  category: string;
  groups: TemplateGroup[]; // 필수 필드
  items: TemplateItem[]; // 필수 필드
  ownerId: string;
  /**
   * 공개 범위 (선택 필드, 기본값 "private")
   * 
   * @note 제공되지 않으면 "private"로 설정됨
   * @note "public" 또는 "private"만 허용
   */
  visibility?: "private" | "public";
  sourceChecklistId?: string; // V1.1 고려
}

/**
 * 템플릿 업데이트 입력 데이터
 */
export interface TemplateUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  groups?: TemplateGroup[];
  items?: TemplateItem[];
  visibility?: "private" | "public";
}

/**
 * 템플릿 목록 조회 필터
 */
export interface TemplateListFilters {
  category?: string;
  visibility?: "private" | "public";
  ownerId?: string;
}

/**
 * 템플릿 정렬 옵션
 */
export type TemplateSortOption = "createdAt" | "title" | "category";







