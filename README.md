# 포트폴리오 리밸런싱 계산기 (Portfolio Rebalancing Calculator)

주식 포트폴리오의 리밸런싱을 계산하고 최적의 투자 전략을 제공하는 웹 애플리케이션입니다.

## 최근 업데이트

### [2025-11-03] 간단 계산 모드 스크롤 시 입력값 초기화 문제 해결

#### 문제 상황
간단 계산 모드에서 보유 금액 입력칸에 숫자를 입력하고 스크롤을 내리면 입력했던 값이 모두 초기화되는 문제가 있었습니다.

#### 원인 분석
- 가상 스크롤(Virtual Scroll) 사용으로 성능 최적화를 위해 보이는 영역만 렌더링
- 스크롤 시 DOM이 재생성되면서 입력 중인 값이 손실됨
- `change` 이벤트는 input이 포커스를 잃을 때만 발생하므로, 입력 중 스크롤 시 값이 state에 저장되지 않음
- 재렌더링 시 이전 state 값으로 input이 생성되어 사용자가 입력한 값이 사라짐

#### 해결 방법

**1. 스크롤 재렌더링 전 입력값 보존 (`js/view.js`)**
```javascript
// _onScroll 함수에서 재렌더링 전 현재 DOM의 모든 입력값을 _virtualData에 저장
const currentInputRows = this._scrollContent.querySelectorAll('.virtual-row-inputs[data-id]');
currentInputRows.forEach(row => {
    // 각 input 필드의 현재 값을 읽어서 _virtualData에 반영
    const inputs = row.querySelectorAll('input[data-field]');
    inputs.forEach(input => {
        this._virtualData[stockIndex][field] = value;
    });
});
```

**2. Change 이벤트 시 virtualData 동기화 (`js/controller.js`)**
```javascript
// manualAmount 변경 시 state뿐만 아니라 view의 _virtualData도 업데이트
if (field === 'manualAmount') {
    this.view.updateStockInVirtualData(stockId, field, value);
    this.debouncedSave();
    return;
}
```

**3. 단일 속성 업데이트 메서드 추가 (`js/view.js`)**
```javascript
// 재렌더링 없이 특정 종목의 속성만 _virtualData에서 업데이트
updateStockInVirtualData(stockId, field, value) {
    const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
    if (stockIndex !== -1) {
        this._virtualData[stockIndex][field] = value;
    }
}
```

#### 기술적 개선
- **입력값 손실 방지**: 스크롤로 인한 DOM 재생성 전에 사용자 입력값을 데이터 모델에 저장
- **성능 유지**: 재렌더링을 건너뛰면서도 데이터 동기화 보장
- **일관성 보장**: state와 virtualData 간 동기화로 데이터 일관성 유지

#### 결과
- 사용자가 입력 중인 값이 스크롤 시에도 유지됨
- 입력 후 바로 스크롤해도 값이 보존됨
- 성능 저하 없이 사용자 경험 개선

---

### [2025-11-02] 간단 계산 모드 대폭 간소화

#### 변경 배경
기존 간단 계산 모드는 추가 매수 모드와 입력 필드가 동일하여 "간단"하지 않았습니다. 리밸런싱 계산기의 핵심은 목표 비율에 맞춰 투자하는 것인데, 복잡한 거래 내역 관리는 사용자에게 부담이 되었습니다.

#### 주요 변경사항

1. **입력 필드 간소화**
   - 제거: 섹터, 현재가, 고정 매수, 거래 내역 관리
   - 유지: 종목명, 티커, 목표 비율, **보유 금액 (신규)**
   - 간단 모드 전용 입력: 각 종목의 현재 보유 금액을 직접 입력

2. **거래 내역 없이 금액만 입력**
   - 복잡한 거래 내역 관리 버튼 대신 **보유 금액 입력칸** 추가
   - 수량, 평균 단가, 거래 내역 등 세부 정보 불필요
   - 현재 보유 중인 총 금액만 입력하면 즉시 계산 가능

3. **목표 비율 기반 리밸런싱**
   - 목표 비율에 맞춰 추가 투자금 배분
   - 목표 금액 = (현재 총액 + 추가 투자금) × 목표 비율
   - 추가 구매 금액 = 목표 금액 - 현재 금액

