# 성능 최적화 가이드

**Phase 3-2: 성능 최적화** 문서

## 목차
1. [이미 구현된 최적화](#이미-구현된-최적화)
2. [메모이제이션 활용](#메모이제이션-활용)
3. [성능 모니터링](#성능-모니터링)
4. [Best Practices](#best-practices)

---

## 이미 구현된 최적화

### 1. **Web Worker 기반 계산** (CalculatorWorkerService)
- 무거운 계산을 백그라운드 스레드에서 처리
- UI 스레드 블로킹 방지
- 위치: `src/services/CalculatorWorkerService.ts`

### 2. **가상 스크롤** (VirtualScrollManager)
- 대량 데이터(100+ 종목)를 효율적으로 렌더링
- 실제로 보이는 부분만 DOM에 렌더링
- 위치: `src/view/VirtualScrollManager.ts`

### 3. **LRU 캐시** (LRUCache)
- API 요청 결과 캐싱
- 중복 네트워크 요청 방지
- 위치: `src/cache/LRUCache.ts`

### 4. **Decimal.js 최적화** (Phase 2-2)
- UI 렌더링 레이어에서 Decimal 제거
- 네이티브 number 사용으로 성능 향상
- 계산 로직에서만 Decimal 사용

### 5. **Debounce/Throttle**
- 입력 이벤트 최적화
- 불필요한 재계산 방지
- 위치: `src/utils.ts`

### 6. **Code Splitting**
- Chart.js 동적 import
- 초기 번들 크기 감소
- 필요할 때만 로드

---

## 메모이제이션 활용

### 사용 가능한 메모이제이션 헬퍼

```typescript
import {
    memoize,           // 단순 메모이제이션 (LRU 캐시 크기 제한 포함)
    memoizeWithKey     // 다중 인자 함수 메모이제이션
} from './cache/memoization';
```

### 활용 예시

#### 1. 단순 함수 메모이제이션
```typescript
const expensiveCalculation = memoize((value: number) => {
    // 무거운 계산
    return value ** 2;
});
```

#### 2. 복잡한 객체 메모이제이션
```typescript
const calculateMetrics = memoizeComplex(
    (stock: Stock) => {
        // 복잡한 계산
        return { /* ... */ };
    },
    (stock) => stock.id // 커스텀 키 함수
);
```

#### 3. TTL 캐싱 (API 결과 등)
```typescript
const fetchStockPrice = memoizeWithTTL(
    async (ticker: string) => {
        const response = await fetch(`/api/${ticker}`);
        return response.json();
    },
    60000 // 60초 캐싱
);
```

#### 4. LRU 캐싱 (메모리 제한)
```typescript
const formatComplexData = memoizeLRU(
    (data: ComplexData) => {
        // 포맷팅 로직
        return formatted;
    },
    100 // 최대 100개 캐싱
);
```

---

## 성능 모니터링

### 개발 모드에서 성능 패널 활성화

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 Ctrl+Shift+P 눌러 성능 패널 열기
```

### PerformanceMonitor 사용

```typescript
import { perfMonitor } from './performance/PerformanceMonitor';

// 성능 측정 시작
const end = perfMonitor.measure('my-operation');

// ... 작업 수행 ...

// 측정 종료
end();

// 메트릭 조회
const metrics = perfMonitor.getMetrics();
console.log(metrics['my-operation']);
```

---

## Best Practices

### 1. **재렌더링 최소화**

#### ❌ 나쁜 예
```typescript
// 매번 새로운 객체 생성
setInterval(() => {
    updateUI({ data: getData() });
}, 100);
```

#### ✅ 좋은 예
```typescript
// 데이터 변경 시에만 업데이트
let lastData = null;
setInterval(() => {
    const newData = getData();
    if (!deepEqual(newData, lastData)) {
        updateUI({ data: newData });
        lastData = newData;
    }
}, 100);
```

### 2. **DOM 조작 배치 처리**

#### ❌ 나쁜 예
```typescript
// 각 항목마다 DOM 조작
items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    container.appendChild(div); // 여러 번 reflow
});
```

#### ✅ 좋은 예
```typescript
// DocumentFragment 사용
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    fragment.appendChild(div);
});
container.appendChild(fragment); // 한 번만 reflow
```

### 3. **이벤트 리스너 최적화**

#### ❌ 나쁜 예
```typescript
// 각 항목에 개별 리스너
items.forEach(item => {
    item.addEventListener('click', handleClick);
});
```

#### ✅ 좋은 예
```typescript
// 이벤트 위임
container.addEventListener('click', (e) => {
    const target = e.target.closest('.item');
    if (target) handleClick(target);
});
```

### 4. **불필요한 계산 스킵**

```typescript
// 캐시된 값 재사용
let cachedTotal = null;
let lastData = null;

function getTotal(data) {
    if (data === lastData && cachedTotal !== null) {
        return cachedTotal;
    }

    cachedTotal = expensiveCalculation(data);
    lastData = data;
    return cachedTotal;
}
```

### 5. **Lazy Loading**

```typescript
// 동적 import로 필요할 때만 로드
async function showChart() {
    const Chart = (await import('chart.js/auto')).default;
    // ... 차트 생성
}
```

---

## 성능 체크리스트

### 계산 최적화
- [ ] Web Worker 사용 중인가?
- [ ] 무거운 계산을 메모이제이션했는가?
- [ ] Decimal.js를 UI 레이어에서 제거했는가?

### 렌더링 최적화
- [ ] 가상 스크롤을 사용하는가?
- [ ] 불필요한 재렌더링을 방지하는가?
- [ ] DOM 조작을 배치 처리하는가?

### 네트워크 최적화
- [ ] API 결과를 캐싱하는가?
- [ ] 중복 요청을 방지하는가?
- [ ] debounce/throttle을 사용하는가?

### 번들 최적화
- [ ] Code splitting을 사용하는가?
- [ ] Tree shaking이 작동하는가?
- [ ] 불필요한 의존성을 제거했는가?

---

## 참고 자료

- [Web Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Virtual Scrolling](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Performance Measurement](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Memoization Pattern](https://en.wikipedia.org/wiki/Memoization)

---

**Last Updated**: Phase 3-2 Performance Optimization
