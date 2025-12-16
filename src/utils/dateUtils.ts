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


