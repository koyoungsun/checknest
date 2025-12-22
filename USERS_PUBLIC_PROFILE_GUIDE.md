# Users 공개 프로필 구조 가이드

## 변경 사항 요약

### 1. Firestore Rules 변경
- `users` 컬렉션에 `isPublicProfile` 필드 기반 읽기 권한 제어 추가
- **Read**: `isPublicProfile === true`인 경우에만 조회 가능
- **예외**: 본인 프로필은 `isPublicProfile` 값과 관계없이 항상 조회 가능
- **Write/Update/Delete**: 본인만 가능

### 2. UserProfile 인터페이스 변경
- **공개 필드**: `displayName`, `photoURL`, `isPublicProfile`, `createdAt`, `updatedAt`
- **제거된 필드**: `email`, `bio`, `myMembers`, `blockedMembers` (민감 정보)

### 3. 주요 변경 파일
- `firestore.rules`: `isPublicProfile` 기반 읽기 권한 제어
- `src/services/userService.ts`: `isPublicProfile` 필드 추가, 공개 프로필만 조회
- `src/composables/useAuthorName.ts`: 권한 오류 안전 처리, currentUserId 전달
- `src/services/userProfileService.ts`: 본인 프로필 조회 시 currentUserId 전달
- `src/views/posts/PostWriteView.vue`: 작성자 이름을 users 컬렉션에서 가져오기
- `src/views/checklists/ChecklistDetailView.vue`: 멤버 프로필 조회 시 권한 오류 안전 처리

## Firestore Rules 구조

```javascript
match /users/{userId} {
  // Read: isPublicProfile === true인 경우에만 조회 가능
  // 본인 프로필은 항상 조회 가능
  allow read: if resource.data.isPublicProfile == true ||
                 (request.auth != null && request.auth.uid == userId);
  
  // Create: 본인만 생성 가능, isPublicProfile 필수
  allow create: if request.auth != null
    && request.auth.uid == userId
    && request.resource.data.keys().hasAll(['displayName', 'isPublicProfile'])
    && request.resource.data.isPublicProfile is bool;
  
  // Update: 본인만 수정 가능, 공개 필드만 업데이트 가능
  allow update: if request.auth != null
    && request.auth.uid == userId
    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['email', 'bio', 'myMembers', 'blockedMembers']) ||
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['displayName', 'photoURL', 'isPublicProfile', 'updatedAt']));
  
  // Delete: 본인만 삭제 가능
  allow delete: if request.auth != null
    && request.auth.uid == userId;
}
```

## 사용자 프로필 구조

### 공개 프로필 필드 (users 컬렉션)
```typescript
interface UserProfile {
  displayName: string;        // 공개 표시 이름 (필수)
  photoURL?: string;          // 프로필 이미지 URL (선택)
  isPublicProfile: boolean;   // 공개 프로필 여부 (필수)
  createdAt: Timestamp;       // 생성일 (필수)
  updatedAt?: Timestamp;      // 수정일 (선택)
}
```

### 기본값
- `isPublicProfile`: `true` (기본적으로 공개 프로필로 생성)
- `displayName`: Firebase Auth의 `displayName` 또는 "사용자"
- `photoURL`: Firebase Auth의 `photoURL` 또는 `null`

## 작성자 이름 로드 흐름

### 1. Home.vue (최근 템플릿)
```typescript
// 템플릿 로드 후 작성자 이름 로드
const ownerIds = templates.value.map((tpl) => tpl?.ownerId).filter(Boolean);
if (ownerIds.length > 0) {
  await loadAuthorNames(ownerIds); // useAuthorName 사용
}
```

### 2. TemplatesList.vue
```typescript
// 템플릿 로드 후 작성자 이름 로드
publicTemplatesList.value.forEach((tpl) => {
  loadAuthorName(tpl.ownerId); // useAuthorName 사용
});
```

