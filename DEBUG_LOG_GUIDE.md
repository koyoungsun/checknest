# 디버깅 로그 정리 가이드

## 로그 분류 기준

### 1. 개발용 로그 (제거 대상)
- 데이터 로드 시작/완료 메시지
- 데이터 개수/상세 정보 출력
- 단계별 진행 상황 로그
- 예: `console.log("[HOME] loadRecentTemplates start")`

**제거 이유**: 프로덕션 환경에서 불필요한 콘솔 출력을 방지하고 성능을 개선합니다.

### 2. 경고 로그 (유지)
- 인덱스 오류 경고
- 권한 오류 경고
- 예: `console.warn("[getChecklists] Firestore 인덱스 오류")`

**유지 이유**: 개발자가 문제를 빠르게 파악할 수 있도록 합니다.

### 3. 에러 로그 (유지)
- 예외 발생 시 에러 메시지
- Firestore 권한 오류
- 네트워크 오류
- 예: `console.error("[HOME] loadRecentTemplates failed:", err)`

**유지 이유**: 프로덕션에서도 문제 진단을 위해 필요합니다.

## 제거된 로그 목록

### Home.vue
- `[HOME] mounted, loading recent templates and boards`
- `[HOME] loadRecentTemplates start`
- `[HOME] templates count: X`
- `[HOME] first template: {...}`
- `[HOME] loadRecentTemplates done`
- `[HOME] loadRecentBoards start`
- `[HOME] boards count: X`
- `[HOME] loadRecentBoards done`
- `[HOME] currentUser ready: {uid}`
- `[HOME] currentUser not ready, skipping checklist load`

### useAuth.ts
- `[INIT] default checklist initialization skipped (in progress)`
- `[INIT] default checklist created for user: {uid}`

### useBoards.ts
- `게시글 목록 로드 실패: {상세 에러 객체}` (에러 메시지만 유지)
- `[useBoards] Firestore 권한 오류: 로그인 상태 및 Firestore 규칙을 확인하세요.` (간단한 메시지로 변경)

### useChecklists.ts
- `[loadMyChecklists] 시작 - ownerId: {uid}`
- `[loadMyChecklists] Firestore에서 가져온 내 체크리스트: X개`
- `[loadMyChecklists] 내 체크리스트 상세: {...}`
- `[loadMyChecklists] 기존 공유 체크리스트: X개`
- `[loadMyChecklists] 최종 checklists.value: X개`
- `[loadMyChecklists] 기본 todo 포함 여부: {boolean}`
- `[loadSharedChecklists] 시작 - memberId: {uid}`
- `[loadSharedChecklists] Firestore에서 가져온 모든 멤버 체크리스트: X개`
- `[loadSharedChecklists] 필터링된 공유 체크리스트: X개`
- `[loadSharedChecklists] 공유 체크리스트 상세: {...}`
- `[loadSharedChecklists] 기존 내 체크리스트: X개`
- `[loadSharedChecklists] 최종 checklists.value: X개`
- `[loadSharedChecklists] 기본 todo 포함 여부: {boolean}`

## 유지된 로그

### 에러 로그
- `[HOME] loadRecentTemplates failed: {에러 메시지}`
- `[HOME] loadRecentBoards failed: {에러 메시지}`
- `[HOME] loadMyChecklists failed (non-blocking): {에러 메시지}`
- `[HOME] loadSharedChecklists failed (non-blocking): {에러 메시지}`
- `[useBoards] Firestore 권한 오류`
- `[useBoards] 게시글 목록 로드 실패: {에러 메시지}`
- `[getChecklists] Firestore 인덱스 오류 - fallback 적용: {에러 메시지}`

### 경고 로그
- `[getChecklists] Firestore 인덱스 오류 - fallback 적용` (개발 단계에서만)

## 배포 시 추가 고려사항

1. **환경 변수 기반 로그 제어**:
   ```typescript
   const isDev = import.meta.env.DEV;
   if (isDev) {
     console.log("[DEBUG] ...");
   }
   ```

2. **로그 레벨 설정**:
   - 개발: 모든 로그 출력
   - 프로덕션: 에러 로그만 출력

3. **에러 추적 서비스 연동**:
   - Sentry, Bugsnag 등과 연동하여 에러 로그를 중앙에서 관리

## 로그 정리 효과

1. **성능 개선**: 불필요한 콘솔 출력 제거로 성능 향상
2. **가독성 향상**: 중요한 에러 로그만 남아 문제 파악이 쉬워짐
3. **보안**: 민감한 정보가 콘솔에 노출되지 않음