4. **결과 화면 개선**
   - 현재 평가액, 현재 비율, 목표 비율, 추가 구매 금액을 한눈에 표시
   - 목표 비율에 맞추기 위한 구체적인 구매 가이드 제공

#### 사용 방법

1. **간단 계산 모드** 선택
2. 각 종목의 **목표 비율** 입력 (합계 100%)
3. 각 종목의 **보유 금액** 직접 입력 (예: SPY 300만원, QQQ 200만원)
4. **추가 투자 금액** 입력
5. **계산하기** 클릭!

#### 예시

**시나리오**: SPY 60%, QQQ 40% 비율로 100만원 추가 투자

**현재 보유 상황:**
- SPY: 300만원 보유 (현재 비율 60%)
- QQQ: 200만원 보유 (현재 비율 40%)

**입력:**
- SPY 목표 비율: 60%, 보유 금액: 3,000,000원
- QQQ 목표 비율: 40%, 보유 금액: 2,000,000원
- 추가 투자금: 1,000,000원

**결과:**
- 총 투자금: 600만원
- SPY 목표 금액: 360만원 → 60만원 추가 매수
- QQQ 목표 금액: 240만원 → 40만원 추가 매수

---

### [2025-11-02] 금액 기반 수량 계산 모드 추가

#### 변경 배경
기존 계산기는 수량과 단가를 입력하는 방식으로 거래를 기록했습니다. 하지만 이 방식은 다음과 같은 문제가 있었습니다:

- 수량 입력 시 소수점 4번째 자리에서 반올림되어 정확한 계산이 불가능
- 소수점 거래가 활성화된 이후 대부분의 사용자가 금액 기준으로 주식을 매수
- 실제 거래 내역과 계산기 입력 방식의 불일치

#### 주요 변경사항

1. **거래 입력 방식 선택 기능**
   - 수량 입력 모드 (기존): 수량 × 단가 방식
   - 금액 입력 모드 (신규): 총 금액 ÷ 단가 = 수량 (자동 계산)

2. **정밀한 수량 계산**
   - Decimal.js 라이브러리를 사용하여 부동소수점 연산 오류 방지
   - 금액 ÷ 단가로 수량을 역산하여 소수점 제한 문제 해결
   - 계산된 수량을 소수점 8자리까지 정확하게 표시 및 저장

3. **실시간 수량 계산 미리보기**
   - 금액 입력 모드에서 총 금액과 단가 입력 시 자동으로 수량 계산
   - 사용자가 실제로 매수할 수량을 미리 확인 가능

#### 기술적 개선

**수정된 파일:**
- `index.html`: 거래 입력 폼에 입력 방식 선택 UI 추가
- `js/eventBinder.js`: 입력 모드 전환 및 실시간 수량 계산 로직 추가
- `js/controller.js`: 금액 기반 수량 역산 로직 구현 (Decimal.js 활용)

**계산 방식:**
```javascript
// 기존 방식 (수량 입력)
총 금액 = 수량 × 단가
문제: 수량의 소수점 제한으로 인한 정확도 손실

// 개선된 방식 (금액 입력)
수량 = 총 금액 ÷ 단가  // Decimal.js로 정밀 계산
장점: 실제 투자 금액을 정확하게 반영
```

#### 사용 방법

1. 종목의 "거래 내역 관리" 버튼 클릭
2. "새 거래 추가" 섹션에서 입력 방식 선택
   - **수량 입력**: 보유 수량을 정확히 아는 경우
   - **금액 입력**: 투자 금액 기준으로 매수한 경우 (권장)
3. 금액 입력 모드 선택 시:
   - 총 금액: 실제 투자한 금액 입력
   - 단가: 매수/매도 단가 입력
   - 계산된 수량이 자동으로 표시됨
4. 거래 추가 클릭

#### 예시

**시나리오**: 150,000원짜리 주식을 50만원어치 매수

- **기존 방식 (수량 입력)**
  - 수량: 3.3333 입력 → 4번째 자리 반올림 → 3.333 저장
  - 총액: 499,950원 (실제 투자액과 50원 차이)

