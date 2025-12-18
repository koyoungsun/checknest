import type { Timestamp } from "firebase/firestore";

/**
 * NEW 템플릿 판별 기준일 (일)
 * 이 값 이내에 생성된 템플릿은 NEW로 표시됩니다.
 */
export const NEW_DAYS = 3;

/**
 * 템플릿이 NEW인지 판별하는 함수
 * 
 * @param createdAt - 템플릿 생성일 (Date 객체, Timestamp, 또는 null/undefined)
 * @returns NEW 기준일 이내에 생성된 템플릿이면 true, 아니면 false
 * 
 * @example
 * ```typescript
 * // Date 객체 사용
 * isNewTemplate(new Date()) // true (오늘 생성)
 * 
 * // Timestamp 사용
 * isNewTemplate(template.createdAt) // true/false
 * 
 * // null/undefined 처리
 * isNewTemplate(null) // false
 * ```
 */
export function isNewTemplate(
  createdAt: Date | Timestamp | null | undefined
): boolean {
  if (!createdAt) return false;

  // Timestamp인 경우 Date로 변환
  const date = createdAt instanceof Date 
    ? createdAt 
    : createdAt.toDate();

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= NEW_DAYS;
}

