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
 * @param dueDate - 마감일 문자열 (YYYY-MM-DD)
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

