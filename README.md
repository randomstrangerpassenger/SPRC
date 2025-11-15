# 포트폴리오 리밸런싱 계산기 (Portfolio Rebalancing Calculator)

주식 포트폴리오의 리밸런싱을 계산하고 최적의 투자 전략을 제공하는 웹 애플리케이션입니다.

## 최근 업데이트

### [2025-11-14] 리팩토링 로드맵 완료 - 안정성 및 아키텍처 개선

전체 코드베이스에 대한 포괄적인 리팩토링을 완료했습니다. 이번 업데이트는 **안정성 확보 → 구조 개선 → 아키텍처 진화**의 3단계 접근 방식을 따랐습니다.

#### Phase 1.2: 코드 품질 마무리 - 컨벤션 통일 및 함수 분해

**목적**: Phase 1 리팩토링 로드맵의 남은 항목들을 완료하여 코드 품질 기초 정비 마무리

**주요 변경사항:**

1. **Phase 1-1: Constructor 파라미터의 `private`을 `#` 필드로 통일**
   - 모든 Manager 클래스 (6개) 리팩토링
     - StockManager, TransactionManager, PortfolioManager
     - SnapshotManager, DataManager, CalculationManager
   - 일관된 private 필드 선언 방식 적용
   - TypeScript의 최신 private 필드 문법 사용

**Before:**
```typescript
class StockManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}
}
```

**After:**
```typescript
class StockManager {
    #state: PortfolioState;
    #view: PortfolioView;

    constructor(
        state: PortfolioState,
        view: PortfolioView
    ) {
        this.#state = state;
        this.#view = view;
    }
}
```

2. **Phase 3-6: 불안전한 타입 단언 제거**
   - `(result as any)` 패턴을 `FetchStockResult` 타입으로 교체
   - CalculationManager의 `handleFetchAllPrices` 메서드 타입 안전성 강화
   - 명시적 타입 어노테이션으로 런타임 오류 방지

3. **Phase 1-3: Calculator.calculateStockMetrics() 함수 분해**
   - 82줄 → 12줄로 대폭 간소화 (85% 감소)
   - 헬퍼 함수 추출:
     - `aggregateTransactions`: 거래 내역 집계 (매수/매도/배당)
     - `calculateStockIndicators`: 지표 계산 (수량, 평균단가, 손익 등)
   - 단일 책임 원칙 적용으로 테스트 용이성 향상

**효과:**
- ✅ 코딩 컨벤션 통일로 일관성 확보
- ✅ 타입 안전성 강화로 런타임 오류 방지
- ✅ 함수 분해로 가독성 및 유지보수성 향상
- ✅ 테스트 가능한 작은 단위 함수로 분리

#### Phase 1.3: JSDoc 및 주석 국제화

**목적**: 모든 JSDoc과 inline 주석을 영어로 통일하여 국제 협업 환경 지원 및 코드 문서화 표준 준수

**주요 변경사항:**

1. **calculator.ts 완전 영어화**
   - 모든 JSDoc 주석 영어 변환
   - Inline 주석 영어 변환 (알고리즘 설명, 최적화 노트 등)
   - 예시:
     - "모든 거래 ID를 조합하여 중간 거래 수정/삭제도 감지" → "Combine all transaction IDs to detect modifications/deletions of intermediate transactions"
     - "@description 포트폴리오 상태를 계산하고 캐싱합니다." → "@description Calculates and caches portfolio state"

2. **모든 Manager 클래스 JSDoc 영어화 (6개 파일)**
   - **CalculationManager.ts**: "계산, API, 통화 변환 관리" → "Manages calculations, API calls, and currency conversions"
   - **DataManager.ts**: "데이터 가져오기/내보내기, 초기화 관리" → "Manages data import/export and initialization"
   - **SnapshotManager.ts**: "포트폴리오 스냅샷 관리" → "Manages portfolio snapshots (performance history, snapshot lists, etc.)"
   - **PortfolioManager.ts**: "포트폴리오 CRUD 작업 관리" → "Manages portfolio CRUD operations"
   - **TransactionManager.ts**: "거래 내역 추가, 삭제 관리" → "Manages transaction addition and deletion"
   - **StockManager.ts**: "주식 추가, 삭제, 수정 관리" → "Manages stock addition, deletion, and modification"

3. **일관된 번역 패턴 적용**
   - "관리" → "Manages"
   - "변경" → "Change"
   - "추가" → "Add"
   - "삭제" → "Delete"
   - "가져오기" → "Get/Fetch"

**효과:**
- ✅ 국제 협업 환경 대비 (영어권 개발자 접근성 향상)
- ✅ IDE 자동완성 및 호버 힌트의 일관성 확보
- ✅ 코드 문서화 표준 준수 (JSDoc 영어 권장사항)
- ✅ 오픈소스 프로젝트 전환 시 준비 완료

---

#### Phase 3.3: 데이터 영속성 추상화 (Repository 패턴)

**목적**: 상태 관리 로직과 데이터 영속성 로직을 분리하여 관심사 분리(SoC)와 테스트 용이성 향상

