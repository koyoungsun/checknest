# Firestore 인덱스 설계표

## checklists 컬렉션 인덱스

### 사용 중인 쿼리 패턴 분석

| 쿼리 패턴 | 필터 조건 | 정렬 | 사용 위치 |
|---------|---------|------|---------|
| 1 | `ownerId == ?` | `createdAtNum DESC` | `loadMyChecklists` |
| 2 | `ownerId == ?` + `isCompleted == ?` | `createdAtNum DESC` | `loadMyChecklists(false/true)` |
| 3 | `members array-contains ?` | `createdAtNum DESC` | `loadSharedChecklists` |
| 4 | `members array-contains ?` + `isCompleted == ?` | `createdAtNum DESC` | `loadSharedChecklists(false/true)` |

### 필수 복합 인덱스 목록

#### 인덱스 1: ownerId + createdAtNum
```
Collection: checklists
Fields:
  - ownerId (Ascending)
  - createdAtNum (Descending)
Query ID: checklists_ownerId_createdAtNum
```

#### 인덱스 2: ownerId + isCompleted + createdAtNum
```
Collection: checklists
Fields:
  - ownerId (Ascending)
  - isCompleted (Ascending)
  - createdAtNum (Descending)
Query ID: checklists_ownerId_isCompleted_createdAtNum
```

#### 인덱스 3: members (array-contains) + createdAtNum
```
Collection: checklists
Fields:
  - members (Array)
  - createdAtNum (Descending)
Query ID: checklists_members_createdAtNum
```

#### 인덱스 4: members (array-contains) + isCompleted + createdAtNum
```
Collection: checklists
Fields:
  - members (Array)
  - isCompleted (Ascending)
  - createdAtNum (Descending)
Query ID: checklists_members_isCompleted_createdAtNum
```

### Fallback 전략

인덱스가 없을 경우를 대비한 fallback 쿼리 전략:

1. **인덱스 오류 감지**: `failed-precondition` 에러 코드 확인
2. **클라이언트 사이드 정렬**: 
   - 인덱스 없이 필터만 적용하여 조회
   - 클라이언트에서 `createdAtNum` 기준 정렬
   - 성능 저하 가능성 있으나 동작은 보장

**주의**: Fallback은 개발 단계에서만 사용하고, 프로덕션에서는 반드시 인덱스를 생성해야 합니다.

## boards 컬렉션 인덱스

### 사용 중인 쿼리 패턴 분석

| 쿼리 패턴 | 필터 조건 | 정렬 | 사용 위치 |
|---------|---------|------|---------|
| 1 | `isDeleted == false` | `isPinned DESC` + `createdAtNum DESC` | `getBoards()` (기본) |
| 2 | `category == ?` + `isDeleted == false` | `isPinned DESC` + `createdAtNum DESC` | `getBoards({ category })` |
| 3 | `authorId == ?` + `isDeleted == false` | `isPinned DESC` + `createdAtNum DESC` | `getBoards({ authorId })` |

### 필수 복합 인덱스 목록

#### 인덱스 1: isDeleted + isPinned + createdAtNum (기본)
```
Collection: boards
Fields:
  - isDeleted (Ascending)
  - isPinned (Descending)
  - createdAtNum (Descending)
Query ID: boards_isDeleted_isPinned_createdAtNum
```

#### 인덱스 2: category + isDeleted + isPinned + createdAtNum
```
Collection: boards
Fields:
  - category (Ascending)
  - isDeleted (Ascending)
  - isPinned (Descending)
  - createdAtNum (Descending)
Query ID: boards_category_isDeleted_isPinned_createdAtNum
```

#### 인덱스 3: authorId + isDeleted + isPinned + createdAtNum
```
Collection: boards
Fields:
  - authorId (Ascending)
  - isDeleted (Ascending)
  - isPinned (Descending)
  - createdAtNum (Descending)
Query ID: boards_authorId_isDeleted_isPinned_createdAtNum
```

## notifications 컬렉션 인덱스

### 사용 중인 쿼리 패턴 분석

| 쿼리 패턴 | 필터 조건 | 정렬 | 사용 위치 |
|---------|---------|------|---------|
| 1 | `userId == ?` | `createdAt DESC` | `getNotifications()` |
| 2 | `userId == ?` + `read == false` | - | `getUnreadNotificationCount()` |

### 필수 복합 인덱스 목록

#### 인덱스 1: userId + createdAt
```
Collection: notifications
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query ID: notifications_userId_createdAt
```

**주의**: 이 인덱스는 `getNotifications()` 함수에서 필수입니다. 인덱스가 없으면 `failed-precondition` 에러가 발생하며, 코드에서 빈 배열을 반환합니다.

## 인덱스 생성 방법

1. **Firebase Console**:
   - Firebase Console > Firestore > Indexes
   - "Create Index" 클릭
   - 위 표의 필드 순서대로 입력

2. **자동 생성**:
   - 쿼리 실행 시 `failed-precondition` 에러 발생
   - 에러 메시지의 링크를 클릭하여 자동 생성

3. **firestore.indexes.json** (권장):
   - 프로젝트 루트에 `firestore.indexes.json` 파일 생성
   - 위 인덱스 정의를 JSON 형식으로 작성
   - `firebase deploy --only firestore:indexes` 실행

