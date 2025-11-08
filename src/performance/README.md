# Performance Monitoring System

## 개요

SPRC 애플리케이션의 성능을 실시간으로 모니터링하고 분석하는 시스템입니다.

## 주요 기능

### 1. PerformanceMonitor
성능 메트릭 수집 및 분석을 위한 핵심 클래스

**기능:**
- 함수 실행 시간 측정
- 메모리 사용량 추적
- 카테고리별 메트릭 분류
- 통계 분석 (평균, 최소, 최대, 백분위수)
- 느린 작업 감지

**사용 예시:**

```typescript
import { perfMonitor } from './performance/PerformanceMonitor';

// 동기 함수 측정
const result = perfMonitor.measure('myFunction', () => {
    // 실행할 코드
    return someCalculation();
}, 'calculation');

// 비동기 함수 측정
const data = await perfMonitor.measureAsync('fetchData', async () => {
    return await apiCall();
}, 'api');

// 수동 측정
perfMonitor.start('complexOperation', 'calculation', { itemCount: 100 });
// ... 작업 수행 ...
perfMonitor.end('complexOperation', 'calculation');
```

### 2. Performance Decorators
함수에 자동으로 성능 측정을 추가하는 유틸리티

```typescript
import { withPerformance, withPerformanceAsync } from './performance/decorators';

// 기존 함수 래핑
const measuredFn = withPerformance(myFunction, 'myFunction', 'calculation');

// 비동기 함수 래핑
const measuredAsyncFn = withPerformanceAsync(
    myAsyncFunction,
    'myAsyncFunction',
    'api'
);
```

### 3. Performance Panel
개발자 도구처럼 성능 메트릭을 시각화하는 UI 패널

**사용 방법:**
1. 개발 모드에서 `Ctrl+Shift+P` 키를 눌러 패널 토글
2. 카테고리별 필터링
3. 실시간 통계 확인
4. 느린 작업 경고 확인
5. 데이터 내보내기 (JSON)

**기능:**
- 📊 실시간 통계 테이블
- ⚠️ 느린 작업 경고 (>100ms)
- 🔄 자동 새로고침 (5초)
- 💾 JSON 데이터 내보내기
- 🗑️ 메트릭 초기화

## 카테고리

- `calculation`: 계산 작업 (Portfolio calculations, rebalancing)
- `rendering`: 렌더링 작업 (DOM updates, virtual scrolling)
- `api`: API 호출 (Stock price fetching, exchange rates)
- `storage`: 데이터 저장/로드 (IndexedDB operations)
- `other`: 기타 작업

## 통계 메트릭

- **Count**: 호출 횟수
- **Avg (ms)**: 평균 실행 시간
- **Min (ms)**: 최소 실행 시간
- **Max (ms)**: 최대 실행 시간
- **P50/P95/P99**: 50/95/99 백분위 실행 시간

## 성능 분석 예시

```typescript
// 1. 메트릭 수집
perfMonitor.start('calculatePortfolio', 'calculation');
const result = calculatePortfolio(data);
perfMonitor.end('calculatePortfolio', 'calculation');

// 2. 통계 확인
const stats = perfMonitor.getStats('calculatePortfolio', 'calculation');
console.log(`Average execution time: ${stats[0].avgDuration}ms`);

// 3. 느린 작업 감지
const slowOps = perfMonitor.getSlowOperations(100);
if (slowOps.length > 0) {
    console.warn('Slow operations detected:', slowOps);
}

// 4. 리포트 출력
perfMonitor.printReport('calculation');

// 5. 데이터 내보내기
const jsonData = perfMonitor.export();
// Save to file or send to analytics service
```

## 프로덕션 설정

프로덕션 환경에서는 성능 모니터링이 자동으로 비활성화됩니다:

```typescript
// main.ts에서 자동 설정
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
if (isDevelopment) {
    perfMonitor.setEnabled(true);
    initPerformancePanel();
} else {
    perfMonitor.setEnabled(false);
}
```

## 모범 사례

1. **중요한 작업만 측정**: 너무 많은 메트릭은 오버헤드 발생
2. **카테고리 일관성 유지**: 동일한 타입의 작업은 같은 카테고리로 분류
3. **메타데이터 활용**: 작업 컨텍스트를 메타데이터로 저장
4. **정기적인 분석**: P95, P99 백분위를 모니터링하여 이상치 감지
5. **느린 작업 최적화**: >100ms 작업을 우선 최적화

## API 레퍼런스

### PerformanceMonitor

| 메서드 | 설명 | 반환 |
|--------|------|------|
| `getInstance()` | 싱글톤 인스턴스 가져오기 | `PerformanceMonitor` |
| `setEnabled(enabled)` | 모니터링 활성화/비활성화 | `void` |
| `start(name, category, metadata?)` | 측정 시작 | `void` |
| `end(name, category)` | 측정 종료 | `number` (duration) |
| `measure(name, fn, category, metadata?)` | 동기 함수 측정 | `T` (함수 반환값) |
| `measureAsync(name, fn, category, metadata?)` | 비동기 함수 측정 | `Promise<T>` |
| `getMetrics(category?)` | 메트릭 조회 | `PerformanceMetric[]` |
| `getStats(name?, category?)` | 통계 조회 | `PerformanceStats[]` |
| `getSlowOperations(threshold)` | 느린 작업 조회 | `PerformanceMetric[]` |
| `printReport(category?)` | 콘솔에 리포트 출력 | `void` |
| `clear()` | 모든 메트릭 초기화 | `void` |
| `export()` | JSON 데이터 내보내기 | `string` |

## 테스트

```bash
npm test -- src/performance/PerformanceMonitor.test.ts
```

22개의 포괄적인 테스트로 모든 기능 검증.

## 라이선스

This is part of the SPRC (Stock Portfolio Rebalancing Calculator) project.