**주요 변경사항:**

1. **PortfolioRepository** (신규)
   - 포트폴리오 및 메타데이터 영속성 관리
   - Decimal ↔ number 변환 자동 처리 (IndexedDB 호환)
   - LocalStorage 마이그레이션 지원
   - 메서드: `loadMeta()`, `saveMeta()`, `loadPortfolios()`, `savePortfolios()`, `deletePortfolio()`

2. **SnapshotRepository** (신규)
   - 포트폴리오 스냅샷 영속성 관리
   - 성과 히스토리 데이터 저장/조회
   - 메서드: `loadAll()`, `getByPortfolioId()`, `add()`, `deleteByPortfolioId()`, `getLatest()`, `getByDateRange()`

3. **state.ts 개선**
   - 순수 인메모리 상태 관리에 집중
   - 모든 영속성 작업을 PortfolioRepository에 위임
   - 단일 책임 원칙(SRP) 준수

**효과:**
- ✅ 명확한 계층 분리: State ↔ Repository ↔ DataStore
- ✅ 의존성 주입으로 테스트 용이성 향상
- ✅ 저장소 백엔드 교체 시 Repository만 수정하면 됨
- ✅ 완전한 테스트 커버리지 확보

#### Phase 3.1: Controller "God Class" 분리

**목적**: Controller의 비대화 문제 해결 - 단일 책임 원칙(SRP) 적용

**주요 변경사항:**

1. **RiskAnalyzerService** (신규 서비스)
   - 리스크 분석 로직을 Controller에서 분리
   - 메서드: `analyzeRebalancingNeeds()`, `analyzeRiskWarnings()`, `formatRiskWarnings()`
   - 구조화된 분석 결과 반환 (Toast 표시는 Controller에서 처리)
   - 완전한 단위 테스트 커버리지

2. **SnapshotManager** (신규 컨트롤러 모듈)
   - 스냅샷 관련 로직을 Controller에서 분리
   - 성과 히스토리 및 스냅샷 목록 관리
   - 메서드: `handleShowPerformanceHistory()`, `handleShowSnapshotList()`, `getSnapshotCount()`, `getLatestSnapshot()`
   - SnapshotRepository 의존성 주입

3. **controller.ts 정리**
   - ~150 라인 감소
   - 리스크 분석 및 스냅샷 로직 제거
   - 불필요한 import 제거 (`PortfolioSnapshot`, `ChartLoaderService`, `THRESHOLDS`)

**효과:**
- ✅ Controller 복잡도 대폭 감소
- ✅ 비즈니스 로직의 독립적 테스트 가능
- ✅ 코드 재사용성 향상

#### Phase 3.2: 선언형 이벤트 바인딩 시스템

**목적**: 반복적인 이벤트 바인딩 코드를 제거하고 유지보수성 향상

**주요 변경사항:**

1. **EventBindingTypes** (신규 모듈)
   - `EventBindingConfig` 인터페이스 정의
   - `bindEvent()` 헬퍼: 공통 패턴(`needsFullRender`, `needsUIUpdate` 등) 자동 처리
   - `bindEvents()`: 다중 바인딩 적용

2. **ControllerEventBinder 리팩토링**
   - 28개 이벤트 바인딩을 선언형 설정 배열로 변환
   - `autoPostAction: true`로 render/update 자동 처리
   - `customPostAction`으로 복잡한 후처리 지원
   - 복잡한 로직은 별도 함수로 추출 (`bindPortfolioBodyClick`)

**Before:**
```typescript
controller.view.on('mainModeChanged', async (data) => {
    const result = await controller.calculationManager.handleMainModeChange(data.mode);
    if (result.needsFullRender) controller.fullRender();
});
```

**After:**
```typescript
{
    event: 'mainModeChanged',
    handler: async (data) => controller.calculationManager.handleMainModeChange(data.mode),
    autoPostAction: true,  // Automatically handles needsFullRender
},
```

**효과:**
- ✅ DRY 원칙 적용 (중복 제거)
- ✅ 설정 배열이 자체 문서화 역할
- ✅ 이벤트 추가/수정 용이
- ✅ 타입 안정성 유지

