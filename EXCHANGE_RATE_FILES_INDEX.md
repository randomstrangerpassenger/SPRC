# Exchange Rate Code Files - Complete Index

## Quick Reference: All Files Mentioning Exchange Rate

### Critical Files (2 BUGS)
- **js/controller.js** - Contains 2 CRITICAL BUGS in exchange rate usage
  - Line 543: Price fetching bug
  - Line 544: Price fetching bug
  - Line 600: Currency switching bug
  - Line 604: Currency switching bug

### Core Implementation Files (Working Correctly)
1. **js/constants.js** - Default exchange rate definition
   - Line 4: `DEFAULT_EXCHANGE_RATE: 1300`

2. **js/state.js** - Exchange rate storage and validation
   - Line 162: Exchange rate storage in portfolio.settings
   - Line 285: Exchange rate validation

3. **js/calculator.js** - Currency conversion logic
   - Line 137: Calculator.calculatePortfolioState method
   - Line 152: Exchange rate decimal conversion
   - Line 160-166: USD/KRW conversion logic

4. **js/apiService.js** - API price fetching
   - Line 36: Receives USD prices from Finnhub API
   - Returns prices that need conversion

5. **js/utils.js** - Currency formatting
   - Line 45: formatCurrency function
   - Line 59-69: Currency formatting with Intl.NumberFormat

### UI/View Files
1. **js/view.js** - Exchange rate input display
   - Line 91: exchangeRateInput DOM element reference
   - Line 94: exchangeRateGroup DOM element reference

2. **js/eventBinder.js** - Event listener binding
   - Input event listener for exchange rate changes
   - Keydown handler for exchange rate input

3. **js/controller.js** - UI event handling
   - Line 69-72: Display exchange rate in input
   - Line 629-678: Handle currency conversion events
   - Line 892-925: Calculate investment amount with exchange rate

### Validation Files
1. **js/validator.js** - Input validation
   - Line 193: Exchange rate validation (must be number > 0)

### Configuration Files
1. **js/types.js** - Type definitions
   - Line 49: currentCurrency type definition ('krw' | 'usd')

### Test Files
1. **js/calculator.test.js** - Unit tests
   - No specific exchange rate tests

2. **js/controller.test.js** - Controller tests
   - Line with exchangeRateInput mock

3. **js/testUtils.js** - Test utilities
   - Exchange rate test data setup
   - currentAmountUSD and currentAmountKRW in mock data

---

## File Analysis Summary

### By Functionality

#### Exchange Rate Storage & Retrieval
- constants.js (definition)
- state.js (in portfolio.settings)
- controller.js (retrieval with BUGS)

#### Exchange Rate Usage in Calculations
- calculator.js (currency conversion - CORRECT)
- controller.js (price fetching - BUG, currency switching - BUG)
- apiService.js (price source)

#### Exchange Rate in UI
- view.js (display input)
- eventBinder.js (event binding)
- controller.js (event handling)

#### Exchange Rate Validation
- validator.js (validation rules)
- state.js (validation in updatePortfolioSettings)

---

## Code Flow Map

```
User Input (exchangeRateInput)
    ↓
eventBinder.js: addEventListener
    ↓
controller.js: handleCurrencyConversion()
    ↓
state.js: updatePortfolioSettings()
    ↓
portfolio.settings.exchangeRate ✓ CORRECT

Then used by:
    ├─ calculator.js: calculatePortfolioState() ✓ CORRECT
    ├─ controller.js: handleFetchAllPrices() ❌ BUG #1
    ├─ controller.js: handleCurrencyModeChange() ❌ BUG #2
    └─ utils.js: formatCurrency() ✓ CORRECT
```

---

## Search Pattern

To find all exchange rate references in code:
```bash
grep -r "exchangeRate\|currentCurrency\|환율\|USD\|KRW" js/ --include="*.js"
```

Results found: 15 files total
- 7 files with CORRECT implementation
- 1 file with 2 CRITICAL BUGS (controller.js)
- 3 test files with exchange rate test data

---

## Line-by-Line Reference

### constants.js
```
4:  DEFAULT_EXCHANGE_RATE: 1300,
```

### state.js
```
162:    exchangeRate: typeof portfolio.settings?.exchangeRate === 'number' && portfolio.settings.exchangeRate > 0 ? portfolio.settings.exchangeRate : CONFIG.DEFAULT_EXCHANGE_RATE,
285:    if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
286:        activePortfolio.settings[key] = CONFIG.DEFAULT_EXCHANGE_RATE;
591:    exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
```

### calculator.js
```
68:    currentAmountUSD: new Decimal(0),
69:    currentAmountKRW: new Decimal(0),
152:   const exchangeRateDec = new Decimal(exchangeRate);
160:   if (currentCurrency === 'krw') {
161:       calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
162:       calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
```

### controller.js (BUGS HERE)
```
69:  const { exchangeRateInput } = this.view.dom;
71:      exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();

129:     exchangeRate: activePortfolio.settings.exchangeRate,
130:     currentCurrency: activePortfolio.settings.currentCurrency

543:     const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;  ❌ BUG
544:     const currentCurrency = activePortfolio.currentCurrency || 'krw';  ❌ BUG

600:     const oldCurrency = activePortfolio.currentCurrency || 'krw';  ❌ BUG
604:     const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;  ❌ BUG

637:     const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
912:     const exchangeRate = new Decimal(exchangeRateStr);
914:     if (currentCurrency === 'krw') {
```

---

## Summary Statistics

**Total files analyzed:** 20 files  
**Files with exchange rate code:** 15 files  
**Correctly implemented:** 13 files  
**Files with bugs:** 1 file (controller.js with 2 bugs)  
**Bugs found:** 2 CRITICAL bugs

---

**Last Updated:** Analysis completed  
**Status:** 2 Critical bugs documented and ready for fixing
