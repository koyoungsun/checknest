# CheckNest Firestore 데이터 구조 가이드

이 문서는 CheckNest 프로젝트의 Firestore 데이터 구조와 사용법을 설명합니다.

## 📁 폴더 구조

```
src/
├── types/              # TypeScript 타입 정의
│   ├── checklist.ts
│   ├── item.ts
│   ├── chat.ts
│   └── template.ts
│
├── services/           # Firestore CRUD 서비스
│   ├── checklists.ts
│   ├── items.ts
│   ├── chats.ts
│   └── templates.ts
│
├── composables/        # Vue Composable (반응형 상태 관리)
│   ├── useChecklists.ts
│   ├── useItems.ts
│   ├── useChats.ts
│   └── useTemplates.ts
│
├── utils/              # 유틸리티 함수
│   └── seedData.ts    # 샘플 데이터 생성
│
└── examples/           # 사용 예시 컴포넌트
    ├── ChecklistExample.vue
    ├── ChecklistDetailExample.vue
    └── TemplateExample.vue
```

## 🗄️ Firestore 컬렉션 구조

### 1. Checklists (체크리스트)

```typescript
{
  id: string;
  ownerId: string;              // 소유자 UID
  title: string;                 // 제목
  description: string;           // 설명
  dueDate: Timestamp | null;     // 마감일
  createdAt: Timestamp;          // 생성일
  updatedAt: Timestamp;          // 수정일
  isCompleted: boolean;          // 완료 여부
  progress: number;              // 진행률 (0-100)
  members: string[];             // 멤버 UID 배열
  rolesEnabled: boolean;         // 역할 활성화 여부
  templateId: string | null;     // 템플릿 ID (템플릿에서 생성된 경우)
}
```

### 2. Items (항목)

```typescript
{
  id: string;
  checklistId: string;           // 체크리스트 ID
  name: string;                   // 항목 이름
  isDone: boolean;                // 완료 여부
  assignedTo: string | null;      // 담당자 UID
  order: number;                  // 순서
  createdAt: Timestamp;           // 생성일
  updatedAt: Timestamp;           // 수정일
}
```

### 3. Chats (채팅)

```typescript
{
  id: string;
  checklistId: string;            // 체크리스트 ID
  userId: string;                  // 작성자 UID
  message: string;                 // 메시지 내용
  createdAt: Timestamp;            // 생성일
  system: boolean;                 // 시스템 메시지 여부
}
```

### 4. Templates (템플릿)

```typescript
{
  id: string;
  title: string;                   // 템플릿 제목
  description: string;             // 설명
  category: string;                // 카테고리
  items: {                         // 항목 배열
    name: string;
    order: number;
  }[];
  createdAt: Timestamp;            // 생성일
}
```

## 🚀 사용법

### 1. 체크리스트 관리

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useChecklists } from "@/composables/useChecklists";

const {
  checklists,
  loading,
  error,
  myChecklists,
  loadChecklists,
  addChecklist,
  editChecklist,
  removeChecklist,
} = useChecklists();

onMounted(() => {
  loadChecklists();
});

// 체크리스트 생성
const handleCreate = async () => {
  await addChecklist({
    title: "새 체크리스트",
    description: "설명",
    dueDate: new Date("2024-12-31"),
  });
};

// 체크리스트 수정
const handleUpdate = async (id: string) => {
  await editChecklist(id, {
    title: "수정된 제목",
    progress: 50,
  });
};

// 체크리스트 삭제
const handleDelete = async (id: string) => {
  await removeChecklist(id);
};
</script>
```

### 2. 항목 관리

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useItems } from "@/composables/useItems";

const checklistId = "checklist-id-here";
const {
  items,
  loading,
  progress,
  completedItems,
  pendingItems,
  loadItems,
  addItem,
  toggleItem,
  removeItem,
} = useItems(checklistId);

onMounted(() => {
  loadItems();
});

// 항목 추가
const handleAddItem = async () => {
  await addItem({
    name: "새 항목",
    order: items.value.length + 1,
    isDone: false,
  });
};

// 항목 완료 토글
const handleToggle = async (id: string) => {
  await toggleItem(id);
};
</script>
```

### 3. 채팅 관리

```vue
<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import { useChats } from "@/composables/useChats";

const { currentUser } = useAuth();
const checklistId = "checklist-id-here";
const { chats, sendChat } = useChats(checklistId);

// 메시지 전송
const handleSendMessage = async (message: string) => {
  if (!currentUser.value) return;
  
  await sendChat({
    userId: currentUser.value.uid,
    message,
    system: false,
  });
};
</script>
```

### 4. 템플릿 관리

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useTemplates } from "@/composables/useTemplates";

const { currentUser } = useAuth();
const {
  templates,
  loading,
  loadTemplates,
  addTemplate,
  createChecklist,
} = useTemplates();

onMounted(() => {
  loadTemplates();
});

// 템플릿 생성
const handleCreateTemplate = async () => {
  await addTemplate({
    title: "새 템플릿",
    description: "설명",
    category: "생활",
    items: [
      { name: "항목 1", order: 1 },
      { name: "항목 2", order: 2 },
    ],
  });
};

// 템플릿으로부터 체크리스트 생성
const handleUseTemplate = async (templateId: string) => {
  if (!currentUser.value) return;
  
  const checklistId = await createChecklist(
    templateId,
    currentUser.value.uid,
    "템플릿에서 생성된 체크리스트"
  );
  // 체크리스트 상세 페이지로 이동
};
</script>
```

## 📊 진행률 자동 계산

항목의 완료 상태가 변경되면 체크리스트의 진행률이 자동으로 계산되고 업데이트됩니다.

- 항목 추가/삭제 시
- 항목 완료 상태 변경 시
- `updateChecklistProgress()` 함수가 자동 호출됨

## 🔄 실시간 업데이트

채팅은 Firestore의 `onSnapshot`을 사용하여 실시간으로 업데이트됩니다.

```typescript
// useChats composable에서 자동으로 실시간 구독
const { chats } = useChats(checklistId);
// chats는 자동으로 업데이트됨
```

## 🌱 샘플 데이터 생성

개발 환경에서 샘플 데이터를 생성하려면:

```typescript
import { runSeed } from "@/utils/seedData";
import { useAuth } from "@/composables/useAuth";

const { currentUser } = useAuth();

// 샘플 데이터 생성
if (currentUser.value) {
  await runSeed(currentUser.value.uid);
}
```

## 📝 주요 기능

### 체크리스트
- ✅ CRUD 작업 (생성, 조회, 수정, 삭제)
- ✅ 소유자/멤버 필터링
- ✅ 진행률 자동 계산
- ✅ 완료 상태 관리

### 항목
- ✅ CRUD 작업
- ✅ 순서 관리
- ✅ 담당자 할당
- ✅ 완료 토글

### 채팅
- ✅ 실시간 메시지
- ✅ 시스템 메시지
- ✅ 체크리스트별 채팅

### 템플릿
- ✅ 템플릿 생성/관리
- ✅ 템플릿으로부터 체크리스트 생성
- ✅ 카테고리별 그룹화

## 🔐 보안 규칙 예시

Firestore 보안 규칙 예시:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Checklists
    match /checklists/{checklistId} {
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.members);
      allow create: if request.auth != null && 
        request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Items
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Templates
    match /templates/{templateId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## 📚 추가 리소스

- 예시 컴포넌트: `src/examples/`
- 타입 정의: `src/types/`
- 서비스 함수: `src/services/`
- Composable: `src/composables/`

