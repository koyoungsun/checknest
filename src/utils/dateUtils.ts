/**
 * 타임스탬프를 상대 시간 문자열로 변환
 * @param timestamp - 밀리초 타임스탬프
 * @returns 상대 시간 문자열 (예: "5분 전", "2시간 전")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString("ko-KR");
};

/**
 * 날짜가 지났는지 확인
 * @param dueDate - 종료일 문자열 (YYYY-MM-DD)
 * @returns 지났으면 true
 */
export const isOverdue = (dueDate: string | null | undefined): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  const d = new Date(dueDate);
  // 날짜만 비교 (시간 영향 최소화)
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

/**
 * 템플릿 날짜 포맷 (연도 제외, 다를 경우만 표시)
 * @param date - Date 객체
 * @returns 포맷된 날짜 문자열 (MM.DD 또는 YYYY.MM.DD)
 */
export const formatTemplateDate = (date: Date): string => {
  const now = new Date();
  const created = new Date(date);
  const currentYear = now.getFullYear();
  const createdYear = created.getFullYear();
  
  if (currentYear === createdYear) {
    return `${String(created.getMonth() + 1).padStart(2, '0')}.${String(created.getDate()).padStart(2, '0')}`;
  } else {
    return `${createdYear}.${String(created.getMonth() + 1).padStart(2, '0')}.${String(created.getDate()).padStart(2, '0')}`;
  }
};

/**
 * 게시글 날짜 포맷 (연도 제외, 다를 경우만 표시)
 * @param timestamp - 밀리초 타임스탬프
 * @returns 포맷된 날짜 문자열 (MM.DD 또는 YYYY.MM.DD)
 */
export const formatPostDate = (timestamp: number): string => {
  const now = new Date();
  const created = new Date(timestamp);
  const currentYear = now.getFullYear();
  const createdYear = created.getFullYear();
  
  if (currentYear === createdYear) {
    return `${String(created.getMonth() + 1).padStart(2, '0')}.${String(created.getDate()).padStart(2, '0')}`;
  } else {
    return `${createdYear}.${String(created.getMonth() + 1).padStart(2, '0')}.${String(created.getDate()).padStart(2, '0')}`;
  }
};

/**
 * D-Day 계산
 * @param dueDate - 종료일 문자열 (YYYY-MM-DD)
 * @returns D-Day 문자열 (예: "D-3", "D+1", "D-Day")
 */
export const calculateDDay = (dueDate: string | null | undefined): string => {
  if (!dueDate) return "";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "D-Day";
  } else if (diffDays > 0) {
    return `D-${diffDays}`;
  } else {
    return `D+${Math.abs(diffDays)}`;
  }
};

/**
 * D-Day 색상 계산
 * @param dueDate - 종료일 문자열 (YYYY-MM-DD)
 * @returns 색상 문자열
 */
export const getDDayColor = (dueDate: string | null | undefined): string => {
  if (!dueDate) return "#666";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    // D+ (과거)
    return "#999";
  } else if (diffDays <= 3) {
    // D-Day, D-1, D-2, D-3 (3일 이내)
    return "#ff0000"; // 레드
  } else {
    // D-4 이상 (3일보다 클 때)
    return "#0000ff"; // 블루
  }
};

/**
 * 다양한 타입의 날짜 값을 안전하게 Date 객체로 변환
 * 
 * @param value - 변환할 날짜 값 (Timestamp, Date, number, string, null, undefined)
 * @returns Date 객체 또는 null (변환 불가능한 경우)
 * 
 * @example
 * ```typescript
 * // Firestore Timestamp
 * toDate(timestamp) // Date 객체
 * 
 * // Date 객체
 * toDate(new Date()) // Date 객체
 * 
 * // 밀리초 타임스탬프
 * toDate(1234567890) // Date 객체
 * 
 * // 날짜 문자열
 * toDate("2024-01-01") // Date 객체
 * 
 * // null/undefined
 * toDate(null) // null
 * ```
 */
export function toDate(
  value: Date | { toDate: () => Date } | number | string | null | undefined
): Date | null {
  if (!value) return null;

  // 이미 Date 객체인 경우
  if (value instanceof Date) {
    return value;
  }

  // Firestore Timestamp인 경우 (toDate 메서드가 있는 경우)
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch (err) {
      console.error('toDate conversion failed:', err);
      return null;
    }
  }

  // 숫자 타입인 경우 (밀리초 타임스탬프)
  if (typeof value === 'number') {
    return new Date(value);
  }

  // 문자열 타입인 경우
  if (typeof value === 'string') {
    const date = new Date(value);
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', value);
      return null;
    }
    return date;
  }

  // 변환 불가능한 경우
  console.error('Unable to convert to Date:', value);
  return null;
}

/**
 * 날짜를 yyyy.MM.dd 형식으로 변환
 * @param date - Date 객체 또는 Timestamp
 * @returns 포맷된 날짜 문자열 (yyyy.MM.dd)
 */
export const formatDateYYYYMMDD = (date: Date | { toDate: () => Date } | null | undefined): string => {
  const dateObj = toDate(date);
  if (!dateObj) return "";
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};


