# Exchange Rate (환율) Handling Analysis - Comprehensive Report

## Summary
Found 1 **CRITICAL BUG** and several important findings regarding exchange rate handling in the codebase.

---

## 1. WHERE EXCHANGE RATES ARE FETCHED OR DEFINED

### A. Default Exchange Rate (constants.js)
**File:** `/home/user/SPRC/js/constants.js` (Line 4)
```javascript
DEFAULT_EXCHANGE_RATE: 1300  // Default KRW to USD rate
```
- Used as fallback when no custom exchange rate is set
- Currently hardcoded to 1300

### B. Exchange Rate Storage (state.js)
**File:** `/home/user/SPRC/js/state.js`
- Stored in `portfolio.settings.exchangeRate` (Line 162)
- Default value: `CONFIG.DEFAULT_EXCHANGE_RATE` (1300)
- Validated: must be a positive number (Line 285-286)

### C. Exchange Rate Input (UI)
**File:** `/home/user/SPRC/js/controller.js` (Lines 69-72)
```javascript
const { exchangeRateInput } = this.view.dom;
if (exchangeRateInput instanceof HTMLInputElement) {
    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
}
```
- User can input custom exchange rate via HTML input element
- Updates via `handleCurrencyConversion()` method (Line 629-678)

---

## 2. HOW EXCHANGE RATES ARE USED IN CALCULATIONS

### A. Currency Amount Conversion (calculator.js)
**File:** `/home/user/SPRC/js/calculator.js` (Lines 137-166)

```javascript
static calculatePortfolioState({ portfolioData, exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE, currentCurrency = 'krw' }) {
    const exchangeRateDec = new Decimal(exchangeRate);
    
    // ... for each stock:
    // 현재가치를 KRW와 USD로 변환
    if (currentCurrency === 'krw') {
        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);  // ← Divide by rate
    } else { // usd
        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);  // ← Multiply by rate
    }
}
```

**Logic:**
- If `currentCurrency === 'krw'`: Amount is in KRW
  - `currentAmountKRW` = currentAmount (no conversion)
  - `currentAmountUSD` = currentAmount ÷ exchangeRate
- If `currentCurrency === 'usd'`: Amount is in USD
  - `currentAmountUSD` = currentAmount (no conversion)  
  - `currentAmountKRW` = currentAmount × exchangeRate

### B. API Price Conversion (controller.js)
**File:** `/home/user/SPRC/js/controller.js` (Lines 542-553)

```javascript
// Get current currency and exchange rate for conversion
const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;  // ❌ BUG!
const currentCurrency = activePortfolio.currentCurrency || 'krw';  // ❌ BUG!

results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
        let price = result.value; // This is in USD from Finnhub API
        
        // Convert USD price to KRW if current currency is KRW
        if (currentCurrency === 'krw') {
            price = price * exchangeRate;  // USD × rate = KRW
        }
        
        this.state.updateStockProperty(result.id, 'currentPrice', price);
    }
});
```

**⚠️ CRITICAL BUG FOUND:**
- Line 543: `activePortfolio.exchangeRate` ← Should be `activePortfolio.settings.exchangeRate`
- Line 544: `activePortfolio.currentCurrency` ← Should be `activePortfolio.settings.currentCurrency`
- This will cause these variables to be `undefined`, falling back to defaults
- Price fetching will use DEFAULT_EXCHANGE_RATE instead of user's custom rate

### C. Currency Switching (controller.js)
**File:** `/home/user/SPRC/js/controller.js` (Lines 594-627)

```javascript
async handleCurrencyModeChange(newCurrency) {
    const activePortfolio = this.state.getActivePortfolio();
    const oldCurrency = activePortfolio.currentCurrency || 'krw';  // ❌ BUG!
    
    if (oldCurrency !== newCurrency) {
        const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;  // ❌ BUG!
        
        activePortfolio.portfolioData.forEach(stock => {
            if (stock.currentPrice && stock.currentPrice > 0) {
                let newPrice = stock.currentPrice;
                
                if (oldCurrency === 'usd' && newCurrency === 'krw') {
                    newPrice = stock.currentPrice * exchangeRate;  // USD → KRW
                } else if (oldCurrency === 'krw' && newCurrency === 'usd') {
                    newPrice = stock.currentPrice / exchangeRate;  // KRW → USD
                }
                
                this.state.updateStockProperty(stock.id, 'currentPrice', newPrice);
            }
        });
    }
}
```

**⚠️ BUGS FOUND:**
- Line 600: `activePortfolio.currentCurrency` ← Should be `activePortfolio.settings.currentCurrency`
- Line 604: `activePortfolio.exchangeRate` ← Should be `activePortfolio.settings.exchangeRate`
- These bugs prevent proper currency conversion when switching currencies

### D. Investment Amount Conversion (controller.js)
**File:** `/home/user/SPRC/js/controller.js` (Lines 892-925)

```javascript
getInvestmentAmountInKRW() {
    const { currentCurrency } = activePortfolio.settings;  // ✓ Correct
    const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);  // ✓ Correct
    
    if (currentCurrency === 'krw') {
        return amountKRW;  // Return KRW directly
    } else {
        return amountUSD.times(exchangeRate);  // USD × rate = KRW
    }
}
```
**Status:** ✓ CORRECT - properly accesses `activePortfolio.settings.currentCurrency`