---

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
│   ├── state.ts                # 상태 관리 (인메모리)
│   ├── utils.ts                # 유틸리티 함수
│   │
│   ├── state/                  # State Layer (데이터 영속성)
│   │   ├── PortfolioRepository.ts      # 포트폴리오 영속성 관리
│   │   ├── PortfolioRepository.test.ts # Repository 테스트
│   │   ├── SnapshotRepository.ts       # 스냅샷 영속성 관리
│   │   ├── SnapshotRepository.test.ts  # Repository 테스트
│   │   ├── helpers.ts                  # 상태 관련 헬퍼 함수
│   │   └── validation.ts               # 데이터 검증 및 업그레이드
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
│   │   ├── DataManager.ts         # 데이터 가져오기/내보내기
│   │   ├── SnapshotManager.ts     # 스냅샷 및 성과 히스토리 관리
│   │   ├── EventBindingTypes.ts   # 선언형 이벤트 바인딩 시스템
│   │   └── ControllerEventBinder.ts  # Controller 이벤트 바인딩
│   │
│   ├── services/               # Services Layer (비즈니스 로직)
│   │   ├── Logger.ts           # 로깅 서비스
│   │   ├── RiskAnalyzerService.ts      # 리스크 분석 서비스
│   │   ├── RiskAnalyzerService.test.ts # 서비스 테스트
│   │   ├── CalculatorWorkerService.ts  # Web Worker 계산 서비스
│   │   └── ChartLoaderService.ts       # Chart.js 동적 로딩
│   │
│   ├── dataStore.ts            # IndexedDB 추상화
│   ├── apiService.ts           # API 호출 (재시도 로직, 에러 처리)
│   ├── a11yHelpers.ts          # 접근성 유틸리티 (WCAG 2.0)
│   ├── i18nEnhancements.ts     # 국제화 (Intl API)
│   ├── eventBinder.ts          # DOM 이벤트 바인딩
│   └── domPurify.d.ts          # DOMPurify 타입 정의
│
├── e2e/
│   └── app.spec.ts             # E2E 테스트 (Playwright)
├── PERFORMANCE.md              # 성능 최적화 가이드
├── ARCHITECTURE.md             # 아키텍처 문서
└── package.json                # 프로젝트 의존성
```

### 아키텍처 개요

이 프로젝트는 **개선된 MVC + Repository 패턴**을 따릅니다:

- **View Layer**: UI 렌더링, 이벤트 발행 (비즈니스 로직 없음)
  - 위임 패턴으로 역할 분리 (EventEmitter, ModalManager, VirtualScrollManager, ResultsRenderer)

- **Controller Layer**: 비즈니스 로직, API 호출, 상태 업데이트
  - 책임별로 모듈 분리 (Portfolio, Stock, Transaction, Calculation, Data, Snapshot 관리자)
  - 선언형 이벤트 바인딩 시스템으로 중복 제거

- **Services Layer**: 재사용 가능한 비즈니스 로직
  - RiskAnalyzerService: 리스크 분석 (단일 종목/섹터 집중도, 리밸런싱 필요 여부)
  - CalculatorWorkerService: Web Worker를 통한 계산 오프로딩
  - ChartLoaderService: Chart.js 지연 로딩

- **State Layer**: 데이터 관리
  - **PortfolioState**: 인메모리 상태 관리 (SSOT)
  - **PortfolioRepository**: 포트폴리오 영속성 (IndexedDB)
  - **SnapshotRepository**: 스냅샷 영속성 (성과 히스토리)
  - **DataStore**: 저수준 IndexedDB 작업

- **Model Layer**: 계산 및 전략 로직
  - Calculator: 포트폴리오 계산 (Decimal.js 활용)
  - Calculation Strategies: 리밸런싱 전략 (Add/Sell/Simple)

**데이터 흐름:**
```
Controller → State (인메모리) → Repository (영속성) → DataStore (IndexedDB)
          ↓
          Services (비즈니스 로직)
```

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 주요 기능

- 포트폴리오 다중 관리
- 추가 매수/매도 리밸런싱 계산
- **간단 계산 모드** (거래 내역 없이 금액만 입력하여 목표 비율 리밸런싱)
- 섹터별 분석 및 리스크 경고
- 거래 내역 관리 (수량/금액 입력 모드 지원)
- 성과 히스토리 및 스냅샷 관리
- KRW/USD 통화 전환
- 현재가 자동 조회 (API 연동)
- 다크 모드 지원
- 데이터 가져오기/내보내기

## 기술 스택

### 코어
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 및 개발 서버
- **Decimal.js** - 정밀 계산 (부동소수점 오류 방지)

### 아키텍처 패턴
- **MVC + Repository 패턴** - 관심사 분리 및 테스트 용이성
- **Dependency Injection** - 느슨한 결합 및 모듈화
- **Event-Driven Architecture** - 선언형 이벤트 바인딩 시스템

### UI & 성능
- **Chart.js** - 데이터 시각화 (lazy loading)
- **Virtual Scrolling** - 대량 데이터 렌더링 최적화
- **RequestAnimationFrame** - 부드러운 UI 업데이트
- **Web Workers** - 계산 오프로딩 (메인 스레드 블로킹 방지)

### 보안 & 접근성
- **DOMPurify** - XSS 방지
- **WCAG 2.0 준수** - 접근성 강화 (FocusManager, ARIA 속성)

### 국제화 & API
- **Intl API** - 로케일 기반 숫자/날짜/통화 포맷팅
- **API Service** - 재시도 로직, 구조화된 에러 처리

### 데이터 저장
- **IndexedDB** - 클라이언트 사이드 데이터베이스
- **Repository 패턴** - 데이터 접근 추상화

### 테스팅
- **Vitest** - 유닛 테스트 (Services, Repositories)
- **Playwright** - E2E 테스트

## 라이선스

MIT License
