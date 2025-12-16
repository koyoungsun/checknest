# Firebase Functions

완료된 체크리스트의 오래된 채팅 메시지를 삭제하는 Cloud Functions입니다.

## 함수 목록

### 1. `deleteOldCompletedChats`
- **타입**: Scheduled Function (Cloud Scheduler)
- **실행 주기**: 매일 자정 (0 0 * * *)
- **기능**: `status === 'completed'`이고 `completedAt + 24시간`이 지난 체크리스트의 채팅 메시지 삭제

### 2. `deleteOldCompletedChatsManual`
- **타입**: Callable Function (HTTPS)
- **실행 방법**: 수동 호출 (테스트 및 즉시 실행용)
- **기능**: 위와 동일하지만 수동으로 실행 가능

## 설치 및 배포

### 1. 의존성 설치
```bash
cd functions
npm install
```

### 2. 빌드
```bash
npm run build
```

### 3. 배포
```bash
npm run deploy
```

또는 전체 프로젝트 배포:
```bash
firebase deploy
```

## 테스트

### 로컬 테스트
```bash
npm run serve
```

### 수동 실행 (Callable Function)
```bash
firebase functions:call deleteOldCompletedChatsManual
```

## Cloud Scheduler 설정

함수 배포 후 Cloud Console에서 스케줄을 확인/수정할 수 있습니다:
- [Firebase Console > Functions > deleteOldCompletedChats](https://console.firebase.google.com/project/_/functions)

스케줄 변경이 필요한 경우 `functions/src/index.ts`의 `schedule()` 부분을 수정하고 재배포하세요.

## 주의사항

1. **배치 제한**: Firestore 배치 작업은 최대 500개 문서까지 처리 가능합니다. 체크리스트가 많은 경우 여러 번 실행되거나 추가 로직이 필요할 수 있습니다.

2. **비용**: Cloud Functions 실행 시 비용이 발생합니다. 실행 빈도를 적절히 조절하세요.

3. **에러 처리**: 함수 실행 중 에러가 발생하면 Cloud Functions 로그에서 확인할 수 있습니다.

