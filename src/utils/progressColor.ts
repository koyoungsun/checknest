/**
 * 진행률에 따른 컬러 계산 함수
 * 
 * 컬러 규칙:
 * - 0% ~ 9%: 회색 (#999)
 * - 10% ~ 50%: 파란색 계열 (progress에 따라 점점 진해짐)
 * - 51% ~ 99%: 파란색 → 빨간색으로 점진적 전환
 * - 100%: 완전한 빨간색 (#FF0000)
 * 
 * HSL 보간 방식을 사용하여 자연스러운 색상 전환 구현
 */
export const getProgressColor = (progress: number | null | undefined): string => {
  const progressValue = Math.max(0, Math.min(100, progress || 0));
  
  // 0% ~ 9%: 회색
  if (progressValue < 10) {
    return '#999';
  }
  
  // 10% ~ 50%: 파란색 계열 (점점 진해짐)
  if (progressValue >= 10 && progressValue < 50) {
    // HSL 보간: 색상(H)은 파란색(240도) 고정, 채도(S)와 명도(L)만 변화
    // 10%: 연한 파란색 (hsl(240, 50%, 70%))
    // 50%: 진한 파란색 (hsl(240, 100%, 50%))
    const ratio = (progressValue - 10) / 40; // 0 ~ 1 사이 값
    
    const h = 240; // 파란색 고정
    const s = 50 + (100 - 50) * ratio; // 채도: 50% → 100%
    const l = 70 - (70 - 50) * ratio; // 명도: 70% → 50% (진해짐)
    
    return `hsl(${h}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }
  
  // 51% ~ 99%: 파란색 → 빨간색으로 점진적 전환
  if (progressValue >= 51 && progressValue < 100) {
    // RGB 보간을 사용하여 파란색에서 빨간색으로 직접 전환
    const ratio = (progressValue - 51) / 48; // 0 ~ 1 사이 값 (51% ~ 99%)
    
    // 51%: 진한 파란색 (rgb(34, 114, 237))
    // 99%: 빨간색에 가까운 색상 (rgb(255, 0, 0))
    const r1 = 34, g1 = 114, b1 = 237; // 파란색 RGB
    const r2 = 255, g2 = 0, b2 = 0; // 빨간색 RGB
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // 100%: 완전한 빨간색
  if (progressValue === 100) {
    return '#FF0000'; // 또는 hsl(0, 100%, 50%)
  }
  
  // 기본값
  return '#999';
};

