# Web Worker Integration Guide

## Current Status

✅ **Implemented:**
- `src/workers/calculator.worker.ts` - Web Worker for calculations
- `src/services/CalculatorWorkerService.ts` - Service for managing worker

⏳ **Pending Integration:**
- Update Controller to use CalculatorWorkerService
- Update all calculation calls to use async API
- Add loading states during calculations

## How to Integrate

### Step 1: Import Worker Service in Controller

```typescript
// src/controller.ts
import { getCalculatorWorkerService } from './services/CalculatorWorkerService';

export class PortfolioController {
    private calculatorWorker = getCalculatorWorkerService();

    // ... rest of code
}
```

### Step 2: Update fullRender() to use Worker

**Before (Synchronous):**
```typescript
fullRender(): void {
    const calculatedState = Calculator.calculatePortfolioState({
        portfolioData: activePortfolio.portfolioData,
        exchangeRate: activePortfolio.settings.exchangeRate,
        currentCurrency: activePortfolio.settings.currentCurrency
    });

    this.view.renderTable(calculatedState.portfolioData, ...);
}
```

**After (Asynchronous with Worker):**
```typescript
async fullRender(): Promise<void> {
    const activePortfolio = this.state.getActivePortfolio();
    if (!activePortfolio) return;

    // Show loading indicator
    this.view.showCalculationLoading();

    try {
        const calculatedState = await this.calculatorWorker.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.renderTable(calculatedState.portfolioData, ...);

        const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency
        );

        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, ...));
    } catch (error) {
        console.error('Calculation error:', error);
        this.view.showToast('Calculation failed', 'error');
    } finally {
        this.view.hideCalculationLoading();
    }
}
```

### Step 3: Add Loading UI

```typescript
// src/view.ts
showCalculationLoading(): void {
    // Show spinner or progress indicator
    const loader = document.createElement('div');
    loader.id = 'calculation-loader';
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div><p>Calculating...</p>';
    document.body.appendChild(loader);
}

hideCalculationLoading(): void {
    const loader = document.getElementById('calculation-loader');
    if (loader) loader.remove();
}
```

### Step 4: Update All Calculation Calls

Search for `Calculator.calculatePortfolioState` and `Calculator.calculateSectorAnalysis` throughout the codebase and replace with async worker calls.

**Files to Update:**
- `src/controller.ts`
- `src/controller/CalculationManager.ts`
- `src/controller/StockManager.ts`

## Benefits

✨ **Performance Improvements:**
- Main thread stays responsive during heavy calculations
- Users can scroll and interact while calculations run
- Better experience with 1000+ stocks

## Fallback Strategy

The CalculatorWorkerService automatically falls back to synchronous `Calculator` if:
- Web Workers are not supported
- Worker fails to initialize
- Worker request times out

## Testing

1. Test with small portfolios (< 10 stocks)
2. Test with medium portfolios (10-100 stocks)
3. Test with large portfolios (100-1000 stocks)
4. Test worker failure scenarios
5. Test in browsers without Worker support

## Performance Monitoring

Add performance logging:

```typescript
const startTime = performance.now();
const result = await this.calculatorWorker.calculatePortfolioState(...);
const endTime = performance.now();
console.log(`[Perf] Worker calculation took ${(endTime - startTime).toFixed(2)}ms`);
```

## Future Enhancements

- Progress reporting for long calculations
- Cancellable calculations
- Parallel calculation of multiple portfolios
- Batch calculation requests