### 3. PostListView.vue
```typescript
// 게시글에 authorName이 이미 저장되어 있음
// 게시글 생성 시 users 컬렉션에서 가져와서 저장
```

### 4. useAuthorName.ts
```typescript
// 현재 로그인한 사용자 ID 전달하여 본인 프로필 조회 가능하도록 함
const currentUserId = currentUser.value?.uid;
const profile = await getUserProfile(ownerId, currentUserId);

// 권한 오류 발생 시 "알 수 없음"으로 fallback 처리
```

## 권한 오류 처리

### 발생 가능한 경우
1. **공개되지 않은 프로필 조회**: `isPublicProfile === false`인 경우
2. **프로필이 없는 경우**: users 문서가 존재하지 않는 경우
3. **네트워크 오류**: 일시적인 네트워크 문제

### 처리 방식
- **권한 오류**: "알 수 없음"으로 fallback 처리 (에러 로그 없음)
- **프로필 없음**: "알 수 없음"으로 fallback 처리
- **네트워크 오류**: "알 수 없음"으로 fallback 처리 (에러 로그 출력)

## 테스트 체크리스트

### ✅ 권한 테스트
- [ ] `isPublicProfile === true`인 프로필은 로그인 없이 조회 가능
- [ ] `isPublicProfile === false`인 프로필은 본인만 조회 가능
- [ ] 본인 프로필은 `isPublicProfile` 값과 관계없이 항상 조회 가능
- [ ] 다른 사용자 프로필 수정 불가능 (권한 오류)

### ✅ 작성자 이름 표시 테스트
- [ ] Home 화면에서 템플릿 작성자 이름 정상 표시
- [ ] TemplatesList에서 템플릿 작성자 이름 정상 표시
- [ ] PostListView에서 게시글 작성자 이름 정상 표시
- [ ] 공개되지 않은 프로필 작성자는 "알 수 없음" 표시
- [ ] 프로필이 없는 작성자는 "알 수 없음" 표시

### ✅ Console 에러 확인
- [ ] "Missing or insufficient permissions" 에러 없음
- [ ] users 컬렉션 조회 관련 에러 없음
- [ ] 권한 오류는 정상적인 상황으로 처리되어 에러 로그 없음

## 마이그레이션 가이드

### 기존 users 문서 업데이트

기존 users 문서에 `isPublicProfile` 필드가 없다면 기본값으로 추가해야 합니다:

```javascript
// Firebase Console > Firestore > users 컬렉션에서 수동 실행
// 또는 Cloud Functions로 일괄 마이그레이션

const users = await db.collection('users').get();
users.forEach(async (doc) => {
  const data = doc.data();
  if (data.isPublicProfile === undefined) {
    await doc.ref.update({
      isPublicProfile: true, // 기본값: 공개 프로필
    });
  }
  
  // nickname을 displayName으로 마이그레이션 (선택사항)
  if (data.nickname && !data.displayName) {
    await doc.ref.update({
      displayName: data.nickname,
    });
  }
});
```

## 보안 고려사항

1. **민감 정보 분리**: `email`, `bio`, `myMembers`, `blockedMembers`는 users 컬렉션에 저장하지 않음
2. **공개 프로필 제어**: `isPublicProfile` 필드로 공개 여부 제어
3. **본인 프로필 보호**: 본인 프로필은 항상 조회 가능하도록 보장
4. **권한 오류 처리**: 권한 오류는 정상적인 상황으로 처리하여 UI 안정성 유지

## 다음 단계 (선택사항)

1. **프로필 공개 설정 UI**: 사용자가 `isPublicProfile`을 변경할 수 있는 UI 추가
2. **민감 정보 관리**: `bio`, `myMembers`, `blockedMembers`를 별도 컬렉션(`userPrivateData`)으로 분리
3. **프로필 이미지 최적화**: 이미지 리사이징 및 CDN 연동
4. **프로필 검색**: 공개 프로필만 검색 가능하도록 검색 기능 추가





