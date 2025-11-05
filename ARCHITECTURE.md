# Architecture Guide

This document explains the architectural design, patterns, and module responsibilities of the Portfolio Rebalancing Calculator.

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Architecture Layers](#architecture-layers)
4. [Module Descriptions](#module-descriptions)
5. [Design Patterns](#design-patterns)
6. [Data Flow](#data-flow)
7. [Performance Optimizations](#performance-optimizations)
8. [Accessibility](#accessibility)
9. [Testing Strategy](#testing-strategy)

---

## Overview

This application follows a **modular MVC architecture** with clear separation of concerns:

- **Model**: Data management (IndexedDB), calculation logic
- **View**: UI rendering, event emission (no business logic)
- **Controller**: Business logic, API calls, state updates

The codebase has been refactored from 2 large files (~2,100 lines) into **17 focused modules** (~130 lines each on average) for better maintainability, testability, and scalability.

---

## Design Principles

### 1. Single Responsibility Principle (SRP)
Each module has one clear responsibility:
- `ModalManager` handles only modal UI logic
- `CalculationManager` handles only calculation operations
- `EventEmitter` handles only pub/sub events

### 2. Separation of Concerns
- **View modules** never directly modify state or call APIs
- **Controller modules** never directly manipulate DOM
- Communication happens via events or method calls

### 3. Delegation Pattern
Large classes delegate specific tasks to specialized modules:
```typescript
// view.ts orchestrates specialized managers
class PortfolioView {
    private eventEmitter: EventEmitter;
    private modalManager: ModalManager;
    private virtualScrollManager: VirtualScrollManager;
    private resultsRenderer: ResultsRenderer;
}
```

### 4. Composition Over Inheritance
Modules are composed rather than extended:
```typescript
// Bad: Inheritance
class ModalView extends BaseView { }

// Good: Composition
class PortfolioView {
    private modalManager: ModalManager;
}
```

---

## Architecture Layers

### Model Layer

**State Management** (`src/state.ts`):
- IndexedDB operations (CRUD for portfolios)
- Singleton pattern for global state
- Auto-save with debouncing

**Calculation Logic** (`src/calculator.ts`):
- Pure functions (no side effects)
- Decimal.js for precision
- Caching mechanism for performance

**Type Definitions** (`src/types.ts`):
- Centralized TypeScript interfaces
- Ensures type safety across modules

---

### View Layer (`src/view/`)

#### **view.ts** (Orchestrator)
- **Role**: Delegates UI tasks to specialized managers
- **Responsibilities**:
  - Initialize and coordinate sub-managers
  - Expose public API for controller
  - Route events to EventEmitter
- **Lines**: ~410 (down from 1,115)

#### **EventEmitter.ts** (Pub/Sub System)
- **Pattern**: Observer/Pub-Sub
- **Responsibilities**:
  - Event registration (`on()`)
  - Event emission (`emit()`)
  - Event cleanup (`clear()`, `off()`)
- **Benefits**: Decouples view from controller
- **Example**:
  ```typescript
  view.on('calculateClicked', (data) => {
      controller.handleCalculate(data);
  });
  view.emit('calculateClicked', { amount: 1000 });
  ```

#### **ModalManager.ts** (Modal UI)
- **Responsibilities**:
  - Show/hide modals (confirm, prompt, transaction history)
  - Focus management (accessibility)
  - Transaction list rendering
- **Accessibility Features**:
  - FocusManager for focus restoration
  - createFocusTrap for keyboard navigation
  - ARIA attributes (aria-modal, aria-label)
- **Example**:
  ```typescript
  const confirmed = await modalManager.showConfirm('Delete?', 'Are you sure?');
  if (confirmed) { /* delete logic */ }
  ```

#### **VirtualScrollManager.ts** (Performance Optimization)
- **Technique**: Virtual scrolling (windowing)
- **Responsibilities**:
  - Render only visible rows (+ buffer)
  - Handle scroll events with throttling
  - Preserve input values during re-render
- **Performance**:
  - 1,000 stocks: ~10-20 DOM nodes (vs. 2,000+ without virtual scroll)
  - 60 FPS scroll performance
  - ~80% memory reduction
- **Configuration**:
  ```typescript
  const ROW_INPUT_HEIGHT = 60;   // px
  const ROW_OUTPUT_HEIGHT = 50;  // px
  const VISIBLE_ROWS_BUFFER = 5; // pre-render buffer
  ```

#### **ResultsRenderer.ts** (Results Display)
- **Responsibilities**:
  - Render calculation results
  - Sector analysis display
  - Chart rendering (lazy-loaded Chart.js)
- **Optimization**: Uses `requestAnimationFrame` for smooth rendering

---

### Controller Layer (`src/controller/`)

#### **controller.ts** (Orchestrator)
- **Role**: Coordinates manager modules
- **Responsibilities**:
  - Initialize and bind managers
  - Route events to appropriate managers
  - Debounced auto-save
- **Lines**: ~350 (down from 1,008)

#### **PortfolioManager.ts** (Portfolio CRUD)
- **Responsibilities**:
  - Create new portfolio (with sanitization)
  - Rename portfolio
  - Delete portfolio
  - Switch active portfolio
- **Security**: Uses DOMPurify for input sanitization

#### **StockManager.ts** (Stock Management)
- **Responsibilities**:
  - Add/delete stocks
  - Modify stock fields (name, ticker, target ratio, etc.)
  - Handle current price updates
- **Optimization**: Partial row update for price changes
  ```typescript
  if (field === 'currentPrice') {
      // 50x faster: update only this stock's row
      this.view.updateSingleStockRow(stockId, calculatedMetrics);
  } else {
      // Full re-render for other fields
      this.view.updateVirtualTableData(calculatedState.portfolioData);
  }
  ```

#### **TransactionManager.ts** (Transaction History)
- **Responsibilities**:
  - Add/delete transactions
  - Open/close transaction modal
  - Handle input mode (quantity vs. amount)
- **Features**:
  - Quantity/amount input mode toggle
  - Precise Decimal.js calculations

#### **CalculationManager.ts** (Calculations & API)
- **Responsibilities**:
  - Perform portfolio calculations
  - Fetch stock prices via API
  - Currency conversion
  - Chart data preparation
- **Enhanced Error Handling**:
  ```typescript
  try {
      const results = await apiService.fetchAllStockPrices(tickers);
  } catch (error) {
      if (error instanceof APIError) {
          const userMessage = formatAPIError(error);
          this.view.showToast(userMessage, 'error');
          console.error(`[API] ${error.type}:`, error.message);
      }
  }
  ```

#### **DataManager.ts** (Import/Export)
- **Responsibilities**:
  - Export portfolios to JSON
  - Import portfolios from JSON
  - Reset all data

---

## Module Descriptions

### **apiService.ts** (Enhanced API Layer)

**Purpose**: Centralized API calls with retry logic and structured error handling

**Key Features**:
1. **Retry Logic with Exponential Backoff**
   ```typescript
   async function fetchWithRetry(url, options, maxRetries = 3) {
       for (let attempt = 0; attempt <= maxRetries; attempt++) {
           try {
               const response = await fetch(url, options);
               if (response.status >= 500 && attempt < maxRetries) {
                   const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                   await sleep(delay);
                   continue;
               }
               return response;
           } catch (error) { /* retry on network error */ }
       }
   }
   ```

2. **Structured Error Types**
   ```typescript
   enum APIErrorType {
       NETWORK_ERROR = 'NETWORK_ERROR',
       TIMEOUT = 'TIMEOUT',
       RATE_LIMIT = 'RATE_LIMIT',
       INVALID_TICKER = 'INVALID_TICKER',
       SERVER_ERROR = 'SERVER_ERROR',
       UNKNOWN = 'UNKNOWN'
   }

   class APIError extends Error {
       type: APIErrorType;
       ticker?: string;
       statusCode?: number;
       retryAfter?: number; // For rate limiting
   }
   ```

3. **User-Friendly Error Messages**
   ```typescript
   export function formatAPIError(error: APIError): string {
       switch (error.type) {
           case APIErrorType.NETWORK_ERROR:
               return '네트워크 연결을 확인해주세요.';
           case APIErrorType.RATE_LIMIT:
               return `API 호출 제한에 도달했습니다. ${error.retryAfter}초 후 다시 시도해주세요.`;
           // ... other cases
       }
   }
   ```

---

### **a11yHelpers.ts** (Accessibility Utilities)

**Purpose**: WCAG 2.0 compliance utilities

**Key Features**:
1. **FocusManager** - Save/restore focus for modals
   ```typescript
   class FocusManager {
       private previousFocus: HTMLElement | null = null;

       saveFocus(): void {
           this.previousFocus = document.activeElement as HTMLElement;
       }

       restoreFocus(): void {
           if (this.previousFocus) this.previousFocus.focus();
       }
   }
   ```

2. **createFocusTrap** - Trap keyboard focus within modal
   ```typescript
   export function createFocusTrap(container: HTMLElement): () => void {
       const focusableElements = container.querySelectorAll(
           'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
       );

       const handleKeyDown = (e: KeyboardEvent) => {
           if (e.key === 'Tab') {
               // Cycle focus within modal
           }
       };

       container.addEventListener('keydown', handleKeyDown);
       return () => container.removeEventListener('keydown', handleKeyDown);
   }
   ```

3. **checkColorContrast** - WCAG color contrast validation
   ```typescript
   export function checkColorContrast(
       foreground: string,
       background: string
   ): { ratio: number; passAA: boolean; passAAA: boolean } {
       const ratio = calculateContrastRatio(foreground, background);
       return {
           ratio,
           passAA: ratio >= 4.5,   // WCAG AA
           passAAA: ratio >= 7.0   // WCAG AAA
       };
   }
   ```

---

### **i18nEnhancements.ts** (Internationalization)

**Purpose**: Locale-aware number, currency, and date formatting

**Key Features**:
1. **Currency Formatting**
   ```typescript
   export function formatCurrencyEnhanced(
       amount: number | Decimal,
       currency: Currency = 'krw'
   ): string {
       const lang = getCurrentLanguage(); // 'ko' | 'en'
       const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

       return new Intl.NumberFormat(locale, {
           style: 'currency',
           currency: currency.toUpperCase(),
           minimumFractionDigits: currency === 'krw' ? 0 : 2
       }).format(num);
   }
   // KRW: ₩1,000,000 (ko) or $1,000,000 (en)
   ```

2. **Compact Number Formatting**
   ```typescript
   export function formatCompactNumber(value: number, fractionDigits = 2): string {
       return new Intl.NumberFormat(locale, {
           notation: 'compact',
           maximumFractionDigits: fractionDigits
       }).format(value);
   }
   // 1,234,567 → 1.23M (en) or 123만 (ko)
   ```

3. **Relative Time Formatting**
   ```typescript
   export function formatRelativeTime(date: Date | string): string {
       const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
       // ... calculate time difference
       return rtf.format(-diffDay, 'day');
   }
   // "3일 전" (ko) or "3 days ago" (en)
   ```

---

## Design Patterns

### 1. Delegation Pattern
**Usage**: `view.ts` and `controller.ts`

**Problem**: Large monolithic classes are hard to maintain and test.

**Solution**: Delegate responsibilities to specialized managers.
```typescript
class PortfolioView {
    private eventEmitter: EventEmitter;
    private modalManager: ModalManager;
    private virtualScrollManager: VirtualScrollManager;
    private resultsRenderer: ResultsRenderer;

    showConfirm(title: string, message: string): Promise<boolean> {
        return this.modalManager.showConfirm(title, message);
    }
}
```

### 2. Observer/Pub-Sub Pattern
**Usage**: `EventEmitter.ts`

**Problem**: Tight coupling between view and controller.

**Solution**: Decouple via events.
```typescript
// View emits events
view.emit('stockAdded', { stockId: '123' });

// Controller subscribes to events
view.on('stockAdded', (data) => {
    controller.handleStockAdded(data.stockId);
});
```

### 3. Strategy Pattern
**Usage**: `calculator.ts` (pre-existing)

**Problem**: Different calculation strategies for buy/sell/simple modes.

**Solution**: Strategy objects passed to calculator.
```typescript
Calculator.calculatePortfolioState({
    portfolioData: stocks,
    exchangeRate: 1300,
    currentCurrency: 'krw'
});
```

### 4. Singleton Pattern
**Usage**: `state.ts`

**Problem**: Multiple instances of state management cause inconsistencies.

**Solution**: Single instance of AppState.
```typescript
export class AppState {
    private static _instance: AppState;

    static getInstance(): AppState {
        if (!AppState._instance) {
            AppState._instance = new AppState();
        }
        return AppState._instance;
    }
}
```

---

## Data Flow

### User Interaction Flow

```
User Action (DOM Event)
    ↓
eventBinder.ts (Delegate to Controller)
    ↓
controller.ts (Route to Manager)
    ↓
Specific Manager (e.g., StockManager)
    ↓
state.ts (Update Model)
    ↓
controller.ts (Trigger View Update)
    ↓
view.ts (Delegate to Renderer)
    ↓
Specific Renderer (e.g., VirtualScrollManager)
    ↓
DOM Update
```

### Example: Adding a Stock

```typescript
// 1. User clicks "Add Stock" button
// eventBinder.ts detects click and calls controller

// 2. Controller delegates to StockManager
controller.handleAddStock();

// 3. StockManager creates new stock
stockManager.addStock();

// 4. StockManager updates state
this.state.addStock(newStock);

// 5. StockManager triggers view update
const calculatedState = Calculator.calculatePortfolioState(...);
this.view.updateVirtualTableData(calculatedState.portfolioData);

// 6. View delegates to VirtualScrollManager
virtualScrollManager.renderTable(stocks);

// 7. VirtualScrollManager updates DOM
// Only visible rows are rendered
```

---

## Performance Optimizations

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed performance guide.

### Key Optimizations

1. **Virtual Scrolling** (`VirtualScrollManager.ts`)
   - Render only visible rows + buffer
   - 60 FPS scroll performance
   - ~80% memory reduction for large portfolios

2. **Debounced Save** (`controller.ts`)
   - Auto-save delayed by 500ms
   - Reduces IndexedDB writes by ~90%

3. **Calculation Caching** (`calculator.ts`)
   - Cache results with key = hash(portfolioData + currency + mode)
   - Cache hit: ~0.1ms, Cache miss: ~5-10ms

4. **Partial Row Updates** (`StockManager.ts`)
   - Update only changed row for price updates (50x faster)

5. **Lazy Loading** (`CalculationManager.ts`)
   - Chart.js loaded on-demand (-220 KB from initial bundle)

6. **RequestAnimationFrame** (`ResultsRenderer.ts`)
   - Schedule heavy DOM updates in next frame
   - Prevents layout thrashing

---

## Accessibility

### WCAG 2.0 Compliance

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Focus trap in modals prevents focus escape
   - Escape key closes modals

2. **Screen Reader Support**
   - ARIA labels on all buttons
   - `aria-modal="true"` on modals
   - Semantic HTML elements

3. **Focus Management**
   - FocusManager saves/restores focus when modals open/close
   - Visible focus indicators

4. **Color Contrast**
   - checkColorContrast utility ensures WCAG AA compliance
   - Dark mode maintains contrast ratios

### Example: Accessible Modal
```typescript
class ModalManager {
    private focusManager: FocusManager;
    private focusTrapCleanup: (() => void) | null = null;

    private _showModal(options: any): Promise<any> {
        this.focusManager.saveFocus(); // Save current focus

        modalEl.classList.remove('hidden');
        modalEl.setAttribute('aria-modal', 'true');

        this.focusTrapCleanup = createFocusTrap(modalEl); // Trap focus

        // ... show modal
    }

    private _hideModal(): void {
        if (this.focusTrapCleanup) {
            this.focusTrapCleanup(); // Release focus trap
        }

        modalEl.removeAttribute('aria-modal');
        modalEl.classList.add('hidden');

        this.focusManager.restoreFocus(); // Restore previous focus
    }
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage**: Individual modules in isolation

**Examples**:
- `EventEmitter.test.ts` - Pub/Sub event system
- `ModalManager.test.ts` - Modal UI logic, accessibility
- `apiService.test.ts` - Retry logic, error handling

**Mocking Strategy**:
```typescript
// Mock DOM elements
const mockDom = {
    customModal: document.createElement('div'),
    customModalConfirm: document.createElement('button')
};

// Mock API calls
vi.mock('global.fetch', () => ({
    fetch: vi.fn()
}));
```

### E2E Tests (Playwright)

**Coverage**: Full user workflows

**Test Suites**:
- Modal interactions (open/close, Escape key)
- Portfolio management (create, rename, delete)
- Stock operations (add, delete, modify)
- Calculations (buy/sell/simple modes)
- Accessibility (ARIA, keyboard navigation)
- Data import/export
- Currency conversion
- Virtual scrolling

**Example**:
```typescript
test('should open and close transaction modal', async ({ page }) => {
    await page.click('[data-testid="transaction-btn"]');
    await expect(page.locator('#transactionModal')).not.toHaveClass(/hidden/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#transactionModal')).toHaveClass(/hidden/);
});
```

---

## Future Improvements

1. **Web Workers** - Offload calculations to background thread
2. **Service Worker** - Cache static assets, offline support
3. **Code Splitting** - Split by route/feature for faster initial load
4. **WebAssembly** - Port heavy calculations to WASM
5. **React Migration** - Consider React for concurrent rendering

---

**Last Updated**: 2025-11-05
**Maintained By**: Development Team
