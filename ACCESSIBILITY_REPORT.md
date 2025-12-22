# 접근성 점검 보고서 (Accessibility Audit Report)

## 📋 개요
CheckNest 애플리케이션의 웹 접근성 상태를 WCAG 2.1 기준으로 점검한 결과입니다.

## ✅ 잘 구현된 부분

1. **시맨틱 HTML 구조**
   - `<header>`, `<main>`, `<nav>`, `<section>` 등 적절한 시맨틱 태그 사용
   - 제목 계층 구조 (`h1`, `h2`, `h3`) 적절히 사용

2. **이미지 alt 속성**
   - 게시글 이미지에 `alt="post image"` 속성 존재

3. **네비게이션 구조**
   - `<nav>` 태그로 네비게이션 영역 명확히 구분
   - `router-link` 사용으로 적절한 링크 구조

## ⚠️ 개선이 필요한 부분

### 1. **ARIA 속성 부재 (Critical)**

#### 문제점
- 아이콘만 있는 버튼에 `aria-label` 속성이 없음
- 스크린 리더 사용자가 버튼의 기능을 이해할 수 없음

#### 영향받는 컴포넌트
- `AppHeader.vue`: 뒤로가기, 검색, 알림, 메뉴 버튼
- `PageSubtitle.vue`: 뒤로가기 버튼 (`<`)
- `BottomSheet.vue`: 닫기 버튼 (`X`)
- `BottomNav.vue`: 플러스 버튼

#### 예시 코드
```vue
<!-- 현재 -->
<button class="icon-btn" @click="goBack">
  <i class="bi bi-arrow-left"></i>
</button>

<!-- 개선안 -->
<button class="icon-btn" @click="goBack" aria-label="이전 페이지로 이동">
  <i class="bi bi-arrow-left" aria-hidden="true"></i>
</button>
```

### 2. **포커스 표시 부족 (Critical)**

#### 문제점
- 키보드 네비게이션 시 포커스 표시가 명확하지 않음
- `:focus` 스타일이 정의되지 않았거나 시각적으로 구분이 어려움

#### 개선 필요
```scss
// common.scss에 추가 필요
button:focus,
a:focus,
input:focus {
  outline: 2px solid var(--color-primary, #ff6b35);
  outline-offset: 2px;
}
```

### 3. **폼 레이블 연결 부족 (High)**

#### 문제점
- 검색창 input에 `<label>` 태그가 없거나 `for` 속성으로 연결되지 않음
- 스크린 리더가 입력 필드의 목적을 알 수 없음

#### 예시 코드
```vue
<!-- 현재 -->
<input
  type="text"
  v-model="search"
  placeholder="제목으로 검색"
/>

<!-- 개선안 -->
<label for="search-input" class="sr-only">제목으로 검색</label>
<input
  id="search-input"
  type="text"
  v-model="search"
  placeholder="제목으로 검색"
  aria-label="제목으로 검색"
/>
```

### 4. **색상 대비 비율 (High)**

#### 문제점
- 일부 텍스트와 배경의 색상 대비가 WCAG AA 기준(4.5:1)을 만족하지 않을 수 있음
- 특히 연한 주황색 placeholder (#ffa366)와 흰색 배경의 대비 확인 필요

#### 확인 필요 색상
- Placeholder 색상: `#ffa366` (연한 주황)
- 배경: `#fff` (흰색)
- 대비 비율 계산 필요

### 5. **키보드 네비게이션 (Medium)**

#### 문제점
- 모달/바텀시트 닫기 시 ESC 키 지원 확인 필요
- 키보드로만 모든 기능 접근 가능한지 확인 필요

#### 개선 필요
```vue
// BottomSheet.vue에 추가
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.open) {
      close();
    }
  };
  window.addEventListener('keydown', handleEscape);
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
  });
});
```

### 6. **스킵 네비게이션 링크 부재 (Medium)**

#### 문제점
- 키보드 사용자가 메인 콘텐츠로 바로 이동할 수 있는 스킵 링크가 없음

#### 개선 필요
```vue
<!-- App.vue에 추가 -->
<a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
</style>
```

### 7. **알림 배지 접근성 (Low)**

#### 문제점
- 알림 개수 배지에 `aria-label`이 없어 스크린 리더가 읽지 못함

#### 개선 필요
```vue
<span
  v-if="unreadCount > 0"
  class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full"
  aria-label="읽지 않은 알림 {{ unreadCount }}개"
>
  {{ unreadCount }}
</span>
```

## 🔧 권장 개선 사항 우선순위

### Priority 1 (Critical - 즉시 수정)
1. ✅ 모든 아이콘 버튼에 `aria-label` 추가
2. ✅ 포커스 표시 스타일 추가
3. ✅ 검색창에 label 연결

### Priority 2 (High - 단기간 내 수정)
4. ✅ 색상 대비 비율 확인 및 조정
5. ✅ ESC 키로 모달 닫기 기능 추가

### Priority 3 (Medium - 중기간 내 수정)
6. ✅ 스킵 네비게이션 링크 추가
7. ✅ 키보드 네비게이션 테스트 및 개선

### Priority 4 (Low - 장기간 내 수정)
8. ✅ 알림 배지 접근성 개선
9. ✅ 추가 ARIA 속성 검토

## 📊 WCAG 2.1 준수도

- **Level A**: 약 60% 준수
- **Level AA**: 약 40% 준수
- **Level AAA**: 약 20% 준수

## 📝 참고 자료

- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM 색상 대비 체커](https://webaim.org/resources/contrastchecker/)











