# Exchange Rate (환율) Bug Summary

## Overview
Found **2 CRITICAL BUGS** in exchange rate handling that prevent proper currency conversion and profit/loss calculations.

## Critical Bugs

### Bug #1: Price Fetching Ignores Custom Exchange Rate
**Severity:** 🔴 CRITICAL  
**Location:** `/home/user/SPRC/js/controller.js`, Lines 543-544  
**Method:** `handleFetchAllPrices()`

**Problem:**
```javascript
// WRONG - Missing .settings
const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
const currentCurrency = activePortfolio.currentCurrency || 'krw';
```

**Fix:**
```javascript
// CORRECT
const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';
```

**Impact:**
- When fetching stock prices from Finnhub API, the code uses undefined values
- Falls back to DEFAULT_EXCHANGE_RATE (1300) instead of user's custom rate
- If user set rate to 1250, prices will be converted using 1300 (4% error)
- Wrong prices stored in database cascade to wrong profit/loss calculations

---

### Bug #2: Currency Switching Uses Wrong Exchange Rate
**Severity:** 🔴 CRITICAL  
**Location:** `/home/user/SPRC/js/controller.js`, Lines 600, 604  
**Method:** `handleCurrencyModeChange()`

**Problem:**
```javascript
// WRONG - Missing .settings
const oldCurrency = activePortfolio.currentCurrency || 'krw';
// ...
const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
```

**Fix:**
```javascript
// CORRECT
const oldCurrency = activePortfolio.settings.currentCurrency || 'krw';
// ...
const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
```

**Impact:**
- When switching from KRW to USD or vice versa, conversions use DEFAULT_EXCHANGE_RATE
- Ignores user's custom exchange rate completely
- Stock prices displayed incorrectly in new currency
- Portfolio value calculation shows wrong amount

---

## Data Flow Analysis

### Correct Data Storage (✓ Working)
```
User Input → exchangeRateInput.value 
           ↓
handleCurrencyConversion() → state.updatePortfolioSettings()
           ↓
portfolio.settings.exchangeRate ✓ Stored correctly in state
           ↓
Calculator.calculatePortfolioState({ exchangeRate }) ✓ Passed correctly
```

### Broken Data Retrieval (❌ Not Working)
```
handleFetchAllPrices() → activePortfolio.exchangeRate ❌ undefined
handleCurrencyModeChange() → activePortfolio.currentCurrency ❌ undefined

Should be:
           → activePortfolio.settings.exchangeRate ✓
           → activePortfolio.settings.currentCurrency ✓
```

---

## Exchange Rate Locations in Code

### Where Exchange Rates Are Defined:
1. **constants.js (Line 4)**
   ```javascript
   DEFAULT_EXCHANGE_RATE: 1300
   ```

2. **state.js (Line 162)**
   ```javascript
   exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE  // In portfolio.settings
   ```

### Where Exchange Rates Are Used:
1. **calculator.js (Lines 152, 160-166)** - ✓ CORRECT
   - Converts currentAmount to USD/KRW for display

2. **controller.js**
   - Line 69-71 ✓ CORRECT - Sets exchangeRateInput value
   - Line 129, 158 ✓ CORRECT - Passes to Calculator
   - Line 543-544 ❌ BUG #1 - API price fetching
   - Line 600, 604 ❌ BUG #2 - Currency switching
   - Line 912-920 ✓ CORRECT - getInvestmentAmountInKRW

3. **apiService.js** - ✓ CORRECT
   - Returns prices in USD from Finnhub API

---

## Impact on Profit/Loss Calculations (수익률)

### Direct Impact: NONE
The profit/loss formula is currency-independent:
```javascript
profitLoss = currentAmount - (quantity × avgBuyPrice)
profitLossRate = profitLoss / (quantity × avgBuyPrice) × 100
```

### Indirect Impact: CRITICAL
If currentAmount is wrong due to bugs, profit/loss cascades:

**Example:**
```
Stock: 100 shares @ $100 USD
User's custom rate: 1250 KRW/USD

Correct flow:
  API returns: $100 per share
  Correct conversion: 100 × 1250 = 125,000 KRW per share
  Total: 12,500,000 KRW

Buggy flow (BUG #1):
  API returns: $100 per share
  Wrong conversion: 100 × 1300 = 130,000 KRW per share (uses DEFAULT)
  Total: 13,000,000 KRW
  
Error: 500,000 KRW difference (4%)
```

---

## Test Coverage

### Current Tests:
- `calculator.test.js` - Stock metrics (no exchange rate tests)
- `controller.test.js` - Has exchangeRateInput mock but limited
- `validator.test.js` - Data validation (no currency conversion tests)

### Missing Tests:
- Exchange rate conversion with custom rates
- Price fetching with different currencies
- Currency switching accuracy
- Error handling for invalid rates (0, negative)

---

## Recent Commit Status

**Commit 9066ade** titled "Fix currency conversion error in profit calculation":
- ✓ Added price conversion logic in handleFetchAllPrices()
- ✓ Added currency switching logic in handleCurrencyModeChange()
- ❌ Did NOT fix the property access path bugs (.settings missing)

The fix was added but bugs prevent it from working correctly.

---

## Files Status

| File | Status | Notes |
|------|--------|-------|
| constants.js | ✓ Correct | DEFAULT_EXCHANGE_RATE defined |
| state.js | ✓ Correct | Stores in portfolio.settings |
| calculator.js | ✓ Correct | Uses exchangeRate parameter |
| apiService.js | ✓ Correct | Returns USD prices |
| utils.js | ✓ Correct | Currency formatting |
| view.js | ✓ Correct | Displays exchange rate input |
| validator.js | ✓ Correct | Validates exchange rate > 0 |
| controller.js | ❌ Bugs | 2 critical bugs in methods |

---

## Recommendations

### Immediate Actions:
1. Fix line 543-544 in controller.js
2. Fix line 600, 604 in controller.js
3. Add unit tests for currency conversions
4. Test with custom exchange rate (not default)

### Long-term Improvements:
1. Add exchange rate validation (prevent 0 or negative)
2. Create comprehensive currency conversion tests
3. Consider adding exchange rate history tracking
4. Add warning if using DEFAULT_EXCHANGE_RATE vs custom

---

## Related Files

### Main Analysis:
- `/home/user/SPRC/EXCHANGE_RATE_ANALYSIS.md` - Detailed technical analysis

### Key Code Files:
- `/home/user/SPRC/js/controller.js` - Contains bugs
- `/home/user/SPRC/js/calculator.js` - Currency conversion logic
- `/home/user/SPRC/js/state.js` - Data storage
- `/home/user/SPRC/js/constants.js` - Default values

---

**Status:** Found and documented 2 critical bugs requiring immediate fixes.