- **개선된 방식 (금액 입력)**
  - 총 금액: 500,000원 입력
  - 단가: 150,000원 입력
  - 자동 계산된 수량: 3.33333333 (정확)
  - 총액: 500,000원 (정확)

---

## 프로젝트 구조

```
SPRC/
├── index.html                   # 메인 HTML
├── style.css                    # 스타일시트
├── src/
│   ├── main.ts                 # 애플리케이션 진입점
│   ├── types.ts                # TypeScript 타입 정의
│   ├── calculator.ts           # 계산 로직 (Decimal.js 활용)
│   ├── state.ts                # 상태 관리 (IndexedDB)
│   ├── utils.ts                # 유틸리티 함수
│   │
│   ├── view/                   # View Layer (UI 렌더링)
│   │   ├── view.ts            # 메인 View 클래스 (조정자)
│   │   ├── EventEmitter.ts    # Pub/Sub 이벤트 시스템
│   │   ├── ModalManager.ts    # 모달 관리 (접근성 강화)
│   │   ├── VirtualScrollManager.ts  # 가상 스크롤 (성능 최적화)
│   │   └── ResultsRenderer.ts # 결과 및 차트 렌더링
│   │
│   ├── controller/             # Controller Layer (비즈니스 로직)
│   │   ├── controller.ts      # 메인 Controller 클래스 (조정자)
│   │   ├── PortfolioManager.ts    # 포트폴리오 CRUD
│   │   ├── StockManager.ts        # 종목 관리
│   │   ├── TransactionManager.ts  # 거래 내역 관리
│   │   ├── CalculationManager.ts  # 계산 및 API 호출
│   │   └── DataManager.ts         # 데이터 가져오기/내보내기
│   │
│   ├── apiService.ts           # API 호출 (재시도 로직, 에러 처리)
│   ├── a11yHelpers.ts          # 접근성 유틸리티 (WCAG 2.0)
│   ├── i18nEnhancements.ts     # 국제화 (Intl API)
│   ├── eventBinder.ts          # DOM 이벤트 바인딩
│   └── domPurify.d.ts          # DOMPurify 타입 정의
│
├── e2e/
│   └── app.spec.ts             # E2E 테스트 (Playwright)
├── PERFORMANCE.md              # 성능 최적화 가이드
└── package.json                # 프로젝트 의존성
```

### 아키텍처 개요

이 프로젝트는 **모듈화된 MVC 아키텍처**를 따릅니다:

- **View Layer**: UI 렌더링, 이벤트 발행 (비즈니스 로직 없음)
  - 위임 패턴으로 역할 분리 (EventEmitter, ModalManager, VirtualScrollManager, ResultsRenderer)

- **Controller Layer**: 비즈니스 로직, API 호출, 상태 업데이트
  - 책임별로 모듈 분리 (Portfolio, Stock, Transaction, Calculation, Data 관리자)

- **Model Layer**: 상태 관리 (IndexedDB), 계산 로직 (Calculator)

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 주요 기능

- 포트폴리오 다중 관리
- 추가 매수/매도 리밸런싱 계산
- **간단 계산 모드** (거래 내역 없이 금액만 입력하여 목표 비율 리밸런싱)
- 섹터별 분석
- 거래 내역 관리 (수량/금액 입력 모드 지원)
- KRW/USD 통화 전환
- 현재가 자동 조회 (API 연동)
- 다크 모드 지원
- 데이터 가져오기/내보내기

## 기술 스택

### 코어
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 및 개발 서버
- **Decimal.js** - 정밀 계산 (부동소수점 오류 방지)

### UI & 성능
- **Chart.js** - 데이터 시각화 (lazy loading)
- **Virtual Scrolling** - 대량 데이터 렌더링 최적화
- **RequestAnimationFrame** - 부드러운 UI 업데이트

### 보안 & 접근성
- **DOMPurify** - XSS 방지
- **WCAG 2.0 준수** - 접근성 강화 (FocusManager, ARIA 속성)

### 국제화 & API
- **Intl API** - 로케일 기반 숫자/날짜/통화 포맷팅
- **API Service** - 재시도 로직, 구조화된 에러 처리

### 테스팅
- **Vitest** - 유닛 테스트
- **Playwright** - E2E 테스트

## 라이선스

MIT License