---

## 3. DISCREPANCIES AND BUGS

### Bug #1: Price Fetching Uses Wrong Exchange Rate
**Location:** controller.js, lines 543-544
**Severity:** 🔴 CRITICAL

```javascript
// INCORRECT:
const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
const currentCurrency = activePortfolio.currentCurrency || 'krw';

// SHOULD BE:
const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';
```

**Impact:** 
- When fetching stock prices from API, the code ignores user's custom exchange rate
- Always falls back to DEFAULT_EXCHANGE_RATE (1300)
- If user set a different rate (e.g., 1250), price conversions will be incorrect

### Bug #2: Currency Switching Uses Wrong Exchange Rate  
**Location:** controller.js, lines 600, 604
**Severity:** 🔴 CRITICAL

```javascript
// INCORRECT:
const oldCurrency = activePortfolio.currentCurrency || 'krw';
const exchangeRate = activePortfolio.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;

// SHOULD BE:
const oldCurrency = activePortfolio.settings.currentCurrency || 'krw';
const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
```

**Impact:**
- When user switches from KRW to USD (or vice versa), price conversions fail
- Uses DEFAULT_EXCHANGE_RATE instead of user's custom rate
- Stock prices will be converted incorrectly, causing incorrect profit/loss display

### Bug #3: Recent Commit Message Mismatch
**Location:** Line numbers in recent fix don't match current code

Recent commit `9066ade` mentions fixing currency conversion but the fix in the code shows lines 543-544 should be corrected, which they haven't been fully addressed.

---

## 4. HOW EXCHANGE RATES AFFECT PROFIT/LOSS CALCULATIONS (수익률)

### A. Direct Impact on Profit/Loss Display
**File:** `/home/user/SPRC/js/calculator.js` (Lines 100-112)

```javascript
// Profit/Loss calculation (NOT affected by exchange rate)
result.profitLoss = result.currentAmount.minus(originalCostOfHolding);
result.profitLossRate = result.profitLoss.div(originalCostOfHolding).times(100);
```

**Finding:** ✓ **Profit/Loss calculations are INDEPENDENT of exchange rate**
- Profit/Loss is calculated in the stock's original currency
- profitLoss = currentAmount - (quantity × avgBuyPrice)
- profitLossRate = profitLoss / (quantity × avgBuyPrice) × 100

### B. Indirect Impact via Display Currency
**File:** `/home/user/SPRC/js/calculator.js` (Lines 159-166)

The exchange rate DOES affect which amounts are displayed:
```javascript
if (currentCurrency === 'krw') {
    // Display in KRW
    calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
    calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
} else {
    // Display in USD
    calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
    calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
}
```

**Finding:** Exchange rate only affects the DISPLAY amounts (currentAmountUSD vs currentAmountKRW)
- The actual profitLoss and profitLossRate percentages remain consistent
- However, if price fetching bugs exist, the currentAmount itself will be wrong, cascading to wrong profit/loss

### C. Critical Data Flow Issue
**Scenario:** User has stocks in USD, sets exchange rate to 1250, then fetches prices
1. API returns USD prices
2. Bug #1 causes code to use DEFAULT_EXCHANGE_RATE (1300) instead of 1250
3. Prices are converted using wrong rate
4. currentAmount becomes incorrect
5. profitLoss calculations cascade with wrong currentAmount
6. Profit/loss percentages display incorrectly

**Example:**
```
Stock: 100 shares at $100 USD = $10,000 USD
User's custom rate: 1250 KRW/USD

Correct conversion: 10,000 × 1250 = 12,500,000 KRW
Buggy conversion: 10,000 × 1300 = 13,000,000 KRW (using DEFAULT_EXCHANGE_RATE)

Difference: 500,000 KRW (4% error!)
```

---

## 5. CODE LOCATIONS SUMMARY

### Files Using Exchange Rate:
1. **constants.js** - DEFAULT_EXCHANGE_RATE definition
2. **state.js** - Storage and validation
3. **calculator.js** - Currency conversion logic (CORRECT)
4. **controller.js** - UI input, price fetching, currency switching (2 CRITICAL BUGS)
5. **validator.js** - Validation of exchange rate values
6. **view.js** - Display of exchange rate input field
7. **eventBinder.js** - Event listener setup for exchange rate input

### Test Coverage:
- `calculator.test.js` - Tests for stock metrics (no exchange rate tests)
- `controller.test.js` - Has exchangeRateInput mock
- `validator.test.js` - Tests data validation

---

## 6. RECOMMENDATIONS

### Immediate Fixes Needed:
1. **Fix Line 543-544 in controller.js**
   ```javascript
   const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
   const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';
   ```

2. **Fix Line 600, 604 in controller.js**
   ```javascript
   const oldCurrency = activePortfolio.settings.currentCurrency || 'krw';
   const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
   ```

3. **Add unit tests** for:
   - Exchange rate conversion with custom rates
   - Price fetching with different currencies
   - Currency switching with different rates

4. **Consider adding validation** to prevent exchange rate = 0

---

## 7. RECENT CHANGES

**Commit 9066ade** attempted to fix currency conversion errors by:
- Converting USD API prices to current currency
- Converting existing prices when switching currencies

However, the critical bugs in property access paths (missing `.settings`) were not fully addressed, meaning the fix will not work as intended.

