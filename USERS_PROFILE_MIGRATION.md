# Users 프로필 구조 변경 가이드

## 변경 사항 요약

### 1. Firestore Rules 변경
- `users` 컬렉션에 대한 규칙 추가
- **Read**: 모든 사용자 프로필은 로그인 여부와 관계없이 조회 가능 (공개 프로필)
- **Write/Update/Delete**: 본인만 가능

### 2. UserProfile 인터페이스 변경
- **이전**: `nickname`, `email`, `bio`, `photoURL`, `myMembers`, `blockedMembers` 등 모든 필드 포함
- **현재**: `displayName`, `photoURL`, `createdAt`만 포함 (공개 프로필 전용)

### 3. 주요 변경 파일
- `firestore.rules`: users 컬렉션 규칙 추가
- `src/services/userService.ts`: 공개 프로필 기준으로 수정
- `src/services/userProfileService.ts`: 공개 프로필 기준으로 수정
- `src/composables/useAuthorName.ts`: displayName 사용으로 변경
- `src/composables/useUserProfile.ts`: 공개 프로필 필드만 업데이트 가능하도록 수정
- `src/views/Mypage.vue`: displayName 사용, bio/myMembers/blockedMembers는 별도 관리 필요

## 마이그레이션 필요 사항

### 기존 users 문서 업데이트 (선택사항)

기존 users 문서에 `nickname` 필드가 있다면 `displayName`으로 마이그레이션할 수 있습니다:

```javascript
// Firebase Console > Firestore > users 컬렉션에서 수동 실행
// 또는 Cloud Functions로 일괄 마이그레이션

const users = await db.collection('users').get();
users.forEach(async (doc) => {
  const data = doc.data();
  if (data.nickname && !data.displayName) {
    await doc.ref.update({
      displayName: data.nickname,
    });
  }
});
```

### Mypage.vue의 bio, myMembers, blockedMembers 처리

현재 `Mypage.vue`에서 사용하는 `bio`, `myMembers`, `blockedMembers`는 users 컬렉션에 저장하지 않습니다.

**향후 처리 방안:**
1. **별도 컬렉션 사용**: `userPrivateData/{userId}` 컬렉션 생성
2. **암호화 저장**: 민감 정보는 암호화하여 저장
3. **Firestore Rules**: 본인만 읽기/쓰기 가능하도록 설정

예시:
```javascript
// userPrivateData 컬렉션 규칙
match /userPrivateData/{userId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == userId;
}
```

## 테스트 체크리스트

### ✅ 권한 테스트
- [ ] 로그인하지 않은 상태에서 users/{userId} 조회 가능
- [ ] 로그인한 사용자가 다른 사용자 프로필 조회 가능
- [ ] 본인 프로필 수정 가능
- [ ] 다른 사용자 프로필 수정 불가능 (권한 오류)

### ✅ 프로필 조회 테스트
- [ ] 게시글 작성자 이름 정상 표시
- [ ] 댓글 작성자 이름 정상 표시
- [ ] 템플릿 작성자 이름 정상 표시
- [ ] 알림에서 사용자 이름 정상 표시
- [ ] 프로필이 없는 사용자는 "알 수 없음" 표시

### ✅ 프로필 생성/업데이트 테스트
- [ ] 회원가입 시 users 문서 자동 생성
- [ ] 구글 로그인 시 users 문서 자동 생성
- [ ] 프로필 이미지 업로드 정상 작동
- [ ] displayName 수정 정상 작동

### ✅ Console 에러 확인
- [ ] "Missing or insufficient permissions" 에러 없음
- [ ] users 컬렉션 조회 관련 에러 없음

## 주의사항

1. **기존 데이터 호환성**: `nickname` 필드가 있는 경우 `displayName`으로 자동 매핑됩니다.
2. **민감 정보 분리**: `bio`, `myMembers`, `blockedMembers`는 별도 컬렉션으로 관리해야 합니다.
3. **Firestore Rules 배포**: 변경된 rules를 Firebase Console에서 배포해야 합니다.

## 다음 단계

1. Firebase Console에서 Firestore Rules 배포
2. 기존 users 문서 마이그레이션 (선택사항)
3. Mypage.vue의 bio, myMembers, blockedMembers를 별도 컬렉션으로 분리 (향후 작업)

