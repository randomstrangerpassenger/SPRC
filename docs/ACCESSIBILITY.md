# 접근성 가이드 (Accessibility Guide)

**Phase 3-3: 접근성 개선** 문서

## 목차
1. [이미 구현된 접근성 기능](#이미-구현된-접근성-기능)
2. [ARIA 사용 가이드](#aria-사용-가이드)
3. [키보드 네비게이션](#키보드-네비게이션)
4. [스크린 리더 지원](#스크린-리더-지원)
5. [접근성 체크리스트](#접근성-체크리스트)

---

## 이미 구현된 접근성 기능

### 1. **키보드 네비게이션** (`addKeyboardActivation`)
모든 interactive 요소를 키보드로 조작 가능

```typescript
import { addKeyboardActivation } from './a11yHelpers';

addKeyboardActivation(element, (e) => {
    // Enter 또는 Space 키로 활성화
    handleClick();
});
```

### 2. **포커스 트랩** (`createFocusTrap`)
모달 다이얼로그 내부에서만 포커스 이동

```typescript
import { createFocusTrap } from './a11yHelpers';

const cleanup = createFocusTrap(modalElement);

// 모달 닫을 때 정리
cleanup();
```

### 3. **스크린 리더 알림** (`announceToScreenReader`)
중요한 이벤트를 스크린 리더에 알림

```typescript
import { announceToScreenReader } from './a11yHelpers';

// 일반 알림
announceToScreenReader('계산이 완료되었습니다', 'polite');

// 긴급 알림
announceToScreenReader('오류가 발생했습니다', 'assertive');
```

### 4. **폼 에러 관리** (`linkFormError`, `clearFormError`)
입력 필드 에러를 접근성 있게 연결

```typescript
import { linkFormError, clearFormError } from './a11yHelpers';

// 에러 표시
linkFormError(inputElement, '필수 항목입니다');

// 에러 제거
clearFormError(inputElement);
```

### 5. **포커스 관리** (`FocusManager`)
모달 열림/닫힘 시 포커스 저장 및 복원

```typescript
import { FocusManager } from './a11yHelpers';

const focusManager = new FocusManager();

// 모달 열기 전
focusManager.saveFocus();

// 모달 닫기 후
focusManager.restoreFocus();
```

### 6. **색상 대비 검사** (`checkColorContrast`)
WCAG 2.0 기준 색상 대비 검증

```typescript
import { checkColorContrast } from './a11yHelpers';

const result = checkColorContrast('#000000', '#FFFFFF');
// { ratio: 21, passAA: true, passAAA: true }
```

### 7. **터치 타겟 크기 검사** (`checkTouchTargetSize`)
최소 44x44px 권장 크기 확인

```typescript
import { checkTouchTargetSize } from './a11yHelpers';

const result = checkTouchTargetSize(buttonElement);
// { width: 48, height: 48, isSufficient: true }
```

---

## ARIA 사용 가이드

### ARIA Roles

#### 1. **Landmarks**
```html
<!-- 주요 콘텐츠 영역 -->
<main role="main">
    <h1>Portfolio Calculator</h1>
    <!-- ... -->
</main>

<!-- 네비게이션 -->
<nav role="navigation" aria-label="Main navigation">
    <!-- ... -->
</nav>

<!-- 보조 콘텐츠 -->
<aside role="complementary">
    <!-- ... -->
</aside>
```

#### 2. **Interactive Elements**
```html
<!-- 버튼 (키보드로 활성화 가능) -->
<div role="button" tabindex="0"
     aria-label="Add new stock">
    +
</div>

<!-- 탭 -->
<div role="tablist">
    <button role="tab" aria-selected="true"
            aria-controls="panel1">
        Tab 1
    </button>
</div>
<div role="tabpanel" id="panel1">
    <!-- ... -->
</div>

<!-- 진행률 표시 -->
<div role="progressbar"
     aria-valuenow="70"
     aria-valuemin="0"
     aria-valuemax="100">
    70%
</div>
```

### ARIA Properties

#### 1. **aria-label / aria-labelledby**
```html
<!-- 명시적 라벨 -->
<button aria-label="종목 삭제">
    <span aria-hidden="true">×</span>
</button>

<!-- 다른 요소로 라벨 지정 -->
<h2 id="dialog-title">설정</h2>
<div role="dialog" aria-labelledby="dialog-title">
    <!-- ... -->
</div>
```

#### 2. **aria-describedby**
```html
<!-- 도움말 텍스트 연결 -->
<input type="number"
       aria-describedby="ratio-help">
<small id="ratio-help">
    목표 비율을 백분율로 입력하세요
</small>
```

#### 3. **aria-live**
```html
<!-- 실시간 업데이트 영역 -->
<div id="aria-announcer"
     aria-live="polite"
     aria-atomic="true"
     class="sr-only">
</div>
```

#### 4. **aria-hidden**
```html
<!-- 장식용 아이콘 숨김 -->
<span aria-hidden="true">🔔</span>
<span class="sr-only">알림</span>
```

---

## 키보드 네비게이션

### 기본 키보드 단축키

| 키 | 기능 |
|---|---|
| **Tab** | 다음 요소로 포커스 이동 |
| **Shift + Tab** | 이전 요소로 포커스 이동 |
| **Enter** | 버튼/링크 활성화 |
| **Space** | 버튼 활성화, 체크박스 토글 |
| **Escape** | 모달/드롭다운 닫기 |
| **Arrow Keys** | 라디오 버튼, 탭 네비게이션 |

### 포커스 가시성 (CSS)

```css
/* 포커스 아웃라인 항상 표시 */
:focus {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
}

/* 마우스 클릭 시에는 아웃라인 제거 (선택사항) */
:focus:not(:focus-visible) {
    outline: none;
}

/* 키보드 포커스 시에만 표시 */
:focus-visible {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
}
```

### 스킵 링크

```typescript
import { createSkipLink } from './a11yHelpers';

// 페이지 상단에 스킵 링크 추가
const skipLink = createSkipLink('main-content', '메인 콘텐츠로 이동');
document.body.insertBefore(skipLink, document.body.firstChild);
```

```css
/* 스킵 링크 CSS */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

---

## 스크린 리더 지원

### 스크린 리더 전용 텍스트

```html
<!-- 시각적으로 숨기되 스크린 리더로는 읽음 -->
<style>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>

<button>
    <span aria-hidden="true">×</span>
    <span class="sr-only">종목 삭제</span>
</button>
```

### 동적 콘텐츠 알림

```typescript
import { announceToScreenReader } from './a11yHelpers';

// 성공 메시지
announceToScreenReader('종목이 추가되었습니다', 'polite');

// 에러 메시지 (즉시 알림)
announceToScreenReader('입력값이 잘못되었습니다', 'assertive');

// 로딩 상태
announceToScreenReader('계산 중입니다...', 'polite');
```

### 테이블 접근성

```html
<!-- 데이터 테이블 -->
<table>
    <caption>포트폴리오 종목 목록</caption>
    <thead>
        <tr>
            <th scope="col">종목명</th>
            <th scope="col">티커</th>
            <th scope="col">목표 비율</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Apple Inc.</th>
            <td>AAPL</td>
            <td>30%</td>
        </tr>
    </tbody>
</table>
```

---

## 접근성 체크리스트

### ✅ 키보드 접근성
- [ ] 모든 interactive 요소가 키보드로 접근 가능한가?
- [ ] Tab 순서가 논리적인가?
- [ ] 포커스가 시각적으로 명확한가?
- [ ] Escape 키로 모달을 닫을 수 있는가?
- [ ] 모달 내부에서 포커스 트랩이 작동하는가?

### ✅ ARIA 레이블
- [ ] 모든 폼 필드에 레이블이 있는가?
- [ ] 아이콘 버튼에 aria-label이 있는가?
- [ ] 에러 메시지가 aria-describedby로 연결되어 있는가?
- [ ] 동적 콘텐츠에 aria-live가 설정되어 있는가?
- [ ] 장식용 요소에 aria-hidden="true"가 있는가?

### ✅ 스크린 리더
- [ ] 스킵 링크가 제공되는가?
- [ ] 스크린 리더 전용 텍스트(.sr-only)가 적절히 사용되는가?
- [ ] 테이블에 caption이 있는가?
- [ ] 이미지에 대체 텍스트(alt)가 있는가?
- [ ] ARIA live region이 작동하는가?

### ✅ 색상 및 대비
- [ ] 색상 대비가 WCAG AA 기준(4.5:1)을 만족하는가?
- [ ] 색상만으로 정보를 전달하지 않는가?
- [ ] 다크 모드에서도 대비가 충분한가?

### ✅ 모바일 접근성
- [ ] 터치 타겟이 최소 44x44px인가?
- [ ] 핀치 줌이 가능한가?
- [ ] 가로/세로 모드 모두 지원하는가?
- [ ] 터치 제스처가 직관적인가?

### ✅ 폼 접근성
- [ ] 에러 메시지가 명확한가?
- [ ] 필수 필드가 명시되어 있는가?
- [ ] 자동완성이 지원되는가 (autocomplete)?
- [ ] 에러 시 포커스가 해당 필드로 이동하는가?

---

## 접근성 테스트 도구

### 1. **자동화 테스트**
- [axe DevTools](https://www.deque.com/axe/devtools/) - 브라우저 확장
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [WAVE](https://wave.webaim.org/) - 웹 접근성 평가 도구

### 2. **스크린 리더 테스트**
- **Windows**: NVDA (무료), JAWS
- **macOS**: VoiceOver (기본 제공)
- **Linux**: Orca

### 3. **키보드 테스트**
1. 마우스 연결을 해제
2. Tab 키만으로 모든 기능 사용 시도
3. 포커스가 보이지 않는 요소가 있는지 확인

---

## Best Practices

### 1. **시맨틱 HTML 사용**

#### ❌ 나쁜 예
```html
<div onclick="submit()">Submit</div>
```

#### ✅ 좋은 예
```html
<button type="submit">Submit</button>
```

### 2. **명확한 라벨 제공**

#### ❌ 나쁜 예
```html
<button>×</button>
```

#### ✅ 좋은 예
```html
<button aria-label="종목 삭제">
    <span aria-hidden="true">×</span>
</button>
```

### 3. **에러 메시지 연결**

#### ❌ 나쁜 예
```html
<input type="number">
<div class="error">잘못된 입력입니다</div>
```

#### ✅ 좋은 예
```html
<input type="number"
       aria-describedby="error-msg"
       aria-invalid="true">
<div id="error-msg" role="alert">
    잘못된 입력입니다
</div>
```

---

## 참고 자료

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Last Updated**: Phase 3-3 접근성 개선
